import { NextRequest, NextResponse } from 'next/server';

// This endpoint is called by WebContainer for internal connections
// We don't need to handle it - WebContainer manages its own connections
// This route simply prevents 404 errors from appearing in the console

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // WebContainer handles its own connections internally
  // This route exists only to prevent 404 logs
  return NextResponse.json({ 
    message: 'WebContainer connection endpoint',
    id: params.id 
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ 
    message: 'WebContainer connection endpoint',
    id: params.id 
  });
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
