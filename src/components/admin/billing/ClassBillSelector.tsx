import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap } from 'lucide-react';

interface ClassInfo {
  id: string;
  name: string;
  studentCount: number;
}

interface Props {
  classes: ClassInfo[];
  selectedClasses: string[];
  onSelectionChange: (classIds: string[]) => void;
}

export function ClassBillSelector({ classes, selectedClasses, onSelectionChange }: Props) {
  const toggleClass = (classId: string) => {
    if (selectedClasses.includes(classId)) {
      onSelectionChange(selectedClasses.filter(id => id !== classId));
    } else {
      onSelectionChange([...selectedClasses, classId]);
    }
  };

  const selectAll = () => {
    onSelectionChange(classes.map(c => c.id));
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  const totalStudents = classes
    .filter(c => selectedClasses.includes(c.id))
    .reduce((sum, c) => sum + c.studentCount, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-5 w-5" /> Select Classes
          </CardTitle>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-sm text-blue-600 hover:underline">
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={deselectAll} className="text-sm text-gray-600 hover:underline">
              Clear
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => toggleClass(cls.id)}
              className={`
                flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                ${selectedClasses.includes(cls.id) 
                  ? 'bg-blue-50 border-blue-300 shadow-sm' 
                  : 'bg-white border-gray-200 hover:border-gray-300'}
              `}
            >
              <Checkbox checked={selectedClasses.includes(cls.id)} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{cls.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Users className="h-3 w-3" /> {cls.studentCount} students
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedClasses.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary">
              {selectedClasses.length} class{selectedClasses.length > 1 ? 'es' : ''} selected
            </Badge>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" /> {totalStudents} students
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
