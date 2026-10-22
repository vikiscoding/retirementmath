#!/usr/bin/env python3
"""Inline data/oas-rules.json into index.html between RULES markers. Idempotent."""
import json, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
rules = json.loads((root / "data/oas-rules.json").read_text())
html_path = root / "index.html"
html = html_path.read_text()
block = '<script id="oas-rules" type="application/json">' + json.dumps(rules, separators=(",", ":")).replace("</", "<\\/") + "</script>"
new, n = re.subn(r'(<!-- RULES:BEGIN[^>]*-->\n).*?(\n<!-- RULES:END -->)', lambda m: m.group(1) + block + m.group(2), html, flags=re.S)
if n != 1:
    raise SystemExit("RULES markers not found exactly once")
date = rules["last_verified"]
new, n_date = re.subn(
    r'(<strong id="verified">)[^<]*(</strong>)',
    lambda m: m.group(1) + date + m.group(2),
    new,
    count=1,
)
if n_date != 1:
    raise SystemExit("verified date not found exactly once")
html_path.write_text(new)
print("index.html updated, last_verified", date)
