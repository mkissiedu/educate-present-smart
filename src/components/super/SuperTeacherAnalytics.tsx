import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchContentAnalytics, getAnalyticsSummary } from '@/lib/supabase-test-papers';
import { ContentAnalytics } from '@/types/assessment-types';
import { BarChart3, BookOpen, FileText, HelpCircle, TrendingUp, Clock, CheckCircle, Upload } from 'lucide-react';

export function SuperTeacherAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<ContentAnalytics[]>([]);
  const [summary, setSummary] = useState({ lessonsCreated: 0, lessonsPublished: 0, questionsCreated: 0, testPapersCreated: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, [user]);

  const loadAnalytics = async () => {
    setLoading(true);
    const [data, sum] = await Promise.all([
      fetchContentAnalytics(user?.id),
      getAnalyticsSummary(user?.id)
    ]);
    setAnalytics(data);
    setSummary(sum);
    setLoading(false);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'edited': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'submitted': return <Upload className="w-4 h-4 text-purple-400" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'published': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) return <div className="text-center py-8 text-white/60">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-xl p-4 border border-blue-400/30">
          <BookOpen className="w-8 h-8 text-blue-400 mb-2" />
          <div className="text-3xl font-bold text-white">{summary.lessonsCreated}</div>
          <div className="text-blue-200 text-sm">Lessons Created</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-xl p-4 border border-green-400/30">
          <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
          <div className="text-3xl font-bold text-white">{summary.lessonsPublished}</div>
          <div className="text-green-200 text-sm">Lessons Published</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-xl p-4 border border-purple-400/30">
          <HelpCircle className="w-8 h-8 text-purple-400 mb-2" />
          <div className="text-3xl font-bold text-white">{summary.questionsCreated}</div>
          <div className="text-purple-200 text-sm">Questions Created</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/30 to-amber-600/30 rounded-xl p-4 border border-amber-400/30">
          <FileText className="w-8 h-8 text-amber-400 mb-2" />
          <div className="text-3xl font-bold text-white">{summary.testPapersCreated}</div>
          <div className="text-amber-200 text-sm">Test Papers</div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Recent Activity
        </h3>
        {analytics.length === 0 ? (
          <p className="text-white/60 text-center py-4">No activity recorded yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.slice(0, 20).map(item => (
              <div key={item.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                {getActionIcon(item.action)}
                <div className="flex-1">
                  <span className="text-white text-sm capitalize">{item.action} {item.content_type.replace('_', ' ')}</span>
                  {item.subject && <span className="text-white/60 text-xs ml-2">• {item.subject}</span>}
                </div>
                <span className="text-white/40 text-xs">{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
