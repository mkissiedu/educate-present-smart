import { CKLACurriculum, CKLA_SUBJECTS } from './ckla-curriculum-types';
import { cklaPreKSkills } from './ckla-prek-skills';
import { cklaPreKKnowledge } from './ckla-prek-knowledge';
import { cklaKSkills } from './ckla-k-skills';
import { cklaKKnowledge } from './ckla-k-knowledge';
import { cklaG1Skills } from './ckla-g1-skills';
import { cklaG1Knowledge } from './ckla-g1-knowledge';
import { cklaG2Skills } from './ckla-g2-skills';
import { cklaG2Knowledge } from './ckla-g2-knowledge';

type CKLAGradeLevel = 'PreK' | 'K' | 'G1' | 'G2';
type CKLASubject = 'Skills Strand' | 'Knowledge Strand';

export type CKLACurriculumMap = {
  [level in CKLAGradeLevel]: {
    [subject in CKLASubject]?: CKLACurriculum;
  };
};

export const cklaCurriculums: CKLACurriculumMap = {
  PreK: { 'Skills Strand': cklaPreKSkills, 'Knowledge Strand': cklaPreKKnowledge },
  K: { 'Skills Strand': cklaKSkills, 'Knowledge Strand': cklaKKnowledge },
  G1: { 'Skills Strand': cklaG1Skills, 'Knowledge Strand': cklaG1Knowledge },
  G2: { 'Skills Strand': cklaG2Skills, 'Knowledge Strand': cklaG2Knowledge },
};

export const getCKLACurriculum = (level: CKLAGradeLevel, subject: CKLASubject): CKLACurriculum | undefined => {
  return cklaCurriculums[level]?.[subject];
};

export const getCKLASubjects = (): CKLASubject[] => [...CKLA_SUBJECTS];

export { CKLA_SUBJECTS };
export type { CKLAGradeLevel, CKLASubject };
