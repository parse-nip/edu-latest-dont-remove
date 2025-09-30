import { NextResponse } from "next/server";
import { daytonaFetch } from "../../../_utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    console.log('[API] POST /api/daytona/workspaces/[id]/files - Writing file:', id, body.path);
    const result = await daytonaFetch(`/workspace/${id}/files`, 'POST', body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [API] Failed to write file via workspace API:', error);
    return NextResponse.json(
      { error: 'Failed to write file', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}