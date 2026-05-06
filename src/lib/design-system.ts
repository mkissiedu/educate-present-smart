// Unified Design System for Catalyst


export type PortalType = 'teacher' | 'admin' | 'super_teacher' | 'super_admin';

export const PORTAL_THEMES = {
  teacher: {
    gradient: 'from-slate-900 via-blue-900 to-indigo-900',
    accent: 'blue',
    accentColor: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    accentLight: 'bg-blue-500/20',
    accentText: 'text-blue-400',
    accentBorder: 'border-blue-400',
    headerGradient: 'from-blue-600 via-indigo-600 to-blue-600',
    tabActive: 'bg-blue-600 text-white',
    tabInactive: 'bg-white/10 text-white/70 hover:bg-white/20',
  },
  admin: {
    gradient: 'from-slate-900 via-emerald-900 to-slate-900',
    accent: 'emerald',
    accentColor: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    accentLight: 'bg-emerald-500/20',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-400',
    headerGradient: 'from-emerald-600 via-teal-600 to-emerald-600',
    tabActive: 'bg-emerald-600 text-white',
    tabInactive: 'bg-white/10 text-white/70 hover:bg-white/20',
  },
  super_teacher: {
    gradient: 'from-slate-900 via-amber-900 to-orange-900',
    accent: 'amber',
    accentColor: 'bg-amber-600',
    accentHover: 'hover:bg-amber-700',
    accentLight: 'bg-amber-500/20',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-400',
    headerGradient: 'from-amber-600 via-yellow-500 to-amber-600',
    tabActive: 'bg-amber-500 text-white',
    tabInactive: 'bg-white/10 text-white/70 hover:bg-white/20',
  },
  super_admin: {
    gradient: 'from-slate-900 via-purple-900 to-indigo-900',
    accent: 'purple',
    accentColor: 'bg-purple-600',
    accentHover: 'hover:bg-purple-700',
    accentLight: 'bg-purple-500/20',
    accentText: 'text-purple-400',
    accentBorder: 'border-purple-400',
    headerGradient: 'from-purple-600 via-indigo-600 to-purple-600',
    tabActive: 'bg-purple-600 text-white',
    tabInactive: 'bg-white/10 text-white/70 hover:bg-white/20',
  },
};

export const SHARED_STYLES = {
  card: 'bg-white/10 backdrop-blur-md rounded-xl border border-white/10',
  cardHover: 'hover:bg-white/15 transition-all',
  panel: 'bg-white/10 backdrop-blur-md rounded-xl p-4',
  button: 'rounded-full px-4 py-2 font-medium transition-all',
  input: 'bg-white/20 text-white placeholder-white/50 rounded-lg px-3 py-2 border border-white/10 focus:border-white/30 focus:outline-none',
  select: 'bg-white/20 text-white rounded-lg px-3 py-2 border border-white/10',
};
