# Installations-Guide

1. Node.JS installieren
2. Repository forken (und Upstream passend einrichten)
3. Eine Konsole öffnen (z.B. den internen Terminal von WebStorm)
4. “npm install” ausführen und etwas warten
5. Mit “npm start” den Server starten (Er wird zuerst transpiliert und dann gestartet)

## Fehlerbehebung

#### [Windows] "npm install" führt zu: Error: Can't find Python executable "python"

- Beliebige Konsole (z.B. PowerShell) als Admin starten
- ```npm --add-python-to-path='true' --debug install --global windows-build-tools```
- Warten bis sowohl die Visual Studio Build Tools, als auch Python installiert ist

# Informationen

## Adresse für die Web-App

https://vini-ethereum.westeurope.cloudapp.azure.com:4711

[Update 18-06-09] Die Web-App wurde auf einen anderen Server verschoben, so dass eine neue URL benutzt werden muss. Die
ursprüngliche URL (https://vini-backend.azurewebsites.net) wird zukünftig nicht mehr benötigt.

## RestAPI Routen

Informationen zum aktuellen Stand der RestAPI Routen sind unter [/src/routes/Readme.md](https://github.com/SGSE18/VINI-backend/tree/master/src/routes/ReadMe.md) zu finden.