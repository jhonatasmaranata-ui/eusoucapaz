/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, ParticipantScore, RuleConfig, Challenge } from './types';

// Strict default starting rules matching the user's Excel formula: DATE(2025; 9; 6)
export const DEFAULT_RULES: RuleConfig = {
  startDate: '2025-09-06',
  endDate: '',
  gymPointsPerCheckIn: 5,
  distanceMultiplier: 1.0, // 1 point per 1 km
  comboPointsPerDay: 10,
};

export function getGlobalChallengeRules(): RuleConfig {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const lastDayStr = String(lastDay).padStart(2, '0');

  return {
    ...DEFAULT_RULES,
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${lastDayStr}`,
  };
}

// Generates beautiful realistic athlete data yielding the EXACT scores in the user's spreadsheet screenshot.
export const INITIAL_MOCK_ACTIVITIES: Activity[] = [
  // Almeida: Combo=9 days (90 pts), Gym only=2 days (10 pts), Distance=58.13 pts. Total = 158.13 pts.
  // Combos (9 days)
  { id: 'a1', timestamp: '2026-05-01 07:00', name: 'Almeida', type: 'Treino de Força', distance: 0, date: '2026-05-01', checkInCode: 'GYM-01', isGymWorkout: true },
  { id: 'a2', timestamp: '2026-05-01 18:00', name: 'Almeida', type: 'Corrida', distance: 6.0, date: '2026-05-01', checkInCode: '', isGymWorkout: false },
  
  { id: 'a3', timestamp: '2026-05-02 07:00', name: 'Almeida', type: 'Treino de Força', distance: 0, date: '2026-05-02', checkInCode: 'GYM-02', isGymWorkout: true },
  { id: 'a4', timestamp: '2026-05-02 18:00', name: 'Almeida', type: 'Corrida', distance: 6.5, date: '2026-05-02', checkInCode: '', isGymWorkout: false },
  
  { id: 'a5', timestamp: '2026-05-03 07:00', name: 'Almeida', type: 'Treino de Pernas', distance: 0, date: '2026-05-03', checkInCode: 'GYM-03', isGymWorkout: true },
  { id: 'a6', timestamp: '2026-05-03 18:00', name: 'Almeida', type: 'Pedalada', distance: 10.0, date: '2026-05-03', checkInCode: '', isGymWorkout: false },
  
  { id: 'a7', timestamp: '2026-05-05 07:00', name: 'Almeida', type: 'Treino', distance: 0, date: '2026-05-05', checkInCode: 'GYM-04', isGymWorkout: true },
  { id: 'a8', timestamp: '2026-05-05 18:00', name: 'Almeida', type: 'Corrida', distance: 5.5, date: '2026-05-05', checkInCode: '', isGymWorkout: false },
  
  { id: 'a9', timestamp: '2026-05-06 07:00', name: 'Almeida', type: 'Treino de Força', distance: 0, date: '2026-05-06', checkInCode: 'GYM-05', isGymWorkout: true },
  { id: 'a10', timestamp: '2026-05-06 18:00', name: 'Almeida', type: 'Caminhada', distance: 4.8, date: '2026-05-06', checkInCode: '', isGymWorkout: false },
  
  { id: 'a11', timestamp: '2026-05-08 07:00', name: 'Almeida', type: 'Treino de Peito', distance: 0, date: '2026-05-08', checkInCode: 'GYM-06', isGymWorkout: true },
  { id: 'a12', timestamp: '2026-05-08 18:00', name: 'Almeida', type: 'Corrida', distance: 7.20, date: '2026-05-08', checkInCode: '', isGymWorkout: false },
  
  { id: 'a13', timestamp: '2026-05-09 07:00', name: 'Almeida', type: 'Treino', distance: 0, date: '2026-05-09', checkInCode: 'GYM-07', isGymWorkout: true },
  { id: 'a14', timestamp: '2026-05-09 18:00', name: 'Almeida', type: 'Corrida', distance: 6.13, date: '2026-05-09', checkInCode: '', isGymWorkout: false },
  
  { id: 'a15', timestamp: '2026-05-11 07:00', name: 'Almeida', type: 'Treino de Ombros', distance: 0, date: '2026-05-11', checkInCode: 'GYM-08', isGymWorkout: true },
  { id: 'a16', timestamp: '2026-05-11 18:00', name: 'Almeida', type: 'Corrida', distance: 6.0, date: '2026-05-11', checkInCode: '', isGymWorkout: false },
  
  { id: 'a17', timestamp: '2026-05-12 07:00', name: 'Almeida', type: 'Treino de Costas', distance: 0, date: '2026-05-12', checkInCode: 'GYM-09', isGymWorkout: true },
  { id: 'a18', timestamp: '2026-05-12 18:00', name: 'Almeida', type: 'Corrida', distance: 6.0, date: '2026-05-12', checkInCode: '', isGymWorkout: false },
  // Gym only (2 days = 10 pts)
  { id: 'a19', timestamp: '2026-05-15 07:00', name: 'Almeida', type: 'Treino Rápido', distance: 0, date: '2026-05-15', checkInCode: 'GYM-10', isGymWorkout: true },
  { id: 'a20', timestamp: '2026-05-16 07:00', name: 'Almeida', type: 'Treino Funcional', distance: 0, date: '2026-05-16', checkInCode: 'GYM-11', isGymWorkout: true },

  // Alex Bispo: Combo=6 days (60 pts), Gym only=8 days (40 pts), Distance=37.38 pts. Total = 137.38 pts.
  // Combos (6 days)
  { id: 'ab1', timestamp: '2026-05-01 06:30', name: 'Alex Bispo', type: 'Treino Funcional', distance: 0, date: '2026-05-01', checkInCode: 'AB-01', isGymWorkout: true },
  { id: 'ab2', timestamp: '2026-05-01 17:30', name: 'Alex Bispo', type: 'Corrida', distance: 6.2, date: '2026-05-01', checkInCode: '', isGymWorkout: false },
  
  { id: 'ab3', timestamp: '2026-05-02 06:30', name: 'Alex Bispo', type: 'Treino de Força', distance: 0, date: '2026-05-02', checkInCode: 'AB-02', isGymWorkout: true },
  { id: 'ab4', timestamp: '2026-05-02 17:30', name: 'Alex Bispo', type: 'Corrida', distance: 6.0, date: '2026-05-02', checkInCode: '', isGymWorkout: false },
  
  { id: 'ab5', timestamp: '2026-05-03 06:30', name: 'Alex Bispo', type: 'Treino', distance: 0, date: '2026-05-03', checkInCode: 'AB-03', isGymWorkout: true },
  { id: 'ab6', timestamp: '2026-05-03 17:30', name: 'Alex Bispo', type: 'Caminhada', distance: 5.5, date: '2026-05-03', checkInCode: '', isGymWorkout: false },
  
  { id: 'ab7', timestamp: '2026-05-05 06:30', name: 'Alex Bispo', type: 'Treino', distance: 0, date: '2026-05-05', checkInCode: 'AB-04', isGymWorkout: true },
  { id: 'ab8', timestamp: '2026-05-05 17:30', name: 'Alex Bispo', type: 'Corrida', distance: 6.0, date: '2026-05-05', checkInCode: '', isGymWorkout: false },
  
  { id: 'ab9', timestamp: '2026-05-06 06:30', name: 'Alex Bispo', type: 'Treino de Pernas', distance: 0, date: '2026-05-06', checkInCode: 'AB-05', isGymWorkout: true },
  { id: 'ab10', timestamp: '2026-05-06 17:30', name: 'Alex Bispo', type: 'Corrida', distance: 7.18, date: '2026-05-06', checkInCode: '', isGymWorkout: false },
  
  { id: 'ab11', timestamp: '2026-05-08 06:30', name: 'Alex Bispo', type: 'Treino de Peito', distance: 0, date: '2026-05-08', checkInCode: 'AB-06', isGymWorkout: true },
  { id: 'ab12', timestamp: '2026-05-08 17:30', name: 'Alex Bispo', type: 'Corrida', distance: 6.5, date: '2026-05-08', checkInCode: '', isGymWorkout: false },
  // Gym only (8 days = 40 pts)
  { id: 'ab13', timestamp: '2026-05-10 07:00', name: 'Alex Bispo', type: 'Treino AB', distance: 0, date: '2026-05-10', checkInCode: 'AB-07', isGymWorkout: true },
  { id: 'ab14', timestamp: '2026-05-12 07:00', name: 'Alex Bispo', type: 'Treino Ombros', distance: 0, date: '2026-05-12', checkInCode: 'AB-08', isGymWorkout: true },
  { id: 'ab15', timestamp: '2026-05-14 07:00', name: 'Alex Bispo', type: 'Treino Costas', distance: 0, date: '2026-05-14', checkInCode: 'AB-09', isGymWorkout: true },
  { id: 'ab16', timestamp: '2026-05-15 07:00', name: 'Alex Bispo', type: 'Treino Hipertrofia', distance: 0, date: '2026-05-15', checkInCode: 'AB-10', isGymWorkout: true },
  { id: 'ab17', timestamp: '2026-05-17 07:00', name: 'Alex Bispo', type: 'Treino de Core', distance: 0, date: '2026-05-17', checkInCode: 'AB-11', isGymWorkout: true },
  { id: 'ab18', timestamp: '2026-05-18 07:00', name: 'Alex Bispo', type: 'Treino Superiores', distance: 0, date: '2026-05-18', checkInCode: 'AB-12', isGymWorkout: true },
  { id: 'ab19', timestamp: '2026-05-20 07:00', name: 'Alex Bispo', type: 'Treino Funcional', distance: 0, date: '2026-05-20', checkInCode: 'AB-13', isGymWorkout: true },
  { id: 'ab20', timestamp: '2026-05-22 07:00', name: 'Alex Bispo', type: 'Musculação A', distance: 0, date: '2026-05-22', checkInCode: 'AB-14', isGymWorkout: true },

  // Braga: Combo=9 days (90 pts), Gym only=1 day (5 pts), Distance=33.78 pts. Total = 128.78 pts.
  // Combos (9 days)
  { id: 'b1', timestamp: '2026-05-01 08:00', name: 'Braga', type: 'Treino Musculação', distance: 0, date: '2026-05-01', checkInCode: 'BR-01', isGymWorkout: true },
  { id: 'b2', timestamp: '2026-05-01 19:00', name: 'Braga', type: 'Corrida', distance: 3.5, date: '2026-05-01', checkInCode: '', isGymWorkout: false },
  
  { id: 'b3', timestamp: '2026-05-02 08:00', name: 'Braga', type: 'Treino', distance: 0, date: '2026-05-02', checkInCode: 'BR-02', isGymWorkout: true },
  { id: 'b4', timestamp: '2026-05-02 19:00', name: 'Braga', type: 'Corrida', distance: 3.78, date: '2026-05-02', checkInCode: '', isGymWorkout: false },
  
  { id: 'b5', timestamp: '2026-05-03 08:00', name: 'Braga', type: 'Treino Força', distance: 0, date: '2026-05-03', checkInCode: 'BR-03', isGymWorkout: true },
  { id: 'b6', timestamp: '2026-05-03 19:00', name: 'Braga', type: 'Corrida', distance: 4.0, date: '2026-05-03', checkInCode: '', isGymWorkout: false },
  
  { id: 'b7', timestamp: '2026-05-05 08:00', name: 'Braga', type: 'Treino', distance: 0, date: '2026-05-05', checkInCode: 'BR-04', isGymWorkout: true },
  { id: 'b8', timestamp: '2026-05-05 19:00', name: 'Braga', type: 'Corrida', distance: 3.5, date: '2026-05-05', checkInCode: '', isGymWorkout: false },
  
  { id: 'b9', timestamp: '2026-05-06 08:00', name: 'Braga', type: 'Treino de Ombros', distance: 0, date: '2026-05-06', checkInCode: 'BR-05', isGymWorkout: true },
  { id: 'b10', timestamp: '2026-05-06 19:00', name: 'Braga', type: 'Corrida', distance: 3.5, date: '2026-05-06', checkInCode: '', isGymWorkout: false },
  
  { id: 'b11', timestamp: '2026-05-08 08:00', name: 'Braga', type: 'Treino Superiores', distance: 0, date: '2026-05-08', checkInCode: 'BR-06', isGymWorkout: true },
  { id: 'b12', timestamp: '2026-05-08 19:00', name: 'Braga', type: 'Corrida', distance: 4.0, date: '2026-05-08', checkInCode: '', isGymWorkout: false },
  
  { id: 'b13', timestamp: '2026-05-09 08:00', name: 'Braga', type: 'Treino Funcional', distance: 0, date: '2026-05-09', checkInCode: 'BR-07', isGymWorkout: true },
  { id: 'b14', timestamp: '2026-05-09 19:00', name: 'Braga', type: 'Corrida', distance: 3.5, date: '2026-05-09', checkInCode: '', isGymWorkout: false },
  
  { id: 'b15', timestamp: '2026-05-11 08:00', name: 'Braga', type: 'Treino Costas', distance: 0, date: '2026-05-11', checkInCode: 'BR-08', isGymWorkout: true },
  { id: 'b16', timestamp: '2026-05-11 19:00', name: 'Braga', type: 'Corrida', distance: 4.0, date: '2026-05-11', checkInCode: '', isGymWorkout: false },
  
  { id: 'b17', timestamp: '2026-05-12 08:00', name: 'Braga', type: 'Treino Pernas', distance: 0, date: '2026-05-12', checkInCode: 'BR-09', isGymWorkout: true },
  { id: 'b18', timestamp: '2026-05-12 19:00', name: 'Braga', type: 'Corrida', distance: 4.0, date: '2026-05-12', checkInCode: '', isGymWorkout: false },
  // Gym only (1 day = 5 pts)
  { id: 'b19', timestamp: '2026-05-15 08:00', name: 'Braga', type: 'Treino Cardio', distance: 0, date: '2026-05-15', checkInCode: 'BR-10', isGymWorkout: true },

  // Martins: Combo=6 days (60 pts), Gym only=4 days (20 pts), Distance=24.20 pts. Total = 104.20 pts.
  // Combos (6 days)
  { id: 'm1', timestamp: '2026-05-01 07:15', name: 'Martins', type: 'Treino Musculação', distance: 0, date: '2026-05-01', checkInCode: 'M-01', isGymWorkout: true },
  { id: 'm2', timestamp: '2026-05-01 18:15', name: 'Martins', type: 'Corrida', distance: 4.2, date: '2026-05-01', checkInCode: '', isGymWorkout: false },
  
  { id: 'm3', timestamp: '2026-05-02 07:15', name: 'Martins', type: 'Treino', distance: 0, date: '2026-05-02', checkInCode: 'M-02', isGymWorkout: true },
  { id: 'm4', timestamp: '2026-05-02 18:15', name: 'Martins', type: 'Corrida', distance: 4.0, date: '2026-05-02', checkInCode: '', isGymWorkout: false },
  
  { id: 'm5', timestamp: '2026-05-03 07:15', name: 'Martins', type: 'Treino', distance: 0, date: '2026-05-03', checkInCode: 'M-03', isGymWorkout: true },
  { id: 'm6', timestamp: '2026-05-03 18:15', name: 'Martins', type: 'Corrida', distance: 4.0, date: '2026-05-03', checkInCode: '', isGymWorkout: false },
  
  { id: 'm7', timestamp: '2026-05-05 07:15', name: 'Martins', type: 'Treino de Força', distance: 0, date: '2026-05-05', checkInCode: 'M-04', isGymWorkout: true },
  { id: 'm8', timestamp: '2026-05-05 18:15', name: 'Martins', type: 'Corrida', distance: 4.0, date: '2026-05-05', checkInCode: '', isGymWorkout: false },
  
  { id: 'm9', timestamp: '2026-05-06 07:15', name: 'Martins', type: 'Treino de Costas', distance: 0, date: '2026-05-06', checkInCode: 'M-05', isGymWorkout: true },
  { id: 'm10', timestamp: '2026-05-06 18:15', name: 'Martins', type: 'Corrida', distance: 4.0, date: '2026-05-06', checkInCode: '', isGymWorkout: false },
  
  { id: 'm11', timestamp: '2026-05-08 07:15', name: 'Martins', type: 'Treino de Peito', distance: 0, date: '2026-05-08', checkInCode: 'M-06', isGymWorkout: true },
  { id: 'm12', timestamp: '2026-05-08 18:15', name: 'Martins', type: 'Corrida', distance: 4.0, date: '2026-05-08', checkInCode: '', isGymWorkout: false },
  // Gym only (4 days = 20 pts)
  { id: 'm13', timestamp: '2026-05-10 07:00', name: 'Martins', type: 'Treino Rápido B', distance: 0, date: '2026-05-10', checkInCode: 'M-07', isGymWorkout: true },
  { id: 'm14', timestamp: '2026-05-12 07:00', name: 'Martins', type: 'Treino Ombros', distance: 0, date: '2026-05-12', checkInCode: 'M-08', isGymWorkout: true },
  { id: 'm15', timestamp: '2026-05-14 07:00', name: 'Martins', type: 'Treino Superiores', distance: 0, date: '2026-05-14', checkInCode: 'M-09', isGymWorkout: true },
  { id: 'm16', timestamp: '2026-05-16 07:00', name: 'Martins', type: 'Funcional Core', distance: 0, date: '2026-05-16', checkInCode: 'M-10', isGymWorkout: true },

  // Diego Tavares: Combo=7 days (70 pts), Gym only=0 days, Distance=29.13 pts. Total = 99.13 pts.
  // Combos (7 days)
  { id: 'dt1', timestamp: '2026-05-01 07:45', name: 'Diego Tavares', type: 'Treino Funcional', distance: 0, date: '2026-05-01', checkInCode: 'DT-01', isGymWorkout: true },
  { id: 'dt2', timestamp: '2026-05-01 18:45', name: 'Diego Tavares', type: 'Corrida', distance: 4.13, date: '2026-05-01', checkInCode: '', isGymWorkout: false },
  
  { id: 'dt3', timestamp: '2026-05-02 07:45', name: 'Diego Tavares', type: 'Treino Força', distance: 0, date: '2026-05-02', checkInCode: 'DT-02', isGymWorkout: true },
  { id: 'dt4', timestamp: '2026-05-02 18:45', name: 'Diego Tavares', type: 'Corrida', distance: 4.0, date: '2026-05-02', checkInCode: '', isGymWorkout: false },
  
  { id: 'dt5', timestamp: '2026-05-03 07:45', name: 'Diego Tavares', type: 'Treino Pernas', distance: 0, date: '2026-05-03', checkInCode: 'DT-03', isGymWorkout: true },
  { id: 'dt6', timestamp: '2026-05-03 18:45', name: 'Diego Tavares', type: 'Caminhada', distance: 5.0, date: '2026-05-03', checkInCode: '', isGymWorkout: false },
  
  { id: 'dt7', timestamp: '2026-05-05 07:45', name: 'Diego Tavares', type: 'Treino', distance: 0, date: '2026-05-05', checkInCode: 'DT-04', isGymWorkout: true },
  { id: 'dt8', timestamp: '2026-05-05 18:45', name: 'Diego Tavares', type: 'Corrida', distance: 4.0, date: '2026-05-05', checkInCode: '', isGymWorkout: false },
  
  { id: 'dt9', timestamp: '2026-05-06 07:45', name: 'Diego Tavares', type: 'Treino de Ombros', distance: 0, date: '2026-05-06', checkInCode: 'DT-05', isGymWorkout: true },
  { id: 'dt10', timestamp: '2026-05-06 18:45', name: 'Diego Tavares', type: 'Corrida', distance: 4.0, date: '2026-05-06', checkInCode: '', isGymWorkout: false },
  
  { id: 'dt11', timestamp: '2026-05-08 07:45', name: 'Diego Tavares', type: 'Treino de Peito', distance: 0, date: '2026-05-08', checkInCode: 'DT-06', isGymWorkout: true },
  { id: 'dt12', timestamp: '2026-05-08 18:45', name: 'Diego Tavares', type: 'Corrida', distance: 4.0, date: '2026-05-08', checkInCode: '', isGymWorkout: false },
  
  { id: 'dt13', timestamp: '2026-05-09 07:45', name: 'Diego Tavares', type: 'Treino Costas', distance: 0, date: '2026-05-09', checkInCode: 'DT-07', isGymWorkout: true },
  { id: 'dt14', timestamp: '2026-05-09 18:45', name: 'Diego Tavares', type: 'Corrida', distance: 4.0, date: '2026-05-09', checkInCode: '', isGymWorkout: false },

  // Solange: Combo=0 days, Gym only=8 days (40 pts), Distance=0. Total = 40.0 pts.
  { id: 's1', timestamp: '2026-05-01 09:00', name: 'Solange', type: 'Treino Academia', distance: 0, date: '2026-05-01', checkInCode: 'SOL-01', isGymWorkout: true },
  { id: 's2', timestamp: '2026-05-02 09:00', name: 'Solange', type: 'Treino de Costas', distance: 0, date: '2026-05-02', checkInCode: 'SOL-02', isGymWorkout: true },
  { id: 's3', timestamp: '2026-05-03 09:00', name: 'Solange', type: 'Treino de Ombros', distance: 0, date: '2026-05-03', checkInCode: 'SOL-03', isGymWorkout: true },
  { id: 's4', timestamp: '2026-05-05 09:00', name: 'Solange', type: 'Treino Pernas', distance: 0, date: '2026-05-05', checkInCode: 'SOL-04', isGymWorkout: true },
  { id: 's5', timestamp: '2026-05-07 09:00', name: 'Solange', type: 'Treino de Força', distance: 0, date: '2026-05-07', checkInCode: 'SOL-05', isGymWorkout: true },
  { id: 's6', timestamp: '2026-05-09 09:00', name: 'Solange', type: 'Treino Peito', distance: 0, date: '2026-05-09', checkInCode: 'SOL-06', isGymWorkout: true },
  { id: 's7', timestamp: '2026-05-11 09:00', name: 'Solange', type: 'Treino Funcional', distance: 0, date: '2026-05-11', checkInCode: 'SOL-07', isGymWorkout: true },
  { id: 's8', timestamp: '2026-05-13 09:00', name: 'Solange', type: 'Musculação Completa', distance: 0, date: '2026-05-13', checkInCode: 'SOL-08', isGymWorkout: true },

  // Elieser: Combo=0 days, Gym only=6 days (30 pts), Distance=0. Total = 30.0 pts.
  { id: 'e1', timestamp: '2026-05-01 08:30', name: 'Elieser', type: 'Treino Força A', distance: 0, date: '2026-05-01', checkInCode: 'ELI-01', isGymWorkout: true },
  { id: 'e2', timestamp: '2026-05-02 08:30', name: 'Elieser', type: 'Treino Pernas', distance: 0, date: '2026-05-02', checkInCode: 'ELI-02', isGymWorkout: true },
  { id: 'e3', timestamp: '2026-05-03 08:30', name: 'Elieser', type: 'Treino Ombros', distance: 0, date: '2026-05-03', checkInCode: 'ELI-03', isGymWorkout: true },
  { id: 'e4', timestamp: '2026-05-05 08:30', name: 'Elieser', type: 'Treino Superiores', distance: 0, date: '2026-05-05', checkInCode: 'ELI-04', isGymWorkout: true },
  { id: 'e5', timestamp: '2026-05-07 08:30', name: 'Elieser', type: 'Treino Completo', distance: 0, date: '2026-05-07', checkInCode: 'ELI-05', isGymWorkout: true },
  { id: 'e6', timestamp: '2026-05-09 08:30', name: 'Elieser', type: 'Treino Peito Costas', distance: 0, date: '2026-05-09', checkInCode: 'ELI-06', isGymWorkout: true },

  // Quintanilha: Combo=1 day (10 pts), Gym only=1 day (5 pts), Distance=5.13 pts. Total = 20.13 pts.
  // Combos (1 day)
  { id: 'q1', timestamp: '2026-05-01 08:00', name: 'Quintanilha', type: 'Treino Funcional', distance: 0, date: '2026-05-01', checkInCode: 'Q-01', isGymWorkout: true },
  { id: 'q2', timestamp: '2026-05-01 19:00', name: 'Quintanilha', type: 'Corrida', distance: 5.13, date: '2026-05-01', checkInCode: '', isGymWorkout: false },
  // Gym only (1 day = 5 pts)
  { id: 'q3', timestamp: '2026-05-03 08:00', name: 'Quintanilha', type: 'Treino Simples', distance: 0, date: '2026-05-03', checkInCode: 'Q-02', isGymWorkout: true },
];

/**
 * Parses raw text inputted from Google Sheets or Forms CSV/TSV copy-paste.
 * Supports comma, semicolon, and tab separators.
 */
export function parseSpreadsheetData(rawText: string): Activity[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Detect separator
  const header = lines[0];
  let delimiter = '\t';
  if (header.includes(';')) {
    delimiter = ';';
  } else if (header.includes(',')) {
    delimiter = ',';
  }

  // Tokenize helper to support quotation marks properly
  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitLine(header).map(h => h.toLowerCase());

  // Find column indexes based on keywords
  // C / K: Nome / Participant
  // F: Atividade / Tipo de atividade / Modalidade (Treino, Corrida, Caminhada, Pedalada)
  // H: Distância / Distância (km)
  // I / E: Data da Atividade / Data
  // L: Foto / Link / Check-in / Código / Local
  const getIndex = (keywords: string[]): number => {
    return headers.findIndex(h => keywords.some(keyword => h.includes(keyword)));
  };

  const nameIdx = getIndex(['nome', 'participante', 'quem', 'usuario', 'user', 'athlete', 'atleta', 'k$']);
  const typeIdx = getIndex(['atividade', 'tipo', 'modalidade', 'esporte', 'f$']);
  const distIdx = getIndex(['distancia', 'distância', 'km', 'quilometros', 'h$']);
  const dateIdx = getIndex(['data', 'activity date', 'i$', 'e$']);
  const codeIdx = getIndex(['codigo', 'código', 'checkin', 'check-in', 'foto', 'link', 'local', 'l$']);
  const timestampIdx = getIndex(['carimbo', 'timestamp', 'data e hora', 'hora']);

  const activities: Activity[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const row = splitLine(line);
    if (row.length < 2) continue;

    // Extrapolate values dynamically or fallback
    const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : 'Participante Anonimo';
    const rawType = typeIdx !== -1 && row[typeIdx] ? row[typeIdx] : 'Treino';
    const rawDist = distIdx !== -1 && row[distIdx] ? row[distIdx] : '0';
    const rawDate = dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : '';
    const checkInCode = codeIdx !== -1 && row[codeIdx] ? row[codeIdx] : '';
    const timestamp = timestampIdx !== -1 && row[timestampIdx] ? row[timestampIdx] : new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Clean distance: convert Portuguese decimals (12,5) to standard decimal floats (12.5)
    const cleanDistStr = rawDist.replace(/\s/g, '').replace(',', '.');
    const distance = parseFloat(cleanDistStr) || 0;

    // Ensure valid date structure
    let date = rawDate;
    if (!date) {
      date = timestamp.split(' ')[0] || new Date().toISOString().split('T')[0];
    } else {
      // Handle DD/MM/YYYY to YYYY-MM-DD
      const dateParts = date.split(/[-/]/);
      if (dateParts.length === 3) {
        if (dateParts[2].length === 4) {
          // DD/MM/YYYY
          date = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
        } else if (dateParts[0].length === 4) {
          // YYYY-MM-DD
          date = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
        }
      }
    }

    const typeLower = rawType.toLowerCase();
    const isGymWorkout = (typeLower.includes('treino') || 
                          typeLower.includes('funcional') || 
                          typeLower.includes('crossfit') || 
                          typeLower.includes('croosfit') || 
                          typeLower.includes('academia') || 
                          typeLower.includes('musculação') || 
                          typeLower.includes('musculacao')) && distance === 0;

    activities.push({
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      name,
      type: rawType,
      distance,
      date,
      checkInCode,
      isGymWorkout,
    });
  }

  return activities;
}

/**
 * Classifies an activity as AERÓBICO (points based on distance/volume)
 */
export function isAerobicoActivity(a: Activity): boolean {
  const typeLower = (a.type || '').toLowerCase();
  
  const cardios = [
    'corrida', 'caminhada', 'pedalada', 'pedal', 'bike', 'bicicleta', 
    'natação', 'natacao', 'hidro'
  ];
  
  return cardios.some(kw => typeLower.includes(kw));
}

/**
 * Classifies an activity as TREINO / OUTROS (flat 5.0 points presence)
 * Last updated for Vercel deployment synced with GitHub.
 */
export function isTreinoActivity(a: Activity): boolean {
  if (a.isGymWorkout) return true;
  const typeLower = (a.type || '').toLowerCase();
  if (typeLower.includes('treino') || 
      typeLower.includes('funcional') || 
      typeLower.includes('crossfit') || 
      typeLower.includes('croosfit') || 
      typeLower.includes('academia') || 
      typeLower.includes('musculação') || 
      typeLower.includes('musculacao')) {
    return true;
  }
  // If it is not categorized as an aerobic activity, it counts as a training/custom activity (worth 5.0 points flat)!
  return !isAerobicoActivity(a);
}

/**
 * Unifies name matches robustly regardless of accents, case, trimming,
 * common letter double configurations (e.g. lh vs llh, which are frequent typing discrepancies),
 * or partial name occurrences.
 */
export function isSameAthlete(a: string, b: string): boolean {
  if (!a || !b) return false;
  const cleanA = a.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleanB = b.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (cleanA === cleanB) return true;
  
  // Normalize double letters common in typo variations (e.g. quintanilla, quintanillha, quintanilha)
  const norm = (s: string) => s.replace(/lh/g, 'l').replace(/ll/g, 'l');
  if (norm(cleanA) === norm(cleanB)) return true;
  
  // Extract first names/first words
  const firstWordA = cleanA.split(/\s+/)[0] || '';
  const firstWordB = cleanB.split(/\s+/)[0] || '';
  
  // If both have multiple words or substantial first words and they are different, they are different athletes
  if (firstWordA && firstWordB && norm(firstWordA) !== norm(firstWordB)) {
    // Ensure we don't treat them as the same person
    return false;
  }
  
  // If one contains the other (e.g. "Jhonatas Quintanillha" contains "Quintanilha" or vice versa)
  if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) return true;
  if (norm(cleanA).includes(norm(cleanB)) || norm(cleanB).includes(norm(cleanA))) return true;

  // Split both into words and see if any word of substantial length overlaps
  const wordsA = cleanA.split(/\s+/).filter(w => w.length > 3);
  const wordsB = cleanB.split(/\s+/).filter(w => w.length > 3);
  for (const wA of wordsA) {
    for (const wB of wordsB) {
      if (wA === wB || norm(wA) === norm(wB)) return true;
    }
  }

  return false;
}

/**
 * Calculates current rankings and statistics using the validated Excel logic
 */
export function calculateScores(activities: Activity[], rules: RuleConfig): ParticipantScore[] {
  const participantsMap: { [name: string]: Activity[] } = {};

  // Filter activities strictly according to the date range
  const filteredActivities = activities.filter(act => {
    if (act.date < rules.startDate) return false;
    if (rules.endDate && act.date > rules.endDate) return false;
    return true;
  });

  // Group by participant
  filteredActivities.forEach(act => {
    const trimmedName = act.name.trim();
    if (!trimmedName) return;
    
    // Find if there is an existing participant mapped that matches this trimmedName
    const existingKey = Object.keys(participantsMap).find(key => isSameAthlete(key, trimmedName));
    let targetName = existingKey || trimmedName;

    // Prefer the longer/more complete name for high-end leaderboard presentation
    if (existingKey && trimmedName.length > existingKey.length) {
      const existingActs = participantsMap[existingKey];
      delete participantsMap[existingKey];
      participantsMap[trimmedName] = existingActs;
      targetName = trimmedName;
    }

    if (!participantsMap[targetName]) {
      participantsMap[targetName] = [];
    }
    participantsMap[targetName].push(act);
  });

  const scores: ParticipantScore[] = Object.keys(participantsMap).map(name => {
    const pActs = participantsMap[name];

    // Group participant's activities by day
    const activitiesByDay: { [date: string]: Activity[] } = {};
    pActs.forEach(a => {
      if (!activitiesByDay[a.date]) {
        activitiesByDay[a.date] = [];
      }
      activitiesByDay[a.date].push(a);
    });

    const gymWeight = typeof rules.gymPointsPerCheckIn === 'number' ? rules.gymPointsPerCheckIn : 5.0;
    const comboWeight = typeof rules.comboPointsPerDay === 'number' ? rules.comboPointsPerDay : 10.0;
    const distMult = typeof rules.distanceMultiplier === 'number' ? rules.distanceMultiplier : 1.0;

    let gymPoints = 0;
    let distancePoints = 0;
    let comboPoints = 0;
    let totalDistance = 0;

    Object.keys(activitiesByDay).forEach(date => {
      const dayActs = activitiesByDay[date];
      
      const dayTreinos = dayActs.filter(isTreinoActivity);
      const dayAerobicos = dayActs.filter(isAerobicoActivity);
      
      const hasTreino = dayTreinos.length > 0;
      const hasAerobico = dayAerobicos.length > 0;

      // 1. TREINO = gymPointsPerCheckIn Pontos (per day with a training registered AND no aerobic activity)
      if (hasTreino && !hasAerobico) {
        gymPoints += gymWeight;
      }

      // 2. AERÓBICO = points based on aerobic activities distance/effort
      dayAerobicos.forEach(a => {
        const typeLower = (a.type || '').toLowerCase();
        let pts = 0;

        if (typeLower.includes('corrida') || typeLower.includes('run')) {
          pts = a.distance * 1.0;
          totalDistance += a.distance;
        } else if (typeLower.includes('caminhada') || typeLower.includes('walk')) {
          pts = a.distance * 1.0;
          totalDistance += a.distance;
        } else if (typeLower.includes('pedalada') || typeLower.includes('pedal') || typeLower.includes('bike') || typeLower.includes('bicicleta') || typeLower.includes('cycling') || typeLower.includes('ride')) {
          pts = a.distance / 3.0;
          totalDistance += a.distance;
        } else if (typeLower.includes('natação') || typeLower.includes('natacao') || typeLower.includes('swim')) {
          pts = (a.distance / 1000.0) * 2.0;
          totalDistance += a.distance / 1000.0;
        } else {
          pts = a.distance * 1.0;
          totalDistance += a.distance;
        }

        distancePoints += pts * distMult;
      });

      // 3. COMBO = Treino + Aeróbico on the same day totalizes comboPointsPerDay base points (no simple gym check-in added on this day)
      if (hasTreino && hasAerobico) {
        comboPoints += comboWeight; 
      }
    });

    const totalPoints = gymPoints + distancePoints + comboPoints;
    const totalWorkouts = pActs.filter(isTreinoActivity).length;

    return {
      name,
      rank: 0, // Assigned later
      gymPoints,
      distancePoints,
      comboPoints,
      totalPoints,
      totalDistance,
      totalWorkouts,
      activities: pActs,
    };
  });

  // Calculate ranks exactly based on formula 1 tie-breaker logic:
  // Sort strictly by:
  // 1. Total Points (F) descending
  // 2. Ties broken by Distance points (D) descending
  // 3. Ties broken by Gym points (C) descending
  scores.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    if (b.distancePoints !== a.distancePoints) {
      return b.distancePoints - a.distancePoints;
    }
    return b.gymPoints - a.gymPoints;
  });

  // Assign ranks
  let currentRank = 1;
  scores.forEach((p, idx) => {
    if (idx > 0) {
      const prev = scores[idx - 1];
      const hasTie = prev.totalPoints === p.totalPoints &&
                     prev.distancePoints === p.distancePoints &&
                     prev.gymPoints === p.gymPoints;
      if (!hasTie) {
        currentRank = idx + 1;
      }
    }
    p.rank = currentRank;
  });

  return scores;
}

export interface ChallengeProgress {
  gymDaysProgress: number;     // e.g. 8 (actual days completed)
  gymDaysTarget: number;       // e.g. 10
  activityValueProgress: number; // e.g. 3.5 (either km or days)
  activityValueTarget: number;   // e.g. 5.0
  activityType: string;        // e.g. "Corrida"
  activityMetric: 'km' | 'days';
  gymCompleted: boolean;
  activityCompleted: boolean;
  isFullyCompleted: boolean;
  hasDetailedCardio?: boolean;
  cardioDaysProgress?: number;
  cardioDaysTarget?: number;
  cardioKmTarget?: number;

  // Novos campos para o 2º Cardio (Terceiro Exercício)
  hasSecondCardio?: boolean;
  secondCardioType?: string;
  secondCardioDaysProgress?: number;
  secondCardioDaysTarget?: number;
  secondCardioKmTarget?: number;
  secondCardioCompleted?: boolean;
}

export function calculateChallengeProgress(
  score: ParticipantScore,
  challenge: Challenge
): ChallengeProgress {
  const gymDaysTarget = challenge.targetGymDays;
  const activityType = challenge.targetActivityType;
  
  // Gym progress: count the total unique days with a gym/strength/workout activity (both combo and only-training days)
  const uniqueGymDates = new Set(
    score.activities
      .filter(isTreinoActivity)
      .map(a => a.date)
  );
  const gymDaysProgress = uniqueGymDates.size;
  const gymCompleted = gymDaysProgress >= gymDaysTarget;

  // Filter participant activities for target activity
  // Compare after trimming and lowercase to be robust against user typing spacing or case differences
  const targetTypeLower = activityType.trim().toLowerCase();
  const matchedActivities = score.activities.filter(a => {
    const typeLower = (a.type || '').trim().toLowerCase();
    return typeLower.includes(targetTypeLower) || targetTypeLower.includes(typeLower);
  });

  const hasDetailedCardio = typeof challenge.targetActivityDays === 'number' || typeof challenge.targetActivityKm === 'number';

  const cardioDaysTarget = typeof challenge.targetActivityDays === 'number' 
    ? challenge.targetActivityDays 
    : (challenge.targetActivityMetric === 'days' ? challenge.targetActivityValue : 5); // default fallback

  const cardioKmTarget = typeof challenge.targetActivityKm === 'number'
    ? challenge.targetActivityKm
    : (challenge.targetActivityMetric === 'km' ? challenge.targetActivityValue : 0); // default fallback

  // Count unique days where the logged cardio has distance >= cardioKmTarget
  const activitiesByDate: { [date: string]: number } = {};
  matchedActivities.forEach(a => {
    activitiesByDate[a.date] = (activitiesByDate[a.date] || 0) + (a.distance || 0);
  });

  let cardioDaysProgress = 0;
  Object.keys(activitiesByDate).forEach(date => {
    if (activitiesByDate[date] >= cardioKmTarget) {
      cardioDaysProgress++;
    }
  });

  // Calculate legacy fields for render compatibility
  const activityMetric = challenge.targetActivityMetric || 'km';
  let activityValueProgress = 0;
  if (activityMetric === 'km') {
    activityValueProgress = matchedActivities.reduce((acc, act) => acc + (act.distance || 0), 0);
    activityValueProgress = Math.round(activityValueProgress * 100) / 100;
  } else {
    const uniqueDays = new Set(matchedActivities.map(a => a.date));
    activityValueProgress = uniqueDays.size;
  }
  const activityValueTarget = challenge.targetActivityValue;

  const activityCompleted = cardioDaysProgress >= cardioDaysTarget;

  // --- Segundo Cardio (Opcional - Terceira Atividade no total) ---
  let secondCardioDaysProgress = 0;
  let secondCardioDaysTarget = challenge.secondCardioDays || 10;
  let secondCardioKmTarget = challenge.secondCardioKm || 0;
  let secondCardioCompleted = true;

  if (challenge.hasSecondCardio) {
    const secondCardioTypeLower = (challenge.secondCardioType || '').trim().toLowerCase();
    if (secondCardioTypeLower) {
      const secondMatchedActivities = score.activities.filter(a => {
        const typeLower = (a.type || '').trim().toLowerCase();
        return typeLower.includes(secondCardioTypeLower) || secondCardioTypeLower.includes(typeLower);
      });

      const secondActivitiesByDate: { [date: string]: number } = {};
      secondMatchedActivities.forEach(a => {
        secondActivitiesByDate[a.date] = (secondActivitiesByDate[a.date] || 0) + (a.distance || 0);
      });

      Object.keys(secondActivitiesByDate).forEach(date => {
        if (secondActivitiesByDate[date] >= secondCardioKmTarget) {
          secondCardioDaysProgress++;
        }
      });

      secondCardioCompleted = secondCardioDaysProgress >= secondCardioDaysTarget;
    }
  }

  const isFullyCompleted = gymCompleted && activityCompleted && secondCardioCompleted;

  return {
    gymDaysProgress,
    gymDaysTarget,
    activityValueProgress,
    activityValueTarget,
    activityType,
    activityMetric,
    gymCompleted,
    activityCompleted,
    isFullyCompleted,
    hasDetailedCardio,
    cardioDaysProgress,
    cardioDaysTarget,
    cardioKmTarget,

    // Retorna dados do 2º Cardio
    hasSecondCardio: !!challenge.hasSecondCardio,
    secondCardioType: challenge.secondCardioType,
    secondCardioDaysProgress,
    secondCardioDaysTarget,
    secondCardioKmTarget,
    secondCardioCompleted
  };
}

export function extractGroupCode(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  
  // If we detect signs of a URL (http, https, slashes, or query question mark)
  if (trimmed.toUpperCase().includes('HTTP://') || trimmed.toUpperCase().includes('HTTPS://') || trimmed.includes('/') || trimmed.includes('?')) {
    try {
      // Ensure the string has a protocol so the URL parser doesn't fail
      const urlString = trimmed.match(/^https?:\/\//i) ? trimmed : `http://${trimmed}`;
      const url = new URL(urlString);
      
      // Look for common query params (group, GROUP, g, G)
      const groupParam = url.searchParams.get('group') || url.searchParams.get('GROUP') || url.searchParams.get('g') || url.searchParams.get('G');
      if (groupParam) {
        return groupParam.toUpperCase();
      }
      
      // Look for the last segment of the path if query is not available
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        if (lastSegment && /^[A-Z0-9_-]{3,12}$/i.test(lastSegment)) {
          return lastSegment.toUpperCase();
        }
      }
    } catch (e) {
      console.warn("Failed to parse URL in extractGroupCode helper:", e);
    }
    
    // RegEx fallbacks
    const queryMatch = trimmed.match(/[?&](group|g)=([A-Z0-9_-]+)/i);
    if (queryMatch && queryMatch[2]) {
      return queryMatch[2].toUpperCase();
    }
    
    const segments = trimmed.split('/');
    const lastPiece = segments[segments.length - 1];
    if (lastPiece && /^[A-Z0-9_-]{3,12}$/i.test(lastPiece)) {
      return lastPiece.toUpperCase();
    }
  }
  
  // Strip special characters and return clean alphanumeric code
  return trimmed.replace(/[^A-Za-z0-9_-]/g, '').toUpperCase();
}


