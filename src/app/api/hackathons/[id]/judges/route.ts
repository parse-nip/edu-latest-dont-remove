import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons, judges } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // Validate hackathon exists
    const hackathon = await db.select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId))
      .limit(1);

    if (hackathon.length === 0) {
      return NextResponse.json({ 
        error: 'Hackathon not found' 
      }, { status: 404 });
    }

    // Get all judges for the hackathon
    const judgesList = await db.select()
      .from(judges)
      .where(eq(judges.hackathonId, hackathonId));

    return NextResponse.json(judgesList);

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
    
    if (!hackathonId || isNaN(hackathonId)) {
      return NextResponse.json({ 
        error: "Valid hackathon ID is required",
        code: "INVALID_HACKATHON_ID" 
      }, { status: 400 });
    }

    // Validate hackathon exists
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
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: "Name must be a non-empty string",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    // Create new judge
    const newJudge = await db.insert(judges)
      .values({
        hackathonId,
        name: name.trim(),
        createdAt: Date.now()
      })
      .returning();

    return NextResponse.json(newJudge[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}