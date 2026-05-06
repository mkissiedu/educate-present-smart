import { supabase } from './supabase';
import { Resource } from '@/types/resource';

export async function uploadResource(file: File, metadata: {
  title: string;
  description?: string;
  subject?: string;
  class_level?: string;
  lesson_id?: string;
  uploaded_by: string;
}): Promise<{ data: Resource | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('lesson-resources')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('lesson-resources')
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('resources')
      .insert({
        ...metadata,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchResources(filters?: {
  subject?: string;
  class_level?: string;
  lesson_id?: string;
}): Promise<{ data: Resource[] | null; error: any }> {
  try {
    let query = supabase
      .from('resources')
      .select('*, uploader:users!uploaded_by(name)')
      .order('created_at', { ascending: false });

    if (filters?.subject) query = query.eq('subject', filters.subject);
    if (filters?.class_level) query = query.eq('class_level', filters.class_level);
    if (filters?.lesson_id) query = query.eq('lesson_id', filters.lesson_id);

    const { data, error } = await query;

    const resources = data?.map((r: any) => ({
      ...r,
      uploader_name: r.uploader?.name,
    }));

    return { data: resources, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteResource(id: string, fileUrl: string): Promise<{ error: any }> {
  try {
    const fileName = fileUrl.split('/').pop();
    if (fileName) {
      await supabase.storage.from('lesson-resources').remove([fileName]);
    }
    const { error } = await supabase.from('resources').delete().eq('id', id);
    return { error };
  } catch (error) {
    return { error };
  }
}
