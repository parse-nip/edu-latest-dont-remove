/*
  # Create hackathons table

  1. New Tables
    - `hackathons`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, nullable)
      - `start_at` (timestamptz, not null)
      - `end_at` (timestamptz, not null)
      - `status` (text, default 'upcoming')
      - `max_team_size` (integer, default 4)
      - `created_at` (timestamptz, default now())
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on `hackathons` table
    - Add policy for organizers to manage their hackathons
    - Add policy for all authenticated users to read hackathons
*/

CREATE TABLE IF NOT EXISTS hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  status text DEFAULT 'upcoming' NOT NULL,
  max_team_size integer DEFAULT 4 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid()
);

ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all hackathons"
  ON hackathons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizers can manage their hackathons"
  ON hackathons
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM hackathon_participants 
      WHERE hackathon_id = hackathons.id 
      AND user_id = auth.uid() 
      AND role = 'organizer'
    )
  );