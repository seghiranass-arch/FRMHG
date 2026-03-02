-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_away_team_id_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_home_team_id_fkey";

-- AlterTable
ALTER TABLE "matches" ALTER COLUMN "home_team_id" DROP NOT NULL,
ALTER COLUMN "away_team_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
