import { NextRequest, NextResponse } from "next/server";
import { getServerDaytonaService } from "@/lib/daytona/server-service";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const port = Number(req.nextUrl.searchParams.get("port") || 3000);
    const service = getServerDaytonaService();
    const previewUrl = await service.getSandboxPreviewUrl(id, port);
    return NextResponse.json({ previewUrl });
  } catch (error) {
    console.error('❌ [API] Failed to get preview URL:', error);
    return NextResponse.json(
      { error: 'Failed to get preview URL' }, 
      { status: 500 }
    );
  }
}


