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
(pull model, viz [architecture.md](architecture.md)), ne přes API.

| Metoda | Cesta                                  | Popis                                  |
|--------|-----------------------------------------|-----------------------------------------|
| GET    | `/api/v1/services/{serviceId}/metrics`  | historie metrik dané služby (nejnovější první) |

## Alerts

Pravidla spravuje uživatel — plné CRUD. Vyhodnocování pravidel (skutečné
generování `AlertEvent`) je doménová logika odložená do Fáze 5.

| Metoda | Cesta                                  | Popis                        |
|--------|------------------------------------------|-------------------------------|
| GET    | `/api/v1/alerts`                         | seznam všech alert pravidel   |
| GET    | `/api/v1/services/{serviceId}/alerts`    | alert pravidla dané služby    |
| GET    | `/api/v1/alerts/{id}`                    | detail pravidla               |
| POST   | `/api/v1/alerts`                         | založit pravidlo              |
| PUT    | `/api/v1/alerts/{id}`                    | upravit pravidlo              |
| DELETE | `/api/v1/alerts/{id}`                    | smazat pravidlo               |

## Alert events

Read-only — vznikají při vyhodnocení pravidla (Fáze 5).

| Metoda | Cesta                              | Popis                          |
|--------|--------------------------------------|---------------------------------|
| GET    | `/api/v1/alerts/{alertId}/events`    | historie výskytů daného alertu |

## Real-time (SSE)

| Metoda | Cesta                       | Popis                                                     |
|--------|-----------------------------|------------------------------------------------------------|
| GET    | `/api/v1/events/services`   | SSE stream, event `metric` s payloadem `ServiceMetricEvent` (serviceId, serviceName, metricName, value, recordedAt) pokaždé, když scheduler nasbírá novou metriku |

## TODO (Fáze 5)

- Skutečné vyhodnocování alert pravidel a generování `AlertEvent`.
- Stránkování pro `GET /api/v1/services/{serviceId}/metrics` (zatím vrací
  celou historii — pro portfolio rozsah OK, při reálném provozu by rostlo bez limitu).
