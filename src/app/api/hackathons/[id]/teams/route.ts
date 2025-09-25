import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons, teams } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = parseInt(params.id);

    // Validate hackathon ID
    if (!hackathonId || isNaN(hackathonId)) {
      return NextResponse.json({ 
        error: "Valid hackathon ID is required",
        code: "INVALID_HACKATHON_ID" 
      }, { status: 400 });
    }

    // Verify hackathon exists
    const hackathon = await db.select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId))
      .limit(1);

    if (hackathon.length === 0) {
      return NextResponse.json({ 
        error: 'Hackathon not found' 
      }, { status: 404 });
    }

    // Get teams for this hackathon
    const teamList = await db.select()
      .from(teams)
      .where(eq(teams.hackathonId, hackathonId));

    return NextResponse.json(teamList);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = parseInt(params.id);

    // Validate hackathon ID
    if (!hackathonId || isNaN(hackathonId)) {
      return NextResponse.json({ 
        error: "Valid hackathon ID is required",
        code: "INVALID_HACKATHON_ID" 
      }, { status: 400 });
    }

    // Verify hackathon exists
    const hackathon = await db.select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId))
      .limit(1);

    if (hackathon.length === 0) {
      return NextResponse.json({ 
        error: 'Hackathon not found' 
      }, { status: 404 });
    }

    const { name } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Team name is required",
        code: "MISSING_TEAM_NAME" 
      }, { status: 400 });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: "Team name must be a non-empty string",
        code: "INVALID_TEAM_NAME" 
      }, { status: 400 });
    }

    // Create new team
    const newTeam = await db.insert(teams)
      .values({
        hackathonId: hackathonId,
        name: name.trim(),
        createdAt: Math.floor(Date.now() / 1000)
      })
      .returning();

    return NextResponse.json(newTeam[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}