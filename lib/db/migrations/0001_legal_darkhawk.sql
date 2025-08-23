CREATE TABLE "user_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"clerk_id" varchar(255) NOT NULL,
	"profile_id" integer,
	"date" date NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"time_minutes" integer NOT NULL,
	"nuts" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"clerk_id" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"age" integer,
	"ethnicity" varchar(50),
	"rating" numeric(3, 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_clerk_unique" UNIQUE("user_id","clerk_id")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "trial_end" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "clerk_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_interactions_user_id" ON "user_interactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_interactions_clerk_id" ON "user_interactions" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "idx_user_interactions_date" ON "user_interactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_user_id" ON "user_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_clerk_id" ON "user_profiles" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "idx_users_clerk_id" ON "users" USING btree ("clerk_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id");