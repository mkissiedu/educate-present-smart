import React, { createContext, useContext, useState, useEffect } from 'react';
import { School } from '@/types/school';
import { fetchSchools, fetchSchoolById } from '@/lib/supabase-schools';

interface SchoolContextType {
  schools: School[];
  currentSchool: School | null;
  setCurrentSchool: (school: School | null) => void;
  selectSchoolById: (id: string) => Promise<void>;
  isLoading: boolean;
  refreshSchools: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) throw new Error('useSchool must be used within a SchoolProvider');
  return context;
};

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchool, setCurrentSchool] = useState<School | null>(() => {
    try {
      const saved = localStorage.getItem('catalyst_school');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshSchools();
  }, []);

  useEffect(() => {
    if (currentSchool) {
      localStorage.setItem('catalyst_school', JSON.stringify(currentSchool));
    } else {
      localStorage.removeItem('catalyst_school');
    }
  }, [currentSchool]);

  const refreshSchools = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSchools();
      setSchools(data || []);
    } catch (err) {
      console.warn('[SchoolContext] Failed to fetch schools, using empty list:', err);
      setSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSchoolById = async (id: string) => {
    try {
      const school = await fetchSchoolById(id);
      setCurrentSchool(school);
    } catch (err) {
      console.warn('[SchoolContext] Failed to fetch school by id:', err);
    }
  };

  return (
    <SchoolContext.Provider value={{ schools, currentSchool, setCurrentSchool, selectSchoolById, isLoading, refreshSchools }}>
      {children}
    </SchoolContext.Provider>
  );
};
