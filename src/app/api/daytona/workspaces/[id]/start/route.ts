import { NextResponse } from "next/server";
import { getServerDaytonaService } from "@/lib/daytona/server-service";

type Params = { params: { id: string } };

export async function POST(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const service = getServerDaytonaService();
    const result = await service.startSandbox(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [API] Failed to start sandbox:', error);
    return NextResponse.json(
      { error: 'Failed to start sandbox' }, 
      { status: 500 }
    );
  }
}
