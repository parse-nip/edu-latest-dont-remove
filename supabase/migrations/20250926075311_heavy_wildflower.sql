/*
  # Create hackathon platform tables

  1. New Tables
    - `hackathons`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, optional)
      - `start_at` (timestamptz)
      - `end_at` (timestamptz)
      - `status` (text, default 'upcoming')
      - `max_team_size` (integer, default 4)
      - `created_at` (timestamptz, default now)
      - `created_by` (uuid, references auth.users)

    - `hackathon_participants`
      - `id` (uuid, primary key)
      - `hackathon_id` (uuid, references hackathons)
      - `user_id` (uuid, references auth.users)
      - `display_name` (text, required)
      - `role` (text, default 'participant')
      - `join_code` (text, optional)
      - `created_at` (timestamptz, default now)

    - `teams`
      - `id` (uuid, primary key)
      - `hackathon_id` (uuid, references hackathons)
      - `name` (text, required)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz, default now)

    - `team_members`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `user_id` (uuid, references auth.users)
      - `joined_at` (timestamptz, default now)

    - `submissions`
      - `id` (uuid, primary key)
      - `hackathon_id` (uuid, references hackathons)
      - `team_id` (uuid, references teams)
      - `title` (text, required)
      - `description` (text, optional)
      - `repo_url` (text, optional)
      - `demo_url` (text, optional)
      - `submitted_by` (uuid, references auth.users)
      - `submitted_at` (timestamptz, default now)

    - `judges`
      - `id` (uuid, primary key)
      - `hackathon_id` (uuid, references hackathons)
      - `user_id` (uuid, references auth.users)
      - `name` (text, required)
      - `created_at` (timestamptz, default now)

    - `scores`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, references submissions)
      - `judge_id` (uuid, references judges)
      - `criteria` (text, required)
      - `score` (integer, 1-10)
      - `created_at` (timestamptz, default now)

    - `reviews`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, references submissions)
      - `judge_id` (uuid, references judges)
      - `rating` (integer, 1-10)
      - `comments` (text, optional)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for hackathon organizers to manage their events
*/

-- Create hackathons table
CREATE TABLE IF NOT EXISTS hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  status text DEFAULT 'upcoming',
  max_team_size integer DEFAULT 4,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create hackathon_participants table
CREATE TABLE IF NOT EXISTS hackathon_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  role text DEFAULT 'participant',
  join_code text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(hackathon_id, user_id)
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  repo_url text,
  demo_url text,
  submitted_by uuid REFERENCES auth.users(id),
  submitted_at timestamptz DEFAULT now()
);

-- Create judges table
CREATE TABLE IF NOT EXISTS judges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  judge_id uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  criteria text NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 10),
  created_at timestamptz DEFAULT now(),
  UNIQUE(submission_id, judge_id, criteria)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  judge_id uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comments text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(submission_id, judge_id)
);

-- Enable RLS on all tables
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hackathons
CREATE POLICY "Anyone can view hackathons"
  ON hackathons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create hackathons"
  ON hackathons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their hackathons"
  ON hackathons
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for hackathon_participants
CREATE POLICY "Users can view participants of hackathons they joined"
  ON hackathon_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_participants hp2
      WHERE hp2.hackathon_id = hackathon_participants.hackathon_id
      AND hp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join hackathons"
  ON hackathon_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for teams
CREATE POLICY "Users can view teams in hackathons they joined"
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

CREATE POLICY "Participants can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM hackathon_participants hp
      WHERE hp.hackathon_id = teams.hackathon_id
      AND hp.user_id = auth.uid()
    )
  );

-- RLS Policies for team_members
CREATE POLICY "Users can view team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM teams t
      JOIN hackathon_participants hp ON hp.hackathon_id = t.hackathon_id
      WHERE t.id = team_members.team_id
      AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for submissions
CREATE POLICY "Users can view submissions in hackathons they joined"
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

CREATE POLICY "Team members can create submissions"
  ON submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = submitted_by AND
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = submissions.team_id
      AND tm.user_id = auth.uid()
    )
  );

-- RLS Policies for judges
CREATE POLICY "Users can view judges"
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

CREATE POLICY "Organizers can add judges"
  ON judges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM hackathon_participants hp
      WHERE hp.hackathon_id = judges.hackathon_id
      AND hp.user_id = auth.uid()
      AND hp.role IN ('organizer', 'judge')
    )
  );

-- RLS Policies for scores
CREATE POLICY "Judges can view and manage their scores"
  ON scores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM judges j
      WHERE j.id = scores.judge_id
      AND j.user_id = auth.uid()
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Judges can view and manage their reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM judges j
      WHERE j.id = reviews.judge_id
      AND j.user_id = auth.uid()
    )
  );