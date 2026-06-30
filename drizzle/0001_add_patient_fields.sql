-- Add Patient ID (external) + Address 1/2 (rename street -> address1), and the
-- IMPORT audit action. Hand-authored to guarantee a non-destructive RENAME of
-- "street" (drizzle-kit would otherwise prompt rename-vs-drop interactively).

ALTER TYPE "public"."audit_action" ADD VALUE IF NOT EXISTS 'IMPORT';--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "patient_external_id" text;--> statement-breakpoint
ALTER TABLE "patients" RENAME COLUMN "street" TO "address1";--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "address2" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "patients_external_id_idx" ON "patients" USING btree ("patient_external_id");
