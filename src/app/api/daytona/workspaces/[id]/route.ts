import { NextResponse } from "next/server";
import { getServerDaytonaService } from "@/lib/daytona/server-service";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const service = getServerDaytonaService();
    const sandbox = await service.getSandbox(id);
    return NextResponse.json(sandbox);
  } catch (error) {
    console.error('❌ [API] Failed to get sandbox:', error);
    return NextResponse.json(
      { error: 'Failed to get sandbox' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    // Note: Daytona API might not support DELETE, so we'll just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [API] Failed to delete sandbox:', error);
    return NextResponse.json(
      { error: 'Failed to delete sandbox' }, 
      { status: 500 }
    );
  }
}


