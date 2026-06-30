-- Add the optional Gender field (enum + nullable column). Hand-authored, mirroring
-- 0001. Idempotent guards so a re-run (e.g. partial apply) is safe.
DO $$ BEGIN
  CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "gender" "gender";
