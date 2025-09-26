import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = cookies();
    const { id } = await context.params;

    // Validate hackathon ID
    if (!id) {
      return NextResponse.json({ 
        error: "Valid hackathon ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if hackathon exists
    const supabase = createSupabaseServerClient(cookieStore);
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', id)
      .single();

    if (hackathonError || !hackathon) {
      return NextResponse.json({ 
        error: 'Hackathon not found' 
      }, { status: 404 });
    }

    // Get all reviews with submission and judge information
    const { data: reviewsWithDetails, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comments,
        created_at,
        submission_id,
        judge_id,
        submissions!inner(
          title,
          hackathon_id
        ),
        judges!inner(
          name
        )
      `)
      .eq('submissions.hackathon_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET reviews error:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    // Calculate average rating per submission
    const submissionIds = [...new Set(reviewsWithDetails?.map(r => r.submission_id) || [])];
    const avgRatings: Record<string, number> = {};

    for (const submissionId of submissionIds) {
      const submissionReviews = reviewsWithDetails?.filter(r => r.submission_id === submissionId) || [];
      if (submissionReviews.length > 0) {
        const totalRating = submissionReviews.reduce((sum, r) => sum + r.rating, 0);
        avgRatings[submissionId] = Math.round((totalRating / submissionReviews.length) * 100) / 100;
      }
    }

    // Enhance reviews with average ratings
    const enhancedReviews = (reviewsWithDetails || []).map(review => ({
      id: review.id,
      rating: review.rating,
      comments: review.comments,
      createdAt: review.created_at,
      submissionId: review.submission_id,
      title: review.submissions.title,
      judgeId: review.judge_id,
      judgeName: review.judges.name,
      submissionAverageRating: avgRatings[review.submission_id] || 0
    }));

    return NextResponse.json(enhancedReviews);

  } catch (error) {
    console.error('GET reviews error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}