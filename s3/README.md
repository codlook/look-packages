# s3 — S3-compatible object storage for LOOK

Put, get and delete objects on any S3-compatible store — AWS S3, MinIO, Cloudflare R2,
Backblaze B2 — with **AWS Signature V4** signing, built purely on the core `http::` and
`crypto::` builtins. Path-style addressing (`endpoint/bucket/key`), which every
S3-compatible server accepts. The signing was verified end-to-end against a real MinIO
server (put → get → delete round-trip).

## Install

```bash
lk install github.com/codlook/look-packages/s3
```

```lk
use "pkg/s3"
```

## Config

```lk
$cfg = [
    "endpoint"   => "https://s3.amazonaws.com",   # or "http://127.0.0.1:9000" for MinIO
    "region"     => "us-east-1",
    "access_key" => env("S3_ACCESS_KEY"),
    "secret_key" => env("S3_SECRET_KEY"),
    "bucket"     => "my-bucket"
]
```

## Use

```lk
use "pkg/s3"

s3_put($cfg, "avatars/42.png", $bytes, "image/png")   # -> 200
$obj = s3_get($cfg, "avatars/42.png")                  # -> {status: 200, body: ...}
s3_delete($cfg, "avatars/42.png")                      # -> 204
$url = s3_url($cfg, "avatars/42.png")                  # path-style object URL
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `s3_put($cfg, $key, $content, $content_type)` | `int` | Upload an object; HTTP status (200 on success). |
| `s3_get($cfg, $key)` | `assoc` | `{status, body}`. |
| `s3_delete($cfg, $key)` | `int` | Delete an object (204 on success). |
| `s3_url($cfg, $key)` | `string` | Path-style object URL. |

## Notes

- **Clock must be UTC.** SigV4 allows about a 15-minute skew; the request date comes
  from `date::now()`, so run your server on UTC (as most do).
- Pairs with the [`storage`](https://github.com/codlook/look-modules/tree/main/storage)
  module: keep app code on the `storage_*` surface for local disk, and swap in `s3_*`
  for the cloud backend.
- Keys should be simple paths (`dir/file.ext`). Bucket creation and listing are out of
  scope — create buckets with your provider's console or `mc`.
