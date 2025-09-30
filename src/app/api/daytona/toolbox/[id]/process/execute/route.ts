import { NextResponse } from "next/server";
import { daytonaFetch } from "../../../../_utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    console.log('[API] POST /api/daytona/toolbox/[id]/process/execute - Executing command:', id, body.command);
    const result = await daytonaFetch(`/toolbox/${id}/toolbox/process/execute`, 'POST', body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [API] Failed to execute command:', error);
    return NextResponse.json(
      { error: 'Failed to execute command', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
