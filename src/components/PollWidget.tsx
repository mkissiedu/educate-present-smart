import React, { useState, useEffect } from 'react';
import { fetchStudents } from '../lib/supabase-students';
import { supabase } from '../lib/supabase';
import { Student } from '../types/student';
import { useAuth } from '../contexts/AuthContext';

interface PollWidgetProps {
  onClose: () => void;
  lessonId?: string;
}

export const PollWidget: React.FC<PollWidgetProps> = ({ onClose, lessonId = 'current' }) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('What is your favorite CKLA strand?');
  const [options] = useState(['Skills Strand', 'Knowledge Strand', 'Both Equally', 'Not Sure Yet']);
  const [students, setStudents] = useState<Student[]>([]);
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudents(user.id).then(setStudents).catch(console.error);
    }
  }, [user]);

  const handleStudentVote = async (studentId: string, option: string) => {
    setResponses({...responses, [studentId]: option});
    
    try {
      await supabase.from('poll_responses').insert([{
        lesson_id: lessonId,
        poll_question: question,
        student_id: studentId,
        response: option
      }]);
    } catch (error) {
      console.error('Error saving poll response:', error);
    }
  };

  const getVoteCounts = () => {
    const counts = options.map(() => 0);
    Object.values(responses).forEach(response => {
      const index = options.indexOf(response);
      if (index !== -1) counts[index]++;
    });
    return counts;
  };

  const votes = getVoteCounts();
  const totalVotes = votes.reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-[#1a2332]">Live Poll</h2>
          <button onClick={onClose} className="text-4xl text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div className="mb-8">
          <h3 className="text-3xl font-semibold text-[#1a2332] mb-6">{question}</h3>
          
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4">Student Responses:</h4>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {students.map(student => (
                <div key={student.id} className="border rounded-lg p-3">
                  <p className="font-semibold mb-2">{student.first_name} {student.last_name}</p>
                  <select 
                    className="w-full p-2 border rounded"
                    value={responses[student.id] || ''}
                    onChange={(e) => handleStudentVote(student.id, e.target.value)}
                  >
                    <option value="">Select answer</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setShowResults(!showResults)}
            className="bg-[#00d4aa] text-white px-6 py-3 rounded-lg mb-4"
          >
            {showResults ? 'Hide Results' : 'Show Results'}
          </button>

          {showResults && (
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index}>
                  <p className="font-semibold mb-2">{option}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-[#ff6b6b] h-full transition-all duration-500"
                        style={{ width: `${totalVotes > 0 ? (votes[index] / totalVotes) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-2xl font-bold text-[#1a2332] min-w-[80px]">
                      {votes[index]} votes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

