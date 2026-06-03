/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp,
  LogOut
} from 'lucide-react';
import { GroupChallenge, RuleConfig, GroupMember } from '../types';
import { extractGroupCode } from '../utils';

interface GroupManagerProps {
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
  onSyncFradeChallenge?: () => Promise<void>;
}

export function GroupManager({
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
  onSyncFradeChallenge
}: GroupManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'join' | 'view'>('create');
  const [copied, setCopied] = useState(false);
  const [isSyncingFradeStatus, setIsSyncingFradeStatus] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);


  // Form states
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [gymPoints, setGymPoints] = useState(5);
  const [distanceMult, setDistanceMult] = useState(1);
  const [comboPoints, setComboPoints] = useState(10);

  // Status message states
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);
  const [showMemberList, setShowMemberList] = useState(false);

  const handleConfirmLeave = () => {
    if (activeGroup && onLeaveGroup) {
      onLeaveGroup(activeGroup.id);
      setConfirmLeaveId(null);
    }
  };

  const handleCopyLink = () => {
    if (!activeGroup) return;
    const inviteLink = `https://eusoucapaz.vercel.app/?group=${activeGroup.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteName) {
      setStatusMsg({ type: 'error', text: 'Você precisa primeiro registrar um nome de atleta para criar um grupo.' });
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
      setStatusMsg({ type: 'success', text: `Desafio "${groupName}" criado com sucesso! Código de convite: ${newGroupId}` });
      setGroupName('');
      setGroupDesc('');
      setMode('view');
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
      setStatusMsg({ type: 'error', text: 'Você precisa primeiro registrar um nome de atleta para se juntar ao grupo.' });
      return;
    }
    if (!joinCode.trim()) {
      setStatusMsg({ type: 'error', text: 'Insira um código de convite.' });
      return;
    }

    const codeToJoin = extractGroupCode(joinCode);
    if (!codeToJoin) {
      setStatusMsg({ type: 'error', text: 'Código de convite ou URL inválida.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const success = await onJoinGroup(codeToJoin);
      if (success) {
        setStatusMsg({ type: 'success', text: 'Você entrou no grupo com sucesso!' });
        setJoinCode('');
        setMode('view');
      } else {
        setStatusMsg({ type: 'error', text: 'Código de convite inválido ou erro ao se conectar.' });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Grupo não encontrado ou você já pertence a este grupo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'public' | 'private'>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('es_capaz_active_group_id') : null;
    if (stored === 'EMPTY-PRIVATE') return 'private';
    return (activeGroup && activeGroup.id !== 'demo-group') ? 'private' : 'public';
  });

  useEffect(() => {
    if (activeGroup && activeGroup.id !== 'demo-group') {
      setActiveTab('private');
    } else if (activeGroup && activeGroup.id === 'demo-group') {
      setActiveTab('public');
    } else {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('es_capaz_active_group_id') : null;
      if (stored === 'EMPTY-PRIVATE') {
        setActiveTab('private');
      }
    }
  }, [activeGroup]);

  const isDemo = activeTab === 'public';

  return (
    <section className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-5" id="group-manager-panel">
      
      {/* Top Bar with Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-850 pb-4">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Painel de Desafios
            </h2>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Participe do torneio mensal global ou crie salas particulares personalizadas
            </p>
          </div>
        </div>

        {/* Dynamic Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
          <div className="flex flex-col sm:flex-row bg-slate-950 p-1 rounded-xl border border-slate-805 border-slate-800 shrink-0 w-full sm:w-auto gap-1">
            <button
              type="button"
              onClick={() => {
                onSelectGroup('demo-group');
                setActiveTab('public');
                setStatusMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer w-full sm:w-auto ${
                isDemo
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Desafio Público Geral (Mensal)
            </button>
            <button
              type="button"
              onClick={() => {
                if (userGroups.length > 0) {
                  onSelectGroup(userGroups[0].id);
                } else {
                  onSelectGroup('EMPTY-PRIVATE');
                }
                setActiveTab('private');
                setStatusMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer w-full sm:w-auto ${
                !isDemo
                  ? 'bg-indigo-600 text-slate-100 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Desafios Particulares (Privados)
            </button>
          </div>

          {!isDemo && userGroups.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={activeGroup?.id || ''}
                onChange={(e) => onSelectGroup(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none"
              >
                {userGroups.map(g => (
                  <option key={g.id} value={g.id}>🏆 {g.name}</option>
                ))}
              </select>
            </div>
          )}

          {user && (activeGroup || (!activeGroup && !isDemo && isOpen)) && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(!isOpen);
                setMode(mode === 'view' ? 'create' : 'view');
              }}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-750 text-xs font-mono font-bold text-amber-400 cursor-pointer flex items-center gap-1 shrink-0"
            >
              Opções <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Action Tray for Create/Join (Toggleable) */}
      {isOpen && user && (
        <div className="p-4 bg-slate-950/60 border border-slate-850/60 rounded-xl space-y-4">
          <div className="flex gap-2 border-b border-slate-900 pb-3">
            <button
              type="button"
              onClick={() => { setMode('create'); setStatusMsg(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${mode === 'create' ? 'bg-amber-500 text-slate-950' : 'text-slate-450 hover:text-white'}`}
            >
              Criar Novo Desafio
            </button>
            <button
              type="button"
              onClick={() => { setMode('join'); setStatusMsg(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${mode === 'join' ? 'bg-amber-500 text-slate-950' : 'text-slate-450 hover:text-white'}`}
            >
              Participar de Desafio (Código)
            </button>
          </div>

          {statusMsg && (
            <div className={`p-2.5 rounded-lg flex items-center gap-2 text-[10px] ${statusMsg.type === 'success' ? 'bg-emerald-950/40 border border-emerald-800/20 text-emerald-300' : 'bg-red-950/30 border border-red-900/40 text-red-300'}`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="leading-relaxed whitespace-pre-line">{statusMsg.text}</span>
            </div>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoin} className="space-y-3">
              <div>
                <label className="block text-slate-450 font-mono text-[10px] uppercase font-semibold mb-1">Código do Desafio:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Ex: XYZ890"
                    className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 font-mono text-center font-bold text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-amber-500 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 bg-emerald-500 text-slate-950 font-bold font-mono rounded-xl text-xs hover:bg-emerald-400 transition"
                  >
                    Entrar no Desafio
                  </button>
                </div>
              </div>
            </form>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4 font-mono text-[11px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-450 font-mono font-semibold uppercase mb-1">Título do Desafio:</label>
                    <input
                      type="text"
                      required
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Ex: Desafio Trincando 30 Dias"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-450 font-mono font-semibold uppercase mb-1">Descrição / Regras Básicas:</label>
                    <textarea
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                      placeholder="Ex: Grupo focado na galera unida do treino. Proibido furos!"
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-slate-950 border border-slate-900 rounded-xl">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block border-b border-slate-900 pb-2 mb-2">🎯 Como funcionará a Pontuação?</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-350 font-bold mb-1 font-sans text-xs flex items-center gap-1">
                        📅 Início do Desafio:
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 text-xs font-sans focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-350 font-bold mb-1 font-sans text-xs flex items-center gap-1">
                        🏁 Fim do Desafio:
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 text-xs font-sans focus:outline-none focus:border-amber-500 text-stone-300"
                      />
                    </div>
                    <p className="col-span-2 text-[9.5px] text-slate-550 font-sans leading-normal">
                      Apenas treinos cadastrados dentro deste intervalo contarão pontos e serão considerados no ranking. Leave Término vazio se for contínuo.
                    </p>
                  </div>

                  <div className="space-y-4 pt-3 border-t border-slate-900">
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900/60">
                      <div className="flex justify-between items-center gap-4 mb-1">
                        <label className="block text-slate-200 font-bold font-sans text-[11px] uppercase tracking-wider">
                          🏋️ Pontos por Treino
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={gymPoints}
                          onChange={(e) => setGymPoints(Number(e.target.value) || 5)}
                          className="w-20 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-center font-bold text-emerald-400 font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                        Quantos pontos o participante ganha por dia ao realizar musculação, pilates, lutas ou funcional. <span className="text-amber-500 font-medium">(Valor sugerido: 5 pontos)</span>
                      </p>
                    </div>

                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900/60">
                      <div className="flex justify-between items-center gap-4 mb-1">
                        <label className="block text-slate-200 font-bold font-sans text-[11px] uppercase tracking-wider">
                          🏃 Multiplicador de Cardio (Distância)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="10"
                          value={distanceMult}
                          onChange={(e) => setDistanceMult(Number(e.target.value) || 1)}
                          className="w-20 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-center font-bold text-indigo-400 font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                        Aumenta ou diminui o peso dos cardios. Por padrão, 1 km de corrida vale 1 ponto. Ao escolher 1.0, o esforço de cardio se mantém equilibrado. <span className="text-amber-500 font-medium">(Valor sugerido: 1.0)</span>
                      </p>
                    </div>

                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900/60">
                      <div className="flex justify-between items-center gap-4 mb-1">
                        <label className="block text-slate-200 font-bold font-sans text-[11px] uppercase tracking-wider">
                          🔥 Bônus de Combo Diário
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={comboPoints}
                          onChange={(e) => setComboPoints(Number(e.target.value) || 10)}
                          className="w-20 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-center font-bold text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                        Premiação extra para quem fizer musculação e corrida/pedalada no mesmo dia! Incentiva a superação diária. <span className="text-amber-500 font-medium">(Valor sugerido: 10 pontos)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-900">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  {isSubmitting ? 'Gerando Desafio...' : 'Criar Desafio e Gerar Código'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Main Active Group View Details */}
      {isDemo ? (
        <div className="bg-slate-950/40 border border-slate-850/50 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/20 text-emerald-300 font-mono text-[9px] font-extrabold rounded uppercase tracking-wider">
                  Desafio Público Geral
                </span>
                <span className="text-slate-500 text-xs font-mono">•</span>
                <span className="text-[10.5px] text-slate-300 font-mono flex items-center gap-1">
                  📅 Duração: <strong className="text-amber-400 font-bold">1 Mês</strong>
                </span>
                <span className="text-slate-500 text-xs font-mono">•</span>
                <span className="text-[10.5px] text-slate-300 font-mono flex items-center gap-1">
                  👥 Participação: <strong className="text-indigo-400 font-bold">Comunidade Global</strong>
                </span>
              </div>
              <h3 className="font-black text-lg text-slate-50 font-display notranslate" translate="no">
                🏆 Desafio Geral Eu Sou Capaz
              </h3>
              <p className="text-xs text-slate-400 leading-normal font-sans max-w-2xl">
                Participe deste desafio global com todas as pessoas que utilizam o aplicativo! O torneio tem duração contínua de 1 mês para você testar sua consistência competitiva, subir no ranking e manter hábitos saudáveis de musculação e cárdio.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-slate-900 border border-slate-800 text-slate-200 py-1.5 px-3 rounded-xl flex items-center gap-2 shadow-inner font-mono text-xs">
                <span className="text-slate-505 text-slate-450 font-bold uppercase text-[9px]">Acesso:</span>
                <strong className="text-emerald-400 uppercase font-bold text-xs">Aberto a Todos</strong>
              </div>
            </div>
          </div>
        </div>
      ) : !activeGroup ? (
        <div className="bg-slate-950/25 border border-slate-850/50 rounded-2xl p-8 text-center space-y-4 shadow-xl" id="private-challenges-empty-state">
          <div className="w-12 h-12 bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-200 text-sm">Nenhum Desafio Particular Ativo</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Você ainda não está participando de nenhum desafio particular. Crie um grupo personalizado para seu círculo próximo ou insira um código abaixo para se juntar à equipe!
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setMode('join');
                setStatusMsg(null);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition active:translate-y-px"
            >
              Inserir Código de Convite
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setMode('create');
                setStatusMsg(null);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-755 text-amber-400 border border-slate-700 font-bold rounded-xl text-xs cursor-pointer transition active:translate-y-px"
            >
              Criar Meu Desafio
            </button>
          </div>
        </div>
      ) : (
        activeGroup && (
          <div className="bg-slate-950/40 border border-slate-850/50 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-505/10 bg-indigo-950 border border-indigo-500/20 text-indigo-300 font-mono text-[9px] font-extrabold rounded uppercase tracking-wider">
                    Desafio Privado
                  </span>
                  <span className="text-slate-500 text-xs font-mono">•</span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    ID: <strong className="text-slate-100 uppercase">{activeGroup.id}</strong>
                  </span>
                </div>
                <h3 className="font-black text-lg text-slate-50 font-display notranslate" translate="no">
                  {activeGroup.name}
                </h3>
                {activeGroup.description && (
                  <p className="text-xs text-slate-400 leading-normal notranslate font-sans max-w-2xl" translate="no">
                    {activeGroup.description}
                  </p>
                )}
              </div>

              {/* Share / Invite code badge */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-slate-900 border border-slate-800 text-slate-200 py-1.5 pl-3 pr-2.5 rounded-xl flex items-center gap-2 shadow-inner font-mono text-xs">
                  <span className="text-slate-500 font-bold uppercase text-[9px]">Código:</span>
                  <strong className="text-amber-400 uppercase font-black font-mono tracking-widest text-sm">{activeGroup.id}</strong>
                  <button
                    onClick={handleCopyLink}
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                    title="Copiar Link de Convite"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold font-sans rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-md active:translate-y-px shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                  Convidar Atletas
                </button>

                {user && onLeaveGroup && (
                  confirmLeaveId === activeGroup.id ? (
                    <div className="flex items-center gap-1.5 shrink-0 bg-slate-900 border border-red-900/30 p-1 rounded-xl transition animate-pulse">
                      <span className="text-[10px] text-red-400 font-extrabold px-1.5 font-mono">Tem certeza?</span>
                      <button
                        onClick={handleConfirmLeave}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold font-sans rounded-lg text-[10px] cursor-pointer transition shadow"
                      >
                        Sim, Sair
                      </button>
                      <button
                        onClick={() => setConfirmLeaveId(null)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold font-sans rounded-lg text-[10px] cursor-pointer transition"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmLeaveId(activeGroup.id)}
                      className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-500 hover:text-red-400 font-bold font-sans rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-md active:translate-y-px shrink-0 transition"
                      title="Sair deste grupo de desafio"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      Sair do Desafio
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Members summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-900 pt-4">
              <div className="bg-slate-900/40 p-3.5 border border-slate-850/60 rounded-xl space-y-2.5 flex flex-col justify-between">
                <div>
                  <span className="text-slate-500 uppercase tracking-widest text-[9px] font-mono font-bold block mb-1">Atletas Participantes</span>
                  <button
                    type="button"
                    onClick={() => setShowMemberList(!showMemberList)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900/40 hover:border-slate-800 transition cursor-pointer select-none"
                    title="Clique para ver os participantes"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-slate-200">
                        Há <strong className="text-emerald-400 font-extrabold">{groupMembers.length}</strong> atletas ativos participando.
                      </span>
                    </div>
                    {showMemberList ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 animate-pulse" />
                    )}
                  </button>
                </div>
                
                {showMemberList && (
                  <div className="mt-1 max-h-40 overflow-y-auto bg-slate-950 border border-slate-850/80 rounded-lg p-2.5 space-y-1.5 custom-scrollbar animate-fadeIn">
                    {groupMembers.length === 0 ? (
                      <p className="text-[10px] text-slate-500 font-mono italic text-center">Nenhum participante ainda</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {groupMembers.map((mem, i) => (
                          <div 
                            key={mem.userId || i} 
                            className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/50 rounded-md border border-slate-850/30 font-sans text-[11px] text-slate-300 notranslate truncate"
                            translate="no"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-ping-once" />
                            <span className="truncate font-medium" title={mem.athleteName}>{mem.athleteName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Group-Active Rules Checklist */}
              <div className="bg-slate-900/40 p-3.5 border border-slate-850/60 rounded-xl space-y-2">
                <span className="text-slate-500 uppercase tracking-widest text-[9px] font-mono font-bold block mb-1">Vigência do Desafio</span>
                <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1.5 border border-slate-900 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-[10.5px]">Início: <strong>{activeGroup.rules.startDate.split('-').reverse().join('/')}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1.5 border border-slate-900 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="text-[10.5px]">Término: <strong>{activeGroup.rules.endDate ? activeGroup.rules.endDate.split('-').reverse().join('/') : 'Sem limite'}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {activeGroup.id === '99H0DP' && (
              <div className="mt-4 p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-950 border border-amber-500/20 text-amber-500 rounded-lg shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-500 font-mono uppercase tracking-wider">
                      Planilha do Desafio do Frade
                    </h4>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                      Os 83 treinos/cárdios reais dos atletas foram importados com sucesso! Eles já estão ativos localmente no seu navegador para recalcular as pontuações e o ranking do grupo.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-900">
                  <div className="text-[10px] text-slate-500 font-mono">
                    {syncSuccess ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        ✓ Todos os 83 treinos sincronizados na Nuvem!
                      </span>
                    ) : (
                      "Status: Carregado localmente (Pendente sincronização de rede)"
                    )}
                  </div>
                  {user ? (
                    <button
                      type="button"
                      disabled={isSyncingFradeStatus || syncSuccess}
                      onClick={async () => {
                        if (onSyncFradeChallenge) {
                          setIsSyncingFradeStatus(true);
                          try {
                            await onSyncFradeChallenge();
                            setSyncSuccess(true);
                          } catch (err: any) {
                            alert(err.message || "Erro ao sincronizar dados.");
                          } finally {
                            setIsSyncingFradeStatus(false);
                          }
                        }
                      }}
                      className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.02] text-slate-950 font-black rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1 transition"
                    >
                      {isSyncingFradeStatus ? (
                        <span className="animate-pulse">Sincronizando...</span>
                      ) : syncSuccess ? (
                        "Sincronizado na Nuvem!"
                      ) : (
                        "Publicar planilha no Google Firebase"
                      )}
                    </button>
                  ) : (
                    <p className="text-[10px] text-amber-400 font-mono italic">
                      Faça login para salvar esta planilha permanentemente online.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      )}

    </section>
  );
}
