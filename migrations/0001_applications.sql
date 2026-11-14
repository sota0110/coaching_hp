PRAGMA foreign_keys = ON;
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  payload_hash TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX applications_expiry ON applications(expires_at);
CREATE TABLE mail_outbox (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('notification', 'reply')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  first_attempt_at INTEGER,
  next_attempt_at INTEGER NOT NULL,
  sent_at INTEGER,
  provider_id TEXT,
  last_error TEXT,
  UNIQUE(application_id, kind)
);
CREATE INDEX outbox_due ON mail_outbox(status, next_attempt_at);
CREATE TABLE rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
