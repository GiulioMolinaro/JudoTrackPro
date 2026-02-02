import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Role } from '../../types';
import { Plus, Trash2, Newspaper, User, Key, Image } from 'lucide-react';

export const DevDashboard: React.FC = () => {
  const { users, addUser, deleteUser, news, addNews, deleteNews } = useStore();
  const [activeTab, setActiveTab] = useState<'users' | 'news'>('users');

  // New User State
  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    role: 'athlete' as Role,
    password: '',
    avatar: ''
  });

  // New News State
  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    author: 'Sviluppatore',
    imageUrl: ''
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.id === newUser.id)) {
      alert('ID Utente già esistente!');
      return;
    }
    addUser({
      ...newUser,
      avatar: newUser.avatar || `https://ui-avatars.com/api/?name=${newUser.name}&background=random`
    });
    setNewUser({ id: '', name: '', role: 'athlete', password: '', avatar: '' });
  };

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    addNews(newNews);
    setNewNews({ title: '', content: '', author: 'Sviluppatore', imageUrl: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Pannello Sviluppatore</h1>
          <p className="text-slate-500">Gestione Utenti e Notizie</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
           <button 
             onClick={() => setActiveTab('users')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-judo-blue text-white' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             Gestione Utenti
           </button>
           <button 
             onClick={() => setActiveTab('news')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'news' ? 'bg-judo-blue text-white' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             Gestione News
           </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h3 className="font-bold text-lg mb-4 text-judo-blue flex items-center"><Plus size={18} className="mr-2"/> Aggiungi Utente</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ruolo</label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                  className="w-full border-slate-300 rounded focus:ring-judo-blue focus:border-judo-blue p-2 border text-sm"
                >
                  <option value="athlete">Atleta</option>
                  <option value="coach">Allenatore</option>
                  <option value="dev">Sviluppatore</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome e Cognome</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full border-slate-300 rounded focus:ring-judo-blue focus:border-judo-blue p-2 border text-sm"
                  required 
                  placeholder="Es. Mario Rossi"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID Utente (Username)</label>
                <input 
                  type="text" 
                  value={newUser.id}
                  onChange={e => setNewUser({...newUser, id: e.target.value})}
                  className="w-full border-slate-300 rounded focus:ring-judo-blue focus:border-judo-blue p-2 border text-sm"
                  required
                  placeholder="Es. mario.rossi"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <input 
                  type="text" 
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full border-slate-300 rounded focus:ring-judo-blue focus:border-judo-blue p-2 border text-sm"
                  required
                  placeholder="Password di accesso"
                />
              </div>
              <button className="w-full bg-judo-yellow text-judo-blue font-bold py-2 rounded hover:bg-yellow-400 transition-colors">
                Crea Utente
              </button>
            </form>
          </div>

          {/* User List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-700">Elenco Utenti Attivi ({users.length})</div>
             <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {users.map(u => (
                  <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center space-x-4">
                       <img src={u.avatar} className="w-10 h-10 rounded-full bg-slate-200" alt={u.name} />
                       <div>
                         <p className="font-bold text-slate-800">{u.name}</p>
                         <div className="flex items-center space-x-2 text-xs text-slate-500">
                           <span className={`px-2 py-0.5 rounded capitalize ${u.role === 'coach' ? 'bg-purple-100 text-purple-700' : u.role === 'dev' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-700'}`}>
                             {u.role === 'dev' ? 'Dev' : u.role === 'coach' ? 'Coach' : 'Atleta'}
                           </span>
                           <span>ID: {u.id}</span>
                           <span className="flex items-center"><Key size={10} className="mr-1"/> {u.password}</span>
                         </div>
                       </div>
                    </div>
                    {u.role !== 'dev' && (
                      <button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-600 p-2">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h3 className="font-bold text-lg mb-4 text-judo-blue flex items-center"><Newspaper size={18} className="mr-2"/> Nuova Notizia</h3>
            <form onSubmit={handleAddNews} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titolo</label>
                <input 
                  type="text" 
                  value={newNews.title}
                  onChange={e => setNewNews({...newNews, title: e.target.value})}
                  className="w-full border-slate-300 rounded focus:ring-judo-blue focus:border-judo-blue p-2 border text-sm"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contenuto</label>
                <textarea 
                  rows={4}
                  value={newNews.content}
                  onChange={e => setNewNews({...newNews, content: e.target.value})}
                  className="w-full border-slate-300 rounded focus:ring-judo-blue focus:border-judo-blue p-2 border text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL Immagine (Opzionale)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Image size={14} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    value={newNews.imageUrl}
                    onChange={e => setNewNews({...newNews, imageUrl: e.target.value})}
                    className="w-full pl-8 border-slate-300 rounded focus:ring-judo-blue focus:border-judo-blue p-2 border text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <button className="w-full bg-judo-yellow text-judo-blue font-bold py-2 rounded hover:bg-yellow-400 transition-colors">
                Pubblica Notizia
              </button>
            </form>
          </div>

          {/* News List */}
          <div className="lg:col-span-2 grid gap-4">
             {news.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
                   {item.imageUrl && (
                     <img src={item.imageUrl} alt={item.title} className="w-full sm:w-32 h-32 object-cover rounded-lg bg-slate-200" />
                   )}
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <h4 className="font-bold text-lg text-slate-800">{item.title}</h4>
                         <button onClick={() => deleteNews(item.id)} className="text-red-400 hover:text-red-600">
                           <Trash2 size={18} />
                         </button>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{item.date} • {item.author}</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{item.content}</p>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};