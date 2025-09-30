import { NextResponse } from "next/server";
import { daytonaFetch } from "../../../../../_utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; port: string }> }
) {
  try {
    const { id, port } = await params;
    
    console.log('[API] GET /api/daytona/sandbox/[id]/ports/[port]/preview-url - Getting preview URL:', id, port);
    const result = await daytonaFetch(`/sandbox/${id}/ports/${port}/preview-url`, 'GET');
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [API] Failed to get preview URL:', error);
    return NextResponse.json(
      { error: 'Failed to get preview URL', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
