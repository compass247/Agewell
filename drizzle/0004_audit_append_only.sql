-- Custom SQL migration file, put your code below! --

-- audit_log must be append-only. The app treats it that way; this trigger
-- enforces it at the DB so neither an app bug nor an ad-hoc psql session can
-- rewrite history. (The app currently connects as the master user, so a
-- REVOKE would be meaningless — the trigger is a guardrail, not a privilege
-- boundary. A dedicated low-privilege phi_app role is on the real-PHI gate
-- checklist, see backend/phi/README.md.)
CREATE OR REPLACE FUNCTION audit_log_block_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DROP TRIGGER IF EXISTS audit_log_no_mutation ON "audit_log";
--> statement-breakpoint
CREATE TRIGGER audit_log_no_mutation
  BEFORE UPDATE OR DELETE ON "audit_log"
  FOR EACH ROW EXECUTE FUNCTION audit_log_block_mutation();
