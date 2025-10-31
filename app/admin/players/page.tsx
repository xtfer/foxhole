import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Search, ArrowLeft, Users } from 'lucide-react';

export default async function AdminPlayersPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const supabase = await createClient();
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1');
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  // Build query
  let query = supabase
    .from('players')
    .select('*', { count: 'exact' })
    .order('last_seen', { ascending: false })
    .range(offset, offset + pageSize - 1);

  // Apply search filter
  if (search) {
    query = query.or(`current_name.ilike.%${search}%,player_id.ilike.%${search}%`);
  }

  const { data: players, count } = await query;

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Player Management</h1>
              <p className="text-slate-600">View and manage all players</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Search and Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <form action="/admin/players" method="get" className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  name="search"
                  placeholder="Search players..."
                  defaultValue={search}
                  className="pl-10 w-80"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            {search && (
              <Link href="/admin/players">
                <Button variant="outline">Clear</Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Users className="h-5 w-5" />
            <span className="font-semibold">{count || 0}</span>
            <span>players total</span>
          </div>
        </div>

        {/* Players Table */}
        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
            <CardDescription>
              {search ? `Search results for "${search}"` : 'All registered players'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {players && players.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Player ID</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((player: any) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">
                          {player.current_name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">
                          {player.player_id.substring(0, 12)}...
                        </TableCell>
                        <TableCell>{player.country || 'Unknown'}</TableCell>
                        <TableCell>
                          {player.last_seen
                            ? new Date(player.last_seen).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {player.is_vip && (
                              <Badge className="bg-yellow-500 hover:bg-yellow-600">
                                VIP
                              </Badge>
                            )}
                            {player.is_banned && (
                              <Badge variant="destructive">Banned</Badge>
                            )}
                            {player.is_watched && (
                              <Badge variant="secondary">Watched</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/players/${player.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-600">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      {page > 1 && (
                        <Link
                          href={`/admin/players?page=${page - 1}${
                            search ? `&search=${search}` : ''
                          }`}
                        >
                          <Button variant="outline" size="sm">
                            Previous
                          </Button>
                        </Link>
                      )}
                      {page < totalPages && (
                        <Link
                          href={`/admin/players?page=${page + 1}${
                            search ? `&search=${search}` : ''
                          }`}
                        >
                          <Button variant="outline" size="sm">
                            Next
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  {search ? 'No players found matching your search' : 'No players synced yet'}
                </p>
                {!search && (
                  <Link href="/admin/sync">
                    <Button className="mt-4">Sync Players</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
