import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Shield, LayoutDashboard, User as UserIcon, Trophy, Newspaper, LogOut, ChevronRight, LogIn, Lock, Wrench } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { currentUser, logout, login, availableUsers } = useStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginStep, setLoginStep] = useState<'role-select' | 'user-select' | 'password-input'>('role-select');
  const [selectedRole, setSelectedRole] = useState<'athlete' | 'coach' | 'dev' | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleOpenLogin = () => {
    setLoginStep('role-select');
    setSelectedRole(null);
    setSelectedUserId(null);
    setPasswordInput('');
    setLoginError('');
    setIsLoginModalOpen(true);
  };

  const handleSelectRole = (role: 'athlete' | 'coach' | 'dev') => {
    setSelectedRole(role);
    setLoginStep('user-select');
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setLoginStep('password-input');
    setLoginError('');
    setPasswordInput('');
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      const success = login(selectedUserId, passwordInput);
      if (success) {
        setIsLoginModalOpen(false);
        onNavigate('home');
      } else {
        setLoginError('Password non corretta');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      {/* Navbar - Blue background */}
      <nav className="bg-judo-blue text-white shadow-lg sticky top-0 z-40 border-b-4 border-judo-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('home')}>
              <Shield className="h-8 w-8 text-judo-yellow mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xl tracking-tight text-white">JudoTrack <span className="text-judo-yellow">Pro</span></span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <button 
                onClick={() => onNavigate('home')}
                className={`${activePage === 'home' ? 'text-judo-yellow border-b-2 border-judo-yellow' : 'text-blue-100 hover:text-white'} px-3 py-2 text-sm font-bold transition-colors duration-150 uppercase tracking-wide`}
              >
                News
              </button>
              
              {currentUser?.role === 'athlete' && (
                <>
                  <button 
                    onClick={() => onNavigate('athlete-dashboard')}
                    className={`${activePage === 'athlete-dashboard' ? 'text-judo-yellow border-b-2 border-judo-yellow' : 'text-blue-100 hover:text-white'} px-3 py-2 text-sm font-bold transition-colors duration-150 uppercase tracking-wide`}
                  >
                    Statistiche
                  </button>
                  <button 
                    onClick={() => onNavigate('athlete-input')}
                    className={`${activePage === 'athlete-input' ? 'text-judo-yellow border-b-2 border-judo-yellow' : 'text-blue-100 hover:text-white'} px-3 py-2 text-sm font-bold transition-colors duration-150 uppercase tracking-wide`}
                  >
                    Inserisci Gara
                  </button>
                </>
              )}

              {currentUser?.role === 'coach' && (
                <button 
                  onClick={() => onNavigate('coach-dashboard')}
                  className={`${activePage === 'coach-dashboard' ? 'text-judo-yellow border-b-2 border-judo-yellow' : 'text-blue-100 hover:text-white'} px-3 py-2 text-sm font-bold transition-colors duration-150 uppercase tracking-wide`}
                >
                  Area Allenatore
                </button>
              )}

              {currentUser?.role === 'dev' && (
                <button 
                  onClick={() => onNavigate('dev-dashboard')}
                  className={`${activePage === 'dev-dashboard' ? 'text-judo-yellow border-b-2 border-judo-yellow' : 'text-blue-100 hover:text-white'} px-3 py-2 text-sm font-bold transition-colors duration-150 uppercase tracking-wide`}
                >
                  Area Sviluppatore
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <div className="flex items-center bg-judo-dark bg-opacity-50 rounded-full px-3 py-1 border border-blue-500">
                    <img src={currentUser.avatar} alt="Avatar" className="h-6 w-6 rounded-full mr-2 bg-slate-200" />
                    <span className="text-sm font-medium mr-2 hidden sm:inline text-blue-50">{currentUser.name}</span>
                  </div>
                  <button 
                    onClick={() => { logout(); onNavigate('home'); }}
                    className="text-blue-200 hover:text-judo-yellow transition-colors"
                    title="Esci"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleOpenLogin}
                  className="flex items-center bg-judo-yellow text-judo-blue hover:bg-yellow-400 px-4 py-2 rounded-md font-bold text-sm transition-colors shadow-sm"
                >
                  <LogIn size={16} className="mr-2" />
                  ACCEDI
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu bar */}
        <div className="md:hidden bg-judo-dark px-4 py-2 flex justify-around border-t border-blue-800">
           <button onClick={() => onNavigate('home')} className={`p-2 ${activePage === 'home' ? 'text-judo-yellow' : 'text-white'}`}><Newspaper size={20}/></button>
           {currentUser?.role === 'athlete' ? (
             <>
               <button onClick={() => onNavigate('athlete-dashboard')} className={`p-2 ${activePage === 'athlete-dashboard' ? 'text-judo-yellow' : 'text-white'}`}><LayoutDashboard size={20}/></button>
               <button onClick={() => onNavigate('athlete-input')} className={`p-2 ${activePage === 'athlete-input' ? 'text-judo-yellow' : 'text-white'}`}><Trophy size={20}/></button>
             </>
           ) : currentUser?.role === 'coach' ? (
             <button onClick={() => onNavigate('coach-dashboard')} className={`p-2 ${activePage === 'coach-dashboard' ? 'text-judo-yellow' : 'text-white'}`}><UserIcon size={20}/></button>
           ) : currentUser?.role === 'dev' ? (
              <button onClick={() => onNavigate('dev-dashboard')} className={`p-2 ${activePage === 'dev-dashboard' ? 'text-judo-yellow' : 'text-white'}`}><Wrench size={20}/></button>
           ) : (
             <button onClick={handleOpenLogin} className="p-2 text-judo-yellow"><LogIn size={20}/></button>
           )}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 JudoTrack Pro. Sviluppato per la tua palestra.</p>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-judo-dark/80 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-2 border-judo-yellow">
            <div className="bg-judo-blue p-6 text-white text-center">
              <h2 className="text-2xl font-bold">Benvenuto</h2>
              <p className="text-blue-100 mt-1">
                {loginStep === 'role-select' ? 'Seleziona il tuo profilo' : 
                 loginStep === 'user-select' ? 'Chi sta accedendo?' : 'Inserisci Password'}
              </p>
            </div>
            
            <div className="p-6">
              {loginStep === 'role-select' ? (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleSelectRole('athlete')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:border-judo-blue hover:bg-blue-50 transition-all group"
                  >
                    <div className="bg-blue-100 p-4 rounded-full mb-3 group-hover:bg-white group-hover:shadow-md transition-all">
                      <UserIcon size={32} className="text-judo-blue" />
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-judo-blue">ATLETA</span>
                  </button>

                  <button 
                    onClick={() => handleSelectRole('coach')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:border-judo-blue hover:bg-blue-50 transition-all group"
                  >
                     <div className="bg-blue-100 p-4 rounded-full mb-3 group-hover:bg-white group-hover:shadow-md transition-all">
                      <Shield size={32} className="text-judo-blue" />
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-judo-blue">COACH</span>
                  </button>

                  <button 
                    onClick={() => handleSelectRole('dev')}
                    className="col-span-2 flex flex-col items-center justify-center p-4 border-2 border-slate-100 rounded-xl hover:border-judo-yellow hover:bg-yellow-50 transition-all group mt-2"
                  >
                     <div className="bg-yellow-100 p-2 rounded-full mb-2 group-hover:bg-white group-hover:shadow-md transition-all">
                      <Wrench size={20} className="text-yellow-600" />
                    </div>
                    <span className="font-bold text-sm text-slate-700 group-hover:text-yellow-700">AREA SVILUPPATORE</span>
                  </button>
                </div>
              ) : loginStep === 'user-select' ? (
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-500 mb-4 cursor-pointer hover:text-judo-blue" onClick={() => setLoginStep('role-select')}>
                    &larr; Torna indietro
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableUsers.filter(u => u.role === selectedRole).map(user => (
                      <button 
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        className="w-full flex items-center p-3 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors text-left group"
                      >
                        <img src={user.avatar} className="w-10 h-10 rounded-full mr-4 bg-slate-200" alt={user.name} />
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800">{user.name}</h4>
                          <p className="text-xs text-slate-500">ID: {user.id}</p>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-judo-blue" size={20} />
                      </button>
                    ))}
                    {availableUsers.filter(u => u.role === selectedRole).length === 0 && (
                      <p className="text-center text-slate-500 py-4">Nessun utente trovato.</p>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitLogin} className="space-y-4">
                   <div className="flex items-center text-sm text-slate-500 mb-4 cursor-pointer hover:text-judo-blue" onClick={() => setLoginStep('user-select')}>
                    &larr; Cambia utente
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={16} className="text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full pl-10 border-slate-300 rounded-md shadow-sm focus:ring-judo-blue focus:border-judo-blue p-2 border"
                        placeholder="Inserisci password"
                        autoFocus
                      />
                    </div>
                    {loginError && <p className="text-red-600 text-xs mt-1">{loginError}</p>}
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-judo-blue text-white py-2 rounded-md font-bold hover:bg-judo-dark transition-colors"
                  >
                    ACCEDI
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};