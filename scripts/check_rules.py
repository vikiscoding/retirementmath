#!/usr/bin/env python3
"""Check OAS recovery tax thresholds on canada.ca against data/oas-rules.json.

Usage:
  python3 scripts/check_rules.py            # report only, exit 1 if anything differs
  python3 scripts/check_rules.py --update   # write changed thresholds, bump last_verified, rebuild index.html
Stdlib only. Never changes max OAS amounts automatically; those are reported for a human.
A slow or dropped canada.ca read is retried. Exit 2 only after those tries fail.
"""
import argparse, datetime, json, pathlib, re, subprocess, sys, time, urllib.error, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
RULES = ROOT / "data/oas-rules.json"
RECOVERY_URL = "https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/recovery-tax.html"
PAYMENTS_URL = "https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/payments.html"
UA = {"User-Agent": "Mozilla/5.0 (oas-clawback rules checker)"}
# Python urlopen on the GitHub runner accepts the connection and then never reads a byte.
# Each try sits until this timeout. curl over IPv4 returns the same page immediately.
FETCH_ATTEMPTS = 3
FETCH_TIMEOUT = 60
CURL_TIMEOUT = 25

def _retryable(err):
    if isinstance(err, urllib.error.HTTPError):
        return err.code == 429 or err.code >= 500
    if isinstance(err, (TimeoutError, ConnectionError, urllib.error.URLError)):
        return True
    return False

def _http_code(err):
    match = re.search(r"returned error: (\d{3})", err)
    return int(match.group(1)) if match else None

def _curl_fetch(url, timeout, ipv4, run):
    cmd = ["curl", "-fsSL", "--max-time", str(int(timeout)), "--connect-timeout", "10",
           "-A", UA["User-Agent"], "-H", "Accept: text/html", url]
    if ipv4:
        cmd.insert(1, "--ipv4")
    proc = run(cmd, capture_output=True)
    if proc.returncode != 0:
        err = proc.stderr.decode("utf-8", "replace").strip() or "curl exit %s" % proc.returncode
        code = _http_code(err)
        if code:
            raise urllib.error.HTTPError(url, code, err, hdrs=None, fp=None)
        raise ConnectionError(err)
    return proc.stdout.decode("utf-8", "replace")

def _urllib_fetch(url, timeout, opener):
    req = urllib.request.Request(url, headers=UA)
    with opener(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")

def fetch(url, attempts=FETCH_ATTEMPTS, timeout=FETCH_TIMEOUT, opener=None, sleep=time.sleep, run=None):
    """GET url. Prefer curl. Fall back to urllib only when curl is not installed."""
    if run is None:
        run = subprocess.run
    use_curl = opener is None
    for n in range(1, attempts + 1):
        try:
            if not use_curl:
                return _urllib_fetch(url, timeout, opener or urllib.request.urlopen)
            try:
                return _curl_fetch(url, CURL_TIMEOUT, ipv4=(n == 1), run=run)
            except FileNotFoundError:
                use_curl = False
                return _urllib_fetch(url, timeout, urllib.request.urlopen)
        except Exception as e:
            if isinstance(e, urllib.error.HTTPError):
                e.close()
            if _retryable(e) and n < attempts:
                print(f"WARN {url} attempt {n} of {attempts} failed: {e}", file=sys.stderr)
                sleep(2 ** (n - 1))
                continue
            raise RuntimeError(f"{url}: {e}") from e

def text(html):
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t.replace("&nbsp;", " "))

def money(s):
    return float(s.replace("$", "").replace(",", ""))

def parse_recovery(t):
    # Rows like: "July 2026 to June 2027 2025 $93,454 $152,062 $157,923"
    rows = {}
    for m in re.finditer(r"(July \d{4} to June \d{4})\s+(\d{4})\s+(\$[\d,]+)\s+(\$[\d,]+)\s*1?\s+(\$[\d,]+)", t):
        rows[int(m.group(2))] = {"payment_period": m.group(1), "threshold_min": money(m.group(3)),
                                 "threshold_max_65_74": money(m.group(4)), "threshold_max_75_plus": money(m.group(5))}
    return rows

def parse_payments(t):
    a = re.search(r"age 65 to 74\s+less than \$[\d,]+\s+up to (\$[\d,.]+)", t, re.I)
    b = re.search(r"age 75 and over\s+less than \$[\d,]+\s+up to (\$[\d,.]+)", t, re.I)
    return {"age_65_74": money(a.group(1)) if a else None, "age_75_plus": money(b.group(1)) if b else None}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--update", action="store_true")
    ap.add_argument("--recovery-file", help="parse a saved HTML file instead of fetching (offline testing)")
    ap.add_argument("--payments-file", help="parse a saved HTML file instead of fetching (offline testing)")
    args = ap.parse_args()
    rules = json.loads(RULES.read_text())
    try:
        rec_html = pathlib.Path(args.recovery_file).read_text() if args.recovery_file else fetch(RECOVERY_URL)
        pay_html = pathlib.Path(args.payments_file).read_text() if args.payments_file else fetch(PAYMENTS_URL)
        live = parse_recovery(text(rec_html))
        pay = parse_payments(text(pay_html))
    except Exception as e:
        print(f"ERROR fetching canada.ca: {e}"); return 2
    if not live:
        print("ERROR could not parse the recovery tax table. Page layout may have changed. Check by hand."); return 2

    diffs = []
    known = {p["income_year"]: p for p in rules["periods"]}
    for year, row in sorted(live.items()):
        p = known.get(year)
        if not p:
            diffs.append(f"NEW income year {year}: {row}")
            if args.update:
                rules["periods"].append({"id": f"{year}-income", "income_year": year, **{k: (int(v) if isinstance(v, float) else v) for k, v in row.items()},
                                         "status": "estimate", "source": RECOVERY_URL})
            continue
        for k in ("threshold_min", "threshold_max_65_74", "threshold_max_75_plus"):
            if float(p[k]) != row[k]:
                diffs.append(f"{year} {k}: json {p[k]} vs canada.ca {row[k]:.0f}")
                if args.update:
                    p[k] = int(row[k])
    cur = next(q for q in rules["max_monthly_oas_2026"] if q["quarter"] == rules["current_quarter"])
    for k, v in pay.items():
        if v is not None and v != cur[k]:
            diffs.append(f"Max monthly OAS {k}: json {cur[k]} ({rules['current_quarter']}) vs canada.ca {v}. New quarter? Add it by hand with its source.")

    if not diffs:
        print("OK: data/oas-rules.json matches canada.ca")
    for d in diffs:
        print("DIFF:", d)
    if args.update and diffs:
        rules["last_verified"] = datetime.date.today().isoformat()
        RULES.write_text(json.dumps(rules, indent=2) + "\n")
        subprocess.run([sys.executable, str(ROOT / "scripts/build.py")], check=True)
        print("Updated thresholds and last_verified. Review the diff, run node tests/test_calc.js, then commit.")
    elif args.update:
        print("No file changes.")
    return 1 if diffs and not args.update else 0

if __name__ == "__main__":
    sys.exit(main())
