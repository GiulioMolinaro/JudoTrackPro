import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Layout } from './components/Layout';
import { NewsFeed } from './pages/NewsFeed';
import { AthleteDashboard } from './pages/athlete/AthleteDashboard';
import { ResultForm } from './pages/athlete/ResultForm';
import { CoachDashboard } from './pages/coach/CoachDashboard';
import { DevDashboard } from './pages/dev/DevDashboard';

const AppContent: React.FC = () => {
  // Simple Hash-based routing state
  const [currentPage, setCurrentPage] = useState('home');
  const { currentUser } = useStore();

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    // Basic Protection Logic
    if (!currentUser && currentPage !== 'home') {
       return (
         <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-blue-50 p-6 rounded-full mb-6 text-judo-blue">
              <span className="text-4xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Accesso Richiesto</h2>
            <p className="text-slate-600 max-w-md mx-auto">
              Per accedere a questa sezione devi effettuare il login. 
              Usa il pulsante <span className="font-bold text-judo-blue">ACCEDI</span> in alto a destra.
            </p>
         </div>
       );
    }

    switch (currentPage) {
      case 'home':
        return <NewsFeed />;
      
      // Athlete Routes
      case 'athlete-dashboard':
        return currentUser?.role === 'athlete' ? <AthleteDashboard /> : <div className="text-center p-10">Accesso negato. Area riservata agli atleti.</div>;
      case 'athlete-input':
        return currentUser?.role === 'athlete' ? <ResultForm onComplete={() => navigate('athlete-dashboard')} /> : <div className="text-center p-10">Accesso negato.</div>;
      
      // Coach Routes
      case 'coach-dashboard':
        return currentUser?.role === 'coach' ? <CoachDashboard /> : <div className="text-center p-10">Accesso negato. Area riservata agli allenatori.</div>;
      
      // Dev Routes
      case 'dev-dashboard':
        return currentUser?.role === 'dev' ? <DevDashboard /> : <div className="text-center p-10">Accesso negato. Area riservata agli sviluppatori.</div>;

      default:
        return <NewsFeed />;
    }
  };

  return (
    <Layout activePage={currentPage} onNavigate={navigate}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;