import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons, submissions, teams, scores } from '@/db/schema';
import { eq, sum, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = parseInt(params.id);
    
    if (!hackathonId || isNaN(hackathonId)) {
      return NextResponse.json({
        error: "Valid hackathon ID is required",
        code: "INVALID_HACKATHON_ID"
      }, { status: 400 });
    }

    // Check if hackathon exists
    const hackathon = await db.select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId))
      .limit(1);

    if (hackathon.length === 0) {
      return NextResponse.json({
        error: "Hackathon not found",
        code: "HACKATHON_NOT_FOUND"
      }, { status: 404 });
    }

    // Get leaderboard data with total scores
    const leaderboardData = await db
      .select({
        submissionId: submissions.id,
        title: submissions.title,
        teamName: teams.name,
        repoUrl: submissions.repoUrl,
        demoUrl: submissions.demoUrl,
        totalScore: sql<number>`COALESCE(SUM(${scores.score}), 0)`.as('totalScore')
      })
      .from(submissions)
      .innerJoin(teams, eq(submissions.teamId, teams.id))
      .leftJoin(scores, eq(submissions.id, scores.submissionId))
      .where(eq(submissions.hackathonId, hackathonId))
      .groupBy(submissions.id, submissions.title, teams.name, submissions.repoUrl, submissions.demoUrl)
      .orderBy(sql`totalScore DESC`);

    // Convert totalScore to number for each record
    const formattedLeaderboard = leaderboardData.map(item => ({
      submissionId: item.submissionId,
      title: item.title,
      teamName: item.teamName,
      repoUrl: item.repoUrl,
      demoUrl: item.demoUrl,
      totalScore: Number(item.totalScore)
    }));

    return NextResponse.json(formattedLeaderboard);

  } catch (error) {
    console.error('GET leaderboard error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}