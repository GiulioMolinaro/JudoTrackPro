import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AgeCategory, Competition, CompetitionResult } from '../../types';
import { Plus, Users, Calendar, ChevronRight, X, MapPin, Eye, Lock, Check, Pencil, Save } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type CoachTab = 'athletes' | 'competitions';

export const CoachDashboard: React.FC = () => {
  const { users, competitions, addCompetition, updateCompetition, getAthleteResults, results } = useStore();
  const [activeTab, setActiveTab] = useState<CoachTab>('athletes');
  
  // Competition State
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [formComp, setFormComp] = useState({
    name: '',
    location: '',
    date: '',
    category: 'Cadetti' as AgeCategory,
    visibility: 'public' as 'public' | 'restricted',
  });
  
  const [selectedAthletesForComp, setSelectedAthletesForComp] = useState<string[]>([]);

  // Athlete Drill-down State
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [selectedResultDetail, setSelectedResultDetail] = useState<CompetitionResult | null>(null);

  const athletes = users.filter(u => u.role === 'athlete');

  // Load competition into form for editing
  const handleEditComp = (comp: Competition) => {
    setEditingCompId(comp.id);
    setFormComp({
      name: comp.name,
      location: comp.location,
      date: comp.date,
      category: comp.category,
      visibility: comp.visibility
    });
    setSelectedAthletesForComp(comp.allowedAthletes || []);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCompId(null);
    setFormComp({ name: '', location: '', date: '', category: 'Cadetti', visibility: 'public' });
    setSelectedAthletesForComp([]);
  };

  const handleSaveCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    
    const compData = {
      ...formComp,
      allowedAthletes: formComp.visibility === 'restricted' ? selectedAthletesForComp : []
    };

    if (editingCompId) {
      // Update existing
      updateCompetition(editingCompId, compData);
      alert('Gara modificata con successo!');
      handleCancelEdit(); // Reset form
    } else {
      // Create new
      addCompetition(compData);
      alert('Gara creata con successo!');
      handleCancelEdit(); // Reset form
    }
  };

  const toggleAthleteSelection = (athleteId: string) => {
    setSelectedAthletesForComp(prev => 
      prev.includes(athleteId) ? prev.filter(id => id !== athleteId) : [...prev, athleteId]
    );
  };

  const renderAthleteStats = () => {
    if (!selectedAthleteId) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {athletes.map(athlete => {
            const stats = getAthleteResults(athlete.id);
            const totalWins = stats.reduce((acc, c) => acc + c.wins, 0);
            return (
              <div 
                key={athlete.id} 
                onClick={() => setSelectedAthleteId(athlete.id)}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all hover:border-judo-blue"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img src={athlete.avatar} alt={athlete.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{athlete.name}</h3>
                    <p className="text-sm text-slate-500">{stats.length} Gare Disputate</p>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                  <span className="text-sm text-slate-600 font-medium">Vittorie Totali</span>
                  <span className="text-xl font-bold text-judo-blue">{totalWins}</span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Detail View for Selected Athlete
    const athlete = users.find(u => u.id === selectedAthleteId);
    const athleteResults = getAthleteResults(selectedAthleteId);
    
    // Enrich results to sort and display name
    const detailedResults = athleteResults.map(r => {
      const comp = competitions.find(c => c.id === r.competitionId);
      return {
        ...r,
        compName: comp?.name || 'Sconosciuto',
        compDate: comp?.date || '',
        compCat: comp?.category || ''
      };
    }).sort((a, b) => new Date(b.compDate).getTime() - new Date(a.compDate).getTime());

    // Simple Bar Chart Data
    const chartData = detailedResults.slice(0, 5).reverse().map(r => ({
      name: r.compName.substring(0, 10) + '...',
      wins: r.wins,
      losses: r.losses
    }));

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <button 
          onClick={() => { setSelectedAthleteId(null); setSelectedResultDetail(null); }}
          className="flex items-center text-sm text-slate-500 hover:text-judo-blue mb-4"
        >
          &larr; Torna alla lista atleti
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Stats Panel */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{athlete?.name}</h2>
                <p className="text-slate-500">Statistiche Dettagliate</p>
              </div>
              <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-full font-bold">
                 {athleteResults.length} Gare
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-64">
                <h3 className="text-sm font-bold text-slate-500 mb-4">Ultime 5 Gare (W/L)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <Tooltip />
                    <Bar dataKey="wins" fill="#005b96" name="Vittorie" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="losses" fill="#d62828" name="Sconfitte" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 font-bold text-slate-700">Elenco Gare</div>
              <div className="divide-y divide-slate-100">
                {detailedResults.map(r => (
                  <div 
                    key={r.id} 
                    onClick={() => setSelectedResultDetail(r)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors ${selectedResultDetail?.id === r.id ? 'bg-blue-50' : ''}`}
                  >
                     <div>
                       <p className="font-bold text-slate-800">{r.compName}</p>
                       <p className="text-xs text-slate-500">{r.compDate} • {r.compCat}</p>
                     </div>
                     <div className="flex items-center space-x-3">
                        <div className="text-sm">
                          <span className="text-green-600 font-bold">{r.wins}W</span> - <span className="text-red-600 font-bold">{r.losses}L</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-400" />
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detail Side Panel */}
          {selectedResultDetail && (
            <div className="w-full md:w-80 bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-fit sticky top-24">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                 <h3 className="font-bold text-lg text-slate-900">Dettaglio Gara</h3>
                 <button onClick={() => setSelectedResultDetail(null)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Medaglia</label>
                   <div className="text-lg font-medium text-slate-800">
                     {selectedResultDetail.medal === 'None' ? 'Nessuna' : 
                      selectedResultDetail.medal === 'Gold' ? '🥇 Oro' :
                      selectedResultDetail.medal === 'Silver' ? '🥈 Argento' : '🥉 Bronzo'}
                   </div>
                 </div>
                 
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Score</label>
                   <div className="flex space-x-4 mt-1">
                      <div className="flex-1 bg-green-50 p-2 rounded text-center border border-green-100">
                        <span className="block text-xl font-bold text-green-700">{selectedResultDetail.wins}</span>
                        <span className="text-xs text-green-600">Vinti</span>
                      </div>
                      <div className="flex-1 bg-red-50 p-2 rounded text-center border border-red-100">
                        <span className="block text-xl font-bold text-red-700">{selectedResultDetail.losses}</span>
                        <span className="text-xs text-red-600">Persi</span>
                      </div>
                   </div>
                 </div>

                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Note Atleta</label>
                   <p className="text-sm text-slate-700 mt-1 italic bg-slate-50 p-3 rounded border border-slate-100">
                     "{selectedResultDetail.notes}"
                   </p>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCreateCompetition = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">{editingCompId ? 'Modifica Competizione' : 'Nuova Competizione'}</h2>
        <p className="text-slate-500">
          {editingCompId ? 'Aggiorna i dettagli della gara selezionata.' : 'Aggiungi una nuova gara al calendario della palestra.'}
        </p>
      </div>
      
      <form onSubmit={handleSaveCompetition} className="space-y-6 relative">
        {editingCompId && (
          <button 
            type="button" 
            onClick={handleCancelEdit}
            className="absolute -top-4 right-0 text-sm text-red-500 hover:underline"
          >
            Annulla Modifica
          </button>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome Gara</label>
          <input 
            type="text" 
            value={formComp.name}
            onChange={(e) => setFormComp({...formComp, name: e.target.value})}
            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-judo-blue focus:border-judo-blue p-2 border"
            placeholder="es. Gran Prix Torino"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Luogo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={16} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                value={formComp.location}
                onChange={(e) => setFormComp({...formComp, location: e.target.value})}
                className="w-full pl-10 border-slate-300 rounded-md shadow-sm focus:ring-judo-blue focus:border-judo-blue p-2 border"
                placeholder="Città"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
             <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-slate-400" />
              </div>
              <input 
                type="date" 
                value={formComp.date}
                onChange={(e) => setFormComp({...formComp, date: e.target.value})}
                className="w-full pl-10 border-slate-300 rounded-md shadow-sm focus:ring-judo-blue focus:border-judo-blue p-2 border"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoria Età</label>
          <select 
            value={formComp.category}
            onChange={(e) => setFormComp({...formComp, category: e.target.value as AgeCategory})}
            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-judo-blue focus:border-judo-blue p-2 border"
          >
            <option value="Cadetti">Cadetti</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Visibilità</label>
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setFormComp({...formComp, visibility: 'public'})}
              className={`flex-1 py-2 px-4 rounded-md border flex items-center justify-center transition-colors ${formComp.visibility === 'public' ? 'bg-judo-blue text-white border-judo-blue' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
            >
              <Eye size={16} className="mr-2" /> Pubblica (Tutti)
            </button>
            <button
              type="button"
              onClick={() => setFormComp({...formComp, visibility: 'restricted'})}
              className={`flex-1 py-2 px-4 rounded-md border flex items-center justify-center transition-colors ${formComp.visibility === 'restricted' ? 'bg-judo-blue text-white border-judo-blue' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
            >
              <Lock size={16} className="mr-2" /> Privata (Seleziona)
            </button>
          </div>

          {formComp.visibility === 'restricted' && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Seleziona Atleti Partecipanti</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {athletes.map(athlete => (
                  <div 
                    key={athlete.id} 
                    onClick={() => toggleAthleteSelection(athlete.id)}
                    className={`flex items-center p-2 rounded cursor-pointer border transition-all ${selectedAthletesForComp.includes(athlete.id) ? 'bg-white border-judo-blue shadow-sm ring-1 ring-judo-blue' : 'bg-transparent border-transparent hover:bg-slate-200'}`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${selectedAthletesForComp.includes(athlete.id) ? 'bg-judo-blue border-judo-blue' : 'border-slate-400 bg-white'}`}>
                      {selectedAthletesForComp.includes(athlete.id) && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{athlete.name}</span>
                  </div>
                ))}
              </div>
              {selectedAthletesForComp.length === 0 && (
                <p className="text-xs text-red-500 mt-2">Seleziona almeno un atleta per una gara privata.</p>
              )}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={formComp.visibility === 'restricted' && selectedAthletesForComp.length === 0}
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-judo-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 ${editingCompId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-judo-blue hover:bg-judo-dark'}`}
        >
          {editingCompId ? <Save size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
          {editingCompId ? 'Aggiorna Gara' : 'Crea Gara'}
        </button>
      </form>

      {/* List of recent comps added */}
      <div className="mt-10 pt-6 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Elenco Gare (Gestione)</h4>
        <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
          {competitions.map(c => (
            <div key={c.id} className={`text-sm flex justify-between items-center text-slate-600 bg-slate-50 p-3 rounded border ${editingCompId === c.id ? 'border-orange-400 bg-orange-50' : 'border-transparent'}`}>
              <div className="flex-1">
                <span className="font-bold block text-slate-800">{c.name}</span>
                <span className="text-xs">{c.date} • {c.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                {c.visibility === 'restricted' ? (
                  <span title="Privata">
                    <Lock size={14} />
                  </span>
                ) : (
                  <span title="Pubblica">
                    <Eye size={14} />
                  </span>
                )}
                <button 
                  onClick={() => handleEditComp(c)}
                  className="p-2 text-judo-blue hover:bg-blue-100 rounded-full transition-colors"
                  title="Modifica"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('athletes')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'athletes' ? 'border-judo-blue text-judo-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <div className="flex items-center"><Users size={16} className="mr-2"/> Atleti & Statistiche</div>
        </button>
        <button 
          onClick={() => setActiveTab('competitions')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'competitions' ? 'border-judo-blue text-judo-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
           <div className="flex items-center"><Plus size={16} className="mr-2"/> Gestione Gare</div>
        </button>
      </div>

      {activeTab === 'athletes' ? renderAthleteStats() : renderCreateCompetition()}
    </div>
  );
};
