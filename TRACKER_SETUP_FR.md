# Activer le tracker prive French Garden

Le compteur est deja remis a zero sur le site publie. Le tracker est installe
dans l'app, mais il reste inactif tant que l'URL Google Apps Script n'est pas
ajoutee dans `tracker.js`.

## Etapes Google

1. Ouvre la Sheet privee:
   https://docs.google.com/spreadsheets/d/1jH-f1Pz5pMgW2ts5BSBwaChSIivFcfjkPO6p_4PIWDw
2. Va dans `Extensions > Apps Script`.
3. Remplace le contenu par le fichier `google-apps-script-tracker.js`.
4. Clique `Deploy > New deployment`.
5. Choisis le type `Web app`.
6. Mets `Execute as` sur ton compte.
7. Mets `Who has access` sur `Anyone`.
8. Clique `Deploy`, puis autorise le script.
9. Copie l'URL qui se termine par `/exec`.

## Etapes app

1. Colle cette URL dans `tracker.js`, ligne `TRACKING_ENDPOINT`.
2. Commit et push sur `main`.
3. Ouvre https://sylvainwinning.github.io/french-garden/.
4. Reponds a une question.
5. Verifie dans la Sheet que les lignes `session_start` et `answer` arrivent.

Le tracker n'affiche rien dans l'app. Si Google bloque une requete ou si
l'utilisatrice est hors ligne, l'app continue normalement.
