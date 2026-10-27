# AGENTS.md

Read this first before changing anything in this project.

## Project
Static utility site for Canadians, named Retirement Math (retirementmath.ca). First page: OAS clawback (recovery tax) calculator, `index.html`. French pages are in `fr/` and served at `/fr/`. Owner: Vikrant, Scarborough ON. Domain DNS is on the main Cloudflare account (vikrant.singh1@outlook.com). Pages hosting is the free plan on retirementmathai@gmail.com, project `retirementmath`, currently https://retirementmath.pages.dev. GitHub repo: `vikiscoding/retirementmath`. Auto-deploy is `.github/workflows/deploy.yml` and needs the `CLOUDFLARE_API_TOKEN` secret. The weekly canada.ca check is `.github/workflows/check-oas-rules.yml`.

## Doc map (read in order)
1. This file
2. `README.md` for layout and status
3. `docs/panel-review.md` for why things are the way they are
4. `docs/roadmap.md` for what is next and what is not built
5. `data/oas-rules.json` for every number the calculator uses

## Commands
- Rebuild inline data after editing JSON: `python3 scripts/build.py`
- Test math (must exit 0): `node tests/test_calc.js`
- Check rules against canada.ca (report only): `python3 scripts/check_rules.py`
- Offline parser test: `python3 scripts/check_rules.py --recovery-file tests/fixtures/recovery-tax.html --payments-file tests/fixtures/payments.html` (must print OK)
- Fetch retry test: `python3 -m unittest tests/test_check_rules.py`
- Check and write changes: `python3 scripts/check_rules.py --update`
- Preview: `python3 -m http.server 8000` then open http://localhost:8000

## Definition of done
A change is done when all are true:
- `python3 scripts/build.py` has been run after any JSON change
- `node tests/test_calc.js` exits 0
- New calculation behaviour has a new case in `tests/test_calc.js`
- Every new figure has a canada.ca (or other Government of Canada) URL and date in `data/oas-rules.json`
- `README.md` status and `docs/roadmap.md` are updated
- Copy passes the style rules below

## Hard rules
1. Never invent a figure. If canada.ca has not published it, leave it out or set `"status": "estimate"` with a note and the source.
2. `data/oas-rules.json` is the single source of truth. The JSON inside `index.html` is generated. Do not hand edit between the `RULES:BEGIN` and `RULES:END` markers.
3. Each page is one self-contained HTML file. Inline CSS, minimal vanilla JS, no CDNs, no frameworks, no build step beyond `scripts/build.py`.
4. The calculation function sits between `CALC:BEGIN` and `CALC:END` and must stay pure (no DOM access) so tests can run it.
5. User input never leaves the browser. No forms that post, no analytics, no cookies, unless the privacy page and a consent banner are updated first and the owner approves.
6. Ad slots are placeholders only. No ad scripts until the owner approves and consent (Google certified CMP) is in place.
7. Keep the disclaimer and privacy link on every page.
8. Accessibility: WCAG 2.1 AA. Labels on every input, visible focus, 44px targets, results announced with `aria-live`, works without colour, works at 320px wide.

## Boundaries
- Always: run the tests, cite sources, keep `last_checked` and `last_updated` honest. `last_verified` matches `last_checked`.
- Ask first: adding any third-party script, changing the formula, adding a new data field. The weekly canada.ca rules-check workflow is already on.
- Deploy: pushing `main` runs `.github/workflows/deploy.yml` and publishes the public HTML to Cloudflare Pages. That is the owner's chosen setup.
- Never: buy domains, sign up for ad or affiliate accounts, spend money, commit secrets, weaken or delete a failing test to make it pass.

## When a test fails
Fix the source, not the assertion. If canada.ca changed a figure, update JSON from the source and update the expected value with a comment citing the URL. If the same failure repeats and you cannot explain it, stop and report.

## Writing style
Plain and direct. Short sentences. No em dashes. No filler like "dive in", "seamless", "robust", "in today's world". Grade 8 reading level for page copy. Canadian spelling.

## Gotchas
- Thresholds are tied to the income year, but repayments come off OAS from July of the next year to June of the year after. Label both.
- canada.ca's full clawback point is based on OAS amounts over the year. Our estimate uses the current quarter's maximum, so it can differ by a few thousand dollars. The page says so.
- 2026 income upper thresholds disagree between two canada.ca pages (see `docs/panel-review.md`). The minimum ($95,323) agrees.
