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

## Search and visual pass (2026-10-22)

Search: the title leads with the query people type, "OAS clawback calculator 2026 (Canada)". The description names the recovery tax, net world income, and canada.ca. The lede says which income years sit behind payments from July 2026 to June 2028. Two extra questions match the wording already on the page, and the FAQ schema copies that wording. The visible $93,454 chip is the 2025 income line already published on canada.ca and in the FAQ. No new figure was added.

Canonicals for privacy and disclaimer use `/privacy` and `/disclaimer`, because Cloudflare Pages returns 200 there and redirects the `.html` paths. The sitemap lists those same URLs. The homepage canonical stays `https://retirementmath.ca/`.

The mark is an equals sign: a spruce tile, a cream bar, and a gold bar of the same length. `logo.svg` is the file. The header uses a cream tile so the mark shows on the spruce bar. Favicon and footer use the spruce tile. No extra fonts, no photos, no third-party scripts.

## Truth-seeking pass on a monetization review (2026-10-22)

Checked against the live site and Cloudflare's docs.

Agreed and built:
- Removed the words "Ad slot placeholder" from the page. They were already hidden with CSS, so a normal visit did not show them. They were still in the HTML.
- Added an About page. It names Vikrant in Scarborough and explains the source check. It does not invent a job, a credential, or years of experience.
- Added `404.html`. Without that file, Pages treats the site as a single-page app and serves the homepage with status 200 for missing addresses.
- www.retirementmath.ca was serving its own copy. A `_redirects` rule cannot change the hostname. `functions/_middleware.js` sends www to the apex.
- The result now shows the canada.ca full clawback figure first, then this calculator's own line. The math is unchanged. Hiding our line would make the repayment disagree with the label, because the estimate uses the current quarter's maximum OAS.
- "Rules last verified" is in the HTML. `scripts/build.py` stamps it from `last_verified`.

Not built, on purpose:
- Search Console is already verified. Bing Webmaster Tools needs the owner to sign in. No account was created.
- No email form. A signup would send personal information off the browser and needs a provider, CASL consent, and a privacy update the owner approves first.
- No affiliate links and no applications to Questrade, Qtrade, or Wealthsimple. Payout ranges in the review were not re-checked, and they are not a reason to add links. Superseded on 2026-10-27 for two untagged links after a result. See the ranking section. The payout ranges are still not on the site.
- No AdSense. The earlier decision stands: more useful pages, then a consent tool, then an application.
- No RRIF calculator in this change. It needs CRA factors with sources, tests, and its own page. Income guesses of $50 to $300 a month, or $10 to $50 from ads, are not forecasts and are not on the site.
- No emails to planners.

## Recency pass (2026-10-27)

Four reviewers: plain language, layout, compliance, and search. The check date was buried under the figures table as `2026-10-22`.

Agreed and built:
- The date stays `last_verified` from the rules file. No new field. A clean weekly check does not move that date, so the page does not say "this week" or "always up to date".
- OAS: the third chip repeated the lede ("Stays in your browser"). It now says the figures were checked against canada.ca on 22 October 2026. The form stays where it was. French uses the same chip.
- The sources line uses that same human date. Print hides the chips and keeps the sources line.
- RRIF chips are the calculation, so they stay. A line under the lede says the factors were checked on 22 October 2026, and that the CRA chart page is dated 1 October 2025. French says 1er octobre 2025.
- `scripts/build.py` stamps those lines and the WebPage `dateModified`. The French page had drifted to 2026-10-25.

Not built, on purpose:
- No title change, no meta description change, and no review stars.
- No second warning above the form. The 2026 estimate and the quarterly OAS gap are already in the result, the questions, and the disclaimer.

## Two dates (2026-10-27)

The owner asked for the day of the last successful check and the day a saved figure last changed. Those are `last_checked` and `last_updated` in `data/oas-rules.json`. `last_verified` stays equal to `last_checked`. A clean check moves only the check date. A changed threshold moves both. The RRIF page is not part of that check, so it keeps one date. A Monday with no figure change still opens a pull request for the check date. The live page updates when that pull request is merged.

## Calculator links (2026-10-27)

Three reviewers: task flow, accessibility, and trust. The other calculators were only in the footer. The 22 October note deferred a shared header partial until there were three pages. It did not say the tools had to stay at the bottom.

Agreed and built:
- Every page has a Calculators row in the top bar: OAS clawback calculator, RRIF minimum, and Take-home estimate. French uses the same footer labels: Récupération de la SV, Minimum du FERR, Revenu net estimé.
- The current calculator has `aria-current="page"` and no underline. The other two stay underlined. The gold line is not the only cue.
- The row wraps, each link is at least 44px tall, and the bar is not sticky. The skip link still goes to the form.
- About, Privacy, and Disclaimer stay in the footer, with the three calculators repeated there. The domain stays in the bar.

Not built, on purpose:
- No hamburger, no shared template, and no new pages.
- The result cards do not gain extra hand-off links in this pass.

## Ranking and light monetization (2026-10-27)

The owner asked for ranking and light monetization on the three existing calculators. No new calculator page.

Agreed and built:
- Each calculator already had an H1, a short explanation, a 3 to 8 question FAQ, and FAQ schema that matches the visible questions. OAS keeps its eight accurate questions. RRIF and take-home keep five.
- A visible `Last verified:` line shows the ISO date from the rules file. `scripts/build.py` stamps the `iso-date` class. The human check dates stay.
- OAS and RRIF now have a static sources table. The figure grids that JavaScript fills stay as they were. Take-home already had a sources table. It now has one static worked example: Ontario employment income of $60,000, under 65, take-home $46,242.99. The page says this is the calculator's estimate, not a government example.
- After the result only: the required commission sentence, then TurboTax Canada and Wealthsimple Invest. French uses TurboImpôt and the French Wealthsimple Invest page. `rel="sponsored"` is not set, because the addresses are public pages with no affiliate tag. A click does not pay the site until the owner replaces them.
- Print or save summary uses `window.print()`. Print hides the sponsor block.
- Every footer has one contribution line. The word contribution links to `/about#contribution`, a static note. There is no payment form, pop-up, or image.
- `robots.txt` already allows crawling. The sitemap already lists the three calculator URLs. `lastmod` on the changed URLs is 2026-10-27.
- CSS and JavaScript stay inline. HTML is not minified.

Not built, on purpose:
- No affiliate account, no tracking tag, no ad script, no analytics, and no email gate.
- No new calculator. CPP start age, a full GIS payment, and pension splitting stay parked.
- The OAS on-page links above the form stay as they are.

## Stripe contribution link (2026-10-28)

The owner supplied a Stripe Payment Link. The word contribution now opens https://buy.stripe.com/eVqeVdbTq2Pmdi0aX34sE00. The About note says card details go to Stripe and that there is no tax receipt. The privacy page has the same card sentence in English and French. No Stripe script and no card form were added. The 2026-10-27 note above records the earlier static About link.

## Owner line (2026-10-28)

The owner asked to be named Vik on the public pages, to say he is an experienced IT professional with AI development and related work, and to say the site is run from Toronto, Ontario. The 2026-10-22 About note above records what was true then. The designation sentence now says the site does not claim a tax or financial-planning designation. No employer, year count, or certificate is listed, because none was supplied.
