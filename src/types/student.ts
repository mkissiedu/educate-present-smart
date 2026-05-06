export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  name: string; // computed: first_name + last_name
  class_level: string;
  class_name?: string; // alias for class_level
  date_of_birth?: string;
  student_id?: string;
  teacher_id: string;
  guardian1_name?: string;
  guardian1_whatsapp?: string;
  guardian1_email?: string;
  guardian2_name?: string;
  guardian2_whatsapp?: string;
  guardian2_email?: string;
  parent_phone?: string; // alias for guardian1_whatsapp
  guardian_phone?: string; // alias for guardian1_whatsapp
  parent_email?: string; // alias for guardian1_email
  created_at?: string;
  updated_at?: string;
}




export interface Skill {
  id: string;
  skill_code: string;
  skill_name: string;
  domain: 'Knowledge' | 'Skills';
  class_level: string;
  unit_number?: number;
  lesson_id?: string;
  description?: string;
  created_at?: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  skill_id: string;
  mastered: boolean;
  assessed_date?: string;
  notes?: string;
  assessed_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PollResponse {
  id: string;
  lesson_id: string;
  poll_question: string;
  student_id: string;
  response: string;
  created_at: string;
}
