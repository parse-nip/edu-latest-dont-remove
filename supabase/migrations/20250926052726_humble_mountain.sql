/*
  # Create scores table

  1. New Tables
    - `scores`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, references submissions)
      - `judge_id` (uuid, references judges)
      - `criteria` (text, not null)
      - `score` (integer, not null, check 1-10)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `scores` table
    - Add policy for judges to manage their own scores
    - Add policy for hackathon participants to read scores
    - Add policy for organizers to read all scores in their hackathons
*/

CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
  judge_id uuid REFERENCES judges(id) ON DELETE CASCADE NOT NULL,
  criteria text NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 10),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(submission_id, judge_id, criteria)
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Judges can manage their own scores"
  ON scores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM judges j
      WHERE j.id = scores.judge_id
      AND (j.user_id = auth.uid() OR auth.uid() IN (
        SELECT hp.user_id FROM hackathon_participants hp
        WHERE hp.hackathon_id = j.hackathon_id
        AND hp.role = 'judge'
        AND hp.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Hackathon participants can read scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN hackathon_participants hp ON s.hackathon_id = hp.hackathon_id
      WHERE s.id = scores.submission_id
      AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can read all scores in their hackathons"
  ON scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN hackathons h ON s.hackathon_id = h.id
      WHERE s.id = scores.submission_id
      AND h.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN hackathon_participants hp ON s.hackathon_id = hp.hackathon_id
      WHERE s.id = scores.submission_id
      AND hp.user_id = auth.uid()
      AND hp.role = 'organizer'
    )
  );