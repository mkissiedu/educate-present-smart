import { supabase } from './supabase';
import { DEFAULT_CLASSES } from './curriculum-defaults';

export type PromotionAction = 'promote' | 'retain' | 'graduate';

export interface PromotionRecord {
  studentId: string;
  action: PromotionAction;
  fromClass: string;
  toClass: string;
}

// Build class progression from DEFAULT_CLASSES (13 classes: Nursery 1 to JHS 3)
export const CLASS_PROGRESSION: Record<string, string> = {};
DEFAULT_CLASSES.forEach((cls, index) => {
  if (index < DEFAULT_CLASSES.length - 1) {
    CLASS_PROGRESSION[cls.name] = DEFAULT_CLASSES[index + 1].name;
    CLASS_PROGRESSION[cls.grade_level] = DEFAULT_CLASSES[index + 1].grade_level;
  } else {
    CLASS_PROGRESSION[cls.name] = 'Graduated';
    CLASS_PROGRESSION[cls.grade_level] = 'GRADUATED';
  }
});

export function getNextClass(currentClass: string): string {
  return CLASS_PROGRESSION[currentClass] || 'Graduated';
}

export function getGradeLevelFromName(className: string): string {
  const cls = DEFAULT_CLASSES.find(c => c.name === className);
  return cls?.grade_level || className;
}

export async function promoteStudents(
  promotions: PromotionRecord[],
  schoolId: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const promo of promotions) {
    try {
      if (promo.action === 'retain') {
        success++;
        continue;
      }

      const newClass = promo.action === 'graduate' ? 'GRADUATED' : getGradeLevelFromName(promo.toClass);
      
      const { error } = await supabase
        .from('students')
        .update({ 
          class_level: newClass,
          updated_at: new Date().toISOString()
        })
        .eq('id', promo.studentId);

      if (error) {
        failed++;
      } else {
        success++;
      }
    } catch {
      failed++;
    }
  }

  // Log promotion history
  if (schoolId) {
    await logPromotionHistory(schoolId, new Date().getFullYear().toString(), promotions);
  }

  return { success, failed };
}

export async function logPromotionHistory(
  schoolId: string,
  academicYear: string,
  promotions: PromotionRecord[]
): Promise<void> {
  const record = {
    school_id: schoolId,
    academic_year: academicYear,
    promotions: JSON.stringify(promotions),
    promoted_at: new Date().toISOString(),
    total_promoted: promotions.filter(p => p.action === 'promote').length,
    total_retained: promotions.filter(p => p.action === 'retain').length,
    total_graduated: promotions.filter(p => p.action === 'graduate').length,
  };

  await supabase.from('promotion_history').insert(record);
}

export async function getPromotionHistory(schoolId: string): Promise<any[]> {
  const { data } = await supabase
    .from('promotion_history')
    .select('*')
    .eq('school_id', schoolId)
    .order('promoted_at', { ascending: false });
  return data || [];
}
