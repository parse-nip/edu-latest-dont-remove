/*
  # Create submissions table

  1. New Tables
    - `submissions`
      - `id` (uuid, primary key)
      - `hackathon_id` (uuid, references hackathons)
      - `team_id` (uuid, references teams)
      - `title` (text, not null)
      - `description` (text, nullable)
      - `repo_url` (text, nullable)
      - `demo_url` (text, nullable)
      - `submitted_by` (uuid, references auth.users)
      - `submitted_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `submissions` table
    - Add policy for hackathon participants to read all submissions
    - Add policy for team members to manage their team's submissions
    - Add policy for organizers to manage all submissions in their hackathons
*/

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid REFERENCES hackathons(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  repo_url text,
  demo_url text,
  submitted_by uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  submitted_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hackathon participants can read all submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_participants hp 
      WHERE hp.hackathon_id = submissions.hackathon_id 
      AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can manage their team's submissions"
  ON submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = submissions.team_id
      AND tm.user_id = auth.uid()
    ) OR
    submitted_by = auth.uid()
  );

CREATE POLICY "Organizers can manage all submissions in their hackathons"
  ON submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hackathons h
      WHERE h.id = submissions.hackathon_id
      AND h.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM hackathon_participants hp
      WHERE hp.hackathon_id = submissions.hackathon_id
      AND hp.user_id = auth.uid()
      AND hp.role = 'organizer'
    )
  );