# French Garden

Small static French practice app for GitHub Pages. It works without an API:
all vocabulary, phrases, translations, and interface labels are stored in
`data.js`. The app interface is available in English and Belarusian.

## Edit the lessons

Open `data.js` and edit:

- `vocabulary` for word cards, quiz, and matching game.
- `phrases` for sentence completion practice.
- `uiText` for the app interface in English and Belarusian.

Current content:

- 84 vocabulary items.
- 47 phrase exercises.
- 14 vocabulary categories.
- 5 vocabulary pairs per matching round.

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
