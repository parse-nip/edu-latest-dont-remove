import { NextResponse } from "next/server";
import { daytonaFetch } from "../../_utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[API] GET /api/daytona/sandbox/[id] - Getting sandbox:', id);
    const sandbox = await daytonaFetch(`/sandbox/${id}`, 'GET');
    return NextResponse.json(sandbox);
  } catch (error) {
    console.error('❌ [API] Failed to get sandbox:', error);
    return NextResponse.json(
      { error: 'Failed to get sandbox', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[API] DELETE /api/daytona/sandbox/[id] - Deleting sandbox:', id);
    await daytonaFetch(`/sandbox/${id}`, 'DELETE');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [API] Failed to delete sandbox:', error);
    return NextResponse.json(
      { error: 'Failed to delete sandbox', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
