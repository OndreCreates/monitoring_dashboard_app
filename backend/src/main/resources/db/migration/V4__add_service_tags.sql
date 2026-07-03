-- Small tag list per service (e.g. "production,payments") — comma-joined in a single
-- column rather than a join table, sufficient at this scale (see StringListConverter).
ALTER TABLE services ADD COLUMN tags VARCHAR(255) NOT NULL DEFAULT '';
