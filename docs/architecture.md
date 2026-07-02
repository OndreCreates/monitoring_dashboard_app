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
- **demo-service-b** běží na portu `8082` a má `POST /simulate-failure` —
  na 60 sekund přepne interní `HealthIndicator` do stavu DOWN (self-expiring
  podle uloženého deadline, žádný scheduled reset job), takže `/actuator/health`
  po tu dobu vrací DOWN a pak se sám vrátí na UP. Demonstruje vyhodnocení
  alert pravidel (Fáze 5) bez nutnosti službu skutečně shazovat.

Obě demo služby mají v `application.yml` exponovaný i Actuator `metrics`
endpoint (`/actuator/metrics/{name}`), aby z nich backend mohl číst CPU/paměť
(viz sekce Sběr metrik níže).

**Seed dat:** oba demo servisy jsou vloženy Flyway migrací `V2__seed_demo_services.sql`,
aby `docker-compose up` fungoval jako kompletní demo bez ručního
`POST /api/v1/services` kroku. Obecná registrace monitorovaných služeb pro
reálné použití pořád jde přes API, ne přes migrace — tohle je výjimka jen
pro tyhle dvě demo služby, co jsou součástí repa.

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

**Rozšíření (Fáze 5a):** kromě `response_time_ms` scheduler sbírá i:
- `health_status` — `1.0`/`0.0`, zaznamená se při **každém** pollu (i když
  health check selže — to je jediná metrika, kde chyba znamená zapsat `0.0`,
  ne metriku vynechat, protože jinak by "službа je down" nešlo z dat vůbec poznat).
- `cpu_usage`, `memory_used` — čtené z `/actuator/metrics/system.cpu.usage`
  a `/actuator/metrics/jvm.memory.used` na monitorované službě (URL odvozená
  z `Service.url` odseknutím `/actuator/health` a připojením `/actuator/metrics/{name}`).
  Při chybě (služba nedostupná, endpoint neexistuje) se metrika prostě
  vynechá pro daný cyklus — žádná hodnota je lepší než zavádějící nula.

`Metric.name` je obyčejný `String`, ne enum — přidání dalšího typu metriky
nevyžaduje migraci ani změnu entity, jen novou volání ve scheduleru.
SSE broadcaster (`ServiceStatusBroadcaster`) je od začátku generický podle
`metric.getName()`, takže žádnou úpravu pro nové metriky nepotřeboval.

**Rozšíření (produktová vize — "monitoring platforma pro moderní webové
aplikace"):** aby appka odpovídala reálnějšímu use case (víc než jen
CPU/RAM), scheduler navíc sbírá:
- `disk_free` — `/actuator/metrics/disk.free`, stejný vzorec jako cpu/memory.
- `request_count` — kumulativní `COUNT` z `/actuator/metrics/http.server.requests`
  (bez tagu). Je to *kumulativní čítač celkového provozu*, ne "requestů za
  poslední interval" — počítá se do něj i provoz, který na monitorovanou
  službu generuje sám náš scheduler (health checky, metrics polling).
- `error_count` — stejný endpoint s `?tag=outcome:SERVER_ERROR`. Dokud
  nenastala první chyba, Actuator na tenhle tag vrací 404 — scheduler to
  bere stejně jako ostatní chyby (metrika se pro ten cyklus prostě vynechá).

⚠️ **Známá nekonzistence:** `cpu_usage` čte `system.cpu.usage` (zátěž **celého
systému/kontejneru**), zatímco `memory_used` čte `jvm.memory.used` (paměť
**konkrétní té appky**). Kdyby šlo o skutečně srovnatelné metriky, `cpu_usage`
by měl číst `process.cpu.usage` místo `system.cpu.usage`. Zatím to necháváme
takhle, ale je to vědomý dluh, ne přehlédnutí.

## Historie událostí (Event)

Kromě time-series metrik appka vede i **kurovanou časovou osu událostí**
(entita `Event`) — ne syrové čtení stdout logu monitorovaných služeb.
Důvod: Actuator sám o sobě "tail logu" nedává (vyžadovalo by to zapnout
`/actuator/logfile` a fyzicky zapisovat log soubor), a i kdyby, byla by to
hlavně stěna Tomcat/Hibernate INFO řádků — pro portfolio demo nezajímavé.
Místo toho `EventService` zaznamenává strukturované, smysluplné momenty,
které backend už tak jako tak sleduje:

- `SERVICE_REGISTERED` — při vytvoření přes `POST /api/v1/services`
  (seed data přes Flyway migraci tenhle event nemají, protože nejdou přes
  `ServiceService.create()`).
- `HEALTH_UP` / `HEALTH_DOWN` — detekce přechodu stavu, ne každý poll.
  Poslední známý stav se drží v in-memory mapě ve `EventService` (ne v DB),
  aby hlavní polling cyklus zůstal levný — po restartu backendu se tak první
  poll každé služby nepočítá jako "přechod" (nemáme s čím srovnat).
- `ALERT_TRIGGERED` / `ALERT_RESOLVED` — zrcadlí `AlertEvent` lifecycle.

Broadcast přes nový SSE event typ `event` (vedle existujících `metric` a
`alert`), stejný `ServiceStatusBroadcaster`.

## Vyhodnocování alertů

`AlertEvaluationService.evaluate(service, metricName, value)` se volá po
každém zapsání metriky ve scheduleru. Pro every `Alert` pravidlo se stejnou
`Service` + `metricName`, které je `enabled`:

- pokud hodnota poruší `threshold` (`GREATER_THAN`/`LESS_THAN`) a **není**
  už otevřený `TRIGGERED` `AlertEvent` → založí se nový,
- pokud hodnota přestane porušovat threshold a **existuje** otevřený
  `TRIGGERED` event → přepne se na `RESOLVED` (`resolvedAt` vyplní),
- jinak nic — záměrně, aby se nespamoval nový `AlertEvent` každý poll cyklus,
  dokud stav trvá.

## Testy

`AlertEvaluationServiceTest` a `ServiceServiceTest` jsou izolované unit testy
(Mockito, žádná Spring kontext ani DB). `MonitoringDashboardApplicationTests`
a `ServiceRepositoryIntegrationTest` běží proti reálnému PostgreSQL přes
Testcontainers (`@ServiceConnection`) — ověřují i to, že Flyway migrace
skutečně projdou, ne jen že se kód zkompiluje.

⚠️ **Gotcha:** Spring Boot 3.3.0 spravuje Testcontainers `1.19.8`, jehož
bundlovaný `docker-java` neumí mluvit s novějšími verzemi Docker Engine API
(konkrétně: `BadRequestException` / "Could not find a valid Docker
environment" i na správně nastaveném `DOCKER_HOST`). Řešení je override verze
v `backend/build.gradle` přes `ext.set('testcontainers.version', '1.21.4')`
(klíč musí být přesně `testcontainers.version` s tečkou, ne camelCase —
to je název property, kterou čte Spring Boot dependency-management plugin).
Pokud testy s Testcontainers znovu začnou padat na podobné chybě, tohle je
první věc ke kontrole.

## Retence dat (known concern)

Time-series metriky (`Metric`) budou časem růst bez omezení. Potřebují retention
policy (např. mazání/agregace dat starších než N dní), ale konkrétní implementace
(scheduled cleanup job, partitioning, downsampling...) je otevřená a bude řešena
až ve Fázi 5, kdy vznikne doménová logika. Zmiňuje se zde jen jako známé riziko,
aby se na něj nezapomnělo.

## TODO — rozhodnutí odložená na pozdější fáze

- **Retention policy** pro metriky (a časem i events) — mazání/agregace
  starých dat, konkrétní implementace zatím otevřená.
- **Frontend** zatím nezobrazuje `disk_free`/`request_count`/`error_count`
  ani `Event` timeline — to je samostatný krok.
- **Fáze 4 (docker/CI):** funkční frontend Dockerfile a CI pipeline —
  teď jsou jen placeholdery. Chybí i testy (JUnit/Mockito/Testcontainers).
