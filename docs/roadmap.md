# Roadmap

## Before launch (owner decisions, nothing done yet)
- [x] Register retirementmath.ca on the main Cloudflare account (vikrant.singh1@outlook.com).
- [x] Host on Cloudflare Pages free tier, account retirementmathai@gmail.com. Project `retirementmath`. Live at https://retirementmath.pages.dev.
- [ ] On the main account, add proxied CNAME records so the domain serves the Pages site: `@` and `www` both point at `retirementmath.pages.dev`.
- [ ] Create a Cloudflare API token on the gmail account (Account, Cloudflare Pages, Edit) and store it as the GitHub secret `CLOUDFLARE_API_TOKEN`. Until then, a push cannot publish.
- [ ] Lawyer or accountant read of disclaimer and privacy page
- [x] Use retirementmath.ca in canonical, robots.txt, and sitemap.xml
- [ ] French version (needed for Quebec reach and Law 25 good practice)
- [ ] Manual accessibility pass: keyboard only, NVDA, 200% zoom, 320px width
- [ ] Turn on the rules check workflow in the real repo

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
| RRIF minimum withdrawal calculator | Every RRIF holder at 71+ | CRA prescribed factors |
| OAS deferral break-even | Natural next step from this page | OAS deferral rules |
| Pension income splitting estimator | Cuts clawback for couples | CRA T1032 rules |
| RRSP to RRIF meltdown planner | Clawback planning | CRA + OAS rules |
| TFSA room calculator | Broad audience | CRA TFSA limits |
| Ontario retiree tax estimator | Local angle | CRA + Ontario rates |

## Calculator improvements
- Use quarter-by-quarter OAS amounts across the July to June period instead of current quarter only
- Show a chart of OAS kept vs income
- Spouse mode with pension splitting
