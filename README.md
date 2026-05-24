# French Garden

Small static French practice app for GitHub Pages. It works without an API:
all vocabulary, phrases, translations, and interface labels are stored in
`data.js`.

## Edit the lessons

Open `data.js` and edit:

- `vocabulary` for word cards, quiz, and matching game.
- `phrases` for sentence completion practice.
- `uiText` for the app interface in English, French, and Belarusian.

Each vocabulary item needs:

```js
{
  id: "water",
  category: "Daily life",
  french: "de l’eau",
  translations: { en: "water", fr: "de l’eau", be: "вада" }
}
```

## Publish on GitHub Pages

Put this folder in a GitHub repository, then enable GitHub Pages from the
repository settings. Use the branch and folder you prefer, for example
`main` and `/french-learning-app`.
