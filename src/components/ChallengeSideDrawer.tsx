/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  PlusCircle, 
  UserPlus, 
  Share2, 
  Layers, 
  Compass, 
  Check, 
  Info, 
  Lock, 
  Calendar, 
  User, 
  Sliders, 
  AlertCircle,
  Copy,
  ChevronRight,
  ChevronLeft,
  LogOut,
  X,
  Rocket,
  Star,
  Flag,
  HelpCircle,
  Trophy,
  ArrowLeft
} from 'lucide-react';
import { GroupChallenge, RuleConfig, GroupMember } from '../types';
import { extractGroupCode } from '../utils';

interface ChallengeSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  athleteName: string | null;
  activeGroup: GroupChallenge | null;
  userGroups: { id: string; name: string }[];
  groupMembers: GroupMember[];
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: (name: string, description: string, rules: RuleConfig) => Promise<string>;
  onJoinGroup: (inviteCode: string) => Promise<boolean>;
  onUpdateGroupRules: (rules: RuleConfig) => Promise<void>;
  onLeaveGroup?: (groupId: string) => void;
  onRemoveMember?: (userId: string) => Promise<void>;
  onStartTraining?: () => void;
}

type DrawerViewMode = 'main' | 'create' | 'join' | 'details' | 'configure' | 'help' | 'about' | 'history';

export function ChallengeSideDrawer({
  isOpen,
  onClose,
  user,
  athleteName,
  activeGroup,
  userGroups,
  groupMembers,
  onSelectGroup,
  onCreateGroup,
  onJoinGroup,
  onUpdateGroupRules,
  onLeaveGroup,
  onRemoveMember,
  onStartTraining
}: ChallengeSideDrawerProps) {
  const [viewMode, setViewMode] = useState<DrawerViewMode>('main');
  const [selectedGroupForDetails, setSelectedGroupForDetails] = useState<GroupChallenge | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmKickId, setConfirmKickId] = useState<string | null>(null);
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);

  // Form states
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [gymPoints, setGymPoints] = useState(5);
  const [distanceMult, setDistanceMult] = useState(1);
  const [comboPoints, setComboPoints] = useState(10);

  // Configuration Edit States
  const [editGymPoints, setEditGymPoints] = useState(5);
  const [editDistanceMult, setEditDistanceMult] = useState(1);
  const [editComboPoints, setEditComboPoints] = useState(10);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  // Status and loading messages
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize edit states when activeGroup changes
  useEffect(() => {
    if (activeGroup) {
      setEditGymPoints(activeGroup.rules.gymPointsPerCheckIn);
      setEditDistanceMult(activeGroup.rules.distanceMultiplier);
      setEditComboPoints(activeGroup.rules.comboPointsPerDay);
      setEditStartDate(activeGroup.rules.startDate);
      setEditEndDate(activeGroup.rules.endDate || '');
    }
  }, [activeGroup]);

  // Reset states on drawer close or mode change
  useEffect(() => {
    if (!isOpen) {
      setViewMode('main');
      setStatusMsg(null);
    }
  }, [isOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteName) {
      setStatusMsg({ type: 'error', text: 'Você precisa registrar um nome de atleta para criar um grupo.' });
      return;
    }
    if (!groupName.trim()) {
      setStatusMsg({ type: 'error', text: 'Informe um nome de desafio válido.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const newGroupId = await onCreateGroup(groupName.trim(), groupDesc.trim(), {
        startDate,
        endDate: endDate || '',
        gymPointsPerCheckIn: Number(gymPoints),
        distanceMultiplier: Number(distanceMult),
        comboPointsPerDay: Number(comboPoints)
      });
      setStatusMsg({ type: 'success', text: `Desafio "${groupName}" criado com sucesso!\nCódigo de convite: ${newGroupId}` });
      setGroupName('');
      setGroupDesc('');
      setTimeout(() => {
        setViewMode('main');
        setStatusMsg(null);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Falha ao criar o grupo de desafio.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteName) {
      setStatusMsg({ type: 'error', text: 'Registre seu nome de atleta antes de entrar em grupos.' });
      return;
    }
    if (!joinCode.trim()) {
      setStatusMsg({ type: 'error', text: 'Insira um código de convite.' });
      return;
    }

    const codeToJoin = extractGroupCode(joinCode);
    if (!codeToJoin) {
      setStatusMsg({ type: 'error', text: 'Código de convite ou URL inválido.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const success = await onJoinGroup(codeToJoin);
      if (success) {
        setStatusMsg({ type: 'success', text: 'Você entrou no desafio com sucesso!' });
        setJoinCode('');
        setTimeout(() => {
          setViewMode('main');
          setStatusMsg(null);
        }, 1500);
      } else {
        setStatusMsg({ type: 'error', text: 'Código de convite inválido ou erro de conexão.' });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Grupo não encontrado ou você já participa dele.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;

    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      await onUpdateGroupRules({
        startDate: editStartDate,
        endDate: editEndDate || '',
        gymPointsPerCheckIn: Number(editGymPoints),
        distanceMultiplier: Number(editDistanceMult),
        comboPointsPerDay: Number(editComboPoints)
      });
      setStatusMsg({ type: 'success', text: 'Configurações atualizadas com sucesso!' });
      setTimeout(() => {
        setViewMode('main');
        setStatusMsg(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Erro ao atualizar as regras.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (groupId: string) => {
    const inviteLink = `https://eusoucapaz.vercel.app/?group=${groupId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getUserInitials = () => {
    const name = athleteName || user?.displayName || user?.email || 'Atleta';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  };

  const getProfileName = () => {
    return athleteName || user?.displayName || 'Atleta Anônimo';
  };

  const isDemoActive = activeGroup?.id === 'demo-group' || !activeGroup;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="challenge-side-drawer-root">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Sliding Panel (from the left, matching the native mobile drawer) */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-y-0 left-0 max-w-[340px] w-full bg-slate-950 text-slate-100 border-r border-slate-900/80 flex flex-col shadow-2xl h-full z-10 font-sans"
          >
            {/* Top Close Button (for desktop/clean navigation) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-full transition cursor-pointer z-20"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header Block */}
            <div className="p-6 pt-10 border-b border-slate-900 flex flex-col items-start gap-3 bg-slate-900/20">
              <div className="flex items-center gap-4 w-full">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Perfil" 
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-red-500 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                    {getUserInitials()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-base text-slate-100 truncate leading-tight">
                    {getProfileName()}
                  </h3>
                  <p className="text-xs text-slate-450 mt-0.5 truncate">
                    {user?.email || 'Atleta Local'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Content Views */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              
              {/* VIEW: MAIN MENU */}
              {viewMode === 'main' && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Huge CTA: COMEÇAR */}
                  <button
                    onClick={() => {
                      if (onStartTraining) onStartTraining();
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 px-5 bg-[#e03a3a] hover:bg-[#c92f2f] text-white font-extrabold text-sm rounded-full shadow-lg shadow-red-500/20 active:translate-y-px transition-all cursor-pointer"
                  >
                    <Rocket className="w-5 h-5 text-white animate-pulse" />
                    <span>Começar Treino / Cárdio</span>
                  </button>

                  <div className="h-[1px] bg-slate-900 my-2" />

                  {/* Menu List */}
                  <div className="space-y-1">
                    
                    {/* OBTER PRO/CONQUISTAS */}
                    <button
                      onClick={() => setViewMode('help')}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-slate-900 rounded-2xl text-left text-slate-300 font-bold text-sm transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <Star className="w-5 h-5 text-amber-500" />
                        <span>Regras & Conquistas</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    {/* GENERAL GLOBAL CHALLENGE (MENSAL) */}
                    <button
                      onClick={() => {
                        onSelectGroup('demo-group');
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left text-sm transition cursor-pointer ${
                        isDemoActive 
                          ? 'bg-slate-900 text-amber-500 font-black' 
                          : 'hover:bg-slate-900 text-slate-300 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Compass className={`w-5 h-5 ${isDemoActive ? 'text-red-500' : 'text-slate-500'}`} />
                        <span>Desafio Público Geral (Mensal)</span>
                      </div>
                      {isDemoActive && <span className="text-[10px] bg-red-950/50 text-red-400 border border-red-900/45 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Ativo</span>}
                    </button>

                    {/* PRIVATE ACTIVE CHALLENGES */}
                    <div className="pt-2">
                      <div className="px-3.5 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Grupos Particulares
                      </div>
                      
                      {userGroups.length === 0 ? (
                        <p className="px-3.5 py-2 text-xs text-slate-500 italic font-medium">Nenhum grupo particular</p>
                      ) : (
                        <div className="space-y-0.5">
                          {userGroups.map((g) => {
                            const isThisActive = activeGroup?.id === g.id;
                            return (
                              <div key={g.id} className="flex items-center justify-between rounded-2xl overflow-hidden hover:bg-slate-900">
                                <button
                                  onClick={() => {
                                    onSelectGroup(g.id);
                                    onClose();
                                  }}
                                  className={`flex-1 flex items-center gap-3.5 p-3.5 text-left text-sm transition cursor-pointer ${
                                    isThisActive ? 'text-amber-500 font-black' : 'text-slate-300 font-bold'
                                  }`}
                                >
                                  <Trophy className={`w-5 h-5 ${isThisActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                                  <span className="truncate">{g.name}</span>
                                  {isThisActive && (
                                    <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900/50 font-extrabold px-1.5 py-0.5 rounded-md uppercase">Ativo</span>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedGroupForDetails(activeGroup?.id === g.id ? activeGroup : null);
                                    setViewMode('details');
                                  }}
                                  className="p-3 text-slate-400 hover:text-slate-200 cursor-pointer transition"
                                  title="Ver integrantes e código"
                                >
                                  <Info className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="h-[1px] bg-slate-900 my-2" />

                    {/* CREATE GROUP */}
                    <button
                      onClick={() => {
                        setViewMode('create');
                        setStatusMsg(null);
                      }}
                      className="w-full flex items-center gap-3.5 p-3.5 hover:bg-slate-900 rounded-2xl text-left text-slate-300 font-bold text-sm transition cursor-pointer"
                    >
                      <PlusCircle className="w-5 h-5 text-slate-550" />
                      <span>Criar grupo</span>
                    </button>

                    {/* JOIN GROUP */}
                    <button
                      onClick={() => {
                        setViewMode('join');
                        setStatusMsg(null);
                      }}
                      className="w-full flex items-center gap-3.5 p-3.5 hover:bg-slate-900 rounded-2xl text-left text-slate-300 font-bold text-sm transition cursor-pointer"
                    >
                      <UserPlus className="w-5 h-5 text-slate-550" />
                      <span>Juntar-se ao grupo</span>
                    </button>

                    {/* CONCLUDE/HISTORY */}
                    <button
                      onClick={() => setViewMode('history')}
                      className="w-full flex items-center gap-3.5 p-3.5 hover:bg-slate-900 rounded-2xl text-left text-slate-300 font-bold text-sm transition cursor-pointer"
                    >
                      <Flag className="w-5 h-5 text-slate-550" />
                      <span>Desafios concluídos</span>
                    </button>

                    {/* CONFIGURE CURRENT CHALLENGE RULES (creator only) */}
                    {activeGroup && activeGroup.id !== 'demo-group' && (user?.email === 'jhonatasmaranata@gmail.com' || activeGroup.creatorId === user?.uid || activeGroup.creatorId === 'local_proxy') && (
                      <button
                        onClick={() => {
                          setViewMode('configure');
                          setStatusMsg(null);
                        }}
                        className="w-full flex items-center gap-3.5 p-3.5 hover:bg-slate-900 rounded-2xl text-left text-slate-300 font-bold text-sm transition cursor-pointer"
                      >
                        <Sliders className="w-5 h-5 text-slate-550" />
                        <span>Configurações do Desafio</span>
                      </button>
                    )}

                    {/* HELP & FEEDBACK */}
                    <button
                      onClick={() => setViewMode('help')}
                      className="w-full flex items-center gap-3.5 p-3.5 hover:bg-slate-900 rounded-2xl text-left text-slate-300 font-bold text-sm transition cursor-pointer"
                    >
                      <HelpCircle className="w-5 h-5 text-slate-550" />
                      <span>Ajuda & feedback</span>
                    </button>

                    {/* ABOUT */}
                    <button
                      onClick={() => setViewMode('about')}
                      className="w-full flex items-center gap-3.5 p-3.5 hover:bg-slate-900 rounded-2xl text-left text-slate-300 font-bold text-sm transition cursor-pointer"
                    >
                      <Info className="w-5 h-5 text-slate-550" />
                      <span>Sobre</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW: CREATE GROUP */}
              {viewMode === 'create' && (
                <div className="space-y-4 animate-fadeIn p-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                    <button onClick={() => setViewMode('main')} className="p-1 hover:bg-slate-900 rounded-full cursor-pointer text-slate-400 hover:text-slate-200 transition">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-extrabold text-base text-slate-100">Criar Novo Desafio</h4>
                  </div>

                  {statusMsg && (
                    <div className={`p-3 rounded-xl flex items-start gap-2.5 text-xs ${statusMsg.type === 'success' ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-300' : 'bg-red-950/40 border border-red-900/40 text-red-300'}`}>
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-normal whitespace-pre-line font-medium">{statusMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Título do Desafio</label>
                      <input
                        type="text"
                        required
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Ex: Desafio Trincando 30 Dias"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-red-500 focus:bg-slate-850 transition placeholder-slate-650"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Descrição / Regras Básicas</label>
                      <textarea
                        value={groupDesc}
                        onChange={(e) => setGroupDesc(e.target.value)}
                        placeholder="Ex: Grupo focado em manter a galera unida do treino. Proibido furos!"
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-red-500 focus:bg-slate-850 transition placeholder-slate-650"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">📅 Início</label>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-red-500 focus:bg-slate-850 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">🏁 Término</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-red-500 focus:bg-slate-850 transition"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-4 border border-slate-850 rounded-2xl space-y-3 mt-2">
                      <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block pb-1 border-b border-slate-800">🎯 Regras de Pontuação</span>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium">🏋️ Gym Check-in</span>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={gymPoints}
                            onChange={(e) => setGymPoints(Number(e.target.value) || 5)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-red-500 focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium">🏃 Multiplicador Cardio</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="10"
                            value={distanceMult}
                            onChange={(e) => setDistanceMult(Number(e.target.value) || 1)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-indigo-400 focus:outline-none focus:border-indigo-550"
                          />
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium">🔥 Bônus Combo Diário</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={comboPoints}
                            onChange={(e) => setComboPoints(Number(e.target.value) || 10)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-amber-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-[#e03a3a] hover:bg-[#c92f2f] text-white font-extrabold text-xs rounded-full cursor-pointer transition shadow-md uppercase tracking-wider mt-4"
                    >
                      {isSubmitting ? 'Processando...' : 'Criar Desafio'}
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW: JOIN GROUP */}
              {viewMode === 'join' && (
                <div className="space-y-4 animate-fadeIn p-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                    <button onClick={() => setViewMode('main')} className="p-1 hover:bg-slate-900 rounded-full cursor-pointer text-slate-400 hover:text-slate-200 transition">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-extrabold text-base text-slate-100">Entrar em um Desafio</h4>
                  </div>

                  {statusMsg && (
                    <div className={`p-3 rounded-xl flex items-start gap-2.5 text-xs ${statusMsg.type === 'success' ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-300' : 'bg-red-950/40 border border-red-900/40 text-red-300'}`}>
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-normal font-medium">{statusMsg.text}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Insira o código do desafio fornecido pelo criador do grupo ou cole o link de convite completo.
                  </p>

                  <form onSubmit={handleJoin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Código do Desafio</label>
                      <input
                        type="text"
                        required
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="Ex: XYZ890"
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 font-mono text-center font-bold text-lg text-slate-100 uppercase focus:outline-none focus:border-amber-500 focus:bg-slate-850 transition placeholder-slate-600"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-[#e03a3a] hover:bg-[#c92f2f] text-white font-extrabold text-xs rounded-full cursor-pointer transition shadow-md uppercase tracking-wider font-sans"
                    >
                      {isSubmitting ? 'Processando...' : 'Entrar no Desafio'}
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW: GROUP DETAILS & ROSTER */}
              {viewMode === 'details' && (
                <div className="space-y-4 animate-fadeIn p-2">
                  {(() => {
                    // Decide which group is shown. If we loaded a specific group, use that. Otherwise fallback to activeGroup.
                    const group = selectedGroupForDetails || activeGroup;
                    if (!group || group.id === 'demo-group') {
                      return (
                        <div className="text-center py-6">
                          <p className="text-xs text-slate-500 italic">Selecione um grupo particular para ver os detalhes.</p>
                          <button onClick={() => setViewMode('main')} className="mt-3 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-full cursor-pointer transition">Voltar</button>
                        </div>
                      );
                    }

                    const isUserCreator = user && (user.email === 'jhonatasmaranata@gmail.com' || group.creatorId === user.uid || group.creatorId === 'local_proxy');

                    return (
                      <>
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                          <button onClick={() => { setSelectedGroupForDetails(null); setViewMode('main'); }} className="p-1 hover:bg-slate-900 rounded-full cursor-pointer text-slate-400 hover:text-slate-200 transition">
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-base text-slate-100 truncate leading-snug">{group.name}</h4>
                            <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono">ID: {group.id}</span>
                          </div>
                        </div>

                        {group.description && (
                          <div className="bg-slate-900/60 p-3.5 border border-slate-850 rounded-2xl">
                            <p className="text-xs text-slate-400 leading-normal font-sans italic">“{group.description}”</p>
                          </div>
                        )}

                        {/* Invite link & copy */}
                        <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Código de Convite</span>
                          <strong className="text-lg text-amber-400 font-mono tracking-widest uppercase font-black">{group.id}</strong>
                          <div className="flex gap-2 w-full mt-1">
                            <button
                              onClick={() => handleCopyLink(group.id)}
                              className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                            >
                              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Members Roster */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Integrantes ({groupMembers.length})</span>
                          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                            {groupMembers.map((m, i) => {
                              const isSelf = user && m.userId === user.uid;
                              const isKicking = confirmKickId === m.userId;
                              return (
                                <div key={m.userId || i} className="flex items-center justify-between p-2 hover:bg-slate-900 border border-slate-900/80 rounded-xl transition">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {m.photoURL ? (
                                      <img src={m.photoURL} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                                    ) : (
                                      <div className="w-7 h-7 bg-red-950/45 text-red-400 border border-red-900/30 flex items-center justify-center rounded-full text-xs font-bold shrink-0">
                                        {m.athleteName[0].toUpperCase()}
                                      </div>
                                    )}
                                    <span className="text-xs text-slate-200 font-semibold truncate">
                                      {m.athleteName} {isSelf && <span className="text-[9px] text-indigo-400 font-mono font-bold">(Você)</span>}
                                    </span>
                                  </div>

                                  {!isKicking ? (
                                    isUserCreator && !isSelf && onRemoveMember && (
                                      <button
                                        onClick={() => setConfirmKickId(m.userId)}
                                        className="text-[10px] text-red-400 hover:text-red-300 font-bold px-2 py-1 hover:bg-red-950 rounded-lg transition"
                                      >
                                        Excluir
                                      </button>
                                    )
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={async () => {
                                          if (onRemoveMember) {
                                            try {
                                              await onRemoveMember(m.userId);
                                            } catch (err: any) {
                                              alert("Erro ao excluir.");
                                            } finally {
                                              setConfirmKickId(null);
                                            }
                                          }
                                        }}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[9px] rounded"
                                      >
                                        Sim
                                      </button>
                                      <button
                                        onClick={() => setConfirmKickId(null)}
                                        className="px-2 py-1 bg-slate-800 text-slate-300 font-bold text-[9px] rounded"
                                      >
                                        Não
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Leave Group Button */}
                        {onLeaveGroup && (
                          <div className="pt-2 border-t border-slate-900">
                            {confirmLeaveId === group.id ? (
                              <div className="p-3 bg-red-950/40 border border-red-900/40 rounded-2xl flex flex-col items-center gap-2 text-center">
                                <span className="text-xs text-red-200 font-bold">Deseja realmente sair deste desafio?</span>
                                <div className="flex gap-2 w-full">
                                  <button
                                    onClick={() => {
                                      onLeaveGroup(group.id);
                                      setConfirmLeaveId(null);
                                      setViewMode('main');
                                    }}
                                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                                  >
                                    Sair do Grupo
                                  </button>
                                  <button
                                    onClick={() => setConfirmLeaveId(null)}
                                    className="flex-1 py-2 bg-slate-900 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmLeaveId(group.id)}
                                className="w-full py-2.5 bg-red-950/45 hover:bg-red-950/80 text-red-400 border border-red-900/40 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                              >
                                <LogOut className="w-4 h-4" />
                                <span>Sair do Desafio</span>
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* VIEW: CONFIGURE GROUP RULES (creator only) */}
              {viewMode === 'configure' && (
                <div className="space-y-4 animate-fadeIn p-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                    <button onClick={() => setViewMode('main')} className="p-1 hover:bg-slate-900 rounded-full cursor-pointer text-slate-400 hover:text-slate-200 transition">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-extrabold text-base text-slate-100">Editar Regras do Desafio</h4>
                  </div>

                  {statusMsg && (
                    <div className={`p-3 rounded-xl flex items-start gap-2.5 text-xs ${statusMsg.type === 'success' ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-300' : 'bg-red-950/40 border border-red-900/40 text-red-300'}`}>
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-normal font-medium">{statusMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateRules} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">📅 Início</label>
                        <input
                          type="date"
                          required
                          value={editStartDate}
                          onChange={(e) => setEditStartDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-red-500 focus:bg-slate-850 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">🏁 Término</label>
                        <input
                          type="date"
                          value={editEndDate}
                          onChange={(e) => setEditEndDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-red-500 focus:bg-slate-850 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 p-4 bg-slate-900/60 border border-slate-850 rounded-2xl">
                      <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block pb-1 border-b border-slate-800">Ajustar Pontuações</span>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <span className="text-xs text-slate-300 font-bold block">🏋️ Check-in de Academia</span>
                            <span className="text-[10px] text-slate-500">Pontos por musculação/pilates/luta</span>
                          </div>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={editGymPoints}
                            onChange={(e) => setEditGymPoints(Number(e.target.value) || 5)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-red-500 focus:outline-none focus:border-red-500"
                          />
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <span className="text-xs text-slate-300 font-bold block">🏃 Multiplicador Cardio</span>
                            <span className="text-[10px] text-slate-500">Pontos por km de corrida/caminhada</span>
                          </div>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="10"
                            value={editDistanceMult}
                            onChange={(e) => setEditDistanceMult(Number(e.target.value) || 1)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-indigo-400 focus:outline-none focus:border-indigo-550"
                          />
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <span className="text-xs text-slate-300 font-bold block">🔥 Bônus Combo Diário</span>
                            <span className="text-[10px] text-slate-500">Pontos extras por dia musculação + cardio</span>
                          </div>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editComboPoints}
                            onChange={(e) => setEditComboPoints(Number(e.target.value) || 10)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-amber-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-[#e03a3a] hover:bg-[#c92f2f] text-white font-extrabold text-xs rounded-full cursor-pointer transition shadow-md uppercase tracking-wider"
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW: HELP / SCORING RULES */}
              {viewMode === 'help' && (
                <div className="space-y-4 animate-fadeIn p-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                    <button onClick={() => setViewMode('main')} className="p-1 hover:bg-slate-900 rounded-full cursor-pointer text-slate-400 hover:text-slate-200 transition">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-extrabold text-base text-slate-100">Regras e Pontuação</h4>
                  </div>

                  <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed font-sans">
                    <p>
                      O <strong>Eu Sou Capaz</strong> estimula a consistência física recompensando seus treinos de musculação e cárdio com pontuações justas:
                    </p>

                    <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-2xl space-y-1">
                      <span className="font-extrabold text-red-400 flex items-center gap-1.5">
                        🏋️ Musculação ou Pilates
                      </span>
                      <p className="text-red-350 text-[11px]">
                        Garante os pontos base configurados no desafio (padrão: <strong>5 pontos</strong>). Limite de 1 check-in por dia.
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-2xl space-y-1">
                      <span className="font-extrabold text-indigo-400 flex items-center gap-1.5">
                        🏃 Cárdio ao Ar Livre ou Esteira
                      </span>
                      <p className="text-indigo-350 text-[11px]">
                        A quilometragem é multiplicada pela taxa configurada. Por padrão, <strong>1 km de corrida = 1 ponto</strong>.
                      </p>
                    </div>

                    <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-2xl space-y-1">
                      <span className="font-extrabold text-amber-500 flex items-center gap-1.5">
                        🔥 Bônus Combo Diário
                      </span>
                      <p className="text-amber-400/90 text-[11px]">
                        Treinar musculação e fazer cardio de distância no mesmo dia dá um bônus de combo incrível (padrão: <strong>10 pontos extras</strong>)!
                      </p>
                    </div>

                    <p className="pt-1 text-[11px] text-slate-500">
                      Caso o grupo utilize integração com o Strava, as atividades esportivas são atualizadas e computadas automaticamente de forma transparente.
                    </p>
                  </div>
                </div>
              )}

              {/* VIEW: ABOUT */}
              {viewMode === 'about' && (
                <div className="space-y-4 animate-fadeIn p-2 text-center">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-900 text-left">
                    <button onClick={() => setViewMode('main')} className="p-1 hover:bg-slate-900 rounded-full cursor-pointer text-slate-400 hover:text-slate-200 transition">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-extrabold text-base text-slate-100 font-sans">Sobre o Aplicativo</h4>
                  </div>

                  <div className="pt-6 space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-red-500 to-rose-600 rounded-3xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg mx-auto transform rotate-6 hover:rotate-12 transition-transform">
                      ESC
                    </div>
                    <div>
                      <h5 className="font-black text-lg text-slate-200 font-sans">Eu Sou Capaz</h5>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mt-0.5">Versão 3.5 • Estável</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto font-sans">
                    Desenvolvido para incentivar comunidades próximas e atletas individuais a manterem a consistência física diária por meio de gamificação e união.
                  </p>

                  <div className="pt-6 text-[10px] text-slate-550 font-mono">
                    Construído com React, Tailwind CSS e Firebase Firestore
                  </div>
                </div>
              )}

              {/* VIEW: HISTORY / CONCLUDED */}
              {viewMode === 'history' && (
                <div className="space-y-4 animate-fadeIn p-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                    <button onClick={() => setViewMode('main')} className="p-1 hover:bg-slate-900 rounded-full cursor-pointer text-slate-400 hover:text-slate-200 transition">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-extrabold text-base text-slate-100 font-sans">Desafios Concluídos</h4>
                  </div>

                  <div className="text-center py-8 space-y-3 bg-slate-900/40 border border-slate-900 rounded-2xl">
                    <div className="w-12 h-12 bg-slate-950 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-850">
                      <Flag className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 font-sans">Sem histórico no momento</h5>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-[200px] mx-auto font-sans">
                        Seus desafios passados e encerrados ficarão listados aqui quando expirarem.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Footer Credits */}
            <div className="p-4 border-t border-slate-900 bg-slate-950 text-center text-[10px] text-slate-500 font-mono">
              Eu Sou Capaz • Todo Treino Conta!
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
