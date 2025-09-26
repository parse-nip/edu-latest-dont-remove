/*
  # Create hackathon participants table

  1. New Tables
    - `hackathon_participants`
      - `id` (uuid, primary key)
      - `hackathon_id` (uuid, references hackathons)
      - `user_id` (uuid, references auth.users)
      - `display_name` (text, not null)
      - `role` (text, default 'participant')
      - `join_code` (text, nullable)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `hackathon_participants` table
    - Add policy for users to read participants in hackathons they're part of
    - Add policy for users to manage their own participation
    - Add policy for organizers to manage all participants in their hackathons
*/

CREATE TABLE IF NOT EXISTS hackathon_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid REFERENCES hackathons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name text NOT NULL,
  role text DEFAULT 'participant' NOT NULL CHECK (role IN ('participant', 'judge', 'organizer')),
  join_code text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(hackathon_id, user_id)
);

ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read participants in hackathons they're part of"
  ON hackathon_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_participants hp 
      WHERE hp.hackathon_id = hackathon_participants.hackathon_id 
      AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own participation"
  ON hackathon_participants
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organizers can manage participants in their hackathons"
  ON hackathon_participants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hackathons h
      WHERE h.id = hackathon_participants.hackathon_id
      AND h.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM hackathon_participants hp
      WHERE hp.hackathon_id = hackathon_participants.hackathon_id
      AND hp.user_id = auth.uid()
      AND hp.role = 'organizer'
    )
  );