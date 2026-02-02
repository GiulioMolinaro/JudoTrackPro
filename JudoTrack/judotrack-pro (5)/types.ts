export type Role = 'athlete' | 'coach' | 'dev';

export type AgeCategory = 'Cadetti' | 'Junior' | 'Senior';

export type Medal = 'Gold' | 'Silver' | 'Bronze' | 'None';

export interface User {
  id: string; // Acts as username
  name: string;
  role: Role;
  avatar?: string;
  password?: string; // Simple password field
}

export interface Competition {
  id: string;
  name: string;
  location: string;
  date: string;
  category: AgeCategory;
  visibility: 'public' | 'restricted'; // New field
  allowedAthletes: string[]; // List of User IDs allowed to see/enter this competition
}

export interface CompetitionResult {
  id: string;
  competitionId: string;
  athleteId: string;
  wins: number;
  losses: number;
  medal: Medal;
  notes: string;
  aiAnalysis?: string; // Field for Gemini analysis
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  imageUrl?: string;
}

// Expanded Result type with joined data for display
export interface EnrichedResult extends CompetitionResult {
  competitionName: string;
  competitionDate: string;
  competitionLocation: string;
}