/*
  # Create team members table

  1. New Tables
    - `team_members`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `user_id` (uuid, references auth.users)
      - `joined_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `team_members` table
    - Add policy for team members to read their team membership
    - Add policy for users to join teams
    - Add policy for team creators to manage team membership
*/

CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read team memberships in their hackathons"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM teams t
      JOIN hackathon_participants hp ON t.hackathon_id = hp.hackathon_id
      WHERE t.id = team_members.team_id
      AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM teams t
      JOIN hackathon_participants hp ON t.hackathon_id = hp.hackathon_id
      WHERE t.id = team_members.team_id
      AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Team creators can manage team membership"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id
      AND t.created_by = auth.uid()
    )
  );