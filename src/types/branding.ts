export interface SchoolBranding {
  id: string;
  school_id: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  header_gradient_from: string;
  header_gradient_to: string;
  font_family: string;
  custom_css?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BrandingColors {
  primary: string;
  secondary: string;
  accent: string;
  headerGradientFrom: string;
  headerGradientTo: string;
}

export const DEFAULT_BRANDING: SchoolBranding = {
  id: '',
  school_id: '',
  primary_color: '#3B82F6',
  secondary_color: '#8B5CF6',
  accent_color: '#10B981',
  header_gradient_from: '#1E3A8A',
  header_gradient_to: '#3B82F6',
  font_family: 'Inter',
  is_active: true
};

export const PRESET_COLOR_SCHEMES = [
  { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#0EA5E9', accent: '#06B6D4', gradientFrom: '#1E3A8A', gradientTo: '#3B82F6' },
  { name: 'Forest Green', primary: '#10B981', secondary: '#059669', accent: '#34D399', gradientFrom: '#064E3B', gradientTo: '#10B981' },
  { name: 'Royal Purple', primary: '#8B5CF6', secondary: '#7C3AED', accent: '#A78BFA', gradientFrom: '#4C1D95', gradientTo: '#8B5CF6' },
  { name: 'Sunset Orange', primary: '#F97316', secondary: '#EA580C', accent: '#FB923C', gradientFrom: '#9A3412', gradientTo: '#F97316' },
  { name: 'Ruby Red', primary: '#EF4444', secondary: '#DC2626', accent: '#F87171', gradientFrom: '#7F1D1D', gradientTo: '#EF4444' },
  { name: 'Golden Yellow', primary: '#EAB308', secondary: '#CA8A04', accent: '#FDE047', gradientFrom: '#713F12', gradientTo: '#EAB308' },
  { name: 'Teal', primary: '#14B8A6', secondary: '#0D9488', accent: '#2DD4BF', gradientFrom: '#134E4A', gradientTo: '#14B8A6' },
  { name: 'Indigo', primary: '#6366F1', secondary: '#4F46E5', accent: '#818CF8', gradientFrom: '#312E81', gradientTo: '#6366F1' },
];
