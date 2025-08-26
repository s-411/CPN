CREATE TABLE "girls" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"age" integer NOT NULL,
	"nationality" varchar(50) NOT NULL,
	"rating" integer NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "girls_name_check" CHECK (LENGTH(TRIM("girls"."name")) > 0),
	CONSTRAINT "girls_age_check" CHECK ("girls"."age" >= 18 AND "girls"."age" <= 120),
	CONSTRAINT "girls_rating_check" CHECK ("girls"."rating" >= 1 AND "girls"."rating" <= 10),
	CONSTRAINT "girls_status_check" CHECK ("girls"."status" IN ('active', 'inactive', 'archived'))
);
--> statement-breakpoint
ALTER TABLE "girls" ADD CONSTRAINT "girls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "girls" ADD CONSTRAINT "girls_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_girls_user_id" ON "girls" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_girls_team_id" ON "girls" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_girls_user_team" ON "girls" USING btree ("user_id","team_id");--> statement-breakpoint
CREATE INDEX "idx_girls_status" ON "girls" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_girls_deleted_at" ON "girls" USING btree ("deleted_at");