CREATE TABLE "org_invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"invited_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "org_invitation_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "owner_id" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "domain" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "domain_auto_join" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "org_invitation" ADD CONSTRAINT "org_invitation_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_invitation" ADD CONSTRAINT "org_invitation_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;