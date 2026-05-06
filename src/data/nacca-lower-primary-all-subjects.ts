import { LowerPrimarySubjectCurriculum, LOWER_PRIMARY_SUBJECTS } from './nacca-lower-primary-types';
import { lowerPrimaryEnglishCurriculum } from './nacca-lower-primary-english';
import { lowerPrimaryMathCurriculum } from './nacca-lower-primary-math';
import { lowerPrimaryOWOPCurriculum } from './nacca-lower-primary-owop';
import { lowerPrimaryCreativeArtsCurriculum } from './nacca-lower-primary-creative-arts';
import { lowerPrimaryPECurriculum } from './nacca-lower-primary-pe';
import { lowerPrimaryGhanaianLangCurriculum } from './nacca-lower-primary-ghanaian-lang';
import { lowerPrimaryRMECurriculum } from './nacca-lower-primary-rme';
import { lowerPrimaryFrenchCurriculum } from './nacca-lower-primary-french';

export { LOWER_PRIMARY_SUBJECTS };

export type LowerPrimarySubject = typeof LOWER_PRIMARY_SUBJECTS[number];

export const lowerPrimaryCurriculums: Record<string, LowerPrimarySubjectCurriculum> = {
  'English Language': lowerPrimaryEnglishCurriculum,
  'Mathematics': lowerPrimaryMathCurriculum,
  'Our World Our People': lowerPrimaryOWOPCurriculum,
  'Creative Arts': lowerPrimaryCreativeArtsCurriculum,
  'Physical Education': lowerPrimaryPECurriculum,
  'Ghanaian Language': lowerPrimaryGhanaianLangCurriculum,
  'Religious & Moral Education': lowerPrimaryRMECurriculum,
  'French': lowerPrimaryFrenchCurriculum
};

export const getLowerPrimaryCurriculum = (subject: string): LowerPrimarySubjectCurriculum | undefined => {
  return lowerPrimaryCurriculums[subject];
};

export const getAllLowerPrimarySubjects = (): string[] => {
  return [...LOWER_PRIMARY_SUBJECTS];
};
