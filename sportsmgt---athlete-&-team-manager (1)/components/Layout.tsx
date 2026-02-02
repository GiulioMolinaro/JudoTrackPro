import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, LogOut, User, Calendar, Users, BarChart } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Profile, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, profile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!profile) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar / Mobile Header */}
      <aside className="bg-slate-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-700">
          <Trophy className="text-yellow-400 h-8 w-8" />
          <span className="text-xl font-bold tracking-tight">SportsMGT</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Common Links */}
          <NavItem 
            to="/dashboard" 
            icon={<Calendar size={20} />} 
            label="Dashboard" 
            active={isActive('/dashboard')} 
            onClick={() => navigate('/dashboard')}
          />

          {/* Athlete Links */}
          {profile.role === UserRole.ATHLETE && (
            <>
              <NavItem 
                to="/dashboard/stats" 
                icon={<BarChart size={20} />} 
                label="My Stats" 
                active={isActive('/dashboard/stats')}
                onClick={() => navigate('/dashboard/stats')}
              />
              <NavItem 
                to="/dashboard/history" 
                icon={<Trophy size={20} />} 
                label="History" 
                active={isActive('/dashboard/history')}
                onClick={() => navigate('/dashboard/history')}
              />
            </>
          )}

          {/* Coach Links */}
          {profile.role === UserRole.COACH && (
            <>
              <NavItem 
                to="/dashboard/create-event" 
                icon={<Calendar size={20} />} 
                label="Create Event" 
                active={isActive('/dashboard/create-event')}
                onClick={() => navigate('/dashboard/create-event')}
              />
              <NavItem 
                to="/dashboard/monitor" 
                icon={<Users size={20} />} 
                label="Athlete Monitor" 
                active={isActive('/dashboard/monitor')}
                onClick={() => navigate('/dashboard/monitor')}
              />
            </>
          )}

          {/* Admin Links */}
          {profile.role === UserRole.ADMIN && (
             <NavItem 
             to="/dashboard/users" 
             icon={<Users size={20} />} 
             label="User Management" 
             active={isActive('/dashboard/users')}
             onClick={() => navigate('/dashboard/users')}
           />
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
              <p className="text-xs text-slate-400 capitalize">{profile.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 py-2 rounded text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);
