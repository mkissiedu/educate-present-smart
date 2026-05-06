import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SchoolBranding, DEFAULT_BRANDING } from '@/types/branding';
import { fetchSchoolBranding } from '@/lib/supabase-branding';
import { useAuth } from './AuthContext';

interface BrandingContextType {
  branding: SchoolBranding;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
  setBranding: (branding: SchoolBranding) => void;
  getCSSVariables: () => Record<string, string>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) throw new Error('useBranding must be used within BrandingProvider');
  return context;
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [branding, setBranding] = useState<SchoolBranding>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(false);

  const refreshBranding = useCallback(async () => {
    if (!user?.school_id) return;
    setIsLoading(true);
    const data = await fetchSchoolBranding(user.school_id);
    if (data) setBranding(data);
    else setBranding({ ...DEFAULT_BRANDING, school_id: user.school_id });
    setIsLoading(false);
  }, [user?.school_id]);

  useEffect(() => {
    if (user?.school_id) refreshBranding();
    else setBranding(DEFAULT_BRANDING);
  }, [user?.school_id, refreshBranding]);

  const getCSSVariables = useCallback(() => ({
    '--brand-primary': branding.primary_color,
    '--brand-secondary': branding.secondary_color,
    '--brand-accent': branding.accent_color,
    '--brand-gradient-from': branding.header_gradient_from,
    '--brand-gradient-to': branding.header_gradient_to,
  }), [branding]);

  useEffect(() => {
    const vars = getCSSVariables();
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [getCSSVariables]);

  return (
    <BrandingContext.Provider value={{ branding, isLoading, refreshBranding, setBranding, getCSSVariables }}>
      {children}
    </BrandingContext.Provider>
  );
};
