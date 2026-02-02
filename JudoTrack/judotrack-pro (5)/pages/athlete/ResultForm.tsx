import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Competition, Medal } from '../../types';
import { Save, AlertCircle } from 'lucide-react';

export const ResultForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { competitions, currentUser, addResult, results } = useStore();
  
  // Filter out competitions logic:
  // 1. Not already entered by this user
  // 2. Is Public OR (Restricted AND User is in allowed list)
  const availableComps = competitions.filter(c => {
    if (!currentUser) return false;

    const alreadyEntered = results.some(r => r.competitionId === c.id && r.athleteId === currentUser.id);
    if (alreadyEntered) return false;

    // Visibility Check
    if (c.visibility === 'public') return true;
    if (c.visibility === 'restricted' && c.allowedAthletes?.includes(currentUser.id)) return true;

    return false;
  });

  const [formData, setFormData] = useState({
    competitionId: '',
    wins: 0,
    losses: 0,
    medal: 'None' as Medal,
    notes: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.competitionId) {
      setError('Seleziona una gara dalla lista.');
      return;
    }

    if (!currentUser) return;

    addResult({
      athleteId: currentUser.id,
      competitionId: formData.competitionId,
      wins: formData.wins,
      losses: formData.losses,
      medal: formData.medal,
      notes: formData.notes
    });

    onComplete();
  };

  if (availableComps.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Tutto aggiornato!</h2>
        <p className="text-slate-600">Non ci sono nuove gare disponibili per te al momento.</p>
        <button onClick={onComplete} className="mt-4 text-judo-blue hover:underline">Torna alla Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border-t-4 border-judo-blue">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Inserisci Risultato Gara</h2>
        <p className="text-slate-500">Compila i dati della tua ultima competizione.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 flex items-center">
          <AlertCircle size={18} className="mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gara</label>
          <select 
            value={formData.competitionId}
            onChange={(e) => setFormData({...formData, competitionId: e.target.value})}
            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-judo-blue focus:border-judo-blue p-2 border"
            required
          >
            <option value="">-- Seleziona Gara --</option>
            {availableComps.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.date} ({c.location})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Incontri Vinti</label>
            <input 
              type="number" 
              min="0"
              value={formData.wins}
              onChange={(e) => setFormData({...formData, wins: parseInt(e.target.value) || 0})}
              className="w-full border-slate-300 rounded-md shadow-sm focus:ring-judo-blue focus:border-judo-blue p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Incontri Persi</label>
            <input 
              type="number" 
              min="0"
              value={formData.losses}
              onChange={(e) => setFormData({...formData, losses: parseInt(e.target.value) || 0})}
              className="w-full border-slate-300 rounded-md shadow-sm focus:ring-judo-blue focus:border-judo-blue p-2 border"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Medaglia</label>
          <div className="flex space-x-4">
            {(['None', 'Bronze', 'Silver', 'Gold'] as Medal[]).map((medal) => (
              <label key={medal} className={`
                flex-1 border rounded-md p-3 text-center cursor-pointer transition-colors
                ${formData.medal === medal ? 'bg-judo-blue text-white ring-2 ring-offset-2 ring-judo-blue' : 'bg-slate-50 hover:bg-slate-100'}
              `}>
                <input 
                  type="radio" 
                  name="medal" 
                  value={medal} 
                  checked={formData.medal === medal}
                  onChange={() => setFormData({...formData, medal})}
                  className="sr-only"
                />
                <span className="font-medium">
                  {medal === 'None' ? 'Nessuna' : medal === 'Gold' ? '🥇 Oro' : medal === 'Silver' ? '🥈 Argento' : '🥉 Bronzo'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Note e Spunti Tecnici</label>
          <textarea 
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Come ti sei sentito? Cosa ha funzionato? Cosa no?"
            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-judo-blue focus:border-judo-blue p-2 border"
          />
        </div>

        <button 
          type="submit" 
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-judo-blue hover:bg-judo-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-judo-blue transition-colors"
        >
          <Save size={18} className="mr-2" />
          Salva Risultato
        </button>
      </form>
    </div>
  );
};