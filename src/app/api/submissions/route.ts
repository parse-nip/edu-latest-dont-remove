import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submissions, hackathons, teams } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hackathon_id, team_id, title, repo_url, demo_url, description } = body;

    // Validate required fields
    if (!hackathon_id) {
      return NextResponse.json({ 
        error: "hackathon_id is required",
        code: "MISSING_HACKATHON_ID" 
      }, { status: 400 });
    }

    if (!team_id) {
      return NextResponse.json({ 
        error: "team_id is required",
        code: "MISSING_TEAM_ID" 
      }, { status: 400 });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ 
        error: "title is required and must be a non-empty string",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    // Validate hackathon_id and team_id are valid integers
    const hackathonId = parseInt(hackathon_id);
    const teamId = parseInt(team_id);

    if (isNaN(hackathonId)) {
      return NextResponse.json({ 
        error: "hackathon_id must be a valid integer",
        code: "INVALID_HACKATHON_ID" 
      }, { status: 400 });
    }

    if (isNaN(teamId)) {
      return NextResponse.json({ 
        error: "team_id must be a valid integer",
        code: "INVALID_TEAM_ID" 
      }, { status: 400 });
    }

    // Validate hackathon exists
    const hackathon = await db.select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId))
      .limit(1);

    if (hackathon.length === 0) {
      return NextResponse.json({ 
        error: "Hackathon not found",
        code: "HACKATHON_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate team exists
    const team = await db.select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (team.length === 0) {
      return NextResponse.json({ 
        error: "Team not found",
        code: "TEAM_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate team belongs to the hackathon
    if (team[0].hackathonId !== hackathonId) {
      return NextResponse.json({ 
        error: "Team does not belong to the specified hackathon",
        code: "TEAM_HACKATHON_MISMATCH" 
      }, { status: 400 });
    }

    // Prepare submission data
    const submissionData = {
      hackathonId: hackathonId,
      teamId: teamId,
      title: title.trim(),
      repoUrl: repo_url ? repo_url.trim() : null,
      demoUrl: demo_url ? demo_url.trim() : null,
      description: description ? description.trim() : null,
      submittedAt: Date.now()
    };

    // Create submission
    const newSubmission = await db.insert(submissions)
      .values(submissionData)
      .returning();

    return NextResponse.json(newSubmission[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}