import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons, submissions, scores } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = params.id;

    // Validate hackathon ID
    if (!hackathonId || isNaN(parseInt(hackathonId))) {
      return NextResponse.json({
        error: "Valid hackathon ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if hackathon exists
    const hackathon = await db.select()
      .from(hackathons)
      .where(eq(hackathons.id, parseInt(hackathonId)))
      .limit(1);

    if (hackathon.length === 0) {
      return NextResponse.json({
        error: "Hackathon not found",
        code: "HACKATHON_NOT_FOUND"
      }, { status: 404 });
    }

    // Get submissions with aggregate scores
    const submissionsWithScores = await db
      .select({
        id: submissions.id,
        title: submissions.title,
        teamId: submissions.teamId,
        repoUrl: submissions.repoUrl,
        demoUrl: submissions.demoUrl,
        description: submissions.description,
        avgScore: sql<number>`COALESCE(AVG(CAST(${scores.score} AS REAL)), 0)`.as('avgScore'),
        totalScore: sql<number>`COALESCE(SUM(${scores.score}), 0)`.as('totalScore')
      })
      .from(submissions)
      .leftJoin(scores, eq(submissions.id, scores.submissionId))
      .where(eq(submissions.hackathonId, parseInt(hackathonId)))
      .groupBy(
        submissions.id,
        submissions.title,
        submissions.teamId,
        submissions.repoUrl,
        submissions.demoUrl,
        submissions.description
      )
      .orderBy(sql`totalScore DESC`);

    return NextResponse.json(submissionsWithScores, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}