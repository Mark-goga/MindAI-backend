CREATE TYPE "public"."platform" AS ENUM('ios', 'android', 'desktop_win', 'desktop_mac', 'web');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'customer');--> statement-breakpoint
CREATE TABLE "releases" (
	"id" uuid PRIMARY KEY NOT NULL,
	"app_id" varchar(50) NOT NULL,
	"platform" "platform" NOT NULL,
	"version" varchar(30) NOT NULL,
	"min_version" varchar(30) NOT NULL,
	"is_mandatory" boolean DEFAULT false NOT NULL,
	"download_url" text,
	"store_url" text,
	"release_notes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'customer' NOT NULL;--> statement-breakpoint
CREATE INDEX "releases_app_platform_idx" ON "releases" USING btree ("app_id","platform");--> statement-breakpoint
CREATE UNIQUE INDEX "releases_app_platform_version_unique" ON "releases" USING btree ("app_id","platform","version");