// Run on its own, or from tests/test_calc.js. No dependencies.
// Ontario $60,000 provincial tax is 2624.53 because the second slice is
// 60000 - 53891 = 6109, then the bracket sum is rounded once.
const fs = require("fs"), path = require("path"), assert = require("assert");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "take-home.html"), "utf8");
const src = html.match(/\/\/ CALC:BEGIN[\s\S]*?\/\/ CALC:END/)[0];
const api = new Function(src + "\nreturn { computeTakeHome: computeTakeHome, ontarioSurtax: ontarioSurtax, ontarioHealth: ontarioHealth, federalBpa: federalBpa, personalAmount: personalAmount };")();
const computeTakeHome = api.computeTakeHome;
const inline = JSON.parse(html.match(/<script id="take-home-rules" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const oasInline = JSON.parse(html.match(/<script id="oas-rules" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const rules = JSON.parse(fs.readFileSync(path.join(root, "data/take-home-rules.json"), "utf8"));
const oasRules = JSON.parse(fs.readFileSync(path.join(root, "data/oas-rules.json"), "utf8"));
assert.deepStrictEqual(inline, rules, "inline take-home rules are stale: run python3 scripts/build.py");
assert.deepStrictEqual(oasInline, oasRules, "inline OAS rules on take-home.html are stale: run python3 scripts/build.py");
const frHtml = fs.readFileSync(path.join(root, "fr/take-home.html"), "utf8");
const frInline = JSON.parse(frHtml.match(/<script id="take-home-rules" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const frOas = JSON.parse(frHtml.match(/<script id="oas-rules" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.deepStrictEqual(frInline, rules, "inline take-home rules in fr/take-home.html are stale: run python3 scripts/build.py");
assert.deepStrictEqual(frOas, oasRules, "inline OAS rules in fr/take-home.html are stale: run python3 scripts/build.py");
assert.strictEqual(frHtml.match(/\/\/ CALC:BEGIN[\s\S]*?\/\/ CALC:END/)[0], src, "French take-home calc drifted from take-home.html");

const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const clawSrc = indexHtml.match(/\/\/ CALC:BEGIN[\s\S]*?\/\/ CALC:END/)[0];
const computeClawback = new Function(clawSrc + "\nreturn computeClawback;")();

function run(extra) {
  return computeTakeHome(rules, oasRules, Object.assign({
    province: "ON", income: 60000, period: "annual", kind: "employment", age: "under_65"
  }, extra));
}
function eq(name, got, want) {
  assert.strictEqual(got, want, name + ": got " + got + ", want " + want);
}

const on60 = run({});
eq("ON 60000 federal", on60.federalBasic, 6192.73);
eq("ON 60000 provincial basic", on60.provincialBasic, 2624.53);
eq("ON 60000 surtax", on60.ontarioSurtax, 0);
eq("ON 60000 health", on60.ontarioHealth, 600);
eq("ON 60000 reduction", on60.ontarioReduction, 0);
eq("ON 60000 CPP", on60.cpp, 3361.75);
eq("ON 60000 EI", on60.ei, 978);
eq("ON 60000 QPIP", on60.qpip, 0);
eq("ON 60000 take-home", on60.takeHome, 46242.99);
assert.strictEqual(on60.oas, null, "under 65 has no OAS line");

const qc60 = run({ province: "QC" });
eq("QC abatement", qc60.quebecAbatement, 1021.80);
eq("QC federal net", qc60.federalNet, 5170.93);
eq("QC tax", qc60.provincialBasic, 6029.47);
eq("QC QPP", qc60.cpp, 3559.50);
eq("QC EI", qc60.ei, 780);
eq("QC QPIP", qc60.qpip, 258);
eq("QC take-home", qc60.takeHome, 44202.10);

const pension = run({ kind: "pension", age: "65_74" });
eq("pension CPP", pension.cpp, 0);
eq("pension EI", pension.ei, 0);
eq("pension QPIP", pension.qpip, 0);
eq("pension subtracted", pension.subtracted, 9417.26);
eq("pension take-home", pension.takeHome, 50582.74);
eq("pension OAS recovery", pension.oas.annualRepayment, 0);
assert.strictEqual(pension.gis.underSingleCutoff, false);

const low = run({ income: 15000 });
eq("15000 federal", low.federalBasic, 0);
eq("15000 provincial net", low.provincialNet, 0);
eq("15000 reduction", low.ontarioReduction, 101.56);
eq("15000 CPP", low.cpp, 684.25);
eq("15000 EI", low.ei, 244.50);
eq("15000 take-home", low.takeHome, 14071.25);

const edge = run({ income: 20000 });
eq("20000 provincial basic", edge.provincialBasic, 354.06);
eq("20000 reduction", edge.ontarioReduction, 245.94);
eq("20000 provincial net", edge.provincialNet, 108.12);
eq("20000 health", edge.ontarioHealth, 0);

const maxed = run({ income: 100000 });
eq("CPP at 100000", maxed.cpp, 4646.45);
eq("EI at 100000", maxed.ei, 1123.07);
const tiny = run({ income: 3000 });
eq("CPP at 3000", tiny.cpp, 0);
eq("EI at 3000", tiny.ei, 48.90);
eq("zero income", run({ income: 0 }).takeHome, 0);

const monthly = run({ income: 5000, period: "monthly" });
eq("monthly annualized", monthly.annual, 60000);
eq("monthly take-home", monthly.takeHome, on60.takeHome);

const bc = run({ province: "BC" });
eq("BC 60000 provincial", bc.provincialBasic, 2822.28);
eq("BC 60000 take-home", bc.takeHome, 46645.24);

eq("federal BPA at phase start", api.federalBpa(rules, 181440), 16452);
eq("federal BPA at phase end", api.federalBpa(rules, 258482), 14829);
eq("federal BPA at 200000", api.federalBpa(rules, 200000), 16061.01);
const mb = rules.provinces.filter(function (p) { return p.code === "MB"; })[0];
const yt = rules.provinces.filter(function (p) { return p.code === "YT"; })[0];
eq("Manitoba BPA at 200000", api.personalAmount(rules, mb.bpa, 200000), 15780);
eq("Manitoba BPA at 300000", api.personalAmount(rules, mb.bpa, 300000), 7890);
eq("Manitoba BPA at 400000", api.personalAmount(rules, mb.bpa, 400000), 0);
eq("Yukon BPA follows federal", api.personalAmount(rules, yt.bpa, 200000), 16061.01);

const on = rules.provinces.filter(function (p) { return p.code === "ON"; })[0];
eq("surtax at first threshold", api.ontarioSurtax(on.surtax, 5818), 0);
eq("surtax in first band", api.ontarioSurtax(on.surtax, 6000), 36.40);
eq("surtax at second threshold", api.ontarioSurtax(on.surtax, 7446), 325.60);
eq("surtax in second band", api.ontarioSurtax(on.surtax, 8000), 635.84);
eq("health at 20000", api.ontarioHealth(on.health_premium, 20000), 0);
eq("health at 25000", api.ontarioHealth(on.health_premium, 25000), 300);
eq("health at 60000", api.ontarioHealth(on.health_premium, 60000), 600);
eq("health at 100000", api.ontarioHealth(on.health_premium, 100000), 750);
eq("health at 250000", api.ontarioHealth(on.health_premium, 250000), 900);

for (var i = 0; i < rules.provinces.length; i++) {
  const code = rules.provinces[i].code;
  const row = run({ province: code });
  assert.ok(row.takeHome > 0 && row.takeHome < 60000, code + " take-home");
  assert.ok(row.cpp > 0, code + " pension contribution");
  assert.strictEqual(row.ei > 0, true, code + " EI");
  assert.strictEqual(row.qpip > 0, code === "QC", code + " QPIP");
  const retired = run({ province: code, kind: "pension" });
  eq(code + " pension skips CPP", retired.cpp, 0);
  eq(code + " pension skips EI", retired.ei, 0);
  eq(code + " pension skips QPIP", retired.qpip, 0);
}

const oasLine = run({ income: 100000, age: "65_74", kind: "pension" });
const claw = computeClawback(oasRules, { age: "65_74", periodId: "2026-income", years: 40, deferMonths: 0, income: 100000 });
eq("OAS recovery matches clawback", oasLine.oas.annualRepayment, claw.annualRepayment);
eq("OAS recovery at 100000", oasLine.oas.annualRepayment, 701.55);
eq("OAS used", oasLine.oas.annualOas, 9150);
assert.strictEqual(oasLine.gis.underSingleCutoff, false);
const older = run({ income: 100000, age: "75_plus", kind: "pension" });
const claw75 = computeClawback(oasRules, { age: "75_plus", periodId: "2026-income", years: 40, deferMonths: 0, income: 100000 });
eq("OAS 75+ matches clawback", older.oas.annualRepayment, claw75.annualRepayment);
eq("OAS 75+ amount", older.oas.annualOas, 10065);
assert.strictEqual(run({ income: 23111, age: "65_74", kind: "pension" }).gis.underSingleCutoff, true);
assert.strictEqual(run({ income: 23112, age: "65_74", kind: "pension" }).gis.underSingleCutoff, false);

function throws(extra, message) {
  assert.throws(function () { run(extra); }, function (err) { return err && err.message === message; });
}
throws({ province: "XX" }, "bad province");
throws({ income: -1 }, "bad income");
throws({ period: "weekly" }, "bad period");
throws({ kind: "business" }, "bad kind");
throws({ age: "80" }, "bad age");
assert.throws(function () { api.personalAmount(rules, { type: "nope" }, 1); }, function (err) { return err.message === "bad bpa"; });
const missingPeriod = JSON.parse(JSON.stringify(rules));
missingPeriod.oas_period_id = "missing";
assert.throws(function () {
  computeTakeHome(missingPeriod, oasRules, { province: "ON", income: 100000, period: "annual", kind: "pension", age: "65_74" });
}, function (err) { return err.message === "missing oas period"; });

assert.strictEqual(rules.last_checked, "2026-10-27");
assert.strictEqual(rules.last_verified, rules.last_checked);
assert.ok(html.includes("Kill criteria for /take-home"));
assert.ok(html.includes("Figures last checked against official sources on"));
assert.strictEqual(html.split('<time class="verified-date" datetime="2026-10-27">27 October 2026</time>').length - 1, 2);
assert.strictEqual(frHtml.split('<time class="verified-date" datetime="2026-10-27">27 octobre 2026</time>').length - 1, 2);
assert.strictEqual(html.match(/"@type":"WebPage".*?"dateModified":"([^"]+)"/)[1], "2026-10-27");
assert.strictEqual(frHtml.match(/"@type":"WebPage".*?"dateModified":"([^"]+)"/)[1], "2026-10-27");
["$16,452", "$13,094", "$4,230.45", "$23,112", "16.5%"].forEach(function (needle) {
  assert.ok(html.includes(needle), needle);
});
["16 452 $", "13 094 $", "4 230,45 $", "23 112 $", "16,5 %"].forEach(function (needle) {
  assert.ok(frHtml.includes(needle), needle);
});
assert.ok(html.includes("<noscript>"));
assert.ok(frHtml.includes("<noscript>"));
assert.ok(!html.includes("localStorage"));
assert.ok(!frHtml.includes("localStorage"));

const enPages = ["index.html", "rrif.html", "about.html", "privacy.html", "disclaimer.html", "take-home.html"];
enPages.forEach(function (page) {
  assert.ok(fs.readFileSync(path.join(root, page), "utf8").includes(">Take-home estimate</a>"), page + " nav");
});
["fr/index.html", "fr/rrif.html", "fr/about.html", "fr/privacy.html", "fr/disclaimer.html", "fr/take-home.html"].forEach(function (page) {
  assert.ok(fs.readFileSync(path.join(root, page), "utf8").includes(">Revenu net estimé</a>"), page + " nav");
});
assert.ok(fs.readFileSync(path.join(root, "404.html"), "utf8").includes('href="/take-home"'));
assert.ok(fs.readFileSync(path.join(root, "sitemap.xml"), "utf8").includes("https://retirementmath.ca/take-home"));
assert.ok(fs.readFileSync(path.join(root, ".github/workflows/deploy.yml"), "utf8").includes("take-home.html"));
console.log("take-home passed");
