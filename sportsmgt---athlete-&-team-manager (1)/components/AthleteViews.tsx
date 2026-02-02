import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { SportEvent, Registration, Result, Profile, MedalType } from '../types';
import { Calendar, MapPin, Award, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Dashboard ---
export const AthleteDashboard: React.FC<{ profile: Profile }> = ({ profile }) => {
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Fetch upcoming events based on policies (RLS handles visibility)
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (eventError) throw eventError;

      // Filter by age category match client side as well for better UX
      // (Though backend should ideally handle this if data is huge, but here we do it for UX precision)
      const filteredEvents = eventData?.filter(e => 
        !e.target_category || 
        e.target_category === profile.age_category ||
        e.visibility_ids?.includes(profile.id)
      ) || [];

      setEvents(filteredEvents);

      // Fetch my registrations
      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('profile_id', profile.id);

      if (regError) throw regError;
      setRegistrations(regData || []);

    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [profile.id, profile.age_category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJoin = async (eventId: string) => {
    const weight = prompt("Please confirm your declared weight for this event:");
    if (!weight) return;

    try {
      const { error } = await supabase.from('registrations').insert({
        event_id: eventId,
        profile_id: profile.id,
        declared_weight: weight,
        status: 'pending'
      });
      if (error) throw error;
      alert('Registration successful!');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading events...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Upcoming Events</h2>
        <p className="text-slate-500">Events matching your category: <span className="font-semibold text-slate-700">{profile.age_category || 'All'}</span></p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => {
          const registration = registrations.find(r => r.event_id === event.id);
          const isRegistered = !!registration;

          return (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800">{event.title}</h3>
                  {event.target_category && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {event.target_category}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                {isRegistered ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600 font-medium py-2">
                    <CheckCircle size={18} />
                    <span>Registered ({registration.status})</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleJoin(event.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    Join Event
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
            No upcoming events found for your category.
          </div>
        )}
      </div>
    </div>
  );
};

// --- Statistics ---
export const AthleteStats: React.FC<{ profile: Profile }> = ({ profile }) => {
  const [results, setResults] = useState<Result[]>([]);
  
  useEffect(() => {
    const fetchResults = async () => {
      const { data } = await supabase
        .from('results')
        .select('*')
        .eq('profile_id', profile.id);
      setResults(data || []);
    };
    fetchResults();
  }, [profile.id]);

  const totalMatches = results.reduce((acc, curr) => acc + (curr.wins + curr.losses), 0);
  const totalWins = results.reduce((acc, curr) => acc + curr.wins, 0);
  const winRatio = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;
  
  const medals = {
    [MedalType.GOLD]: results.filter(r => r.medal === MedalType.GOLD).length,
    [MedalType.SILVER]: results.filter(r => r.medal === MedalType.SILVER).length,
    [MedalType.BRONZE]: results.filter(r => r.medal === MedalType.BRONZE).length,
  };

  const chartData = [
    { name: 'Wins', value: totalWins },
    { name: 'Losses', value: totalMatches - totalWins },
  ];

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-slate-800">Performance Analytics</h2>
       
       <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium uppercase">Win Ratio</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{winRatio}%</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-yellow-200 bg-yellow-50 shadow-sm">
            <p className="text-sm text-yellow-700 font-medium uppercase">Gold</p>
            <p className="text-3xl font-bold text-yellow-800 mt-2">{medals[MedalType.GOLD]}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
            <p className="text-sm text-slate-500 font-medium uppercase">Silver</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{medals[MedalType.SILVER]}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-orange-200 bg-orange-50 shadow-sm">
            <p className="text-sm text-orange-700 font-medium uppercase">Bronze</p>
            <p className="text-3xl font-bold text-orange-800 mt-2">{medals[MedalType.BRONZE]}</p>
          </div>
       </div>

       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Win/Loss Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
};

// --- History ---
export const AthleteHistory: React.FC<{ profile: Profile }> = ({ profile }) => {
  const [history, setHistory] = useState<(Result & { event?: SportEvent })[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      // Supabase join syntax:
      const { data, error } = await supabase
        .from('results')
        .select('*, event:events(*)')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) setHistory(data as any);
    };
    fetchHistory();
  }, [profile.id]);

  const updateComment = async (resultId: string, comment: string) => {
    await supabase.from('results').update({ athlete_comment: comment }).eq('id', resultId);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Match History</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Result</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Medal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reflection</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {history.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.event?.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {item.event?.date ? new Date(item.event.date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  <span className="text-green-600 font-bold">{item.wins}W</span> - <span className="text-red-500 font-bold">{item.losses}L</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 capitalize">
                  {item.medal !== 'none' && <span className="flex items-center space-x-1"><Award size={14} /> <span>{item.medal}</span></span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  <input 
                    defaultValue={item.athlete_comment || ''}
                    onBlur={(e) => updateComment(item.id, e.target.value)}
                    className="border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-full bg-transparent"
                    placeholder="Add reflection..."
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
