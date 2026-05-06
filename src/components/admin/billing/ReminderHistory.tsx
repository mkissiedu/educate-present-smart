import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getReminderLogs, getReminderStats } from '@/lib/supabase-reminders';
import type { ReminderLog, ReminderStats } from '@/types/reminder';
import { History, Search, MessageSquare, Phone, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface Props {
  schoolId: string;
  students: any[];
}

export function ReminderHistory({ schoolId, students }: Props) {
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<ReminderLog | null>(null);

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, statsData] = await Promise.all([
        getReminderLogs(schoolId, { limit: 200 }),
        getReminderStats(schoolId)
      ]);
      // Enrich with student names
      const enriched = logsData.map(l => ({
        ...l,
        student_name: students.find(s => s.id === l.student_id)?.name || 'Unknown'
      }));
      setLogs(enriched);
      setStats(statsData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (search && !l.student_name?.toLowerCase().includes(search.toLowerCase()) && !l.bill_code?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      sent: 'default', delivered: 'default', failed: 'destructive', pending: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const formatDate = (date: string) => new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          <Card className="bg-blue-50"><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-blue-700">{stats.total_sent}</p><p className="text-xs text-blue-600">Total Sent</p></CardContent></Card>
          <Card className="bg-green-50"><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-green-700">{stats.delivered}</p><p className="text-xs text-green-600">Delivered</p></CardContent></Card>
          <Card className="bg-red-50"><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-red-700">{stats.failed}</p><p className="text-xs text-red-600">Failed</p></CardContent></Card>
          <Card className="bg-amber-50"><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-amber-700">{stats.pending}</p><p className="text-xs text-amber-600">Pending</p></CardContent></Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5" /> Reminder History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search student or bill..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : filteredLogs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No reminders sent yet</p>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <p className="font-medium text-sm">{log.student_name}</p>
                      <p className="text-xs text-muted-foreground">{log.reminder_type.replace('_', ' ')} • {log.recipient_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">{log.channel === 'whatsapp' ? <MessageSquare className="h-3 w-3" /> : <Phone className="h-3 w-3" />}</Badge>
                    {getStatusBadge(log.status)}
                    <span className="text-xs text-muted-foreground">{formatDate(log.sent_at)}</span>
                    <Button size="icon" variant="ghost" onClick={() => setSelectedLog(log)}><Eye className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Preview Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Message Details</DialogTitle></DialogHeader>
          {selectedLog && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Student:</span> {selectedLog.student_name}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selectedLog.recipient_phone}</div>
                <div><span className="text-muted-foreground">Type:</span> {selectedLog.reminder_type}</div>
                <div><span className="text-muted-foreground">Status:</span> {getStatusBadge(selectedLog.status)}</div>
                <div><span className="text-muted-foreground">Sent:</span> {formatDate(selectedLog.sent_at)}</div>
                <div><span className="text-muted-foreground">Channel:</span> {selectedLog.channel}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-sm font-medium mb-1">Message:</p><p className="text-sm whitespace-pre-wrap">{selectedLog.message_sent}</p></div>
              {selectedLog.error_message && <div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm"><p className="font-medium">Error:</p><p>{selectedLog.error_message}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
