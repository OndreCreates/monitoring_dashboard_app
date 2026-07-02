CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services (id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    message VARCHAR(500) NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_occurred_at ON events (occurred_at DESC);
