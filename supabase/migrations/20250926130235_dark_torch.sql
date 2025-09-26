/*
  # Fix hackathons created_by default value

  1. Changes
    - Add DEFAULT auth.uid() to hackathons.created_by column
    - This ensures RLS INSERT policy can properly validate the created_by field

  2. Security
    - Fixes RLS policy violation by automatically populating created_by field
    - Allows authenticated users to create hackathons successfully
*/

-- Add default value to created_by column to fix RLS policy
ALTER TABLE hackathons 
ALTER COLUMN created_by SET DEFAULT auth.uid();