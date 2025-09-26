import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await context.params;
    
    if (!hackathonId) {
      return NextResponse.json({
        error: "Valid hackathon ID is required",
        code: "INVALID_HACKATHON_ID"
      }, { status: 400 });
    }

    // Check if hackathon exists
    const supabase = createServerClient();
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

    // Get leaderboard data with total scores
    // First get all submissions for this hackathon with their teams
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        repo_url,
        demo_url,
        teams!inner(name)
      `)
      .eq('hackathon_id', hackathonId);

    if (submissionsError) {
      console.error('GET submissions error:', submissionsError);
      return NextResponse.json({
        error: submissionsError.message
      }, { status: 500 });
    }

    // Get scores for all submissions
    const submissionIds = submissions?.map(s => s.id) || [];
    
    let scoresData = [];
    if (submissionIds.length > 0) {
      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select('submission_id, score')
        .in('submission_id', submissionIds);

      if (scoresError) {
        console.error('GET scores error:', scoresError);
        return NextResponse.json({
          error: scoresError.message
        }, { status: 500 });
      }
      scoresData = scores || [];
    }

    // Calculate total scores per submission
    const scoresBySubmission = scoresData.reduce((acc, score) => {
      if (!acc[score.submission_id]) {
        acc[score.submission_id] = 0;
      }
      acc[score.submission_id] += score.score;
      return acc;
    }, {} as Record<string, number>);

    // Format leaderboard data
    const formattedLeaderboard = (submissions || []).map(submission => ({
      submissionId: submission.id,
      title: submission.title,
      teamName: submission.teams.name,
      repoUrl: submission.repo_url,
      demoUrl: submission.demo_url,
      totalScore: scoresBySubmission[submission.id] || 0
    })).sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json(formattedLeaderboard);

  } catch (error) {
    console.error('GET leaderboard error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}