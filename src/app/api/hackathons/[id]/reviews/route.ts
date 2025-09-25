import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, submissions, judges, hackathons } from '@/db/schema';
import { eq, avg, desc } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Validate hackathon ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid hackathon ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const hackathonId = parseInt(id);

    // Check if hackathon exists
    const hackathon = await db.select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId))
      .limit(1);

    if (hackathon.length === 0) {
      return NextResponse.json({ 
        error: 'Hackathon not found' 
      }, { status: 404 });
    }

    // Get all reviews with submission and judge information
    const reviewsWithDetails = await db.select({
      id: reviews.id,
      rating: reviews.rating,
      comments: reviews.comments,
      createdAt: reviews.createdAt,
      submissionId: reviews.submissionId,
      title: submissions.title,
      judgeId: reviews.judgeId,
      judgeName: judges.name
    })
    .from(reviews)
    .innerJoin(submissions, eq(reviews.submissionId, submissions.id))
    .innerJoin(judges, eq(reviews.judgeId, judges.id))
    .where(eq(submissions.hackathonId, hackathonId))
    .orderBy(desc(reviews.createdAt));

    // Calculate average rating per submission
    const averageRatings = await db.select({
      submissionId: reviews.submissionId,
      averageRating: avg(reviews.rating)
    })
    .from(reviews)
    .innerJoin(submissions, eq(reviews.submissionId, submissions.id))
    .where(eq(submissions.hackathonId, hackathonId))
    .groupBy(reviews.submissionId);

    // Create a map of submission ID to average rating
    const avgRatingMap = new Map(
      averageRatings.map(item => [
        item.submissionId, 
        Math.round((item.averageRating || 0) * 100) / 100
      ])
    );

    // Enhance reviews with average ratings
    const enhancedReviews = reviewsWithDetails.map(review => ({
      ...review,
      submissionAverageRating: avgRatingMap.get(review.submissionId) || 0
    }));

    return NextResponse.json(enhancedReviews);

  } catch (error) {
    console.error('GET reviews error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}