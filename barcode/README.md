# barcode — Code 128 and EAN-13 barcodes for LOOK

Barcode generators written in **pure LOOK** — no native code, no external service:

- **Code 128** — any printable-ASCII text (SKUs, order ids, short URLs). Compact: it packs
  runs of digits two-to-a-symbol (code set C) and switches to code set B for letters and
  punctuation — the same size-optimising strategy real barcode libraries use.
- **EAN-13** — the 13-digit retail product barcode (GTIN-13). Give it 12 digits and it appends
  the mod-10 check digit; the first digit rides the left group's parity pattern, and the SVG
  carries the classic human-readable number with extended guard bars.

Output is a self-contained SVG. Both encoders are ported from
[python-barcode](https://github.com/WhyNotHugo/python-barcode) and **verified module-for-module
against it** — the module pattern is bit-for-bit identical (Code 128: mixed / pure-digit /
switching inputs; EAN-13: 12 cases, 95-module pattern and check digit). A pattern that matches
the reference exactly scans.

## Install

```bash
lk install github.com/codlook/look-packages/barcode
```

```lk
use "pkg/barcode"
```

## Use

```lk
use "pkg/barcode"

# the easy way — text or code in, SVG out
$svg = barcode("LOOK-8691234")

# with control — bar unit width, height, colors
$svg = barcode_svg("8691234567890", ["scale" => 3, "height" => 100])

# or the raw module string, to render it your own way
$pat = barcode_pattern("42")   # "1" = bar, "0" = space

# EAN-13 retail product code — pass 12 digits, the check digit is appended
$svg  = ean13("400638133393")               # renders 4006381333931 with the number below
$code = ean13_normalize("400638133393")     # "4006381333931"
$chk  = ean13_checkdigit("400638133393")    # 1
```

## API

### Code 128

| Function | Returns | Description |
|----------|---------|-------------|
| `barcode($text)` | `string` | SVG with sensible defaults — the one-liner for the common case. |
| `barcode_svg($text, $opts)` | `string` | A complete `<svg>`, dark bars on a light quiet zone. |
| `barcode_pattern($text)` | `string` | The raw module string (`1` = bar, `0` = space), incl. start/checksum/stop. |

### EAN-13

| Function | Returns | Description |
|----------|---------|-------------|
| `ean13($digits)` | `string` | SVG with the human-readable number below — the one-liner. |
| `ean13_svg($digits, $opts)` | `string` | Classic EAN-13 SVG; add `"text" => 0` for bars only. |
| `ean13_pattern($digits)` | `string` | The raw 95-module string (`1` = bar, `0` = space). |
| `ean13_normalize($digits)` | `string` | The full 13-digit code with a correct check digit, `""` if not 12/13 digits. |
| `ean13_checkdigit($digits)` | `int` | The mod-10 check digit for the first 12 digits. |

`ean13_*` accept 12 or 13 digits (any non-digit characters are ignored); the check digit is
always (re)computed, so a wrong 13th digit is corrected rather than trusted.

`$opts` for `barcode_svg` (assoc, all optional):

| Key | Default | Meaning |
|-----|---------|---------|
| `height` | `80` | Barcode height in pixels. |
| `width` | natural | Displayed width in pixels — the SVG scales to fit (stays crisp, it's vector). |
| `scale` | `2` | Width of one module (the narrowest bar) in pixels, when `width` isn't given. |
| `quiet` | `10` | Quiet-zone width in modules each side (10 is the Code 128 minimum). |
| `dark` | `"#000"` | Bar color. |
| `light` | `"#fff"` | Background / quiet-zone color. |

`ean13_svg` takes the same `$opts` keys (its `quiet` defaults to `11`, the EAN standard),
plus `"text"` (`1` = draw the human-readable number, `0` = bars only).

## Notes

- Code 128 covers **printable ASCII** (bytes 32–126). Non-ASCII — Turkish letters, emoji —
  has no Code 128 representation; use the `qr` package for arbitrary UTF-8.
- EAN-13 encodes **digits only**. It's the GTIN-13 used on retail packaging; UPC-A is the
  12-digit subset (prefix a `0` to render a UPC-A code as EAN-13).
- Pure LOOK: it leans only on the core `array::`, `crypto::` (for the byte bridge) and
  `string::` builtins — nothing to install natively.
- Verified with a bit-exact diff against the reference encoder. This is local, deterministic
  verification — there is no live-service gap.
