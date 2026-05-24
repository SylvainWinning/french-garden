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
- Review-only mode for words marked difficult.
- Listening practice without any external API.
- Picture quiz with built-in images.
- Guided mini-situations for daily life.
- Reward milestones with a prefilled email message for Sylvain.
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
