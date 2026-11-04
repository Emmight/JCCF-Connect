CREATE TYPE "public"."programme_category" AS ENUM('worship', 'prayer', 'bible_study', 'conference', 'seminar', 'outreach', 'fellowship', 'other');--> statement-breakpoint
CREATE TYPE "public"."programme_status" AS ENUM('draft', 'published', 'cancelled', 'completed');--> statement-breakpoint
CREATE TABLE "programmes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"description" text,
	"category" "programme_category" DEFAULT 'other' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"start_time" varchar(20),
	"end_time" varchar(20),
	"venue" varchar(255),
	"image_url" text,
	"registration_url" text,
	"status" "programme_status" DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "programmes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "programmes_status_idx" ON "programmes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "programmes_category_idx" ON "programmes" USING btree ("category");--> statement-breakpoint
CREATE INDEX "programmes_start_date_idx" ON "programmes" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "programmes_featured_idx" ON "programmes" USING btree ("is_featured");