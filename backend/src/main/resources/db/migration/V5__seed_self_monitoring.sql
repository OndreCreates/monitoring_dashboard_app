-- The backend monitors itself, same as demo-service-a/b: registered as a regular
-- row in `services`, polled by the exact same scheduler over the exact same
-- HTTP+actuator path (see MetricCollectorScheduler) — no special-cased code path.
-- "backend" is the docker-compose service name, resolvable only inside that network
-- (same caveat as the demo-service-a/b seed in V2 when running outside docker-compose).
INSERT INTO services (name, url, tags) VALUES
    ('monitoring-dashboard-backend', 'http://backend:8080/actuator/health', 'internal')
ON CONFLICT (name) DO NOTHING;
