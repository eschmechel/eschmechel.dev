// homelab-exporter publishes a sanitised health snapshot of the lab for eschmechel.dev's ~/ panel.
//
// It aggregates Proxmox (nodes, running guests), Prometheus (temperatures) and an Uptime Kuma
// status page into one small JSON document at GET /status. Bind it to localhost and expose it only
// through a Cloudflare Tunnel guarded by an Access service token (see README.md).
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

func configFromEnv() Config {
	timeout := 3 * time.Second
	if d, err := time.ParseDuration(os.Getenv("TIMEOUT")); err == nil {
		timeout = d
	}
	return Config{
		Listen:          envOr("LISTEN", "127.0.0.1:9477"),
		ProxmoxURL:      os.Getenv("PROXMOX_URL"),
		ProxmoxToken:    os.Getenv("PROXMOX_TOKEN"),
		ProxmoxInsecure: os.Getenv("PROXMOX_INSECURE_TLS") == "1",
		PromURL:         os.Getenv("PROM_URL"),
		PromTempQuery:   os.Getenv("PROM_TEMP_QUERY"),
		KumaURL:         os.Getenv("KUMA_URL"),
		KumaSlug:        os.Getenv("KUMA_SLUG"),
		Aliases:         parseAliases(os.Getenv("ALIASES")),
		Timeout:         timeout,
	}
}

func envOr(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

// parseAliases reads "pve1=atlas,pve2=hermes" (real node name → public name).
func parseAliases(s string) map[string]string {
	out := map[string]string{}
	for _, pair := range strings.Split(s, ",") {
		if k, v, ok := strings.Cut(strings.TrimSpace(pair), "="); ok {
			out[strings.TrimSpace(k)] = strings.TrimSpace(v)
		}
	}
	return out
}

// handler serves /status with a short in-process cache so bursts don't hammer the upstreams.
func handler(cfg Config, now func() time.Time) http.Handler {
	var (
		mu     sync.Mutex
		cached []byte
		at     time.Time
	)
	mux := http.NewServeMux()
	mux.HandleFunc("GET /status", func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		defer mu.Unlock()
		if cached == nil || now().Sub(at) > 15*time.Second {
			body, err := json.Marshal(collect(r.Context(), cfg, now()))
			if err != nil {
				http.Error(w, "encode", http.StatusInternalServerError)
				return
			}
			cached, at = body, now()
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-store")
		_, _ = w.Write(cached)
	})
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte("ok")) })
	return mux
}

func main() {
	cfg := configFromEnv()
	srv := &http.Server{
		Addr:              cfg.Listen,
		Handler:           handler(cfg, time.Now),
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      cfg.Timeout + 5*time.Second,
	}
	log.Printf("homelab-exporter on http://%s/status (proxmox=%t prometheus=%t kuma=%t)",
		cfg.Listen, cfg.ProxmoxURL != "", cfg.PromURL != "", cfg.KumaURL != "")
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
