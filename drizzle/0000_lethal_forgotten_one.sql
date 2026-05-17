CREATE TYPE "public"."platform" AS ENUM ('ios', 'android', 'desktop_win', 'desktop_mac', 'web');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM ('admin', 'customer');--> statement-breakpoint
CREATE TABLE "releases"
(
  "id"            uuid PRIMARY KEY                       NOT NULL,
  "app_id"        varchar(50)                            NOT NULL,
  "platform"      "platform"                             NOT NULL,
  "version"       varchar(30)                            NOT NULL,
  "min_version"   varchar(30)                            NOT NULL,
  "is_mandatory"  boolean                  DEFAULT false NOT NULL,
  "is_released"   boolean                  DEFAULT false NOT NULL,
  "download_url"  text,
  "store_url"     text,
  "release_notes" jsonb,
  "created_at"    timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions"
(
  "id"             uuid PRIMARY KEY                       NOT NULL,
  "user_id"        uuid                                   NOT NULL,
  "application_id" varchar(50)                            NOT NULL,
  "platform"       "platform",
  "token_hash"     text                                   NOT NULL,
  "device_id"      text,
  "user_agent"     text,
  "ip_address"     "inet",
  "created_at"     timestamp with time zone DEFAULT now() NOT NULL,
  "last_used_at"   timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at"     timestamp with time zone               NOT NULL,
  "revoked_at"     timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users"
(
  "id"            uuid PRIMARY KEY                            NOT NULL,
  "email"         varchar(320)                                NOT NULL,
  "name"          varchar(120)                                NOT NULL,
  "password_hash" text                                        NOT NULL,
  "role"          "user_role"              DEFAULT 'customer' NOT NULL,
  "created_at"    timestamp with time zone DEFAULT now()      NOT NULL,
  "updated_at"    timestamp with time zone DEFAULT now()      NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions"
  ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "releases_app_platform_idx" ON "releases" USING btree ("app_id", "platform");--> statement-breakpoint
CREATE UNIQUE INDEX "releases_app_platform_version_unique" ON "releases" USING btree ("app_id", "platform", "version");--> statement-breakpoint
CREATE INDEX "sessions_user_application_idx" ON "sessions" USING btree ("user_id", "application_id");--> statement-breakpoint
CREATE INDEX "sessions_user_application_device_idx" ON "sessions" USING btree ("user_id", "application_id", "device_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");