/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Activity {
  id: string;
  timestamp: string;      // Date of submission
  name: string;           // Participant name
  type: string;           // Activity type: "Treino", "Corrida", "Caminhada", "Pedalada", "Natação", "Outra" etc.
  distance: number;       // Distance in km
  date: string;           // Activity date in YYYY-MM-DD
  checkInCode: string;    // Custom check-in code, unique spot identifier or photo link
  isGymWorkout: boolean;  // True if Type includes 'treino'
  userId?: string;        // ID of the user who logged this activity in the app
  calories?: number;      // Estimated calories for "Outra" custom activity
  customActivityName?: string; // Custom name for "Outra" category
  photoUrl?: string;      // Photo URL or Base64 uploaded image of training/running
  photoUrls?: string[];   // Array of photo URLs or Base64 uploaded images for multiple photos (up to 4)
}

export interface ParticipantScore {
  name: string;
  rank: number;
  gymPoints: number;      // Points from Gym Workouts (5 pts each)
  distancePoints: number;  // Total distance / volume points from outdoor cardio
  comboPoints: number;     // Combo points (10 pts for same-day gym workout + outdoor activity)
  totalPoints: number;     // F2 = gymPoints + distancePoints + comboPoints
  totalDistance: number;   // Total sum of distance for outdoor activities
  totalWorkouts: number;   // Total count of gym sessions
  activities: Activity[];  // List of all personal activities
}

export interface RuleConfig {
  startDate: string;                  // Activity date filter (e.g., "2025-09-06")
  endDate?: string;                   // Date range end filter (optional)
  gymPointsPerCheckIn: number;         // Points awarded per unique workout check-in (default: 5)
  distanceMultiplier: number;          // Points multiplier per km (default: 1)
  comboPointsPerDay: number;           // Points awarded for combo days (default: 10)
  corridaMultiplier?: number;          // Multiplier for Running (default: 1.0)
  ciclismoMultiplier?: number;         // Multiplier for Cycling (default: 0.33)
  natacaoMultiplier?: number;          // Multiplier for Swimming (default: 4.0)
  caminhadaMultiplier?: number;        // Multiplier for Walking (default: 1.0)
}

export interface Challenge {
  id: string;               // document ID, typically user ID
  athleteName: string;      // athlete name the challenge is bound to
  type: 'option1' | 'option2' | 'option3' | 'option4' | 'custom';
  targetGymDays: number;    // default 10
  targetActivityType: string; // e.g., "Corrida", "Caminhada", "Pedalada"
  targetActivityValue: number; // e.g., 5.0, 2.5
  targetActivityMetric: 'km' | 'days'; // e.g., metric to evaluate: "km" or "days"
  targetActivityDays?: number; // Target number of days
  targetActivityKm?: number;   // Target distance in Km
  createdAt?: string;

  // Novos campos para o 2º Cardio (Terceiro Exercício Opcional)
  hasSecondCardio?: boolean;
  secondCardioType?: string;
  secondCardioDays?: number;
  secondCardioKm?: number;
}

// Multi-tenant group/challenge elements
export interface GroupChallenge {
  id: string;               // group ID
  name: string;
  description: string;
  creatorId: string;
  inviteCode: string;
  rules: RuleConfig;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  athleteName: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface UserProfile {
  athleteName: string;
  email: string;
  photoURL?: string;
  registeredAt: string;
  role?: string;
  joinedGroups?: {
    [groupId: string]: {
      name: string;
      joinedAt: string;
    };
  };
  stravaIntegration?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athleteId?: string;
    athleteName?: string;
    connectedAt: string;
    isDemo?: boolean;
  };
}
