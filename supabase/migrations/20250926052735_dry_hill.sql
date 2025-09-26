/*
  # Create reviews table

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, references submissions)
      - `judge_id` (uuid, references judges)
      - `rating` (integer, not null, check 1-10)
      - `comments` (text, nullable)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `reviews` table
    - Add policy for judges to manage their own reviews
    - Add policy for hackathon participants to read reviews
    - Add policy for organizers to read all reviews in their hackathons
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
  judge_id uuid REFERENCES judges(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comments text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(submission_id, judge_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Judges can manage their own reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM judges j
      WHERE j.id = reviews.judge_id
      AND (j.user_id = auth.uid() OR auth.uid() IN (
        SELECT hp.user_id FROM hackathon_participants hp
        WHERE hp.hackathon_id = j.hackathon_id
        AND hp.role = 'judge'
        AND hp.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Hackathon participants can read reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN hackathon_participants hp ON s.hackathon_id = hp.hackathon_id
      WHERE s.id = reviews.submission_id
      AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can read all reviews in their hackathons"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN hackathons h ON s.hackathon_id = h.id
      WHERE s.id = reviews.submission_id
      AND h.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN hackathon_participants hp ON s.hackathon_id = hp.hackathon_id
      WHERE s.id = reviews.submission_id
      AND hp.user_id = auth.uid()
      AND hp.role = 'organizer'
    )
  );