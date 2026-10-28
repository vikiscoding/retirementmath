# Retirement Math: OAS clawback calculator

Static utility site for Canadian retirement money questions, at retirementmath.ca. Page one estimates the Old Age Security clawback (recovery tax).

Status (2026-10-27): live at https://retirementmath.ca/ and https://retirementmath.pages.dev. French pages are at https://retirementmath.ca/fr/. GitHub repo https://github.com/vikiscoding/retirementmath. Pushing `main` tests the calculator and deploys to Cloudflare Pages. Search Console ownership is verified. The public title is the 2026 OAS clawback calculator, and the mark is `logo.svg`. The three calculators plus light monetization are in place. OAS clawback is at https://retirementmath.ca/. RRIF minimum is at https://retirementmath.ca/rrif. The take-home estimate is at https://retirementmath.ca/take-home. The site stops at these three calculators. Unknown addresses return `404.html`. `www` redirects to the apex in `functions/_middleware.js`. A lawyer or accountant read the disclaimer and the earlier privacy page on 2026-10-25. The weekly canada.ca rules check is `.github/workflows/check-oas-rules.yml`. The about page names Vik, an experienced IT professional with AI development experience, and says the site is run from Toronto, Ontario. The public name is Vik. The site does not claim a tax or financial-planning designation.

Verification on 2026-10-27: OAS figures were last checked on 2026-10-27, and the last saved OAS figure change was 2026-10-22. RRIF factors were last checked on 2026-10-22. The CRA chart page is dated 2025-10-01. Take-home figures were last checked on 2026-10-27. Each calculator page shows `Last verified:` with that ISO date.

Light monetization, on the three calculators only (updated 2026-10-28): Copy summary, Print summary, and Save summary use the result figures only. TurboTax and Wealthsimple links are off until the owner asks to turn them back on. After a result, a contribution link sits beside those buttons. The footer still links the word contribution to the owner's Stripe Payment Link, https://buy.stripe.com/eVqeVdbTq2Pmdi0aX34sE00. Card details go to Stripe, not to this site. There is no card form and no Stripe script on the site. There is no account, no email gate, no analytics, and no ad script.

Kill criteria: remove a calculator if outside use stays meaningless after launch, if an official tool is clearly better and more current, if keeping the figures current costs more than the page is worth, or if a later paid version earns almost nothing while people still use it.

Take-home sources are the CRA 2026 tax rates page (page dated 2026-06-25), T4127 payroll formulas (January 2026, 122nd edition, and the July 2026 edition for the Newfoundland and Labrador basic amount), Revenu Québec guide TP-1015.F-V (2026-01), the CRA pages for CPP and EI, the Revenu Québec pages for QPP and QPIP, and the ESDC GIS benefit page (modified 2026-10-13). OAS recovery on that page reuses `data/oas-rules.json`.

Each page is one HTML file. CSS and JavaScript are inline. There is no external stylesheet, script, or font, so nothing render-blocking is fetched. Scripts sit after the content. The contribution link sits inside the hidden result, so the first screen does not shift. HTML stays readable so the calculation markers and tests stay intact. `robots.txt` allows crawling. `sitemap.xml` lists the three calculator URLs.

## Layout
```
index.html                 OAS clawback calculator (self-contained, data inlined)
rrif.html                  RRIF minimum withdrawal calculator (self-contained, data inlined)
take-home.html             2026 take-home estimate (self-contained, data inlined)
about.html                 Who runs the site and how figures are checked
privacy.html               Privacy policy
disclaimer.html            Disclaimer page
404.html                   Not found page (also turns off Pages SPA fallback)
fr/                        French pages: calculator, RRIF, take-home, about, privacy, disclaimer
ads.txt                    Placeholder, not live
robots.txt, sitemap.xml    Point at retirementmath.ca
logo.svg                   Mark: spruce tile, cream bar, gold bar
data/oas-rules.json        Every OAS figure with source URL and date
data/rrif-rules.json       CRA RRIF factors with source URL and date
data/take-home-rules.json  2026 tax, BPA, CPP, QPP, EI, QPIP, and GIS cutoff
scripts/build.py           Inlines JSON into the calculator pages
scripts/check_rules.py     Fetches canada.ca (retries a slow read), diffs thresholds, optional --update
tests/test_calc.js         Math tests, also checks inline data is fresh
functions/_middleware.js              Redirect www.retirementmath.ca to the apex
.github/workflows/deploy.yml          Test and publish to Cloudflare Pages on push to main
.github/workflows/check-oas-rules.yml Weekly canada.ca check. Opens a pull request if a figure changed
docs/sample-check-oas-rules.yml         Readable copy of that workflow
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
