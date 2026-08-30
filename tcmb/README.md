# tcmb — Turkish Central Bank exchange rates for LOOK

Daily foreign-exchange rates straight from the **TCMB** (Türkiye Cumhuriyet Merkez Bankası),
written in **pure LOOK** — no API key, no account, no dependency. It reads the bank's public,
keyless bulletin (`today.xml`) over HTTPS and parses its fixed schema in a single pass: every
currency with buying, selling and banknote rates, plus per-unit and conversion helpers.

The bulletin's schema is fixed and the source is authoritative, so the parse is deterministic.
It's **verified field-for-field against a reference XML parser** — all 22 currencies × 5 numeric
fields matched exactly, including edge cases like XDR (which carries no banknote fields) and JPY
(quoted per 100 units).

## Install

```bash
lk install github.com/codlook/look-packages/tcmb
```

```lk
use "pkg/tcmb"
```

## Use

```lk
use "pkg/tcmb"

# TRY selling price of one unit
$usd = tcmb_rate("USD")            # e.g. 48.1598

# convert between any two currencies (through TRY)
$eur = tcmb_convert(100, "USD", "EUR")

# every currency at once — one fetch, for an invoice or price list
$rates = tcmb_rates()
$sell  = $rates["EUR"]["selling"]
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `tcmb_rate($code)` | `float` | TRY **selling** price of 1 unit of `$code` (`-1` if unavailable). |
| `tcmb_buy($code)` | `float` | TRY **buying** price of 1 unit of `$code` (`-1` if unavailable). |
| `tcmb_convert($amount, $from, $to)` | `float` | `$amount` converted `$from` → `$to` through TRY (`-1` on error). |
| `tcmb_rates()` | `assoc` \| `null` | Every currency keyed by ISO code (see record below), or `null` on failure. |
| `tcmb_date()` | `string` | Bulletin date `"DD.MM.YYYY"`, or `""`. |
| `tcmb_refresh()` | `true` | Drop the cached bulletin so the next call re-fetches (see caching below). |

Each `tcmb_rates()` record:

| Key | Meaning |
|-----|---------|
| `unit` | How many units the rates are quoted per (usually `1`; JPY is `100`). |
| `name` | English currency name (e.g. `"US DOLLAR"`). |
| `buying` / `selling` | Forex buying / selling rate for `unit` units. |
| `banknote_buying` / `banknote_selling` | Cash rate for `unit` units (`0` when the bank quotes none). |

`tcmb_rate` / `tcmb_buy` already divide by `unit`, so they always give the price of **one** unit.
`"TRY"` (or `"TL"`) is accepted anywhere a code is, with a rate of `1`.

## Notes

- The bulletin is published **once per weekday** (~15:30). On weekends and holidays TCMB serves
  the last working day's rates — `tcmb_date()` tells you which day you actually got.
- **Caching is built in.** The download is cached for one hour (via the core `cache::`), so
  repeated `tcmb_rate` / `tcmb_convert` calls — and, under `lk-fcgi`, every request — share a
  single fetch instead of hitting TCMB each time. Call `tcmb_refresh()` to force a re-fetch (e.g.
  just after 15:30). For many lookups in one go you can still call `tcmb_rates()` **once** and
  index the result, saving even the repeated parse.
- These are the central bank's reference rates, not a trading venue's live quote — right for
  invoices, price lists and accounting, not for executing FX trades.
- Pure LOOK: it uses only the core `http::`, `string::` (regex), `array::` and `type::` builtins.
