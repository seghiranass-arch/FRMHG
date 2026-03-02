-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "result_type" TEXT;

-- CreateTable
CREATE TABLE "match_sheets" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "home_roster" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "away_roster" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_events" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "assist_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "strength" TEXT,
    "is_game_winning_goal" BOOLEAN NOT NULL DEFAULT false,
    "pim" INTEGER,
    "plus_minus_delta" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_player_stats" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "games_played" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" TEXT,

    CONSTRAINT "manual_player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_sheets_match_id_key" ON "match_sheets"("match_id");

-- CreateIndex
CREATE INDEX "match_events_player_id_idx" ON "match_events"("player_id");

-- CreateIndex
CREATE INDEX "match_events_team_id_idx" ON "match_events"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "manual_player_stats_member_id_competition_id_key" ON "manual_player_stats"("member_id", "competition_id");

-- CreateIndex
CREATE INDEX "manual_player_stats_competition_id_idx" ON "manual_player_stats"("competition_id");

-- AddForeignKey
ALTER TABLE "match_sheets" ADD CONSTRAINT "match_sheets_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "match_sheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_player_stats" ADD CONSTRAINT "manual_player_stats_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_player_stats" ADD CONSTRAINT "manual_player_stats_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_player_stats" ADD CONSTRAINT "manual_player_stats_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
