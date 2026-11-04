CREATE TYPE "public"."announcement_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'publish', 'archive', 'approve', 'reject', 'login', 'logout');--> statement-breakpoint
CREATE TYPE "public"."birthday_visibility" AS ENUM('public', 'executive', 'private');--> statement-breakpoint
CREATE TYPE "public"."media_asset_status" AS ENUM('draft', 'approved', 'archived');--> statement-breakpoint
CREATE TYPE "public"."media_request_status" AS ENUM('pending', 'in_review', 'assigned', 'approved', 'rejected', 'completed');--> statement-breakpoint
CREATE TYPE "public"."media_task_status" AS ENUM('pending', 'in_progress', 'submitted', 'approved', 'rejected', 'archived');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"summary" text,
	"content" text NOT NULL,
	"category" varchar(80) DEFAULT 'announcement' NOT NULL,
	"status" "announcement_status" DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "announcements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" integer,
	"action" "audit_action" NOT NULL,
	"entity_type" varchar(120) NOT NULL,
	"entity_id" integer,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "birthday_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"month" integer NOT NULL,
	"day" integer NOT NULL,
	"visibility" "birthday_visibility" DEFAULT 'public' NOT NULL,
	"is_opted_out" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"category" "media_category" DEFAULT 'image' NOT NULL,
	"status" "media_asset_status" DEFAULT 'draft' NOT NULL,
	"visibility" "media_visibility" DEFAULT 'private' NOT NULL,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"mime_type" varchar(120),
	"file_size" bigint,
	"uploaded_by" integer,
	"folder_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_name" varchar(150) NOT NULL,
	"requester_email" varchar(255),
	"request_type" varchar(120) NOT NULL,
	"programme_name" varchar(200),
	"description" text NOT NULL,
	"deadline" date,
	"status" "media_request_status" DEFAULT 'pending' NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer,
	"title" varchar(200) NOT NULL,
	"assignee_name" varchar(150),
	"deadline" date,
	"status" "media_task_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_admin_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "birthday_records" ADD CONSTRAINT "birthday_records_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_admin_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_folder_id_media_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_requests" ADD CONSTRAINT "media_requests_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_tasks" ADD CONSTRAINT "media_tasks_request_id_media_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."media_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcements_status_idx" ON "announcements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "announcements_category_idx" ON "announcements" USING btree ("category");--> statement-breakpoint
CREATE INDEX "announcements_featured_idx" ON "announcements" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "birthday_records_month_day_idx" ON "birthday_records" USING btree ("month","day");--> statement-breakpoint
CREATE INDEX "birthday_records_visibility_idx" ON "birthday_records" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "media_assets_status_idx" ON "media_assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_assets_category_idx" ON "media_assets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "media_assets_visibility_idx" ON "media_assets" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "media_requests_status_idx" ON "media_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_requests_deadline_idx" ON "media_requests" USING btree ("deadline");--> statement-breakpoint
CREATE INDEX "media_tasks_status_idx" ON "media_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_tasks_request_idx" ON "media_tasks" USING btree ("request_id");