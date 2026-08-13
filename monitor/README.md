# monitor — LOOK runtime observability

Formats `runtime::stats()` into **Prometheus** and **JSON**. The counters themselves live in the LOOK
core (`runtime::stats()`); this package only formats them — no new measurement, no hot-path cost.

```bash
lk install github.com/codlook/look-packages/monitor
```

## Usage

The package registers **no routes on its own** — importing it never exposes an endpoint. You wire the
routes explicitly, so `/metrics` can never leak by accident (safe-by-default).

```lk
use "monitor/monitor.lk"

# Machine endpoints — register them yourself:
route("GET", "/metrics",      function() { response::text(monitor_prometheus()) })
route("GET", "/monitor.json", function() { response::json(monitor_json()) })
```

Or use the optional mount helper (groups both under a prefix, with optional auth middleware):

```lk
$adminOnly = function() { /* check header/session; response::error(403) + stop() if not admin */ }

monitor_mount("/monitor", [$adminOnly])   # → /monitor/metrics + /monitor/monitor.json, behind auth
monitor_mount("/metrics", [])             # → /metrics with no auth (internal network only)
```

## What you get

`monitor_prometheus()` returns text-exposition format with **correct metric types** — counters vs
gauges — so Grafana `rate()` works:

```
# HELP look_requests_total Total HTTP requests handled by this process.
# TYPE look_requests_total counter
look_requests_total 1420
# TYPE look_db_pool_busy gauge
look_db_pool_busy 3
```

| Metric | Type | Meaning |
|--------|------|---------|
| `look_requests_total` | counter | HTTP requests handled |
| `look_errors_5xx_total` | counter | 5xx responses served |
| `look_vm_disabled_routes_total` | counter | routes that fell back VM→interpreter (**>0 = a VM bug**) |
| `look_uptime_seconds` | gauge | process uptime |
| `look_working_mb` / `look_private_mb` | gauge | RSS / private-resident memory |
| `look_latency_last_microseconds` / `look_latency_avg_microseconds` | gauge | dispatch time |
| `look_db_pool_size` / `look_db_pool_busy` | gauge | DB pool total / in-use |

`monitor_json()` returns the full `runtime::stats()` assoc, for curl / uptime checks / your own dashboard.

## Note — package import runs your app on the interpreter

Importing any file with `use "path"` makes the whole program run on the tree-walk interpreter (the
bytecode VM does not compile file imports). For a monitoring endpoint that is fine. If your app must
stay on the VM for speed, **don't import the package** — the two functions are small; copy
`monitor_prometheus()` / `monitor_json()` inline into your app, which keeps the VM active.

No dashboard/UI is included by design — the Prometheus endpoint gives you Grafana for free, and LOOK
doesn't ship a UI layer. (Contact-gated: if a real need for a built-in dashboard appears, it can be added.)
