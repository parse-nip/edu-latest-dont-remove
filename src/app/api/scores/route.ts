import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scores, submissions, judges } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
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

    // Validate submission_id and judge_id are valid integers
    const submissionId = parseInt(submission_id);
    const judgeId = parseInt(judge_id);

    if (isNaN(submissionId)) {
      return NextResponse.json({ 
        error: "Valid submission ID is required",
        code: "INVALID_SUBMISSION_ID" 
      }, { status: 400 });
    }

    if (isNaN(judgeId)) {
      return NextResponse.json({ 
        error: "Valid judge ID is required",
        code: "INVALID_JUDGE_ID" 
      }, { status: 400 });
    }

    // Validate submission exists
    const submission = await db.select()
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (submission.length === 0) {
      return NextResponse.json({ 
        error: "Submission not found",
        code: "SUBMISSION_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate judge exists
    const judge = await db.select()
      .from(judges)
      .where(eq(judges.id, judgeId))
      .limit(1);

    if (judge.length === 0) {
      return NextResponse.json({ 
        error: "Judge not found",
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

    // Process each score (upsert logic)
    const processedScores = [];
    const currentTimestamp = Math.floor(Date.now() / 1000);

    for (const scoreItem of scoresArray) {
      const criteria = scoreItem.criteria.trim();
      const scoreValue = parseInt(scoreItem.score);

      // Check if score already exists for this combination
      const existingScore = await db.select()
        .from(scores)
        .where(and(
          eq(scores.submissionId, submissionId),
          eq(scores.judgeId, judgeId),
          eq(scores.criteria, criteria)
        ))
        .limit(1);

      if (existingScore.length > 0) {
        // Update existing score
        const updated = await db.update(scores)
          .set({
            score: scoreValue
          })
          .where(and(
            eq(scores.submissionId, submissionId),
            eq(scores.judgeId, judgeId),
            eq(scores.criteria, criteria)
          ))
          .returning();

        processedScores.push(updated[0]);
      } else {
        // Insert new score
        const newScore = await db.insert(scores)
          .values({
            submissionId: submissionId,
            judgeId: judgeId,
            criteria: criteria,
            score: scoreValue,
            createdAt: currentTimestamp
          })
          .returning();

        processedScores.push(newScore[0]);
      }
    }

    return NextResponse.json(processedScores, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}