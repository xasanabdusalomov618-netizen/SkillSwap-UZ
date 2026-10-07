# SkillSwap-UZ → REDSTORE 💻

Noutbuk va kompyuterlar savdosi uchun bir sahifali do'kon — **REDSTORE**.

## Xususiyatlar

- **Qizil va oq** rang palitrasi, **liquid glass** (suyuq shisha) va **soft UI** dizayn
- **Tun / kun** rejimi (avtomatik aniqlash + almashtirish tugmasi)
- **4 til**: O'zbekcha 🇺🇿 · Русский 🇷🇺 · English 🇬🇧 · 中文 🇨🇳
- Katalog: kategoriya filtri, saralash, qidiruv
- Savatcha (localStorage'da saqlanadi), chegirmalar, kun taklifi va countdown
- Noutbuk savdosiga oid AI-generatsiya qilingan rasmlar

## Ishga tushirish

```bash
python3 -m http.server 8000 --bind 0.0.0.0
# yoki istalgan statik server bilan
```

So'ng brauzerda `http://localhost:8000` ni oching.

## Tekshiruvlar

```bash
npm i            # jsdom (tekshiruvlar uchun)
node checks/check.cjs   # i18n kalitlar pariteti, DOM qamrovi, assetlar
node checks/smoke.cjs   # real app.js ni jsdom DOM'ida smoke-test
```

## Tuzilma

```
index.html            sahifa
assets/css/style.css  liquid glass / soft UI, tun-kun mavzulari
assets/js/i18n.js     4 tilli lug'at (87 kalit)
assets/js/products.js mahsulotlar katalogi
assets/js/app.js      mantiq (til, mavzu, savat, filtr, countdown)
assets/img/           noutbuk rasmlari
checks/               tekshiruv skriptlari
```
