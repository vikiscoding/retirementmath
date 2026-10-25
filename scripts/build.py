#!/usr/bin/env python3
"""Inline rules JSON into the calculator pages. Idempotent."""
import json, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent

def inline(html_name, json_name, script_id, marker):
    rules = json.loads((root / json_name).read_text())
    html_path = root / html_name
    html = html_path.read_text()
    block = '<script id="%s" type="application/json">' % script_id + json.dumps(rules, separators=(",", ":")).replace("</", "<\\/") + "</script>"
    pattern = r'(<!-- %s:BEGIN[^>]*-->\n).*?(\n<!-- %s:END -->)' % (marker, marker)
    new, n = re.subn(pattern, lambda m: m.group(1) + block + m.group(2), html, flags=re.S)
    if n != 1:
        raise SystemExit("%s markers not found exactly once in %s" % (marker, html_name))
    date = rules["last_verified"]
    new, n_date = re.subn(
        r'(<strong id="verified">)[^<]*(</strong>)',
        lambda m: m.group(1) + date + m.group(2),
        new,
        count=1,
    )
    if n_date != 1:
        raise SystemExit("verified date not found exactly once in %s" % html_name)
    html_path.write_text(new)
    print("%s updated, last_verified %s" % (html_name, date))

inline("index.html", "data/oas-rules.json", "oas-rules", "RULES")
inline("fr/index.html", "data/oas-rules.json", "oas-rules", "RULES")
inline("rrif.html", "data/rrif-rules.json", "rrif-rules", "RRIF_RULES")
inline("fr/rrif.html", "data/rrif-rules.json", "rrif-rules", "RRIF_RULES")
