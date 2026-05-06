import { SubjectCurriculum } from './nacca-curriculum-types';
import { jhsEnglishCurriculum } from './nacca-jhs-english';
import { jhsMathematicsCurriculum } from './nacca-jhs-mathematics';
import { jhsScienceCurriculum } from './nacca-jhs-science';
import { jhsSocialStudiesCurriculum } from './nacca-jhs-social-studies';
import { jhsComputingCurriculum } from './nacca-jhs-computing';
import { jhsFrenchCurriculum } from './nacca-jhs-french';
import { jhsGhanaianLanguageCurriculum } from './nacca-jhs-ghanaian-language';
import { jhsRMECurriculum } from './nacca-jhs-rme';
import { jhsCareerTechCurriculum } from './nacca-jhs-career-tech';

export const jhsCurriculums: Record<string, SubjectCurriculum> = {
  'English Language': jhsEnglishCurriculum,
  'Mathematics': jhsMathematicsCurriculum,
  'Science': jhsScienceCurriculum,
  'Social Studies': jhsSocialStudiesCurriculum,
  'Computing': jhsComputingCurriculum,
  'French': jhsFrenchCurriculum,
  'Ghanaian Language': jhsGhanaianLanguageCurriculum,
  'Religious & Moral Education': jhsRMECurriculum,
  'Career Technology': jhsCareerTechCurriculum
};

export const JHS_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Science',
  'Social Studies',
  'Computing',
  'French',
  'Ghanaian Language',
  'Religious & Moral Education',
  'Career Technology'
];

export {
  jhsEnglishCurriculum,
  jhsMathematicsCurriculum,
  jhsScienceCurriculum,
  jhsSocialStudiesCurriculum,
  jhsComputingCurriculum,
  jhsFrenchCurriculum,
  jhsGhanaianLanguageCurriculum,
  jhsRMECurriculum,
  jhsCareerTechCurriculum
};
