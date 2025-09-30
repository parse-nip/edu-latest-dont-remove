import { NextResponse } from "next/server";
import { daytonaFetch } from "../../../../_utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    console.log('[API] POST /api/daytona/toolbox/[id]/files/upload - Uploading file:', id, body.path);
    const result = await daytonaFetch(`/toolbox/${id}/toolbox/files/upload`, 'POST', body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [API] Failed to upload file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
