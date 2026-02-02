import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Competition, CompetitionResult, NewsItem, Role, AgeCategory } from '../types';
import { db, USE_FIREBASE } from '../services/firebase';
// @ts-ignore
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

interface StoreContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  addUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  competitions: Competition[];
  addCompetition: (comp: Omit<Competition, 'id'>) => void;
  updateCompetition: (id: string, comp: Partial<Competition>) => void;
  results: CompetitionResult[];
  addResult: (res: Omit<CompetitionResult, 'id'>) => void;
  news: NewsItem[];
  addNews: (newsItem: Omit<NewsItem, 'id' | 'date'>) => void;
  deleteNews: (newsId: string) => void;
  getAthleteResults: (athleteId: string) => CompetitionResult[];
  availableUsers: User[];
  login: (userId: string, passwordInput: string) => boolean;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Mock Data (Fallback & Bootstrap)
const MOCK_USERS: User[] = [
  { id: 'admin', name: 'Sviluppatore', role: 'dev', avatar: 'https://ui-avatars.com/api/?name=Dev&background=FFD700&color=000', password: 'admin' },
];

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  if (USE_FIREBASE) return [] as unknown as T; // Start empty if using Firebase (it will sync shortly)
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('judo_users', MOCK_USERS));
  const [competitions, setCompetitions] = useState<Competition[]>(() => loadFromStorage('judo_competitions', []));
  const [results, setResults] = useState<CompetitionResult[]>(() => loadFromStorage('judo_results', []));
  const [news, setNews] = useState<NewsItem[]>(() => loadFromStorage('judo_news', []));
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem('judo_current_user_id');
    // If local storage mode, find immediately. If firebase, might be null until users load.
    return users.find(u => u.id === savedId) || null;
  });

  // --- FIREBASE SYNCHRONIZATION ---
  useEffect(() => {
    if (!USE_FIREBASE || !db) return;

    // 1. Users Sync
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => doc.data() as User);
      setUsers(data);
      
      // BOOTSTRAP: If DB is empty (first run), create default admin
      if (data.length === 0) {
        const defaultAdmin = MOCK_USERS[0];
        setDoc(doc(db, 'users', defaultAdmin.id), defaultAdmin);
      }
    });

    // 2. Competitions Sync
    const unsubComps = onSnapshot(collection(db, 'competitions'), (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => doc.data() as Competition);
      setCompetitions(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    // 3. Results Sync
    const unsubResults = onSnapshot(collection(db, 'results'), (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => doc.data() as CompetitionResult);
      setResults(data);
    });

    // 4. News Sync
    const unsubNews = onSnapshot(collection(db, 'news'), (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => doc.data() as NewsItem);
      setNews(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    return () => {
      unsubUsers();
      unsubComps();
      unsubResults();
      unsubNews();
    };
  }, []);

  // Sync Current User when users list updates (needed for Firebase async loading)
  useEffect(() => {
    const savedId = localStorage.getItem('judo_current_user_id');
    if (savedId && !currentUser && users.length > 0) {
      const found = users.find(u => u.id === savedId);
      if (found) setCurrentUser(found);
    }
  }, [users, currentUser]);

  // Local Storage Fallback Sync (only if NOT using Firebase)
  useEffect(() => {
    if (USE_FIREBASE) return;
    localStorage.setItem('judo_users', JSON.stringify(users));
    localStorage.setItem('judo_competitions', JSON.stringify(competitions));
    localStorage.setItem('judo_results', JSON.stringify(results));
    localStorage.setItem('judo_news', JSON.stringify(news));
  }, [users, competitions, results, news]);

  // Session persistence (always use local storage for "who is logged in")
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('judo_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('judo_current_user_id');
    }
  }, [currentUser]);


  // --- ACTIONS ---

  const addUser = async (user: User) => {
    if (USE_FIREBASE && db) {
      await setDoc(doc(db, 'users', user.id), user);
    } else {
      setUsers(prev => [...prev, user]);
    }
  };

  const deleteUser = async (userId: string) => {
    if (USE_FIREBASE && db) {
      await deleteDoc(doc(db, 'users', userId));
    } else {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const addCompetition = async (comp: Omit<Competition, 'id'>) => {
    const newId = `c${Date.now()}`;
    const newComp = { ...comp, id: newId };
    if (USE_FIREBASE && db) {
      await setDoc(doc(db, 'competitions', newId), newComp);
    } else {
      setCompetitions(prev => [newComp, ...prev]);
    }
  };

  const updateCompetition = async (id: string, updatedData: Partial<Competition>) => {
    if (USE_FIREBASE && db) {
      await updateDoc(doc(db, 'competitions', id), updatedData);
    } else {
      setCompetitions(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    }
  };

  const addResult = async (res: Omit<CompetitionResult, 'id'>) => {
    const newId = `r${Date.now()}`;
    const newRes = { ...res, id: newId };
    if (USE_FIREBASE && db) {
      await setDoc(doc(db, 'results', newId), newRes);
    } else {
      setResults(prev => [newRes, ...prev]);
    }
  };

  const addNews = async (newsItem: Omit<NewsItem, 'id' | 'date'>) => {
    const newId = `n${Date.now()}`;
    const newI = { 
      ...newsItem, 
      id: newId,
      date: new Date().toISOString().split('T')[0]
    };
    if (USE_FIREBASE && db) {
      await setDoc(doc(db, 'news', newId), newI);
    } else {
      setNews(prev => [newI, ...prev]);
    }
  };

  const deleteNews = async (newsId: string) => {
    if (USE_FIREBASE && db) {
      await deleteDoc(doc(db, 'news', newsId));
    } else {
      setNews(prev => prev.filter(n => n.id !== newsId));
    }
  };

  const getAthleteResults = (athleteId: string) => {
    return results.filter(r => r.athleteId === athleteId);
  };

  const login = (userId: string, passwordInput: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (user && user.password === passwordInput) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <StoreContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      addUser,
      deleteUser,
      availableUsers: users,
      competitions,
      addCompetition,
      updateCompetition,
      results,
      addResult,
      news,
      addNews,
      deleteNews,
      getAthleteResults,
      login,
      logout
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};