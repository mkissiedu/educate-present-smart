import { GraduationCap } from 'lucide-react';

interface Props {
  schoolName: string;
  academicYear: string;
  termName: string;
  studentName: string;
  className: string;
  teacherName: string;
}

export function ReportCardHeader({ schoolName, academicYear, termName, studentName, className, teacherName }: Props) {
  return (
    <div className="text-center border-b-2 border-purple-600 pb-4 mb-4">
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-purple-800">{schoolName}</h1>
      <p className="text-sm text-gray-600">Academic Year: {academicYear}</p>
      <div className="mt-3 bg-purple-100 rounded-lg p-3">
        <h2 className="text-lg font-semibold text-purple-700">TERMINAL REPORT CARD</h2>
        <p className="text-purple-600">{termName}</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4 text-left">
        <div>
          <p className="text-xs text-gray-500">Student Name</p>
          <p className="font-semibold">{studentName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Class</p>
          <p className="font-semibold">{className}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Class Teacher</p>
          <p className="font-semibold">{teacherName}</p>
        </div>
      </div>
    </div>
  );
}
