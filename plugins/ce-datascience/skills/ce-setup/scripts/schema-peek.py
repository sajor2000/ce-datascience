#!/usr/bin/env python3
"""Print a data file's schema without printing any of its values.

Usage: python3 schema-peek.py <file> [<file> ...] [--delimiter X]

Output per file: column heading, inferred type, non-null count, and % missing,
plus the row count. It never prints a cell value, example, min/max, or
distinct value. Counts from 1 to 10 are shown as "<11" (and the matching
% missing is withheld) so small cells cannot be read back.

Supports CSV/TSV (optionally .gz) with the standard library; Parquet,
Feather, and Arrow via pyarrow; and the XLSX header row via openpyxl.
"""

import csv
import gzip
import os
import re
import sys

THRESHOLD = 11
MISSING = {"", "na", "n/a", "nan", "null", "none", ".", "nat", "#n/a"}
INT_RE = re.compile(r"^[+-]?\d+$")
FLOAT_RE = re.compile(r"^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$")
BOOL_VALUES = {"true", "false", "t", "f", "yes", "no"}


def count_cell(n):
    return f"<{THRESHOLD}" if 0 < n < THRESHOLD else str(n)


def classify(value):
    if INT_RE.match(value):
        return "integer"
    if FLOAT_RE.match(value):
        return "float"
    if DATE_RE.match(value):
        return "datetime"
    if value.lower() in BOOL_VALUES:
        return "boolean"
    return "string"


def merge_type(current, new):
    if current is None or current == new:
        return new
    if {current, new} == {"integer", "float"}:
        return "float"
    return "string"


def render(path, rows, columns, note=None):
    """columns: list of (name, type, non_null or None)."""
    print(f"## {os.path.basename(path)}")
    print(f"Rows: {count_cell(rows) if rows is not None else 'unknown'}")
    print(f"Small-cell rule: counts from 1 to {THRESHOLD - 1} are shown as <{THRESHOLD}; "
          "% missing is withheld when either the present or missing count is that small.")
    if note:
        print(note)
    print()
    print("| column | type | non-null | % missing |")
    print("|---|---|---|---|")
    for name, col_type, non_null in columns:
        if non_null is None or rows is None:
            print(f"| {name} | {col_type} | unknown | unknown |")
            continue
        missing = rows - non_null
        small = 0 < non_null < THRESHOLD or 0 < missing < THRESHOLD
        pct = "withheld" if small else (f"{100.0 * missing / rows:.1f}" if rows else "0.0")
        print(f"| {name} | {col_type} | {count_cell(non_null)} | {pct} |")
    print()


def peek_delimited(path, delimiter):
    opener = gzip.open if path.lower().endswith(".gz") else open
    with opener(path, "rt", encoding="utf-8-sig", errors="replace", newline="") as fh:
        reader = csv.reader(fh, delimiter=delimiter)
        header = next(reader, None)
        if header is None:
            render(path, 0, [])
            return
        non_null = [0] * len(header)
        types = [None] * len(header)
        rows = 0
        for row in reader:
            rows += 1
            for index in range(len(header)):
                value = row[index].strip() if index < len(row) else ""
                if value.lower() in MISSING:
                    continue
                non_null[index] += 1
                types[index] = merge_type(types[index], classify(value))
    columns = [(name, types[i] or "empty", non_null[i]) for i, name in enumerate(header)]
    render(path, rows, columns)


def peek_arrow(path, kind):
    try:
        import pyarrow  # noqa: F401
    except ImportError:
        print(f"## {os.path.basename(path)}\npyarrow is not installed; install it in the project "
              "environment to read Parquet/Feather/Arrow schemas.\n")
        return
    if kind == "parquet":
        import pyarrow.parquet as pq
        meta = pq.ParquetFile(path).metadata
        schema = meta.schema.to_arrow_schema()
        rows = meta.num_rows
        columns = []
        for index, field in enumerate(schema):
            nulls, known = 0, True
            for group in range(meta.num_row_groups):
                stats = meta.row_group(group).column(index).statistics
                if stats is None or not stats.has_null_count:
                    known = False
                    break
                nulls += stats.null_count
            if not known:
                nulls = pq.read_table(path, columns=[field.name]).column(0).null_count
            columns.append((field.name, str(field.type), rows - nulls))
    else:
        import pyarrow.feather as feather
        table = feather.read_table(path)
        rows = table.num_rows
        columns = [(f.name, str(f.type), rows - table.column(i).null_count)
                   for i, f in enumerate(table.schema)]
    render(path, rows, columns)


def peek_xlsx(path):
    try:
        import openpyxl
    except ImportError:
        print(f"## {os.path.basename(path)}\nopenpyxl is not installed; install it in the project "
              "environment to read the XLSX header row.\n")
        return
    book = openpyxl.load_workbook(path, read_only=True)
    for sheet in book.worksheets:
        header = next(sheet.iter_rows(min_row=1, max_row=1, values_only=True), ()) or ()
        rows = max((sheet.max_row or 1) - 1, 0)
        columns = [(str(h) if h is not None else "(blank)", "not inferred", None) for h in header]
        render(f"{path} [{sheet.title}]", rows, columns,
               note="XLSX: header row and approximate row count only.")
    book.close()


def main(argv):
    delimiter = None
    paths = []
    args = iter(argv)
    for arg in args:
        if arg == "--delimiter":
            delimiter = next(args, ",").encode().decode("unicode_escape")
        else:
            paths.append(arg)
    if not paths:
        print(__doc__.strip())
        return 2
    status = 0
    for path in paths:
        lower = path.lower()
        base = lower[:-3] if lower.endswith(".gz") else lower
        if not os.path.isfile(path):
            print(f"## {os.path.basename(path)}\nNot a file.\n")
            status = 1
        elif base.endswith((".csv", ".tsv", ".txt")):
            peek_delimited(path, delimiter or ("\t" if base.endswith(".tsv") else ","))
        elif base.endswith(".parquet"):
            peek_arrow(path, "parquet")
        elif base.endswith((".feather", ".arrow")):
            peek_arrow(path, "feather")
        elif base.endswith(".xlsx"):
            peek_xlsx(path)
        else:
            print(f"## {os.path.basename(path)}\nUnsupported format for schema-peek. Write a script "
                  "that prints only column names, types, row count, and missingness.\n")
            status = 1
    return status


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
