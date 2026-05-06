export type ClassLevel = 
  | 'PreK 1/Nursery 1' | 'PreK 2/Nursery 2' 
  | 'KG 1' | 'KG 2' 
  | 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4' | 'Class 5' | 'Class 6'
  | 'JHS 1' | 'JHS 2' | 'JHS 3';

export type CurriculumType = 'NaCCA' | "Ananse's Phonics";

export type Subject = 'Language & Literacy' | 'Numeracy' | 'Our World Our People' | "Ananse's Phonics" | 'Creative Arts' | 'Physical Education' | 'English Language' | 'Mathematics' | 'Science' | 'Social Studies' | 'Computing' | 'French' | 'Ghanaian Language' | 'Religious & Moral Education' | 'Career Technology';

export type UserRole = 'teacher' | 'super_teacher' | 'school_admin' | 'platform_admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  assignedClasses: ClassLevel[];
  subjects?: Subject[];
  avatar?: string;
  school_id?: string;
  school_name?: string;
}

export interface SuperTeacher extends User {
  role: 'super_teacher';
  assignedSubjects?: string[];
  assignedClassLevels?: string[];
}

export interface Teacher extends User {
  employee_id?: string;
  hire_date?: string;
  department?: string;
  is_active: boolean;
}

export const CLASS_LEVELS: ClassLevel[] = [
  'PreK 1/Nursery 1', 'PreK 2/Nursery 2', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
  'JHS 1', 'JHS 2', 'JHS 3'
];

export const CLASS_CURRICULUM_MAP: Record<ClassLevel, CurriculumType[]> = {
  'PreK 1/Nursery 1': ["Ananse's Phonics"], 'PreK 2/Nursery 2': ["Ananse's Phonics"],
  'KG 1': ['NaCCA', "Ananse's Phonics"], 'KG 2': ['NaCCA', "Ananse's Phonics"],
  'Class 1': ['NaCCA', "Ananse's Phonics"], 'Class 2': ['NaCCA', "Ananse's Phonics"],
  'Class 3': ['NaCCA'], 'Class 4': ['NaCCA'], 'Class 5': ['NaCCA'], 'Class 6': ['NaCCA'],
  'JHS 1': ['NaCCA'], 'JHS 2': ['NaCCA'], 'JHS 3': ['NaCCA'],
};

export const CLASS_SUBJECTS_MAP: Record<ClassLevel, Subject[]> = {
  'PreK 1/Nursery 1': ["Ananse's Phonics"], 'PreK 2/Nursery 2': ["Ananse's Phonics"],
  'KG 1': ['Language & Literacy', 'Numeracy', 'Our World Our People', 'Creative Arts', "Ananse's Phonics"],
  'KG 2': ['Language & Literacy', 'Numeracy', 'Our World Our People', 'Creative Arts', "Ananse's Phonics"],
  'Class 1': ['Language & Literacy', 'Numeracy', 'Our World Our People', 'Creative Arts', "Ananse's Phonics"],
  'Class 2': ['Language & Literacy', 'Numeracy', 'Our World Our People', 'Creative Arts', "Ananse's Phonics"],
  'Class 3': ['English Language', 'Mathematics', 'Science', 'Our World Our People', 'Creative Arts', 'Computing', 'French', 'Ghanaian Language', 'Religious & Moral Education'],
  'Class 4': ['English Language', 'Mathematics', 'Science', 'Our World Our People', 'Creative Arts', 'Computing', 'French', 'Ghanaian Language', 'Religious & Moral Education'],
  'Class 5': ['English Language', 'Mathematics', 'Science', 'Our World Our People', 'Creative Arts', 'Computing', 'French', 'Ghanaian Language', 'Religious & Moral Education'],
  'Class 6': ['English Language', 'Mathematics', 'Science', 'Our World Our People', 'Creative Arts', 'Computing', 'French', 'Ghanaian Language', 'Religious & Moral Education'],
  'JHS 1': ['English Language', 'Mathematics', 'Science', 'Social Studies', 'Computing', 'French', 'Ghanaian Language', 'Religious & Moral Education', 'Career Technology'],
  'JHS 2': ['English Language', 'Mathematics', 'Science', 'Social Studies', 'Computing', 'French', 'Ghanaian Language', 'Religious & Moral Education', 'Career Technology'],
  'JHS 3': ['English Language', 'Mathematics', 'Science', 'Social Studies', 'Computing', 'French', 'Ghanaian Language', 'Religious & Moral Education', 'Career Technology'],
};

export const SUBJECTS: Subject[] = [
  'Language & Literacy', 'Numeracy', 'Our World Our People', "Ananse's Phonics", 'Creative Arts',
  'English Language', 'Mathematics', 'Science', 'Social Studies', 'Computing', 'French', 'Ghanaian Language', 'Religious & Moral Education', 'Career Technology', 'Physical Education'
];

export const SUBJECT_COLORS: Record<string, string> = {
  'Language & Literacy': 'from-blue-400 to-blue-600', 'Numeracy': 'from-purple-400 to-purple-600',
  'Our World Our People': 'from-green-400 to-green-600', "Ananse's Phonics": 'from-amber-400 to-amber-600',
  'Creative Arts': 'from-pink-400 to-pink-600', 'English Language': 'from-blue-500 to-indigo-600',
  'Mathematics': 'from-purple-500 to-violet-600', 'Science': 'from-emerald-400 to-teal-600',
  'Social Studies': 'from-orange-400 to-red-500', 'Computing': 'from-cyan-400 to-blue-500',
  'French': 'from-red-400 to-rose-600', 'Ghanaian Language': 'from-yellow-400 to-amber-600',
  'Religious & Moral Education': 'from-indigo-400 to-purple-600', 'Career Technology': 'from-slate-400 to-gray-600',
  'Physical Education': 'from-lime-400 to-green-600',
};

export const ROLE_PERMISSIONS = {
  teacher: { canViewLessons: true, canPresentLessons: true, canCreateLessons: false, canEditLessons: false, canDeleteLessons: false, canManageUsers: false, canViewAllReports: false, canManageSchool: false, canPublishContent: false, canManagePlatform: false, canTrainTeachers: false, canApproveContent: false },
  super_teacher: { canViewLessons: true, canPresentLessons: true, canCreateLessons: true, canEditLessons: true, canDeleteLessons: true, canManageUsers: false, canViewAllReports: true, canManageSchool: false, canPublishContent: true, canManagePlatform: false, canTrainTeachers: true, canApproveContent: false },
  school_admin: { canViewLessons: true, canPresentLessons: false, canCreateLessons: false, canEditLessons: false, canDeleteLessons: false, canManageUsers: true, canViewAllReports: true, canManageSchool: true, canPublishContent: false, canManagePlatform: false, canTrainTeachers: false, canApproveContent: false },
  platform_admin: { canViewLessons: true, canPresentLessons: true, canCreateLessons: true, canEditLessons: true, canDeleteLessons: true, canManageUsers: true, canViewAllReports: true, canManageSchool: true, canPublishContent: true, canManagePlatform: false, canTrainTeachers: true, canApproveContent: true },
  super_admin: { canViewLessons: true, canPresentLessons: true, canCreateLessons: true, canEditLessons: true, canDeleteLessons: true, canManageUsers: true, canViewAllReports: true, canManageSchool: true, canPublishContent: true, canManagePlatform: true, canTrainTeachers: true, canApproveContent: true },
};


export const getRoleDisplayName = (role: UserRole): string => {
  if (role === 'super_teacher') return 'Super Teacher';
  if (role === 'school_admin') return 'School Admin';
  if (role === 'platform_admin') return 'Platform Admin';
  if (role === 'super_admin') return 'Super Admin';
  return 'Teacher';
};

export const getRoleDescription = (role: UserRole): string => {
  if (role === 'super_teacher') return 'Content developer and trainer at Catalyst head office';

  if (role === 'school_admin') return 'School administrator managing teachers and students';
  if (role === 'platform_admin') return 'Platform administrator with elevated privileges';
  if (role === 'super_admin') return 'Super administrator with full platform access';
  return 'Classroom teacher delivering lessons';
};
