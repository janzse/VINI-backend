# RestAPI Routen

Stand 19.06.2018

## /api/car

- [GET] Gibt alle Transaktionen zu einer gegebenen VIN zurück.

## /api/car/applyCancelTransaction

- [POST] Erstellt eine neue Annulment Transaktion zu einem übergebenen transactionHash.

## /api/car/cancelTransaction

- [GET] Gibt alle existierenden Annulment Transaktionen zurück.

- [POST] Akzeptiert eine existierende Annulment Transaktion anhand eines übergebenen transactionHash.

- [DELETE] Löscht eine existierende Annulment Transaktion anhand eines übergebenen transactionHash.

## /api/car/mileage

- [POST] Aktualisiert den Kilometerstand zu einer übergebenen VIN auf einem gegebenen Wert.

## /api/car/register

- [POST] Aktualisiert den Zähler der Vorbesitzer und den Kilometerstand zu einer übergebenen VIN. Sollte das Auto
noch nicht exisiteren, wird ein neues angelegt.

## /api/car/service

- [POST] Trägt einen gemachten Service oder Ölwechsel zu einer übergebenen VIN ein und aktualisiert den Kilometerstand.

## /api/car/tuev

- [POST] Aktualisiert den TÜV-Status eines Autos, den Kilometerstand und den Termin für die nächste HU.

## /api/users/token

- [POST] Liefert ein Bearer Token für gültige, übergebene Password + Benutzername.

## /api/users/login

- [GET] Gibt den aktuellen Login-Status und das Rechte-Level zu einem übergebenen Bearer Token zurück.

## /api/users/register

- [DEL] Setzt den Benutzer zu einer übergebenen Email-Adresse auf blocked.
- [POST] Legt einen neuen Benutzer zu übergebenen Email, Passwort, Authorisierungs-Level, Vorname, Nachname,
Firmenname und Zeitstempel Daten an.
