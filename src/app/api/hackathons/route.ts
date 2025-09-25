import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hackathons } from '@/db/schema';
import { eq, like, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const hackathon = await db.select()
        .from(hackathons)
        .where(eq(hackathons.id, parseInt(id)))
        .limit(1);

      if (hackathon.length === 0) {
        return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
      }

      return NextResponse.json(hackathon[0]);
    }

    let query = db.select().from(hackathons).orderBy(desc(hackathons.createdAt));

    if (search) {
      query = query.where(like(hackathons.name, `%${search}%`));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { name, description, startAt, endAt, status, maxTeamSize } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!startAt) {
      return NextResponse.json({ 
        error: "Start date is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!endAt) {
      return NextResponse.json({ 
        error: "End date is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate timestamp format (should be integers)
    if (isNaN(parseInt(startAt))) {
      return NextResponse.json({ 
        error: "Start date must be a valid timestamp",
        code: "INVALID_TIMESTAMP" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(endAt))) {
      return NextResponse.json({ 
        error: "End date must be a valid timestamp",
        code: "INVALID_TIMESTAMP" 
      }, { status: 400 });
    }

    // Validate date logic
    if (parseInt(startAt) >= parseInt(endAt)) {
      return NextResponse.json({ 
        error: "End date must be after start date",
        code: "INVALID_DATE_RANGE" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedDescription = description?.trim() || null;

    // Prepare data with defaults
    const hackathonData = {
      name: sanitizedName,
      description: sanitizedDescription,
      startAt: parseInt(startAt),
      endAt: parseInt(endAt),
      status: status || 'upcoming',
      maxTeamSize: maxTeamSize || 4,
      createdAt: Date.now()
    };

    const newHackathon = await db.insert(hackathons)
      .values(hackathonData)
      .returning();

    return NextResponse.json(newHackathon[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { name, description, startAt, endAt, status, maxTeamSize } = requestBody;

    // Check if record exists
    const existingHackathon = await db.select()
      .from(hackathons)
      .where(eq(hackathons.id, parseInt(id)))
      .limit(1);

    if (existingHackathon.length === 0) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Validate timestamps if provided
    if (startAt !== undefined && isNaN(parseInt(startAt))) {
      return NextResponse.json({ 
        error: "Start date must be a valid timestamp",
        code: "INVALID_TIMESTAMP" 
      }, { status: 400 });
    }

    if (endAt !== undefined && isNaN(parseInt(endAt))) {
      return NextResponse.json({ 
        error: "End date must be a valid timestamp",
        code: "INVALID_TIMESTAMP" 
      }, { status: 400 });
    }

    // Validate date logic if both dates are provided
    const newStartAt = startAt !== undefined ? parseInt(startAt) : existingHackathon[0].startAt;
    const newEndAt = endAt !== undefined ? parseInt(endAt) : existingHackathon[0].endAt;

    if (newStartAt >= newEndAt) {
      return NextResponse.json({ 
        error: "End date must be after start date",
        code: "INVALID_DATE_RANGE" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    if (startAt !== undefined) {
      updateData.startAt = parseInt(startAt);
    }
    if (endAt !== undefined) {
      updateData.endAt = parseInt(endAt);
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    if (maxTeamSize !== undefined) {
      updateData.maxTeamSize = maxTeamSize;
    }

    const updatedHackathon = await db.update(hackathons)
      .set(updateData)
      .where(eq(hackathons.id, parseInt(id)))
      .returning();

    if (updatedHackathon.length === 0) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    return NextResponse.json(updatedHackathon[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists before deleting
    const existingHackathon = await db.select()
      .from(hackathons)
      .where(eq(hackathons.id, parseInt(id)))
      .limit(1);

    if (existingHackathon.length === 0) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    const deletedHackathon = await db.delete(hackathons)
      .where(eq(hackathons.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Hackathon deleted successfully',
      deletedRecord: deletedHackathon[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}