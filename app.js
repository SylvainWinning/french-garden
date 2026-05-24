import { phrases, uiText, vocabulary } from "./data.js";

const STORAGE_KEY = "french-garden-progress";
const SUPPORTED_LANGUAGES = new Set(["en", "be"]);

const state = {
  uiLanguage: getSavedLanguage(),
  cardIndex: 0,
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
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  shuffleCard: document.querySelector("#shuffle-card"),
  flashcard: document.querySelector("#flashcard"),
  cardCategory: document.querySelector("#card-category"),
  cardFrench: document.querySelector("#card-french"),
  cardTranslation: document.querySelector("#card-translation"),
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
  translateInterface();
  renderStats();
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
    renderCard();
    nextQuiz();
    resetMatch();
    renderPhrase();
  });

  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => showView(tab.dataset.view));
  });

  elements.shuffleCard.addEventListener("click", nextCard);
  elements.flashcard.addEventListener("click", nextCard);
  elements.speakCard.addEventListener("click", (event) => {
    event.stopPropagation();
    speak(vocabulary[state.cardIndex].french);
  });

  elements.resetMatch.addEventListener("click", resetMatch);
  elements.speakPhrase.addEventListener("click", () => speak(state.phraseItem.text));
}

function translateInterface() {
  document.documentElement.lang = state.uiLanguage;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
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
}

function renderCard() {
  const item = vocabulary[state.cardIndex];
  elements.cardCategory.textContent = item.category;
  elements.cardFrench.textContent = item.french;
  elements.cardTranslation.textContent = item.translations[state.uiLanguage];
  markPracticed(item.id);
}

function nextCard() {
  state.cardIndex = (state.cardIndex + 1) % vocabulary.length;
  renderCard();
}

function nextQuiz() {
  state.quizItem = randomItem(vocabulary);
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
  window.setTimeout(nextQuiz, isCorrect ? 850 : 1200);
}

function resetMatch() {
  state.selectedMatch = null;
  state.matchedIds = new Set();
  const roundItems = shuffle(vocabulary).slice(0, 5);
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
    speak(card.type === "fr" ? card.label : first.card.label);
  } else {
    button.classList.add("selected", "shake");
    first.button.classList.add("shake");
    updateScore(false, card.id);
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

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function loadProgress() {
  const fallback = { score: 0, streak: 0, practiced: [] };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
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

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}
