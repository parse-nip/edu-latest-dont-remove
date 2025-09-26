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
    const { submission_id, judge_id, rating, comments } = body;

    // Validate required fields
    if (!submission_id) {
      return NextResponse.json({ 
        error: "Submission ID is required",
        code: "MISSING_SUBMISSION_ID" 
      }, { status: 400 });
    }

    if (!judge_id) {
      return NextResponse.json({ 
        error: "Judge ID is required",
        code: "MISSING_JUDGE_ID" 
      }, { status: 400 });
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json({ 
        error: "Rating is required",
        code: "MISSING_RATING" 
      }, { status: 400 });
    }

    // Validate field types and values
    const ratingInt = parseInt(rating);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 10) {
      return NextResponse.json({ 
        error: "Rating must be an integer between 1 and 10",
        code: "INVALID_RATING" 
      }, { status: 400 });
    }

    const supabase = createServerClient();
    
    // Check if submission exists
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({ 
        error: "Submission not found",
        code: "SUBMISSION_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if judge exists and belongs to current user
    const { data: judge, error: judgeError } = await supabase
      .from('judges')
      .select('*')
      .eq('id', judge_id)
      .eq('user_id', user.id)
      .single();

    if (judgeError || !judge) {
      return NextResponse.json({ 
        error: "Judge not found or not authorized",
        code: "JUDGE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate that judge belongs to same hackathon as submission
    if (judge.hackathon_id !== submission.hackathon_id) {
      return NextResponse.json({ 
        error: "Judge does not belong to the same hackathon as the submission",
        code: "HACKATHON_MISMATCH" 
      }, { status: 400 });
    }

    // Use upsert to handle both insert and update
    const { data, error } = await supabase
      .from('reviews')
      .upsert({
        submission_id: submission_id,
        judge_id: judge_id,
        rating: ratingInt,
        comments: comments || null
      }, {
        onConflict: 'submission_id,judge_id'
      })
      .select()
      .single();

    if (error) {
      console.error('POST /api/reviews error:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}