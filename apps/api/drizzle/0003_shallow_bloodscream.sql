CREATE TYPE "public"."media_category" AS ENUM('flyer', 'image', 'video', 'document', 'audio', 'logo', 'other');--> statement-breakpoint
CREATE TYPE "public"."media_visibility" AS ENUM('private', 'pending', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "media_folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"parent_folder_id" integer,
	"administration_id" integer,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent_folder_id_media_folders_id_fk" FOREIGN KEY ("parent_folder_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_administration_id_administrations_id_fk" FOREIGN KEY ("administration_id") REFERENCES "public"."administrations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_folders_parent_idx" ON "media_folders" USING btree ("parent_folder_id");--> statement-breakpoint
CREATE INDEX "media_folders_administration_idx" ON "media_folders" USING btree ("administration_id");