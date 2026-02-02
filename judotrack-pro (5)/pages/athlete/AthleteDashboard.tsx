import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { EnrichedResult } from '../../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Filter, Medal, AlertCircle, TrendingUp } from 'lucide-react';
import { analyzePerformance } from '../../services/geminiService';

export const AthleteDashboard: React.FC = () => {
  const { currentUser, competitions, getAthleteResults } = useStore();
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Combine results with competition details
  const rawResults = getAthleteResults(currentUser.id);
  
  const enrichedResults: EnrichedResult[] = rawResults.map(r => {
    const comp = competitions.find(c => c.id === r.competitionId);
    return {
      ...r,
      competitionName: comp?.name || 'Gara sconosciuta',
      competitionDate: comp?.date || '',
      competitionLocation: comp?.location || '',
      category: comp?.category // Helper to pass to AI
    };
  }).sort((a, b) => new Date(b.competitionDate).getTime() - new Date(a.competitionDate).getTime());

  // Available Years for Filter
  const availableYears = Array.from(new Set(enrichedResults.map(r => r.competitionDate.split('-')[0])));

  // Filter Logic
  const filteredResults = yearFilter === 'all' 
    ? enrichedResults 
    : enrichedResults.filter(r => r.competitionDate.startsWith(yearFilter));

  // Stats Calculation
  const totalWins = filteredResults.reduce((acc, curr) => acc + curr.wins, 0);
  const totalLosses = filteredResults.reduce((acc, curr) => acc + curr.losses, 0);
  const totalMatches = totalWins + totalLosses;
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;
  
  const medalsCount = {
    Gold: filteredResults.filter(r => r.medal === 'Gold').length,
    Silver: filteredResults.filter(r => r.medal === 'Silver').length,
    Bronze: filteredResults.filter(r => r.medal === 'Bronze').length,
  };

  const pieData = [
    { name: 'Vinti', value: totalWins },
    { name: 'Persi', value: totalLosses },
  ];
  const COLORS = ['#005b96', '#d62828'];

  const handleAIAnalysis = async (result: EnrichedResult) => {
    if (analyzingId) return;
    setAnalyzingId(result.id);
    const text = await analyzePerformance(result.wins, result.losses, result.notes, (result as any).category || 'Senior');
    setSelectedAnalysis(text);
    setAnalyzingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard Atleta</h1>
          <p className="text-slate-500">Benvenuto, {currentUser.name}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center bg-slate-100 rounded-lg p-1">
          <Filter size={18} className="text-slate-500 ml-2" />
          <select 
            value={yearFilter} 
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 py-2 px-4"
          >
            <option value="all">Tutti gli anni</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Win Rate */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Media Vittorie</h3>
          <div className="h-48 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">{winRate}%</span>
                <span className="text-xs text-slate-500">Win Rate</span>
             </div>
          </div>
          <div className="flex justify-center space-x-6 mt-2 text-sm">
             <span className="flex items-center"><div className="w-3 h-3 bg-judo-blue rounded-full mr-1"></div> {totalWins} Vinti</span>
             <span className="flex items-center"><div className="w-3 h-3 bg-judo-red rounded-full mr-1"></div> {totalLosses} Persi</span>
          </div>
        </div>

        {/* Medals */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-2">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Medagliere</h3>
          <div className="flex justify-around items-center h-48">
             <div className="text-center">
                <div className="bg-yellow-100 p-4 rounded-full mb-2 inline-flex">
                   <Medal size={32} className="text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800">{medalsCount.Gold}</div>
                <div className="text-xs font-semibold text-slate-500">ORO</div>
             </div>
             <div className="text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-2 inline-flex">
                   <Medal size={32} className="text-gray-500" />
                </div>
                <div className="text-3xl font-bold text-slate-800">{medalsCount.Silver}</div>
                <div className="text-xs font-semibold text-slate-500">ARGENTO</div>
             </div>
             <div className="text-center">
                <div className="bg-orange-100 p-4 rounded-full mb-2 inline-flex">
                   <Medal size={32} className="text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800">{medalsCount.Bronze}</div>
                <div className="text-xs font-semibold text-slate-500">BRONZO</div>
             </div>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Storico Gare</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nessuna gara trovata per il periodo selezionato.</div>
          ) : (
            filteredResults.map((result) => (
              <div key={result.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-judo-dark">{result.competitionName}</h4>
                    <p className="text-sm text-slate-500">{result.competitionDate} • {result.competitionLocation}</p>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center space-x-4">
                     {result.medal !== 'None' && (
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                         ${result.medal === 'Gold' ? 'bg-yellow-100 text-yellow-800' : 
                           result.medal === 'Silver' ? 'bg-gray-100 text-gray-800' : 
                           'bg-orange-100 text-orange-800'}
                       `}>
                         {result.medal}
                       </span>
                     )}
                     <div className="text-sm font-medium">
                        <span className="text-green-600 mr-2">{result.wins}W</span>
                        <span className="text-red-600">{result.losses}L</span>
                     </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 relative group">
                  <p className="text-sm text-slate-700 italic">"{result.notes}"</p>
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => handleAIAnalysis(result)}
                      disabled={analyzingId === result.id}
                      className="text-xs bg-white border border-blue-200 text-judo-blue px-3 py-1.5 rounded-md hover:bg-blue-50 flex items-center transition-all shadow-sm"
                    >
                      {analyzingId === result.id ? 'Analisi in corso...' : (
                        <>
                          <TrendingUp size={14} className="mr-1" />
                          Analizza con AI Coach
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {selectedAnalysis && analyzingId === null && (
                  /* Simple Modal/Overlay for the result - simplistic implementation */
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-purple-900 text-sm">Feedback del Coach AI</h5>
                      <button onClick={() => setSelectedAnalysis(null)} className="text-purple-400 hover:text-purple-700">&times;</button>
                    </div>
                    <p className="text-sm text-purple-800 leading-relaxed">
                       {selectedAnalysis}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};