import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Get single hackathon by ID
    const hackathon = await db.select()
      .from(hackathons)
      .where(eq(hackathons.id, parseInt(id)))
      .limit(1);

    if (hackathon.length === 0) {
      return NextResponse.json({ 
        error: 'Hackathon not found' 
      }, { status: 404 });
    }

    return NextResponse.json(hackathon[0]);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}