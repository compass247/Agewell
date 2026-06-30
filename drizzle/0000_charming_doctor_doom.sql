CREATE TYPE "public"."audit_action" AS ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'STATUS_CHANGE', 'MFA_ENROLL');--> statement-breakpoint
CREATE TYPE "public"."patient_status" AS ENUM('NEW', 'REVIEWED_BY_CS', 'ENTERED_IN_EMR', 'COMPLETE');--> statement-breakpoint
CREATE TYPE "public"."preferred_language" AS ENUM('ENGLISH', 'VIETNAMESE', 'SPANISH', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'BD', 'CS');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_id" uuid,
	"actor_email" text,
	"action" "audit_action" NOT NULL,
	"entity" text,
	"entity_id" uuid,
	"changes" jsonb,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "patient_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"body" text NOT NULL,
	"author_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"dob_enc" text NOT NULL,
	"primary_phone" text NOT NULL,
	"secondary_phone" text,
	"email" text,
	"street" text,
	"city" text,
	"state" text,
	"zip" text,
	"medicare_mbi_enc" text,
	"insurance_plan" text,
	"insurance_member_id" text,
	"emergency_name" text,
	"emergency_relationship" text,
	"emergency_phone" text,
	"referral_source" text,
	"preferred_language" "preferred_language" DEFAULT 'ENGLISH' NOT NULL,
	"notes" text,
	"status" "patient_status" DEFAULT 'NEW' NOT NULL,
	"assigned_cs_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_modified_by" uuid,
	"last_modified_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"mfa_secret" text,
	"mfa_enrolled_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_notes" ADD CONSTRAINT "patient_notes_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_notes" ADD CONSTRAINT "patient_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_assigned_cs_id_users_id_fk" FOREIGN KEY ("assigned_cs_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity","entity_id","at");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_log" USING btree ("actor_id","at");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_log" USING btree ("action","at");--> statement-breakpoint
CREATE INDEX "patient_notes_patient_idx" ON "patient_notes" USING btree ("patient_id","created_at");--> statement-breakpoint
CREATE INDEX "patients_status_idx" ON "patients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "patients_created_at_idx" ON "patients" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "patients_assigned_cs_idx" ON "patients" USING btree ("assigned_cs_id");--> statement-breakpoint
CREATE INDEX "patients_created_by_idx" ON "patients" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "patients_name_idx" ON "patients" USING btree ("last_name","first_name");--> statement-breakpoint
CREATE INDEX "patients_primary_phone_idx" ON "patients" USING btree ("primary_phone");--> statement-breakpoint
CREATE INDEX "patients_active_idx" ON "patients" USING btree ("created_at") WHERE "patients"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
-- ============================================================
-- Audit immutability (manually appended after drizzle generate).
-- The audit_log is append-only: reinforce the app-level "no update/delete
-- code path" with a DB trigger that raises on any UPDATE or DELETE. This is a
-- defense-in-depth control for HIPAA — even a bug or a direct SQL session
-- cannot rewrite history.
-- ============================================================
CREATE OR REPLACE FUNCTION audit_log_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER audit_log_no_update_delete
  BEFORE UPDATE OR DELETE ON "audit_log"
  FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();