import React, { useState, useEffect } from 'react';
import { fetchStudents } from '../lib/supabase-students';
import { Student } from '../types/student';
import { useAuth } from '../contexts/AuthContext';

interface NamePickerWidgetProps {
  onClose: () => void;
}

export const NamePickerWidget: React.FC<NamePickerWidgetProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudents(user.id).then(setStudents).catch(console.error);
    }
  }, [user]);

  const pickRandomStudent = () => {
    if (students.length === 0) return;
    
    setIsSpinning(true);
    setSelectedStudent(null);
    
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      setSelectedStudent(students[randomIndex]);
      count++;
      
      if (count > 20) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-2xl w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-[#1a2332]">Random Name Picker</h2>
          <button onClick={onClose} className="text-4xl text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-[#00d4aa] to-[#ff6b6b] rounded-2xl p-12 mb-8">
            <div className="text-6xl font-bold text-white min-h-[80px] flex items-center justify-center">
              {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Click to Pick'}
            </div>
          </div>
          <button
            onClick={pickRandomStudent}
            disabled={isSpinning || students.length === 0}
            className="bg-[#00d4aa] text-white px-12 py-6 rounded-xl text-3xl font-semibold hover:bg-[#00b894] disabled:opacity-50 transition-all"
          >
            {isSpinning ? 'Picking...' : 'Pick a Student'}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {students.map((student) => (
            <div
              key={student.id}
              className={`text-center py-2 px-3 rounded-lg text-lg ${
                student.id === selectedStudent?.id ? 'bg-[#ff6b6b] text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {student.first_name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

