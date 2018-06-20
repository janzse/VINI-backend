# RestAPI Routen

Stand 19.06.2018

## /api/car

- [GET] Gibt Test-Nachricht mit der übergebenen vin zurück.

## /api/car/applyCancelTransaction

- [POST] Erstellt eine neue Annulment Transaktion zu einem übergebenen transactionHash + userId

## /api/car/cancelTransaction

- [POST] Akzeptiert eine existierende Annulment Transaktion anhand eines übergebenen transactionHash + userId

- [DELETE] Löscht eine existierende Annulment Transaktion anhand eines übergebenen transactionHash

## /api/car/mileage

- [POST] Funktioniert. Schreibt Transaktion in die BlockChain.

## /api/car/register

- [POST] Funktioniert. Schreibt Transaktion in die BlockChain.

## /api/car/service

- [POST] Funktioniert. Schreibt Transaktion in die BlockChain.

## /api/car/tuev

- [POST] Funktioniert. Schreibt Transaktion in die BlockChain.

## /api/login

- [POST] VERALTET De siehe /api/users/login

## /api/register

- [DEL] VERALTET De siehe /api/users/register
- [POST] VERALTET De siehe /api/users/register

## /api/users/token

- [POST] Funktioniert.

## /api/users/login

- [GET] Funktioniert.

## /api/users/register

- [DEL] Funktioniert.
- [POST] Funktioniert.