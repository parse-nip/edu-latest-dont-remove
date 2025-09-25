import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons, hackathonParticipants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
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

    const requestBody = await request.json();
    const { display_name, role } = requestBody;

    // Validate required fields
    if (!display_name) {
      return NextResponse.json({
        error: "Display name is required",
        code: "MISSING_DISPLAY_NAME"
      }, { status: 400 });
    }

    // Validate role if provided
    const validRoles = ['participant', 'judge', 'host'];
    const participantRole = role || 'participant';
    
    if (!validRoles.includes(participantRole)) {
      return NextResponse.json({
        error: "Role must be one of: participant, judge, host",
        code: "INVALID_ROLE"
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
      }, { status: 404 });
    }

    // Create participant
    const newParticipant = await db.insert(hackathonParticipants)
      .values({
        hackathonId,
        displayName: display_name.trim(),
        role: participantRole,
        createdAt: Math.floor(Date.now() / 1000)
      })
      .returning();

    return NextResponse.json(newParticipant[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}