# API design

Konvence: všechny endpointy pod `/api/v1/...`, JSON, chyby ve formátu
`{ timestamp, status, message }` (viz `GlobalExceptionHandler`).

Stránkované endpointy (metriky, eventy) vrací `PageResponse<T>` místo raw
Spring `Page` JSON:

```json
{
  "content": [ /* položky */ ],
  "page": 0,
  "size": 20,
  "totalElements": 309,
  "totalPages": 62
}
```

Standardní query parametry `page`, `size`, `sort` fungují na obou (Spring
`Pageable` binding).

## Services

`Service` je spravovaná ručně (přes API), ne odvozená ze scheduleru — proto plné CRUD.

| Metoda | Cesta                  | Popis                    |
|--------|------------------------|--------------------------|
| GET    | `/api/v1/services`     | seznam všech služeb      |
| GET    | `/api/v1/services/{id}`| detail služby            |
| POST   | `/api/v1/services`     | založit službu           |
| PUT    | `/api/v1/services/{id}`| upravit službu           |
| DELETE | `/api/v1/services/{id}`| smazat službu            |

`ServiceRequest`/`ServiceResponse` mají i `tags: string[]` (např.
`["production", "payments"]`) — volitelné, štítky pro filtrování/organizaci
služeb. Ukládá se jako jeden comma-joined sloupec (`StringListConverter`),
ne přes join tabulku — pro pár tagů na službu zbytečná složitost navíc.

## Metrics

Read-only — metriky vznikají výhradně interně přes `MetricCollectorScheduler`
(pull model, viz [architecture.md](architecture.md)), ne přes API. Sbírané
`name` hodnoty: `health_status`, `response_time_ms`, `cpu_usage`, `memory_used`,
`disk_free`, `request_count`, `error_count` (poslední dva se objeví, jakmile
existují — viz architecture.md).

| Metoda | Cesta                                  | Popis                                  |
|--------|-----------------------------------------|-----------------------------------------|
| GET    | `/api/v1/services/{serviceId}/metrics`  | stránkovaná historie metrik dané služby (nejnovější první) |

Volitelný query parametr `name` filtruje na jeden konkrétní typ metriky —
nutné použít při čtení konkrétního grafu (bez něj by stránkování mixovalo
všech 7 typů dohromady a "utopilo" hledaný typ v jedné stránce). Výchozí
velikost stránky je 20.

| GET    | `/api/v1/services/{serviceId}/metrics/uptime`  | uptime % za posledních N dní |

Query parametr `days` (výchozí 7). Počítá se jako `AVG(health_status)` přes
dané okno přímo v SQL (health_status je 0/1, průměr = podíl "up" vzorků) —
ne fetch všech řádků a výpočet na frontendu, což by u desítek tisíc vzorků
za týden bylo zbytečně nákladné. `percentage` je `null`, pokud služba v okně
nemá žádný záznam (např. čerstvě zaregistrovaná).

## Alerts

Pravidla spravuje uživatel — plné CRUD.

| Metoda | Cesta                                  | Popis                        |
|--------|------------------------------------------|-------------------------------|
| GET    | `/api/v1/alerts`                         | seznam všech alert pravidel   |
| GET    | `/api/v1/services/{serviceId}/alerts`    | alert pravidla dané služby    |
| GET    | `/api/v1/alerts/{id}`                    | detail pravidla               |
| POST   | `/api/v1/alerts`                         | založit pravidlo              |
| PUT    | `/api/v1/alerts/{id}`                    | upravit pravidlo              |
| DELETE | `/api/v1/alerts/{id}`                    | smazat pravidlo               |

## Alert events

Read-only — vznikají při vyhodnocení pravidla (`AlertEvaluationService`).

| Metoda | Cesta                              | Popis                          |
|--------|--------------------------------------|---------------------------------|
| GET    | `/api/v1/alerts/{alertId}/events`    | historie výskytů daného alertu |

## Events (timeline)

Read-only, kurovaná historie událostí (ne raw log) — viz architecture.md.

| Metoda | Cesta                              | Popis                                      |
|--------|--------------------------------------|---------------------------------------------|
| GET    | `/api/v1/events`                     | stránkovaná historie událostí napříč všemi službami (výchozí velikost 50) |
| GET    | `/api/v1/services/{serviceId}/events`| stránkovaná historie událostí dané služby (výchozí velikost 50) |

## Real-time (SSE)

| Metoda | Cesta                       | Popis                                                     |
|--------|-----------------------------|------------------------------------------------------------|
| GET    | `/api/v1/events/services`   | SSE stream se třemi typy eventů: `metric` (`ServiceMetricEvent`), `alert` (`AlertEventNotification`), `event` (`EventNotification`) |

## Retence dat

Metriky a eventy se automaticky mažou po vypršení retenční doby
(`RetentionCleanupScheduler`, viz [architecture.md](architecture.md)) —
metriky po 7 dnech, eventy po 30. Konfigurovatelné přes `retention.*`
v `application.yml`, žádný API endpoint pro to není potřeba.
