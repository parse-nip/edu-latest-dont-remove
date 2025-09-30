import { NextResponse } from "next/server";
import { getServerDaytonaService } from "@/lib/daytona/server-service";

export async function GET() {
  try {
    const service = getServerDaytonaService();
    const sandboxes = await service.listSandboxes();
    return NextResponse.json(sandboxes);
  } catch (error) {
    console.error('❌ [API] Failed to list sandboxes:', error);
    return NextResponse.json(
      { error: 'Failed to list sandboxes' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const service = getServerDaytonaService();
    const sandbox = await service.createSandbox(body.name || 'New Sandbox');
    return NextResponse.json(sandbox);
  } catch (error) {
    console.error('❌ [API] Failed to create sandbox:', error);
    return NextResponse.json(
      { error: 'Failed to create sandbox' }, 
      { status: 500 }
    );
  }
}


