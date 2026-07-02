# Architecture

Architecture Decision Record pro Monitoring Dashboard. Zachycuje rozhodnutí přijatá
ve Fázi 1 (scaffolding), aby na ně mohly navazovat Fáze 2+ bez nutnosti je řešit za běhu.

## Doménový model (konceptuálně)

Zatím bez SQL/DDL — jen entity a vztahy mezi nimi. Skutečné Flyway migrace vznikají
ve Fázi 2.

- **Service** — monitorovaná služba/systém (např. "payments-api"). Kořenová entita,
  ke které se váže vše ostatní.
- **Metric** — časová řada naměřených hodnot pro danou `Service` (např. CPU, response
  time). Jedna `Service` má mnoho `Metric` záznamů v čase.
- **Alert** — pravidlo definující, kdy se má `Service`/`Metric` považovat za problémovou
  (např. "response time > 500ms po dobu 5 minut"). Patří k jedné `Service`.
- **AlertEvent** — konkrétní výskyt vyhodnoceného `Alert` pravidla (kdy nastal, kdy
  případně skončil, jaká byla hodnota). Jeden `Alert` může mít mnoho `AlertEvent`.

Vztahy: `Service 1—N Metric`, `Service 1—N Alert`, `Alert 1—N AlertEvent`.

## Proč SSE, ne WebSocket

Tok dat je jednosměrný — backend posílá aktualizace stavu/metrik, frontend jen
naslouchá. Pro tenhle případ:

- SSE běží nad obyčejným HTTP/HTTP/2, žádná speciální infrastruktura navíc
  (na rozdíl od WebSocket upgrade handshake).
- Prohlížeč má vestavěné auto-reconnect (`EventSource`), není potřeba to řešit ručně.
- Nepotřebujeme obousměrnou komunikaci od klienta zpět — WebSocket by byl zbytečně
  komplexní pro tento use case.

## Proč monorepo

Reviewer (nebo budoucí zaměstnavatel) vidí celý systém — backend, frontend, docs —
v jednom checkoutu, bez nutnosti skládat kontext ze dvou repozitářů. Pro projekt
tohoto rozsahu nedává smysl repo dělit.

## Demo služby jako samostatné procesy

`demo-services/demo-service-a` a `demo-services/demo-service-b` jsou záměrně
samostatné Spring Boot moduly (multi-module Gradle build, viz root
`settings.gradle`), ne knihovny volané interně z backendu. Monitoring backend
je musí obcházet přes skutečnou síť (jiný proces, jiný port) — jinak by
monitoring netestoval nic reálného, jen by volal metody v rámci jednoho JVM.

- **demo-service-a** simuluje normální, zdravý provoz. Běží na portu `8081`,
  závislosti jen Spring Boot Web + Actuator (žádná DB/JPA — je to "hloupá"
  simulace, ne skutečná služba).
- **demo-service-b** běží na portu `8082` a v budoucnu (Fáze 5) přibude
  endpoint `/simulate-failure`, kterým bude možné manuálně vyvolat degradovaný
  stav a předvést vyhodnocení alert pravidel. Teď má jen Actuator health,
  žádný vlastní controller.

### Sběr metrik: pull model
Backend aktivně obchází monitorované služby přes scheduled job (`@Scheduled`)
a ptá se na jejich stav/metriky v pravidelném intervalu (např. každých 30s).

Zvažovaná alternativa: push model, kdy by monitorované služby samy posílaly
metriky na ingestion endpoint. Zamítnuto pro tuto fázi — pull je jednodušší
(žádná autentizace externích volajících, backend má plnou kontrolu nad
frekvencí sběru) a pro rozsah portfolia dostatečné.

Toto rozhodnutí ovlivňuje strukturu `service/` balíčku ve Fázi 2 — bude obsahovat
scheduler component (např. `MetricCollectorScheduler`), ne ingestion controller.

**Implementace (Fáze 2):** `MetricCollectorScheduler` neobchází natvrdo dvě
demo URL — obchází generic `List<Service>` z databáze (adresa je součástí
entity `Service.url`). Registrace monitorovaných služeb tedy jde přes API
(`POST /api/v1/services`), ne přes env proměnné — jednodušší a rozšiřitelnější
(přidání nové monitorované služby nevyžaduje redeploy backendu).

## Retence dat (known concern)

Time-series metriky (`Metric`) budou časem růst bez omezení. Potřebují retention
policy (např. mazání/agregace dat starších než N dní), ale konkrétní implementace
(scheduled cleanup job, partitioning, downsampling...) je otevřená a bude řešena
až ve Fázi 5, kdy vznikne doménová logika. Zmiňuje se zde jen jako známé riziko,
aby se na něj nezapomnělo.

## TODO — rozhodnutí odložená na pozdější fáze

- **Fáze 5 (doménová logika):** vyhodnocování alert pravidel (thresholds,
  time windows), retention policy pro metriky, případně agregace/downsampling,
  implementace `/simulate-failure` na `demo-service-b`.
- **Fáze 4 (docker/CI):** plná podoba Dockerfilů, docker-compose zdraví-checků
  a CI pipeline — teď jsou jen placeholdery.
