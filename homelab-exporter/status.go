package main

import (
	"fmt"
	"math"
	"regexp"
	"sort"
	"strings"
	"time"
)

// Status is the only thing that ever leaves the lab (D28): coarse health numbers under public
// aliases. No hostnames, IPs, versions or error strings.
type Status struct {
	GeneratedAt time.Time         `json:"generatedAt"`
	Nodes       []Node            `json:"nodes"`
	Services    []Service         `json:"services"`
	Sources     map[string]string `json:"sources"` // "ok" | "error" | "off" per upstream
}

type Node struct {
	Name          string   `json:"name"`
	Online        bool     `json:"online"`
	CPUPct        float64  `json:"cpuPct"`
	MemPct        float64  `json:"memPct"`
	TempC         *float64 `json:"tempC"`
	UptimeS       int64    `json:"uptimeS"`
	GuestsRunning int      `json:"guestsRunning"`
}

type Service struct {
	Name         string   `json:"name"`
	Up           bool     `json:"up"`
	Uptime24hPct *float64 `json:"uptime24hPct"`
}

const (
	maxNodes    = 12
	maxServices = 24
)

var (
	ipv4     = regexp.MustCompile(`\b\d{1,3}(\.\d{1,3}){3}\b`)
	ipv6ish  = regexp.MustCompile(`[0-9a-fA-F]{1,4}(:[0-9a-fA-F]{0,4}){2,}`)
	urlish   = regexp.MustCompile(`(?i)[a-z][a-z0-9+.-]*://|\.(lan|local|home|internal|corp|ts\.net|arpa)\b|\b[a-z0-9-]+\.[a-z0-9-]+\.[a-z]{2,}\b`)
	safeName = regexp.MustCompile(`[^\p{L}\p{N} ._+-]`)
)

// publicName returns a display-safe name, or "" if the input looks like an address.
func publicName(s string, max int) string {
	s = strings.TrimSpace(s)
	if s == "" || ipv4.MatchString(s) || ipv6ish.MatchString(s) || urlish.MatchString(s) {
		return ""
	}
	s = safeName.ReplaceAllString(s, "")
	if len([]rune(s)) > max {
		s = string([]rune(s)[:max])
	}
	return strings.TrimSpace(s)
}

func pct(v float64) float64 {
	if math.IsNaN(v) || v < 0 {
		return 0
	}
	if v > 100 {
		v = 100
	}
	return math.Round(v*10) / 10
}

// aliasNodes renames nodes via the alias map; anything unmapped becomes node-1, node-2, …
// so real hostnames never leave the lab.
func aliasNodes(raw map[string]Node, aliases map[string]string) []Node {
	names := make([]string, 0, len(raw))
	for n := range raw {
		names = append(names, n)
	}
	sort.Strings(names)
	out := make([]Node, 0, len(names))
	anon := 0
	for _, real := range names {
		n := raw[real]
		if a := publicName(aliases[real], 24); a != "" {
			n.Name = a
		} else {
			anon++
			n.Name = fmt.Sprintf("node-%d", anon)
		}
		n.CPUPct, n.MemPct = pct(n.CPUPct), pct(n.MemPct)
		out = append(out, n)
		if len(out) == maxNodes {
			break
		}
	}
	return out
}

func cleanServices(raw []Service) []Service {
	out := make([]Service, 0, len(raw))
	anon := 0
	for _, s := range raw {
		if s.Name = publicName(s.Name, 40); s.Name == "" {
			anon++
			s.Name = fmt.Sprintf("service-%d", anon)
		}
		if s.Uptime24hPct != nil {
			v := pct(*s.Uptime24hPct)
			s.Uptime24hPct = &v
		}
		out = append(out, s)
		if len(out) == maxServices {
			break
		}
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out
}
