export enum UserRole {
  ADMIN = 'admin',
  COACH = 'coach',
  ATHLETE = 'athlete'
}

export enum MedalType {
  GOLD = 'gold',
  SILVER = 'silver',
  BRONZE = 'bronze',
  NONE = 'none'
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  age_category: string | null;
  weight_class: string | null;
  email?: string;
}

export interface SportEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  target_category: string | null;
  visibility_ids: string[] | null; // Array of UUIDs for private events, or null for public
  created_by: string;
}

export interface Registration {
  id: string;
  event_id: string;
  profile_id: string;
  status: 'yes' | 'no' | 'pending';
  declared_weight: string | null;
  event?: SportEvent; // Joined for UI
  profile?: Profile; // Joined for UI
}

export interface Result {
  id: string;
  event_id: string;
  profile_id: string;
  wins: number;
  losses: number;
  medal: MedalType;
  athlete_comment: string | null;
  event?: SportEvent;
}

export interface DashboardStats {
  totalMatches: number;
  totalWins: number;
  winRatio: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
}