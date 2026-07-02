# API design

Zatím jen placeholder — konkrétní REST endpointy, DTO tvary a SSE kontrakt
vznikají ve Fázi 2 spolu s backend skeletonem.

## TODO (Fáze 2)

- REST endpointy pro `Service`, `Metric`, `Alert`, `AlertEvent` (CRUD tam, kde
  dává smysl — např. `Metric` a `AlertEvent` budou pravděpodobně jen read-only
  z pohledu API, protože vznikají interně přes scheduler).
- SSE endpoint pro real-time push aktualizací stavu služeb/metrik na frontend
  (viz [architecture.md](architecture.md) — jednosměrný push, proto SSE).
- Konvence pojmenování (`/api/v1/...`), formát chybových odpovědí, stránkování
  pro historické metriky.
