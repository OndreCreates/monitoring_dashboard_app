CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    url VARCHAR(512) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE metrics (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_metrics_service_id_recorded_at ON metrics (service_id, recorded_at);

CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services (id) ON DELETE CASCADE,
    metric_name VARCHAR(255) NOT NULL,
    threshold DOUBLE PRECISION NOT NULL,
    comparison VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_alerts_service_id ON alerts (service_id);

CREATE TABLE alert_events (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT NOT NULL REFERENCES alerts (id) ON DELETE CASCADE,
    triggering_value DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) NOT NULL,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_alert_events_alert_id ON alert_events (alert_id);
