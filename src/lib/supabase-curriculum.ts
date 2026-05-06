import { supabase } from './supabase';

export interface CustomCurriculum {
  id: string;
  system: string;
  level: string;
  subject: string;
  created_at?: string;
}

export interface CustomStrand {
  id: string;
  curriculum_id: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface CustomSubStrand {
  id: string;
  strand_id: string;
  name: string;
  sort_order: number;
}

export interface CustomContentStandard {
  id: string;
  sub_strand_id: string;
  code: string;
  description: string;
  sort_order: number;
}

export interface CustomIndicator {
  id: string;
  content_standard_id: string;
  code: string;
  description: string;
  sort_order: number;
}

// Curriculum CRUD
export const createCurriculum = async (data: Omit<CustomCurriculum, 'id'>) => {
  const { data: result, error } = await supabase.from('custom_curriculums').insert(data).select().single();
  if (error) throw error;
  return result;
};

export const getCurriculums = async () => {
  const { data, error } = await supabase.from('custom_curriculums').select('*').order('level');
  if (error) throw error;
  return data || [];
};

export const deleteCurriculum = async (id: string) => {
  const { error } = await supabase.from('custom_curriculums').delete().eq('id', id);
  if (error) throw error;
};

// Strand CRUD
export const createStrand = async (data: Omit<CustomStrand, 'id'>) => {
  const { data: result, error } = await supabase.from('custom_strands').insert(data).select().single();
  if (error) throw error;
  return result;
};

export const getStrands = async (curriculumId: string) => {
  const { data, error } = await supabase.from('custom_strands').select('*').eq('curriculum_id', curriculumId).order('sort_order');
  if (error) throw error;
  return data || [];
};

export const updateStrand = async (id: string, data: Partial<CustomStrand>) => {
  const { error } = await supabase.from('custom_strands').update(data).eq('id', id);
  if (error) throw error;
};

export const deleteStrand = async (id: string) => {
  const { error } = await supabase.from('custom_strands').delete().eq('id', id);
  if (error) throw error;
};

// SubStrand CRUD
export const createSubStrand = async (data: Omit<CustomSubStrand, 'id'>) => {
  const { data: result, error } = await supabase.from('custom_sub_strands').insert(data).select().single();
  if (error) throw error;
  return result;
};

export const getSubStrands = async (strandId: string) => {
  const { data, error } = await supabase.from('custom_sub_strands').select('*').eq('strand_id', strandId).order('sort_order');
  if (error) throw error;
  return data || [];
};

export const deleteSubStrand = async (id: string) => {
  const { error } = await supabase.from('custom_sub_strands').delete().eq('id', id);
  if (error) throw error;
};

// Content Standard CRUD
export const createContentStandard = async (data: Omit<CustomContentStandard, 'id'>) => {
  const { data: result, error } = await supabase.from('custom_content_standards').insert(data).select().single();
  if (error) throw error;
  return result;
};

export const getContentStandards = async (subStrandId: string) => {
  const { data, error } = await supabase.from('custom_content_standards').select('*').eq('sub_strand_id', subStrandId).order('sort_order');
  if (error) throw error;
  return data || [];
};

export const deleteContentStandard = async (id: string) => {
  const { error } = await supabase.from('custom_content_standards').delete().eq('id', id);
  if (error) throw error;
};

// Indicator CRUD
export const createIndicator = async (data: Omit<CustomIndicator, 'id'>) => {
  const { data: result, error } = await supabase.from('custom_indicators').insert(data).select().single();
  if (error) throw error;
  return result;
};

export const getIndicators = async (contentStandardId: string) => {
  const { data, error } = await supabase.from('custom_indicators').select('*').eq('content_standard_id', contentStandardId).order('sort_order');
  if (error) throw error;
  return data || [];
};

export const deleteIndicator = async (id: string) => {
  const { error } = await supabase.from('custom_indicators').delete().eq('id', id);
  if (error) throw error;
};

// Get full curriculum with nested data
export const getFullCurriculum = async (curriculumId: string) => {
  const strands = await getStrands(curriculumId);
  const fullStrands = await Promise.all(strands.map(async (strand) => {
    const subStrands = await getSubStrands(strand.id);
    const fullSubStrands = await Promise.all(subStrands.map(async (ss) => {
      const standards = await getContentStandards(ss.id);
      const fullStandards = await Promise.all(standards.map(async (cs) => {
        const indicators = await getIndicators(cs.id);
        return { ...cs, indicators };
      }));
      return { ...ss, contentStandards: fullStandards };
    }));
    return { ...strand, subStrands: fullSubStrands };
  }));
  return fullStrands;
};
