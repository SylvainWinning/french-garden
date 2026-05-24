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
  { id: "pic-hello", category: "Greetings", french: "bonjour", image: svgDataUrl("👋", "#fff0f7"), alt: { en: "hello", be: "прывітанне" } },
  { id: "pic-good-evening", category: "Greetings", french: "bonsoir", image: svgDataUrl("🌙", "#f2f2ff", "#8f8cff"), alt: { en: "good evening", be: "добры вечар" } },
  { id: "pic-goodbye", category: "Greetings", french: "au revoir", image: svgDataUrl("👋", "#eef8ff", "#8ec7ff"), alt: { en: "goodbye", be: "да пабачэння" } },
  { id: "pic-see-you-soon", category: "Greetings", french: "à bientôt", image: svgDataUrl("🔜", "#fff9df", "#ffd76a"), alt: { en: "see you soon", be: "да хуткай сустрэчы" } },
  { id: "pic-thanks", category: "Politeness", french: "merci", image: svgDataUrl("🙏", "#fff4e4", "#d99b4a"), alt: { en: "thanks", be: "дзякуй" } },
  { id: "pic-please", category: "Politeness", french: "s’il te plaît", image: svgDataUrl("🤲", "#e9fff6", "#74d7b2"), alt: { en: "please", be: "калі ласка" } },
  { id: "pic-sorry", category: "Politeness", french: "pardon", image: svgDataUrl("🙇", "#fff0f7", "#ff9ac7"), alt: { en: "sorry", be: "прабач" } },
  { id: "pic-yes", category: "Basics", french: "oui", image: svgDataUrl("✅", "#e9fff6", "#74d7b2"), alt: { en: "yes", be: "так" } },
  { id: "pic-no", category: "Basics", french: "non", image: svgDataUrl("🚫", "#ffe9e9", "#ff6f6f"), alt: { en: "no", be: "не" } },
  { id: "pic-maybe", category: "Basics", french: "peut-être", image: svgDataUrl("❔", "#fff9df", "#ffd76a"), alt: { en: "maybe", be: "магчыма" } },
  { id: "pic-here", category: "Basics", french: "ici", image: svgDataUrl("📍", "#fff9df", "#ffd76a"), alt: { en: "here", be: "тут" } },
  { id: "pic-apple", category: "Food", french: "une pomme", image: svgDataUrl("🍎", "#ffe3f0"), alt: { en: "apple", be: "яблык" } },
  { id: "pic-banana", category: "Food", french: "une banane", image: svgDataUrl("🍌", "#fff0c7", "#ffd76a"), alt: { en: "banana", be: "банан" } },
  { id: "pic-water", category: "Food", french: "de l’eau", image: svgDataUrl("💧", "#e7f5ff", "#8ec7ff"), alt: { en: "water", be: "вада" } },
  { id: "pic-coffee", category: "Food", french: "un café", image: svgDataUrl("☕", "#fff4e4", "#a46c42"), alt: { en: "coffee", be: "кава" } },
  { id: "pic-bread", category: "Food", french: "du pain", image: svgDataUrl("🥖", "#fff7d9", "#d99b4a"), alt: { en: "bread", be: "хлеб" } },
  { id: "pic-cheese", category: "Food", french: "du fromage", image: svgDataUrl("🧀", "#fff2b8", "#ffd76a"), alt: { en: "cheese", be: "сыр" } },
  { id: "pic-house", category: "Home", french: "la maison", image: svgDataUrl("🏠", "#e9fff6", "#74d7b2"), alt: { en: "house", be: "дом" } },
  { id: "pic-bed", category: "Home", french: "le lit", image: svgDataUrl("🛏️", "#eef8ff", "#8ec7ff"), alt: { en: "bed", be: "ложак" } },
  { id: "pic-chair", category: "Home", french: "la chaise", image: svgDataUrl("🪑", "#fff4fb", "#ff9ac7"), alt: { en: "chair", be: "крэсла" } },
  { id: "pic-key", category: "Home", french: "la clé", image: svgDataUrl("🔑", "#fff9df", "#ffd76a"), alt: { en: "key", be: "ключ" } },
  { id: "pic-book", category: "Daily life", french: "le livre", image: svgDataUrl("📘", "#e7f5ff", "#3178c6"), alt: { en: "book", be: "кніга" } },
  { id: "pic-phone", category: "Daily life", french: "le téléphone", image: svgDataUrl("📱", "#f2f2ff", "#8f8cff"), alt: { en: "phone", be: "тэлефон" } },
  { id: "pic-bag", category: "Daily life", french: "le sac", image: svgDataUrl("👜", "#fff0f7", "#ff9ac7"), alt: { en: "bag", be: "сумка" } },
  { id: "pic-ticket", category: "Daily life", french: "le ticket", image: svgDataUrl("🎟️", "#fff9df", "#ffd76a"), alt: { en: "ticket", be: "білет" } },
  { id: "pic-today", category: "Time", french: "aujourd’hui", image: svgDataUrl("📅", "#eef8ff", "#8ec7ff"), alt: { en: "today", be: "сёння" } },
  { id: "pic-tomorrow", category: "Time", french: "demain", image: svgDataUrl("➡️", "#e9fff6", "#74d7b2"), alt: { en: "tomorrow", be: "заўтра" } },
  { id: "pic-morning", category: "Time", french: "le matin", image: svgDataUrl("🌅", "#fff4e4", "#ffd76a"), alt: { en: "morning", be: "раніца" } },
  { id: "pic-evening", category: "Time", french: "le soir", image: svgDataUrl("🌆", "#f2f2ff", "#8f8cff"), alt: { en: "evening", be: "вечар" } },
  { id: "pic-happy", category: "Feelings", french: "content", image: svgDataUrl("😊", "#fff0f7"), alt: { en: "happy", be: "рады" } },
  { id: "pic-tired", category: "Feelings", french: "fatiguée", image: svgDataUrl("😴", "#f2f2ff", "#8f8cff"), alt: { en: "tired", be: "стомленая" } },
  { id: "pic-hungry", category: "Feelings", french: "j’ai faim", image: svgDataUrl("🍽️", "#fff4e4", "#d99b4a"), alt: { en: "hungry", be: "галодная" } },
  { id: "pic-thirsty", category: "Feelings", french: "j’ai soif", image: svgDataUrl("🥤", "#e7f5ff", "#8ec7ff"), alt: { en: "thirsty", be: "хачу піць" } },
  { id: "pic-doctor", category: "Health", french: "le médecin", image: svgDataUrl("🩺", "#eef8ff", "#4a9bd8"), alt: { en: "doctor", be: "доктар" } },
  { id: "pic-medicine", category: "Health", french: "le médicament", image: svgDataUrl("💊", "#e9fff6", "#74d7b2"), alt: { en: "medicine", be: "лекі" } },
  { id: "pic-head", category: "Health", french: "la tête", image: svgDataUrl("🙂", "#fff0f7", "#ff9ac7"), alt: { en: "head", be: "галава" } },
  { id: "pic-stomach", category: "Health", french: "le ventre", image: svgDataUrl("🧍", "#fff4e4", "#d99b4a"), alt: { en: "stomach", be: "жывот" } },
  { id: "pic-park", category: "Places", french: "le parc", image: svgDataUrl("🌳", "#e9fff6", "#3aa36f"), alt: { en: "park", be: "парк" } },
  { id: "pic-pharmacy", category: "Places", french: "la pharmacie", image: svgDataUrl("⚕️", "#eef8ff", "#4a9bd8"), alt: { en: "pharmacy", be: "аптэка" } },
  { id: "pic-shop", category: "Places", french: "le magasin", image: svgDataUrl("🏪", "#fff9df", "#ffd76a"), alt: { en: "shop", be: "крама" } },
  { id: "pic-restaurant", category: "Places", french: "le restaurant", image: svgDataUrl("🍴", "#fff4e4", "#d99b4a"), alt: { en: "restaurant", be: "рэстаран" } },
  { id: "pic-car", category: "Transport", french: "la voiture", image: svgDataUrl("🚗", "#ffe9e9", "#ff6f6f"), alt: { en: "car", be: "машына" } },
  { id: "pic-bus", category: "Transport", french: "le bus", image: svgDataUrl("🚌", "#fff7d9", "#ffd76a"), alt: { en: "bus", be: "аўтобус" } },
  { id: "pic-train", category: "Transport", french: "le train", image: svgDataUrl("🚆", "#e7f5ff", "#8ec7ff"), alt: { en: "train", be: "цягнік" } },
  { id: "pic-left", category: "Directions", french: "à gauche", image: svgDataUrl("⬅️", "#eef8ff", "#8ec7ff"), alt: { en: "left", be: "налева" } },
  { id: "pic-right", category: "Directions", french: "à droite", image: svgDataUrl("➡️", "#fff9df", "#ffd76a"), alt: { en: "right", be: "направа" } },
  { id: "pic-straight", category: "Directions", french: "tout droit", image: svgDataUrl("⬆️", "#e9fff6", "#74d7b2"), alt: { en: "straight ahead", be: "прама" } },
  { id: "pic-near", category: "Directions", french: "près de", image: svgDataUrl("📍", "#fff0f7", "#ff9ac7"), alt: { en: "near", be: "каля" } },
  { id: "pic-small", category: "Descriptions", french: "petit", image: svgDataUrl("🔹", "#e7f5ff", "#3178c6"), alt: { en: "small", be: "маленькі" } },
  { id: "pic-big", category: "Descriptions", french: "grand", image: svgDataUrl("🔷", "#e7f5ff", "#3178c6"), alt: { en: "big", be: "вялікі" } },
  { id: "pic-good", category: "Descriptions", french: "bon", image: svgDataUrl("👍", "#e9fff6", "#74d7b2"), alt: { en: "good", be: "добры" } },
  { id: "pic-beautiful", category: "Descriptions", french: "beau", image: svgDataUrl("💖", "#fff0f7", "#ff6fae"), alt: { en: "beautiful", be: "прыгожы" } },
  { id: "pic-money", category: "Shopping", french: "l’argent", image: svgDataUrl("💶", "#e9fff6", "#74d7b2"), alt: { en: "money", be: "грошы" } },
  { id: "pic-receipt", category: "Shopping", french: "le ticket de caisse", image: svgDataUrl("🧾", "#fff9df", "#d99b4a"), alt: { en: "receipt", be: "чэк" } },
  { id: "pic-price", category: "Shopping", french: "le prix", image: svgDataUrl("🏷️", "#fff4e4", "#d99b4a"), alt: { en: "price", be: "цана" } },
  { id: "pic-card-payment", category: "Shopping", french: "la carte bancaire", image: svgDataUrl("💳", "#eef8ff", "#8ec7ff"), alt: { en: "bank card", be: "банкаўская картка" } },
  { id: "pic-nails", category: "Nail salon", french: "les ongles", image: svgDataUrl("💅", "#fff0f7", "#ff6fae"), alt: { en: "nails", be: "ногці" } },
  { id: "pic-polish", category: "Nail salon", french: "le vernis", image: svgDataUrl("🧴", "#ffe3f0", "#ff6fae"), alt: { en: "nail polish", be: "лак для ногцяў" } },
  { id: "pic-glitter", category: "Nail salon", french: "des paillettes", image: svgDataUrl("✨", "#fff9df", "#ffd76a"), alt: { en: "glitter", be: "бліскаўкі" } },
  { id: "pic-color", category: "Nail salon", french: "la couleur", image: svgDataUrl("🎨", "#eef8ff", "#8ec7ff"), alt: { en: "color", be: "колер" } },
];
