import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = params.id;
    
    if (!hackathonId) {
      return NextResponse.json({
        error: "Hackathon ID is required",
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

    const requestBody = await request.json();
    const { display_name, role, join_code } = requestBody;

    // Validate required fields
    if (!display_name) {
      return NextResponse.json({
        error: "Display name is required",
        code: "MISSING_DISPLAY_NAME"
      }, { status: 400 });
    }

    // Validate role if provided
    const validRoles = ['participant', 'judge', 'organizer'];
    const participantRole = role || 'participant';
    
    if (!validRoles.includes(participantRole)) {
      return NextResponse.json({
        error: "Role must be one of: participant, judge, organizer",
        code: "INVALID_ROLE"
      }, { status: 400 });
    }

    // Validate hackathon exists
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', hackathonId)
      .single();

    if (hackathonError || !hackathon) {
      return NextResponse.json({
        error: "Hackathon not found",
        code: "HACKATHON_NOT_FOUND"
      }, { status: 404 });
    }

    // Create participant
    const { data, error } = await supabase
      .from('hackathon_participants')
      .insert({
        hackathon_id: hackathonId,
        user_id: user.id,
        display_name: display_name.trim(),
        role: participantRole,
        join_code: join_code || null
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate entry
      if (error.code === '23505') {
        return NextResponse.json({
          error: "Already joined this hackathon",
          code: "ALREADY_JOINED"
        }, { status: 400 });
      }
      
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