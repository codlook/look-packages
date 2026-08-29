# image — PNG/BMP image toolkit for LOOK

A small image toolkit written in **pure LOOK** — no native code, no external service. It
decodes PNG (it carries its own RFC-1951 inflate), resizes, crops, and re-encodes to PNG or
exports to BMP. Made for small-to-medium images: logos, icons, thumbnails and generated
graphics (e.g. a QR rendered to PNG).

Verified against `Pillow`: decode is pixel-for-pixel exact, and a decode → encode round-trip
returns the original pixels.

## Install

```bash
lk install github.com/codlook/look-packages/image
```

```lk
use "pkg/image"
```

## Use

```lk
use "pkg/image"

$img = image_load(file::read("logo.png"))     # decode a PNG
$sz  = image_size($img)                        # [w, h]

# resize (thumbnail) and save
file::put("thumb.png", image_png(image_resize($img, 96, 64)))

# crop a region (x, y, width, height)
file::put("crop.png", image_png(image_crop($img, 20, 20, 120, 100)))

# change the extension — export to BMP
file::put("logo.bmp", image_bmp($img))
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `image_load($binary)` | `img` | Decode a PNG into `["w"=>, "h"=>, "ch"=>, "pix"=>]` (pix = flat byte array, row-major). |
| `image_resize($img, $w, $h)` | `img` | Resize (nearest-neighbour). |
| `image_crop($img, $x, $y, $w, $h)` | `img` | Crop a rectangle. |
| `image_size($img)` | `[w, h]` | Width and height. |
| `image_png($img)` | `string` (binary) | Encode to PNG. |
| `image_bmp($img)` | `string` (binary) | Export to 24-bit BMP (drops alpha). |

## Notes

- **PNG only for input** (8-bit grayscale / RGB / RGBA). Output: PNG or BMP.
- **Not JPEG.** A JPEG codec (DCT + entropy coding) isn't practical in pure LOOK, and megapixel
  photos would be too slow in the interpreter — process photos with a native or external tool
  (e.g. ImageMagick). This toolkit targets small graphics, not photo pipelines.
- **Size:** PNG output is currently *uncompressed* (a valid PNG, but not size-reduced). The way
  to shrink an image here is to **resize it down** (far fewer pixels). Real same-size deflate
  compression is a possible later addition.
- Pure LOOK: only the core `array::`, `string::`, `crypto::` and `math::` builtins —
  `crypto::hex_decode` / `file::read` provide the raw bytes.
