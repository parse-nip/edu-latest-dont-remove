import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, hackathonParticipants, teamMembers, hackathons } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = parseInt(params.id);
    
    // Validate team ID
    if (!teamId || isNaN(teamId)) {
      return NextResponse.json({ 
        error: "Valid team ID is required",
        code: "INVALID_TEAM_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { participant_id } = requestBody;

    // Validate required fields
    if (!participant_id) {
      return NextResponse.json({ 
        error: "Participant ID is required",
        code: "MISSING_PARTICIPANT_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(participant_id))) {
      return NextResponse.json({ 
        error: "Valid participant ID is required",
        code: "INVALID_PARTICIPANT_ID" 
      }, { status: 400 });
    }

    const participantId = parseInt(participant_id);

    // 1. Validate team exists and get hackathon info
    const teamResult = await db.select({
      teamId: teams.id,
      teamName: teams.name,
      hackathonId: teams.hackathonId,
      maxTeamSize: hackathons.maxTeamSize
    })
    .from(teams)
    .innerJoin(hackathons, eq(teams.hackathonId, hackathons.id))
    .where(eq(teams.id, teamId))
    .limit(1);

    if (teamResult.length === 0) {
      return NextResponse.json({ 
        error: "Team not found",
        code: "TEAM_NOT_FOUND" 
      }, { status: 404 });
    }

    const team = teamResult[0];

    // 2. Check participant exists and is part of same hackathon
    const participantResult = await db.select()
      .from(hackathonParticipants)
      .where(and(
        eq(hackathonParticipants.id, participantId),
        eq(hackathonParticipants.hackathonId, team.hackathonId)
      ))
      .limit(1);

    if (participantResult.length === 0) {
      return NextResponse.json({ 
        error: "Participant not found or not registered for this hackathon",
        code: "PARTICIPANT_NOT_FOUND" 
      }, { status: 404 });
    }

    // 3. Check participant isn't already on another team in this hackathon
    const existingTeamMember = await db.select({
      teamMemberId: teamMembers.id,
      teamId: teamMembers.teamId
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(and(
      eq(teamMembers.participantId, participantId),
      eq(teams.hackathonId, team.hackathonId)
    ))
    .limit(1);

    if (existingTeamMember.length > 0) {
      return NextResponse.json({ 
        error: "Participant is already on a team in this hackathon",
        code: "ALREADY_ON_TEAM" 
      }, { status: 400 });
    }

    // 4. Check team size doesn't exceed hackathon.maxTeamSize
    const currentTeamSizeResult = await db.select({
      count: count()
    })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

    const currentTeamSize = currentTeamSizeResult[0]?.count || 0;

    if (currentTeamSize >= team.maxTeamSize) {
      return NextResponse.json({ 
        error: `Team is full. Maximum team size is ${team.maxTeamSize}`,
        code: "TEAM_FULL" 
      }, { status: 400 });
    }

    // 5. Add participant to team if all validations pass
    const newTeamMember = await db.insert(teamMembers)
      .values({
        teamId: teamId,
        participantId: participantId,
        createdAt: Date.now()
      })
      .returning();

    return NextResponse.json(newTeamMember[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}