import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = supabase
      .from('hackathons')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('GET error:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request);
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: "Authentication required",
        code: "UNAUTHENTICATED" 
      }, { status: 401 });
    }

    const requestBody = await request.json();
    const { name, description, start_at, end_at, status, max_team_size } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!start_at) {
      return NextResponse.json({ 
        error: "Start date is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!end_at) {
      return NextResponse.json({ 
        error: "End date is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate date logic
    const startDate = new Date(start_at);
    const endDate = new Date(end_at);

    if (startDate >= endDate) {
      return NextResponse.json({ 
        error: "End date must be after start date",
        code: "INVALID_DATE_RANGE" 
      }, { status: 400 });
    }

    const supabase = createServerClient();
    
    // Create hackathon
    const { data, error } = await supabase
      .from('hackathons')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        start_at: start_at,
        end_at: end_at,
        status: status || 'upcoming',
        max_team_size: max_team_size || 4,
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