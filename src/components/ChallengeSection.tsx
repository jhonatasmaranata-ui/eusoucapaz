/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Dumbbell, 
  Route, 
  Sparkles, 
  Edit3, 
  Check, 
  Settings, 
  RotateCcw, 
  Medal, 
  Flame, 
  Compass,
  Lock,
  PlusCircle,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { ParticipantScore, Challenge } from '../types';
import { calculateChallengeProgress, ChallengeProgress, isSameAthlete } from '../utils';

interface ChallengeSectionProps {
  athleteName: string | null;
  activeParticipantScore: ParticipantScore | null;
  challenges: Challenge[];
  onSaveChallenge: (challenge: Omit<Challenge, 'id'>) => Promise<void>;
  isLoggedIn: boolean;
  scores: ParticipantScore[];
  isAdmin?: boolean;
  startDate: string;
  endDate?: string;
}

export function ChallengeSection({
  athleteName,
  activeParticipantScore,
  challenges,
  onSaveChallenge,
  isLoggedIn,
  scores,
  isAdmin = false,
  startDate,
  endDate
}: ChallengeSectionProps) {
  // Helper to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Config state
  const [isEditing, setIsEditing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedType, setSelectedType] = useState<'option1' | 'option2' | 'option3' | 'option4' | 'custom'>('option1');
  
  // Custom values fields
  const [customGymDays, setCustomGymDays] = useState(10);
  const [customActivityType, setCustomActivityType] = useState('Corrida');
  const [customValue, setCustomValue] = useState(10);
  const [customMetric, setCustomMetric] = useState<'km' | 'days'>('days');
  const [customActivityDays, setCustomActivityDays] = useState(10);
  const [customActivityKm, setCustomActivityKm] = useState(0);

  // Adicionais para o 2º Cardio Opcional (Terceiro Exercício)
  const [hasSecondCardio, setHasSecondCardio] = useState(false);
  const [secondCardioType, setSecondCardioType] = useState('Pedalada');
  const [secondCardioDays, setSecondCardioDays] = useState(10);
  const [secondCardioKm, setSecondCardioKm] = useState(0);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Confetti/Celebration triggers
  const [showHomenagem, setShowHomenagem] = useState(false);
  const [homenagemDismissedFor, setHomenagemDismissedFor] = useState<string | null>(null);

  // Find challenge for active selected athlete
  const activeChallenge = activeParticipantScore
    ? challenges.find(c => isSameAthlete(c.athleteName, activeParticipantScore.name))
    : undefined;

  // Find challenge for logged-in user
  const myChallenge = athleteName
    ? challenges.find(c => isSameAthlete(c.athleteName, athleteName))
    : undefined;

  // Track if we just completed myChallenge to trigger celebration modal
  useEffect(() => {
    if (activeParticipantScore && activeChallenge && activeParticipantScore.name === athleteName) {
      const prog = calculateChallengeProgress(activeParticipantScore, activeChallenge);
      if (prog.isFullyCompleted && homenagemDismissedFor !== athleteName) {
        setShowHomenagem(true);
      }
    }
  }, [activeChallenge, activeParticipantScore, athleteName, homenagemDismissedFor]);

  // Handle Preset Choice (Sugerindo 10 dias de cada esporte por padrão de acordo com o pedido do usuário)
  const handleSelectPreset = (preset: 'option1' | 'option2' | 'option3' | 'option4' | 'custom') => {
    setSelectedType(preset);
    if (preset === 'option1') {
      setCustomGymDays(10);
      setCustomActivityType('Corrida');
      setCustomValue(10);
      setCustomMetric('days');
      setCustomActivityDays(10);
      setCustomActivityKm(0);
      setHasSecondCardio(false);
    } else if (preset === 'option2') {
      setCustomGymDays(10);
      setCustomActivityType('Caminhada');
      setCustomValue(10);
      setCustomMetric('days');
      setCustomActivityDays(10);
      setCustomActivityKm(0);
      setHasSecondCardio(false);
    } else if (preset === 'option3') {
      setCustomGymDays(10);
      setCustomActivityType('Pedalada');
      setCustomValue(10);
      setCustomMetric('days');
      setCustomActivityDays(10);
      setCustomActivityKm(0);
      setHasSecondCardio(false);
    } else if (preset === 'option4') {
      setCustomGymDays(10);
      setCustomActivityType('Natação');
      setCustomValue(10);
      setCustomMetric('days');
      setCustomActivityDays(10);
      setCustomActivityKm(0);
      setHasSecondCardio(false);
    }
  };

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);
    try {
      const data = {
        type: selectedType,
        targetGymDays: customGymDays,
        targetActivityType: customActivityType,
        targetActivityValue: customActivityDays,
        targetActivityMetric: 'days' as const,
        targetActivityDays: customActivityDays,
        targetActivityKm: customActivityKm,
        athleteName: athleteName || '',
        hasSecondCardio: hasSecondCardio,
        secondCardioType: hasSecondCardio ? secondCardioType : '',
        secondCardioDays: hasSecondCardio ? secondCardioDays : 0,
        secondCardioKm: hasSecondCardio ? secondCardioKm : 0,
      };
      await onSaveChallenge(data);
      setIsEditing(false);
      // Reset celebration state for this configuration
      if (athleteName) {
        setHomenagemDismissedFor(null);
      }
    } catch (error: any) {
      console.error("Erro ao salvar desafio:", error);
      setSaveError(error?.message || "Ocorreu um erro ao salvar o desafio. Verifique sua conexão ou tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Determine what details to display on progress cards
  const renderProgressCard = (score: ParticipantScore, chal: Challenge, isMine: boolean) => {
    const progress = calculateChallengeProgress(score, chal);
    
    // Percentage calculation (max 105% to avoid oversized bars)
    const gymPercent = Math.min(100, Math.round((progress.gymDaysProgress / progress.gymDaysTarget) * 100)) || 0;
    const activityPercent = Math.min(100, Math.round((progress.activityValueProgress / progress.activityValueTarget) * 100)) || 0    // Beautiful human label translation
    let challengeTitle = "Desafio Mensal Especial";
    if (chal.type === 'option1') challengeTitle = "Desafio Treino + Corrida G1";
    if (chal.type === 'option2') challengeTitle = "Desafio Treino + Caminhada G2";
    if (chal.type === 'option3') challengeTitle = "Desafio Treino + Ciclismo G3";
    if (chal.type === 'option4') challengeTitle = "Desafio Treino + Natação G4";
    if (chal.type === 'custom') challengeTitle = "Meta Personalizada Atleta";

    return (
      <div className={`p-5 rounded-2xl border ${
        progress.isFullyCompleted 
          ? 'bg-gradient-to-br from-amber-950/20 to-slate-900 border-amber-500/30 shadow-lg shadow-amber-500/5' 
          : 'bg-slate-900 border-slate-800'
        }`}
        id={`${isMine ? 'my' : 'par'}-challenge-card`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Trophy className={`w-5 h-5 ${progress.isFullyCompleted ? 'text-amber-400 animate-bounce' : 'text-indigo-400'}`} />
            <div>
              <h4 className="text-sm font-bold text-slate-100">{challengeTitle}</h4>
              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                {isMine ? 'Seu Desafio em Consistência' : `Desafio de ${score.name}`}
              </p>
            </div>
          </div>

          {progress.isFullyCompleted ? (
            <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/35 text-[9.5px] font-bold text-amber-400 rounded-full font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              DESAFIO CONCLUÍDO
            </span>
          ) : (
            <span className="px-2.5 py-0.5 bg-slate-950 border border-slate-800 text-[9.5px] font-bold text-slate-400 rounded-full font-mono">
              EM PROGRESSO
            </span>
          )}
        </div>

        {/* Requirements Stats Progress Bars */}
        <div className="mt-5 space-y-4 font-sans">
          
          {/* Gym Requirement */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Dumbbell className="w-3.5 h-3.5 text-red-500" />
                Treino (Musculação/Funcional)
              </span>
              <span className="font-bold text-slate-200">
                {progress.gymDaysProgress} / {progress.gymDaysTarget} dias
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${gymPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  progress.gymCompleted ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-red-500'
                }`}
              />
            </div>
          </div>

          {/* Cardio requirement */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Route className="w-3.5 h-3.5 text-indigo-400" />
                {progress.activityType} (Aeróbico Principal)
              </span>
              <span className="font-bold text-slate-200">
                {progress.cardioDaysProgress} / {progress.cardioDaysTarget} {progress.cardioDaysTarget === 1 ? 'dia' : 'dias'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round(((progress.cardioDaysProgress || 0) / (progress.cardioDaysTarget || 1)) * 100))}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  progress.activityCompleted ? 'bg-gradient-to-r from-indigo-500 to-sky-500' : 'bg-indigo-500'
                }`}
              />
            </div>
            {(progress.cardioKmTarget || 0) > 0 && (
              <p className="text-[10px] text-slate-500 mt-1.5 font-sans leading-relaxed">
                * Cada treino de <strong className="text-slate-400">{progress.activityType}</strong> deve ter pelo menos <strong className="text-indigo-400 font-bold font-mono">{progress.cardioKmTarget} km</strong> para contar como progresso.
              </p>
            )}
          </div>

          {/* Cardio 2 requirement (Terceiro Exercício) */}
          {progress.hasSecondCardio && (
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Route className="w-3.5 h-3.5 text-teal-400" />
                  {progress.secondCardioType} (Aeróbico Extra)
                </span>
                <span className="font-bold text-slate-200">
                  {progress.secondCardioDaysProgress} / {progress.secondCardioDaysTarget} {progress.secondCardioDaysTarget === 1 ? 'dia' : 'dias'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.round(((progress.secondCardioDaysProgress || 0) / (progress.secondCardioDaysTarget || 1)) * 100))}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    progress.secondCardioCompleted ? 'bg-gradient-to-r from-teal-500 to-emerald-400' : 'bg-teal-500'
                  }`}
                />
              </div>
              {(progress.secondCardioKmTarget || 0) > 0 && (
                <p className="text-[10px] text-slate-500 mt-1.5 font-sans leading-relaxed">
                  * Cada treino de <strong className="text-slate-400">{progress.secondCardioType}</strong> deve ter pelo menos <strong className="text-teal-400 font-bold font-mono">{progress.secondCardioKmTarget} km</strong> para contar como progresso.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Celebration Summary Tribute Text if Finished */}
        {progress.isFullyCompleted && (
          <div className="mt-4 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[11px] font-sans leading-relaxed text-amber-300/95 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5 animate-pulse" />
            <div>
              <p>
                <strong>Homenagem de Consistência:</strong> {score.name} atingiu a meta com dedicação fantástica! Parabéns pelo empenho de alto nível! 🚀
              </p>
            </div>
          </div>
        )}

        {/* Edit / New Challenge option for own profile */}
        {isMine && (() => {
          if (showResetConfirm) {
            return (
              <div className="mt-4 pt-3 border-t border-slate-850 space-y-3">
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[11px] text-amber-200/90 leading-relaxed font-sans">
                  ⚠️ <strong className="text-amber-400 font-bold">Aviso de Consistência:</strong> Seu desafio atual ainda está em andamento. Configurar novamente irá substituir sua meta atual por um novo ciclo de desafio iniciado hoje. Deseja prosseguir de qualquer forma?
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="text-[10px] font-mono font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer select-none transition"
                  >
                    Voltar ao Desafio Ativo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetConfirm(false);
                      setSelectedType(chal.type);
                      setCustomGymDays(chal.targetGymDays);
                      setCustomActivityType(chal.targetActivityType);
                      setCustomValue(chal.targetActivityValue);
                      setCustomMetric(chal.targetActivityMetric);
                      setCustomActivityDays(chal.targetActivityDays ?? (chal.targetActivityMetric === 'days' ? chal.targetActivityValue : 5));
                      setCustomActivityKm(chal.targetActivityKm ?? (chal.targetActivityMetric === 'km' ? chal.targetActivityValue : 5.0));
                      setHasSecondCardio(!!chal.hasSecondCardio);
                      setSecondCardioType(chal.secondCardioType || 'Pedalada');
                      setSecondCardioDays(chal.secondCardioDays ?? 10);
                      setSecondCardioKm(chal.secondCardioKm ?? 0);
                      setIsEditing(true);
                    }}
                    className="text-[10px] font-mono font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 px-2.5 py-1 rounded-lg cursor-pointer select-none transition"
                  >
                    Sim, Criar Novo Desafio
                  </button>
                </div>
              </div>
            );
          }

          if (progress.isFullyCompleted) {
            return (
              <div className="mt-4 pt-3 border-t border-slate-850 flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Desafio concluído com sucesso!
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType(chal.type);
                    setCustomGymDays(chal.targetGymDays);
                    setCustomActivityType(chal.targetActivityType);
                    setCustomValue(chal.targetActivityValue);
                    setCustomMetric(chal.targetActivityMetric);
                    setCustomActivityDays(chal.targetActivityDays ?? (chal.targetActivityMetric === 'days' ? chal.targetActivityValue : 5));
                    setCustomActivityKm(chal.targetActivityKm ?? (chal.targetActivityMetric === 'km' ? chal.targetActivityValue : 5.0));
                    setHasSecondCardio(!!chal.hasSecondCardio);
                    setSecondCardioType(chal.secondCardioType || 'Pedalada');
                    setSecondCardioDays(chal.secondCardioDays ?? 10);
                    setSecondCardioKm(chal.secondCardioKm ?? 0);
                    setIsEditing(true);
                  }}
                  className="text-xs font-mono font-bold text-emerald-400 hover:text-white hover:bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition select-none hover:border-emerald-400"
                >
                  <PlusCircle className="w-3 h-3 text-emerald-400" />
                  Configurar Novo Desafio 🚀
                </button>
              </div>
            );
          }

          return (
            <div className="mt-4 pt-3 border-t border-slate-850 flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
              <span className="text-[10px] font-mono text-slate-500">
                Iniciado em {chal.createdAt ? new Date(chal.createdAt).toLocaleDateString('pt-BR') : 'recentemente'}.
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(true);
                }}
                className="text-xs font-mono font-bold text-amber-500 hover:text-white hover:bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5 cursor-pointer transition select-none hover:border-amber-400"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                Criar Outro Desafio
              </button>
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <>
      {/* Período do Ciclo do Desafio */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-slate-350">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
              Ciclo Desafio Ativo
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
              O progresso de todos os atletas é contabilizado exclusivamente dentro desta janela de datas.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-lg bg-slate-950 border border-slate-850 text-amber-400">
            INÍCIO: {formatDate(startDate)}
          </span>
          <div className="w-1.5 h-px bg-slate-700" />
          <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-lg bg-slate-950 border border-slate-850 text-stone-400">
            TÉRMINO: {endDate ? formatDate(endDate) : 'EM ANDAMENTO'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="challenges-section-block">
        
        {/* PART 1: MY OWN CHALLENGE PROGRESS / ONBOARDING */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between">
          {!isLoggedIn ? (
            <div className="text-center py-6">
              <Compass className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-60" />
              <h4 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">Acompanhe Seu Desafio</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto font-sans leading-normal">
                Faça login com sua conta do Google e escolha um atleta para iniciar seu Desafio Mensal e ganhar destaque oficial!
              </p>
            </div>
          ) : !athleteName ? (
            <div className="text-center py-6">
              <Compass className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-60" />
              <h4 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">Cadastro Requerido</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto font-sans leading-normal">
                Verifique ou defina seu apelido de atleta para poder carregar suas metas de progresso!
              </p>
            </div>
          ) : isEditing ? (
            /* CONFIGURATION FORM */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                <span className="text-xs font-bold font-mono text-slate-350 uppercase tracking-widest flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  Escolha Seu Desafio Mensal
                </span>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-[10px] font-mono hover:text-red-400 cursor-pointer text-slate-500"
                >
                  Cancelar
                </button>
              </div>

              {/* Preset Buttons Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-sans font-medium">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('option1')}
                  className={`p-2.5 rounded-xl text-left border cursor-pointer select-none transition ${
                    selectedType === 'option1' 
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <strong className="block text-slate-200">G1: Treino + Corrida</strong>
                  Sugestão: 10 dias de cada
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('option2')}
                  className={`p-2.5 rounded-xl text-left border cursor-pointer select-none transition ${
                    selectedType === 'option2' 
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <strong className="block text-slate-200">G2: Treino + Caminhada</strong>
                  Sugestão: 10 dias de cada
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('option3')}
                  className={`p-2.5 rounded-xl text-left border cursor-pointer select-none transition ${
                    selectedType === 'option3' 
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <strong className="block text-slate-200">G3: Treino + Ciclismo</strong>
                  Sugestão: 10 dias de cada
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('option4')}
                  className={`p-2.5 rounded-xl text-left border cursor-pointer select-none transition ${
                    selectedType === 'option4' 
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <strong className="block text-slate-200">G4: Treino + Natação</strong>
                  Sugestão: 10 dias de cada
                </button>
              </div>

              {/* Always visible values fields for the user to edit as they wish */}
              <div 
                className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-3 pt-3 text-xs font-sans text-slate-350"
              >
                <p className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 border-b border-slate-850 pb-2 flex items-center gap-1">
                  🎯 Ajuste as Metas Quantitativas do Ciclo:
                </p>

                {/* Gym Target Days */}
                <div className="space-y-1">
                  <label className="block text-slate-400 font-mono text-[11px]">Dias de Treino:</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={customGymDays}
                    onChange={(e) => setCustomGymDays(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 text-center py-1.5 font-bold font-mono focus:outline-none focus:border-indigo-500 text-slate-250"
                  />
                </div>

                {/* Cardio Principal */}
                <div className="border-t border-slate-900 pt-2.5 space-y-2.5">
                  <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                    🥇 1º Aeróbico (Principal)
                  </p>
                  
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Tipo de Exercício:</label>
                    <select
                      value={customActivityType}
                      onChange={(e) => setCustomActivityType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-200 font-bold"
                    >
                      <option value="Corrida">Corrida</option>
                      <option value="Caminhada">Caminhada</option>
                      <option value="Pedalada">Pedalada (Ciclismo / Bike)</option>
                      <option value="Natação">Natação</option>
                    </select>
                  </div>

                  {/* Frequency and Distance requirements in columns */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Number of Days (Frequency) */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono text-[11px]">Número de Dias:</label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={customActivityDays}
                        onChange={(e) => setCustomActivityDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 focus:outline-none font-bold font-mono text-center text-slate-200"
                      />
                    </div>

                    {/* Distance in Km */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono text-[11px]">Km Mínimo p/ Treino:</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={customActivityKm}
                        onChange={(e) => setCustomActivityKm(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 focus:outline-none font-bold font-mono text-center text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Terceiro Exercício (Cardio Secundário Opcional) */}
                <div className="border-t border-slate-900 pt-2.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono font-bold text-teal-400 uppercase">
                      🥈 2º Aeróbico (Exercício Extra Opcional)
                    </p>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={hasSecondCardio}
                        onChange={(e) => setHasSecondCardio(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 peer-checked:after:bg-emerald-400 after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-emerald-950/40" />
                      <span className="ml-1.5 text-[9px] font-mono text-slate-450 font-bold uppercase">Ativar</span>
                    </label>
                  </div>

                  {hasSecondCardio && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2.5 pt-1"
                    >
                      <div>
                        <label className="block text-slate-400 mb-1 font-mono text-[11px]">Tipo de Exercício Extra:</label>
                        <select
                          value={secondCardioType}
                          onChange={(e) => setSecondCardioType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-200 font-bold"
                        >
                          <option value="Corrida">Corrida</option>
                          <option value="Caminhada">Caminhada</option>
                          <option value="Pedalada">Pedalada (Ciclismo / Bike)</option>
                          <option value="Natação">Natação</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Number of Days (Frequency) */}
                        <div>
                          <label className="block text-slate-400 mb-1 font-mono text-[11px]">Número de Dias:</label>
                          <input
                            type="number"
                            min={1}
                            max={31}
                            value={secondCardioDays}
                            onChange={(e) => setSecondCardioDays(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 focus:outline-none font-bold font-mono text-center text-slate-200"
                          />
                        </div>

                        {/* Distance in Km */}
                        <div>
                          <label className="block text-slate-400 mb-1 font-mono text-[11px]">Km Mínimo p/ Treino:</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={secondCardioKm}
                            onChange={(e) => setSecondCardioKm(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 focus:outline-none font-bold font-mono text-center text-slate-200"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>

              {/* Error messages if any */}
              {saveError && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300 font-sans text-center leading-normal">
                  ⚠️ {saveError}
                </div>
              )}

              {/* Write Trigger CTA Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold hover:brightness-110 active:scale-[0.99] font-sans text-xs flex justify-center items-center gap-1.5 text-slate-950 transition select-none ${
                  isSaving ? 'opacity-80 cursor-wait' : 'cursor-pointer'
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Salvando Configurações...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Desejo Salvar Este Desafio!
                  </>
                )}
              </button>
            </div>
          ) : myChallenge ? (
            /* MY ACTIVE PROGRESS CARD */
            (() => {
              const myScore = activeParticipantScore?.name === athleteName 
                ? activeParticipantScore 
                : activeParticipantScore; // wait we must compute progress based on my actual activities. Let's find ParticipantScore representing my athleteName
              const myActualScore = leaderboardScoreFor(athleteName);
              if (myActualScore) {
                return renderProgressCard(myActualScore, myChallenge, true);
              }
              // Fallback
              return (
                <div className="text-center py-4 text-slate-400 text-xs font-mono">
                  Calculando seus dados locais de consistência...
                </div>
              );
            })()
          ) : (
            /* GETTING STARTED ONBOARDING INTERFACE (No challenge configured yet) */
            <div className="py-2 flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">Desafio Mensal do Frade</span>
                <h3 className="text-base font-bold text-slate-100 mt-1">Inicie Seu Desafio de Consistência!</h3>
                <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
                  Defina um objetivo focado em sua rotina técnica e outdoor. Escolha uma das 4 metas padrões ou customize de acordo com suas possibilidades e ganhe homenagem oficial ao completar!
                </p>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-sans font-bold text-xs text-center flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Escolher Meu Desafio Mensal 🚀
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PART 2: ACTIVE SELECTED ATHLETE CHALLENGE STATUS */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5" id="peer-challenge-status">
          <div className="mb-4">
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-semibold">Painel Colaborativo</span>
            <h3 className="text-sm font-bold text-slate-200 font-sans mt-1">Status de Desafios de Outros Atletas</h3>
          </div>

          {activeParticipantScore ? (
            activeChallenge ? (
              activeParticipantScore.name === athleteName ? (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-xl border border-slate-850 text-center h-[170px]">
                  <Compass className="w-8 h-8 text-emerald-400 mb-2 animate-pulse" />
                  <p className="text-xs text-emerald-450 font-bold font-mono uppercase">Seu Próprio Desafio</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs font-sans">
                    Você selecionou a si mesmo na tabela de classificação. Suas métricas de consistência estão ativas e sendo monitoradas no card à esquerda!
                  </p>
                </div>
              ) : (
                renderProgressCard(activeParticipantScore, activeChallenge, false)
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-xl border border-slate-850 text-center text-slate-400 h-[170px]">
                <Settings className="w-8 h-8 text-slate-700 mb-2" />
                <h4 className="text-xs font-bold font-mono">Sem Desafio Configurado</h4>
                <p className="text-[10px] text-slate-500 mt-2 max-w-[240px] font-sans">
                  O atleta selecionado <strong className="text-slate-350 notranslate" translate="no">"{activeParticipantScore.name}"</strong> ainda não iniciou ou configurou um Desafio Mensal para o período letivo ativo de consistência.
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-xl border border-slate-850 text-center text-slate-400 h-[170px]">
              <Compass className="w-8 h-8 text-slate-700 mb-2" />
              <h4 className="text-xs font-bold font-mono">Selecione um Atleta</h4>
              <p className="text-[10px] text-slate-500 mt-1.5 max-w-[240px] font-sans">
                Clique sobre qualquer atleta na Classificação do Desafio para carregar o progresso do seu respectivo Desafio Mensal.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* HOMENAGEM / CELEBRATION MODAL OVERLAY */}
      <AnimatePresence>
        {showHomenagem && activeParticipantScore && activeChallenge && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            id="homenagem-challenge-modal"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-amber-500/10 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
              
              {/* Gold Ring & Crown Visuals */}
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 relative">
                <Trophy className="w-10 h-10 text-amber-400 animate-pulse" />
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-300 animate-bounce" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-center gap-1.5 font-sans">
                👑 HOMENAGEM COLETIVA AO MÉRITO!
              </h2>
              
              <div className="mt-4 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 font-sans">
                <p>
                  A comunidade do Desafio de Consistência presta esta homenagem especial ao atleta fantástico:
                </p>
                <p className="text-base font-extrabold text-white notranslate" translate="no">
                   ⭐ {athleteName} ⭐
                </p>
                <p className="text-xs text-slate-400 italic">
                  "Desafio Mensal Concluído com Sucesso!"
                </p>
                
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 space-y-2 text-left text-xs font-mono my-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Meta de Treino:</span>
                    <span className="text-red-400 font-bold">100% ({activeChallenge.targetGymDays}/{activeChallenge.targetGymDays} dias)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Exigência Cardio {activeChallenge.targetActivityType}:</span>
                    <span className="text-indigo-400 font-bold font-mono">
                      {typeof activeChallenge.targetActivityDays === 'number' 
                        ? `100% (${activeChallenge.targetActivityDays} dias ${
                            activeChallenge.targetActivityKm ? `de no mínimo ${activeChallenge.targetActivityKm} km` : ''
                          })` 
                        : `100% (${activeChallenge.targetActivityValue} ${activeChallenge.targetActivityMetric})`
                      }
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  O aplicativo coroou seu perfil! Agora, você possui uma estrela de campeão e realce dourado ao lado do seu nome em destaque no nosso Ranking Geral de Atletas!
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowHomenagem(false);
                  if (athleteName) {
                    setHomenagemDismissedFor(athleteName);
                  }
                }}
                className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold hover:shadow-lg hover:shadow-amber-500/10 rounded-xl transition duration-200 ease-out font-sans cursor-pointer flex justify-center items-center gap-1.5 text-xs text-semibold"
              >
                Concluir Homenagem e Ver Placar ⭐
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Helper to map out matching scores for athlete
  function leaderboardScoreFor(name: string): ParticipantScore | null {
    if (!name) return null;
    const existingScore = scores.find(s => isSameAthlete(s.name, name));
    if (existingScore) return existingScore;

    // Create a 0-progress fallback score so new users see their progress immediately upon creation!
    return {
      name: name,
      rank: scores.length + 1,
      gymPoints: 0,
      distancePoints: 0,
      comboPoints: 0,
      totalPoints: 0,
      totalDistance: 0,
      totalWorkouts: 0,
      activities: []
    };
  }
}
