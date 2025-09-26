import { NextResponse } from 'next/server';
import { createTables } from '@/lib/create-tables';

export async function POST() {
  console.log('[INIT DB] Database initialization requested');
  
  try {
    const result = await createTables();
    
    if (result.success) {
      console.log('[INIT DB] Database initialized successfully');
      return NextResponse.json({ success: true, message: 'Database initialized' });
    } else {
      console.error('[INIT DB] Database initialization failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[INIT DB] Initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Database initialization failed' }, 
      { status: 500 }
    );
  }
}