# RestAPI Routen

Stand 22.06.2018

## /api/car

- [GET] Gibt alle Transaktionen zu einer gegebenen VIN zurück.
- Parameter: vin
- HTTP-Code Parameter fehlt: 400
- HTTP-Code vin nicht gefunden: 400
- HTTP-Code vin kein headTxHash: 400
- HTTP-Code vin nicht in Blockchain: 400
- HTTP-Code vin gefunden: 200

## /api/car/applyCancelTransaction

- [POST] Erstellt eine neue Annulment Transaktion zu einem übergebenen transactionHash.
- Parameter: Authorization, transactionHash, authorityLevel
- HTTP-Code Parameter Authorization fehlt: 406
- HTTP-Code Error Authorization: 403
- HTTP-Code Authorization Token abgelaufen: 401
- HTTP-Code User blockiert: 401
- HTTP-Code Parameter transactionHash fehlt oder zu kurz: 400
- HTTP-Code Parameter authorityLevel fehlt oder ist falsch: 401 (erlaubt sind STVA(3), ASTVA(4), TUEV(2), ZWS(1))
- HTTP-Code Bearer Token nicht gefunden: 500
- HTTP-Code Transaction zu übergebenem Hash existiert bereits in DB: 409
- HTTP-Code Transaction zu übergebenem Hash existiert nicht in Blockchain: 400
- HTTP-Code Transaction konnte nicht in DB erstellt werden: 500
- HTTP-Code alles ok: 200

## /api/car/cancelTransaction

- [GET] Gibt alle existierenden Annulment Transaktionen zurück.
- Parameter: Authorization, authorityLevel
- HTTP-Code Parameter Authorization fehlt: 406
- HTTP-Code Error Authorization: 403
- HTTP-Code Authorization Token abgelaufen: 401
- HTTP-Code User blockiert: 401
- HTTP-Code Parameter authorityLevel fehlt oder ist falsch: 401 (erlaubt sind STVA(3), ASTVA(4))
- HTTP-Code ANnulments konnten nicht geladen werden : 500
kein HTTP-Code wenn annulments zurückgesendet? (evtl. 200) //TODO

- [POST] Akzeptiert eine existierende Annulment Transaktion anhand eines übergebenen transactionHash.
- Parameter: Authorization, transactionHash, authorityLevel
- HTTP-Code Parameter Authorization fehlt: 406
- HTTP-Code Error Authorization: 403
- HTTP-Code Authorization Token abgelaufen: 401
- HTTP-Code User blockiert: 401
- HTTP-Code Parameter transactionHash fehlt oder zu kurz: 400
- HTTP-Code Parameter authorityLevel fehlt oder ist falsch: 401 (erlaubt sind STVA(3), ASTVA(4))
- HTTP-Code kein Mitarbeiter zum Token: 500
- HTTP-Code Transaktion mit Hash nicht in DB: 400   
- HTTP-Code Transaktion mit Hash nicht in Blockchain: 400
- HTTP-Code Transaktion mit Hash konnte nicht in die Blockchain eingefügt werden: 500
- HTTP-Code Transaktion mit Hash konnte nicht in DB geupdatet werden: 500
- HTTP-Code annulment email nicht gefunden: 404
- HTTP-Code email versendet: 200
- HTTP-Code email nicht versendet: 404
- HTTP-Code success: 200


- [DELETE] Löscht eine existierende Annulment Transaktion anhand eines übergebenen transactionHash.
- Parameter: Authorization, transactionHash, authorityLevel
- HTTP-Code Parameter Authorization fehlt: 406
- HTTP-Code Error Authorization: 403
- HTTP-Code Authorization Token abgelaufen: 401
- HTTP-Code User blockiert: 401
- HTTP-Code Parameter transactionHash fehlt oder zu kurz: 400
- HTTP-Code Parameter authorityLevel fehlt oder ist falsch: 401 (erlaubt sind STVA(3), ASTVA(4))
- HTTP-Code annulment hash nicht in DB: 404
- HTTP-Code annulment hash kann nicht gelöscht werden: 500
- HTTP-Code annulment email nicht gefunden: 404
- HTTP-Code annulment reject email versendet: 200
- HTTP-Code annulment reject email nicht versendet: 404
- HTTP-Code annulment rejected: 200

## /api/car/mileage
(mileage update)

- [POST] Aktualisiert den Kilometerstand zu einer übergebenen VIN auf einem gegebenen Wert.
- Parameter: Authorization, vin, timestamp, mileage, authorityLevel
- HTTP-Code Parameter Authorization fehlt: 406
- HTTP-Code Error Authorization: 403
- HTTP-Code Authorization Token abgelaufen: 401
- HTTP-Code User blockiert: 401
- HTTP-Code Parameter vin oder timestamp oder mileage fehlt: 400
- HTTP-Code Parameter authorityLevel fehlt oder ist falsch: 401 (erlaubt sind STVA(3), ASTVA(4), TUEV(2), ZWS(1))
- HTTP-Code vin nicht gefunden: 400
- HTTP-Code Nutzer zum bearer token nicht gefunden: 400
- HTTP-Code DB Fehler: 500
- HTTP-Code Blockchain Fehler: 500
- HTTP-Code success: 200

## /api/car/register

- [POST] Aktualisiert den Zähler der Vorbesitzer und den Kilometerstand zu einer übergebenen VIN. Sollte das Auto
noch nicht exisiteren, wird ein neues angelegt.
- Parameter: Authorization, vin, timestamp, mileage, ownerCount, authorityLevel
- HTTP-Code Parameter Authorization fehlt: 406
- HTTP-Code Error Authorization: 403
- HTTP-Code Authorization Token abgelaufen: 401
- HTTP-Code User blockiert: 401
- HTTP-Code Parameter vin oder timestamp oder mileage oder ownerCount fehlt: 400
- HTTP-Code Parameter authorityLevel fehlt oder ist falsch: 401 (erlaubt sind STVA(3), ASTVA(4))
- HTTP-Code Neue vin konnte nicht registriert werden: 500
- HTTP-Code Für existierende VIN konnte keine head transaction in DB gefunden werden: 500
- HTTP-Code Nutzer zum bearer token nicht gefunden: 400
- HTTP-Code Blockchain Fehler: 500
- HTTP-Code success: 200

## /api/car/service

- [POST] Trägt einen gemachten Service oder Ölwechsel zu einer übergebenen VIN ein und aktualisiert den Kilometerstand.
- Parameter: Authorization, vin, timestamp, mileage, service1, service2, oilChange, authorityLevel
- HTTP-Code Parameter Authorization fehlt: 406
- HTTP-Code Error Authorization: 403
- HTTP-Code Authorization Token abgelaufen: 401
- HTTP-Code User blockiert: 401
- HTTP-Code Parameter vin oder timestamp oder mileage oder oder service1 oder service2 oder oilChange fehlt: 400
- HTTP-Code Parameter authorityLevel fehlt oder ist falsch: 401 (erlaubt sind ZWS(1))
- HTTP-Code vin nicht gefunden: 400
- HTTP-Code Nutzer zum bearer token nicht gefunden: 400
- HTTP-Code DB Fehler (keine HEAD transaction): 500
- HTTP-Code Blockchain Fehler: 500
- HTTP-Code success: 200

## /api/car/tuev

- [POST] Aktualisiert den TÜV-Status eines Autos, den Kilometerstand und den Termin für die nächste HU.
- Parameter: Authorization, vin, timestamp, mileage, nextCheck, authorityLevel
- HTTP-Code Parameter Authorization fehlt: 406
- HTTP-Code Error Authorization: 403
- HTTP-Code Authorization Token abgelaufen: 401
- HTTP-Code User blockiert: 401
- HTTP-Code Parameter vin oder timestamp oder mileage oder nextCheck fehlt: 400
- HTTP-Code Parameter authorityLevel fehlt oder ist falsch: 401 (erlaubt sind TUEV(2))
- HTTP-Code vin nicht gefunden: 400
- HTTP-Code Nutzer zum bearer token nicht gefunden: 400
- HTTP-Code DB Fehler (keine HEAD transaction): 500
- HTTP-Code Blockchain Fehler: 500
- HTTP-Code success: 200

## /api/users/token

- [POST] Liefert ein Bearer Token für gültige, übergebene Password + Benutzername.

## /api/users/login

- [GET] Gibt den aktuellen Login-Status und das Rechte-Level zu einem übergebenen Bearer Token zurück.
- Parameter: Authorization
- HTTP-Code Parameter Authorization fehlt: 406
- HTTP-Code Error Authorization: 403
- HTTP-Code Authorization Token abgelaufen: 401
- HTTP-Code User blockiert: 401
- HTTP-Code success: 200

## /api/users/register

- [DEL] Setzt den Benutzer zu einer übergebenen Email-Adresse auf blocked.
- Parameter: Authorization, email, authorityLevel
- HTTP-Code Parameter Authorization fehlt: 406
- HTTP-Code Error Authorization: 403
- HTTP-Code Authorization Token abgelaufen: 401
- HTTP-Code User blockiert: 401
- HTTP-Code Email fehlt: 400
- HTTP-Code authorityLevel fehlt oder fehlerhaft (nur ASTVA(4) erlaubt): 401
- HTTP-Code Nutzer existiert nicht (anhand email): 400
- HTTP-Code Nutzer existiert und wurde geblockt (anhand email): 200
- HTTP-Code Datenbankfehler bei blocken: 500

- [POST] Legt einen neuen Benutzer zu übergebenen Email, Passwort, Authorisierungs-Level, Vorname, Nachname,
Firmenname und Zeitstempel Daten an.
- Parameter: Authorization, email, authorityLevel, authLevel, forename, surname, companyName, creationDate(authorityLevel -> anlegender Nutzer, authLevel -> anzulegender Nutzer)
- HTTP-Code Parameter Authorization fehlt: 406
- HTTP-Code Error Authorization: 403
- HTTP-Code Authorization Token abgelaufen: 401
- HTTP-Code User blockiert: 401
- HTTP-Code Parameter email, authorityLevel, authLevel, forename, surname, companyName, creationDate (oder) fehlt: 400
- HTTP-Code fehlerhaft (nur ASTVA(4) erlaubt): 401
- HTTP-Code Nutzer für Email existiert beriets: 400
- HTTP-Code DB-Fehler (oder Blockchain) bei anlegen des Nutzers: 500
- HTTP-Code allg. Registrierunggfehler: 500
- HTTP-Code Bestätigungmail versendet: 200
- HTTP-Code Bestätigungmail nicht versendet: 400
- HTTP-Code success: 200


http-statuscodes: https://de.wikipedia.org/wiki/HTTP-Statuscode
