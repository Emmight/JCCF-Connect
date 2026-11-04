CREATE TYPE "public"."administration_status" AS ENUM('upcoming', 'current', 'past');--> statement-breakpoint
CREATE TYPE "public"."executive_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "administrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description" text,
	"start_date" date,
	"end_date" date,
	"status" "administration_status" DEFAULT 'upcoming' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "administrations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "executives" (
	"id" serial PRIMARY KEY NOT NULL,
	"administration_id" integer NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"position" varchar(120) NOT NULL,
	"email" varchar(255),
	"photo_url" text,
	"biography" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "executive_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "executives" ADD CONSTRAINT "executives_administration_id_administrations_id_fk" FOREIGN KEY ("administration_id") REFERENCES "public"."administrations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "administrations_status_idx" ON "administrations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "executives_administration_idx" ON "executives" USING btree ("administration_id");--> statement-breakpoint
CREATE INDEX "executives_position_idx" ON "executives" USING btree ("position");