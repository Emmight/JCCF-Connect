CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'admin', 'media_team');--> statement-breakpoint
CREATE TYPE "public"."admin_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"status" "admin_status" DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_unique" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "admin_users_role_idx" ON "admin_users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "admin_users_status_idx" ON "admin_users" USING btree ("status");