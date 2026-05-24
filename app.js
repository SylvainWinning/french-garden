import { phrases, uiText, vocabulary } from "./data.js";

const STORAGE_KEY = "french-garden-progress";
const SUPPORTED_LANGUAGES = new Set(["en", "be"]);
const LEVEL_CATEGORIES = {
  1: new Set(["Greetings", "Politeness", "Basics", "Home"]),
  2: new Set(["Food", "Daily life", "Time", "Feelings", "Directions"]),
  3: new Set(["Health", "Places", "Transport", "Descriptions", "Shopping"]),
};
const CATEGORY_LABELS = {
  en: {
    Basics: "Basics",
    "Daily life": "Daily life",
    Descriptions: "Descriptions",
    Directions: "Directions",
    Feelings: "Feelings",
    Food: "Food",
    Greetings: "Greetings",
    Health: "Health",
    Home: "Home",
    Places: "Places",
    Politeness: "Politeness",
    Shopping: "Shopping",
    Time: "Time",
    Transport: "Transport",
  },
  be: {
    Basics: "Асновы",
    "Daily life": "Штодзённае жыццё",
    Descriptions: "Апісанні",
    Directions: "Напрамкі",
    Feelings: "Пачуцці",
    Food: "Ежа",
    Greetings: "Вітанні",
    Health: "Здароўе",
    Home: "Дом",
    Places: "Месцы",
    Politeness: "Ветлівасць",
    Shopping: "Пакупкі",
    Time: "Час",
    Transport: "Транспарт",
  },
};

const state = {
  uiLanguage: getSavedLanguage(),
  cardIndex: 0,
  levelFilter: "all",
  categoryFilter: "all",
  reviewOnly: false,
  quizItem: null,
  phraseItem: null,
  selectedMatch: null,
  matchedIds: new Set(),
  progress: loadProgress(),
};

const elements = {
  uiLanguage: document.querySelector("#ui-language"),
  score: document.querySelector("#score"),
  streak: document.querySelector("#streak"),
  practiced: document.querySelector("#practiced"),
  reviewCount: document.querySelector("#review-count"),
  levelFilter: document.querySelector("#level-filter"),
  categoryFilter: document.querySelector("#category-filter"),
  reviewFilter: document.querySelector("#review-filter"),
  categoryProgress: document.querySelector("#category-progress"),
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  shuffleCard: document.querySelector("#shuffle-card"),
  flashcard: document.querySelector("#flashcard"),
  cardsCount: document.querySelector("#cards-count"),
  quizCount: document.querySelector("#quiz-count"),
  matchCount: document.querySelector("#match-count"),
  phrasesCount: document.querySelector("#phrases-count"),
  cardLevel: document.querySelector("#card-level"),
  cardCategory: document.querySelector("#card-category"),
  cardFrench: document.querySelector("#card-french"),
  cardTranslation: document.querySelector("#card-translation"),
  previousCard: document.querySelector("#previous-card"),
  nextCard: document.querySelector("#next-card"),
  knowCard: document.querySelector("#know-card"),
  reviewCard: document.querySelector("#review-card"),
  speakCard: document.querySelector("#speak-card"),
  quizWord: document.querySelector("#quiz-word"),
  quizOptions: document.querySelector("#quiz-options"),
  quizFeedback: document.querySelector("#quiz-feedback"),
  matchBoard: document.querySelector("#match-board"),
  resetMatch: document.querySelector("#reset-match"),
  phraseTranslation: document.querySelector("#phrase-translation"),
  phraseText: document.querySelector("#phrase-text"),
  phraseOptions: document.querySelector("#phrase-options"),
  phraseFeedback: document.querySelector("#phrase-feedback"),
  speakPhrase: document.querySelector("#speak-phrase"),
};

init();

function init() {
  elements.uiLanguage.value = state.uiLanguage;
  populateFilters();
  translateInterface();
  renderStats();
  renderProgress();
  renderCard();
  nextQuiz();
  resetMatch();
  nextPhrase();
  bindEvents();
}

function bindEvents() {
  elements.uiLanguage.addEventListener("change", (event) => {
    state.uiLanguage = event.target.value;
    localStorage.setItem("french-garden-language", state.uiLanguage);
    translateInterface();
    populateFilters();
    renderCard();
    nextQuiz();
    resetMatch();
    renderPhrase();
    renderStats();
    renderProgress();
  });

  elements.levelFilter.addEventListener("change", (event) => {
    state.levelFilter = event.target.value;
    resetPracticeViews();
  });

  elements.categoryFilter.addEventListener("change", (event) => {
    state.categoryFilter = event.target.value;
    resetPracticeViews();
  });

  elements.reviewFilter.addEventListener("change", (event) => {
    state.reviewOnly = event.target.checked;
    resetPracticeViews();
  });

  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => showView(tab.dataset.view));
  });

  elements.shuffleCard.addEventListener("click", randomCard);
  elements.previousCard.addEventListener("click", previousCard);
  elements.nextCard.addEventListener("click", nextCard);
  elements.knowCard.addEventListener("click", () => markCard(true));
  elements.reviewCard.addEventListener("click", () => markCard(false));
  elements.speakCard.addEventListener("click", (event) => {
    event.stopPropagation();
    speak(getCurrentCard().french);
  });

  elements.resetMatch.addEventListener("click", resetMatch);
  elements.speakPhrase.addEventListener("click", () => speak(state.phraseItem.text));
}

function translateInterface() {
  document.documentElement.lang = state.uiLanguage;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.title = t(node.dataset.i18nTitle);
  });
}

function showView(viewName) {
  elements.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === viewName);
  });
  elements.views.forEach((view) => {
    view.classList.toggle("active-view", view.id === viewName);
  });
}

function renderStats() {
  elements.score.textContent = state.progress.score;
  elements.streak.textContent = state.progress.streak;
  elements.practiced.textContent = state.progress.practiced.length;
  elements.reviewCount.textContent = getReviewIds().length;
  elements.cardsCount.textContent = countText(
    getPracticeVocabulary().length,
    "cardAvailable",
    "cardsAvailable"
  );
  elements.quizCount.textContent = countText(
    getPracticeVocabulary().length,
    "quizWordAvailable",
    "quizAvailable"
  );
  elements.matchCount.textContent = countText(
    getPracticeVocabulary().length,
    "matchWordAvailable",
    "matchAvailable"
  );
  elements.phrasesCount.textContent = countText(
    phrases.length,
    "phraseAvailable",
    "phrasesAvailable"
  );
}

function renderCard() {
  const pool = getPracticeVocabulary();
  const item = pool[state.cardIndex] || pool[0];
  if (!item) {
    elements.cardLevel.textContent = "";
    elements.cardCategory.textContent = "";
    elements.cardFrench.textContent = t("emptyReview");
    elements.cardTranslation.textContent = "";
    return;
  }
  state.cardIndex = pool.findIndex((word) => word.id === item.id);
  elements.cardLevel.textContent = `${t("level")} ${getWordLevel(item)}`;
  elements.cardCategory.textContent = getCategoryLabel(item.category);
  elements.cardFrench.textContent = item.french;
  elements.cardTranslation.textContent = item.translations[state.uiLanguage];
  markPracticed(item.id);
  renderStats();
  renderProgress();
}

function nextCard() {
  const pool = getPracticeVocabulary();
  state.cardIndex = pool.length ? (state.cardIndex + 1) % pool.length : 0;
  renderCard();
}

function randomCard() {
  const pool = getPracticeVocabulary();
  state.cardIndex = pool.length ? Math.floor(Math.random() * pool.length) : 0;
  renderCard();
}

function previousCard() {
  const pool = getPracticeVocabulary();
  state.cardIndex = pool.length
    ? (state.cardIndex - 1 + pool.length) % pool.length
    : 0;
  renderCard();
}

function nextQuiz() {
  const pool = getPracticeVocabulary();
  state.quizItem = randomItem(pool.length ? pool : vocabulary);
  elements.quizWord.textContent = state.quizItem.french;
  elements.quizFeedback.textContent = "";
  const wrongOptions = shuffle(
    vocabulary
      .filter((item) => item.id !== state.quizItem.id)
      .map((item) => item.translations[state.uiLanguage])
  ).slice(0, 3);
  const options = shuffle([
    state.quizItem.translations[state.uiLanguage],
    ...wrongOptions,
  ]);

  elements.quizOptions.replaceChildren(
    ...options.map((option) => {
      const button = document.createElement("button");
      button.className = "answer-button";
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => answerQuiz(option));
      return button;
    })
  );
}

function answerQuiz(option) {
  const isCorrect = option === state.quizItem.translations[state.uiLanguage];
  elements.quizFeedback.textContent = isCorrect ? t("correct") : t("wrong");
  elements.quizFeedback.className = `feedback ${isCorrect ? "success" : "error"}`;
  updateScore(isCorrect, state.quizItem.id);
  recordAttempt(state.quizItem.id, isCorrect);
  window.setTimeout(nextQuiz, isCorrect ? 850 : 1200);
}

function resetMatch() {
  state.selectedMatch = null;
  state.matchedIds = new Set();
  const pool = getPracticeVocabulary();
  const roundItems = shuffle(pool.length >= 5 ? pool : vocabulary).slice(0, 5);
  const cards = shuffle(
    roundItems.flatMap((item) => [
      { id: item.id, type: "fr", label: item.french },
      {
        id: item.id,
        type: "translation",
        label: item.translations[state.uiLanguage],
      },
    ])
  );

  elements.matchBoard.replaceChildren(
    ...cards.map((card) => {
      const button = document.createElement("button");
      button.className = "match-tile";
      button.type = "button";
      button.textContent = card.label;
      button.dataset.id = card.id;
      button.dataset.type = card.type;
      button.addEventListener("click", () => chooseMatch(button, card));
      return button;
    })
  );
}

function chooseMatch(button, card) {
  if (button.classList.contains("matched")) return;

  if (!state.selectedMatch) {
    state.selectedMatch = { button, card };
    button.classList.add("selected");
    return;
  }

  const first = state.selectedMatch;
  const isPair = first.card.id === card.id && first.card.type !== card.type;

  if (isPair) {
    first.button.classList.add("matched");
    button.classList.add("matched");
    first.button.classList.remove("selected");
    state.matchedIds.add(card.id);
    updateScore(true, card.id);
    recordAttempt(card.id, true);
    speak(card.type === "fr" ? card.label : first.card.label);
  } else {
    button.classList.add("selected", "shake");
    first.button.classList.add("shake");
    updateScore(false, card.id);
    recordAttempt(card.id, false);
    window.setTimeout(() => {
      button.classList.remove("selected", "shake");
      first.button.classList.remove("selected", "shake");
    }, 450);
  }

  state.selectedMatch = null;

  if (state.matchedIds.size === 5) {
    window.setTimeout(resetMatch, 900);
  }
}

function nextPhrase() {
  state.phraseItem = randomItem(phrases);
  renderPhrase();
}

function renderPhrase() {
  const item = state.phraseItem;
  elements.phraseTranslation.textContent = item.translations[state.uiLanguage];
  elements.phraseText.textContent = item.text.replace(item.missing, "_____");
  elements.phraseFeedback.textContent = "";
  elements.phraseOptions.replaceChildren(
    ...shuffle(item.options).map((option) => {
      const button = document.createElement("button");
      button.className = "answer-button";
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => answerPhrase(option));
      return button;
    })
  );
}

function answerPhrase(option) {
  const isCorrect = option === state.phraseItem.missing;
  elements.phraseFeedback.textContent = isCorrect ? t("correct") : t("wrong");
  elements.phraseFeedback.className = `feedback ${isCorrect ? "success" : "error"}`;
  updateScore(isCorrect, state.phraseItem.id);
  if (isCorrect) {
    speak(state.phraseItem.text);
    window.setTimeout(nextPhrase, 1000);
  }
}

function updateScore(isCorrect, id) {
  if (isCorrect) {
    state.progress.score += 10;
    state.progress.streak += 1;
    state.progress.bestStreak = Math.max(
      state.progress.bestStreak,
      state.progress.streak
    );
    markPracticed(id);
  } else {
    state.progress.streak = 0;
  }

  saveProgress();
  renderStats();
}

function markPracticed(id) {
  if (!state.progress.practiced.includes(id)) {
    state.progress.practiced.push(id);
    saveProgress();
    renderStats();
  }
}

function markCard(isKnown) {
  const item = getCurrentCard();
  if (!item) return;

  recordAttempt(item.id, isKnown);
  updateScore(isKnown, item.id);
  nextCard();
}

function recordAttempt(id, isCorrect) {
  const record = state.progress.words[id] || {
    correct: 0,
    wrong: 0,
    needsReview: false,
    lastSeen: null,
  };

  if (isCorrect) {
    record.correct += 1;
    record.needsReview = record.wrong > record.correct;
  } else {
    record.wrong += 1;
    record.needsReview = true;
  }

  record.lastSeen = new Date().toISOString();
  state.progress.words[id] = record;
  saveProgress();
  renderStats();
  renderProgress();
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function loadProgress() {
  const fallback = { score: 0, streak: 0, bestStreak: 0, practiced: [], words: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...fallback, ...saved, words: saved?.words || {} };
  } catch {
    return fallback;
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function t(key) {
  return uiText[state.uiLanguage][key] || uiText.en[key] || key;
}

function getSavedLanguage() {
  const savedLanguage = localStorage.getItem("french-garden-language");
  return SUPPORTED_LANGUAGES.has(savedLanguage) ? savedLanguage : "en";
}

function populateFilters() {
  const categories = [...new Set(vocabulary.map((item) => item.category))].sort();
  elements.levelFilter.replaceChildren(
    option("all", t("allLevels")),
    option("1", t("level1")),
    option("2", t("level2")),
    option("3", t("level3"))
  );
  elements.categoryFilter.replaceChildren(
    option("all", t("allCategories")),
    ...categories.map((category) => option(category, getCategoryLabel(category)))
  );
  elements.levelFilter.value = state.levelFilter;
  elements.categoryFilter.value = state.categoryFilter;
  elements.reviewFilter.checked = state.reviewOnly;
}

function resetPracticeViews() {
  state.cardIndex = 0;
  renderCard();
  nextQuiz();
  resetMatch();
  renderStats();
  renderProgress();
}

function renderProgress() {
  const categories = [...new Set(vocabulary.map((item) => item.category))].sort();
  elements.categoryProgress.replaceChildren(
    ...categories.map((category) => {
      const words = vocabulary.filter((item) => item.category === category);
      const practiced = words.filter((item) =>
        state.progress.practiced.includes(item.id)
      ).length;
      const percent = Math.round((practiced / words.length) * 100);
      const row = document.createElement("div");
      row.className = "progress-row";
      row.innerHTML = `
        <div>
          <strong>${getCategoryLabel(category)}</strong>
          <span>${practiced}/${words.length}</span>
        </div>
        <span class="progress-track"><span style="width: ${percent}%"></span></span>
      `;
      return row;
    })
  );
}

function getPracticeVocabulary() {
  const reviewIds = new Set(getReviewIds());
  const filtered = vocabulary.filter((item) => {
    const levelMatches =
      state.levelFilter === "all" || String(getWordLevel(item)) === state.levelFilter;
    const categoryMatches =
      state.categoryFilter === "all" || item.category === state.categoryFilter;
    const reviewMatches = !state.reviewOnly || reviewIds.has(item.id);
    return levelMatches && categoryMatches && reviewMatches;
  });

  return filtered;
}

function getCurrentCard() {
  const pool = getPracticeVocabulary();
  return pool[state.cardIndex] || pool[0];
}

function getReviewIds() {
  return vocabulary
    .filter((item) => {
      const record = state.progress.words[item.id];
      return record?.needsReview || (record?.wrong || 0) > (record?.correct || 0);
    })
    .map((item) => item.id);
}

function getWordLevel(item) {
  const level = Object.entries(LEVEL_CATEGORIES).find(([, categories]) =>
    categories.has(item.category)
  );
  return Number(level?.[0] || 1);
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[state.uiLanguage]?.[category] || category;
}

function option(value, label) {
  const element = document.createElement("option");
  element.value = value;
  element.textContent = label;
  return element;
}

function countText(count, singularKey, pluralKey) {
  return `${count} ${t(count === 1 ? singularKey : pluralKey)}`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}
