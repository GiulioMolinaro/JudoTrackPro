import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, UserRole } from '../types';

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at');
    if (data) setUsers(data as any);
  };

  const updateRole = async (id: string, newRole: UserRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    if (!error) fetchUsers();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Current Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.full_name || 'Unnamed'}</td>
                <td className="px-6 py-4 text-sm text-slate-500 capitalize">{user.role}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button 
                    onClick={() => updateRole(user.id, UserRole.ATHLETE)}
                    className={`px-2 py-1 rounded text-xs border ${user.role === UserRole.ATHLETE ? 'bg-blue-50 border-blue-200 text-blue-700' : 'hover:bg-slate-50'}`}
                  >
                    Athlete
                  </button>
                  <button 
                    onClick={() => updateRole(user.id, UserRole.COACH)}
                    className={`px-2 py-1 rounded text-xs border ${user.role === UserRole.COACH ? 'bg-blue-50 border-blue-200 text-blue-700' : 'hover:bg-slate-50'}`}
                  >
                    Coach
                  </button>
                  <button 
                    onClick={() => updateRole(user.id, UserRole.ADMIN)}
                    className={`px-2 py-1 rounded text-xs border ${user.role === UserRole.ADMIN ? 'bg-blue-50 border-blue-200 text-blue-700' : 'hover:bg-slate-50'}`}
                  >
                    Admin
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};