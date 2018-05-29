# Installations-Guide

1. Node.JS installieren
2. Repository forken (und Upstream passend einrichten)
3. Eine Konsole öffnen (z.B. den internen Terminal von WebStorm)
4. “npm install” ausführen und etwas warten
5. Mit “npm start” den Server starten (Er wird zuerst transpiliert und dann gestartet)

## Fehlerbehebung

### "npm install" führt zu: Error: Can't find Python executable "python"

- Beliebige Konsole (z.B. PowerShell) als Admin starten
- ```npm --add-python-to-path='true' --debug install --global windows-build-tools```
- Warten bis sowohl die Visual Studio Build Tools, als auch Python installiert ist