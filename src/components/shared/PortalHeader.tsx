import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { Home, LogOut, Crown, Shield, Sparkles, User, BookOpen, Database, Globe } from 'lucide-react';
import { CATALYST_LOGO } from '@/components/CatalystMascot';
import { PORTAL_THEMES, PortalType } from '@/lib/design-system';

interface PortalHeaderProps {
  portalType: PortalType;
  title: string;
  subtitle?: string;
  schoolName?: string;
  showQuickLinks?: boolean;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  portalType,
  title,
  subtitle,
  schoolName,
  showQuickLinks = true,
}) => {
  const navigate = useNavigate();
  const { user, logout, isSuperTeacher, isPlatformAdmin } = useAuth();
  const { branding } = useBranding();
  const theme = PORTAL_THEMES[portalType];

  const getRoleIcon = () => {
    switch (portalType) {
      case 'super_admin': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'super_teacher': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'admin': return <Shield className="w-4 h-4 text-emerald-400" />;
      default: return <User className="w-4 h-4 text-blue-400" />;
    }
  };

  // Use school branding colors if available, otherwise use default theme
  const headerStyle = branding.logo_url || branding.header_gradient_from !== '#1E3A8A'
    ? { background: `linear-gradient(to right, ${branding.header_gradient_from}, ${branding.header_gradient_to})` }
    : undefined;

  const logoToDisplay = branding.logo_url || CATALYST_LOGO;

  return (
    <header 
      className={`shadow-lg ${!headerStyle ? `bg-gradient-to-r ${theme.headerGradient}` : ''}`}
      style={headerStyle}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoToDisplay} alt="School Logo" className="h-10 object-contain bg-white rounded-lg px-2 py-1" />
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                {getRoleIcon()} {title}
              </h1>
              <p className="text-white/70 text-xs">{subtitle || 'Catalyst'}</p>

            </div>
          </div>
          <div className="flex items-center gap-2">
            {schoolName && (
              <div className="hidden md:flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <Globe className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">{schoolName}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              {getRoleIcon()}
              <span className="text-white text-sm font-bold hidden sm:inline">{user?.name}</span>
            </div>
            {showQuickLinks && (isSuperTeacher || isPlatformAdmin) && (
              <>
                <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <BookOpen className="w-4 h-4" />
                </Button>
                <Button onClick={() => navigate('/question-bank')} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Database className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Home className="w-4 h-4" />
            </Button>
            <Button onClick={() => { logout(); navigate('/'); }} variant="ghost" size="sm" className="text-white hover:bg-red-500/50">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
