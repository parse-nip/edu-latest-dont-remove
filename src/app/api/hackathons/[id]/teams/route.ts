import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = params.id;

    // Validate hackathon ID
    if (!hackathonId) {
      return NextResponse.json({ 
        error: "Valid hackathon ID is required",
        code: "INVALID_HACKATHON_ID" 
      }, { status: 400 });
    }

    // Verify hackathon exists
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', hackathonId)
      .single();

    if (hackathonError || !hackathon) {
      return NextResponse.json({ 
        error: 'Hackathon not found' 
      }, { status: 404 });
    }

    // Get teams for this hackathon
    const { data: teamList, error } = await supabase
      .from('teams')
      .select('*')
      .eq('hackathon_id', hackathonId);

    if (error) {
      console.error('GET error:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json(teamList);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = params.id;

    // Validate hackathon ID
    if (!hackathonId) {
      return NextResponse.json({ 
        error: "Valid hackathon ID is required",
        code: "INVALID_HACKATHON_ID" 
      }, { status: 400 });
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({
        error: "Authentication required",
        code: "UNAUTHENTICATED"
      }, { status: 401 });
    }

    // Verify hackathon exists
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', hackathonId)
      .single();

    if (hackathonError || !hackathon) {
      return NextResponse.json({ 
        error: 'Hackathon not found' 
      }, { status: 404 });
    }

    const { name } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Team name is required",
        code: "MISSING_TEAM_NAME" 
      }, { status: 400 });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: "Team name must be a non-empty string",
        code: "INVALID_TEAM_NAME" 
      }, { status: 400 });
    }

    // Create new team
    const { data, error } = await supabase
      .from('teams')
      .insert({
        hackathon_id: hackathonId,
        name: name.trim(),
        created_by: user.id
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