import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Profile, UserRole } from '../types';
import { AthleteDashboard, AthleteStats, AthleteHistory } from './AthleteViews';
import { CreateEvent, AthleteMonitor } from './CoachViews';
import { AdminView } from './AdminView';

interface DashboardProps {
  profile: Profile;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  // Default redirect based on role if visiting /dashboard directly
  const DefaultView = () => {
    if (profile.role === UserRole.COACH) return <Navigate to="/dashboard/create-event" replace />;
    if (profile.role === UserRole.ADMIN) return <Navigate to="/dashboard/users" replace />;
    return <AthleteDashboard profile={profile} />;
  };

  return (
    <Routes>
      <Route path="/" element={<DefaultView />} />
      
      {/* Athlete Routes */}
      {profile.role === UserRole.ATHLETE && (
        <>
          <Route path="stats" element={<AthleteStats profile={profile} />} />
          <Route path="history" element={<AthleteHistory profile={profile} />} />
        </>
      )}

      {/* Coach Routes */}
      {profile.role === UserRole.COACH && (
        <>
          <Route path="create-event" element={<CreateEvent profile={profile} />} />
          <Route path="monitor" element={<AthleteMonitor />} />
        </>
      )}

      {/* Admin Routes */}
      {profile.role === UserRole.ADMIN && (
        <Route path="users" element={<AdminView />} />
      )}
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};