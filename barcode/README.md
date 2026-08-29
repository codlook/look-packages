# barcode — Code 128 barcodes for LOOK

A Code 128 barcode generator written in **pure LOOK** — no native code, no external service.
It encodes any printable-ASCII text (SKUs, order ids, short URLs) and is compact: it packs
runs of digits two-to-a-symbol (code set C) and switches to code set B for letters and
punctuation — the same size-optimising strategy real barcode libraries use. Output is a
self-contained SVG.

Ported from [python-barcode](https://github.com/WhyNotHugo/python-barcode) and **verified
module-for-module against it** — the module pattern is bit-for-bit identical across mixed
text, pure-digit, and switching inputs. A pattern that matches the reference exactly scans.

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
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `barcode($text)` | `string` | SVG with sensible defaults — the one-liner for the common case. |
| `barcode_svg($text, $opts)` | `string` | A complete `<svg>`, dark bars on a light quiet zone. |
| `barcode_pattern($text)` | `string` | The raw module string (`1` = bar, `0` = space), incl. start/checksum/stop. |

`$opts` for `barcode_svg` (assoc, all optional):

| Key | Default | Meaning |
|-----|---------|---------|
| `height` | `80` | Barcode height in pixels. |
| `width` | natural | Displayed width in pixels — the SVG scales to fit (stays crisp, it's vector). |
| `scale` | `2` | Width of one module (the narrowest bar) in pixels, when `width` isn't given. |
| `quiet` | `10` | Quiet-zone width in modules each side (10 is the Code 128 minimum). |
| `dark` | `"#000"` | Bar color. |
| `light` | `"#fff"` | Background / quiet-zone color. |

## Notes

- Code 128 covers **printable ASCII** (bytes 32–126). Non-ASCII — Turkish letters, emoji —
  has no Code 128 representation; use the `qr` package for arbitrary UTF-8.
- Pure LOOK: it leans only on the core `array::`, `crypto::` (for the byte bridge) and
  `string::` builtins — nothing to install natively.
- Verified with a bit-exact diff against the reference encoder. This is local, deterministic
  verification — there is no live-service gap.
