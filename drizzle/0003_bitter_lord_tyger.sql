CREATE TABLE "auth_throttle" (
	"key" text PRIMARY KEY NOT NULL,
	"fail_count" integer DEFAULT 0 NOT NULL,
	"first_fail_at" timestamp with time zone,
	"locked_until" timestamp with time zone
);
