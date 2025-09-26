/*
  # Create teams table

  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `hackathon_id` (uuid, references hackathons)
      - `name` (text, not null)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `teams` table
    - Add policy for participants to read teams in their hackathons
    - Add policy for users to create teams in hackathons they're part of
    - Add policy for team creators and organizers to manage teams
*/

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid REFERENCES hackathons(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read teams in hackathons they're part of"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_participants hp 
      WHERE hp.hackathon_id = teams.hackathon_id 
      AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams in hackathons they're part of"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hackathon_participants hp 
      WHERE hp.hackathon_id = teams.hackathon_id 
      AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Team creators and organizers can manage teams"
  ON teams
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM hackathon_participants hp 
      WHERE hp.hackathon_id = teams.hackathon_id 
      AND hp.user_id = auth.uid() 
      AND hp.role IN ('organizer')
    )
  );