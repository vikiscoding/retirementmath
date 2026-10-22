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
