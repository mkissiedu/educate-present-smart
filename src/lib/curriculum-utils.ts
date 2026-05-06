import { KGLevel, LearningIndicator, Strand, SubStrand, ContentStandard } from '@/data/nacca-kg-curriculum-types';
import { kgCurriculums } from '@/data/nacca-kg-all-subjects';

export interface CurriculumPath {
  level: KGLevel;
  subject: string;
  strand: Strand;
  subStrand: SubStrand;
  contentStandard: ContentStandard;
  indicator: LearningIndicator;
}

export interface IndicatorWithPath {
  indicator: LearningIndicator;
  path: CurriculumPath;
}

// Get full curriculum path for an indicator ID
export function getIndicatorPath(indicatorId: string): CurriculumPath | null {
  for (const level of ['KG1', 'KG2'] as KGLevel[]) {
    const subjects = kgCurriculums[level];
    for (const [subject, curriculum] of Object.entries(subjects)) {
      for (const strand of curriculum.strands) {
        for (const subStrand of strand.subStrands) {
          for (const cs of subStrand.contentStandards) {
            for (const ind of cs.indicators) {
              if (ind.id === indicatorId) {
                return { level, subject, strand, subStrand, contentStandard: cs, indicator: ind };
              }
            }
          }
        }
      }
    }
  }
  return null;
}

// Get multiple indicator paths
export function getIndicatorPaths(indicatorIds: string[]): IndicatorWithPath[] {
  return indicatorIds.map(id => {
    const path = getIndicatorPath(id);
    return path ? { indicator: path.indicator, path } : null;
  }).filter((p): p is IndicatorWithPath => p !== null);
}

// Format curriculum path as string
export function formatCurriculumPath(path: CurriculumPath): string {
  return `${path.strand.name} > ${path.subStrand.name} > ${path.contentStandard.description}`;
}

// Get all indicators from all curriculums
export function getAllIndicators(): IndicatorWithPath[] {
  const indicators: IndicatorWithPath[] = [];
  for (const level of ['KG1', 'KG2'] as KGLevel[]) {
    const subjects = kgCurriculums[level];
    for (const [subject, curriculum] of Object.entries(subjects)) {
      for (const strand of curriculum.strands) {
        for (const subStrand of strand.subStrands) {
          for (const cs of subStrand.contentStandards) {
            for (const ind of cs.indicators) {
              indicators.push({
                indicator: ind,
                path: { level, subject, strand, subStrand, contentStandard: cs, indicator: ind }
              });
            }
          }
        }
      }
    }
  }
  return indicators;
}
