import { NextResponse } from "next/server";
import { daytonaFetch } from "../../../_utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[API] POST /api/daytona/sandbox/[id]/stop - Stopping sandbox:', id);
    const result = await daytonaFetch(`/sandbox/${id}/stop`, 'POST');
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [API] Failed to stop sandbox:', error);
    return NextResponse.json(
      { error: 'Failed to stop sandbox', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
