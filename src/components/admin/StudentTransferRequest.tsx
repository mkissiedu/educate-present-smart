import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRightLeft,
  Search,
  Loader2,
  Send,
  RefreshCw,
} from 'lucide-react';
import { fetchStudents } from '@/lib/supabase-students';
import { fetchSchools } from '@/lib/supabase-schools';
import {
  fetchTransferRequests,
  createTransferRequest,
  StudentTransfer,
} from '@/lib/supabase-transfers';
import { Student } from '@/types/student';
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

export const StudentTransferRequest: React.FC = () => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();
  const mySchoolId = currentSchool?.id || user?.school_id || '';

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [transfers, setTransfers] = useState<StudentTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mySchoolId) loadAll();
  }, [mySchoolId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [students, schoolList, txList] = await Promise.all([
        fetchStudents(), // ALL students across schools
        fetchSchools(),
        fetchTransferRequests(mySchoolId),
      ]);
      setAllStudents(students);
      setSchools(schoolList);
      setTransfers(txList);
    } catch (e) {
      console.error('[Transfers] StudentTransferRequest loadAll error:', e);
    }
    setLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    const txList = await fetchTransferRequests(mySchoolId);
    setTransfers(txList);
    setRefreshing(false);
  };

  // Students NOT currently in our school, filtered by search text
  const candidateStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allStudents
      .filter((s) => s.school_id && s.school_id !== mySchoolId)
      .filter((s) => {
        if (!q) return true;
        const name = (s.name || `${s.first_name || ''} ${s.last_name || ''}`).toLowerCase();
        const id = (s.student_id || '').toLowerCase();
        return name.includes(q) || id.includes(q);
      })
      .slice(0, 25);
  }, [allStudents, search, mySchoolId]);

  const selectedStudent = useMemo(
    () => allStudents.find((s) => s.id === selectedStudentId) || null,
    [allStudents, selectedStudentId]
  );

  const schoolName = (id?: string) => {
    if (!id) return '—';
    const s = schools.find((sc) => sc.id === id);
    return s?.name || 'Unknown School';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast({ title: 'Please select a student', variant: 'destructive' });
      return;
    }
    if (!user?.id || !mySchoolId) {
      toast({ title: 'Missing user or school context', variant: 'destructive' });
      return;
    }
    if (!selectedStudent.school_id) {
      toast({
        title: 'Student has no origin school on record',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const ok = await createTransferRequest({
      student_id: selectedStudent.id,
      from_school_id: selectedStudent.school_id,
      to_school_id: mySchoolId,
      requested_by: user.id,
      student_name:
        selectedStudent.name ||
        `${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim(),
      student_class:
        (selectedStudent as any).class_level ||
        (selectedStudent as any).current_class ||
        (selectedStudent as any).class_name ||
        '',
      reason: reason.trim() || undefined,
    });
    setSubmitting(false);

    if (ok) {
      toast({ title: 'Transfer request submitted' });
      setSelectedStudentId('');
      setSearch('');
      setReason('');
      refresh();
    } else {
      toast({ title: 'Failed to submit transfer request', variant: 'destructive' });
    }
  };

  // Requests this school submitted to bring students in from other schools
  const outgoingRequests = transfers.filter((t) => t.to_school_id === mySchoolId);

  // Requests other schools have made for students currently enrolled HERE
  const incomingRequests = transfers.filter(
    (t) => t.from_school_id === mySchoolId && t.to_school_id !== mySchoolId
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5" /> Student Transfers
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

      {/* Request form */}
      <div className="bg-white/10 rounded-xl p-4 space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Request a Transfer Into {currentSchool?.name || 'this school'}
        </h3>
        <p className="text-sm text-gray-300">
          Search for a student currently enrolled at another school and submit a transfer
          request. Super Admin will review and approve before the transfer takes effect.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white">Search Student</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedStudentId('');
                }}
                placeholder="Type student name or ID..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            {search && !selectedStudent && (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-slate-900/80 divide-y divide-white/10">
                {loading ? (
                  <div className="p-3 text-gray-400 text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading students...
                  </div>
                ) : candidateStudents.length === 0 ? (
                  <div className="p-3 text-gray-400 text-sm">
                    No matching students in other schools.
                  </div>
                ) : (
                  candidateStudents.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setSearch(s.name || `${s.first_name} ${s.last_name}`);
                      }}
                      className="w-full text-left p-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="text-white font-medium">
                        {s.name || `${s.first_name} ${s.last_name}`}
                      </div>
                      <div className="text-xs text-gray-400">
                        {(s as any).class_level || (s as any).current_class || '—'} •{' '}
                        {schoolName(s.school_id)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedStudent && (
            <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-3 flex items-center justify-between">
              <div>
                <div className="text-white font-medium">
                  {selectedStudent.name ||
                    `${selectedStudent.first_name} ${selectedStudent.last_name}`}
                </div>
                <div className="text-xs text-gray-300">
                  {(selectedStudent as any).class_level ||
                    (selectedStudent as any).current_class ||
                    '—'}{' '}
                  • From: {schoolName(selectedStudent.school_id)}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedStudentId('');
                  setSearch('');
                }}
                className="text-gray-300 hover:text-white"
              >
                Change
              </Button>
            </div>
          )}

          <div>
            <Label className="text-white">Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Family relocation, parent request..."
              className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || !selectedStudent}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Submit Transfer Request
          </Button>
        </form>
      </div>

      {/* Requests this school submitted (outgoingRequests) */}
      <div className="bg-white/10 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3">
          My Transfer Requests ({outgoingRequests.length})
          <span className="text-xs text-gray-400 font-normal ml-2">
            Students you've requested to transfer to this school — pending Super Admin approval
          </span>
        </h3>
        {outgoingRequests.length === 0 ? (
          <p className="text-gray-400 text-sm">No outgoing transfer requests yet.</p>
        ) : (
          <div className="space-y-2">
            {outgoingRequests.map((t) => (
              <div key={t.id} className="bg-slate-900/60 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-medium">{t.student_name}</span>
                  <span className="text-xs text-gray-400">{t.student_class}</span>
                  {statusBadge(t.status)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  From: {schoolName(t.from_school_id)}
                </div>
                {t.reason && (
                  <div className="text-xs text-gray-300 mt-1 italic">"{t.reason}"</div>
                )}
                {t.review_notes && (
                  <div className="text-xs text-gray-400 mt-1">
                    Super Admin notes: {t.review_notes}
                  </div>
                )}
                <div className="text-[10px] text-gray-500 mt-1">
                  {new Date(t.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Other schools requesting our students (incomingRequests) */}
      <div className="bg-white/10 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3">
          Requests for Our Students ({incomingRequests.length})
          <span className="text-xs text-gray-400 font-normal ml-2">
            Other schools requesting students currently enrolled here — reviewed by Super Admin
          </span>
        </h3>
        {incomingRequests.length === 0 ? (
          <p className="text-gray-400 text-sm">No other schools have requested your students.</p>
        ) : (
          <div className="space-y-2">
            {incomingRequests.map((t) => (
              <div key={t.id} className="bg-slate-900/60 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-medium">{t.student_name}</span>
                  <span className="text-xs text-gray-400">{t.student_class}</span>
                  {statusBadge(t.status)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Requested by: {schoolName(t.to_school_id)}
                </div>
                {t.review_notes && (
                  <div className="text-xs text-gray-400 mt-1">
                    Notes: {t.review_notes}
                  </div>
                )}
                <div className="text-[10px] text-gray-500 mt-1">
                  {new Date(t.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTransferRequest;
