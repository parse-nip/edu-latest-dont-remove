import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, submissions, judges } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
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
    const submissionIdInt = parseInt(submission_id);
    if (isNaN(submissionIdInt)) {
      return NextResponse.json({ 
        error: "Submission ID must be a valid integer",
        code: "INVALID_SUBMISSION_ID" 
      }, { status: 400 });
    }

    const judgeIdInt = parseInt(judge_id);
    if (isNaN(judgeIdInt)) {
      return NextResponse.json({ 
        error: "Judge ID must be a valid integer",
        code: "INVALID_JUDGE_ID" 
      }, { status: 400 });
    }

    const ratingInt = parseInt(rating);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 10) {
      return NextResponse.json({ 
        error: "Rating must be an integer between 1 and 10",
        code: "INVALID_RATING" 
      }, { status: 400 });
    }

    // Check if submission exists
    const submission = await db.select()
      .from(submissions)
      .where(eq(submissions.id, submissionIdInt))
      .limit(1);

    if (submission.length === 0) {
      return NextResponse.json({ 
        error: "Submission not found",
        code: "SUBMISSION_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if judge exists
    const judge = await db.select()
      .from(judges)
      .where(eq(judges.id, judgeIdInt))
      .limit(1);

    if (judge.length === 0) {
      return NextResponse.json({ 
        error: "Judge not found",
        code: "JUDGE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate that judge belongs to same hackathon as submission
    if (judge[0].hackathonId !== submission[0].hackathonId) {
      return NextResponse.json({ 
        error: "Judge does not belong to the same hackathon as the submission",
        code: "HACKATHON_MISMATCH" 
      }, { status: 400 });
    }

    // Check if review already exists (for upsert behavior)
    const existingReview = await db.select()
      .from(reviews)
      .where(and(
        eq(reviews.submissionId, submissionIdInt),
        eq(reviews.judgeId, judgeIdInt)
      ))
      .limit(1);

    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (existingReview.length > 0) {
      // Update existing review
      const updatedReview = await db.update(reviews)
        .set({
          rating: ratingInt,
          comments: comments || null
        })
        .where(and(
          eq(reviews.submissionId, submissionIdInt),
          eq(reviews.judgeId, judgeIdInt)
        ))
        .returning();

      return NextResponse.json(updatedReview[0], { status: 200 });
    } else {
      // Create new review
      const newReview = await db.insert(reviews)
        .values({
          submissionId: submissionIdInt,
          judgeId: judgeIdInt,
          rating: ratingInt,
          comments: comments || null,
          createdAt: currentTimestamp
        })
        .returning();

      return NextResponse.json(newReview[0], { status: 201 });
    }

  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}