# mPSdigital
Verwaltungssystem für Lehrkräfte und Schüler im Projektunterricht

## Installation

### Voraussetzungen
* Git
* Fürs Setup mit Containern (empfohlen):
    * Docker Engine
    * Docker Compose
* Fürs manuelle Setup:
    * Node 20
    * `npm`
    * `yarn`
    * Postgres

### Installation
1. Repository klonen
```sh
git clone https://github.com/Wunst/mPSdigital /srv && cd /srv
```

2. Im Repository-Verzeichnis eine `.env`-Datei mit Secrets und Umgebungsvariablen anlegen, z.B.:
```sh
#HTTPS_PORT = 3443                          # default: 443
#HTTP_PORT = 3080                           # default: 80

COOKIE_SECRET = muSuJqdO7FPIPq9IlYFY        # your cookie secret (a random base64-encoded string)

SSL_CERT="-----BEGIN CERTIFICATE-----
...
...
-----END CERTIFICATE-----"                  # your SSL certificate

SSL_KEY="-----BEGIN PRIVATE KEY-----
...
...
-----END PRIVATE KEY-----"                  # your SSL certificate's private key
# SSL is not strictly required if you use a reverse proxy with HTTPS.

#POSTGRES_HOST = 192.168.1.10               # default: postgres (Docker service)
#POSTGRES_PORT = 1234                       # default: 5432
#POSTGRES_USER = peter                      # default: mpsdigital
#POSTGRES_DB = aktenschrank                 # default: mpsdigital
#POSTGRES_PASSWORD = sichererespasswort     # default: trustno1 (for internal Docker service, should be more secure for a system-wide install!)
```

3. Docker-Container bauen und starten

**Achtung**: Dieser Schritt muss jedes Mal wiederholt werden, wenn die Software geupdatet oder die `.env`-Datei verändert wird. Diese Dateien werden beim Build in den Container eingebaut. (subject to change)

```sh
docker compose build && docker compose down && docker compose up -d
```

Nur bei der Ersteinrichtung: Die Datenbank initialisieren und einen Admin-Nutzer anlegen mit:

```sh
docker compose exec mpsdigital npm run setup
```

**ODER**

4. manuell starten (Postgres muss selbst konfiguriert werden, aber Ports etc. sind anpassbar)
```sh
npm install
npm run build
cd frontend && yarn && yarn build && cd ..
NODE_ENV=production npm run start
```
