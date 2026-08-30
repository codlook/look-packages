# Authoring LOOK packages

A package is a directory with `<name>.lk` (the code), `look.json` (metadata), `README.md`
and a runnable `example.lk`. A user installs it with
`lk install github.com/codlook/look-packages/<name>` and loads it with `use "pkg/<name>"`.

## Naming — prefix everything

LOOK packages share **one global function namespace**. Two packages that define the same
top-level function name collide the moment a user loads both — a confusing duplicate-definition
error in *their* code, not ours. So:

- **Public functions** are prefixed with the package name:
  `tcmb_rate`, `qr_svg`, `paytr_token`, `xlsx_read`.
- **Internal helpers** are prefixed with the package name **plus a double underscore**:
  `tcmb__fetch`, `paytr__sign`, `xlsx__inflate`. Never define an unprefixed top-level helper —
  a generic name like `inflate`, `parse` or `encode` *will* clash with another package.

> This is not hypothetical: `image` and `xlsx` each once defined a top-level `inflate`, so
> loading both in one script was a duplicate-definition error until they were renamed
> `image__inflate` / `xlsx__inflate`.

## example.lk — must run

Every package ships an `example.lk` that **actually runs** (`lk example.lk`) and prints
something useful. For a package that needs credentials or a network service, read them from
`env(...)` and guard on absence so the example still runs cleanly:

```lk
$key = env("SERVICE_KEY")
if ($key == null || $key == "") {          // env() returns null when unset, not ""
    print("Set SERVICE_KEY to call the service.")
} else {
    # … the real call …
}
```

An example that only *looks* right but doesn't parse is worse than none — run it before you
commit.

## Updating a package — copy only what changed

When you update an existing package in this repo, copy **only the files you changed** into your
clone. Never replace a whole package directory from an incomplete local copy: if your copy is
missing `look.json` (or the README), a wholesale replace silently **deletes** it — and since the
package directory reads `look.json` live, the package would vanish from the site too.

Before every commit, read `git status`. A deletion (`D`) you did not intend is the warning sign —
it once caught three `look.json` files about to be dropped. Expect only the `A`/`M` lines for the
files you meant to touch.

## Verify against something independent

Where a package's output can be checked against an authoritative reference, check it — don't
settle for a self-written mock (that only proves the code agrees with itself). Barcode/QR are
verified bit-exact against `python-barcode` / a QR reference; `tcmb` against an XML parser;
`paytr` token/callback hashes against an independent HMAC oracle. Where a live counterparty
can't be reached without an account, say so honestly in the README rather than implying it was
tested.
