# Expert panel review: OAS clawback calculator

Date: 2026-10-22. Four reviewers. Each item marked [built] is in the scaffold now. [later] items are in `docs/roadmap.md`.

## Verified figures (canada.ca, checked 2026-10-22)

| Income year | Repayment period | Starts at | Full clawback 65 to 74 | Full clawback 75+ | Status |
| --- | --- | --- | --- | --- | --- |
| 2024 | July 2025 to June 2026 | $90,997 | $148,451 | $154,196 | final |
| 2025 | July 2026 to June 2027 | $93,454 | $152,062 | $157,923 | final |
| 2026 | July 2027 to June 2028 | $95,323 | $155,320 | $161,320 | upper limits are estimates |

Source: https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/recovery-tax.html

Rate: 15% of income over the threshold, same source.

Max monthly OAS, 2026:

| Quarter | 65 to 74 | 75+ | Source |
| --- | --- | --- | --- |
| Jan to Mar | $742.31 | $816.54 | https://publications.gc.ca/collections/collection_2026/edsc-esdc/SG3-3-2026-1.pdf |
| Apr to Jun | $743.05 | $817.36 | https://www.canada.ca/en/employment-social-development/programs/pensions/pension/statistics/2026-quarterly-april-june.html |
| Jul to Sep | $751.97 | $827.17 | open.canada.ca July to September 2026 table of rates |
| Oct to Dec | $762.50 | $838.75 | https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/payments.html |

### Where sources disagree
1. 2026 income upper limits. The CRA recovery tax page shows $155,320 / $161,320 and footnotes them as estimates until October to December. The ESDC April to June 2026 quarterly report footnote shows $154,753 / $160,696. The lower threshold of $95,323 matches. We use the CRA page and label it "estimate".
2. Full clawback point. canada.ca lists $152,062 for 2025 income at 65 to 74. Threshold plus (12 x $762.50 / 0.15) gives $154,454. The official figure is built from OAS amounts across the year, not one quarter. The page shows both and explains the gap.
3. Many third-party articles call $93,454 "the 2026 threshold" without saying it applies to 2025 income. The page labels income year and repayment period together to avoid this.

## Architect
- [built] Plain static HTML, one file per tool. No framework. Loads fast on old phones and costs nothing to host.
- [built] `data/oas-rules.json` is the one source of truth, with source URL, status and `last_verified` per figure. `scripts/build.py` inlines it, so the page still has zero external requests.
- [built] Pure calculation function between markers so Node can test it straight from the HTML. Tests also fail if the inline data is stale.
- [built] `scripts/check_rules.py` scrapes the canada.ca table, diffs, and can update. Sample weekly GitHub Action opens a PR for a human to merge. It never auto-publishes.
- [later] Shared header/footer partial once there are 3+ pages. Until then copy is fine.

## Full-stack developer
- [built] Vanilla JS, about 100 lines. Works with income typed as "120,000" or "$120000".
- [built] Inline validation with `aria-invalid` and a live error message. Results section gets focus and is announced.
- [built] Dark mode via `prefers-color-scheme`, print stylesheet hides ad slots.
- [built] 11 test cases: below, at, and above threshold, the canada.ca $100k example, full clawback for both age groups, 2026 income, partial residency, under 10 years, max deferral.
- [later] Lighthouse run and a Playwright smoke test once hosted.

## Monetization specialist
- [built] Three marked ad slot placeholders (top, below results, footer) with fixed min-height to avoid layout shift later. No ad code.
- AdSense: apply only after about 15 to 20 original pages. Thin single-tool sites often get rejected for "low value content". YMYL finance topics are held to a higher bar, so cite sources and show a real owner.
- Finance RPMs are high in Canada, but traffic for one calculator will be small. Ads alone will not pay much early.
- Alternatives, in order of fit:
  1. Email list: "We email you when OAS thresholds change." Very on-topic, builds an owned audience. Needs CASL express consent.
  2. Affiliate: robo advisors, online brokers, tax software, fee-only planner directories. Must disclose. Avoid anything that looks like advice.
  3. Sponsorship: one fee-only planner or tax firm per page, clearly labelled.
  4. Premium: paid PDF plan or multi-year clawback planner with spouse splitting.
  5. Ad networks beyond AdSense (Ezoic, Mediavine, Raptive) need much more traffic.
- [built] Roadmap orders these and keeps launch ad-free.

## Compliance
- CRA / financial: [built] Disclaimer on page and separate page: estimate only, not advice, not government. Every figure links to canada.ca and shows "Rules last verified". Do not use the Canada wordmark or anything that suggests government affiliation.
- PIPEDA: [built] No personal data leaves the browser. No cookies. Privacy page draft names a privacy officer (placeholder email) and access/correction rights. Update before adding any tracker.
- Google ad policy and consent: [built] No ads yet. Before AdSense, add a Google certified CMP. Google requires one for EEA/UK/Swiss traffic, and it is good practice for Quebec. ads.txt stays a placeholder until approval. Never place ads where they could be mistaken for calculator buttons or results.
- CASL: needed before any email list. Express consent, sender ID, unsubscribe link.
- AODA / WCAG 2.1 AA: [built] Labels, hints tied to inputs, fieldset/legend for radio group, skip link, 3px focus ring, 44px targets, `lang="en-CA"`, table captions and header scopes, no colour-only meaning, responsive to 320px. AODA website rules legally apply to Ontario organizations with 50+ staff, but following them costs little and helps SEO.
- Quebec Law 25: applies once you collect personal info from Quebec residents (email list, analytics with identifiers). Needs a named privacy officer, published policy, consent before tracking, and privacy impact checks for new tools. A French version is strongly advised.

## Decisions
1. Launch ad-free. Build pages first.
2. JSON plus scraper plus human-merged PR for rule updates.
3. Show official canada.ca figures next to our estimate when they differ.
