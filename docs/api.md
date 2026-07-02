# API design

Konvence: všechny endpointy pod `/api/v1/...`, JSON, chyby ve formátu
`{ timestamp, status, message }` (viz `GlobalExceptionHandler`).

## Services

`Service` je spravovaná ručně (přes API), ne odvozená ze scheduleru — proto plné CRUD.

| Metoda | Cesta                  | Popis                    |
|--------|------------------------|--------------------------|
| GET    | `/api/v1/services`     | seznam všech služeb      |
| GET    | `/api/v1/services/{id}`| detail služby            |
| POST   | `/api/v1/services`     | založit službu           |
| PUT    | `/api/v1/services/{id}`| upravit službu           |
| DELETE | `/api/v1/services/{id}`| smazat službu            |

## Metrics

Read-only — metriky vznikají výhradně interně přes `MetricCollectorScheduler`
(pull model, viz [architecture.md](architecture.md)), ne přes API. Sbírané
`name` hodnoty: `health_status`, `response_time_ms`, `cpu_usage`, `memory_used`,
`disk_free`, `request_count`, `error_count` (poslední dva se objeví, jakmile
existují — viz architecture.md).

| Metoda | Cesta                                  | Popis                                  |
|--------|-----------------------------------------|-----------------------------------------|
| GET    | `/api/v1/services/{serviceId}/metrics`  | historie metrik dané služby (nejnovější první) |

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
| GET    | `/api/v1/events`                     | posledních 50 událostí napříč všemi službami |
| GET    | `/api/v1/services/{serviceId}/events`| historie událostí dané služby                |

## Real-time (SSE)

| Metoda | Cesta                       | Popis                                                     |
|--------|-----------------------------|------------------------------------------------------------|
| GET    | `/api/v1/events/services`   | SSE stream se třemi typy eventů: `metric` (`ServiceMetricEvent`), `alert` (`AlertEventNotification`), `event` (`EventNotification`) |

## TODO

- Stránkování pro `GET /api/v1/services/{serviceId}/metrics` a `GET /api/v1/events`
  (zatím vrací celou/omezenou historii bez skutečného stránkování — pro
  portfolio rozsah OK, při reálném provozu by rostlo bez limitu).
