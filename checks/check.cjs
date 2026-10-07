/* REDSTORE sanity check: i18n key parity, DOM i18n coverage, asset existence */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

const { I18N } = require(path.join(root, "assets/js/i18n.js"));
const { PRODUCTS } = require(path.join(root, "assets/js/products.js"));

let fail = 0;
const err = (m) => { fail++; console.error("FAIL: " + m); };

/* 1. key parity across locales */
const langs = Object.keys(I18N);
const ref = langs[0];
for (const lang of langs) {
  const a = Object.keys(I18N[ref]).sort();
  const b = Object.keys(I18N[lang]).sort();
  const missing = a.filter((k) => !b.includes(k));
  const extra = b.filter((k) => !a.includes(k));
  if (missing.length) err(`${lang} missing keys: ${missing.join(", ")}`);
  if (extra.length) err(`${lang} extra keys: ${extra.join(", ")}`);
  for (const k of b) {
    if (typeof I18N[lang][k] !== "string" || !I18N[lang][k].trim()) err(`${lang}.${k} is empty`);
  }
}
console.log(`locales checked: ${langs.join(", ")} (${Object.keys(I18N[ref]).length} keys each)`);

/* 2. every data-i18n / data-i18n-ph key in index.html exists in all locales */
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const domKeys = new Set();
for (const m of html.matchAll(/data-i18n(?:-ph)?="([^"]+)"/g)) domKeys.add(m[1]);
for (const k of domKeys)
  for (const lang of langs)
    if (!(k in I18N[lang])) err(`index.html uses key "${k}" missing in ${lang}`);
console.log(`dom i18n keys checked: ${domKeys.size}`);

/* 3. product + html image assets exist on disk */
const assets = new Set(PRODUCTS.map((p) => p.img));
assets.add("assets/img/hero-laptop.png");
assets.add("assets/img/lifestyle-desk.png");
for (const m of html.matchAll(/src="(assets\/[^"]+)"/g)) assets.add(m[1]);
for (const a of assets)
  if (!fs.existsSync(path.join(root, a))) err(`missing asset: ${a}`);
console.log(`assets checked: ${assets.size}`);

/* 4. product data integrity */
for (const p of PRODUCTS) {
  if (!(p.price > 0)) err(`product ${p.id}: bad price`);
  if (p.old && p.old <= p.price) err(`product ${p.id}: old price not higher`);
  if (!(p.rating >= 0 && p.rating <= 5)) err(`product ${p.id}: bad rating`);
}
console.log(`products checked: ${PRODUCTS.length}`);

if (fail) { console.error(`\n${fail} check(s) FAILED`); process.exit(1); }
console.log("ALL CHECKS PASSED");
