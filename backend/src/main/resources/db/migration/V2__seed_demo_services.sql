-- Seeds the two demo services (see demo-services/) so docker-compose up
-- produces a working demo without a manual POST /api/v1/services step.
-- General service registration for real usage still goes through the API,
-- not migrations — see docs/architecture.md.
--
-- ON CONFLICT DO NOTHING: safe to re-run against a database where one of
-- these was already registered manually (e.g. during earlier manual testing)
-- before this migration existed.
INSERT INTO services (name, url) VALUES
    ('demo-service-a', 'http://demo-service-a:8081/actuator/health'),
    ('demo-service-b', 'http://demo-service-b:8082/actuator/health')
ON CONFLICT (name) DO NOTHING;
