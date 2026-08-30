# pdf — PDF documents for LOOK

A PDF generator written in **pure LOOK** — no native code, no external service. It has two
layers: a high-level **document builder** (multi-page flow with automatic word-wrap, page
breaks, alignment, colors and tables) and low-level positioned ops (text, lines, rectangles)
that pair with the `qr` and `barcode` packages.

Layout uses the **real Helvetica font metrics**, so wrapping and alignment are accurate.
Turkish letters are mapped via a *Differences* encoding and octal escapes, so the file stays
pure ASCII — no font embedding, no binary output — and the text **extracts** correctly. Verified
against `pypdf`.

> **Turkish caveat:** `ç ö ü Ç Ö Ü` (WinAnsi Latin-1) render everywhere. The Turkish-specific
> letters `İ ş ğ ı Ş Ğ` are encoded correctly (they extract as the right characters) but rely on
> the built-in Helvetica having those glyphs, which is **unreliable across PDF viewers** — some
> render them blank. If a receipt must show those letters faithfully in any viewer, embedding a
> Turkish font is the real fix (planned); until then, prefer `ç/ö/ü` or verify in your target viewer.

## Install

```bash
lk install github.com/codlook/look-packages/pdf
```

```lk
use "pkg/pdf"
```

## Use — the document builder

```lk
use "pkg/pdf"

$d = doc_new(null)                                  # A4, 50pt margins
$d = doc_heading($d, "FATURA — Codlook Restoran")
$d = doc_text($d, "Müşteri: Ahmet Yılmaz", ["color" => "#666666", "size" => 10])
$d = doc_hr($d)

$d = doc_table($d, [
    ["Ürün", "Adet", "Tutar"],
    ["Adana Döner", "2", "240,00"],
    ["Künefe", "1", "85,50"]
], ["header" => 1, "cols" => [300, 90, 105], "aligns" => ["left", "center", "right"]])

$d = doc_text($d, "GENEL TOPLAM: 325,50 TL", ["align" => "right", "bold" => 1, "color" => "#0a7d3c"])
file::put("fatura.pdf", doc_render($d))
```

Long text wraps automatically and flows onto new pages; alignment, color and tables just work.

## Document API

| Function | Description |
|----------|-------------|
| `doc_new($opts)` | Start a document. `$opts`: `width` / `height` (default A4 595×842), `margin` (50). |
| `doc_heading($d, $text)` | A big bold line. |
| `doc_text($d, $text, $opts)` | A paragraph (auto-wrapped). `$opts`: `size`, `bold`(1), `align` (`left`/`center`/`right`), `color` (`#rrggbb`), `gap`. |
| `doc_table($d, $rows, $opts)` | A bordered table. `$opts`: `header`(1 = bold first row), `cols` (widths in pt), `aligns` (per column), `size`. |
| `doc_hr($d)` | A horizontal rule. |
| `doc_spacer($d, $h)` | Vertical space of `$h` points. |
| `doc_draw($d, $ops, $h)` | Drop raw content ops at the cursor, then advance by `$h`. |
| `doc_page($d)` | Force a page break. |
| `doc_render($d)` | Finish and return the multi-page PDF string. |

## Low-level ops (absolute placement)

`pdf($text)` (one-liner) · `pdf_render($content, $opts)` / `pdf_render_pages($pages, $opts)` ·
`pdf_text` / `pdf_bold($x,$y,$size,$text)` · `pdf_line` · `pdf_rect` / `pdf_fill` ·
`pdf_matrix($x,$y,$module,$grid)` (a QR grid from `qr_matrix`) ·
`pdf_bars($x,$y,$unit,$height,$pattern)` (a barcode string from `barcode_pattern`) ·
`pdf_textwidth($text,$size,$bold)` (measure a string). Coordinates here are PDF-native:
origin bottom-left, y grows up.

## Notes

- Text uses the standard Helvetica fonts (no embedding). Turkish is encoded (see the caveat
  above — `ç/ö/ü` render everywhere; `İ/ş/ğ/ı` are viewer-dependent); other non-ASCII characters
  become `?`, and em/en dashes become `-`. (Full Unicode via embedded fonts is a planned phase.)
- Pure LOOK: only the core `array::`, `string::`, `math::` and `crypto::` builtins.
- The output is a valid, uncompressed PDF; open it in any reader. Verified against `pypdf`.
