// Default classes and subjects from NaCCA curriculum

export interface DefaultClass {
  name: string;
  grade_level: string;
  category: string;
  display_order: number;
}

export interface DefaultSubject {
  name: string;
  code: string;
  applicable_classes: string[];
  display_order: number;
}

// 13 classes from Nursery 1 (PreK 1) to JHS 3
export const DEFAULT_CLASSES: DefaultClass[] = [
  { name: 'Nursery 1 (PreK 1)', grade_level: 'N1', category: 'Pre-School', display_order: 1 },
  { name: 'Nursery 2 (PreK 2)', grade_level: 'N2', category: 'Pre-School', display_order: 2 },
  { name: 'KG 1', grade_level: 'KG1', category: 'Kindergarten', display_order: 3 },
  { name: 'KG 2', grade_level: 'KG2', category: 'Kindergarten', display_order: 4 },
  { name: 'Class 1', grade_level: 'B1', category: 'Lower Primary', display_order: 5 },
  { name: 'Class 2', grade_level: 'B2', category: 'Lower Primary', display_order: 6 },
  { name: 'Class 3', grade_level: 'B3', category: 'Lower Primary', display_order: 7 },
  { name: 'Class 4', grade_level: 'B4', category: 'Upper Primary', display_order: 8 },
  { name: 'Class 5', grade_level: 'B5', category: 'Upper Primary', display_order: 9 },
  { name: 'Class 6', grade_level: 'B6', category: 'Upper Primary', display_order: 10 },
  { name: 'JHS 1', grade_level: 'JHS1', category: 'JHS', display_order: 11 },
  { name: 'JHS 2', grade_level: 'JHS2', category: 'JHS', display_order: 12 },
  { name: 'JHS 3', grade_level: 'JHS3', category: 'JHS', display_order: 13 },
];

export const DEFAULT_SUBJECTS: DefaultSubject[] = [
  { name: 'Language & Literacy', code: 'LANG_LIT', applicable_classes: ['N1', 'N2', 'KG1', 'KG2'], display_order: 1 },
  { name: 'Numeracy', code: 'NUM', applicable_classes: ['N1', 'N2', 'KG1', 'KG2'], display_order: 2 },
  { name: 'English Language', code: 'ENG', applicable_classes: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'JHS1', 'JHS2', 'JHS3'], display_order: 3 },
  { name: 'Mathematics', code: 'MATH', applicable_classes: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'JHS1', 'JHS2', 'JHS3'], display_order: 4 },
  { name: 'Science', code: 'SCI', applicable_classes: ['B4', 'B5', 'B6', 'JHS1', 'JHS2', 'JHS3'], display_order: 5 },
  { name: 'Our World Our People', code: 'OWOP', applicable_classes: ['N1', 'N2', 'KG1', 'KG2', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6'], display_order: 6 },
  { name: 'Social Studies', code: 'SOC', applicable_classes: ['JHS1', 'JHS2', 'JHS3'], display_order: 7 },
  { name: 'Creative Arts', code: 'CART', applicable_classes: ['N1', 'N2', 'KG1', 'KG2', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6'], display_order: 8 },
  { name: 'Physical Education', code: 'PE', applicable_classes: ['N1', 'N2', 'KG1', 'KG2', 'B1', 'B2', 'B3'], display_order: 9 },
  { name: 'Computing', code: 'ICT', applicable_classes: ['B4', 'B5', 'B6', 'JHS1', 'JHS2', 'JHS3'], display_order: 10 },
  { name: 'French', code: 'FRE', applicable_classes: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'JHS1', 'JHS2', 'JHS3'], display_order: 11 },
  { name: 'Ghanaian Language', code: 'GHL', applicable_classes: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'JHS1', 'JHS2', 'JHS3'], display_order: 12 },
  { name: 'Religious & Moral Education', code: 'RME', applicable_classes: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'JHS1', 'JHS2', 'JHS3'], display_order: 13 },
  { name: 'Career Technology', code: 'CTECH', applicable_classes: ['JHS1', 'JHS2', 'JHS3'], display_order: 14 },
];

export const getSubjectsForClass = (gradeLevel: string): DefaultSubject[] => {
  return DEFAULT_SUBJECTS.filter(s => s.applicable_classes.includes(gradeLevel));
};

export const getClassCategory = (gradeLevel: string): string => {
  const cls = DEFAULT_CLASSES.find(c => c.grade_level === gradeLevel);
  return cls?.category || 'Unknown';
};

export const getClassByGradeLevel = (gradeLevel: string): DefaultClass | undefined => {
  return DEFAULT_CLASSES.find(c => c.grade_level === gradeLevel);
};
