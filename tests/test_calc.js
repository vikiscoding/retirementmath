// Run: node tests/test_calc.js   (no dependencies)
const fs = require("fs"), path = require("path"), assert = require("assert");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const src = html.match(/\/\/ CALC:BEGIN[\s\S]*?\/\/ CALC:END/)[0];
const computeClawback = new Function(src + "\nreturn computeClawback;")();
const inline = JSON.parse(html.match(/<script id="oas-rules" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const rules = JSON.parse(fs.readFileSync(path.join(root, "data/oas-rules.json"), "utf8"));
assert.deepStrictEqual(inline, rules, "inline rules in index.html are stale: run python3 scripts/build.py");

const base = { age: "65_74", periodId: "2025-income", years: 40, deferMonths: 0 };
const cases = [
  ["below threshold", { income: 80000 }, 0],
  ["at threshold", { income: 93454 }, 0],
  ["canada.ca example $100k", { income: 100000 }, 981.90],
  ["$120k", { income: 120000 }, 3981.90],
  ["$150k", { income: 150000 }, 8481.90],
  ["$200k capped 65-74", { income: 200000 }, 9150.00],
  ["$200k capped 75+", { income: 200000, age: "75_plus" }, 10065.00],
  ["2026 income $100k", { income: 100000, periodId: "2026-income" }, 701.55],
  ["partial 20 yrs $200k", { income: 200000, years: 20 }, 4575.00],
  ["9 yrs not eligible", { income: 200000, years: 9 }, 0],
  ["deferred 60 months $200k", { income: 200000, deferMonths: 60 }, 12444.00],
];
let pass = 0;
for (const [name, inp, want] of cases) {
  const r = computeClawback(rules, { ...base, ...inp });
  assert.strictEqual(r.annualRepayment, want, `${name}: got ${r.annualRepayment}, want ${want}`);
  assert.ok(Math.abs(r.keptAnnual + r.annualRepayment - r.annualOas) < 0.01, name + " kept+repay != oas");
  console.log(`PASS ${name.padEnd(26)} repay ${r.annualRepayment.toFixed(2).padStart(9)}  monthly ${r.monthlyRepayment.toFixed(2).padStart(8)}  kept ${r.keptAnnual.toFixed(2).padStart(9)}  full at ${r.fullClawbackAt}`);
  pass++;
}
console.log(`${pass}/${cases.length} passed`);

const frHtml = fs.readFileSync(path.join(root, "fr/index.html"), "utf8");
const frInline = JSON.parse(frHtml.match(/<script id="oas-rules" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.deepStrictEqual(frInline, rules, "inline rules in fr/index.html are stale: run python3 scripts/build.py");
assert.strictEqual(frHtml.match(/\/\/ CALC:BEGIN[\s\S]*?\/\/ CALC:END/)[0], src, "French OAS calc drifted from index.html");

const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const FR_MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
function humanDate(iso, lang) {
  const [year, month, day] = iso.split("-").map(Number);
  const label = lang === "fr" && day === 1 ? "1er" : String(day);
  return label + " " + (lang === "fr" ? FR_MONTHS : EN_MONTHS)[month - 1] + " " + year;
}
function countTimes(page, css, iso, lang) {
  const needle = '<time class="' + css + '" datetime="' + iso + '">' + humanDate(iso, lang) + "</time>";
  return page.split(needle).length - 1;
}
const rrifHtml = fs.readFileSync(path.join(root, "rrif.html"), "utf8");
const frRrifHtml = fs.readFileSync(path.join(root, "fr/rrif.html"), "utf8");
const rrifRules = JSON.parse(fs.readFileSync(path.join(root, "data/rrif-rules.json"), "utf8"));
assert.strictEqual(rules.last_verified, rules.last_checked, "last_verified mirrors last_checked");
assert.strictEqual(countTimes(html, "verified-date", rules.last_checked, "en"), 2, "OAS check date");
assert.strictEqual(countTimes(html, "updated-date", rules.last_updated, "en"), 2, "OAS update date");
assert.strictEqual(countTimes(frHtml, "verified-date", rules.last_checked, "fr"), 2, "French OAS check date");
assert.strictEqual(countTimes(frHtml, "updated-date", rules.last_updated, "fr"), 2, "French OAS update date");
assert.strictEqual(countTimes(rrifHtml, "verified-date", rrifRules.last_verified, "en"), 2, "RRIF check date");
assert.strictEqual(countTimes(rrifHtml, "source-date", rrifRules.source_page_date, "en"), 2, "RRIF chart date");
assert.strictEqual(countTimes(frRrifHtml, "verified-date", rrifRules.last_verified, "fr"), 2, "French RRIF check date");
assert.strictEqual(countTimes(frRrifHtml, "source-date", rrifRules.source_page_date, "fr"), 2, "French RRIF chart date");
assert.ok(html.includes("Checked against canada.ca on"), "OAS recency chip");
assert.ok(html.includes("Last update found on"), "OAS update chip");
assert.ok(frHtml.includes("Vérifié sur canada.ca le"), "French OAS recency chip");
assert.ok(frHtml.includes("Dernier changement trouvé le"), "French OAS update chip");
assert.ok(!html.includes("Stays in your browser"), "old browser chip should be gone");
assert.strictEqual(html.match(/"@type":"WebPage".*?"dateModified":"([^"]+)"/)[1], rules.last_checked, "dateModified");
assert.strictEqual(frHtml.match(/"@type":"WebPage".*?"dateModified":"([^"]+)"/)[1], rules.last_checked, "French dateModified");
function countIso(page, iso) {
  const needle = '<time class="iso-date" datetime="' + iso + '">' + iso + "</time>";
  return page.split(needle).length - 1;
}
assert.strictEqual(countIso(html, rules.last_checked), 1, "OAS ISO date");
assert.strictEqual(countIso(frHtml, rules.last_checked), 1, "French OAS ISO date");
assert.strictEqual(countIso(rrifHtml, rrifRules.last_verified), 1, "RRIF ISO date");
assert.strictEqual(countIso(frRrifHtml, rrifRules.last_verified), 1, "French RRIF ISO date");
const disclosure = "We may earn a commission if you use these links. The calculator stays free and private.";
const disclosureFr = "Nous pouvons recevoir une commission si vous utilisez ces liens. Le calculateur reste gratuit et privé.";
const pay = "https://buy.stripe.com/eVqeVdbTq2Pmdi0aX34sE00";
const support = 'This site stays free and private. A small optional <a href="' + pay + '" rel="noopener" target="_blank">contribution</a> helps cover hosting.';
const supportFr = 'Ce site reste gratuit et privé. Une petite <a href="' + pay + '" rel="noopener" target="_blank">contribution</a> facultative aide à payer l\'hébergement.';
for (const file of ["index.html", "rrif.html", "take-home.html"]) {
  const page = file === "index.html" ? html : fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(page.includes("Last verified:"), file + " last verified");
  assert.ok(page.includes(disclosure), file + " disclosure");
  assert.ok(page.includes('id="print"'), file + " print");
  assert.ok(page.includes("Print or save summary"), file + " print label");
  assert.ok(page.includes(support), file + " contribution");
  assert.ok(page.includes("<table"), file + " sources table");
}
for (const file of ["fr/index.html", "fr/rrif.html", "fr/take-home.html"]) {
  const page = file === "fr/index.html" ? frHtml : fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(page.includes("Dernière vérification :"), file + " last verified");
  assert.ok(page.includes(disclosureFr), file + " disclosure");
  assert.ok(page.includes("Imprimer ou enregistrer le résumé"), file + " print label");
  assert.ok(page.includes(supportFr), file + " contribution");
}
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
assert.ok(robots.includes("Allow: /"), "robots allow");
assert.ok(sitemap.includes("<loc>https://retirementmath.ca/</loc>"), "sitemap home");
assert.ok(sitemap.includes("<loc>https://retirementmath.ca/rrif</loc>"), "sitemap rrif");
assert.ok(sitemap.includes("<loc>https://retirementmath.ca/take-home</loc>"), "sitemap take-home");
assert.ok(fs.readFileSync(path.join(root, "404.html"), "utf8").includes('href="' + pay + '"'), "404 contribution");
console.log("check dates ok");

const pages = [
  ["index.html", "fr/index.html"],
  ["rrif.html", "fr/rrif.html"],
  ["take-home.html", "fr/take-home.html"],
  ["about.html", "fr/about.html"],
  ["privacy.html", "fr/privacy.html"],
  ["disclaimer.html", "fr/disclaimer.html"],
];
for (const [en, fr] of pages) {
  const enHtml = en === "index.html" ? html : fs.readFileSync(path.join(root, en), "utf8");
  const frPage = en === "index.html" ? frHtml : fs.readFileSync(path.join(root, fr), "utf8");
  assert.ok(enHtml.includes('lang="en-CA"'), en + " lang");
  assert.ok(frPage.includes('lang="fr-CA"'), fr + " lang");
  assert.ok(enHtml.includes('hreflang="fr-CA"'), en + " hreflang");
  assert.ok(frPage.includes('hreflang="en-CA"'), fr + " hreflang");
  assert.ok(enHtml.includes('class="skip"'), en + " skip");
  assert.ok(frPage.includes('class="skip"'), fr + " skip");
  assert.ok(enHtml.includes('aria-label="Calculators"'), en + " calculator nav");
  assert.ok(frPage.includes('aria-label="Calculatrices"'), fr + " calculator nav");
  assert.ok(enHtml.includes(pay), en + " stripe link");
  assert.ok(frPage.includes(pay), fr + " stripe link");
  assert.ok(!enHtml.includes("js.stripe.com"), en + " no stripe script");
  assert.ok(!frPage.includes("js.stripe.com"), fr + " no stripe script");
  assert.ok(enHtml.includes("Run from Toronto, Ontario."), en + " place");
  assert.ok(frPage.includes("Tenu depuis Toronto, en Ontario."), fr + " place");
  assert.ok(!enHtml.includes("Scarborough"), en + " old city");
  assert.ok(!frPage.includes("Scarborough"), fr + " old city");
  assert.ok(!enHtml.includes("Vikrant"), en + " full name");
  assert.ok(!frPage.includes("Vikrant"), fr + " full name");
}
const missing = fs.readFileSync(path.join(root, "404.html"), "utf8");
assert.ok(missing.includes('aria-label="Calculators"'), "404 calculator nav");
assert.ok(missing.includes('href="/rrif"'), "404 RRIF link");
assert.ok(missing.includes("Run from Toronto, Ontario."), "404 place");
const about = fs.readFileSync(path.join(root, "about.html"), "utf8");
const aboutFr = fs.readFileSync(path.join(root, "fr/about.html"), "utf8");
assert.ok(about.includes("Your card details go to Stripe, not to this site."), "about stripe");
assert.ok(about.includes("there is no tax receipt."), "about no receipt");
assert.ok(aboutFr.includes("Les détails de votre carte vont à Stripe, pas à ce site."), "french about stripe");
assert.ok(about.includes("Vik runs the site from Toronto, Ontario."), "about name");
assert.ok(about.includes("experienced IT professional, with credentials in AI development and related work."), "about background");
assert.ok(aboutFr.includes("Vik tient le site depuis Toronto, en Ontario."), "french about name");
assert.ok(aboutFr.includes("professionnel d'expérience en technologies de l'information"), "french about background");
assert.ok(fs.readFileSync(path.join(root, "privacy.html"), "utf8").includes("If you use the contribution link, your card details go to Stripe, not to this site."), "privacy stripe");
assert.ok(fs.readFileSync(path.join(root, "fr/privacy.html"), "utf8").includes("Si vous utilisez le lien de contribution, les détails de votre carte vont à Stripe, pas à ce site."), "french privacy stripe");
assert.ok(fs.readFileSync(path.join(root, "privacy.html"), "utf8").includes("Privacy officer: Vik, Toronto, Ontario."), "privacy officer");
assert.ok(fs.readFileSync(path.join(root, "fr/privacy.html"), "utf8").includes("Personne responsable de la protection des renseignements personnels : Vik, Toronto, Ontario."), "french privacy officer");
console.log("language links ok");
require("./test_rrif.js");
require("./test_take_home.js");
