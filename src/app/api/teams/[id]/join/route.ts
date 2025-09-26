import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getAuthenticatedUser } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await context.params;
    
    // Validate team ID
    if (!teamId) {
      return NextResponse.json({ 
        error: "Valid team ID is required",
        code: "INVALID_TEAM_ID" 
      }, { status: 400 });
    }

    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser(request);
    
    if (authError || !user) {
      return NextResponse.json({
        error: "Authentication required",
        code: "UNAUTHENTICATED"
      }, { status: 401 });
    }

    const requestBody = await request.json();
    const { participant_id } = requestBody;

    // Validate required fields
    if (!participant_id) {
      return NextResponse.json({ 
        error: "Participant ID is required",
        code: "MISSING_PARTICIPANT_ID" 
      }, { status: 400 });
    }

    // 1. Validate team exists and get hackathon info
    const supabase = createServerClient();
    
    // 1. Validate team exists and get hackathon info
    const { data: teamWithHackathon, error: teamError } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        hackathon_id,
        hackathons!inner(max_team_size)
      `)
      .eq('id', teamId)
      .single();

    if (teamError || !teamWithHackathon) {
      return NextResponse.json({ 
        error: "Team not found",
        code: "TEAM_NOT_FOUND" 
      }, { status: 404 });
    }

    const team = teamWithHackathon;
    const maxTeamSize = team.hackathons.max_team_size;

    // 2. Check participant exists and is part of same hackathon
    const { data: participant, error: participantError } = await supabase
      .from('hackathon_participants')
      .select('*')
      .eq('id', participant_id)
      .eq('hackathon_id', team.hackathon_id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ 
        error: "Participant not found or not registered for this hackathon",
        code: "PARTICIPANT_NOT_FOUND" 
      }, { status: 404 });
    }

    // 3. Check participant isn't already on another team in this hackathon
    const { data: existingTeamMember, error: existingError } = await supabase
      .from('team_members')
      .select(`
        id,
        team_id,
        teams!inner(hackathon_id)
      `)
      .eq('user_id', participant.user_id)
      .eq('teams.hackathon_id', team.hackathon_id)
      .single();

    if (existingTeamMember && !existingError) {
      return NextResponse.json({ 
        error: "Participant is already on a team in this hackathon",
        code: "ALREADY_ON_TEAM" 
      }, { status: 400 });
    }

    // 4. Check team size doesn't exceed hackathon.maxTeamSize
    const { count: currentTeamSize, error: countError } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);

    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json({ 
        error: 'Failed to check team size' 
      }, { status: 500 });
    }

    if ((currentTeamSize || 0) >= maxTeamSize) {
      return NextResponse.json({ 
        error: `Team is full. Maximum team size is ${maxTeamSize}`,
        code: "TEAM_FULL" 
      }, { status: 400 });
    }

    // 5. Add participant to team if all validations pass
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: participant.user_id
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