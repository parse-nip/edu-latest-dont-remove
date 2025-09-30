import { NextResponse } from "next/server";
import { daytonaFetch } from "../_utils";

export async function GET() {
  try {
    console.log('[API] GET /api/daytona/sandbox - Listing sandboxes');
    const sandboxes = await daytonaFetch('/sandbox', 'GET');
    return NextResponse.json(sandboxes);
  } catch (error) {
    console.error('❌ [API] Failed to list sandboxes:', error);
    return NextResponse.json(
      { error: 'Failed to list sandboxes', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('[API] POST /api/daytona/sandbox - Creating sandbox:', body);
    const sandbox = await daytonaFetch('/sandbox', 'POST', body);
    return NextResponse.json(sandbox);
  } catch (error) {
    console.error('❌ [API] Failed to create sandbox:', error);
    return NextResponse.json(
      { error: 'Failed to create sandbox', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
