# Retirement Math: OAS clawback calculator

Static utility site for Canadian retirement money questions, at retirementmath.ca. Page one estimates the Old Age Security clawback (recovery tax).

Status (2026-10-22): live at https://retirementmath.ca/ and https://retirementmath.pages.dev. GitHub repo https://github.com/vikiscoding/retirementmath. Pushing `main` tests the calculator and deploys to Cloudflare Pages. Search Console ownership is verified. The public title is the 2026 OAS clawback calculator, and the mark is `logo.svg`. Unknown addresses return `404.html`. `www` redirects to the apex in `functions/_middleware.js`. No ads, no analytics, no email list.

## Layout
```
index.html                 OAS clawback calculator (self-contained, data inlined)
about.html                 Who runs the site and how figures are checked
privacy.html               Privacy policy draft
disclaimer.html            Disclaimer page
404.html                   Not found page (also turns off Pages SPA fallback)
ads.txt                    Placeholder, not live
robots.txt, sitemap.xml    Point at retirementmath.ca
logo.svg                   Mark: spruce tile, cream bar, gold bar
data/oas-rules.json        Every figure with source URL and date
scripts/build.py           Inlines JSON into index.html
scripts/check_rules.py     Fetches canada.ca, diffs thresholds, optional --update
tests/test_calc.js         Math tests, also checks inline data is fresh
functions/_middleware.js              Redirect www.retirementmath.ca to the apex
.github/workflows/deploy.yml          Test and publish to Cloudflare Pages on push to main
docs/sample-check-oas-rules.yml         Weekly canada.ca check sample, not enabled
docs/panel-review.md       Expert panel review and decisions
docs/roadmap.md            Next pages and launch checklist
docs/disclaimer.md         Disclaimer source text
AGENTS.md                  Instructions for AI agents
```

## Use
```
python3 scripts/build.py
node tests/test_calc.js
python3 -m http.server 8000
```

## Formula
Repayment = 15% x (net world income minus threshold), capped at the OAS received. Withheld monthly over July to June after the income year is assessed. Source: https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/recovery-tax.html
