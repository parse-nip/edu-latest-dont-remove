import { supabase } from './supabase';

export async function createTables() {
  console.log('[CREATE TABLES] Starting database setup...');
  
  try {
    // Create hackathons table
    const { error: hackathonsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS hackathons (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          start_date TIMESTAMPTZ NOT NULL,
          end_date TIMESTAMPTZ NOT NULL,
          registration_deadline TIMESTAMPTZ,
          max_participants INTEGER,
          prizes JSONB,
          rules TEXT,
          status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'judging', 'completed')),
          created_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
        
        ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view hackathons" ON hackathons FOR SELECT USING (true);
        CREATE POLICY "Users can create hackathons" ON hackathons FOR INSERT WITH CHECK (auth.uid() = created_by);
        CREATE POLICY "Creators can update their hackathons" ON hackathons FOR UPDATE USING (auth.uid() = created_by);
      `
    });
    
    if (hackathonsError) {
      console.error('[CREATE TABLES] Hackathons table error:', hackathonsError);
      throw hackathonsError;
    }
    
    console.log('[CREATE TABLES] Hackathons table created successfully');
    
    // Create teams table
    const { error: teamsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS teams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          created_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMPTZ DEFAULT now()
        );
        
        ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view teams" ON teams FOR SELECT USING (true);
        CREATE POLICY "Users can create teams" ON teams FOR INSERT WITH CHECK (auth.uid() = created_by);
      `
    });
    
    if (teamsError) {
      console.error('[CREATE TABLES] Teams table error:', teamsError);
      throw teamsError;
    }
    
    console.log('[CREATE TABLES] Teams table created successfully');
    
    // Create participants table
    const { error: participantsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS participants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
          joined_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(hackathon_id, user_id)
        );
        
        ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view participants" ON participants FOR SELECT USING (true);
        CREATE POLICY "Users can join hackathons" ON participants FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });
    
    if (participantsError) {
      console.error('[CREATE TABLES] Participants table error:', participantsError);
      throw participantsError;
    }
    
    console.log('[CREATE TABLES] All tables created successfully');
    return { success: true };
    
  } catch (error) {
    console.error('[CREATE TABLES] Failed to create tables:', error);
    return { success: false, error };
  }
}