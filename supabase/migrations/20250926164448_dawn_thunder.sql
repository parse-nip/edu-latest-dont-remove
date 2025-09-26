/*
  # Fix infinite recursion in hackathon_participants RLS policy

  1. Changes
    - Drop the existing recursive SELECT policy for hackathon_participants
    - Create a new non-recursive SELECT policy that allows users to view their own entries
    - This prevents infinite recursion while maintaining security

  2. Security
    - Users can only view their own participant entries
    - Other policies can safely reference hackathon_participants without recursion
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view participants of hackathons they joined" ON hackathon_participants;

-- Create a new non-recursive policy
CREATE POLICY "Users can view their own participant entry"
  ON hackathon_participants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);