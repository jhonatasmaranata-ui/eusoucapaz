/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ParticipantScore, Activity, Challenge, RuleConfig } from '../types';
import { Calendar, Flame, Dumbbell, Route, Check, MapPin, Hash, Trophy, Trash2, Waves, Sparkles, Smile, Camera, Image, Eye } from 'lucide-react';
import { isTreinoActivity, isAerobicoActivity, calculateChallengeProgress, isSameAthlete } from '../utils';

import { getMilitaryRankInfo } from './MilitaryRankBadge';

interface ParticipantDetailsProps {
  score: ParticipantScore | null;
  currentUserId?: string;
  onDeleteActivity?: (id: string) => void;
  onUpdateActivityPhoto?: (activityId: string, photoOrPhotos: string | string[]) => void | Promise<void>;
  challenges?: Challenge[];
  rules?: RuleConfig;
}

export function ParticipantDetails({ score, currentUserId, onDeleteActivity, onUpdateActivityPhoto, challenges = [], rules }: ParticipantDetailsProps) {
  const [activeTab, setActiveTab] = useState<'graph' | 'list'>('graph');
  const [selectedDay, setSelectedDay] = useState<any | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const handleUploadPhotoFile = (activity: Activity, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUserId || activity.userId !== currentUserId) {
      alert('Você não tem permissão para adicionar fotos a este treino.');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    const currentPhotos = activity.photoUrls && activity.photoUrls.length > 0
      ? [...activity.photoUrls]
      : activity.photoUrl
      ? [activity.photoUrl]
      : [];

    if (currentPhotos.length >= 4) {
      alert('Limite de 4 fotos já foi atingido para este treino.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        const updatedPhotos = [...currentPhotos, dataUrl].slice(0, 4);

        if (onUpdateActivityPhoto) {
          onUpdateActivityPhoto(activity.id, updatedPhotos);
          
          // Also update selectedDay state so change is reflected immediately without closing popup
          if (selectedDay) {
            setSelectedDay((prev: any) => {
              if (!prev) return prev;
              return {
                ...prev,
                activitiesList: prev.activitiesList.map((a: any) => 
                  a.id === activity.id 
                    ? { ...a, photoUrl: updatedPhotos[0], photoUrls: updatedPhotos } 
                    : a
                )
              };
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handleRemovePhoto = (activity: Activity, indexToRemove: number) => {
    if (!currentUserId || activity.userId !== currentUserId) {
      alert('Você não tem permissão para remover fotos deste treino.');
      return;
    }

    const currentPhotos = activity.photoUrls && activity.photoUrls.length > 0
      ? [...activity.photoUrls]
      : activity.photoUrl
      ? [activity.photoUrl]
      : [];

    const updatedPhotos = currentPhotos.filter((_, idx) => idx !== indexToRemove);

    if (onUpdateActivityPhoto) {
      onUpdateActivityPhoto(activity.id, updatedPhotos);
      
      // Also update selectedDay state so change is reflected immediately without closing popup
      if (selectedDay) {
        setSelectedDay((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            activitiesList: prev.activitiesList.map((a: any) => 
              a.id === activity.id 
                ? { 
                    ...a, 
                    photoUrl: updatedPhotos.length > 0 ? updatedPhotos[0] : undefined, 
                    photoUrls: updatedPhotos.length > 0 ? updatedPhotos : undefined 
                  } 
                : a
            )
          };
        });
      }
    }
  };

  if (!score) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 font-mono shadow-sm" id="empty-details-card">
        🎯 Selecione um atleta na tabela acima para analisar seu dashboard completo de métricas e histórico de treinos.
      </div>
    );
  }

  // Generate dynamic duration days starting EXACTLY from rules.startDate
  const getDaysGrid = () => {
    const startStr = rules?.startDate || '2026-05-01';
    let durationDays = 30;

    const startParts = startStr.split('-');
    if (startParts.length !== 3) return [];

    const startYear = parseInt(startParts[0], 10);
    const startMonth = parseInt(startParts[1], 10) - 1;
    const startDay = parseInt(startParts[2], 10);
    const startDate = new Date(startYear, startMonth, startDay);

    if (rules?.endDate) {
      const endParts = rules.endDate.split('-');
      if (endParts.length === 3) {
        const endYear = parseInt(endParts[0], 10);
        const endMonth = parseInt(endParts[1], 10) - 1;
        const endDay = parseInt(endParts[2], 10);
        const endDate = new Date(endYear, endMonth, endDay);
        
        const diffTime = endDate.getTime() - startDate.getTime();
        const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (calculatedDays > 0) {
          durationDays = calculatedDays;
        }
      }
    }

    const grid = [];
    const dateCursor = new Date(startDate);

    for (let i = 0; i < durationDays; i++) {
      const year = dateCursor.getFullYear();
      const month = String(dateCursor.getMonth() + 1).padStart(2, '0');
      const day = String(dateCursor.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;

      // Check current activities on this day
      const dayActs = score.activities.filter(a => a.date === formatted);
      const hasTreino = dayActs.some(a => a.type.toLowerCase().includes('treino') || a.isGymWorkout);
      const hasOutdoor = dayActs.some(a => {
        const t = a.type.toLowerCase();
        return (t.includes('corrida') || t.includes('caminhada') || t.includes('pedalada') || t.includes('ciclismo') || t.includes('natação') || t.includes('natacao')) && a.distance > 0;
      });
      const isCombo = hasTreino && hasOutdoor;

      grid.push({
        date: formatted,
        dayLabel: dateCursor.getDate(),
        activitiesCount: dayActs.length,
        isCombo,
        hasTreino,
        hasOutdoor,
        activitiesList: dayActs
      });

      dateCursor.setDate(dateCursor.getDate() + 1);
    }
    return grid;
  };

  const daysGrid = getDaysGrid();

  // Helper for grid cell style
  const getCellClassName = (day: any) => {
    if (day.activitiesCount === 0) {
      return 'bg-slate-800/40 border border-slate-850/50 hover:bg-slate-850';
    }
    if (day.isCombo) {
      return 'bg-amber-500 border border-amber-600 shadow-sm shadow-amber-500/20 text-slate-950 font-bold hover:brightness-110';
    }
    if (day.hasTreino && day.hasOutdoor) {
      return 'bg-emerald-500 border border-emerald-600 hover:bg-emerald-400';
    }
    if (day.hasTreino) {
      return 'bg-emerald-700/80 border border-emerald-600/40 hover:brightness-110';
    }
    return 'bg-blue-600/80 border border-blue-500/40 hover:brightness-110';
  };

  const handleDeleteWithConfirm = (id: string) => {
    if (window.confirm('Tem certeza de que deseja deletar este treino de forma permanente?')) {
      onDeleteActivity?.(id);
    }
  };

  const hasDeletableActivity = score.activities.some(act => act.userId && act.userId === currentUserId);

  const activitiesByDate: { [date: string]: Activity[] } = {};
  score.activities.forEach(a => {
    if (!activitiesByDate[a.date]) {
      activitiesByDate[a.date] = [];
    }
    activitiesByDate[a.date].push(a);
  });

  let comboDaysCount = 0;
  let gymOnlyDaysCount = 0;

  Object.keys(activitiesByDate).forEach(date => {
    const dayActs = activitiesByDate[date];
    const hasTreino = dayActs.some(isTreinoActivity);
    const hasAerobico = dayActs.some(isAerobicoActivity);

    if (hasTreino && hasAerobico) {
      comboDaysCount++;
    } else if (hasTreino) {
      gymOnlyDaysCount++;
    }
  });

  const rankInfo = getMilitaryRankInfo(score.rank);

  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-md" id="participant-dashboard">
      
      {/* Bio and Main Stats Head */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-850 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div 
            className={`w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] rounded-xl bg-gradient-to-b ${rankInfo.bgClass} flex flex-col items-center justify-center border shadow-md notranslate shrink-0 p-1 sm:p-1.5`}
            translate="no"
          >
            {rankInfo.icon}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex flex-wrap items-center gap-2 notranslate" translate="no">
              <span>{score.name}</span>
              <span className={`text-[9.5px] sm:text-[10.5px] font-extrabold px-2 py-0.5 rounded-md border font-mono tracking-wider uppercase shrink-0 ${
                score.rank === 1 
                  ? 'bg-amber-500/10 border-amber-500/35 text-amber-400' 
                  : score.rank <= 3 
                  ? 'bg-slate-850 border-slate-700 text-slate-300' 
                  : 'bg-slate-950 border-slate-855 text-slate-450'
              }`} title={`Patente organizada pelo Ranking atual`}>
                {rankInfo.name}
              </span>
              {score.rank <= 3 && (
                <span className="text-[10px] sm:text-xs bg-amber-500/10 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md border border-amber-500/30 font-mono text-amber-400 flex items-center gap-1 font-bold shrink-0 whitespace-nowrap">
                  <Trophy className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-400 fill-amber-400/10" />
                  TOP {score.rank}
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Dynamic score card */}
        <div className="grid grid-cols-2 xs:flex items-center gap-2">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-center rounded-xl min-w-24 animate-pulse">
            <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider font-mono">Pontuação</div>
            <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5">{score.totalPoints.toFixed(1)}</div>
          </div>
          <div className="px-4 py-2 bg-slate-950 text-center rounded-xl min-w-24 border border-slate-850">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">Classificação</div>
            <div className="text-lg font-bold text-slate-200 font-mono mt-0.5">#{score.rank}</div>
          </div>
        </div>
      </div>

      {/* Grid Quick Metric Figures */}
      <div className="grid grid-cols-1 gap-3 mb-6 animate-fadeIn" id="participant-quick-metrics-stack">
        
        {/* Combos Card */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between gap-4 shadow-sm hover:border-amber-500/25 transition-all">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 shrink-0">
              <Flame className="w-4.5 h-4.5 fill-amber-500/10" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 font-sans uppercase tracking-wider">Dias de Combos</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-sans leading-normal">Treino + Cardio no mesmo dia</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-black text-amber-400 font-mono">{comboDaysCount} {comboDaysCount === 1 ? 'Dia' : 'Dias'}</div>
          </div>
        </div>

        {/* Volume Outdoor Card */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between gap-4 shadow-sm hover:border-indigo-500/25 transition-all">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20 shrink-0">
              <Route className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 font-sans uppercase tracking-wider">Pontos de Cardio</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-sans leading-normal">{score.totalDistance.toFixed(1)} Km rodados</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-black text-indigo-300 font-mono">{score.distancePoints.toFixed(1)} pts</div>
          </div>
        </div>

        {/* Gym Workouts Count Card */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between gap-4 shadow-sm hover:border-red-500/25 transition-all">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 shrink-0">
              <Dumbbell className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 font-sans uppercase tracking-wider">Dias de Treino</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-sans leading-normal">{score.gymPoints} pontos bônus</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-black text-red-400 font-mono">{score.totalWorkouts} {score.totalWorkouts === 1 ? 'dia' : 'dias'}</div>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-850 mb-4 text-xs font-mono overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2 hover:text-white transition-colors border-b-2 font-medium cursor-pointer shrink-0 ${
            activeTab === 'graph' ? 'border-b-emerald-500 text-white' : 'border-b-transparent text-slate-400'
          }`}
        >
          Calendário de Consistência
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 hover:text-white transition-colors border-b-2 font-medium cursor-pointer shrink-0 ${
            activeTab === 'list' ? 'border-b-emerald-500 text-white' : 'border-b-transparent text-slate-400'
          }`}
        >
          Histórico de Logs ({score.activities.length})
        </button>
      </div>

      {/* Tab: Calendar Contribution Heatmap */}
      {activeTab === 'graph' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5">
            <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              Gráfico de Frequência ({daysGrid.length} {daysGrid.length === 1 ? 'Dia' : 'Dias'} do Desafio)
            </h4>

            {/* Grid Container */}
            <div className="flex flex-col items-center sm:items-start gap-4">
              <div className="grid grid-cols-7 gap-1.5 w-full max-w-sm sm:max-w-md mx-auto sm:mx-0">
                {daysGrid.map((day, idx) => {
                  const hasPhoto = day.activitiesList.some((a: any) => a.photoUrl || (a.photoUrls && a.photoUrls.length > 0));
                  const isSelected = selectedDay?.date === day.date;
                  
                  return (
                    <div
                      key={`${day.date}-${idx}`}
                      onClick={() => {
                        setSelectedDay(isSelected ? null : day);
                      }}
                      className={`h-9 sm:h-11 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono cursor-pointer transition-all relative ${getCellClassName(day)} ${
                        isSelected ? 'ring-2 ring-emerald-400 scale-102 z-10 font-bold' : ''
                      }`}
                      title={`${day.date.split('-').reverse().join('/')}: ${day.activitiesCount} registros. ${day.isCombo ? '🔥 Combo Ativado!' : ''}`}
                    >
                      <span className="opacity-95">{day.dayLabel}</span>
                      {day.isCombo && <span className="text-[8px] mt-0.5">🔥</span>}
                      {hasPhoto && (
                        <span className="absolute bottom-0.5 right-0.5 text-[8px]" title="Comprovação de treino anexada!">
                          📷
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Grid Legend */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-850 w-full">
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-850" />
                  <span>Inativo</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-700/80 border border-emerald-600/30" />
                  <span>Treino</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded bg-blue-600/80 border border-blue-500/30" />
                  <span>Cardio</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded bg-amber-500 shadow-sm shadow-amber-500/10" />
                  <span className="text-amber-300 font-bold">🔥 Combo Dia Duplo</span>
                </div>
                <div className="flex items-center gap-1 ml-auto text-slate-500 text-[9px]">
                  <span>💡 Clique nos dias para ver detalhes e fotos</span>
                </div>
              </div>
            </div>

            {/* Selected Day Details Panel */}
            {selectedDay && (
              <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-xs text-slate-350 animate-fadeIn w-full space-y-3">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <h5 className="font-bold text-slate-200 font-mono flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Treinos em {selectedDay.date.split('-').reverse().join('/')}:
                  </h5>
                  <button 
                    onClick={() => setSelectedDay(null)}
                    className="text-slate-500 hover:text-slate-300 font-bold font-mono px-1 pb-0.5 cursor-pointer text-xs"
                  >
                    Fechar ✕
                  </button>
                </div>
                
                {selectedDay.activitiesList.length === 0 ? (
                  <p className="text-slate-500 italic font-mono text-[11px] py-1">Nenhum treino ou corrida registrado neste dia do calendário.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDay.activitiesList.map((act: any) => {
                      const typeLower = act.type.toLowerCase();
                      const isGym = act.isGymWorkout || isTreinoActivity(act);
                      const isOwner = act.userId && act.userId === currentUserId;
                      return (
                        <div key={act.id} className="p-3 rounded-lg bg-slate-950/80 border border-slate-850/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs">
                              {isGym ? (
                                <Dumbbell className="w-3.5 h-3.5 text-red-400" />
                              ) : (
                                <Route className="w-3.5 h-3.5 text-indigo-400" />
                              )}
                              <span>{act.type}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-slate-450">
                              {act.distance > 0 && (
                                <div>
                                  Métrica: <strong className="text-slate-300">{typeLower.includes('natacao') || typeLower.includes('natação') ? `${act.distance} metros` : `${act.distance.toFixed(2)} km`}</strong>
                                </div>
                              )}
                              {act.checkInCode && (
                                <div>
                                  Local: <strong className="text-emerald-400">{act.checkInCode}</strong>
                                </div>
                              )}
                              <div>
                                Registro: <strong className="text-slate-400">{act.timestamp.split(' ')[1] || 'N/A'}</strong>
                              </div>
                            </div>
                          </div>

                          {/* Render Multi-Photo Preview and Upload Grid */}
                          <div className="flex flex-wrap items-center gap-2">
                            {(() => {
                              const actPhotos = act.photoUrls && act.photoUrls.length > 0
                                ? act.photoUrls
                                : act.photoUrl
                                ? [act.photoUrl]
                                : [];
                              
                              return (
                                <>
                                  {actPhotos.map((pUrl, pIdx) => (
                                    <div key={pIdx} className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow p-0.5 shrink-0">
                                      <img
                                        src={pUrl}
                                        alt={`Foto ${pIdx + 1}`}
                                        className="w-full h-full object-cover rounded-md cursor-zoom-in"
                                        referrerPolicy="no-referrer"
                                        onClick={() => setLightboxImage(pUrl)}
                                      />
                                      {/* Remove individual photo button - only show to owner */}
                                      {isOwner && (
                                        <button
                                          type="button"
                                          onClick={() => handleRemovePhoto(act, pIdx)}
                                          className="absolute -top-1 -right-0.5 bg-red-500 hover:bg-red-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold cursor-pointer transition-all shadow opacity-90 hover:opacity-100 z-20"
                                          title="Remover esta foto"
                                        >
                                          ✕
                                        </button>
                                      )}
                                      {/* Small magnifier view overlay */}
                                      <div 
                                        onClick={() => setLightboxImage(pUrl)}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-zoom-in z-10"
                                      >
                                        <Eye className="w-3 h-3 text-white" />
                                      </div>
                                    </div>
                                  ))}

                                  {/* Add new photo if under the limit of 4 - only show to owner */}
                                  {isOwner && actPhotos.length < 4 && (
                                    <div className="shrink-0">
                                      <label className="cursor-pointer w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-dashed border-emerald-500/25 hover:border-emerald-500/50 hover:bg-emerald-500/5 bg-emerald-500/10 text-emerald-400 flex flex-col items-center justify-center transition-all">
                                        <Camera className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-[7px] font-bold mt-1 uppercase font-sans">+{4 - actPhotos.length} Foto</span>
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          onChange={(e) => handleUploadPhotoFile(act, e)} 
                                          className="hidden" 
                                        />
                                      </label>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Submissions List */}
      {activeTab === 'list' && (
        <div className="overflow-hidden rounded-xl border border-slate-850 bg-slate-950">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-850 text-xs text-slate-300">
              <thead className="bg-slate-900/60 font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-left font-semibold">Data Atividade</th>
                  <th scope="col" className="px-4 py-2.5 text-left font-semibold">Tipo de Atividade</th>
                  <th scope="col" className="px-4 py-2.5 text-center font-semibold">Métrica / Volume</th>
                  <th scope="col" className="px-4 py-2.5 text-left font-semibold">Local / Treino</th>
                  <th scope="col" className="px-4 py-2.5 text-center font-semibold">Foto</th>
                  {hasDeletableActivity && (
                    <th scope="col" className="px-4 py-2.5 text-center font-semibold">Ação</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-950">
                {score.activities.map((act) => {
                  const isDeletable = act.userId && act.userId === currentUserId;
                  const typeLower = act.type.toLowerCase();
                  
                  // Choose dynamic icon
                  let ActivityIcon = Route;
                  let iconColor = "text-indigo-400";
                  if (act.isGymWorkout || isTreinoActivity(act)) {
                    ActivityIcon = Dumbbell;
                    iconColor = "text-red-400";
                  } else if (typeLower.includes("caminhada")) {
                    ActivityIcon = Route;
                    iconColor = "text-sky-400";
                  } else if (typeLower.includes("pedalada") || typeLower.includes("pedal")) {
                    ActivityIcon = Route;
                    iconColor = "text-amber-500";
                  } else if (typeLower.includes("natação") || typeLower.includes("natacao")) {
                    ActivityIcon = Waves;
                    iconColor = "text-cyan-400";
                  } else if (act.calories) {
                    ActivityIcon = Flame;
                    iconColor = "text-orange-500";
                  }

                  return (
                    <tr key={act.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap font-mono text-slate-400">
                        {act.date.split('-').reverse().join('/')}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          <ActivityIcon className={`w-3.5 h-3.5 ${iconColor}`} />
                          <span>{act.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono">
                        {typeLower.includes("natação") || typeLower.includes("natacao") ? (
                          <span className="text-cyan-300 font-medium">{act.distance} metros</span>
                        ) : act.calories ? (
                          <span className="text-orange-400 font-medium">{act.calories} kcal</span>
                        ) : act.distance > 0 ? (
                          <span className="text-indigo-300 font-medium">{act.distance.toFixed(2)} km</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {act.checkInCode ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-300 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-850 max-w-max">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            <span>{act.checkInCode}</span>
                          </div>
                        ) : (
                          <span className="text-slate-650 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center whitespace-nowrap animate-fadeIn">
                        {(() => {
                          const actPhotos = act.photoUrls && act.photoUrls.length > 0
                            ? act.photoUrls
                            : act.photoUrl
                            ? [act.photoUrl]
                            : [];

                          return (
                            <div className="flex items-center justify-center gap-1">
                              {actPhotos.map((pUrl, pIdx) => (
                                <div key={pIdx} className="relative group/tbl shrink-0 z-10">
                                  <div 
                                    onClick={() => setLightboxImage(pUrl)}
                                    className="w-7 h-7 rounded overflow-hidden bg-slate-900 border border-slate-850 hover:border-emerald-500 cursor-zoom-in transition-all relative shrink-0"
                                  >
                                    <img
                                      src={pUrl}
                                      alt={`Foto ${pIdx + 1}`}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/tbl:opacity-100 flex items-center justify-center transition-all">
                                      <Eye className="w-2.5 h-2.5 text-white" />
                                    </div>
                                  </div>
                                  
                                  {/* Delete photo button - only show to owner */}
                                  {isDeletable && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePhoto(act, pIdx)}
                                      className="absolute -top-1 -right-1 bg-red-550 hover:bg-red-650 text-white w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold cursor-pointer transition-all shadow z-20"
                                      title="Remover"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}

                              {/* Add photo button - only show to owner */}
                              {isDeletable && actPhotos.length < 4 && (
                                <label className="cursor-pointer rounded bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-emerald-500/40 text-[10px] text-slate-450 hover:text-emerald-400 transition-all font-bold flex items-center justify-center shrink-0 w-7 h-7" title="Adicionar Foto">
                                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleUploadPhotoFile(act, e)} 
                                    className="hidden" 
                                  />
                                </label>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      {hasDeletableActivity && (
                        <td className="px-4 py-2.5 text-center whitespace-nowrap notranslate" translate="no">
                          {isDeletable ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWithConfirm(act.id);
                              }}
                              className="p-1.5 hover:bg-red-950/40 rounded-lg text-slate-500 hover:text-red-400 transition-all cursor-pointer flex items-center justify-center mx-auto border border-transparent hover:border-red-900/20"
                              title="Excluir Registro"
                            >
                              <Trash2 className="w-4 h-4 text-red-500/80 hover:text-red-400" />
                            </button>
                          ) : (
                            <span className="text-slate-700 text-[10px] font-mono">Fictício</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lightbox / Imagem Ampliada Modal */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden p-2 shadow-2xl animate-scaleIn">
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
              className="absolute top-4 right-4 bg-slate-950/70 hover:bg-slate-950 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm cursor-pointer z-10 border border-white/10"
            >
              ✕
            </button>
            <div className="max-h-[75vh] overflow-hidden rounded-xl flex items-center justify-center bg-slate-950">
              <img
                src={lightboxImage}
                alt="Foto Atividade Ampliada"
                className="max-h-[75vh] w-auto max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-3 text-center text-slate-400 font-mono text-[10px]">
              REGISTRO FOTOGRÁFICO DE COMPROVAÇÃO DE ATIVIDADE
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
