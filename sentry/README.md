# sentry — error reporting for LOOK

Send errors to Sentry (or any Sentry-compatible ingest) from LOOK, built purely on the
core `http::` and `json::` builtins. It parses a DSN, builds the store endpoint and auth
header, and posts an event — call it from a catch block or an error hook.

## Install

```bash
lk install github.com/codlook/look-packages/sentry
```

```lk
use "pkg/sentry"
```

## Use

```lk
use "pkg/sentry"

$dsn = env("SENTRY_DSN")   # https://PUBLIC_KEY@o123.ingest.sentry.io/456

try {
    risky_work()
} catch ($e) {
    sentry_capture_exception($dsn, $e)
    return response::error(500, "internal error")
}

sentry_capture($dsn, "cache warmup skipped", "warning")
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `sentry_capture($dsn, $message, $level)` | `int` | Post an event; HTTP status (200 on success). Levels: `fatal` `error` `warning` `info` `debug`. |
| `sentry_capture_exception($dsn, $error)` | `int` | Convenience wrapper at level `error`. |

## Notes

- The DSN format is `https://PUBLIC_KEY@HOST/PROJECT_ID`; the module derives the
  `/api/PROJECT_ID/store/` endpoint and the `X-Sentry-Auth` header from it.
- This sends a minimal event (message, level, platform). Extend `sentry_capture` with
  tags, extra context or stack frames if your setup needs them — the shape is a plain
  assoc encoded as JSON.
