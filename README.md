# French Garden

Small static French practice app for GitHub Pages. It works without an API:
all vocabulary, phrases, picture prompts, translations, and interface labels
are stored in local files. The app interface is available in English and
Belarusian.

## Edit the lessons

Open the focused data file and edit:

- `vocabulary.js` for word cards, quiz, listening, and matching game.
- `picture-items.js` for the picture quiz.
- `phrases.js` for sentence completion practice.
- `situations.js` for guided daily-life practice groups.
- `ui-text.js` for the app interface in English and Belarusian.

Current content:

- 84 vocabulary items.
- 18 picture prompts.
- 47 phrase exercises.
- 14 vocabulary categories.
- 5 vocabulary pairs per matching round.

Current learning features:

- Level and category filters for focused practice.
- Private usage tracking through a Google Apps Script endpoint.
- Review-only mode for words marked difficult.
- Listening practice without any external API.
- Picture quiz with built-in images.
- Guided mini-situations for daily life.
- Reward milestones with a clipboard-ready reward image for Sylvain.
- Reward photos stored in `assets/rewards`.
- Random hero photos stored in `assets/hero`.
- Category progress stored in the browser.
- "I know it" and "Review later" actions on flashcards.

Each vocabulary item needs:

```js
{
  id: "water",
  category: "Daily life",
  french: "de l’eau",
  translations: { en: "water", be: "вада" }
}
```

## Publish on GitHub Pages

Put this folder in a GitHub repository, then enable GitHub Pages from the
repository settings. Use the branch and folder you prefer, for example
`main` and `/french-learning-app`.

## Private usage tracker

The app can send invisible usage events to a private Google Sheet. Tracking is
off until an endpoint is configured, and failures are ignored so the app keeps
working offline.

Setup:

1. Use the private tracker Sheet:
   https://docs.google.com/spreadsheets/d/1jH-f1Pz5pMgW2ts5BSBwaChSIivFcfjkPO6p_4PIWDw
2. Open Extensions > Apps Script.
3. Paste the contents of `google-apps-script-tracker.js`.
4. Deploy it as a Web app with access set to "Anyone".
5. Copy the Web app URL into `TRACKING_ENDPOINT` in `tracker.js`.

Events currently logged:

- `session_start` when the app opens.
- `answer` for quiz, picture, card, match, and phrase attempts.
- `reward_unlocked` when a reward milestone unlocks.
- `session_ping` every few minutes while the app stays open.
