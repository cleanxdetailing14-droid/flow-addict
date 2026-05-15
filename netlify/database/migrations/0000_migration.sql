CREATE TABLE "courses" (
	"id" serial PRIMARY KEY,
	"titre" text NOT NULL,
	"type" text DEFAULT 'video' NOT NULL,
	"duree" text DEFAULT '' NOT NULL,
	"offre" text DEFAULT 'all' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"statut" text DEFAULT 'publie' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"pwd" text NOT NULL,
	"initials" text DEFAULT '' NOT NULL,
	"offer" text DEFAULT 'Formation Starter' NOT NULL,
	"status" text DEFAULT 'paye' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
