# imgupload — client-side image optimization for LOOK apps

The right way to handle photo uploads in a LOOK app: **optimize in the browser, store on the
server.** A tiny script (`optimize.js`) converts the user's photo to **WebP** (resized, quality
tuned) using the browser's own native codec — fast, free, transparency preserved — and uploads
the small result to a LOOK route that stores it securely with the core `request::file()` and
`file::store()`. No server-side image codec, no native dependency, no CVE-maintenance burden.

This is how the size win happens where it's cheapest — on the client, at upload time — the same
approach modern platforms use. (Server-side WebP/JPEG would need a native library like libwebp;
that's a separate, heavier decision — see the note below.)

**Verified in a real browser:** a transparent test image encoded to WebP came out **63% smaller
than PNG** with its **alpha channel intact**.

## The browser side — `optimize.js`

```html
<input type="file" id="img" accept="image/*">
<script src="/optimize.js"></script>
<script>
  document.getElementById("img").onchange = async (e) => {
    // resize to max 1600px, WebP quality 0.8, upload to the LOOK route
    await uploadOptimized(e.target.files[0], "/upload", { maxWidth: 1600, quality: 0.8 });
  };
</script>
```

| Function | Description |
|----------|-------------|
| `optimizeImage(file, opts)` → `Promise<Blob>` | Resize + encode to WebP (JPEG fallback on Safari). `opts`: `maxWidth`, `maxHeight`, `quality` (0–1), `format`. |
| `uploadOptimized(file, url, opts)` → `Promise<Response>` | Optimize, then POST as multipart field `image`. |

WebP is ~25–35% smaller than JPEG and, with lossy+alpha, ~60–70% smaller than a transparent
PNG — transparency is kept. On Safari (no WebP encoding in canvas) it falls back to JPEG.

## The LOOK side — store it securely (core builtins)

```lk
use file
route("POST", "/upload", function() {
    $f = request::file("image")
    if ($f == null) { response::status(400); response::json(["ok" => false]); return }
    # request::file() returns the DETECTED mime + size (["path","mime","size","sha256"]) —
    # enforce your own allowlist; it does not reject by type for you.
    if ($f["mime"] != "image/webp" && $f["mime"] != "image/jpeg") {
        response::status(400); response::json(["ok" => false, "error" => "only webp/jpeg"]); return
    }
    $saved = file::store($f, "products")          # SHA-256 name, outside the web root
    response::json(["ok" => true, "url" => $saved["url"]])
})
```

`request::file()` detects the real type by magic bytes (so a `.jpg`-named text file comes back
as `text/plain`, not `image/jpeg`) and reports `size` — you check them against your allowlist.
`file::store()` writes outside the web root with a hashed name. Set `UPLOAD_DIR` (and
`UPLOAD_URL`) in the environment; keep the upload temp dir and `UPLOAD_DIR` on the **same
filesystem** (`file::store` moves via rename).

See [`example.lk`](example.lk) for a runnable route (with a demo upload page) and
[`optimize.js`](optimize.js) for the client script.

## Note — why not server-side WebP?

A backend WebP/JPEG codec means linking a native library (libwebp/libjpeg-turbo), which every
language does natively (PHP GD, Node sharp, Go cgo). For LOOK that's a core change with a
permanent CVE-maintenance burden and a trade-off against the single-binary promise — worth it
only when you have a real **browserless** server scenario (an API receiving photos, a batch
import, a cron job). For the common case — users uploading photos through a page — the browser
already has the codec, so this package uses it and keeps the server a thin, safe store.
