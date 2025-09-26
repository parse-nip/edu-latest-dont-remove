/*
  # Create judges table

  1. New Tables
    - `judges`
      - `id` (uuid, primary key)
      - `hackathon_id` (uuid, references hackathons)
      - `user_id` (uuid, references auth.users)
      - `name` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `judges` table
    - Add policy for hackathon participants to read judges
    - Add policy for organizers to manage judges in their hackathons
*/

CREATE TABLE IF NOT EXISTS judges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid REFERENCES hackathons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE judges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hackathon participants can read judges"
  ON judges
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_participants hp 
      WHERE hp.hackathon_id = judges.hackathon_id 
      AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can manage judges in their hackathons"
  ON judges
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hackathons h
      WHERE h.id = judges.hackathon_id
      AND h.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM hackathon_participants hp
      WHERE hp.hackathon_id = judges.hackathon_id
      AND hp.user_id = auth.uid()
      AND hp.role = 'organizer'
    )
  );