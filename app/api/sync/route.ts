import { NextResponse } from 'next/server';
import { SyncService } from '@/lib/sync/sync-service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Verify user is authenticated and is admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { syncType } = await request.json();

    const syncService = new SyncService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let result;

    switch (syncType) {
      case 'players':
        result = await syncService.syncPlayers();
        break;
      case 'statistics':
        result = await syncService.syncStatistics(7);
        break;
      case 'games':
        result = await syncService.syncGames(100);
        break;
      case 'all':
        const playersResult = await syncService.syncPlayers();
        const statsResult = await syncService.syncStatistics(7);
        const gamesResult = await syncService.syncGames(100);
        result = {
          players: playersResult,
          statistics: statsResult,
          games: gamesResult,
        };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid sync type' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent sync logs
    const { data: logs, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error fetching sync logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
