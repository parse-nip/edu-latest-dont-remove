import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getAuthenticatedUser } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies();
    const { id: hackathonId } = await context.params;
    
    if (!hackathonId) {
      return NextResponse.json({ 
        error: "Valid hackathon ID is required",
        code: "INVALID_HACKATHON_ID" 
      }, { status: 400 });
    }

    // Validate hackathon exists
    const supabase = createSupabaseServerClient(cookieStore);
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

    // Get all judges for the hackathon
    const { data: judgesList, error } = await supabase
      .from('judges')
      .select('*')
      .eq('hackathon_id', hackathonId);

    if (error) {
      console.error('GET error:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json(judgesList);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies();
    const { id: hackathonId } = await context.params;
    
    if (!hackathonId) {
      return NextResponse.json({ 
        error: "Valid hackathon ID is required",
        code: "INVALID_HACKATHON_ID" 
      }, { status: 400 });
    }

    // Get user from session
    const { user, error: authError } = await getAuthenticatedUser(request);
    
    if (authError || !user) {
      return NextResponse.json({
        error: "Authentication required",
        code: "UNAUTHENTICATED"
      }, { status: 401 });
    }

    const supabase = createSupabaseServerClient(cookieStore);
    // Validate hackathon exists
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
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: "Name must be a non-empty string",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    // Create new judge
    const { data, error } = await supabase
      .from('judges')
      .insert({
        hackathon_id: hackathonId,
        user_id: user.id,
        name: name.trim()
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