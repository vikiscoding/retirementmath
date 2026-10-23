// Run on its own, or from tests/test_calc.js. No dependencies.
const fs = require("fs"), path = require("path"), assert = require("assert");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "rrif.html"), "utf8");
const src = html.match(/\/\/ CALC:BEGIN[\s\S]*?\/\/ CALC:END/)[0];
const computeRrifMinimum = new Function(src + "\nreturn computeRrifMinimum;")();
const inline = JSON.parse(html.match(/<script id="rrif-rules" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const rules = JSON.parse(fs.readFileSync(path.join(root, "data/rrif-rules.json"), "utf8"));
assert.deepStrictEqual(inline, rules, "inline RRIF rules are stale: run python3 scripts/build.py");

const cases = [
  ["CRA age 71 on $100,000", { value: 100000, age: 71 }, 5280],
  ["age 70 formula", { value: 100000, age: 70 }, 5000],
  ["age 69 formula rounds cents", { value: 100000, age: 69 }, 4761.9],
  ["age 65 formula", { value: 250000, age: 65 }, 10000],
  ["age 80 chart", { value: 200000, age: 80 }, 13640],
  ["age 95 cap", { value: 100000, age: 95 }, 20000],
  ["age 100 uses 95", { value: 50000, age: 100 }, 10000],
  ["elected younger spouse", { value: 100000, age: 80, spouseAge: 65 }, 4000],
  ["elected older spouse", { value: 100000, age: 71, spouseAge: 80 }, 6820],
  ["opened this year", { value: 100000, age: 71, openedThisYear: true }, 0],
  ["zero value", { value: 0, age: 71 }, 0],
];
let pass = 0;
for (const [name, inp, want] of cases) {
  const r = computeRrifMinimum(rules, inp);
  assert.strictEqual(r.minimum, want, `${name}: got ${r.minimum}, want ${want}`);
  assert.strictEqual(r.monthly, Math.round((r.minimum / 12) * 100) / 100, name + " monthly");
  console.log(`PASS ${name.padEnd(32)} minimum ${r.minimum.toFixed(2).padStart(10)}`);
  pass++;
}
assert.strictEqual(computeRrifMinimum(rules, { value: 100000, age: 71 }).factor, 0.0528);
console.log(`${pass}/${cases.length} RRIF passed`);
