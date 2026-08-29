# xlsx — Excel spreadsheets for LOOK (read & write)

A real `.xlsx` reader and writer written in **pure LOOK** — no native code, no external
service. It builds and parses genuine Office Open XML workbooks (a ZIP of XML parts). It
**writes** stored ZIPs (assembled byte-for-byte with a CRC32) and **reads** both stored and
DEFLATE-compressed files — it carries its own RFC-1951 inflate — so it round-trips its own
output *and* opens spreadsheets made by Excel, Google Sheets and LibreOffice.

Multiple sheets, real number cells, UTF-8 text throughout (Turkish just works). Verified
against `openpyxl`, both directions.

## Install

```bash
lk install github.com/codlook/look-packages/xlsx
```

```lk
use "pkg/xlsx"
```

## Use

```lk
use "pkg/xlsx"

# WRITE — rows in, .xlsx out (numbers become real number cells)
$rows = [["Ürün", "Fiyat"], ["Adana Döner", 120.50], ["Künefe", 85.50]]
file::put("urunler.xlsx", xlsx($rows))

# straight from the database
file::put("rapor.xlsx", xlsx(db::query($conn, "SELECT ad, fiyat FROM urunler", [])))

# many sheets
file::put("defter.xlsx", xlsx_book([
    ["name" => "Satışlar",   "rows" => [["Tarih", "Tutar"], ["2026-08-01", 1250]]],
    ["name" => "Müşteriler", "rows" => [["Ad", "Şehir"], ["Ahmet", "İstanbul"]]]
]))

# READ — any .xlsx, including files Excel made (compressed)
$book = xlsx_read(file::read("gelen.xlsx"))
$rows = $book[0]["rows"]          # first sheet's rows; numbers come back as int/float

# UPDATE — read, change the rows, write again
$rows[1][1] = $rows[1][1] * 1.1   # a 10% price rise
file::put("guncel.xlsx", xlsx_book([["name" => $book[0]["name"], "rows" => $rows]]))
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `xlsx($rows)` | `string` (binary) | Write a one-sheet workbook ("Sheet1"). |
| `xlsx_book($sheets)` | `string` (binary) | Write a workbook of many sheets: `[["name" => .., "rows" => ..], …]`. |
| `xlsx_read($binary)` | `array` | Read a workbook into `[["name" => .., "rows" => ..], …]` (all sheets, in order). |

A row is an array of cells. On write, an integer or float cell becomes a real number cell,
anything else text. On read, number cells return as `int`/`float`, everything else as text.
**Update** is just read → change the rows → write. Read with `file::read`, write with `file::put`.

## Notes

- Genuine `.xlsx` (Office Open XML): opens without warnings, unlike CSV (no types/sheets) or
  the legacy SpreadsheetML.
- Reads real-world files: it inflates DEFLATE entries and resolves the shared-strings table
  that Excel uses, so files from any spreadsheet app come back correctly.
- Text is UTF-8 with XML escaping — Turkish and `&`, `<`, `>` are safe both ways.
- Pure LOOK: it builds and parses the ZIP itself (stored + CRC32 to write, inflate to read),
  and `crypto::hex_decode` / `file::read` give it the raw bytes — using only core builtins.
- Cells are strings or numbers. Styling, formulas and dates are a possible later addition.
