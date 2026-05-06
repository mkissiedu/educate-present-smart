import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, ROLE_PERMISSIONS } from '@/types/user';
import { loginUser, fetchAllTeachers } from '@/lib/supabase-db';
import { ensureAdminExists } from '@/lib/supabase-admin';
import { normalizeUser, callEdgeFunction } from '@/lib/edge-functions';
import { fetchSuperTeacherAssignments, getAssignedSubjects, getAssignedClasses, SuperTeacherAssignment } from '@/lib/supabase-super-teacher';

// ─── Session Storage Keys ──────────────────────────────────────────
const SESSION_TOKEN_KEY = 'ananse_session_token';
const SESSION_EXPIRY_KEY = 'ananse_session_expiry';
const USER_KEY = 'ananse_user';

interface AuthContextType {
  user: (User & { permissions?: typeof ROLE_PERMISSIONS.teacher }) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  loginWithOTP: (user: User, session?: { token: string; expiresAt: string; sessionId: string }) => void;
  logout: () => void;
  sessionToken: string | null;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canViewAllReports: boolean;
  canManageSchool: boolean;
  canPublishContent: boolean;
  canManagePlatform: boolean;
  canTrainTeachers: boolean;
  canApproveContent: boolean;
  isAdmin: boolean;
  isSuperTeacher: boolean;
  isPlatformAdmin: boolean;
  isSuperAdmin: boolean;
  allTeachers: User[];
  refreshTeachers: () => Promise<void>;
  superTeacherAssignments: SuperTeacherAssignment[];
  assignedSubjects: string[];
  assignedClasses: string[];
  refreshAssignments: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return normalizeUser(parsed) || parsed;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  });
  const [allTeachers, setAllTeachers] = useState<User[]>([]);
  const [superTeacherAssignments, setSuperTeacherAssignments] = useState<SuperTeacherAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Persist user to localStorage
  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  // Persist session token to localStorage
  useEffect(() => {
    if (sessionToken) localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
    else localStorage.removeItem(SESSION_TOKEN_KEY);
  }, [sessionToken]);

  // Validate session on app load if we have a token
  useEffect(() => {
    const validateStoredSession = async () => {
      const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
      const storedExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);

      if (!storedToken) return;

      // Quick client-side expiry check before hitting the server
      if (storedExpiry) {
        const expiryDate = new Date(storedExpiry);
        if (expiryDate < new Date()) {
          console.log('[Auth] Session expired (client-side check), clearing');
          clearSession();
          return;
        }
      }

      // Validate with the server
      try {
        console.log('[Auth] Validating stored session token...');
        const { data, error } = await callEdgeFunction('validate-session', {
          token: storedToken,
        });

        if (error && !data?.success) {
          console.log('[Auth] Session validation failed:', error);
          // Don't clear if it's a network error — keep the cached user
          if (error.includes('Network error') || error.includes('Failed to fetch')) {
            console.log('[Auth] Network error during validation, keeping cached user');
            return;
          }
          clearSession();
          return;
        }

        if (data?.success && data?.user) {
          console.log('[Auth] Session validated, refreshing user data');
          const normalized = normalizeUser(data.user);
          if (normalized) {
            setUser(normalized);
          }
        } else if (data?.success === false) {
          console.log('[Auth] Session invalid:', data?.error || data?.code);
          clearSession();
        }
      } catch (err) {
        console.error('[Auth] Session validation exception:', err);
        // Keep cached user on network failures
      }
    };

    validateStoredSession();
  }, []);

  useEffect(() => {
    refreshTeachers();
    ensureAdminExists().catch(console.error);
  }, []);

  useEffect(() => {
    if (user?.role === 'super_teacher') refreshAssignments();
    else setSuperTeacherAssignments([]);
  }, [user?.id, user?.role]);

  const clearSession = () => {
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const refreshTeachers = async () => {
    const teachers = await fetchAllTeachers();
    setAllTeachers(teachers);
  };

  const refreshAssignments = async () => {
    if (user?.role === 'super_teacher') {
      const assignments = await fetchSuperTeacherAssignments(user.id);
      setSuperTeacherAssignments(assignments);
    }
  };

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('[Auth] login called:', { email, role });
      const dbUser = await loginUser(email, password, role);
      if (dbUser) {
        console.log('[Auth] Login successful:', { id: dbUser.id, name: dbUser.name, role: dbUser.role });
        setUser(dbUser);
        return true;
      }
      console.log('[Auth] Login failed - no user returned');
      return false;
    } catch (err: any) {
      console.error('[Auth] Login exception:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOTP = (otpUser: User | any, session?: { token: string; expiresAt: string; sessionId: string }) => {
    console.log('[Auth] loginWithOTP called with:', { userId: otpUser?.id, hasSession: !!session });
    
    const normalized = normalizeUser(otpUser);
    
    if (normalized) {
      console.log('[Auth] OTP login successful:', { id: normalized.id, name: normalized.name, role: normalized.role });
      setUser(normalized);
    } else {
      console.warn('[Auth] normalizeUser returned null, using raw data:', otpUser);
      setUser(otpUser);
    }

    // Store session token if provided
    if (session?.token) {
      console.log('[Auth] Storing session token, expires:', session.expiresAt);
      setSessionToken(session.token);
      localStorage.setItem(SESSION_TOKEN_KEY, session.token);
      if (session.expiresAt) {
        localStorage.setItem(SESSION_EXPIRY_KEY, session.expiresAt);
      }
    }
  };

  const logout = async () => {
    console.log('[Auth] Logout — revoking session server-side');
    // Revoke session on server before clearing local state
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (token) {
      try {
        await callEdgeFunction('logout-session', { token });
        console.log('[Auth] Session revoked on server');
      } catch (err) {
        console.warn('[Auth] Failed to revoke session server-side:', err);
      }
    }
    clearSession();
    setSuperTeacherAssignments([]);
  };


  const permissions = user ? (ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.teacher) : ROLE_PERMISSIONS.teacher;
  const isAdmin = user?.role === 'school_admin';
  const isSuperTeacher = user?.role === 'super_teacher';
  const isPlatformAdmin = user?.role === 'platform_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const assignedSubjects = getAssignedSubjects(superTeacherAssignments);
  const assignedClasses = getAssignedClasses(superTeacherAssignments);

  const userWithPermissions = user ? { ...user, permissions } : null;

  return (
    <AuthContext.Provider value={{
      user: userWithPermissions, isAuthenticated: !!user, isLoading, login, loginWithOTP, logout,
      sessionToken,
      allTeachers, refreshTeachers,
      canCreate: permissions.canCreateLessons, canEdit: permissions.canEditLessons, canDelete: permissions.canDeleteLessons,
      canManageUsers: permissions.canManageUsers, canViewAllReports: permissions.canViewAllReports,
      canManageSchool: permissions.canManageSchool, canPublishContent: permissions.canPublishContent,
      canManagePlatform: permissions.canManagePlatform || false, canTrainTeachers: permissions.canTrainTeachers || false,
      canApproveContent: permissions.canApproveContent || false,
      isAdmin, isSuperTeacher, isPlatformAdmin, isSuperAdmin,
      superTeacherAssignments, assignedSubjects, assignedClasses, refreshAssignments,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
