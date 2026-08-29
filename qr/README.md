# qr — QR Code generator for LOOK

A QR Code generator written in **pure LOOK** — no native code, no external service, no
network. It encodes any UTF-8 text or URL in byte mode, chooses the smallest fitting
version, computes Reed-Solomon error correction over GF(2⁸), lays out every function
pattern, picks the mask by the spec penalty rules, and renders a self-contained SVG.

Ported from [Project Nayuki's QR Code generator](https://www.nayuki.io/page/qr-code-generator-library)
(MIT) and **verified module-for-module against it** — every output matrix is bit-for-bit
identical to the reference across versions 1–11, all four ECC levels, and UTF-8 input. A
matrix that matches the reference exactly is a scannable QR Code.

## Install

```bash
lk install github.com/codlook/look-packages/qr
```

```lk
use "pkg/qr"
```

## Use

```lk
use "pkg/qr"

# the easy way — text or URL in, SVG out
$svg = qr("https://qrmenu.codlook.com/menu/42")

# with control — ECC level and styling
$svg = qr_svg("https://qrmenu.codlook.com/menu/42", "H", ["scale" => 12, "dark" => "#1a1a2e"])

# or the raw matrix, to render it your own way
$m = qr_matrix("Menü: döner köfte", "M")
# $m["size"] × $m["size"] grid of 0/1 in $m["modules"], plus $m["version"], $m["mask"]
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `qr($text)` | `string` | SVG with sensible defaults — the one-liner for the common case. |
| `qr_svg($text, $ecc, $opts)` | `string` | A complete `<svg>` element, dark modules on a light quiet zone. |
| `qr_matrix($text, $ecc)` | `assoc` | `["size" => n, "version" => v, "mask" => m, "modules" => n×n array of 0/1]`. |

`$ecc` is `"L"` · `"M"` · `"Q"` · `"H"` (roughly 7 / 15 / 25 / 30% recovery), default `"M"`.

`$opts` for `qr_svg` (assoc, all optional):

| Key | Default | Meaning |
|-----|---------|---------|
| `width` / `height` | natural | Displayed pixel size — the SVG scales to fit (stays crisp, it's vector). |
| `scale` | `8` | Pixel size of one module, when `width`/`height` aren't given. |
| `border` | `4` | Quiet-zone width in modules (4 is the spec minimum). |
| `dark` | `"#000"` | Dark-module color. |
| `light` | `"#fff"` | Background / quiet-zone color. |

## Notes

- **Byte mode only.** Every input is encoded as UTF-8 bytes, so any text — Turkish
  included — is handled correctly. (Numeric/alphanumeric modes would pack digits or
  uppercase URLs a little tighter, but byte mode is always correct.)
- Higher ECC or longer text picks a larger version automatically (up to version 40).
- Pure LOOK: it leans only on the core `array::`, `crypto::` (for the UTF-8 byte bridge),
  `math::` and `string::` builtins — no image library and nothing to install natively.
- Verified with a bit-exact diff against the reference generator; see the package's own
  test notes. This is local, deterministic verification — there is no live-service gap.
