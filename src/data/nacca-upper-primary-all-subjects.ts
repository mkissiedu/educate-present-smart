import { SubjectCurriculum } from './nacca-curriculum-types';
import { upperPrimaryEnglishCurriculum } from './nacca-upper-primary-english';
import { upperPrimaryMathCurriculum } from './nacca-upper-primary-math';
import { upperPrimaryScienceCurriculum } from './nacca-upper-primary-science';
import { upperPrimaryOwopCurriculum } from './nacca-upper-primary-owop';
import { upperPrimaryCreativeArtsCurriculum } from './nacca-upper-primary-creative-arts';
import { upperPrimaryComputingCurriculum } from './nacca-upper-primary-computing';
import { upperPrimaryFrenchCurriculum } from './nacca-upper-primary-french';
import { upperPrimaryGhanaianLangCurriculum } from './nacca-upper-primary-ghanaian-lang';
import { upperPrimaryRmeCurriculum } from './nacca-upper-primary-rme';

// Export individual curriculums
export {
  upperPrimaryEnglishCurriculum,
  upperPrimaryMathCurriculum,
  upperPrimaryScienceCurriculum,
  upperPrimaryOwopCurriculum,
  upperPrimaryCreativeArtsCurriculum,
  upperPrimaryComputingCurriculum,
  upperPrimaryFrenchCurriculum,
  upperPrimaryGhanaianLangCurriculum,
  upperPrimaryRmeCurriculum
};

// Combined curriculums for Upper Primary (Class 3-6)
export const upperPrimaryCurriculums: Record<string, SubjectCurriculum> = {
  'English Language': upperPrimaryEnglishCurriculum,
  'Mathematics': upperPrimaryMathCurriculum,
  'Science': upperPrimaryScienceCurriculum,
  'Our World Our People': upperPrimaryOwopCurriculum,
  'Creative Arts': upperPrimaryCreativeArtsCurriculum,
  'Computing': upperPrimaryComputingCurriculum,
  'French': upperPrimaryFrenchCurriculum,
  'Ghanaian Language': upperPrimaryGhanaianLangCurriculum,
  'Religious & Moral Education': upperPrimaryRmeCurriculum
};

// Subject list for Upper Primary
export const UPPER_PRIMARY_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Science',
  'Our World Our People',
  'Creative Arts',
  'Computing',
  'French',
  'Ghanaian Language',
  'Religious & Moral Education'
] as const;

export type UpperPrimarySubject = typeof UPPER_PRIMARY_SUBJECTS[number];
