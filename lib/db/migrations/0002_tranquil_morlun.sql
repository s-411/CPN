CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"icon_path" varchar(255) NOT NULL,
	"badge_color" varchar(7) NOT NULL,
	"criteria" jsonb NOT NULL,
	"display_order" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "cpn_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"score" integer NOT NULL,
	"category_scores" jsonb NOT NULL,
	"peer_percentile" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cpn_scores_score_check" CHECK ("cpn_scores"."score" >= 0 AND "cpn_scores"."score" <= 100),
	CONSTRAINT "cpn_scores_percentile_check" CHECK ("cpn_scores"."peer_percentile" IS NULL OR ("cpn_scores"."peer_percentile" >= 0 AND "cpn_scores"."peer_percentile" <= 100))
);
--> statement-breakpoint
CREATE TABLE "share_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"platform" varchar(50) NOT NULL,
	"referral_code" varchar(20) NOT NULL,
	"shared_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"achievement_id" integer NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_achievements_user_achievement_unique" UNIQUE("user_id","achievement_id")
);
--> statement-breakpoint
ALTER TABLE "cpn_scores" ADD CONSTRAINT "cpn_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpn_scores" ADD CONSTRAINT "cpn_scores_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_analytics" ADD CONSTRAINT "share_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_analytics" ADD CONSTRAINT "share_analytics_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cpn_scores_user_id" ON "cpn_scores" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cpn_scores_created_at" ON "cpn_scores" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_share_analytics_user_id" ON "share_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_share_analytics_referral_code" ON "share_analytics" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_user_id" ON "user_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_earned_at" ON "user_achievements" USING btree ("earned_at");