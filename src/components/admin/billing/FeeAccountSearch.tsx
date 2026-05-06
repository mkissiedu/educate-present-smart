import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, Wallet, ArrowRight } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  class_name?: string;
  parent_phone?: string;
}

interface Props {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export function FeeAccountSearch({ students, onSelectStudent }: Props) {
  const [search, setSearch] = useState('');

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.class_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-600" />
          Student Fee Accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search student by name or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredStudents.slice(0, 50).map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
              onClick={() => onSelectStudent(student)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{student.name}</p>
                  {student.class_name && (
                    <Badge variant="secondary" className="text-xs mt-1">{student.class_name}</Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 gap-1">
                View Account <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found
            </div>
          )}
          {filteredStudents.length > 50 && (
            <p className="text-center text-sm text-gray-500 py-2">
              Showing first 50 results. Refine your search for more.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
