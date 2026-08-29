# netgsm — Netgsm SMS for LOOK

The full Netgsm SMS surface, built purely on the core `http::`, `json::`, `crypto::` and
`string::` builtins: HTTP Basic-authenticated JSON calls to the Netgsm REST v2 API, with
each response normalized to a small assoc you can branch on. Turkish characters ride inside
the JSON body (UTF-8), so there is no URL-encoding pitfall. Endpoints, auth and body shapes
are matched against Netgsm's official SDK.

> **Status:** built from Netgsm's official SDK — endpoints, auth and body shapes are matched
> against it and exercised against a mock. **Not yet exercised against a live account.** One
> real send (Netgsm offers a free trial) closes that gap.

## Install

```bash
lk install github.com/codlook/look-packages/netgsm
```

```lk
use "pkg/netgsm"
```

## Use

```lk
use "pkg/netgsm"

$sms = netgsm_config(
    env("NETGSM_USERCODE"),
    env("NETGSM_PASSWORD"),
    env("NETGSM_HEADER")        # your approved sender name (msgheader)
)

# remaining credit
$bal = netgsm_balance($sms)
print("credit: " . $bal["credit"])

# your approved sender names
$hdr = netgsm_headers($sms)

# send one, and branch on the result
$r = netgsm_send($sms, "5301112233", "Siparişiniz kargoya verildi.")
if ($r["ok"]) { print("jobid=" . $r["jobid"]) } else { print($r["code"] . " " . $r["message"]) }

# one message to many numbers, one API call
$b = netgsm_send_many($sms, ["5301112233", "5324445566"], "Kampanya başladı!")
```

A full runnable [`example.lk`](example.lk) ships with the package — credit check, header
list, send, bulk, and (commented) report/schedule/cancel/inbox. Run it with your creds:

```bash
NETGSM_USERCODE=12345 NETGSM_PASSWORD=secret NETGSM_HEADER=ACME lk example.lk
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `netgsm_config($usercode, $password, $header)` | `assoc` | Build a config passed to every call. |
| `netgsm_send($config, $no, $message)` | result | Send one message to one number. |
| `netgsm_send_many($config, $no_list, $message)` | result | Send one message to an array of numbers, in one request. |
| `netgsm_send_scheduled($config, $no_list, $message, $when)` | result | Schedule a send; `$when` is `"ddMMyyyyHHmm"`. |
| `netgsm_cancel($config, $jobid)` | result | Cancel a scheduled batch by its jobid. |
| `netgsm_headers($config)` | data | List your approved sender names (msgheaders). |
| `netgsm_balance($config)` | credit | Remaining SMS credit (kalan kontör). |
| `netgsm_report($config, $start, $stop)` | data | Delivery report; dates `"dd.MM.yyyy HH:mm:ss"`. |
| `netgsm_inbox($config, $start, $stop)` | data | Incoming messages; dates `"ddMMyyyyHHmmss"`. |

**Result shapes** (every call returns `ok` / `code` / `message` / `status` / `error` / `raw`, plus one of):

| Shape | Extra key | Used by |
|-------|-----------|---------|
| result | `jobid` | send, send_many, send_scheduled, cancel |
| data | `data` (decoded JSON, Netgsm's own shape) | headers, report, inbox |
| credit | `credit` (e.g. `"123.45"`) | balance |

`ok` is `true` only when Netgsm accepted the call (code `00`/`01`/`02`, or the plain-text
`00` for balance).

## Notes

- The API base is the `NETGSM_API_BASE` env var (default `https://api.netgsm.com.tr`), so
  you can point it at a mock or staging gateway in tests.
- `$header` (msgheader) must be a sender name already approved on your Netgsm account —
  sending with an unapproved header returns code `40`. Call `netgsm_headers` to see them.
- `encoding` is sent as `TR` so Turkish characters count and render correctly.
- Sending, cancel, report, headers and inbox use the Netgsm **REST v2** JSON endpoints with
  HTTP Basic auth (matching Netgsm's official SDK). `netgsm_balance` uses the classic
  `/balance/list/get` endpoint, which answers plain text `"00 123.45"`.
- Response codes are surfaced as `code`; the `message` mapping is best-effort and `raw`
  always carries the exact body. A live send still needs your Netgsm account and approved
  header — try it once against your account before going to production.
