package main

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Listen          string
	ProxmoxURL      string
	ProxmoxToken    string // user@realm!tokenid=secret — use a PVEAuditor (read-only) token
	ProxmoxInsecure bool   // self-signed PVE certs
	PromURL         string
	PromTempQuery   string // must return one series per node, labelled `nodename`
	KumaURL         string
	KumaSlug        string // a public Uptime Kuma status page
	Aliases         map[string]string
	Timeout         time.Duration
}

const defaultTempQuery = `max by (nodename) (node_hwmon_temp_celsius * on (instance) group_left (nodename) node_uname_info)`

func getJSON(ctx context.Context, client *http.Client, u string, header http.Header, out any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return err
	}
	for k, v := range header {
		req.Header[k] = v
	}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("%s: %d", u, res.StatusCode)
	}
	return json.NewDecoder(http.MaxBytesReader(nil, res.Body, 4<<20)).Decode(out)
}

// ── Proxmox: nodes + running guests ─────────────────────────────────────

func fetchProxmox(ctx context.Context, cfg Config) (map[string]Node, error) {
	client := &http.Client{Transport: &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: cfg.ProxmoxInsecure}}}
	h := http.Header{"Authorization": {"PVEAPIToken=" + cfg.ProxmoxToken}}
	base := strings.TrimRight(cfg.ProxmoxURL, "/") + "/api2/json"

	var nodes struct {
		Data []struct {
			Node   string  `json:"node"`
			Status string  `json:"status"`
			CPU    float64 `json:"cpu"`
			Mem    float64 `json:"mem"`
			MaxMem float64 `json:"maxmem"`
			Uptime int64   `json:"uptime"`
		} `json:"data"`
	}
	if err := getJSON(ctx, client, base+"/nodes", h, &nodes); err != nil {
		return nil, err
	}
	out := map[string]Node{}
	for _, n := range nodes.Data {
		mem := 0.0
		if n.MaxMem > 0 {
			mem = n.Mem / n.MaxMem * 100
		}
		out[n.Node] = Node{Online: n.Status == "online", CPUPct: n.CPU * 100, MemPct: mem, UptimeS: n.Uptime}
	}

	var guests struct {
		Data []struct {
			Node   string `json:"node"`
			Status string `json:"status"`
		} `json:"data"`
	}
	if err := getJSON(ctx, client, base+"/cluster/resources?type=vm", h, &guests); err == nil {
		for _, g := range guests.Data {
			if n, ok := out[g.Node]; ok && g.Status == "running" {
				n.GuestsRunning++
				out[g.Node] = n
			}
		}
	}
	return out, nil
}

// ── Prometheus: per-node temperature ────────────────────────────────────

func fetchTemps(ctx context.Context, cfg Config) (map[string]float64, error) {
	q := cfg.PromTempQuery
	if q == "" {
		q = defaultTempQuery
	}
	var res struct {
		Data struct {
			Result []struct {
				Metric map[string]string `json:"metric"`
				Value  [2]any            `json:"value"`
			} `json:"result"`
		} `json:"data"`
	}
	u := strings.TrimRight(cfg.PromURL, "/") + "/api/v1/query?query=" + url.QueryEscape(q)
	if err := getJSON(ctx, http.DefaultClient, u, nil, &res); err != nil {
		return nil, err
	}
	out := map[string]float64{}
	for _, r := range res.Data.Result {
		s, _ := r.Value[1].(string)
		if v, err := strconv.ParseFloat(s, 64); err == nil && r.Metric["nodename"] != "" {
			out[r.Metric["nodename"]] = float64(int(v*10+0.5)) / 10
		}
	}
	return out, nil
}

// ── Uptime Kuma: public status page ─────────────────────────────────────

func fetchKuma(ctx context.Context, cfg Config) ([]Service, error) {
	base := strings.TrimRight(cfg.KumaURL, "/") + "/api/status-page/"
	slug := url.PathEscape(cfg.KumaSlug)

	var page struct {
		PublicGroupList []struct {
			MonitorList []struct {
				ID   int    `json:"id"`
				Name string `json:"name"`
			} `json:"monitorList"`
		} `json:"publicGroupList"`
	}
	if err := getJSON(ctx, http.DefaultClient, base+slug, nil, &page); err != nil {
		return nil, err
	}
	var beats struct {
		HeartbeatList map[string][]struct {
			Status int `json:"status"` // 1 = up
		} `json:"heartbeatList"`
		UptimeList map[string]float64 `json:"uptimeList"` // "<id>_24": 0..1
	}
	if err := getJSON(ctx, http.DefaultClient, base+"heartbeat/"+slug, nil, &beats); err != nil {
		return nil, err
	}

	var out []Service
	for _, g := range page.PublicGroupList {
		for _, m := range g.MonitorList {
			id := strconv.Itoa(m.ID)
			s := Service{Name: m.Name}
			if hb := beats.HeartbeatList[id]; len(hb) > 0 {
				s.Up = hb[len(hb)-1].Status == 1
			}
			if u, ok := beats.UptimeList[id+"_24"]; ok {
				v := u * 100
				s.Uptime24hPct = &v
			}
			out = append(out, s)
		}
	}
	return out, nil
}

// ── aggregate ───────────────────────────────────────────────────────────

func collect(ctx context.Context, cfg Config, now time.Time) Status {
	ctx, cancel := context.WithTimeout(ctx, cfg.Timeout)
	defer cancel()

	type pveRes struct {
		nodes map[string]Node
		err   error
	}
	type tempRes struct {
		temps map[string]float64
		err   error
	}
	type kumaRes struct {
		svcs []Service
		err  error
	}
	pveC, tempC, kumaC := make(chan pveRes, 1), make(chan tempRes, 1), make(chan kumaRes, 1)

	go func() {
		if cfg.ProxmoxURL == "" {
			pveC <- pveRes{}
			return
		}
		n, err := fetchProxmox(ctx, cfg)
		pveC <- pveRes{n, err}
	}()
	go func() {
		if cfg.PromURL == "" {
			tempC <- tempRes{}
			return
		}
		t, err := fetchTemps(ctx, cfg)
		tempC <- tempRes{t, err}
	}()
	go func() {
		if cfg.KumaURL == "" || cfg.KumaSlug == "" {
			kumaC <- kumaRes{}
			return
		}
		s, err := fetchKuma(ctx, cfg)
		kumaC <- kumaRes{s, err}
	}()

	pve, temps, kuma := <-pveC, <-tempC, <-kumaC
	state := func(configured bool, err error) string {
		switch {
		case !configured:
			return "off"
		case err != nil:
			return "error"
		}
		return "ok"
	}

	raw := pve.nodes
	if raw == nil {
		raw = map[string]Node{}
	}
	for name, t := range temps.temps {
		if n, ok := raw[name]; ok {
			v := t
			n.TempC = &v
			raw[name] = n
		}
	}

	return Status{
		GeneratedAt: now.UTC(),
		Nodes:       aliasNodes(raw, cfg.Aliases),
		Services:    cleanServices(kuma.svcs),
		Sources: map[string]string{
			"proxmox":    state(cfg.ProxmoxURL != "", pve.err),
			"prometheus": state(cfg.PromURL != "", temps.err),
			"kuma":       state(cfg.KumaURL != "" && cfg.KumaSlug != "", kuma.err),
		},
	}
}
