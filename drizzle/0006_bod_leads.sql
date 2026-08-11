CREATE TYPE "public"."bod_contact_channel" AS ENUM('PHONE', 'ZALO', 'VIBER', 'WHATSAPP', 'FACEBOOK', 'EMAIL', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."bod_lead_source" AS ENUM('FOUNDER_REFERRAL', 'COMMUNITY', 'PARTNER', 'DIGITAL', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."bod_lead_status" AS ENUM('NEW', 'ASSIGNED', 'CONTACTING', 'CONTACTED', 'QUALIFIED', 'APPOINTMENT', 'ENROLLED', 'NOT_INTERESTED', 'UNABLE_TO_REACH', 'NOT_ELIGIBLE');--> statement-breakpoint
CREATE TYPE "public"."bod_lead_tier" AS ENUM('TIER_1', 'TIER_2A', 'TIER_2B');--> statement-breakpoint
CREATE TYPE "public"."bod_service" AS ENUM('CCM', 'MTM_CMR', 'EM_TELEHEALTH', 'CCM_PLUS', 'SELF_PAY', 'UNDECIDED', 'OTHER');--> statement-breakpoint
CREATE TABLE "bod_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_no" bigserial NOT NULL,
	"lead_source" "bod_lead_source" NOT NULL,
	"referrer_user_id" uuid NOT NULL,
	"referrer" text NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"state" text NOT NULL,
	"dob_enc" text,
	"tier" "bod_lead_tier" NOT NULL,
	"preferred_contact_channel" "bod_contact_channel" NOT NULL,
	"consent_to_contact" boolean NOT NULL,
	"consent_date" timestamp with time zone,
	"service_interested" "bod_service",
	"founder_note" text,
	"lead_status" "bod_lead_status" DEFAULT 'NEW' NOT NULL,
	"date_received" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_modified_by" uuid,
	"last_modified_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	CONSTRAINT "bod_leads_lead_no_unique" UNIQUE("lead_no")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
UPDATE "users" SET "name" = split_part("email", '@', 1) WHERE "name" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bod_leads" ADD CONSTRAINT "bod_leads_referrer_user_id_users_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bod_leads" ADD CONSTRAINT "bod_leads_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bod_leads" ADD CONSTRAINT "bod_leads_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bod_leads" ADD CONSTRAINT "bod_leads_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bod_leads_status_idx" ON "bod_leads" USING btree ("lead_status");--> statement-breakpoint
CREATE INDEX "bod_leads_received_idx" ON "bod_leads" USING btree ("date_received");--> statement-breakpoint
CREATE INDEX "bod_leads_referrer_idx" ON "bod_leads" USING btree ("referrer_user_id");--> statement-breakpoint
CREATE INDEX "bod_leads_customer_idx" ON "bod_leads" USING btree ("customer_name");--> statement-breakpoint
CREATE INDEX "bod_leads_phone_idx" ON "bod_leads" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "bod_leads_active_idx" ON "bod_leads" USING btree ("date_received") WHERE "bod_leads"."deleted_at" IS NULL;