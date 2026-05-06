import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowRightLeft,
  Loader2,
  RefreshCw,
  Check,
  X as XIcon,
} from 'lucide-react';
import { fetchSchools } from '@/lib/supabase-schools';
import {
  fetchTransferRequests,
  approveTransfer,
  rejectTransfer,
  applyApprovedTransfer,
  StudentTransfer,
} from '@/lib/supabase-transfers';
import { School } from '@/types/school';

const statusBadge = (status: StudentTransfer['status']) => {
  if (status === 'pending') {
    return (
      <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20">
        Pending
      </Badge>
    );
  }
  if (status === 'approved') {
    return (
      <Badge className="bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/20">
        Approved
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/20">
      Rejected
    </Badge>
  );
};

type FilterTab = 'pending' | 'approved' | 'rejected' | 'all';

export const TransferRequestManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [transfers, setTransfers] = useState<StudentTransfer[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('pending');

  const [reviewing, setReviewing] = useState<StudentTransfer | null>(null);
  const [reviewMode, setReviewMode] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [txList, schoolList] = await Promise.all([
        fetchTransferRequests(),
        fetchSchools(),
      ]);
      setTransfers(txList);
      setSchools(schoolList);
    } catch (e) {
      console.error('[Transfers] TransferRequestManager loadAll error:', e);
    }
    setLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    const txList = await fetchTransferRequests();
    setTransfers(txList);
    setRefreshing(false);
  };

  const schoolName = (id?: string) => {
    if (!id) return '—';
    return schools.find((s) => s.id === id)?.name || 'Unknown School';
  };

  const counts = useMemo(
    () => ({
      pending: transfers.filter((t) => t.status === 'pending').length,
      approved: transfers.filter((t) => t.status === 'approved').length,
      rejected: transfers.filter((t) => t.status === 'rejected').length,
      all: transfers.length,
    }),
    [transfers]
  );

  const visible = useMemo(() => {
    if (filter === 'all') return transfers;
    return transfers.filter((t) => t.status === filter);
  }, [transfers, filter]);

  const openReview = (transfer: StudentTransfer, mode: 'approve' | 'reject') => {
    setReviewing(transfer);
    setReviewMode(mode);
    setReviewNotes('');
  };

  const closeReview = () => {
    setReviewing(null);
    setReviewNotes('');
    setReviewSaving(false);
  };

  const confirmReview = async () => {
    if (!reviewing || !user?.id) return;
    setReviewSaving(true);
    let ok = false;
    if (reviewMode === 'approve') {
      ok = await approveTransfer(reviewing.id, user.id, reviewNotes.trim() || undefined);
      if (ok) {
        const moved = await applyApprovedTransfer(reviewing);
        if (!moved) {
          toast({
            title: 'Approved, but failed to move student record',
            description: 'You may need to update the student record manually.',
            variant: 'destructive',
          });
        }
      }
    } else {
      ok = await rejectTransfer(reviewing.id, user.id, reviewNotes.trim() || undefined);
    }
    setReviewSaving(false);
    if (ok) {
      toast({
        title:
          reviewMode === 'approve' ? 'Transfer approved' : 'Transfer rejected',
      });
      closeReview();
      refresh();
    } else {
      toast({
        title: 'Failed to update transfer',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5" /> Student Transfer Requests
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['pending', 'approved', 'rejected', 'all'] as FilterTab[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white/10 rounded-xl p-8 text-center text-gray-300">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading transfer requests...
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white/10 rounded-xl p-8 text-center text-gray-400">
          No {filter === 'all' ? '' : filter} transfer requests.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((t) => (
            <div
              key={t.id}
              className="bg-white/10 border border-white/10 rounded-xl p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold text-base">
                      {t.student_name}
                    </span>
                    {t.student_class && (
                      <span className="text-xs text-gray-400">
                        {t.student_class}
                      </span>
                    )}
                    {statusBadge(t.status)}
                  </div>
                  <div className="text-sm text-gray-300 mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-gray-400">From:</span>
                    <span className="text-white">{schoolName(t.from_school_id)}</span>
                    <ArrowRightLeft className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-400">To:</span>
                    <span className="text-white">{schoolName(t.to_school_id)}</span>
                  </div>
                  {t.reason && (
                    <div className="text-sm text-gray-300 mt-2 italic">
                      Reason: "{t.reason}"
                    </div>
                  )}
                  {t.review_notes && (
                    <div className="text-xs text-gray-400 mt-2">
                      Review notes: {t.review_notes}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-500 mt-2">
                    Submitted {new Date(t.created_at).toLocaleString()}
                  </div>
                </div>

                {t.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => openReview(t, 'approve')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openReview(t, 'reject')}
                      className="bg-red-600/20 border-red-500/40 text-red-300 hover:bg-red-600/30 hover:text-red-200"
                    >
                      <XIcon className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!reviewing} onOpenChange={(o) => !o && closeReview()}>
        <DialogContent className="bg-slate-900 text-white border-white/10">
          <DialogHeader>
            <DialogTitle>
              {reviewMode === 'approve' ? 'Approve Transfer' : 'Reject Transfer'}
            </DialogTitle>
          </DialogHeader>

          {reviewing && (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Student: </span>
                <span className="text-white font-medium">
                  {reviewing.student_name}
                </span>
                {reviewing.student_class && (
                  <span className="text-gray-400 ml-2">
                    ({reviewing.student_class})
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-400">From: </span>
                <span className="text-white">
                  {schoolName(reviewing.from_school_id)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">To: </span>
                <span className="text-white">
                  {schoolName(reviewing.to_school_id)}
                </span>
              </div>
              {reviewing.reason && (
                <div>
                  <span className="text-gray-400">Reason: </span>
                  <span className="text-gray-200 italic">"{reviewing.reason}"</span>
                </div>
              )}
              <div>
                <Label className="text-white">Review notes (optional)</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewMode === 'approve'
                      ? 'Add any notes about this approval...'
                      : 'Reason for rejection...'
                  }
                  rows={3}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              {reviewMode === 'approve' && (
                <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded p-2">
                  Approving will move the student record from{' '}
                  <strong>{schoolName(reviewing.from_school_id)}</strong> to{' '}
                  <strong>{schoolName(reviewing.to_school_id)}</strong>.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeReview}
              disabled={reviewSaving}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReview}
              disabled={reviewSaving}
              className={
                reviewMode === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {reviewSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : reviewMode === 'approve' ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <XIcon className="w-4 h-4 mr-2" />
              )}
              {reviewMode === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransferRequestManager;
