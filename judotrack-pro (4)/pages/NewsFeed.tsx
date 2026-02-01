import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Calendar, User, X, Maximize2 } from 'lucide-react';
import { NewsItem } from '../types';

export const NewsFeed: React.FC = () => {
  const { news } = useStore();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">News dalla Palestra</h1>
        <p className="mt-2 text-lg text-slate-600">Aggiornamenti ufficiali, risultati e avvisi tecnici.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-slate-100 cursor-pointer group"
            onClick={() => setSelectedNews(item)}
          >
            {item.imageUrl && (
              <div className="h-48 w-full bg-slate-200 relative overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                </div>
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center text-xs text-slate-500 mb-2 space-x-4">
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {item.date}
                </span>
                <span className="flex items-center">
                  <User size={14} className="mr-1" />
                  {item.author}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-slate-600 mb-4 flex-1 line-clamp-3">{item.content}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedNews(item); }}
                className="text-judo-blue font-semibold hover:text-judo-dark self-start mt-auto"
              >
                Leggi tutto &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedNews(null)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="relative">
              {selectedNews.imageUrl && (
                <div className="w-full h-64 bg-slate-200">
                  <img src={selectedNews.imageUrl} alt={selectedNews.title} className="w-full h-full object-cover" />
                </div>
              )}
              <button 
                onClick={() => setSelectedNews(null)} 
                className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-800 rounded-full p-2 backdrop-blur-sm transition-all shadow-sm"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <div className="flex items-center text-sm text-slate-500 mb-4 space-x-6 border-b border-slate-100 pb-4">
                <span className="flex items-center font-medium text-judo-blue">
                  <Calendar size={16} className="mr-2" />
                  {selectedNews.date}
                </span>
                <span className="flex items-center">
                  <User size={16} className="mr-2" />
                  {selectedNews.author}
                </span>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-6">{selectedNews.title}</h2>
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedNews.content}
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-slate-100 text-right">
              <button 
                onClick={() => setSelectedNews(null)}
                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md font-medium hover:bg-slate-50 transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};