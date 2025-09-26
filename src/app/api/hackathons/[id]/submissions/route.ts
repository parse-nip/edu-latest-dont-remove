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
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if hackathon exists
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

    // Get all submissions for this hackathon
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        team_id,
        repo_url,
        demo_url,
        description
      `)
      .eq('hackathon_id', hackathonId);

    if (submissionsError) {
      console.error('GET submissions error:', submissionsError);
      return NextResponse.json({
        error: submissionsError.message
      }, { status: 500 });
    }

    const submissionIds = submissions?.map(s => s.id) || [];
    
    // Get scores for all submissions
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

    // Get reviews for all submissions
    let reviewsData = [];
    if (submissionIds.length > 0) {
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('submission_id, rating')
        .in('submission_id', submissionIds);

      if (reviewsError) {
        console.error('GET reviews error:', reviewsError);
        return NextResponse.json({
          error: reviewsError.message
        }, { status: 500 });
      }
      reviewsData = reviews || [];
    }

    // Calculate aggregated scores and ratings per submission
    const submissionStats = submissionIds.reduce((acc, id) => {
      const submissionScores = scoresData.filter(s => s.submission_id === id);
      const submissionReviews = reviewsData.filter(r => r.submission_id === id);
      
      const totalScore = submissionScores.reduce((sum, s) => sum + s.score, 0);
      const avgScore = submissionScores.length > 0 ? totalScore / submissionScores.length : 0;
      
      const totalRating = submissionReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = submissionReviews.length > 0 ? totalRating / submissionReviews.length : 0;

      acc[id] = {
        avgScore: Math.round(avgScore * 100) / 100,
        totalScore,
        avgRating: Math.round(avgRating * 100) / 100
      };
      return acc;
    }, {} as Record<string, { avgScore: number; totalScore: number; avgRating: number }>);

    // Format the results
    const formattedSubmissions = (submissions || []).map(submission => ({
      id: submission.id,
      title: submission.title,
      teamId: submission.team_id,
      repoUrl: submission.repo_url,
      demoUrl: submission.demo_url,
      description: submission.description,
      avgScore: submissionStats[submission.id]?.avgScore || 0,
      totalScore: submissionStats[submission.id]?.totalScore || 0,
      avgRating: submissionStats[submission.id]?.avgRating || 0
    })).sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json(formattedSubmissions, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}