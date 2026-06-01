/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, Sparkles, Check, ChevronRight, UserCheck } from 'lucide-react';

interface RegistrationModalProps {
  existingNames: string[];
  onRegister: (athleteName: string) => void;
  email: string;
  onCancel?: () => void;
}

export function RegistrationModal({ existingNames, onRegister, email, onCancel }: RegistrationModalProps) {
  const [regMode, setRegMode] = useState<'link' | 'new'>('new');
  const [customName, setCustomName] = useState('');
  const [selectedHistorical, setSelectedHistorical] = useState(existingNames[0] || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = regMode === 'new' ? customName.trim() : selectedHistorical;

    if (!finalName) {
      alert('Por favor, informe seu nome de atleta.');
      return;
    }

    onRegister(finalName);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn" id="registration-overlay">
      <div className="bg-slate-900 border border-slate-840 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden" id="registration-card">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-sans">Completar Cadastro</h2>
            <p className="text-[10px] text-slate-400 font-mono">VINCULAÇÃO DE ATLETA INDIVIDUAL</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-5 font-sans">
          Seja bem-vindo ao aplicativo do desafio de 30 dias <strong>Eu Sou Capaz</strong>! Cada usuário precisa de um nome de atleta para postar treinos e ser listado no placar. Como você deseja se registrar?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          
          <div className="space-y-2">
            {/* Option 2: New Name */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-750 transition-all cursor-pointer">
              <input
                type="radio"
                name="regMode"
                checked={regMode === 'new'}
                onChange={() => setRegMode('new')}
                className="mt-1 accent-emerald-500 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Registrar um Novo Atleta</span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-sans leading-normal">
                  Ideal se você está iniciando agora ou quer concorrer com um nome inédito no ranking.
                </span>
              </div>
            </label>

            {/* Option 1: Link Existing */}
            {existingNames.length > 0 && (
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-750 transition-all cursor-pointer">
                <input
                  type="radio"
                  name="regMode"
                  checked={regMode === 'link'}
                  onChange={() => setRegMode('link')}
                  className="mt-1 accent-emerald-500 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-slate-200 block">Reivindicar Nome Histórico</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-sans leading-normal">
                    Se você já tem treinos registrados na planilha ou de anos anteriores (ex: <strong className="notranslate" translate="no">Almeida</strong>, <strong className="notranslate" translate="no">Alex Bispo</strong>).
                  </span>
                </div>
              </label>
            )}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
            {regMode === 'new' ? (
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Nome de Atleta:</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Camilo Silva, Juliana, etc."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 notranslate"
                  translate="no"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Escolha seu nome de planilha:</label>
                <select
                  value={selectedHistorical}
                  onChange={(e) => setSelectedHistorical(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 notranslate"
                  translate="no"
                >
                  {existingNames.map(name => (
                    <option key={name} value={name} className="notranslate" translate="no">{name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold p-3 rounded-xl tracking-wider hover:scale-[1.01] transition-all cursor-pointer mt-4"
          >
            Confirmar e Ingressar no Desafio
            <UserCheck className="w-4 h-4" />
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full flex items-center justify-center text-slate-400 hover:text-slate-200 font-bold py-1.5 text-[11px] underline transition duration-150 cursor-pointer"
            >
              Cancelar / Voltar
            </button>
          )}

          <div className="text-center text-[10px] text-slate-500 pt-1">
            Logado como: {email}
          </div>

        </form>
      </div>
    </div>
  );
}
