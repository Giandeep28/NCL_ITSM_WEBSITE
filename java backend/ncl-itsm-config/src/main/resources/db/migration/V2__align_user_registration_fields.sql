-- Align persisted users with the fields collected by account registration.
ALTER TABLE users ALTER COLUMN eis_number TYPE VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(256);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);
