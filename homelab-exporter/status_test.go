package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

// fakeLab serves Proxmox, Prometheus and Uptime Kuma responses that deliberately contain
// hostnames, IPs and URLs — none of which may reach the output.
func fakeLab(t *testing.T) (pve, prom, kuma *httptest.Server) {
	t.Helper()
	pve = httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "PVEAPIToken=audit@pve!site=s3cret" {
			http.Error(w, "no", http.StatusUnauthorized)
			return
		}
		switch r.URL.Path {
		case "/api2/json/nodes":
			_, _ = w.Write([]byte(`{"data":[
				{"node":"pve1","status":"online","cpu":0.123,"mem":4e9,"maxmem":16e9,"uptime":360000},
				{"node":"secret-box.lan","status":"offline","cpu":0,"mem":0,"maxmem":0,"uptime":0}]}`))
		case "/api2/json/cluster/resources":
			_, _ = w.Write([]byte(`{"data":[
				{"node":"pve1","status":"running"},{"node":"pve1","status":"running"},{"node":"pve1","status":"stopped"}]}`))
		default:
			http.NotFound(w, r)
		}
	}))
	prom = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{"status":"success","data":{"resultType":"vector","result":[
			{"metric":{"nodename":"pve1"},"value":[1,"47.26"]}]}}`))
	}))
	kuma = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/api/status-page/public":
			_, _ = w.Write([]byte(`{"publicGroupList":[{"monitorList":[
				{"id":1,"name":"Jellyfin"},{"id":2,"name":"192.168.1.20"},{"id":3,"name":"https://git.home.lan"}]}]}`))
		case "/api/status-page/heartbeat/public":
			_, _ = w.Write([]byte(`{"heartbeatList":{"1":[{"status":0},{"status":1}],"2":[{"status":0}],"3":[]},
				"uptimeList":{"1_24":0.9987,"2_24":0.5}}`))
		default:
			http.NotFound(w, r)
		}
	}))
	t.Cleanup(func() { pve.Close(); prom.Close(); kuma.Close() })
	return
}

func labConfig(pve, prom, kuma *httptest.Server) Config {
	return Config{
		ProxmoxURL: pve.URL, ProxmoxToken: "audit@pve!site=s3cret", ProxmoxInsecure: true,
		PromURL: prom.URL, KumaURL: kuma.URL, KumaSlug: "public",
		Aliases: map[string]string{"pve1": "atlas"},
		Timeout: 2 * time.Second,
	}
}

var now = time.Date(2026, 10, 6, 18, 0, 0, 0, time.UTC)

func TestCollectAggregatesAllSources(t *testing.T) {
	pve, prom, kuma := fakeLab(t)
	s := collect(context.Background(), labConfig(pve, prom, kuma), now)

	if s.Sources["proxmox"] != "ok" || s.Sources["prometheus"] != "ok" || s.Sources["kuma"] != "ok" {
		t.Fatalf("sources: %v", s.Sources)
	}
	if len(s.Nodes) != 2 {
		t.Fatalf("nodes: %+v", s.Nodes)
	}
	atlas := s.Nodes[0]
	if atlas.Name != "atlas" || !atlas.Online || atlas.CPUPct != 12.3 || atlas.MemPct != 25 || atlas.GuestsRunning != 2 || atlas.UptimeS != 360000 {
		t.Errorf("atlas: %+v", atlas)
	}
	if atlas.TempC == nil || *atlas.TempC != 47.3 {
		t.Errorf("temp: %v", atlas.TempC)
	}
	if s.Nodes[1].Name != "node-1" || s.Nodes[1].Online {
		t.Errorf("unaliased node should be anonymised: %+v", s.Nodes[1])
	}
	if len(s.Services) != 3 {
		t.Fatalf("services: %+v", s.Services)
	}
	var jelly *Service
	for i := range s.Services {
		if s.Services[i].Name == "Jellyfin" {
			jelly = &s.Services[i]
		}
	}
	if jelly == nil || !jelly.Up || jelly.Uptime24hPct == nil || *jelly.Uptime24hPct != 99.9 {
		t.Errorf("jellyfin: %+v", jelly)
	}
}

func TestOutputNeverLeaksAddresses(t *testing.T) {
	pve, prom, kuma := fakeLab(t)
	body, _ := json.Marshal(collect(context.Background(), labConfig(pve, prom, kuma), now))
	out := string(body)
	for _, leak := range []string{"pve1", "secret-box", ".lan", "192.168", "https://", "127.0.0.1", "s3cret", "audit@pve"} {
		if strings.Contains(out, leak) {
			t.Errorf("output leaks %q: %s", leak, out)
		}
	}
}

func TestPublicName(t *testing.T) {
	cases := map[string]string{
		"Jellyfin":                "Jellyfin",
		"  Home Assistant ":       "Home Assistant",
		"10.0.0.5":                "",
		"fe80::1ff:fe23:4567":     "",
		"http://nas":              "",
		"nas.local":               "",
		"grafana.lab.example.com": "",
		"<script>x</script>":      "scriptxscript",
	}
	for in, want := range cases {
		if got := publicName(in, 40); got != want {
			t.Errorf("publicName(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestFailingSourceIsReportedNotFatal(t *testing.T) {
	pve, prom, kuma := fakeLab(t)
	cfg := labConfig(pve, prom, kuma)
	cfg.ProxmoxToken = "wrong"
	cfg.KumaURL = ""
	s := collect(context.Background(), cfg, now)
	if s.Sources["proxmox"] != "error" || s.Sources["kuma"] != "off" || s.Sources["prometheus"] != "ok" {
		t.Fatalf("sources: %v", s.Sources)
	}
	if len(s.Nodes) != 0 || len(s.Services) != 0 {
		t.Fatalf("expected empty lists, got %+v", s)
	}
	body, _ := json.Marshal(s)
	if strings.Contains(string(body), "401") || strings.Contains(string(body), "http") {
		t.Errorf("error details leaked: %s", body)
	}
}

func TestHandlerServesAndCaches(t *testing.T) {
	calls := 0
	prom := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		_, _ = w.Write([]byte(`{"data":{"result":[]}}`))
	}))
	defer prom.Close()
	clock := now
	h := handler(Config{PromURL: prom.URL, Timeout: time.Second}, func() time.Time { return clock })

	get := func() *httptest.ResponseRecorder {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/status", nil))
		return rec
	}
	if rec := get(); rec.Code != 200 || rec.Header().Get("Content-Type") != "application/json" {
		t.Fatalf("status %d %v", rec.Code, rec.Header())
	}
	get()
	if calls != 1 {
		t.Errorf("expected cached second response, upstream called %d times", calls)
	}
	clock = clock.Add(20 * time.Second)
	get()
	if calls != 2 {
		t.Errorf("expected refresh after 15s, upstream called %d times", calls)
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/status", nil))
	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("POST should be rejected, got %d", rec.Code)
	}
}

func TestParseAliases(t *testing.T) {
	got := parseAliases(" pve1=atlas, pve2 = hermes ,junk")
	if got["pve1"] != "atlas" || got["pve2"] != "hermes" || len(got) != 2 {
		t.Errorf("%v", got)
	}
}
