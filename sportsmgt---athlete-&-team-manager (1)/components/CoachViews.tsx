import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, SportEvent, Registration } from '../types';
import { Users, Calendar, Plus, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Create Event ---
export const CreateEvent: React.FC<{ profile: Profile }> = ({ profile }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [targetCat, setTargetCat] = useState('Senior');
  const [athletes, setAthletes] = useState<Profile[]>([]);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'athlete').then(({ data }) => {
      if (data) setAthletes(data as any);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('events').insert({
        title,
        date,
        location,
        target_category: targetCat,
        visibility_ids: isPrivate ? selectedAthletes : null,
        created_by: profile.id
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      alert('Error creating event: ' + err.message);
    }
  };

  const toggleAthlete = (id: string) => {
    if (selectedAthletes.includes(id)) {
      setSelectedAthletes(selectedAthletes.filter(aid => aid !== id));
    } else {
      setSelectedAthletes([...selectedAthletes, id]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Plus className="text-blue-600" /> Create New Event
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
            <input required className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input required type="datetime-local" className="w-full p-2 border rounded" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input required className="w-full p-2 border rounded" value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select className="w-full p-2 border rounded" value={targetCat} onChange={e => setTargetCat(e.target.value)}>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Master">Master</option>
            <option value="Open">Open</option>
          </select>
        </div>

        <div className="border-t pt-4">
          <label className="flex items-center space-x-2 mb-4 cursor-pointer">
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="rounded text-blue-600" />
            <span className="font-medium text-slate-700">Private Event (Invite Only)</span>
          </label>
          
          {isPrivate && (
            <div className="bg-slate-50 p-4 rounded-lg border max-h-48 overflow-y-auto">
              <p className="text-sm text-slate-500 mb-2">Select Athletes:</p>
              {athletes.map(a => (
                <div key={a.id} className="flex items-center space-x-2 mb-1">
                  <input 
                    type="checkbox" 
                    checked={selectedAthletes.includes(a.id)}
                    onChange={() => toggleAthlete(a.id)}
                  />
                  <span className="text-sm">{a.full_name} ({a.age_category})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
          Publish Event
        </button>
      </form>
    </div>
  );
};

// --- Monitor ---
export const AthleteMonitor: React.FC = () => {
  const [athletes, setAthletes] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'athlete').then(({ data }) => {
      if (data) setAthletes(data as any);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading athletes...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Users className="text-blue-600" /> Athlete Monitor
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {athletes.map(athlete => (
          <div key={athlete.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-4 mb-4">
               <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                 {athlete.full_name ? athlete.full_name[0] : 'U'}
               </div>
               <div>
                 <h3 className="font-bold text-slate-800">{athlete.full_name}</h3>
                 <p className="text-sm text-slate-500">{athlete.age_category} • {athlete.weight_class}</p>
               </div>
            </div>
            <button className="text-sm text-blue-600 font-medium hover:underline">View Performance Report &rarr;</button>
          </div>
        ))}
      </div>
    </div>
  );
};
