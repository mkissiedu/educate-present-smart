import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { CATALYST_LOGO, HERO_IMAGE } from './CatalystMascot';
import { TeacherProfileDropdown } from './TeacherProfileDropdown';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { useBranding } from '@/contexts/BrandingContext';
import { User } from '@/types/user';

interface Props {
  user: User | null;
  navigate: (path: string) => void;
  isAuthenticated: boolean;
  logout: () => void;
  setShowAssignment: (show: boolean) => void;
  adminAssigned?: boolean;
}

export const DashboardHeader: React.FC<Props> = ({ user, navigate, isAuthenticated, logout, setShowAssignment, adminAssigned }) => {
  const { branding } = useBranding();
  
  // Use school logo if available, otherwise use Catalyst logo
  const logoToDisplay = branding.logo_url || CATALYST_LOGO;
  
  // Create header gradient style from branding
  const headerGradientStyle = branding.header_gradient_from !== '#1E3A8A' || branding.logo_url
    ? { background: `linear-gradient(to bottom, ${branding.header_gradient_from}dd, ${branding.header_gradient_to}99, transparent)` }
    : undefined;

  return (
    <>
      <div className="relative h-40 md:h-56 overflow-hidden">
        <img src={HERO_IMAGE} alt="Dashboard" className="w-full h-full object-cover opacity-30" />
        <div 
          className="absolute inset-0"
          style={headerGradientStyle || { background: 'linear-gradient(to top, rgb(15 23 42), transparent)' }}
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          <div className="flex items-center gap-3">
            <img src={logoToDisplay} alt="Catalyst" className="h-10 md:h-14 object-contain bg-white/90 rounded-lg px-2 py-1" />
          </div>
        </div>

        <Button onClick={() => navigate('/')} className="absolute top-3 left-3 bg-white/10 hover:bg-white/20 text-white rounded-full" size="sm">
          <Home className="w-4 h-4" />
        </Button>
        {isAuthenticated && (
          <div className="absolute top-3 right-3">
            <TeacherProfileDropdown
              onOpenMyClasses={adminAssigned ? undefined : () => setShowAssignment(true)}
              onLogout={() => { logout(); navigate('/'); }}
              adminAssigned={adminAssigned}
            />
          </div>
        )}
      </div>
      <div className="max-w-[1800px] mx-auto px-3 md:px-6 py-2">
        <div className="flex justify-end"><SyncStatusIndicator /></div>
      </div>
    </>
  );
};
