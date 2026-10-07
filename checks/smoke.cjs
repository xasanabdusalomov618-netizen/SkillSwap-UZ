/* REDSTORE DOM smoke test — runs the real app.js against the real index.html DOM (jsdom) */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const root = path.join(__dirname, "..");

(async () => {
  let fail = 0;
  const assert = (cond, msg) => { if (cond) console.log("ok  - " + msg); else { fail++; console.error("FAIL- " + msg); } };

  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const dom = new JSDOM(html, {
    url: "http://localhost/",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    beforeParse(window) {
      window.IntersectionObserver = class { constructor() {} observe() {} unobserve() {} disconnect() {} };
    }
  });
  const { window } = dom;
  const { document } = window;

  /* execute the app's real scripts as classic <script> tags, like a browser does */
  for (const f of ["assets/js/i18n.js", "assets/js/products.js", "assets/js/app.js"]) {
    const s = document.createElement("script");
    s.textContent = fs.readFileSync(path.join(root, f), "utf8");
    document.body.appendChild(s);
  }

  /* jsdom fires DOMContentLoaded asynchronously — wait for the app's init */
  await new Promise((resolve) => {
    if (document.readyState !== "loading") return resolve();
    document.addEventListener("DOMContentLoaded", resolve);
  });

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const click = (el) => el.dispatchEvent(new window.Event("click", { bubbles: true }));

  /* initial render in uz */
  assert($$("#grid .p-card").length === 8, "8 product cards rendered");
  assert(document.title.includes("Noutbuk"), "uz title applied: " + document.title);
  assert($("[data-i18n='hero_t1']").textContent.includes("Orzuyingizdagi"), "uz hero text applied");
  assert($("#cartCount").style.display === "none", "cart count hidden when empty");

  /* category filter */
  click($('.chip[data-cat="gaming"]'));
  assert($$("#grid .p-card").length === 1 && $("#grid .p-card h3").textContent === "Blaze X16 Pro", "gaming filter -> 1 card");
  click($('.chip[data-cat="all"]'));
  assert($$("#grid .p-card").length === 8, "back to all -> 8 cards");

  /* sorting */
  const sort = $("#sort");
  sort.value = "asc";
  sort.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert($("#grid .p-card h3").textContent === "StudyGo 14", "sort asc -> cheapest first");
  sort.value = "pop";
  sort.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert($("#grid .p-card h3").textContent === "Blaze X16 Pro", "sort popular -> Blaze first");

  /* search */
  const search = $("#search");
  search.value = "titan";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert($$("#grid .p-card").length === 1, "search 'titan' -> 1 card");
  search.value = "";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));

  /* add to cart */
  click($("#grid [data-add]"));
  assert($("#cartCount").textContent === "1", "cart count = 1 after add");
  assert($("#grid [data-add]").textContent.includes("Qo'shildi"), "add button shows added state (uz)");

  /* drawer + qty */
  click($("#cartBtn"));
  assert($("#drawer").classList.contains("open"), "drawer opens");
  assert($$("#cartItems .cart-line").length === 1, "1 cart line");
  click($('#cartItems [data-q="1"]'));
  assert($("#cartCount").textContent === "2", "qty + -> count 2");
  assert($("#cartTotal").textContent.replace(/\D/g, "").length > 0, "total rendered: " + $("#cartTotal").textContent);

  /* language switch to ru */
  click($("#langBtn"));
  click($('#langMenu [data-lang="ru"]'));
  assert(document.documentElement.lang === "ru", "html lang = ru");
  assert(document.title.includes("Магазин"), "ru title applied");
  assert($("[data-i18n='hero_cta_shop']").textContent === "Смотреть каталог", "ru hero CTA applied");
  assert($("#cartItems .cl-price").textContent.includes("сум"), "cart price uses ru currency");

  /* language switch to zh + en round trip */
  click($("#langBtn"));
  click($('#langMenu [data-lang="zh"]'));
  assert($("[data-i18n='hero_t1']").textContent.includes("梦想"), "zh hero text applied");
  click($("#langBtn"));
  click($('#langMenu [data-lang="en"]'));
  assert($("[data-i18n='hero_cta_shop']").textContent === "Browse catalog", "en hero CTA applied");

  /* theme toggle */
  click($("#themeBtn"));
  assert(document.documentElement.getAttribute("data-theme") === "dark", "theme switches to dark");
  click($("#themeBtn"));
  assert(document.documentElement.getAttribute("data-theme") === "light", "theme back to light");

  /* countdown running */
  assert(/^\d{2}$/.test($("#cdS").textContent), "countdown seconds ticking: " + $("#cdS").textContent);

  /* checkout clears cart */
  click($("#checkoutBtn"));
  assert($("#cartCount").textContent === "0", "checkout clears cart");

  /* newsletter */
  $("#newsForm").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  assert($("#toast").classList.contains("show"), "newsletter toast shown");

  console.log(fail ? `\n${fail} SMOKE FAILURES` : "\nALL SMOKE TESTS PASSED");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("SMOKE CRASH:", e); process.exit(1); });
