ALTER TABLE "session_chat" ADD COLUMN "selectedDoctor" json NOT NULL;--> statement-breakpoint
ALTER TABLE "session_chat" ADD COLUMN "createdOn" timestamp NOT NULL;