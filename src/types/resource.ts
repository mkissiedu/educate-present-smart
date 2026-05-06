export interface Resource {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  subject?: string;
  class_level?: string;
  lesson_id?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  uploader_name?: string;
}

export type ResourceFilterType = 'all' | 'pdf' | 'image' | 'audio';
