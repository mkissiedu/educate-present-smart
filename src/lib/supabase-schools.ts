import { supabase } from './supabase';
import { School, PublishedContent, PublishContentPayload } from '@/types/school';

export const fetchSchools = async (): Promise<School[]> => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) return [];
  return data || [];
};

// Alias for fetchSchools for consistency
export const getSchools = fetchSchools;


export const fetchSchoolById = async (id: string): Promise<School | null> => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
};

export const createSchool = async (school: Partial<School>): Promise<School | null> => {
  const { data, error } = await supabase
    .from('schools')
    .insert(school)
    .select()
    .single();
  if (error) return null;
  return data;
};
export const updateSchool = async (id: string, updates: Partial<School>): Promise<boolean> => {
  const { error } = await supabase
    .from('schools')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
};

export const deleteSchool = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('schools')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
};


export const fetchPublishedContent = async (schoolId?: string): Promise<PublishedContent[]> => {
  let query = supabase.from('published_content').select('*').eq('is_active', true);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error || !data) return [];
  
  if (schoolId) {
    const { data: accessData } = await supabase
      .from('content_school_access')
      .select('content_id')
      .eq('school_id', schoolId);
    const accessIds = accessData?.map(a => a.content_id) || [];
    return data.filter(c => c.publish_mode === 'all' || accessIds.includes(c.id));
  }
  return data;
};

export const publishContent = async (payload: PublishContentPayload, publishedBy: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('published_content')
    .insert({ ...payload, published_by: publishedBy })
    .select()
    .single();
  
  if (error || !data) return false;
  
  if (payload.publish_mode === 'selected' && payload.selected_schools?.length) {
    const accessRecords = payload.selected_schools.map(schoolId => ({
      content_id: data.id,
      school_id: schoolId
    }));
    await supabase.from('content_school_access').insert(accessRecords);
  }
  return true;
};

export const unpublishContent = async (contentId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('published_content')
    .update({ is_active: false })
    .eq('id', contentId);
  return !error;
};
