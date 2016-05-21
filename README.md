# nationale-ombudsman
Interactieve tijdlijn voor de Nationale Ombudsman

Fabrique maakte een ontwerp voor het online jaarverslag van de Nationale Ombudsman, dat ik codeerde met alleen JavaScript, HTML5 en CSS en zonder backend-logica. Hierdoor is de tijdlijn door De Nationale Ombudsman gemakkelijk te embedden op verschillende subsites.

Alle data wordt met JSON aangeleverd door het Drupal cms van de ombudsman. Die gegevens worden vervolgens getoond in een interactieve tijdlijn, waarin op maandniveau is in te zoomen en op categorieën is te filteren.

* **tijdlijn.js** de hoofdclass van de tijdlijn
* **grid.js** het plaatsen van elementen in het grid van de tijdlijn, waarbij de verticale positie niet mag overlappen en redelijk random moet lijken
* **data.js** regelt de inkomende json data
* **item.js** class voor 1 item op de tijdlijn
* **odhash.js** een class om de hash in de url te regelen (pre-history pushState)
* **dossier.js** class voor 1 dossier op de tijdlijn
* **filter.js** het filter
