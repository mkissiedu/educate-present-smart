import { supabase } from './supabase';

export interface KnowledgeBaseDocument {
  id: string;
  title: string;
  content: string;
  subject?: string;
  grade_level?: string;
  file_name?: string;
  uploaded_by?: string;
  created_at: string;
}

export async function fetchKBDocuments(): Promise<KnowledgeBaseDocument[]> {
  const { data, error } = await supabase
    .from('knowledge_base_documents')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[KB] fetchKBDocuments error:', error);
    return [];
  }
  return data || [];
}

export async function fetchKBDocumentsBySubject(subject: string, gradeLevel?: string): Promise<KnowledgeBaseDocument[]> {
  let query = supabase
    .from('knowledge_base_documents')
    .select('*')
    .or(`subject.eq.${subject},subject.is.null`);
  if (gradeLevel) {
    query = query.or(`grade_level.eq.${gradeLevel},grade_level.is.null`);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function createKBDocument(doc: {
  title: string;
  content: string;
  subject?: string;
  grade_level?: string;
  file_name?: string;
  uploaded_by?: string;
}): Promise<KnowledgeBaseDocument | null> {
  const { data, error } = await supabase
    .from('knowledge_base_documents')
    .insert(doc)
    .select()
    .single();
  if (error) {
    console.error('[KB] createKBDocument error:', error);
    return null;
  }
  return data;
}

export async function deleteKBDocument(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('knowledge_base_documents')
    .delete()
    .eq('id', id);
  return !error;
}
