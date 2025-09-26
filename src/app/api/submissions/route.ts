import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getAuthenticatedUser } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser(request);
    
    if (authError || !user) {
      return NextResponse.json({
        error: "Authentication required",
        code: "UNAUTHENTICATED"
      }, { status: 401 });
    }

    const body = await request.json();
    const { hackathon_id, team_id, title, repo_url, demo_url, description } = body;

    // Validate required fields
    if (!hackathon_id) {
      return NextResponse.json({ 
        error: "hackathon_id is required",
        code: "MISSING_HACKATHON_ID" 
      }, { status: 400 });
    }

    if (!team_id) {
      return NextResponse.json({ 
        error: "team_id is required",
        code: "MISSING_TEAM_ID" 
      }, { status: 400 });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ 
        error: "title is required and must be a non-empty string",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    const supabase = createServerClient();
    
    // Validate hackathon exists
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', hackathon_id)
      .single();

    if (hackathonError || !hackathon) {
      return NextResponse.json({ 
        error: "Hackathon not found",
        code: "HACKATHON_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate team exists
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', team_id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ 
        error: "Team not found",
        code: "TEAM_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate team belongs to the hackathon
    if (team.hackathon_id !== hackathon_id) {
      return NextResponse.json({ 
        error: "Team does not belong to the specified hackathon",
        code: "TEAM_HACKATHON_MISMATCH" 
      }, { status: 400 });
    }

    // Create submission
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        hackathon_id: hackathon_id,
        team_id: team_id,
        title: title.trim(),
        repo_url: repo_url ? repo_url.trim() : null,
        demo_url: demo_url ? demo_url.trim() : null,
        description: description ? description.trim() : null,
        submitted_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('POST error:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}