import { StudentScore } from '@/types/scores';

interface Props {
  scores: StudentScore[];
  termNumber: number;
}

export function ReportCardScores({ scores, termNumber }: Props) {
  const catHeaders = {
    1: ['CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'ETE 1'],
    2: ['CAT 5', 'CAT 6', 'CAT 7', 'CAT 8', 'ETE 2'],
    3: ['CAT 9', 'CAT 10', 'CAT 11', 'CAT 12', 'ETE 3']
  }[termNumber] || ['CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'ETE'];

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'bg-green-100 text-green-800';
    if (grade === 'B') return 'bg-blue-100 text-blue-800';
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800';
    if (grade === 'D') return 'bg-orange-100 text-orange-800';
    if (grade === 'E') return 'bg-amber-100 text-amber-800';
    if (grade === 'F') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const totalScore = scores.reduce((a, s) => a + s.total, 0);
  const avgScore = scores.length > 0 ? Math.round(totalScore / scores.length) : 0;

  return (
    <div className="mb-4">
      <h3 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
        <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
        Academic Performance
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="border p-1.5 text-left">Subject</th>
              <th className="border p-1 w-12">{catHeaders[0]}<br/><span className="font-normal">(10)</span></th>
              <th className="border p-1 w-12">{catHeaders[1]}<br/><span className="font-normal">(10)</span></th>
              <th className="border p-1 w-12">{catHeaders[2]}<br/><span className="font-normal">(10)</span></th>
              <th className="border p-1 w-12">{catHeaders[3]}<br/><span className="font-normal">(20)</span></th>
              <th className="border p-1 w-12">{catHeaders[4]}<br/><span className="font-normal">(50)</span></th>
              <th className="border p-1 w-14">Total<br/><span className="font-normal">(100)</span></th>
              <th className="border p-1 w-10">Grade</th>
              <th className="border p-1">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {scores.length === 0 ? (
              <tr><td colSpan={9} className="border p-3 text-center text-gray-500">No scores recorded</td></tr>
            ) : scores.map((score, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border p-1.5 font-medium">{score.subject}</td>
                <td className="border p-1 text-center">{score.cat_1}</td>
                <td className="border p-1 text-center">{score.cat_2}</td>
                <td className="border p-1 text-center">{score.cat_3}</td>
                <td className="border p-1 text-center">{score.cat_4}</td>
                <td className="border p-1 text-center">{score.ete}</td>
                <td className="border p-1 text-center font-bold">{score.total}</td>
                <td className={`border p-1 text-center font-bold ${getGradeColor(score.grade)}`}>{score.grade}</td>
                <td className="border p-1 text-xs">{score.remarks}</td>
              </tr>
            ))}
          </tbody>
          {scores.length > 0 && (
            <tfoot>
              <tr className="bg-purple-50 font-semibold">
                <td colSpan={6} className="border p-1.5 text-right">Overall Average:</td>
                <td className="border p-1 text-center">{avgScore}/100</td>
                <td colSpan={2} className="border p-1 text-center">
                  {avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : avgScore >= 40 ? 'Fair' : 'Needs Improvement'}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <strong>Grading Scale:</strong> A (80-100%) | B (70-79%) | C (60-69%) | D (50-59%) | E (40-49%) | F (Below 40%)
      </div>
    </div>
  );
}
