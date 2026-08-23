ALTER TABLE "user" ADD COLUMN "slug" text;
ALTER TABLE "user" ADD COLUMN "isPublic" integer NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX "user_slug_unique" ON "user" ("slug") WHERE "slug" IS NOT NULL;
