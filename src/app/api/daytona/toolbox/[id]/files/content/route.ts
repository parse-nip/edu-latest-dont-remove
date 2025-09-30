import { NextResponse } from "next/server";
import { daytonaFetch } from "../../../../_utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '/';
    
    console.log('[API] GET /api/daytona/toolbox/[id]/files/content - Reading file:', id, path);
    const content = await daytonaFetch(`/toolbox/${id}/toolbox/files/download?path=${encodeURIComponent(path)}`, 'GET');
    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('❌ [API] Failed to read file:', error);
    return NextResponse.json(
      { error: 'Failed to read file', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
