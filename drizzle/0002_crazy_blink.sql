ALTER TABLE "session_chat" ALTER COLUMN "createdBy" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "session_chat" ALTER COLUMN "notes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "session_chat" ALTER COLUMN "createdOn" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "session_chat" ALTER COLUMN "createdOn" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "session_chat" ADD CONSTRAINT "session_chat_createdBy_users_email_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;