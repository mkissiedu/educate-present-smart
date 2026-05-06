import { supabase } from './supabase';
import { SchoolBranding, DEFAULT_BRANDING } from '@/types/branding';

export const fetchSchoolBranding = async (schoolId: string): Promise<SchoolBranding | null> => {
  const { data, error } = await supabase
    .from('school_branding')
    .select('*')
    .eq('school_id', schoolId)
    .single();
  
  if (error || !data) return null;
  return data;
};

export const upsertSchoolBranding = async (branding: Partial<SchoolBranding>): Promise<SchoolBranding | null> => {
  const { data, error } = await supabase
    .from('school_branding')
    .upsert({
      ...branding,
      updated_at: new Date().toISOString()
    }, { onConflict: 'school_id' })
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting branding:', error);
    return null;
  }
  return data;
};

export const uploadSchoolLogo = async (schoolId: string, file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${schoolId}-logo-${Date.now()}.${fileExt}`;
  const filePath = `${schoolId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('school-logos')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('Error uploading logo:', uploadError);
    return null;
  }

  const { data } = supabase.storage.from('school-logos').getPublicUrl(filePath);
  return data.publicUrl;
};

export const deleteSchoolLogo = async (logoUrl: string): Promise<boolean> => {
  const path = logoUrl.split('/school-logos/')[1];
  if (!path) return false;
  
  const { error } = await supabase.storage.from('school-logos').remove([path]);
  return !error;
};

export const getOrCreateBranding = async (schoolId: string): Promise<SchoolBranding> => {
  const existing = await fetchSchoolBranding(schoolId);
  if (existing) return existing;
  
  const newBranding = await upsertSchoolBranding({ ...DEFAULT_BRANDING, school_id: schoolId });
  return newBranding || { ...DEFAULT_BRANDING, school_id: schoolId };
};
