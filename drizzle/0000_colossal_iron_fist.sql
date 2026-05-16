CREATE TABLE "sessions"
(
  "id"             uuid PRIMARY KEY         DEFAULT gen_random_uuid() NOT NULL,
  "user_id"        uuid                                               NOT NULL,
  "application_id" varchar(50)                                        NOT NULL,
  "platform"       varchar(20),
  "token_hash"     text                                               NOT NULL,
  "device_id"      text,
  "user_agent"     text,
  "ip_address"     "inet",
  "created_at"     timestamp with time zone DEFAULT now()             NOT NULL,
  "last_used_at"   timestamp with time zone DEFAULT now()             NOT NULL,
  "expires_at"     timestamp with time zone                           NOT NULL,
  "revoked_at"     timestamp with time zone
);

CREATE TABLE "users"
(
  "id"            uuid PRIMARY KEY         DEFAULT gen_random_uuid() NOT NULL,
  "email"         varchar(320)                                       NOT NULL,
  "name"          varchar(120)                                       NOT NULL,
  "password_hash" text                                               NOT NULL,
  "created_at"    timestamp with time zone DEFAULT now()             NOT NULL,
  "updated_at"    timestamp with time zone DEFAULT now()             NOT NULL
);

ALTER TABLE "sessions"
  ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_user_application_idx" ON "sessions" USING btree ("user_id", "application_id");--> statement-breakpoint
CREATE INDEX "sessions_user_application_device_idx" ON "sessions" USING btree ("user_id", "application_id", "device_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");