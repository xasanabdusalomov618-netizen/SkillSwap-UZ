/* REDSTORE product catalog data */
const PRODUCTS = [
  { id: "blaze-x16",  name: "Blaze X16 Pro",   cat: "gaming",      img: "assets/img/p-gaming.png",
    specs: "RTX 4070 · Ryzen 9 · 32GB · 1TB",   price: 14990000, old: 17490000, rating: 4.9, reviews: 214, pop: 97 },
  { id: "airbook-14", name: "AirBook 14",      cat: "ultra",       img: "assets/img/p-ultra.png",
    specs: "Core i7 · 16GB · 512GB · 1.2 kg",   price: 9490000,  old: 10900000, rating: 4.8, reviews: 156, pop: 93 },
  { id: "creator-16", name: "CreatorPro 16",   cat: "creator",     img: "assets/img/p-creator.png",
    specs: "RTX 4080 · 4K OLED · 64GB · 2TB",   price: 18990000, old: 21500000, rating: 4.9, reviews: 98,  pop: 88 },
  { id: "bizline-15", name: "BizLine 15",      cat: "business",    img: "assets/img/p-business.png",
    specs: "Core i5 · 16GB · 512GB · TPM",      price: 7290000,  old: 0,        rating: 4.7, reviews: 183, pop: 84 },
  { id: "flexpad-13", name: "FlexPad 13",      cat: "2in1",        img: "assets/img/p-2in1.png",
    specs: "Touch · 360° · Stylus · 16GB",      price: 8990000,  old: 9990000,  rating: 4.6, reviews: 77,  pop: 79 },
  { id: "studygo-14", name: "StudyGo 14",      cat: "student",     img: "assets/img/p-student.png",
    specs: "Ryzen 5 · 8GB · 256GB · 1.4 kg",    price: 4990000,  old: 5890000,  rating: 4.5, reviews: 342, pop: 95 },
  { id: "titan-ws17", name: "Titan WS 17",     cat: "creator",     img: "assets/img/p-workstation.png",
    specs: "RTX 5000 Ada · Xeon · 128GB",       price: 24990000, old: 0,        rating: 5.0, reviews: 41,  pop: 72 },
  { id: "airbook-16", name: "AirBook 16 Ultra", cat: "ultra",      img: "assets/img/hero-laptop.png",
    specs: "Core Ultra 9 · 32GB · 1TB · OLED",  price: 12490000, old: 13900000, rating: 4.8, reviews: 121, pop: 90 }
];
const DEAL_ID = "blaze-x16";
if (typeof module !== "undefined") module.exports = { PRODUCTS, DEAL_ID };
