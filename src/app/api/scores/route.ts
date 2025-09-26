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

    const { submission_id, judge_id, scores: scoresArray } = await request.json();

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

    if (!scoresArray || !Array.isArray(scoresArray) || scoresArray.length === 0) {
      return NextResponse.json({ 
        error: "Scores array is required and must not be empty",
        code: "MISSING_SCORES_ARRAY" 
      }, { status: 400 });
    }

    const supabase = createServerClient();
    
    // Validate submission exists
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

    // Validate judge exists and belongs to current user
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

    // Validate each score in the scores array
    for (const scoreItem of scoresArray) {
      if (!scoreItem.criteria || typeof scoreItem.criteria !== 'string' || scoreItem.criteria.trim() === '') {
        return NextResponse.json({ 
          error: "Each score must have a valid criteria string",
          code: "INVALID_CRITERIA" 
        }, { status: 400 });
      }

      if (scoreItem.score === undefined || scoreItem.score === null) {
        return NextResponse.json({ 
          error: "Each score must have a score value",
          code: "MISSING_SCORE_VALUE" 
        }, { status: 400 });
      }

      const scoreValue = parseInt(scoreItem.score);
      if (isNaN(scoreValue) || scoreValue < 1 || scoreValue > 10) {
        return NextResponse.json({ 
          error: "Score must be a number between 1 and 10 inclusive",
          code: "INVALID_SCORE_RANGE" 
        }, { status: 400 });
      }
    }

    // Process each score using upsert for both insert and update
    const scoresToUpsert = scoresArray.map(scoreItem => ({
      submission_id: submission_id,
      judge_id: judge_id,
      criteria: scoreItem.criteria.trim(),
      score: parseInt(scoreItem.score)
    }));

    const { data: processedScores, error } = await supabase
      .from('scores')
      .upsert(scoresToUpsert, {
        onConflict: 'submission_id,judge_id,criteria'
      })
      .select();

    if (error) {
      console.error('POST error:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json(processedScores, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}