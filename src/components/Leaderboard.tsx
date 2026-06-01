/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Info, Dumbbell, Route, HelpCircle, Flame, Star } from 'lucide-react';
import { ParticipantScore, Challenge } from '../types';
import { calculateChallengeProgress, isAerobicoActivity, isTreinoActivity } from '../utils';

interface LeaderboardProps {
  scores: ParticipantScore[];
  selectedParticipant: string | null;
  onSelectParticipant: (name: string) => void;
  challenges?: Challenge[];
}

export function Leaderboard({ scores, selectedParticipant, onSelectParticipant, challenges = [] }: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // Filter rankings based on search
  const filteredScores = scores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Return trophy or badge for the top athletes
  const getRankBadge = (rank: number) => {
    switch(rank) {
      case 1:
        return (
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20" title="1º Lugar - Ouro">
            🥇
          </span>
        );
      case 2:
        return (
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-bold text-sm shadow-md shadow-slate-300/20" title="2º Lugar - Prata">
            🥈
          </span>
        );
      case 3:
        return (
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-bold text-sm shadow-md shadow-amber-900/20" title="3º Lugar - Bronze">
            🥉
          </span>
        );
      default:
        return (
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-mono text-xs font-semibold">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md" id="leaderboard-panel">
      {/* Table Headers and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-850 pb-4 mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-100 font-sans flex items-center gap-2 notranslate" translate="no">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400/10" />
            Classificação do Desafio
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Exibição do Ranking oficial computado. Clique sobre o atleta para ver seu histórico.
          </p>
        </div>

        {/* Search and Help Widgets */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por atleta..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
            title="Informações da Fórmula de Pontos"
          >
            <Info className="w-4 h-4 text-emerald-400" />
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
                <div>• <span className="text-cyan-400 font-bold">Natação / Hidro:</span> 250m = <span className="text-emerald-400 font-semibold">1.0 Ponto</span></div>
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
        <table className="min-w-full divide-y divide-slate-850">
          <thead className="bg-slate-950">
            <tr>
              <th scope="col" className="px-2 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Pos.</th>
              <th scope="col" className="px-2 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Atleta</th>
              <th scope="col" className="px-2 py-2 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Pontos Totais</th>
              <th scope="col" className="px-2 py-2 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Bônus Combo</th>
              <th scope="col" className="px-2 py-2 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Pontos Cardio</th>
              <th scope="col" className="px-2 py-2 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Dias de Treino</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-[11px] text-slate-300 bg-slate-900">
            {filteredScores.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-6 text-center text-slate-500 font-mono">
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
                    className={`cursor-pointer transition-colors group ${
                      isSelected 
                        ? 'bg-emerald-950/20 border-l-4 border-l-emerald-500 hover:bg-emerald-950/30' 
                        : isChallengeCompleted
                        ? 'bg-amber-500/5 hover:bg-amber-500/10 border-l-4 border-l-amber-500/60'
                        : 'hover:bg-slate-850/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-2 py-2 whitespace-nowrap align-middle">
                      <div className="flex items-center">
                        {getRankBadge(row.rank)}
                      </div>
                    </td>

                    {/* Athlete Name */}
                    <td className="px-2 py-2 whitespace-nowrap align-middle font-medium">
                      <div className="text-xs font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors notranslate flex items-center gap-1" translate="no">
                        {row.name}
                        {isChallengeCompleted && (
                          <span className="inline-flex px-1 py-0.5 bg-amber-500/15 border border-amber-500/30 text-[8px] font-bold text-amber-400 rounded font-mono animate-pulse shrink-0" title="Concluiu o Desafio Mensal!">
                            🏆 OK
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px] sm:max-w-[200px] md:max-w-xs lg:max-w-md block" title={athleteChallenge ? `Desafio: ${athleteChallenge.targetGymDays}d + ${athleteChallenge.targetActivityValue}${athleteChallenge.targetActivityMetric === 'km' ? 'km' : 'd'} ${athleteChallenge.targetActivityType}` : undefined}>
                        <span>{row.activities.filter(isTreinoActivity).length} Treinos</span>
                        <span className="text-slate-600 mx-1">•</span>
                        <span>{row.activities.filter(isAerobicoActivity).length} Aeróbicos</span>
                        {athleteChallenge && (
                          <>
                            <span className="text-slate-600 mx-1">•</span>
                            <span className={isChallengeCompleted ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                              Alvo: {athleteChallenge.targetGymDays}T + {athleteChallenge.targetActivityValue}{athleteChallenge.targetActivityMetric === 'km' ? 'km' : 'd'} {athleteChallenge.targetActivityType}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Total Points */}
                    <td className="px-2 py-2 whitespace-nowrap text-center align-middle">
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {row.totalPoints.toFixed(1)} pts
                      </span>
                    </td>

                    {/* Combo Points */}
                    <td className="px-2 py-2 whitespace-nowrap text-center align-middle text-slate-300 font-mono text-[11px]">
                      <div className="flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" />
                        <span>{row.comboPoints}</span>
                      </div>
                    </td>

                    {/* Distance Points */}
                    <td className="px-2 py-2 whitespace-nowrap text-center align-middle text-slate-300 font-mono text-[11px]">
                      <div className="flex items-center justify-center gap-1">
                        <Route className="w-3 h-3 text-indigo-400" />
                        <span>{row.distancePoints.toFixed(1)}</span>
                      </div>
                    </td>

                    {/* Gym Points */}
                    <td className="px-2 py-2 whitespace-nowrap text-center align-middle text-slate-300 font-mono text-[11px]">
                      <div className="flex items-center justify-center gap-1">
                        <Dumbbell className="w-3 h-3 text-red-400" />
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
