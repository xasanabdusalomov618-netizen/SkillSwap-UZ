/* ============ REDSTORE app logic ============ */
(function () {
  "use strict";

  var LOCALES = { uz: "uz-UZ", ru: "ru-RU", en: "en-US", zh: "zh-CN" };
  var LANG_TAG = { uz: "🇺🇿 UZ", ru: "🇷🇺 RU", en: "🇬🇧 EN", zh: "🇨🇳 ZH" };
  var CAT_KEY = { gaming: "cat_gaming", ultra: "cat_ultra", business: "cat_business", creator: "cat_creator", "2in1": "cat_2in1", student: "cat_student" };

  var state = {
    lang: localStorage.getItem("rs-lang") || "uz",
    cart: {},
    wish: {},
    cat: "all",
    sort: "pop",
    q: ""
  };
  try { state.cart = JSON.parse(localStorage.getItem("rs-cart") || "{}"); } catch (e) {}
  try { state.wish = JSON.parse(localStorage.getItem("rs-wish") || "{}"); } catch (e) {}

  function $(id) { return document.getElementById(id); }
  function t(key) { return (I18N[state.lang] && I18N[state.lang][key]) || I18N.uz[key] || key; }
  function money(n) {
    return new Intl.NumberFormat(LOCALES[state.lang], { maximumFractionDigits: 0 }).format(n) + " " + t("cur");
  }
  function save() {
    localStorage.setItem("rs-cart", JSON.stringify(state.cart));
    localStorage.setItem("rs-wish", JSON.stringify(state.wish));
    localStorage.setItem("rs-lang", state.lang);
  }

  /* ---------- i18n ---------- */
  function applyLang(lang) {
    state.lang = lang;
    document.documentElement.lang = lang;
    document.title = t("title");
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
    $("langCur").textContent = LANG_TAG[lang];
    document.querySelectorAll("#langMenu button").forEach(function (b) {
      b.classList.toggle("sel", b.getAttribute("data-lang") === lang);
    });
    renderProducts();
    renderCart();
    save();
  }

  /* ---------- theme ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    $("themeBtn").textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("rs-theme", theme);
  }

  /* ---------- products ---------- */
  function currentProducts() {
    var list = PRODUCTS.slice();
    if (state.cat !== "all") list = list.filter(function (p) { return p.cat === state.cat; });
    if (state.q) {
      var q = state.q.toLowerCase();
      list = list.filter(function (p) { return (p.name + " " + p.specs).toLowerCase().indexOf(q) !== -1; });
    }
    if (state.sort === "asc") list.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === "desc") list.sort(function (a, b) { return b.price - a.price; });
    else list.sort(function (a, b) { return b.pop - a.pop; });
    return list;
  }

  function renderProducts() {
    var grid = $("grid");
    var list = currentProducts();
    if (!list.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px">🔍 —</div>';
      return;
    }
    grid.innerHTML = list.map(function (p) {
      var off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
      var inCart = state.cart[p.id];
      return '' +
        '<article class="p-card glass reveal in">' +
          '<div class="p-media">' +
            '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy">' +
            (off ? '<span class="p-badge">−' + off + '%</span>' : '') +
            '<button class="p-wish' + (state.wish[p.id] ? " on" : "") + '" data-wish="' + p.id + '" aria-label="wishlist">' + (state.wish[p.id] ? "❤️" : "🤍") + '</button>' +
          '</div>' +
          '<div class="p-body">' +
            '<span class="p-cat">' + t(CAT_KEY[p.cat]) + '</span>' +
            '<h3>' + p.name + '</h3>' +
            '<div class="p-specs">' + p.specs + '</div>' +
            '<div class="p-rate">★ ' + p.rating.toFixed(1) + ' <span>(' + p.reviews + ')</span></div>' +
            '<div class="p-foot">' +
              '<div class="p-price">' + (p.old ? "<s>" + money(p.old) + "</s>" : "") + "<b>" + money(p.price) + "</b></div>" +
              '<button class="btn btn-primary p-add" data-add="' + p.id + '">' + (inCart ? t("prod_added") : t("prod_add")) + '</button>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join("");
  }

  /* ---------- cart ---------- */
  function cartCount() {
    return Object.keys(state.cart).reduce(function (s, id) { return s + state.cart[id]; }, 0);
  }
  function cartTotal() {
    return Object.keys(state.cart).reduce(function (s, id) {
      var p = PRODUCTS.find(function (x) { return x.id === id; });
      return s + (p ? p.price * state.cart[id] : 0);
    }, 0);
  }
  function renderCart() {
    var ids = Object.keys(state.cart);
    $("cartCount").textContent = cartCount();
    $("cartCount").style.display = cartCount() ? "grid" : "none";
    var box = $("cartItems");
    if (!ids.length) {
      box.innerHTML = '<div class="cart-empty"><div class="big">🛒</div><b>' + t("cart_empty") + '</b><p>' + t("cart_empty_d") + "</p></div>";
      $("drawerFoot").style.display = "none";
      return;
    }
    $("drawerFoot").style.display = "block";
    box.innerHTML = ids.map(function (id) {
      var p = PRODUCTS.find(function (x) { return x.id === id; });
      if (!p) return "";
      return '<div class="cart-line glass">' +
        '<img src="' + p.img + '" alt="' + p.name + '">' +
        '<div class="cl-info"><b>' + p.name + '</b><span class="cl-price">' + money(p.price) + '</span></div>' +
        '<div class="qty"><button data-q="-1" data-id="' + id + '">−</button><span>' + state.cart[id] + '</span><button data-q="1" data-id="' + id + '">+</button></div>' +
      '</div>';
    }).join("");
    $("cartTotal").textContent = money(cartTotal());
  }
  function addToCart(id) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    save(); renderCart(); renderProducts(); toast(t("toast_added"));
  }
  function changeQty(id, d) {
    state.cart[id] = (state.cart[id] || 0) + d;
    if (state.cart[id] <= 0) { delete state.cart[id]; toast(t("toast_removed")); }
    save(); renderCart(); renderProducts();
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  /* ---------- drawer ---------- */
  function openDrawer(open) {
    $("drawer").classList.toggle("open", open);
    $("scrim").classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  /* ---------- countdown ---------- */
  function tick() {
    var now = new Date();
    var end = new Date(now); end.setHours(24, 0, 0, 0);
    var d = Math.max(0, end - now);
    var s = Math.floor(d / 1000);
    $("cdD").textContent = String(Math.floor(s / 86400)).padStart(2, "0");
    $("cdH").textContent = String(Math.floor(s / 3600) % 24).padStart(2, "0");
    $("cdM").textContent = String(Math.floor(s / 60) % 60).padStart(2, "0");
    $("cdS").textContent = String(s % 60).padStart(2, "0");
  }

  /* ---------- wiring ---------- */
  function init() {
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");
    applyLang(state.lang);
    tick(); setInterval(tick, 1000);

    $("themeBtn").addEventListener("click", function () {
      applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });

    $("langBtn").addEventListener("click", function (e) {
      e.stopPropagation(); $("langMenu").classList.toggle("open");
    });
    document.addEventListener("click", function () { $("langMenu").classList.remove("open"); });
    $("langMenu").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-lang]");
      if (b) { applyLang(b.getAttribute("data-lang")); $("langMenu").classList.remove("open"); }
    });

    $("chips").addEventListener("click", function (e) {
      var c = e.target.closest(".chip"); if (!c) return;
      state.cat = c.getAttribute("data-cat");
      document.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("active", x === c); });
      renderProducts();
    });

    $("sort").addEventListener("change", function (e) { state.sort = e.target.value; renderProducts(); });
    $("search").addEventListener("input", function (e) { state.q = e.target.value.trim(); renderProducts(); });

    $("grid").addEventListener("click", function (e) {
      var add = e.target.closest("[data-add]");
      if (add) { addToCart(add.getAttribute("data-add")); return; }
      var w = e.target.closest("[data-wish]");
      if (w) {
        var id = w.getAttribute("data-wish");
        state.wish[id] = !state.wish[id];
        save(); renderProducts();
      }
    });

    $("cartBtn").addEventListener("click", function () { openDrawer(true); });
    $("drawerClose").addEventListener("click", function () { openDrawer(false); });
    $("scrim").addEventListener("click", function () { openDrawer(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") openDrawer(false); });

    $("cartItems").addEventListener("click", function (e) {
      var b = e.target.closest("[data-q]");
      if (b) changeQty(b.getAttribute("data-id"), parseInt(b.getAttribute("data-q"), 10));
    });
    $("clearBtn").addEventListener("click", function () {
      state.cart = {}; save(); renderCart(); renderProducts(); toast(t("toast_removed"));
    });
    $("checkoutBtn").addEventListener("click", function () {
      state.cart = {}; save(); renderCart(); renderProducts(); openDrawer(false); toast(t("toast_checkout"));
    });

    $("dealBtn").addEventListener("click", function () { addToCart(DEAL_ID); openDrawer(true); });

    $("newsForm").addEventListener("submit", function (e) {
      e.preventDefault(); toast(t("news_ok")); e.target.reset();
    });

    /* reveal on scroll */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

    /* scrollspy */
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          document.querySelectorAll(".nav-links a").forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ["home", "catalog", "features", "reviews", "contact"].forEach(function (id) {
      var el = $(id); if (el) spy.observe(el);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
