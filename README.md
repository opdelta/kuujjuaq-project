# Guide de l'utilisateur

## Introduction

Le projet Kuujjuaq est une application Web qui affiche les probabilités d'averses selon différents seuils, la vitesse et la direction des vents ainsi que la température à l'aéroport de Kuujjuaq. 
L'application permet également au météorologue d'ajouter des commentaires et de faire une prévision officielle. 
Le tout peut finalement être exporté en format `PDF` pour des fins de partages.

## Installation

Afin de profiter d'une performance adéquate et optimale, voici les étapes à suivre.

### Préconditions <a name="#compatibility"></a>

Voici la compatibilité avec les différents fureteurs:
Table goes here

Le fichier `.7z` fourni contient les sous-fichiers suivants qui devront être exportés:

- `index.html` - Page web principale.
- `main.js` - Code source de l'application web.
- `style.css` - Fichier de style pour l'affichage de la page web.
- `guide.html` - Ce document.

### Décompression des fichiers

Pour décompresser les fichiers: `clic droit > 7zip > Extraire` ou ouvrir le fichier `.7z` et copier/coller les fichiers vers un répertoire. 
Veuillez prendre note que tous les fichiers doivent se situer dans le même répertoire sans quoi l'application ne pourra fonctionner. 

## Lancement de l'application

En utilisant un fureteur compatible avec l'application web (Voir [ici](#compatibility)), lancez le fichier `index.html`. 

Lors du lancement initial de l'application, plusieurs requêtes seront faites à `Geomet` pour aller chercher les dernières prévisions météorologiques. Dès lors, le temps d'attente initial peut varier entre `5s et 75s`. 
Le temps d'attente dépend de plusieurs facteurs dont:

- La vitesse du réseau
- La bande passante disponible
- La charge de travail sur les serveurs de Geomet
- Le temps de la journée au moment de la requête
- Etc.

Une fois le chargement de la page terminé, la page ressemblera à ceci:
![Previsions Kuujjuaq](https://i.imgur.com/IjvAPQF.png)
** L'exemple ci-dessus n'est pas représentatif des vraies prévisions à la date indiquée. 

La page web est séparée en 3 grandes sections.

### Graphique de probabilités de précipitations
Le graphique de probabilités de précipitations démontre visuellement les probabilités de précipitations suivantes:

- Probabilités de précipitations de `0.2mm` et plus. 
- Probabilités de précipitations de `1.0mm` et plus.
- Probabilités de précipitations de `2.5mm` et plus.
- Probabilités de précipitations de `5.0mm` et plus.

Une fonctionnalité intéressante de ce graphique est son interactivité. Il est possible à l'aide la souris, de regarder la probabilité de précipitation à un instant précis en passant la souris par dessus un point. 
Il est également possible de zoomer et dézoomer le graphique en maintenant le clic gauche et en dessinant un carré autour des valeurs voulues.
![Zoom](https://i.imgur.com/bu1U4ui.png)
D'autres manipulations du graphiques sont également disponible en passant la souris dans le coin supérieur droit du graphique.
![Options](https://i.imgur.com/oHNPNT2.png)

### Tableau de probabilités
La deuxième section de la page web, le tableau de probabilités contient les données suivantes de manière textuelle.
 
- Probabilités de précipitations de `0.2mm` et plus. 
- Probabilités de précipitations de `1.0mm` et plus.
- Probabilités de précipitations de `2.5mm` et plus.
- Probabilités de précipitations de `5.0mm` et plus.
- Température locale.
- Vitesse du vent
- Direction du vent (`N`, `NE`,  `E`, `SE`, `S`, `SW`, `W`, `NW`).
#### Note importante
Les dates affichées dans la tableau sont de format ISO8601 (AAAA-MM-JJ) ajustées à l'heure locale.
Les valeurs affichées ne sont pas "instantanées". Voici un exemple:
```
2021-06-30 02h00 -
2021-06-30 08h00 A
2021-06-30 14h00 B
2021-06-30 20h00 C
```
La lecture des prévisions `B` à `14h00` représente les prévisions `B` entre `08h00` et `14h00`.
La lecture des prévisions `C` à `20h00` représente les prévisions `C` entre `14h00` et `20h00`.  
La lecture des prévisions `A` à `08h00` représente les prévisions `A` entre `02h00` et `08h00`.
*Heure locale.
### Commentaires

La dernière section contient deux champs textes qui peuvent être utilisés pour commenter les données brutes plus haut. La section `Commentaires du météorologue` permet au météorologue d'ajouter des commentaires pertinents à l'égard des données. 
Le deuxième champ texte `Prévisions officielles` permet au météorologue d'établir une ou des prévisions officielles concernant la météo à l'aéroport de Kuujjuaq. 

## Exportation

Il est possible d'enregistrer la page sous format PDF pour des fins de partage. 
Pour ce faire, il suffit d'appuyer sur `Ctrl + P`. Un dialogue d'impression apparaîtra comme cela:
![Impression](https://i.imgur.com/a0mz84f.png)
En sélectionnant l'option `Microsoft Print to PDF` ou `Enregistrer en tant que PDF`, la page au complet sera enregistrée en tant que PDF avec les commentaires et peut par la suite être consulté et envoyé facilement. 

Le graphique peut également être téléchargé en tant que `png` en sélectionnant l'icône de photo dans les options du graphique.
![Télécharger en tant que PNG](https://i.imgur.com/urTDrJT.png)

## Informations techniques
### Couches utilisées

- REPS.DIAG.6_PRMM.ERGE0.2 (Probs. ≥ 0.2mm)
- REPS.DIAG.6_PRMM.ERGE1 (Probs. ≥ 1.0mm)
- REPS.DIAG.6_PRMM.ERGE2.5 (Probs. ≥ 2.5mm)
- REPS.DIAG.6_PRMM.ERGE5 (Probs. ≥ 5.0mm)
- HRDPS.CONTINENTAL_TT (Température HRDPS)
- HRDPS.CONTINENTAL_WD (Direction du vent HRDPS)
- HRDPS.CONTINENTAL_WSPD (Vitesse du vent HRDPS)

Pour changer les couches utilisées, vous pouvez communiquer avec ziad.lteif@ec.gc.ca.

### Limitations 

Les couches du `REPS` utilisent les passes suivantes: `00Z`, `06Z`, `12Z` et `18Z` (6h d'intervalle), tandis que les couches du `HRDPS` se mettent à jour à toutes les heures. De plus, les couches du `REPS` projettent jusqu'à 72h dans le futur contrairement au 48h limité par le `HRDPS`. 
Dès lors, en considérant ces facteurs, la tableau affiche le résultat de toutes les passes du `REPS` et seulement les passes `00Z`, `06Z`,`12Z` et `18Z` pour le `HRDPS`. 

### Affichage de la date

Comme mentionné précédemment, l'affichage de la date suit la norme ISO8601 (AAAA-MM-JJ). Les heures sont ajustées en fonction de l'heure locale de **l'utilisateur** et non de l'aéroport. Donc, si le fuseau horaire de l'utilisateur ou du fureteur est différent du fuseau horaire de l'aéroport, alors les heures ne seront pas représentatives de la réalité à l'aéroport. 

### Conversion de la direction du vent en cardinal

Lorsque la réponse de la requête de `HRDPS.CONTINENTAL_TT` revient, la valeur par défaut est un angle (360°). 
La conversion de l'angle (°) en cardinal N, S, E, W se fait comme suit:
```javascript
let  val = Number((num / 45));
let  arr = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
if (Math.round((val % 8)) == 8) {
	return  "Variables";
}
return  arr[Math.round((val % 8))];
```
Un tableau contient toutes les possibilités cardinales et le modulo 16 de l'angle divisé par 22.5 + 0.5 (arrondi) retourne un indice de tableau contenant la cardinalité de la direction du vent. 
Approximativement, la direction du vent varie tous les 22.5°.

## Dépannage

| Problème | Description du problème | Cause possible | Solution |
|---|---|---|---|
|#1| La page est blanche et rien ne s'affiche autre que les commentaires du météorologue et les prévisions officielles. (**Aucune animation de chargement**) | Javascript est désactivé ou un fureteur incompatible est utilisé | Assurez-vous d'avoir Javascript activé dans votre fureteur. Vous pouvez consulter https://www.enable-javascript.com/ pour les étapes à suivre pour votre fureteur.<br /> Assurez-vous d'utiliser un fureteur compatible avec l'application en vous référant à la section "Compatiblité". |
|#2| La page charge indéfiniment (Plus de 2m30s) | Une erreur est survenue lors de la lecture de la réponse suite à une requête.  | Rafraîchissez la page. Si le chargement continue indéfiniment, ouvrez la console de votre fureteur (https://balsamiq.com/support/faqs/browserconsole/). Sur Google Chrome: `Ctrl + Shift + J`. <br /><br /> Si une erreur de type `Uncaught (in promise) SyntaxError: Unexpected token < in JSON at position 0` est soulevée, attendez 3-5 minutes et réessayer. <br /><br /> Si l'erreur persiste, essayez un autre fureteur. Dans l'eventualité où l'erreur persiste, assurez-vous que votre pare-feu ne bloque pas la requête vers `https://geo.weather.gc.ca`. Déconnectez-vous d'un VPN (s'il y a lieu) et rééssayer. <br /> <br /> Si la déconnexion du VPN est impossible, vider le cache dans votre fureteur (https://www.pcmag.com/how-to/how-to-clear-your-cache-on-any-browser), redémarrez votre ordinateur et rééssayer de nouveau. <br /> <br />Si une erreur de type `JavaScript: Error undefined JavaScript execution exceeded timeout` apparaît dans la console, suivez les étapes ci-dessus pour assurer une connexion fiable vers `https://geo.weather.gc.ca`. <br />Si l'erreur persiste, attendez une vingtaine de minutes et réessayer. Il est possible que les serveurs `geo.weather.gc.ca` soient débordés. |
|#3| Le tableau affiche des valeurs `%undefined%` ou `%NaN%`  | Un problème de connexion empêche l'envoi de toutes les requêtes adéquatement.  | Assurez-vous d'avoir une connexion Internet stable et que votre pare-feu ne bloque pas les requêtes vers `https://geo.weather.gc.ca`. Attendez quelques minutes et rafraîchissez la page. |
|#4| La page ne s'affiche pas correction lors de l'impression en PDF.  | Un paramètre du fureteur peut obstruer l'affichage de la page correctement.  | Désactiver toutes les extensions du fureteur (Adblock, etc.), vérifiez que la version de votre navigateur est compatible avec l'application et essayer un autre navigateur. <br /><br />Si la page ne s'affiche toujours pas correctement lors de l'impression `Ctrl + P`, vous pouvez utiliser `Snipping tool` sur Windows afin de capturer l'écran. |


## Licence

Le code source de l'application utilise la licence MIT. Voici les détails de celle-ci:
```license
MIT License

Copyright (c) [2021] [Ziad Lteif]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

