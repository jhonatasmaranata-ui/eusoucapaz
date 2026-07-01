/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ArrowLeft,
  Camera,
  Edit2
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
  onUpdateProfile?: (newName: string, newPhoto: string | null) => Promise<void>;
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
  onStartTraining,
  onUpdateProfile
}: ChallengeSideDrawerProps) {
  const [viewMode, setViewMode] = useState<DrawerViewMode>('main');
  const isCreator = activeGroup && (user?.email === 'jhonatasmaranata@gmail.com' || activeGroup.creatorId === user?.uid || activeGroup.creatorId === 'local_proxy');
  
  const formatMultiplier = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return '0';
    const rounded = Math.round(num * 10000) / 10000;
    return rounded.toString().replace('.', ',');
  };

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
  const [gymPoints, setGymPoints] = useState<number | string>(5);
  const [distanceMult, setDistanceMult] = useState<number | string>(1);
  const [comboPoints, setComboPoints] = useState<number | string>(10);

  // Configuration Edit States
  const [editGymPoints, setEditGymPoints] = useState<number | string>(5);
  const [editDistanceMult, setEditDistanceMult] = useState<number | string>(1);
  const [editComboPoints, setEditComboPoints] = useState<number | string>(10);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editCorridaMultiplier, setEditCorridaMultiplier] = useState<number | string>(1.0);
  const [editCiclismoMultiplier, setEditCiclismoMultiplier] = useState<number | string>(0.3);
  const [editNatacaoMultiplier, setEditNatacaoMultiplier] = useState<number | string>(4.0);
  const [editCaminhadaMultiplier, setEditCaminhadaMultiplier] = useState<number | string>(1.0);

  // Status and loading messages
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfilePhoto, setEditProfilePhoto] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Computed states to retrieve group metadata (including rules and end dates)
  const localGroupsData = useMemo(() => {
    try {
      const raw = localStorage.getItem('local_groups_data');
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }, [userGroups]);

  const isGroupFinished = useCallback((g: { id: string; name: string }) => {
    if (g.id === '99H0DP') {
      const todayStr = new Date().toISOString().split('T')[0];
      return todayStr > '2026-06-11';
    }
    
    const groupDetail = localGroupsData[g.id];
    const endDateStr = groupDetail?.rules?.endDate;
    if (!endDateStr) return false;

    const parts = endDateStr.split('-');
    if (parts.length !== 3) return false;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const target = new Date(year, month, day);
    const today = new Date();

    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return today.getTime() > target.getTime();
  }, [localGroupsData]);

  const activePrivateGroups = useMemo(() => {
    return userGroups.filter(g => !isGroupFinished(g));
  }, [userGroups, isGroupFinished]);

  const concludedPrivateGroups = useMemo(() => {
    return userGroups.filter(g => isGroupFinished(g));
  }, [userGroups, isGroupFinished]);

  // Sync profile editing states on mount/open
  useEffect(() => {
    if (isOpen) {
      setEditProfileName(athleteName || user?.displayName || '');
      setEditProfilePhoto(null);
      setIsEditingProfile(false);
      setProfileError(null);
    }
  }, [isOpen, athleteName, user]);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        let maxDim = 150; 
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
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        setEditProfilePhoto(dataUrl);
        setProfileError(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Synchronize edit states when activeGroup changes
  useEffect(() => {
    if (activeGroup) {
      setEditGymPoints(activeGroup.rules.gymPointsPerCheckIn);
      setEditDistanceMult(activeGroup.rules.distanceMultiplier);
      setEditComboPoints(activeGroup.rules.comboPointsPerDay);
      setEditStartDate(activeGroup.rules.startDate);
      setEditEndDate(activeGroup.rules.endDate || '');
      
      const distMult = activeGroup.rules.distanceMultiplier;
      setEditCorridaMultiplier(activeGroup.rules.corridaMultiplier ?? 1.0 * distMult);
      setEditCaminhadaMultiplier(activeGroup.rules.caminhadaMultiplier ?? 1.0 * distMult);
      setEditCiclismoMultiplier(activeGroup.rules.ciclismoMultiplier ?? 0.3 * distMult);
      setEditNatacaoMultiplier(activeGroup.rules.natacaoMultiplier ?? 4.0 * distMult);
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
        gymPointsPerCheckIn: gymPoints === '' ? 5 : Number(gymPoints),
        distanceMultiplier: distanceMult === '' ? 1 : Number(distanceMult),
        comboPointsPerDay: comboPoints === '' ? 10 : Number(comboPoints)
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
        gymPointsPerCheckIn: editGymPoints === '' ? 5 : Number(editGymPoints),
        distanceMultiplier: editDistanceMult === '' ? 1 : Number(editDistanceMult),
        comboPointsPerDay: editComboPoints === '' ? 10 : Number(editComboPoints),
        corridaMultiplier: editCorridaMultiplier === '' ? 1.0 : Number(editCorridaMultiplier),
        ciclismoMultiplier: editCiclismoMultiplier === '' ? 0.3 : Number(editCiclismoMultiplier),
        natacaoMultiplier: editNatacaoMultiplier === '' ? 4.0 : Number(editNatacaoMultiplier),
        caminhadaMultiplier: editCaminhadaMultiplier === '' ? 1.0 : Number(editCaminhadaMultiplier)
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
            <div className="p-6 pt-10 border-b border-slate-900 flex flex-col gap-3 bg-slate-900/20 w-full">
              {profileError && (
                <div className="text-[10px] text-red-400 font-bold bg-red-950/20 border border-red-950 px-2.5 py-1 rounded-xl w-full">
                  {profileError}
                </div>
              )}
              
              {isEditingProfile ? (
                <div className="space-y-3 w-full">
                  <div className="flex items-center gap-4 w-full">
                    <div className="relative group/avatar cursor-pointer shrink-0">
                      {editProfilePhoto || user?.photoURL ? (
                        <img 
                          src={editProfilePhoto || user.photoURL} 
                          alt="Perfil" 
                          className="w-14 h-14 rounded-full object-cover border-2 border-red-500 shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                          {getUserInitials()}
                        </div>
                      )}
                      <label htmlFor="profile-photo-upload" className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition duration-150 cursor-pointer">
                        <Camera className="w-4 h-4 text-white" />
                      </label>
                      <input
                        type="file"
                        id="profile-photo-upload"
                        accept="image/*"
                        onChange={handleProfilePhotoChange}
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <input
                        type="text"
                        value={editProfileName}
                        onChange={(e) => setEditProfileName(e.target.value)}
                        placeholder="Nome do Atleta"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-100 text-xs font-bold focus:outline-none focus:border-red-500"
                      />
                      <p className="text-[10px] text-slate-500 truncate">
                        {user?.email || 'Atleta Local'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!editProfileName.trim()) {
                          setProfileError('O nome não pode ser vazio.');
                          return;
                        }
                        setIsUpdatingProfile(true);
                        setProfileError(null);
                        try {
                          if (onUpdateProfile) {
                            await onUpdateProfile(editProfileName.trim(), editProfilePhoto);
                          }
                          setIsEditingProfile(false);
                        } catch (err: any) {
                          setProfileError(err.message || 'Erro ao salvar.');
                        } finally {
                          setIsUpdatingProfile(false);
                        }
                      }}
                      disabled={isUpdatingProfile}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg cursor-pointer transition flex items-center justify-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>{isUpdatingProfile ? 'Salvando...' : 'Confirmar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditProfileName(athleteName || user?.displayName || '');
                        setEditProfilePhoto(null);
                        setProfileError(null);
                      }}
                      disabled={isUpdatingProfile}
                      className="px-3 py-1.5 bg-slate-900 text-slate-350 font-bold text-[10px] rounded-lg cursor-pointer transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
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
                    
                    <button
                      type="button"
                      onClick={() => {
                        setEditProfileName(getProfileName());
                        setIsEditingProfile(true);
                      }}
                      className="mt-1.5 py-1 px-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar Perfil</span>
                    </button>
                  </div>
                </div>
              )}
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
                    <span>Gravar Treino / Aeróbico</span>
                  </button>

                  <div className="h-[1px] bg-slate-900 my-2" />

                  {/* Menu List */}
                  <div className="space-y-1">
                    
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
                      {isDemoActive && <span className="text-[10px] bg-red-950/50 text-red-400 border border-red-900/45 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Selecionado</span>}
                    </button>

                    {/* PRIVATE ACTIVE CHALLENGES */}
                    <div className="pt-2">
                      <div className="px-3.5 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Grupos Particulares
                      </div>
                      
                      {activePrivateGroups.length === 0 ? (
                        <p className="px-3.5 py-2 text-xs text-slate-500 italic font-medium">Nenhum grupo particular ativo</p>
                      ) : (
                        <div className="space-y-0.5">
                          {activePrivateGroups.map((g) => {
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
                                    <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900/50 font-extrabold px-1.5 py-0.5 rounded-md uppercase">Selecionado</span>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedGroupForDetails(localGroupsData[g.id] || null);
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

                    {/* CONFIGURE CURRENT CHALLENGE RULES */}
                    {activeGroup && activeGroup.id !== 'demo-group' && (
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
                            onChange={(e) => setGymPoints(e.target.value)}
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
                            onChange={(e) => setDistanceMult(e.target.value)}
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
                            onChange={(e) => setComboPoints(e.target.value)}
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

              {/* VIEW: CONFIGURE GROUP RULES */}
              {viewMode === 'configure' && (
                <div className="space-y-4 animate-fadeIn p-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                    <button onClick={() => setViewMode('main')} className="p-1 hover:bg-slate-900 rounded-full cursor-pointer text-slate-400 hover:text-slate-200 transition">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-extrabold text-base text-slate-100">
                      {isCreator ? 'Configurações do Desafio' : 'Regras do Desafio'}
                    </h4>
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
                          disabled={!isCreator}
                          value={editStartDate}
                          onChange={(e) => setEditStartDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-red-500 focus:bg-slate-850 transition disabled:opacity-60"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">🏁 Término</label>
                        <input
                          type="date"
                          disabled={!isCreator}
                          value={editEndDate}
                          onChange={(e) => setEditEndDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-red-500 focus:bg-slate-850 transition disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 p-4 bg-slate-900/60 border border-slate-850 rounded-2xl">
                      <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block pb-1 border-b border-slate-800">
                        {isCreator ? 'Ajustar Pontuações' : 'Regras de Pontuação'}
                      </span>
                      
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
                            disabled={!isCreator}
                            value={editGymPoints}
                            onChange={(e) => setEditGymPoints(e.target.value)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-red-500 focus:outline-none focus:border-red-500 disabled:opacity-60"
                          />
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <span className="text-xs text-slate-300 font-bold block">🏃 Corrida</span>
                            <span className="text-[10px] text-slate-500">Pontos por km de corrida</span>
                          </div>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="50"
                            disabled={!isCreator}
                            value={editCorridaMultiplier}
                            onChange={(e) => setEditCorridaMultiplier(e.target.value)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-indigo-400 focus:outline-none focus:border-indigo-550 disabled:opacity-60"
                          />
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <span className="text-xs text-slate-300 font-bold block">🚶 Caminhada</span>
                            <span className="text-[10px] text-slate-500">Pontos por km de caminhada</span>
                          </div>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="50"
                            disabled={!isCreator}
                            value={editCaminhadaMultiplier}
                            onChange={(e) => setEditCaminhadaMultiplier(e.target.value)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-550 disabled:opacity-60"
                          />
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <span className="text-xs text-slate-300 font-bold block">🚴 Ciclismo</span>
                            <span className="text-[10px] text-slate-500">Pontos por km de pedalada</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="50"
                            disabled={!isCreator}
                            value={editCiclismoMultiplier}
                            onChange={(e) => setEditCiclismoMultiplier(e.target.value)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-teal-400 focus:outline-none focus:border-teal-550 disabled:opacity-60"
                          />
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <span className="text-xs text-slate-300 font-bold block">🏊 Natação</span>
                            <span className="text-[10px] text-slate-500">Pontos por 1000 m de natação</span>
                          </div>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="100"
                            disabled={!isCreator}
                            value={editNatacaoMultiplier}
                            onChange={(e) => setEditNatacaoMultiplier(e.target.value)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-sky-400 focus:outline-none focus:border-sky-550 disabled:opacity-60"
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
                            disabled={!isCreator}
                            value={editComboPoints}
                            onChange={(e) => setEditComboPoints(e.target.value)}
                            className="w-14 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-amber-500 focus:outline-none focus:border-amber-500 disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* DYNAMIC RULE EXPLANATION CARDS (avoiding redundancy, merged inside this view) */}
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block pb-1">
                        Resumo de Pontuação Ativa:
                      </span>

                      <div className="p-3 bg-red-950/20 border border-red-950/50 rounded-xl space-y-1">
                        <span className="font-extrabold text-red-400 text-xs flex items-center gap-1.5">
                          🏋️ Academia
                        </span>
                        <p className="text-slate-300 text-[11px]">
                          Cada check-in diário garante <strong>{formatMultiplier(editGymPoints)} pontos</strong>. Limite de 1 por dia.
                        </p>
                      </div>

                      <div className="p-3 bg-indigo-950/20 border border-indigo-950/50 rounded-xl space-y-1">
                        <span className="font-extrabold text-indigo-400 text-xs flex items-center gap-1.5">
                          🏃 Corrida
                        </span>
                        <p className="text-slate-300 text-[11px]">
                          Cada km de corrida garante <strong>{formatMultiplier(editCorridaMultiplier)} pontos</strong>.
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-950/20 border border-emerald-950/50 rounded-xl space-y-1">
                        <span className="font-extrabold text-emerald-400 text-xs flex items-center gap-1.5">
                          🚶 Caminhada
                        </span>
                        <p className="text-slate-300 text-[11px]">
                          Cada km de caminhada garante <strong>{formatMultiplier(editCaminhadaMultiplier)} pontos</strong>.
                        </p>
                      </div>

                      <div className="p-3 bg-teal-950/20 border border-teal-950/50 rounded-xl space-y-1">
                        <span className="font-extrabold text-teal-400 text-xs flex items-center gap-1.5">
                          🚴 Ciclismo
                        </span>
                        <p className="text-slate-300 text-[11px]">
                          Cada km de ciclismo/pedal garante <strong>{formatMultiplier(editCiclismoMultiplier)} pontos</strong>.
                        </p>
                      </div>

                      <div className="p-3 bg-sky-950/20 border border-sky-950/50 rounded-xl space-y-1">
                        <span className="font-extrabold text-sky-400 text-xs flex items-center gap-1.5">
                          🏊 Natação
                        </span>
                        <p className="text-slate-300 text-[11px]">
                          Cada 1000 m de natação garante <strong>{formatMultiplier(editNatacaoMultiplier)} pontos</strong>.
                        </p>
                      </div>

                      <div className="p-3 bg-amber-950/20 border border-amber-950/50 rounded-xl space-y-1">
                        <span className="font-extrabold text-amber-500 text-xs flex items-center gap-1.5">
                          🔥 Bônus Combo Diário
                        </span>
                        <p className="text-slate-300 text-[11px]">
                          Fazer check-in e atividade aeróbica no mesmo dia concede <strong>+{formatMultiplier(editComboPoints)} pontos</strong> extras!
                        </p>
                      </div>
                    </div>

                    {isCreator ? (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#e03a3a] hover:bg-[#c92f2f] text-white font-extrabold text-xs rounded-full cursor-pointer transition shadow-md uppercase tracking-wider mt-4"
                      >
                        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                    ) : (
                      <div className="p-3.5 bg-slate-900 border border-slate-850 rounded-2xl text-center text-xs text-slate-400 italic">
                        Apenas o criador do grupo pode alterar estas configurações.
                      </div>
                    )}
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
                    <h4 className="font-extrabold text-base text-slate-100 font-sans">Ajuda & Feedback</h4>
                  </div>

                  <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                    <p className="text-slate-400">
                      O <strong>Eu Sou Capaz</strong> estimula a consistência física diária e saudável. Confira abaixo as principais informações para tirar o máximo proveito do aplicativo:
                    </p>

                    <div className="space-y-3">
                      <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-1.5">
                        <span className="font-extrabold text-indigo-400 flex items-center gap-1.5 text-[12px]">
                          📱 Como Lançar Treinos?
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Utilize o botão <strong className="text-slate-100">"+"</strong> na página principal para registrar musculação ou cárdio manual. Lembre-se que o check-in de musculação é limitado a 1 por dia.
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-1.5">
                        <span className="font-extrabold text-teal-400 flex items-center gap-1.5 text-[12px]">
                          🚴 Sincronização Automática (Strava)
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Conecte sua conta do Strava clicando em <strong className="text-slate-100">"Editar Perfil"</strong> e depois em <strong className="text-slate-100">"Conectar Strava"</strong>. Suas corridas, caminhadas, pedaladas e natação serão computadas automaticamente de forma transparente!
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-1.5">
                        <span className="font-extrabold text-amber-500 flex items-center gap-1.5 text-[12px]">
                          ⚙️ Onde ver os Pontos do Desafio?
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          As regras de pontuação ativas e multiplicadores de cada modalidade esportiva estão disponíveis no menu anterior em <strong className="text-slate-100">"Regras do Desafio"</strong> ou <strong className="text-slate-100">"Configurações do Desafio"</strong>.
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-1.5">
                        <span className="font-extrabold text-rose-400 flex items-center gap-1.5 text-[12px]">
                          💬 Enviar Feedback ou Suporte
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Caso encontre algum problema, queira sugerir novas ideias ou precise de ajuda, entre em contato direto com o administrador do seu grupo ou mande uma mensagem de feedback. Todo treino conta!
                        </p>
                      </div>
                    </div>
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

                  {concludedPrivateGroups.length === 0 ? (
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
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed pb-1">
                        Estes desafios já foram finalizados de acordo com a data de encerramento estipulada. Clique em um deles para visualizar seu ranking e estatísticas finais:
                      </p>
                      <div className="space-y-1.5">
                        {concludedPrivateGroups.map((g) => {
                          const isThisActive = activeGroup?.id === g.id;
                          return (
                            <div key={g.id} className="flex items-center justify-between rounded-2xl overflow-hidden bg-slate-900/30 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 transition-all">
                              <button
                                onClick={() => {
                                  onSelectGroup(g.id);
                                  onClose();
                                }}
                                className={`flex-1 flex items-center gap-3 p-3 text-left text-xs sm:text-sm transition cursor-pointer ${
                                  isThisActive ? 'text-amber-500 font-black' : 'text-slate-400 font-medium'
                                }`}
                              >
                                <Flag className={`w-4 h-4 ${isThisActive ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
                                <span className="truncate">{g.name}</span>
                                {isThisActive && (
                                  <span className="text-[8px] bg-indigo-950 text-indigo-400 border border-indigo-900/50 font-extrabold px-1.5 py-0.5 rounded-md uppercase">Selecionado</span>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedGroupForDetails(localGroupsData[g.id] || null);
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
                    </div>
                  )}
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
