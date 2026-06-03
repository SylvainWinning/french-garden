import { phrases, pictureItems, situations, uiText, vocabulary } from "./data.js?v=20260525-mystery-rewards";
import { createUsageTracker } from "./tracker.js?v=20260525-test-toggle";

const STORAGE_KEY = "french-garden-progress-clean-start-20260524-tracker-reset";
const TEST_MODE_KEY = "french-garden-codex-test-mode";
const TEST_MODE_TOAST_KEY = "french-garden-codex-test-toast";
const SUPPORTED_LANGUAGES = new Set(["en", "be"]);
const HERO_PHOTOS = [
  "./assets/hero/hero-1.jpg",
  "./assets/hero/hero-2.jpg",
  "./assets/hero/hero-3.jpg",
  "./assets/hero/hero-4.jpg",
  "./assets/hero/hero-5.jpg",
  "./assets/hero/hero-6.jpg",
  "./assets/hero/hero-7.jpg",
  "./assets/hero/hero-8.jpg",
  "./assets/hero/hero-9.jpg",
  "./assets/hero/hero-10.jpg",
];
const REWARD_MILESTONES = [
  {
    id: "kiss-20",
    answers: 20,
    image: "./assets/rewards/reward-1.jpg",
    reward: { en: "a kiss from Sylvain", be: "пацалунак ад Сільвэна" },
  },
  {
    id: "hug-45",
    answers: 45,
    image: "./assets/rewards/reward-5.jpg",
    reward: { en: "a big hug from Sylvain", be: "моцныя абдымкі ад Сільвэна" },
  },
  {
    id: "tea-75",
    answers: 75,
    image: "./assets/rewards/reward-6.jpg",
    reward: { en: "tea together", be: "гарбата разам" },
  },
  {
    id: "dessert-110",
    answers: 110,
    image: "./assets/rewards/reward-3.jpg",
    reward: { en: "a dessert chosen by her", be: "дэсерт, які яна выбірае" },
  },
  {
    id: "movie-150",
    answers: 150,
    image: "./assets/rewards/reward-7.jpg",
    reward: { en: "a movie night together", be: "вечар кіно разам" },
  },
  {
    id: "walk-200",
    answers: 200,
    image: "./assets/rewards/reward-4.jpg",
    reward: { en: "a sweet walk together", be: "мілая прагулка разам" },
  },
  {
    id: "date-275",
    answers: 275,
    image: "./assets/rewards/reward-2.jpg",
    reward: { en: "a little date planned by Sylvain", be: "маленькае спатканне ад Сільвэна" },
  },
];
const LEVEL_CATEGORIES = {
  1: new Set(["Greetings", "Politeness", "Basics", "Home"]),
  2: new Set(["Food", "Daily life", "Time", "Feelings", "Directions"]),
  3: new Set(["Health", "Places", "Transport", "Descriptions", "Shopping", "Nail salon"]),
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
    "Nail salon": "Nail salon",
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
    "Nail salon": "Салон манікюру",
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
  recentQuizIds: [],
  recentPictureIds: [],
  quizItem: null,
  pictureItem: null,
  phraseItem: null,
  selectedMatch: null,
  matchedIds: new Set(),
  matchRoundSize: 0,
  activeReward: null,
  todaySession: null,
  progress: loadProgress(),
};

const tracker = createUsageTracker({
  getLanguage: () => state.uiLanguage,
  getStats: () => ({
    score: state.progress.score,
    correctAnswers: state.progress.correctAnswers,
    practicedCount: state.progress.practiced.length,
    reviewCount: getReviewIds().length,
  }),
});

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
  heroPhoto: document.querySelector("#hero-photo"),
  rewardList: document.querySelector("#reward-list"),
  rewardModal: document.querySelector("#reward-modal"),
  rewardImage: document.querySelector("#reward-image"),
  rewardModalTitle: document.querySelector("#reward-modal-title"),
  rewardModalText: document.querySelector("#reward-modal-text"),
  rewardCopy: document.querySelector("#reward-copy"),
  rewardClose: document.querySelector("#reward-close"),
  rewardHelper: document.querySelector("#reward-helper"),
  testModeToggle: document.querySelector("#codex-test-mode"),
  testModeToast: document.querySelector("#codex-test-toast"),
  todayStart: document.querySelector("#today-start"),
  todaySession: document.querySelector("#today-session"),
  todayProgressLabel: document.querySelector("#today-progress-label"),
  todayProgressBar: document.querySelector("#today-progress-bar"),
  todayCard: document.querySelector("#today-card"),
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  shuffleCard: document.querySelector("#shuffle-card"),
  flashcard: document.querySelector("#flashcard"),
  cardLevel: document.querySelector("#card-level"),
  cardCategory: document.querySelector("#card-category"),
  cardFrench: document.querySelector("#card-french"),
  cardTranslation: document.querySelector("#card-translation"),
  previousCard: document.querySelector("#previous-card"),
  nextCard: document.querySelector("#next-card"),
  knowCard: document.querySelector("#know-card"),
  reviewCard: document.querySelector("#review-card"),
  quizWord: document.querySelector("#quiz-word"),
  quizOptions: document.querySelector("#quiz-options"),
  quizFeedback: document.querySelector("#quiz-feedback"),
  matchBoard: document.querySelector("#match-board"),
  matchFrenchRow: document.querySelector("#match-french-row"),
  matchMeaningRow: document.querySelector("#match-meaning-row"),
  resetMatch: document.querySelector("#reset-match"),
  pictureImage: document.querySelector("#picture-image"),
  pictureOptions: document.querySelector("#picture-options"),
  pictureFeedback: document.querySelector("#picture-feedback"),
  phraseTranslation: document.querySelector("#phrase-translation"),
  phraseText: document.querySelector("#phrase-text"),
  phraseOptions: document.querySelector("#phrase-options"),
  phraseFeedback: document.querySelector("#phrase-feedback"),
  situationsBoard: document.querySelector("#situations-board"),
};

init();

function init() {
  setRandomHeroPhoto();
  elements.uiLanguage.value = state.uiLanguage;
  populateFilters();
  translateInterface();
  renderStats();
  renderProgress();
  renderRewards();
  renderTodaySession();
  renderCard();
  nextQuiz();
  nextPicture();
  resetMatch();
  nextPhrase();
  renderSituations();
  renderTestModeToggle();
  showPendingTestModeToast();
  bindEvents();
  tracker.track("session_start");
  tracker.startHeartbeat();
}

function setRandomHeroPhoto() {
  elements.heroPhoto.src = randomItem(HERO_PHOTOS);
}

function toggleTestMode() {
  const enabled = !isTestModeEnabled();
  try {
    localStorage.setItem(TEST_MODE_KEY, enabled ? "on" : "off");
    if (enabled) sessionStorage.setItem(TEST_MODE_TOAST_KEY, "on");
  } catch {
    // Test mode only labels private tracking events.
  }
  renderTestModeToggle();
  if (!enabled) showTestModeToast(false);
  if (enabled) window.location.reload();
}

function isTestModeEnabled() {
  try {
    return localStorage.getItem(TEST_MODE_KEY) === "on";
  } catch {
    return false;
  }
}

function renderTestModeToggle() {
  const enabled = isTestModeEnabled();
  elements.testModeToggle.classList.toggle("is-active", enabled);
  elements.testModeToggle.setAttribute("aria-pressed", String(enabled));
  elements.testModeToggle.title = enabled ? "Codex test mode on" : "Codex test mode off";
}

function showTestModeToast(enabled) {
  elements.testModeToast.textContent = enabled ? "Mode test Codex activé" : "Mode test Codex désactivé";
  elements.testModeToast.classList.add("is-visible");
  window.setTimeout(() => {
    elements.testModeToast.classList.remove("is-visible");
  }, 2200);
}

function showPendingTestModeToast() {
  try {
    if (sessionStorage.getItem(TEST_MODE_TOAST_KEY) !== "on") return;
    sessionStorage.removeItem(TEST_MODE_TOAST_KEY);
    showTestModeToast(true);
  } catch {
    // The visual confirmation is helpful but not required.
  }
}

function bindEvents() {
  elements.uiLanguage.addEventListener("change", (event) => {
    state.uiLanguage = event.target.value;
    localStorage.setItem("french-garden-language", state.uiLanguage);
    translateInterface();
    populateFilters();
    renderCard();
    nextQuiz();
    renderPicture();
    resetMatch();
    renderPhrase();
    renderSituations();
    renderStats();
    renderProgress();
    renderRewards();
    renderTodaySession();
  });

  elements.levelFilter.addEventListener("change", (event) => {
    state.levelFilter = event.target.value;
    resetTodaySession();
    populateCategoryFilter();
    resetPracticeViews();
  });

  elements.categoryFilter.addEventListener("change", (event) => {
    state.categoryFilter = event.target.value;
    resetTodaySession();
    resetPracticeViews();
  });

  elements.reviewFilter.addEventListener("change", (event) => {
    state.reviewOnly = event.target.checked;
    resetTodaySession();
    resetPracticeViews();
  });

  elements.testModeToggle.addEventListener("click", toggleTestMode);
  elements.todayStart.addEventListener("click", startTodaySession);

  elements.rewardCopy.addEventListener("click", copyActiveRewardImage);
  elements.rewardClose.addEventListener("click", closeRewardModal);
  elements.rewardModal.addEventListener("click", (event) => {
    if (event.target === elements.rewardModal) closeRewardModal();
  });

  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => showView(tab.dataset.view));
  });

  elements.shuffleCard.addEventListener("click", randomCard);
  elements.previousCard.addEventListener("click", previousCard);
  elements.nextCard.addEventListener("click", nextCard);
  elements.knowCard.addEventListener("click", () => markCard(true));
  elements.reviewCard.addEventListener("click", () => markCard(false));

  elements.resetMatch.addEventListener("click", resetMatch);
}

function translateInterface() {
  document.documentElement.lang = state.uiLanguage;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.title = t(node.dataset.i18nTitle);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  renderRewards();
  if (state.activeReward) showRewardModal(state.activeReward);
}

function showView(viewName) {
  let activeTab = null;
  elements.tabs.forEach((tab) => {
    const isActive = tab.dataset.view === viewName;
    tab.classList.toggle("active", isActive);
    if (isActive) activeTab = tab;
  });
  elements.views.forEach((view) => {
    view.classList.toggle("active-view", view.id === viewName);
  });
  ensureActiveTabVisible(activeTab);
}

function ensureActiveTabVisible(tab) {
  if (!tab) return;
  window.requestAnimationFrame(() => {
    tab.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    });
  });
}

function renderStats() {
  elements.score.textContent = state.progress.score;
  elements.streak.textContent = state.progress.correctAnswers;
  elements.practiced.textContent = state.progress.practiced.length;
  elements.reviewCount.textContent = getReviewIds().length;
}

function resetTodaySession() {
  state.todaySession = null;
  renderTodaySession();
}

function startTodaySession() {
  const steps = buildTodaySteps();
  state.todaySession = {
    steps,
    index: 0,
    correct: 0,
    wrong: 0,
    scoreStart: state.progress.score,
    complete: false,
  };
  renderTodaySession();
}

function buildTodaySteps() {
  const vocabularyPool = getTodayVocabularyPool();
  const picturePool = getTodayPicturePool();
  const phrasePool = getTodayPhrasePool();
  const reviewIds = new Set(getReviewIds());
  const used = new Set();
  const steps = [];

  const takeVocabulary = (preferReview = false) => {
    const item = vocabularyPool.find(
      (word) => !used.has(`vocabulary:${word.id}`) && (!preferReview || reviewIds.has(word.id))
    );
    if (!item) return null;
    used.add(`vocabulary:${item.id}`);
    return item;
  };
  const takePicture = () => {
    const item = picturePool.find((picture) => !used.has(`picture:${picture.id}`));
    if (!item) return null;
    used.add(`picture:${item.id}`);
    return item;
  };
  const takePhrase = () => {
    const item = phrasePool.find((phrase) => !used.has(`phrase:${phrase.id}`));
    if (!item) return null;
    used.add(`phrase:${item.id}`);
    return item;
  };
  const addStep = (step) => {
    if (step && steps.length < 7) steps.push(step);
  };

  addStep(createTodayCardStep(takeVocabulary(true) || takeVocabulary()));
  addStep(createTodayQuizStep(takeVocabulary()));
  addStep(createTodayPictureStep(takePicture()));
  addStep(createTodayPhraseStep(takePhrase()));
  addStep(createTodayQuizStep(takeVocabulary()));
  addStep(createTodayPhraseStep(takePhrase()));
  addStep(createTodayPictureStep(takePicture()));

  while (steps.length < 5) {
    const next =
      createTodayQuizStep(takeVocabulary()) ||
      createTodayPictureStep(takePicture()) ||
      createTodayPhraseStep(takePhrase());
    if (!next) break;
    addStep(next);
  }

  return steps;
}

function createTodayCardStep(item) {
  if (!item) return null;
  return { type: "card", item, progressId: item.id };
}

function createTodayQuizStep(item) {
  if (!item) return null;
  const answerCount = getAnswerOptionCount(item);
  return {
    type: "quiz",
    item,
    progressId: item.id,
    answer: item.translations[state.uiLanguage],
    options: shuffle([
      item.translations[state.uiLanguage],
      ...getDistractorTranslations(item, answerCount - 1),
    ]),
  };
}

function createTodayPictureStep(item) {
  if (!item) return null;
  return {
    type: "picture",
    item,
    progressId: getVocabularyIdByFrench(item.french),
    answer: item.french,
    options: shuffle([
      item.french,
      ...getPictureDistractorPool(item)
        .filter((picture) => picture.id !== item.id)
        .slice(0, getPictureOptionCount(item) - 1)
        .map((picture) => picture.french),
    ]),
  };
}

function createTodayPhraseStep(item) {
  if (!item) return null;
  return {
    type: "phrase",
    item,
    progressId: item.id,
    answer: item.missing,
    options: shuffle(item.options),
  };
}

function renderTodaySession() {
  const session = state.todaySession;
  elements.todayStart.hidden = Boolean(session && !session.complete && session.steps.length);
  elements.todaySession.hidden = !session;

  if (!session) return;

  if (!session.steps.length) {
    elements.todayProgressLabel.textContent = t("todayEmptyTitle");
    elements.todayProgressBar.style.width = "0%";
    elements.todayCard.replaceChildren(createTodayEmptyState());
    return;
  }

  if (session.complete) {
    renderTodaySummary();
    return;
  }

  const current = session.index + 1;
  const total = session.steps.length;
  const completed = session.index + (session.steps[session.index]?.answered ? 1 : 0);
  elements.todayProgressLabel.textContent = formatText(t("todayProgressLabel"), {
    current,
    total,
  });
  elements.todayProgressBar.style.width = `${Math.round((completed / total) * 100)}%`;
  renderTodayStep(session.steps[session.index]);
}

function renderTodayStep(step) {
  elements.todayCard.replaceChildren();

  const heading = document.createElement("div");
  heading.className = "today-card-heading";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = t(`today${capitalize(step.type)}Label`);
  const title = document.createElement("h3");
  title.textContent = getTodayStepTitle(step);
  const prompt = document.createElement("p");
  prompt.textContent = getTodayStepPrompt(step);
  heading.append(eyebrow, title, prompt);
  elements.todayCard.append(heading);

  if (step.type === "picture") {
    const image = document.createElement("img");
    image.className = "today-picture";
    image.src = step.item.image;
    image.alt = step.item.alt[state.uiLanguage] || step.item.alt.en;
    elements.todayCard.append(image);
  }

  if (step.type === "card") {
    const actions = document.createElement("div");
    actions.className = "today-actions";
    actions.append(
      createTodayAnswerButton(t("knowButton"), "know", step),
      createTodayAnswerButton(t("reviewButton"), "review", step)
    );
    elements.todayCard.append(actions);
  } else {
    const options = document.createElement("div");
    options.className = "option-grid";
    options.replaceChildren(
      ...step.options.map((optionText) => createTodayAnswerButton(optionText, optionText, step))
    );
    elements.todayCard.append(options);
  }

  if (step.answered) renderTodayFeedback(step);
}

function createTodayAnswerButton(label, value, step) {
  const button = document.createElement("button");
  button.className = "answer-button";
  button.type = "button";
  button.textContent = label;
  button.disabled = Boolean(step.answered);
  if (step.answered && value === step.selected) button.classList.add("is-selected");
  button.addEventListener("click", () => answerTodayStep(value));
  return button;
}

function renderTodayFeedback(step) {
  const feedback = document.createElement("p");
  feedback.className = `feedback ${step.correct ? "success" : "error"}`;
  feedback.textContent = step.correct
    ? getSuccessMessage()
    : formatText(t("todayCorrectAnswer"), { answer: getTodayStepAnswer(step) });

  const nextButton = document.createElement("button");
  nextButton.className = "primary-button";
  nextButton.type = "button";
  nextButton.textContent =
    state.todaySession.index === state.todaySession.steps.length - 1
      ? t("todayFinishButton")
      : t("todayNextButton");
  nextButton.addEventListener("click", nextTodayStep);

  elements.todayCard.append(feedback, nextButton);
}

function answerTodayStep(value) {
  const session = state.todaySession;
  const step = session?.steps[session.index];
  if (!step || step.answered) return;

  const isCorrect = step.type === "card" ? value === "know" : value === step.answer;
  step.answered = true;
  step.selected = value;
  step.correct = isCorrect;
  if (isCorrect) session.correct += 1;
  else session.wrong += 1;

  updateScore(isCorrect, step.progressId);
  recordAttempt(step.progressId, isCorrect);
  trackAnswer("today", step.progressId, isCorrect);
  renderTodaySession();
  if (isCorrect) celebrate(elements.todayCard.querySelector(".feedback"));
}

function nextTodayStep() {
  const session = state.todaySession;
  if (!session) return;

  if (session.index >= session.steps.length - 1) {
    session.complete = true;
  } else {
    session.index += 1;
  }
  renderTodaySession();
}

function renderTodaySummary() {
  const session = state.todaySession;
  const total = session.steps.length;
  const gained = state.progress.score - session.scoreStart;
  const missedLabels = session.steps
    .filter((step) => step.answered && !step.correct)
    .map(getTodayStepAnswer)
    .filter(uniqueValue());

  elements.todayProgressLabel.textContent = t("todayCompleteLabel");
  elements.todayProgressBar.style.width = "100%";
  elements.todayCard.replaceChildren();

  const title = document.createElement("h3");
  title.textContent = t("todaySummaryTitle");
  const stats = document.createElement("p");
  stats.className = "today-summary-stat";
  stats.textContent = formatText(t("todaySummaryStats"), {
    correct: session.correct,
    total,
    score: gained,
  });
  const review = document.createElement("p");
  review.className = "today-summary-review";
  review.textContent = missedLabels.length
    ? formatText(t("todaySummaryReview"), { items: missedLabels.join(", ") })
    : t("todaySummaryClean");
  const button = document.createElement("button");
  button.className = "primary-button";
  button.type = "button";
  button.textContent = t("todayPracticeAgain");
  button.addEventListener("click", startTodaySession);

  elements.todayCard.append(title, stats, review, button);
}

function createTodayEmptyState() {
  const wrapper = document.createElement("div");
  wrapper.className = "today-empty";
  const title = document.createElement("h3");
  title.textContent = t("todayEmptyTitle");
  const copy = document.createElement("p");
  copy.textContent = t("todayEmptyCopy");
  const button = document.createElement("button");
  button.className = "secondary-button";
  button.type = "button";
  button.textContent = t("todayPracticeAgain");
  button.addEventListener("click", startTodaySession);
  wrapper.append(title, copy, button);
  return wrapper;
}

function getTodayStepTitle(step) {
  if (step.type === "phrase") return step.item.text.replace(step.item.missing, "_____");
  if (step.type === "picture") return t("picturesPrompt");
  return step.item.french;
}

function getTodayStepPrompt(step) {
  if (step.type === "card") return step.item.translations[state.uiLanguage];
  if (step.type === "quiz") return t("quizPrompt");
  if (step.type === "picture") return step.item.alt[state.uiLanguage] || step.item.alt.en;
  return step.item.translations[state.uiLanguage];
}

function getTodayStepAnswer(step) {
  if (step.type === "card" || step.type === "quiz") {
    return step.item.translations[state.uiLanguage] || step.item.translations.en;
  }
  if (step.type === "picture") return step.item.french;
  return step.item.missing;
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
  if (!pool.length) {
    state.quizItem = null;
    elements.quizWord.textContent = state.reviewOnly ? t("emptyReview") : t("emptyPractice");
    elements.quizFeedback.textContent = "";
    elements.quizFeedback.className = "feedback";
    elements.quizOptions.replaceChildren();
    return;
  }

  state.quizItem = pickWithoutRecent(pool, state.recentQuizIds);
  rememberRecent(state.recentQuizIds, state.quizItem.id);
  elements.quizWord.textContent = state.quizItem.french;
  elements.quizFeedback.textContent = "";
  const answerCount = getAnswerOptionCount(state.quizItem);
  const wrongOptions = getDistractorTranslations(state.quizItem, answerCount - 1);
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
  if (!state.quizItem) return;

  const isCorrect = option === state.quizItem.translations[state.uiLanguage];
  updateScore(isCorrect, state.quizItem.id);
  elements.quizFeedback.textContent = isCorrect ? getSuccessMessage() : t("wrong");
  elements.quizFeedback.className = `feedback ${isCorrect ? "success" : "error"}`;
  recordAttempt(state.quizItem.id, isCorrect);
  trackAnswer("quiz", state.quizItem.id, isCorrect);
  if (isCorrect) celebrate(elements.quizFeedback);
  if (isCorrect) window.setTimeout(nextQuiz, 850);
}

function nextPicture() {
  const pool = getPracticePictures();
  if (!pool.length) {
    state.pictureItem = null;
    elements.pictureImage.removeAttribute("src");
    elements.pictureImage.alt = "";
    elements.pictureImage.classList.add("is-empty");
    elements.pictureFeedback.textContent = "";
    elements.pictureFeedback.className = "feedback";
    elements.pictureOptions.replaceChildren(createEmptyState());
    return;
  }

  state.pictureItem = pickWithoutRecent(pool, state.recentPictureIds);
  rememberRecent(state.recentPictureIds, state.pictureItem.id);
  renderPicture();
}

function renderPicture() {
  const item = state.pictureItem;
  if (!item) return;

  elements.pictureImage.classList.remove("is-empty");
  elements.pictureImage.src = item.image;
  elements.pictureImage.alt = item.alt[state.uiLanguage] || item.alt.en;
  elements.pictureFeedback.textContent = "";
  elements.pictureFeedback.className = "feedback";

  const wrongOptions = getPictureDistractorPool(item)
    .filter((picture) => picture.id !== item.id)
    .slice(0, getPictureOptionCount(item) - 1)
    .map((picture) => picture.french);
  const options = shuffle([item.french, ...wrongOptions]);

  elements.pictureOptions.replaceChildren(
    ...options.map((optionText) => {
      const button = document.createElement("button");
      button.className = "answer-button";
      button.type = "button";
      button.textContent = optionText;
      button.addEventListener("click", () => answerPicture(optionText));
      return button;
    })
  );
}

function answerPicture(optionText) {
  if (!state.pictureItem) return;

  const isCorrect = optionText === state.pictureItem.french;
  const progressId = getVocabularyIdByFrench(state.pictureItem.french);
  updateScore(isCorrect, progressId);
  elements.pictureFeedback.textContent = isCorrect ? getSuccessMessage() : t("wrong");
  elements.pictureFeedback.className = `feedback ${isCorrect ? "success" : "error"}`;
  recordAttempt(progressId, isCorrect);
  trackAnswer("picture", progressId, isCorrect);
  if (isCorrect) celebrate(elements.pictureFeedback);
  if (isCorrect) window.setTimeout(nextPicture, 850);
}

function resetMatch() {
  state.selectedMatch = null;
  state.matchedIds = new Set();
  const pool = getPracticeVocabulary();
  if (!pool.length) {
    state.matchRoundSize = 0;
    elements.matchFrenchRow.replaceChildren(createEmptyState());
    elements.matchMeaningRow.replaceChildren();
    return;
  }

  const roundItems = shuffle(pool).slice(0, Math.min(5, pool.length));
  state.matchRoundSize = roundItems.length;
  const frenchCards = shuffle(
    roundItems.map((item) => ({ id: item.id, type: "fr", label: item.french }))
  );
  const meaningCards = shuffle(
    roundItems.map((item) => ({
      id: item.id,
      type: "translation",
      label: item.translations.en,
    }))
  );

  elements.matchFrenchRow.replaceChildren(...frenchCards.map(createMatchTile));
  elements.matchMeaningRow.replaceChildren(...meaningCards.map(createMatchTile));
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
    trackAnswer("match", card.id, true);
    celebrate(button);
  } else {
    button.classList.add("selected", "shake");
    first.button.classList.add("shake");
    updateScore(false, card.id);
    recordAttempt(card.id, false);
    trackAnswer("match", card.id, false);
    window.setTimeout(() => {
      button.classList.remove("selected", "shake");
      first.button.classList.remove("selected", "shake");
    }, 450);
  }

  state.selectedMatch = null;

  if (state.matchedIds.size === state.matchRoundSize) {
    window.setTimeout(resetMatch, 900);
  }
}

function createMatchTile(card) {
  const button = document.createElement("button");
  button.className = `match-tile match-tile-${card.type}`;
  button.type = "button";
  button.textContent = card.label;
  button.dataset.id = card.id;
  button.dataset.type = card.type;
  button.addEventListener("click", () => chooseMatch(button, card));
  return button;
}

function nextPhrase() {
  const pool = getPracticePhrases();
  state.phraseItem = pool.length ? randomItem(pool) : null;
  renderPhrase();
}

function renderPhrase() {
  const item = state.phraseItem;
  if (!item) {
    elements.phraseTranslation.textContent = t("emptyPractice");
    elements.phraseText.textContent = "";
    elements.phraseFeedback.textContent = "";
    elements.phraseFeedback.className = "feedback";
    elements.phraseOptions.replaceChildren();
    return;
  }

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
  if (!state.phraseItem) return;

  const isCorrect = option === state.phraseItem.missing;
  updateScore(isCorrect, state.phraseItem.id);
  elements.phraseFeedback.textContent = isCorrect ? getSuccessMessage() : t("wrong");
  elements.phraseFeedback.className = `feedback ${isCorrect ? "success" : "error"}`;
  recordAttempt(state.phraseItem.id, isCorrect);
  trackAnswer("phrase", state.phraseItem.id, isCorrect);
  if (isCorrect) {
    celebrate(elements.phraseFeedback);
    window.setTimeout(nextPhrase, 1000);
  }
}

function renderSituations() {
  const phraseById = new Map(phrases.map((phrase) => [phrase.id, phrase]));
  const filteredSituations = getPracticeSituations();

  elements.situationsBoard.replaceChildren(
    ...(filteredSituations.length ? filteredSituations : []).map((situation) => {
      const card = document.createElement("article");
      card.className = "situation-card";
      const situationPhrases = situation.phrases
        .map((phraseId) => phraseById.get(phraseId))
        .filter(Boolean);
      card.innerHTML = `
        <div>
          <p>${getCategoryLabel(situation.category)}</p>
          <h3>${situation.title[state.uiLanguage]}</h3>
          <span>${situation.summary[state.uiLanguage]}</span>
        </div>
        <div class="situation-lines"></div>
      `;
      const lines = card.querySelector(".situation-lines");
      lines.replaceChildren(
        ...situationPhrases.map((phrase) => {
          const row = document.createElement("button");
          row.type = "button";
          row.className = "situation-line";
          row.innerHTML = `<strong>${phrase.text}</strong><span>${phrase.translations[state.uiLanguage]}</span>`;
          return row;
        })
      );
      return card;
    }),
    ...(filteredSituations.length ? [] : [createEmptyState()])
  );
}

function updateScore(isCorrect, id) {
  if (isCorrect) {
    state.progress.score += 10;
    state.progress.correctAnswers += 1;
    state.progress.currentStreak += 1;
    state.progress.bestStreak = Math.max(
      state.progress.bestStreak,
      state.progress.currentStreak
    );
    markPracticed(id);
    unlockRewards();
  } else {
    state.progress.currentStreak = 0;
  }

  saveProgress();
  renderStats();
}

function unlockRewards() {
  const unlockedIds = new Set(state.progress.unlockedRewards);
  const newRewards = REWARD_MILESTONES.filter(
    (milestone) =>
      state.progress.correctAnswers >= milestone.answers &&
      !unlockedIds.has(milestone.id)
  );

  if (!newRewards.length) return;

  newRewards.forEach((reward) => state.progress.unlockedRewards.push(reward.id));
  saveProgress();
  renderRewards();
  newRewards.forEach((reward) => {
    tracker.track("reward_unlocked", {
      activityType: "reward",
      itemId: reward.id,
    });
  });
  showRewardModal(newRewards[0]);
}

function getSuccessMessage() {
  return state.progress.currentStreak > 1
    ? `${t("correct")} ${t("combo")}`
    : t("correct");
}

function celebrate(anchor) {
  anchor.classList.remove("celebrate");
  void anchor.offsetWidth;
  anchor.classList.add("celebrate");
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
  trackAnswer("card", item.id, isKnown);
  nextCard();
}

function trackAnswer(activityType, itemId, isCorrect) {
  tracker.track("answer", {
    activityType,
    itemId,
    correct: isCorrect,
  });
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

function loadProgress() {
  const fallback = {
    score: 0,
    correctAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    practiced: [],
    unlockedRewards: [],
    words: {},
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const progress = { ...fallback, ...saved, words: saved?.words || {} };
    progress.unlockedRewards = Array.isArray(saved?.unlockedRewards)
      ? saved.unlockedRewards
      : [];
    const legacyStreak = Number.isFinite(saved?.streak) ? saved.streak : 0;
    const scoreAnswers = Math.floor((progress.score || 0) / 10);

    if (!Number.isFinite(saved?.correctAnswers)) {
      progress.correctAnswers = Math.max(legacyStreak, scoreAnswers);
    }

    if (!Number.isFinite(saved?.currentStreak)) {
      progress.currentStreak = legacyStreak;
    }

    return progress;
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
  elements.levelFilter.replaceChildren(
    option("all", t("allLevels")),
    option("1", t("level1")),
    option("2", t("level2")),
    option("3", t("level3"))
  );
  elements.levelFilter.value = state.levelFilter;
  populateCategoryFilter();
  elements.reviewFilter.checked = state.reviewOnly;
}

function resetPracticeViews() {
  state.cardIndex = 0;
  renderCard();
  nextQuiz();
  nextPicture();
  resetMatch();
  nextPhrase();
  renderSituations();
  renderStats();
  renderProgress();
}

function populateCategoryFilter() {
  const categories = getAvailableCategories();
  if (state.categoryFilter !== "all" && !categories.includes(state.categoryFilter)) {
    state.categoryFilter = "all";
  }
  elements.categoryFilter.replaceChildren(
    option("all", t("allCategories")),
    ...categories.map((category) => option(category, getCategoryLabel(category)))
  );
  elements.categoryFilter.value = state.categoryFilter;
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

function renderRewards() {
  const unlockedIds = new Set(state.progress.unlockedRewards);
  elements.rewardList.replaceChildren(
    ...REWARD_MILESTONES.map((milestone) => {
      const unlocked =
        unlockedIds.has(milestone.id) ||
        state.progress.correctAnswers >= milestone.answers;
      const card = document.createElement("article");
      card.className = `reward-card ${unlocked ? "reward-card-unlocked" : ""}`;
      const title = unlocked ? getRewardText(milestone) : t("mysteryReward");
      const status = unlocked
        ? formatText(t("rewardForAnswers"), { count: milestone.answers })
        : formatText(t("rewardLocked"), { count: milestone.answers });
      card.innerHTML = `
        <img class="reward-thumb" src="${milestone.image}" alt="" loading="lazy" />
        <div>
          <strong>${title}</strong>
          <span>${status}</span>
        </div>
      `;

      if (unlocked) {
        const button = document.createElement("button");
        button.className = "secondary-button";
        button.type = "button";
        button.textContent = t("copyRewardButton");
        button.addEventListener("click", () => showRewardModal(milestone));
        card.append(button);
      }

      return card;
    })
  );
}

function showRewardModal(reward) {
  state.activeReward = reward;
  elements.rewardModal.hidden = false;
  elements.rewardImage.src = reward.image;
  elements.rewardImage.alt = getRewardText(reward);
  elements.rewardModalTitle.textContent = getRewardText(reward);
  elements.rewardModalText.textContent = formatText(t("rewardForAnswers"), {
    count: reward.answers,
  });
  elements.rewardHelper.textContent = "";
}

function closeRewardModal() {
  state.activeReward = null;
  elements.rewardModal.hidden = true;
}

async function copyActiveRewardImage() {
  if (!state.activeReward) return;

  const message = buildRewardMessage(state.activeReward);
  elements.rewardCopy.disabled = true;
  elements.rewardHelper.textContent = t("rewardPreparing");
  try {
    const blob = await createRewardShareImage(state.activeReward);
    const file = new File([blob], `french-garden-${state.activeReward.id}.png`, {
      type: blob.type,
    });

    if (shouldPreferShareSheet(file)) {
      await navigator.share({
        files: [file],
        title: "French Garden",
        text: message,
      });
      elements.rewardHelper.textContent = t("rewardShared");
      return;
    }

    if (canCopyImageToClipboard()) {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      elements.rewardHelper.textContent = t("rewardCopied");
      return;
    }

    if (canShareRewardFile(file)) {
      await navigator.share({
        files: [file],
        title: "French Garden",
        text: message,
      });
      elements.rewardHelper.textContent = t("rewardShared");
      return;
    }

    await navigator.clipboard.writeText(message);
    elements.rewardHelper.textContent = t("rewardCopyFallback");
  } catch {
    try {
      await navigator.clipboard.writeText(message);
      elements.rewardHelper.textContent = t("rewardCopyFallback");
    } catch {
      elements.rewardHelper.textContent = message;
    }
  } finally {
    elements.rewardCopy.disabled = false;
  }
}

function shouldPreferShareSheet(file) {
  return isAppleTouchDevice() && canShareRewardFile(file);
}

function canShareRewardFile(file) {
  return Boolean(
    navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
  );
}

function canCopyImageToClipboard() {
  return Boolean(navigator.clipboard?.write && window.ClipboardItem);
}

function isAppleTouchDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

async function createRewardShareImage(reward) {
  const width = 900;
  const height = 1180;
  const padding = 56;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const image = await loadImage(reward.image);

  context.fillStyle = "#fffafc";
  context.fillRect(0, 0, width, height);

  drawRoundedRect(context, 24, 24, width - 48, height - 48, 34, "#fff0f7");
  drawCoverImage(context, image, padding, 190, width - padding * 2, 680, 24);

  context.fillStyle = "#765f7d";
  context.font = "700 28px system-ui, -apple-system, Segoe UI, sans-serif";
  context.fillText(t("rewardUnlockedEyebrow").toUpperCase(), padding, 96);

  context.fillStyle = "#a22465";
  context.font = "800 48px system-ui, -apple-system, Segoe UI, sans-serif";
  wrapCanvasText(context, getRewardText(reward), padding, 150, width - padding * 2, 56);

  context.fillStyle = "#342238";
  context.font = "800 34px system-ui, -apple-system, Segoe UI, sans-serif";
  context.fillText(
    formatText(t("rewardForAnswers"), { count: reward.answers }),
    padding,
    930
  );

  context.fillStyle = "#765f7d";
  context.font = "700 28px system-ui, -apple-system, Segoe UI, sans-serif";
  wrapCanvasText(context, buildRewardMessage(reward), padding, 990, width - padding * 2, 38);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create reward image."));
    }, "image/png");
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCoverImage(context, image, x, y, width, height, radius) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const frameRatio = width / height;
  const drawHeight = imageRatio > frameRatio ? height : width / imageRatio;
  const drawWidth = imageRatio > frameRatio ? height * imageRatio : width;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  context.save();
  roundedPath(context, x, y, width, height, radius);
  context.clip();
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.restore();
}

function drawRoundedRect(context, x, y, width, height, radius, fill) {
  context.save();
  roundedPath(context, x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
  context.restore();
}

function roundedPath(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (context.measureText(nextLine).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = nextLine;
    }
  });

  if (line) context.fillText(line, x, currentY);
}

function buildRewardMessage(reward) {
  return formatText(t("rewardMessageBody"), {
    reward: getRewardText(reward),
    count: reward.answers,
  });
}

function getRewardText(reward) {
  return reward.reward[state.uiLanguage] || reward.reward.en;
}

function formatText(text, values) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    text
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

function getPracticePictures() {
  const reviewIds = new Set(getReviewIds());
  return pictureItems.filter((item) => {
    const levelMatches =
      state.levelFilter === "all" || String(getWordLevel(item)) === state.levelFilter;
    const categoryMatches =
      state.categoryFilter === "all" || item.category === state.categoryFilter;
    const reviewMatches = !state.reviewOnly || reviewIds.has(getVocabularyIdByFrench(item.french));
    return levelMatches && categoryMatches && reviewMatches;
  });
}

function getPracticePhrases() {
  return phrases.filter((phrase) => {
    const category = getPhraseCategory(phrase);
    return filtersMatchCategory(category);
  });
}

function getPracticeSituations() {
  return situations.filter((situation) => filtersMatchCategory(situation.category));
}

function getTodayVocabularyPool() {
  return [...getPracticeVocabulary()].sort((a, b) =>
    getTodayPriority(b.id) - getTodayPriority(a.id)
  );
}

function getTodayPicturePool() {
  return [...getPracticePictures()].sort((a, b) =>
    getTodayPriority(getVocabularyIdByFrench(b.french)) -
    getTodayPriority(getVocabularyIdByFrench(a.french))
  );
}

function getTodayPhrasePool() {
  const pool = getPracticePhrases();
  const filtered = state.reviewOnly
    ? pool.filter((phrase) => isProgressIdInReview(phrase.id))
    : pool;

  return [...filtered].sort((a, b) =>
    getTodayPriority(b.id) - getTodayPriority(a.id)
  );
}

function getTodayPriority(id) {
  const record = state.progress.words[id];
  if (!record) return 120;

  const lastSeen = Date.parse(record.lastSeen || "");
  const recentMiss = record.wrong && Date.now() - lastSeen < 7 * 24 * 60 * 60 * 1000;

  return (
    (isProgressIdInReview(id) ? 1000 : 0) +
    (recentMiss ? 240 : 0) +
    (record.wrong || 0) * 80 -
    (record.correct || 0) * 20 +
    (state.progress.practiced.includes(id) ? 0 : 120)
  );
}

function isProgressIdInReview(id) {
  const record = state.progress.words[id];
  return Boolean(record?.needsReview || (record?.wrong || 0) > (record?.correct || 0));
}

function getAvailableCategories() {
  return [...new Set(vocabulary.map((item) => item.category))]
    .filter((category) => state.levelFilter === "all" || String(getCategoryLevel(category)) === state.levelFilter)
    .sort();
}

function filtersMatchCategory(category) {
  if (!category) return state.levelFilter === "all" && state.categoryFilter === "all";
  const levelMatches =
    state.levelFilter === "all" || String(getCategoryLevel(category)) === state.levelFilter;
  const categoryMatches =
    state.categoryFilter === "all" || category === state.categoryFilter;
  return levelMatches && categoryMatches;
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
  return getCategoryLevel(item.category);
}

function getCategoryLevel(category) {
  const level = Object.entries(LEVEL_CATEGORIES).find(([, categories]) =>
    categories.has(category)
  );
  return Number(level?.[0] || 1);
}

function getPhraseCategory(phrase) {
  const situation = situations.find((item) => item.phrases.includes(phrase.id));
  if (situation) return situation.category;

  const phraseWords = [
    phrase.missing,
    ...phrase.text.split(/\s+/),
  ].map(normalizeFrenchText);
  const match = vocabulary.find((item) =>
    phraseWords.includes(normalizeFrenchText(item.french))
  );
  return match?.category || "";
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[state.uiLanguage]?.[category] || category;
}

function getVocabularyIdByFrench(french) {
  return vocabulary.find((item) => item.french === french)?.id || french;
}

function option(value, label) {
  const element = document.createElement("option");
  element.value = value;
  element.textContent = label;
  return element;
}

function createEmptyState() {
  const element = document.createElement("p");
  element.className = "empty-state";
  element.textContent = state.reviewOnly ? t("emptyReview") : t("emptyPractice");
  return element;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function pickWithoutRecent(items, recentIds) {
  const available = items.filter((item) => !recentIds.includes(item.id));
  return randomItem(available.length ? available : items);
}

function rememberRecent(recentIds, id) {
  recentIds.push(id);
  if (recentIds.length > 8) recentIds.shift();
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getDistractorTranslations(correctItem, count) {
  const correctTranslation = correctItem.translations[state.uiLanguage];
  const candidates = vocabulary.filter(
    (item) =>
      item.id !== correctItem.id &&
      item.translations[state.uiLanguage] !== correctTranslation
  );

  return [
    ...pickDistractorGroup(candidates, correctItem, true, true),
    ...pickDistractorGroup(candidates, correctItem, true, false),
    ...pickDistractorGroup(candidates, correctItem, false, true),
    ...pickDistractorGroup(candidates, correctItem, false, false),
  ]
    .filter(uniqueById())
    .map((item) => item.translations[state.uiLanguage])
    .filter(uniqueValue())
    .slice(0, count);
}

function getAnswerOptionCount(item) {
  return Math.min(6, 3 + getWordLevel(item));
}

function getPictureOptionCount(item) {
  if (state.categoryFilter !== "all") {
    return Math.min(5, pictureItems.filter((picture) => picture.category === item.category).length);
  }

  return Math.min(5, 3 + getWordLevel(item));
}

function getPictureDistractorPool(correctItem) {
  return [
    ...shuffle(pictureItems.filter((item) => item.category === correctItem.category)),
    ...shuffle(pictureItems.filter((item) => item.category !== correctItem.category)),
  ].filter(uniqueById());
}

function pickDistractorGroup(candidates, correctItem, sameCategory, sameAnswerShape) {
  return shuffle(
    candidates.filter((item) => {
      const categoryMatches = !sameCategory || item.category === correctItem.category;
      const shapeMatches =
        !sameAnswerShape ||
        getAnswerShape(item.translations.en) === getAnswerShape(correctItem.translations.en);

      return categoryMatches && shapeMatches;
    })
  );
}

function getAnswerShape(answer) {
  const normalized = answer.toLowerCase();
  if (/^(a|an|the)\b/.test(normalized)) return "article";
  if (/^(i|you|he|she|we|they)\b/.test(normalized)) return "sentence";
  if (/^(to|over|far)\b/.test(normalized)) return "direction";
  if (/day$|day\b|today|tomorrow|yesterday|now|later|morning|evening/.test(normalized)) {
    return "time";
  }
  return "plain";
}

function normalizeFrenchText(value) {
  return String(value)
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[?!.,]/g, "")
    .trim();
}

function uniqueById() {
  const usedIds = new Set();
  return (item) => {
    if (usedIds.has(item.id)) return false;
    usedIds.add(item.id);
    return true;
  };
}

function uniqueValue() {
  const usedValues = new Set();
  return (value) => {
    if (usedValues.has(value)) return false;
    usedValues.add(value);
    return true;
  };
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}
