# validate-tr — Turkish form validators for LOOK

The checks every Turkish sign-up or order form needs, written in **pure LOOK** — no service,
no dependency. TC Kimlik No, IBAN, mobile number and licence plate. Every check is
deterministic (checksum / mod-97 / format), so it runs locally and instantly.

Verified against a reference implementation across **267 cases** (constructed-valid and random
TC Kimlik numbers, TR/GB/DE IBANs, phone formats and plates) — every verdict matched.

## Install

```bash
lk install github.com/codlook/look-packages/validate-tr
```

```lk
use "pkg/validate-tr"
```

## Use

```lk
use "pkg/validate-tr"

if (!tckn_valid(request::post("tc")))   { response::json(["error" => "geçersiz TC"]); return }
if (!iban_valid(request::post("iban")))  { response::json(["error" => "geçersiz IBAN"]); return }

$gsm = gsm_normalize(request::post("telefon"))   # "" if invalid, else "5XXXXXXXXX"
if ($gsm == "") { response::json(["error" => "geçersiz telefon"]); return }
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `tckn_valid($tc)` | `1`/`0` | TC Kimlik No — 11 digits, first ≠ 0, official 10th/11th check digits. |
| `iban_valid($iban)` | `1`/`0` | IBAN — ISO 13616 mod-97 (spaces ignored, any country; TR is 26 chars). |
| `gsm_valid($num)` | `1`/`0` | Turkish mobile — accepts `+90…` / `0…` / bare, must be a 10-digit `5…`. |
| `gsm_normalize($num)` | `string` | Normalized `5XXXXXXXXX`, or `""` if invalid. |
| `plate_valid($p)` | `1`/`0` | Licence plate — province `01`–`81`, then 1–3 letters and 2–4 digits. |

## Notes

- `tckn_valid` checks the **format and checksum** — it cannot tell you whether the number
  belongs to a real, living person (that needs the NVI web service, a separate concern).
- `iban_valid` verifies the **mod-97 check**; it does not confirm the account exists.
- Pure LOOK: only the core `string::`, `array::` and `type::` builtins — nothing to install.
