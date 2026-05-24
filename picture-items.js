const svgDataUrl = (emoji, background, accent = "#ff6fae") => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" role="img">
      <rect width="320" height="240" rx="28" fill="${background}" />
      <circle cx="264" cy="42" r="26" fill="#fffafc" opacity=".8" />
      <circle cx="54" cy="196" r="34" fill="${accent}" opacity=".22" />
      <text x="160" y="148" text-anchor="middle" dominant-baseline="middle" font-size="112">${emoji}</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const pictureItems = [
  { id: "pic-apple", french: "une pomme", image: svgDataUrl("🍎", "#ffe3f0"), alt: { en: "apple", be: "яблык" } },
  { id: "pic-banana", french: "une banane", image: svgDataUrl("🍌", "#fff0c7", "#ffd76a"), alt: { en: "banana", be: "банан" } },
  { id: "pic-water", french: "de l’eau", image: svgDataUrl("💧", "#e7f5ff", "#8ec7ff"), alt: { en: "water", be: "вада" } },
  { id: "pic-coffee", french: "un café", image: svgDataUrl("☕", "#fff4e4", "#a46c42"), alt: { en: "coffee", be: "кава" } },
  { id: "pic-bread", french: "du pain", image: svgDataUrl("🥖", "#fff7d9", "#d99b4a"), alt: { en: "bread", be: "хлеб" } },
  { id: "pic-cheese", french: "du fromage", image: svgDataUrl("🧀", "#fff2b8", "#ffd76a"), alt: { en: "cheese", be: "сыр" } },
  { id: "pic-house", french: "la maison", image: svgDataUrl("🏠", "#e9fff6", "#74d7b2"), alt: { en: "house", be: "дом" } },
  { id: "pic-bed", french: "le lit", image: svgDataUrl("🛏️", "#eef8ff", "#8ec7ff"), alt: { en: "bed", be: "ложак" } },
  { id: "pic-chair", french: "la chaise", image: svgDataUrl("🪑", "#fff4fb", "#ff9ac7"), alt: { en: "chair", be: "крэсла" } },
  { id: "pic-key", french: "la clé", image: svgDataUrl("🔑", "#fff9df", "#ffd76a"), alt: { en: "key", be: "ключ" } },
  { id: "pic-book", french: "le livre", image: svgDataUrl("📘", "#e7f5ff", "#3178c6"), alt: { en: "book", be: "кніга" } },
  { id: "pic-phone", french: "le téléphone", image: svgDataUrl("📱", "#f2f2ff", "#8f8cff"), alt: { en: "phone", be: "тэлефон" } },
  { id: "pic-car", french: "la voiture", image: svgDataUrl("🚗", "#ffe9e9", "#ff6f6f"), alt: { en: "car", be: "машына" } },
  { id: "pic-bus", french: "le bus", image: svgDataUrl("🚌", "#fff7d9", "#ffd76a"), alt: { en: "bus", be: "аўтобус" } },
  { id: "pic-train", french: "le train", image: svgDataUrl("🚆", "#e7f5ff", "#8ec7ff"), alt: { en: "train", be: "цягнік" } },
  { id: "pic-pharmacy", french: "la pharmacie", image: svgDataUrl("💊", "#e9fff6", "#74d7b2"), alt: { en: "pharmacy", be: "аптэка" } },
  { id: "pic-park", french: "le parc", image: svgDataUrl("🌳", "#e9fff6", "#3aa36f"), alt: { en: "park", be: "парк" } },
  { id: "pic-doctor", french: "le médecin", image: svgDataUrl("🩺", "#eef8ff", "#4a9bd8"), alt: { en: "doctor", be: "доктар" } },
];
