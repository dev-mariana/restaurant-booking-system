-- BEFORE UPDATE trigger that keeps updated_at in sync on every row update.
-- Runs in Postgres, independent of which code path performs the write
-- (creation endpoint vs. confirmation worker), per SDD section 4.2.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON tables;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON tables
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON reservations;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
