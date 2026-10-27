# Roadmap

## Before launch (owner decisions, nothing done yet)
- [x] Register retirementmath.ca on the main Cloudflare account (vikrant.singh1@outlook.com).
- [x] Host on Cloudflare Pages free tier, account retirementmathai@gmail.com. Project `retirementmath`. Live at https://retirementmath.pages.dev.
- [x] Point retirementmath.ca at the Pages site. https://retirementmath.ca/ serves the calculator.
- [x] Store a Cloudflare Pages API token as the GitHub secret `CLOUDFLARE_API_TOKEN`.
- [x] Verify retirementmath.ca in Google Search Console. Bing Webmaster Tools is not connected. The owner has to sign in and add the site.
- [x] About page names the owner and how figures are checked. No job title or designation is claimed.
- [x] Unknown URLs return 404.html. www.retirementmath.ca redirects to the apex.
- [x] Point sitemap and canonicals at the URLs Pages serves (`/privacy` and `/disclaimer` return 200; the `.html` paths redirect).
- [x] Lawyer or accountant read of disclaimer and privacy page (2026-10-25). The privacy page no longer says the text is an unread draft.
- [x] Use retirementmath.ca in canonical, robots.txt, and sitemap.xml
- [x] French version at /fr/ (calculator, RRIF, about, privacy, disclaimer), with hreflang
- [x] Manual accessibility pass (2026-10-25): keyboard skip target, focus contrast, 320px width, 200% zoom. Checked in a browser with axe. NVDA is not installed on this PC, so a screen reader was not run.
- [x] Weekly rules check is on: `.github/workflows/check-oas-rules.yml`. A slow canada.ca read is retried before the job fails.
- [x] The OAS calculator shows the last canada.ca check and the day a saved figure last changed. The RRIF page shows its own check date.

## Monetization order (see panel review)
1. Launch with no ads. Build content and traffic.
2. Email list for "rules changed" alerts (needs CASL consent and a provider).
3. AdSense after about 15 to 20 useful pages and real traffic, with a Google certified CMP.
4. Affiliate links (robo advisors, tax software) only with clear disclosure.
5. Paid tools later: PDF retirement income plan, multi-year clawback planner.

## Next pages (one HTML file each, same harness)
| Page | Why | Data source |
| --- | --- | --- |
| CPP start age calculator (60 vs 65 vs 70) | High search volume | canada.ca CPP amounts |
| GIS eligibility estimator | Low income seniors, pairs with OAS | ESDC quarterly tables |
| RRIF minimum withdrawal calculator | Built in rrif.html. All other RRIFs only. No tax estimate. | CRA prescribed factors |
| OAS deferral break-even | Natural next step from this page | OAS deferral rules |
| Pension income splitting estimator | Cuts clawback for couples | CRA T1032 rules |
| RRSP to RRIF meltdown planner | Clawback planning | CRA + OAS rules |
| TFSA room calculator | Broad audience | CRA TFSA limits |
| Ontario retiree tax estimator | Local angle | CRA + Ontario rates |

## Calculator improvements
- Use quarter-by-quarter OAS amounts across the July to June period instead of current quarter only
- Show a chart of OAS kept vs income
- Spouse mode with pension splitting
