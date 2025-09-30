import { NextResponse } from "next/server";
import { daytonaFetch } from "../../../_utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '/';
    
    console.log('[API] GET /api/daytona/toolbox/[id]/files - Getting files:', id, path);
    const files = await daytonaFetch(`/toolbox/${id}/toolbox/files?path=${encodeURIComponent(path)}`, 'GET');
    return NextResponse.json(files);
  } catch (error) {
    console.error('❌ [API] Failed to get files:', error);
    return NextResponse.json(
      { error: 'Failed to get files', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
