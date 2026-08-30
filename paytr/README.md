# paytr — PayTR hosted checkout for LOOK

PayTR **iFrame API** integration written in **pure LOOK** — no SDK, no dependency. It builds the
`get-token` request and its HMAC-SHA256 token exactly as PayTR's own Postman collection and
reference gateways do, hands you the hosted-payment iframe URL, and verifies the server-to-server
payment notification with a timing-safe compare.

PayTR's hosted page collects the card and moves the money; this package only **constructs and
verifies the requests around it** — it never handles card data and never executes a payment.

## Verified

The signing is verified **bit-exact against an independent HMAC-SHA256 oracle** (Python's `hmac`
+ `base64`, and `urllib` for URL-encoding), using the field order taken directly from PayTR's
official sources:

- **token** hash — PayTR Postman `get-iframe-token` pre-request script;
- **notification** hash — PayTR's WHMCS `callback/paytr.php`;
- URL-encoding of ASCII and UTF-8 (Turkish) values;
- `paytr_verify_callback` accepts the correct hash and rejects a wrong one.

> **Honest caveat:** it has **not** yet been run against a live PayTR merchant account — that
> needs real credentials and a real (test-mode) transaction, which only the merchant can do. The
> cryptography and request shape are proven; the live round-trip is the one untested link.

## Install

```bash
lk install github.com/codlook/look-packages/paytr
```

```lk
use "pkg/paytr"
```

## Use

```lk
use "pkg/paytr"

$cfg = ["merchant_id" => "…", "merchant_key" => "…", "merchant_salt" => "…"]

$res = paytr_token($cfg, [
    "merchant_oid"    => "ORD10001",
    "email"           => "musteri@example.com",
    "payment_amount"  => 1000,                 # kuruş → 10.00 TL
    "user_ip"         => request::ip(),
    "user_name"       => "Ada Yılmaz",
    "user_address"    => "İstanbul",
    "user_phone"      => "5551234567",
    "basket"          => [["Kahve", "10.00", 1]],
    "merchant_ok_url" => "https://siteniz.com/ok",
    "merchant_fail_url"=> "https://siteniz.com/fail",
    "test_mode"       => 1
])
# → embed $res["url"] in an <iframe>

# in your callback route (build $post from the POSTed fields):
$post = ["merchant_oid" => request::post("merchant_oid"), "status" => request::post("status"),
         "total_amount" => request::post("total_amount"), "hash" => request::post("hash")]
if (paytr_verify_callback($cfg, $post)) { /* trust status; answer "OK" */ }
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `paytr_token($cfg, $order)` | `{ok, token, url, reason}` | Calls `get-token`; on success `url` is the hosted-payment iframe URL. |
| `paytr_verify_callback($cfg, $post)` | `1` / `0` | Timing-safe check of the notification hash — the only proof a callback is really from PayTR. |
| `paytr_iframe_url($token)` | `string` | Hosted-payment URL for a token (`…/odeme/guvenli/<token>`). |
| `paytr_basket($items)` | `string` | base64-JSON basket from `[[name, price, qty], …]` (done for you inside `paytr_token`). |

`$order` fields: `merchant_oid`, `email`, `payment_amount` (**integer kuruş**), `user_ip`,
`user_name`, `user_address`, `user_phone`, `basket`, `merchant_ok_url`, `merchant_fail_url`;
optional `currency` (`"TL"`), `no_installment` (`0`), `max_installment` (`0`), `test_mode` (`0`),
`lang` (`"tr"`), `timeout_limit` (`30`), `debug_on` (`0`).

## Notes

- **Credentials stay on the server.** `merchant_key` is the HMAC secret; never ship it to the
  browser. `test_mode => 1` while integrating.
- **Trust only the verified callback.** The `merchant_ok_url` / `merchant_fail_url` redirect is a
  UX hint the user's browser can forge — mark an order paid **only** from a callback that passes
  `paytr_verify_callback`, and answer that request with exactly `"OK"` so PayTR stops retrying.
- **`payment_amount` is in kuruş** (an integer): `1000` = 10.00 TL.
- Pure LOOK: only the core `crypto::` (HMAC/base64/constant-compare), `http::`, `json::`,
  `string::` and `array::` builtins.
