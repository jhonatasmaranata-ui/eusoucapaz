/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Info, Dumbbell, Route, HelpCircle, Flame, Star } from 'lucide-react';
import { ParticipantScore, Challenge, GroupMember } from '../types';
import { calculateChallengeProgress, isAerobicoActivity, isTreinoActivity, isSameAthlete } from '../utils';
import { getMilitaryRankInfo, getMiniInsignia } from './MilitaryRankBadge';

interface LeaderboardProps {
  scores: ParticipantScore[];
  selectedParticipant: string | null;
  onSelectParticipant: (name: string) => void;
  challenges?: Challenge[];
  groupMembers?: GroupMember[];
  currentUserPhotoURL?: string;
  currentUserAthleteName?: string;
}

export function Leaderboard({ 
  scores, 
  selectedParticipant, 
  onSelectParticipant, 
  challenges = [], 
  groupMembers = [],
  currentUserPhotoURL = '',
  currentUserAthleteName = ''
}: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // Filter rankings based on search
  const filteredScores = scores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Return custom avatar/badge with gold, silver, bronze circle borders for the top athletes
  const getRankBadgeWithAvatar = (rank: number, name: string) => {
    const member = groupMembers.find(m => isSameAthlete(m.athleteName, name));
    let photo = member?.photoURL;
    
    // Local fallback: if this row matches current user and we have user photo from Google Auth
    if (!photo && currentUserAthleteName && isSameAthlete(currentUserAthleteName, name)) {
      photo = currentUserPhotoURL;
    }

    const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

    let ringClass = '';
    let badgeColor = '';
    
    if (rank === 1) {
      ringClass = 'ring-2 ring-amber-400 bg-amber-500/10 shadow-[0_0_8px_rgba(251,191,36,0.5)]';
      badgeColor = 'bg-amber-400 text-slate-950 font-black';
    } else if (rank === 2) {
      ringClass = 'ring-2 ring-slate-300 bg-slate-300/10 shadow-[0_0_8px_rgba(203,213,225,0.4)]';
      badgeColor = 'bg-slate-300 text-slate-950 font-black';
    } else if (rank === 3) {
      ringClass = 'ring-2 ring-amber-600 bg-amber-700/10 shadow-[0_0_8px_rgba(217,119,6,0.3)]';
      badgeColor = 'bg-amber-600 text-white font-black';
    } else {
      ringClass = 'ring-1 ring-slate-800 bg-slate-800/40';
      badgeColor = 'bg-slate-800 text-slate-400';
    }

    const getDeterministicBg = (n: string) => {
      const colors = [
        'bg-indigo-600 text-white',
        'bg-emerald-600 text-white',
        'bg-rose-600 text-white',
        'bg-cyan-600 text-white',
        'bg-fuchsia-600 text-white',
        'bg-orange-600 text-white',
        'bg-teal-600 text-white',
        'bg-pink-600 text-white',
        'bg-violet-600 text-white'
      ];
      let sum = 0;
      for (let i = 0; i < n.length; i++) {
        sum += n.charCodeAt(i);
      }
      return colors[sum % colors.length];
    };

    const bgClass = photo ? '' : getDeterministicBg(name);

    return (
      <div className="relative inline-block shrink-0 notranslate" translate="no">
        <div 
          className={`w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm select-none transition-all ${ringClass} ${bgClass}`}
          title={`${rank}º Lugar - ${name}`}
        >
          {photo ? (
            <img 
              src={photo} 
              alt={name} 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        
        {/* Tiny rank status badge in the corner */}
        <span className={`absolute -bottom-1 -right-1 flex items-center justify-center w-3 sm:w-4 h-3 sm:h-4 text-[7px] sm:text-[8px] rounded-full ring-1 ring-slate-900 font-mono ${badgeColor}`}>
          {rank}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-6 shadow-md" id="leaderboard-panel">
      {/* Table Headers and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 border-b border-slate-850 pb-3 sm:pb-4 mb-3 sm:mb-5">
        <div>
          <h3 className="text-[16px] sm:text-lg font-bold text-slate-100 font-sans flex items-center gap-2 notranslate" translate="no">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400/10" />
            Classificação do Desafio
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Exibição do Ranking oficial computado. Clique sobre o atleta para ver seu histórico.
          </p>
        </div>

        {/* Search and Help Widgets */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por atleta..."
              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 pl-8 pr-3 text-[11px] sm:text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer shrink-0"
            title="Informações da Fórmula de Pontos"
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {showFormulaInfo && (
        <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-emerald-950/40 text-xs text-slate-300 space-y-3 animate-fadeIn">
          <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-[10px] font-mono flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-emerald-400 fill-amber-500/10" />
            Regras de Pontuação Super Motivadoras:
          </h4>
          <p className="leading-relaxed text-slate-400">
            A pontuação é dividida em duas categorias distintas e premia intensamente a combinação diária:
          </p>
          <ul className="space-y-2.5 pl-4 list-disc marker:text-emerald-500">
            <li>
              <span className="font-semibold text-white">1. TREINO / OUTROS ESPORTES = 5 Pontos:</span> Sessões de musculação, funcional, pilates, yoga, crossfit, alongamento ou qualquer outro exercício descrito (dança, futebol, lutas, beach tennis, etc.) garantem <span className="text-red-400 font-bold">5.0 pontos fixos</span> por dia de prática.
            </li>
            <li>
              <span className="font-semibold text-white">2. AERÓBICO = Pontos por Volume:</span> As atividades de distância ou esforço aeróbico somam pontos diretamente com base na distância percorrida:
              <div className="mt-1.5 pl-3 border-l border-slate-800 space-y-1 text-[11px] text-slate-400 font-mono">
                <div>• <span className="text-indigo-400 font-bold">Corrida / Caminhada:</span> 1 km = <span className="text-emerald-400 font-semibold">1.0 Ponto</span></div>
                <div>• <span className="text-amber-500 font-bold">Pedalada (Bike):</span> 3 km = <span className="text-emerald-400 font-semibold">1.0 Ponto</span> (Ex: 9 km = 3 pts)</div>
                <div>• <span className="text-cyan-400 font-bold">Natação / Hidro:</span> 1 km = <span className="text-emerald-400 font-semibold">2.0 Pontos</span> (Ex: 500m = 1.0 ponto)</div>
              </div>
            </li>
            <li>
              <span className="font-semibold text-white">3. COMBO DIA DUPLO = 10 Pontos Base + Volume:</span> Quem fizer um <strong className="text-emerald-400">TREINO</strong> E um <strong className="text-indigo-400">AERÓBICO</strong> no mesmo dia ativa o bônus de Dia Duplo! A presença totaliza <span className="text-amber-500 font-bold">10 pontos de base automática</span> (5 do treino + 5 do combo), além de somar todas as conversões de distância do aeróbico!
            </li>
          </ul>
          <div className="pt-2 border-t border-slate-850 text-slate-400 text-[10px] font-mono leading-relaxed">
            ⚖️ <strong>Critério de desempate:</strong> Caso dois participantes empatem na pontuação total, o atleta com a maior pontuação em <strong>Aeróbico (Cardio por Distância / Volume)</strong> assume a liderança. Caso o empate persista, o número total de treinos (Gym Workouts) é utilizado como desempate.
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-850/80">
        <table className="min-w-full divide-y divide-slate-850 table-fixed sm:table-auto">
          <thead className="bg-slate-950">
            <tr>
              <th scope="col" className="w-[48px] sm:w-[60px] px-0.5 sm:px-1.5 py-1.5 text-center text-[8px] sm:text-[8.5px] font-bold text-slate-400 uppercase tracking-tight font-mono whitespace-nowrap">Pos.</th>
              <th scope="col" className="px-1 sm:px-1.5 py-1.5 text-left text-[8px] sm:text-[8.5px] font-bold text-slate-400 uppercase tracking-tight font-mono whitespace-nowrap">Atleta</th>
              <th scope="col" className="w-[50px] min-[350px]:w-[58px] sm:w-auto px-0.5 sm:px-1.5 py-1.5 text-center text-[8px] sm:text-[8.5px] font-bold text-slate-400 uppercase tracking-tight font-mono whitespace-nowrap">
                <span className="hidden min-[350px]:inline">Pontos</span>
                <span className="min-[350px]:hidden">Pts</span>
              </th>
              <th scope="col" className="w-[36px] sm:w-auto px-0.5 sm:px-1.5 py-1.5 text-center text-[8px] sm:text-[8.5px] font-bold text-slate-400 uppercase tracking-tight font-mono whitespace-nowrap">
                <span className="hidden sm:inline">Combo</span>
                <span className="sm:hidden" title="Combo">🔥</span>
              </th>
              <th scope="col" className="w-[36px] sm:w-auto px-0.5 sm:px-1.5 py-1.5 text-center text-[8px] sm:text-[8.5px] font-bold text-slate-400 uppercase tracking-tight font-mono whitespace-nowrap">
                <span className="hidden sm:inline">Cardio</span>
                <span className="sm:hidden" title="Cardio">🏃</span>
              </th>
              <th scope="col" className="w-[36px] sm:w-auto px-0.5 sm:px-1.5 py-1.5 text-center text-[8px] sm:text-[8.5px] font-bold text-slate-400 uppercase tracking-tight font-mono whitespace-nowrap">
                <span className="hidden sm:inline">Treinos</span>
                <span className="sm:hidden" title="Treinos">💪</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-[10px] sm:text-[10.5px] text-slate-300 bg-slate-900">
            {filteredScores.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-1.5 py-6 text-center text-slate-500 font-mono text-[10px]">
                  Nenhum atleta encontrado para "{searchTerm}".
                </td>
              </tr>
            ) : (
              filteredScores.map((row) => {
                const isSelected = selectedParticipant === row.name;
                
                // Track challenge configuration and progress
                const athleteChallenge = challenges.find(
                  c => c.athleteName.trim().toLowerCase() === row.name.trim().toLowerCase()
                );
                const progress = athleteChallenge ? calculateChallengeProgress(row, athleteChallenge) : null;
                const isChallengeCompleted = progress ? progress.isFullyCompleted : false;

                return (
                  <tr
                    key={row.name}
                    id={`athlete-row-${row.name.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => onSelectParticipant(row.name)}
                    className={`cursor-pointer transition-colors border-l-[3px] sm:border-l-4 group ${
                      isSelected 
                        ? 'bg-emerald-950/20 border-l-emerald-500 hover:bg-emerald-950/30' 
                        : isChallengeCompleted
                        ? 'bg-amber-500/5 hover:bg-amber-500/10 border-l-amber-500/60'
                        : 'border-l-transparent hover:bg-slate-850/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="w-[48px] sm:w-[60px] px-0.5 sm:px-1.5 py-1 sm:py-1.5 whitespace-nowrap align-middle text-center">
                      <div className="flex items-center justify-center">
                        {getRankBadgeWithAvatar(row.rank, row.name)}
                      </div>
                    </td>

                    {/* Athlete Name */}
                    <td className="px-1 sm:px-1.5 py-1 sm:py-1.5 whitespace-nowrap align-middle font-medium">
                      <div className="text-[10px] sm:text-xs font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors notranslate flex flex-wrap items-center gap-1" translate="no">
                        <span className="truncate max-w-[90px] sm:max-w-[180px] block">
                          {row.name ? row.name.trim().split(/\s+/)[0] : ''}
                        </span>
                        <div 
                          className="flex items-center justify-center px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-850 shadow-inner shrink-0 select-none cursor-help transition-all group-hover:border-slate-700 max-h-[18px] sm:max-h-[22px]" 
                          title={`${getMilitaryRankInfo(row.rank).name}`}
                        >
                          {getMiniInsignia(row.rank, 11)}
                        </div>
                        {isChallengeCompleted && (
                          <span className="inline-flex px-0.5 py-0.2 sm:px-1 sm:py-0.5 bg-amber-500/15 border border-amber-500/30 text-[7px] sm:text-[8px] font-bold text-amber-400 rounded font-mono animate-pulse shrink-0" title="Concluiu o Desafio Mensal!">
                            🏆
                          </span>
                        )}
                      </div>
                      <div className="text-[7.5px] min-[360px]:text-[8px] sm:text-[8.5px] text-slate-400 font-mono mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[70px] min-[330px]:max-w-[85px] min-[330px]:block min-[360px]:max-w-[100px] min-[400px]:max-w-[125px] sm:max-w-[200px] md:max-w-xs lg:max-w-md hidden" title={athleteChallenge ? `Desafio: ${athleteChallenge.targetGymDays}d + ${athleteChallenge.targetActivityValue}${athleteChallenge.targetActivityMetric === 'km' ? 'km' : 'd'} ${athleteChallenge.targetActivityType}` : undefined}>
                        <span>{row.activities.filter(isTreinoActivity).length}T</span>
                        <span className="text-slate-600 mx-0.5">•</span>
                        <span>{row.activities.filter(isAerobicoActivity).length}A</span>
                        {athleteChallenge && (
                          <>
                            <span className="text-slate-600 mx-0.5">•</span>
                            <span className={isChallengeCompleted ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                              {athleteChallenge.targetGymDays}T+{athleteChallenge.targetActivityValue}{athleteChallenge.targetActivityMetric === 'km' ? 'km' : 'd'}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Total Points */}
                    <td className="px-0.5 sm:px-1.5 py-1 sm:py-1.5 whitespace-nowrap text-center align-middle">
                      <span 
                        className="inline-flex px-1 sm:px-1.5 py-0.5 rounded text-[9.5px] sm:text-[10.5px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap notranslate"
                        translate="no"
                      >
                        {row.totalPoints.toFixed(1).replace('.', ',')} pts
                      </span>
                    </td>

                    {/* Combo Points */}
                    <td className="px-0.5 sm:px-1.5 py-1 sm:py-1.5 whitespace-nowrap text-center align-middle text-slate-300 font-mono text-[9px] sm:text-[10px]">
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                        <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 shrink-0" />
                        <span>{row.comboPoints}</span>
                      </div>
                    </td>

                    {/* Distance Points */}
                    <td className="px-0.5 sm:px-1.5 py-1 sm:py-1.5 whitespace-nowrap text-center align-middle text-slate-300 font-mono text-[9px] sm:text-[10px]">
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                        <Route className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400 shrink-0" />
                        <span>{row.distancePoints.toFixed(1)}</span>
                      </div>
                    </td>

                    {/* Gym Points */}
                    <td className="px-0.5 sm:px-1.5 py-1 sm:py-1.5 whitespace-nowrap text-center align-middle text-slate-300 font-mono text-[9px] sm:text-[10px]">
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                        <Dumbbell className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 shrink-0" />
                        <span>{row.totalWorkouts}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
