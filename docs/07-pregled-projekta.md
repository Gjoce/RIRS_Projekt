# Pregled prevzetega projekta

Prevzeti projekt: **Backtesting-Tool** ([Kyuhi1/RIRS_Projekt](https://github.com/Kyuhi1/RIRS_Projekt)), fork: [Gjoce/RIRS_Projekt](https://github.com/Gjoce/RIRS_Projekt).

Pregledani so bili dokumentacija (`docs/01`–`docs/07`, ADR 0001–0008, wireframi), koda backenda in frontenda ter obstoječi avtomatski testi. Aplikacija je spletno orodje za backtesting trgovalnih strategij nad zgodovinskimi podatki (Parquet + DuckDB) z vlogami trgovec, mentor in administrator. Sestavljena je iz treh storitev (nginx s statičnim frontendom, Node.js 24 backend, PostgreSQL 16), ki jih zažene Docker Compose.

## Implementirane funkcionalnosti za MVP

Dokument `docs/02` kot MVP označuje F1, F3, F4, F6, F7, F11 in F12. Vse so implementirane in pokrite z avtomatskimi testi backenda:

| Funkcionalnost | Stanje | Kje |
|---|---|---|
| F1 Registracija, prijava, vloge | implementirano | `auth.ts`, `session.ts`, `guarded(...)` v `app.ts`; JWT v `httpOnly` piškotku |
| F3 Nalaganje in nastavitev strategije | implementirano | `strategies.ts`, `strategyUpload.ts` (JS datoteka do 100 KB, `default_params` JSON) |
| F4 Izbira sredstev, borze, obdobja in zagon testa | implementirano | `backtestsApi.ts`, `candles.ts` (DuckDB nad Parquet), izvajanje v izoliranem delavcu (`strategyWorker.ts`) |
| F6 Stroški borze | implementirano | `simulation.ts` (maker/taker provizija, razpon pri `pay_spread`), bruto/stroški/neto |
| F7 Pravila financiranega računa | implementirano | `propRules.ts` (cilj dobička, dnevna in skupna izguba, datum prve kršitve, `challenge_passed`) |
| F11 Oddaja testa mentorju | implementirano | `backtestReview.ts`, `testStatus.ts` (stroj stanj, `status_history`), ponovitev testa s `previous_id` |
| F12 Mentorjev dashboard, komentarji, napake | implementirano | `mentorReview.ts`, `comments.ts` (`is_mistake`), odobritev in zahteva sprememb |

Poleg MVP so implementirane tudi funkcionalnosti izven MVP: pregled in katalog strategij (F2), prikaz rezultatov s krivuljo kapitala in posli (F5), primerjava testov (F8), deljenje (F9), povezava mentor–trgovec (F10), analitika učencev (F13) ter administracija referenčnih podatkov in uporabnikov (F14). Projekt je torej obsežnejši od zahtevanega MVP.

## Ujemanje z uporabniškimi zgodbami (5 zgodb)

| Zgodba | Ocena | Ugotovitve |
|---|---|---|
| **US-01 Registracija** | zadošča | Vloga `admin` ni izbirna (tudi ne prek API-ja), geslo najmanj 8 znakov, bcrypt, sporočilo »Račun s tem e-naslovom že obstaja« (`409`), napake se prikažejo ob poljih, po registraciji preusmeritev na prijavo. Vseh 5 meril je izpolnjenih (`register.test.ts`). |
| **US-02 Prijava in vloge** | zadošča | Enako sporočilo za napačen e-naslov ali geslo, »Račun je blokiran« (`403`), `401`/`403` za zaščitene poti, odjava izbriše piškotek. Odstopanje (dokumentirano v ADR 0006): vloga in blokada se preverita ob vsakem zahtevku iz baze, kar je strožje od zahteve. |
| **US-04 Nalaganje strategije** | zadošča | Ime 3–80 znakov, datoteka do 100 KB, preverjanje formata in JSON parametrov, nova strategija je `private`, strategije z izvedenimi testi ni mogoče izbrisati (prikaže se število testov). |
| **US-05 Zagon testa** | delno | Izbira strategije, sredstev, borze in obdobja (prednastavitve in ročno), preverjanje razpona podatkov, shranjevanje v stanju `draft` in parametri, ki ne prepišejo `default_params`, so implementirani. **Odstopanje:** merilo 4 zahteva prekinitev po 60 s, implementacija pa ima omejitev 5 minut (`strategy.ts`, `timeoutMs = 300_000`; nginx `proxy_read_timeout 330s`), ker izračun nad celotnimi minutnimi podatki traja dlje. |
| **US-12 Oddaja testa mentorju** | zadošča | Oddaja samo lastnega `draft` testa ob aktivni povezavi (sicer namig »Najprej se poveži z mentorjem«), prehodi v `status_history`, umik samo v stanju `submitted`, »Ponovi test« ustvari nov `draft` s `previous_id`, komentarji in napake so vidni trgovcu samo za branje. |

**Sklep:** implementirane funkcionalnosti v celoti pokrivajo MVP in v pregledanih zgodbah zadoščajo merilom sprejemljivosti, z izjemo časovne omejitve pri US-05 (5 min namesto 60 s), ki je zavestna sprememba zaradi velikosti podatkov, a ni zapisana med znanimi odstopanji v `docs/07-implementacijska-dokumentacija.md`.

## Druge ugotovitve ob pregledu

- Frontend ni imel avtomatskih testov (navedeno tudi med znanimi odstopanji); v okviru naloge so dodani testi z Vitest.
- Obstoječi CI (`ci.yml`) je imel en sam job brez linterja, cachinga, artefaktov in namestitve; nadomeščen je z `ci-cd.yml`.
- Projekt uporablja TypeScript 7 (nativni prevajalnik), ki ga `typescript-eslint` še ne podpira, zato je za lint uporabljen **oxlint** (ESLint-združljiva pravila).
- Frontend je klical API samo na isti domeni (nginx proxy). Za ločeno namestitev frontenda in backenda sta dodana `VITE_API_URL` (frontend) ter `CORS_ORIGIN` s piškotkom `SameSite=None; Secure; Partitioned` (backend).
- Backend teste je mogoče lokalno zagnati samo s PostgreSQL (`docker compose run --rm --build backend npm test`), ker vsak testni fajl ustvari začasno bazo.
