#!/usr/bin/env python3
"""Inline rules JSON into the calculator pages. Idempotent."""
import json, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
MONTHS = {
    "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "fr": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
}

def human_date(iso, lang):
    year, month, day = (int(part) for part in iso.split("-"))
    label = "1er" if lang == "fr" and day == 1 else str(day)
    return "%s %s %d" % (label, MONTHS[lang][month - 1], year)

def stamp_times(html, css_class, iso, lang):
    text = human_date(iso, lang)
    pattern = r'(<time class="%s" datetime=")[^"]*(">)[^<]*(</time>)' % css_class
    return re.subn(pattern, lambda m: m.group(1) + iso + m.group(2) + text + m.group(3), html)

def inline(html_name, json_name, script_id, marker, stamp=True):
    rules = json.loads((root / json_name).read_text(encoding="utf-8"))
    html_path = root / html_name
    html = html_path.read_text(encoding="utf-8")
    block = '<script id="%s" type="application/json">' % script_id + json.dumps(rules, separators=(",", ":")).replace("</", "<\\/") + "</script>"
    pattern = r'(<!-- %s:BEGIN[^>]*-->\n).*?(\n<!-- %s:END -->)' % (marker, marker)
    new, n = re.subn(pattern, lambda m: m.group(1) + block + m.group(2), html, flags=re.S)
    if n != 1:
        raise SystemExit("%s markers not found exactly once in %s" % (marker, html_name))
    if not stamp:
        html_path.write_text(new, encoding="utf-8")
        print("%s inlined %s" % (html_name, marker))
        return
    lang = "fr" if html_name.startswith("fr/") else "en"
    checked = rules.get("last_checked") or rules["last_verified"]
    updated = rules.get("last_updated") or checked
    new, n_date = stamp_times(new, "verified-date", checked, lang)
    if n_date < 1:
        raise SystemExit("verified date not found in %s" % html_name)
    if 'class="updated-date"' in new:
        new, n_updated = stamp_times(new, "updated-date", updated, lang)
        if n_updated < 1:
            raise SystemExit("updated date not found in %s" % html_name)
    if rules.get("source_page_date"):
        new, n_source = stamp_times(new, "source-date", rules["source_page_date"], lang)
        if n_source < 1:
            raise SystemExit("source date not found in %s" % html_name)
    if '"@type":"WebPage"' in new:
        new, n_mod = re.subn(
            r'("dateModified":")\d{4}-\d{2}-\d{2}(")',
            lambda m: m.group(1) + checked + m.group(2),
            new,
            count=1,
        )
        if n_mod != 1:
            raise SystemExit("dateModified not found exactly once in %s" % html_name)
    html_path.write_text(new, encoding="utf-8")
    print("%s updated, checked %s" % (html_name, checked))

inline("index.html", "data/oas-rules.json", "oas-rules", "RULES")
inline("fr/index.html", "data/oas-rules.json", "oas-rules", "RULES")
inline("rrif.html", "data/rrif-rules.json", "rrif-rules", "RRIF_RULES")
inline("fr/rrif.html", "data/rrif-rules.json", "rrif-rules", "RRIF_RULES")
inline("take-home.html", "data/take-home-rules.json", "take-home-rules", "TAKEHOME_RULES")
inline("fr/take-home.html", "data/take-home-rules.json", "take-home-rules", "TAKEHOME_RULES")
inline("take-home.html", "data/oas-rules.json", "oas-rules", "OAS_RULES", stamp=False)
inline("fr/take-home.html", "data/oas-rules.json", "oas-rules", "OAS_RULES", stamp=False)
