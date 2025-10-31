import { NextResponse } from 'next/server';
import { CRCONClient } from '@/lib/crcon/client';

export async function GET() {
  try {
    const apiUrl = process.env.CRCON_API_URL || 'Not configured';
    
    // Try to ping the server to check connectivity
    let status = 'Connected';
    try {
      await CRCONClient.getPlayers({ limit: 1 });
    } catch (error) {
      status = 'Disconnected';
    }

    return NextResponse.json({
      url: apiUrl,
      status,
    });
  } catch (error) {
    return NextResponse.json(
      { url: 'Unknown', status: 'Error' },
      { status: 500 }
    );
  }
}
