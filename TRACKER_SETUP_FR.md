# Tracker prive French Garden

Le compteur est remis a zero sur le site publie. Le tracker envoie les
evenements vers un Google Form prive appartenant a Sylvain.

Formulaire de reception:
https://docs.google.com/forms/d/e/1FAIpQLScPJz900yUZ6JEpUYOeXa3bzNnALZ7xZVF6xjcJCdzfqg2qzQ/viewform

Chaque reponse du formulaire contient:

- l'horodatage Google de reception;
- un champ `payload` avec le detail JSON: type d'evenement, type d'activite,
  correct/incorrect, score, total de bonnes reponses, nombre pratique, nombre a
  revoir, langue, session, client et navigateur.

Le tracker n'affiche rien dans l'app. Si Google bloque une requete ou si
l'utilisatrice est hors ligne, l'app continue normalement.
