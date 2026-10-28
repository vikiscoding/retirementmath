# Roadmap

## Before launch (owner decisions, nothing done yet)
- [x] Register retirementmath.ca on the main Cloudflare account (vikrant.singh1@outlook.com).
- [x] Host on Cloudflare Pages free tier, account retirementmathai@gmail.com. Project `retirementmath`. Live at https://retirementmath.pages.dev.
- [x] Point retirementmath.ca at the Pages site. https://retirementmath.ca/ serves the calculator.
- [x] Store a Cloudflare Pages API token as the GitHub secret `CLOUDFLARE_API_TOKEN`.
- [x] Verify retirementmath.ca in Google Search Console. Bing Webmaster Tools is not connected. The owner has to sign in and add the site.
- [x] About page names Vik, an experienced IT professional who builds with AI, and says the site is run from Toronto, Ontario. It does not claim a tax or financial-planning designation.
- [x] Unknown URLs return 404.html. www.retirementmath.ca redirects to the apex.
- [x] Point sitemap and canonicals at the URLs Pages serves (`/privacy` and `/disclaimer` return 200; the `.html` paths redirect).
- [x] Lawyer or accountant read of disclaimer and privacy page (2026-10-25). The privacy page no longer says the text is an unread draft.
- [x] Use retirementmath.ca in canonical, robots.txt, and sitemap.xml
- [x] French version at /fr/ (calculator, RRIF, take-home, about, privacy, disclaimer), with hreflang
- [x] Manual accessibility pass (2026-10-25): keyboard skip target, focus contrast, 320px width, 200% zoom. Checked in a browser with axe. NVDA is not installed on this PC, so a screen reader was not run.
- [x] Weekly rules check is on: `.github/workflows/check-oas-rules.yml`. A slow canada.ca read is retried before the job fails.
- [x] The OAS calculator shows the last canada.ca check and the day a saved figure last changed. The RRIF page shows its own check date.
- [x] Take-home estimate at /take-home, in English and French. One 2026 year: federal and provincial tax, the basic personal amount, and employee CPP or QPP, EI, and QPIP. OAS recovery is a separate line and is not subtracted. GIS is a single-person cutoff check, not a payment. Spouse, children, the Canada child benefit, and the disability credit are not on the page. Figures checked 2026-10-27. No account and no ad scripts.
- [x] Ranking pass on the three calculators (2026-10-27): ISO last-verified line, static worked example, static sources table, FAQ already on the page, privacy sentence, sitemap and robots already allow the three URLs.
- [x] Light monetization on those three calculators only (2026-10-27): print button, footer contribution line to `/about#contribution`, and two unlabeled service links after the result. No new calculator. The links have no affiliate tag.

## Monetization order (see panel review)
The three calculators and the light links above are in place. The site stops there.

1. Launch with no ad scripts. Done.
2. Email list for "rules changed" alerts (needs CASL consent and a provider). Not started.
3. AdSense after about 15 to 20 useful pages and real traffic, with a Google certified CMP. Not started.
4. Tagged affiliate links only after the owner replaces the public TurboTax and Wealthsimple addresses. The disclosure is already on the result.
5. Paid tools later: PDF retirement income plan, multi-year clawback planner. Not started.

## Next pages (parked)

The site stops at the three calculators. These rows stay as a list of ideas. Do not build them in the next change.
| Page | Why | Data source |
| --- | --- | --- |
| CPP start age calculator (60 vs 65 vs 70) | High search volume | canada.ca CPP amounts |
| GIS eligibility estimator | Not built. The take-home page only checks the single-person cutoff. | ESDC quarterly tables |
| RRIF minimum withdrawal calculator | Built in rrif.html. All other RRIFs only. No tax estimate. | CRA prescribed factors |
| Take-home estimate | Built in take-home.html. One year. Basic personal amount only. Employee premiums. OAS recovery is shown and not subtracted. | CRA rates, T4127, Revenu Québec TP-1015.F-V, CPP, EI, QPP, QPIP, GIS |
| OAS deferral break-even | Natural next step from this page | OAS deferral rules |
| Pension income splitting estimator | Cuts clawback for couples | CRA T1032 rules |
| RRSP to RRIF meltdown planner | Clawback planning | CRA + OAS rules |
| TFSA room calculator | Broad audience | CRA TFSA limits |
| Ontario retiree tax estimator | Local angle | CRA + Ontario rates |

## Calculator improvements
- Use quarter-by-quarter OAS amounts across the July to June period instead of current quarter only
- Show a chart of OAS kept vs income
- Spouse mode with pension splitting
