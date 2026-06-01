/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlusCircle, Dumbbell, Route, Calendar, ArrowRight, Compass, CheckCircle, Lock, UserPlus, LogIn, Sparkles, Waves, Flame, Camera, UploadCloud, Trash2, Image, ChevronDown, ChevronUp } from 'lucide-react';
import { Activity } from '../types';

interface AddActivityFormProps {
  existingNames: string[];
  onAddActivity: (activity: Omit<Activity, 'id'>) => void | Promise<void>;
  athleteName: string | null;
  onSignIn: () => void;
  activities?: Activity[];
  onDeleteActivity?: (id: string) => void | Promise<void>;
}

export function AddActivityForm({ 
  existingNames, 
  onAddActivity, 
  athleteName, 
  onSignIn,
  activities,
  onDeleteActivity
}: AddActivityFormProps) {
  const [selectedNameOption, setSelectedNameOption] = useState('existing'); // 'existing' | 'new'
  const [existingName, setExistingName] = useState('');
  const [newName, setNewName] = useState('');
  const [activityType, setActivityType] = useState('Corrida'); // 'Treino', 'Corrida', 'Caminhada', 'Pedalada', 'Natação', 'Outra'
  const [distance, setDistance] = useState('0');
  const [customActivityName, setCustomActivityName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkInCode, setCheckInCode] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecentRoll, setShowRecentRoll] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= 4) {
      setErrorInfo('Você pode adicionar no máximo 4 fotos (por exemplo, foto do treino e do aeróbico).');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorInfo('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Compress using standard canvas if image is large, or warn/resize
    if (file.size > 1.5 * 1024 * 1024) {
      // Simple canvas compression
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 800px for storage optimization
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
          
          // Compress quality to 0.7
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPhotos(prev => [...prev, dataUrl].slice(0, 4));
          setErrorInfo(null);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotos(prev => [...prev, base64String].slice(0, 4));
        setErrorInfo(null);
      };
      reader.onerror = () => {
        setErrorInfo('Ocorreu um erro ao carregar o arquivo da imagem.');
      };
      reader.readAsDataURL(file);
    }

    // Reset the field so same file can be clicked again
    e.target.value = '';
  };

  // Synchronize dropdown default based on logged-in athlete or roster list
  useEffect(() => {
    if (athleteName) {
      if (existingNames.includes(athleteName)) {
        setExistingName(athleteName);
        setSelectedNameOption('existing');
      } else {
        setNewName(athleteName);
        setSelectedNameOption('new');
      }
    } else if (existingNames.length > 0 && !existingName) {
      setExistingName(existingNames[0]);
    }
  }, [existingNames, athleteName]);

  const isCardio = ['Corrida', 'Caminhada', 'Pedalada'].includes(activityType);
  const isSwim = activityType === 'Natação';
  const isOther = activityType === 'Outra';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    setSuccessInfo(null);

    const resolvedName = selectedNameOption === 'existing' ? existingName : newName.trim();

    if (!resolvedName) {
      setErrorInfo('Por favor, informe ou selecione o nome do atleta.');
      return;
    }

    let distVal = 0;

    if (isCardio) {
      distVal = parseFloat(distance) || 0;
    } else if (isSwim) {
      distVal = parseFloat(distance) || 0; // stored as meters
    }

    const finalActivityType = activityType === 'Treino' 
      ? 'Treino Musculação' 
      : activityType === 'Outra' 
      ? (customActivityName.trim() || 'Outra Atividade')
      : activityType;

    const typeLower = finalActivityType.toLowerCase();
    const isGymWorkout = activityType === 'Treino' || 
                         typeLower.includes('funcional') || 
                         typeLower.includes('crossfit') || 
                         typeLower.includes('croosfit') || 
                         typeLower.includes('academia') || 
                         typeLower.includes('musculação') ||
                         typeLower.includes('musculacao');

    setIsSubmitting(true);
    try {
      const writePromise = onAddActivity({
        timestamp: `${date} ${new Date().toTimeString().split(' ')[0].substring(0, 5)}`,
        name: resolvedName,
        type: finalActivityType,
        distance: distVal,
        date,
        checkInCode: isGymWorkout ? (checkInCode.trim() || `GYM-${Math.floor(1000 + Math.random() * 9000)}`) : '',
        isGymWorkout,
        customActivityName: activityType === 'Outra' ? (customActivityName.trim() || 'Outra Atividade') : undefined,
        photoUrl: photos[0] || undefined,
        photoUrls: photos.length > 0 ? photos : undefined,
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 6000)
      );

      await Promise.race([writePromise, timeoutPromise]);

      // Visual feedback info
      let feedbackSuffix = '';
      if (isCardio) {
        feedbackSuffix = ` (${distVal} km)`;
      } else if (isSwim) {
        feedbackSuffix = ` (${distVal} metros)`;
      } else if (isOther) {
        feedbackSuffix = ` (Outra Atividade - 5.0 pontos)`;
      }

      setSuccessInfo(`Atividade registrada com sucesso! ${resolvedName} - ${finalActivityType}${feedbackSuffix}`);
      
      // Auto clear success info after 6 seconds
      setTimeout(() => {
        setSuccessInfo(null);
      }, 6000);

      // Reset fields
      setNewName(athleteName || '');
      setCheckInCode('');
      setCustomActivityName('');
      setPhotos([]);
    } catch (err: any) {
      console.error("Erro ao gravar registro no banco de dados:", err);
      let errorMsg = "Falha ao registrar atividade.";
      if (err instanceof Error && err.message === 'TIMEOUT_EXCEEDED') {
        setSuccessInfo(`Atividade enfileirada! ${resolvedName} - ${finalActivityType} (Salvando em segundo plano)`);
        setTimeout(() => {
          setSuccessInfo(null);
        }, 6000);
        // Reset fields
        setNewName(athleteName || '');
        setCheckInCode('');
        setCustomActivityName('');
        setPhotos([]);
      } else {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) {
            errorMsg += ` Detalhe: ${parsed.error}`;
          } else {
            errorMsg += ` ${err.message || String(err)}`;
          }
        } catch {
          errorMsg += ` ${err.message || String(err)}`;
        }
        setErrorInfo(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm" id="add-activity-container">
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-850 pb-3 mb-4">
        <PlusCircle className="w-4 h-4 text-emerald-400" />
        Logar Atividade No Desafio
      </h3>

      {athleteName ? null : (
        // Unauthenticated alert banner
        <div className="mb-4 p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/10 flex flex-col gap-2.5">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-400 font-mono">Registro Temporário (Off-line)</div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                Suas postagens serão salvas localmente neste navegador. Faça login para salvar seus treinos na nuvem e participar do ranking oficial!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer text-[10px] font-bold font-mono"
          >
            <LogIn className="w-3.5 h-3.5" />
            ENTRAR / REGISTRAR-SE COM O GOOGLE
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        
        {/* Atleta Name Selection - Always shown so user can select who is competing */}
        <div>
          <label className="block text-slate-400 mb-1.5 font-semibold">Atleta / Participante:</label>
          <div className="flex gap-4 mb-2 text-[10px]">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="radio"
                name="nameOption"
                checked={selectedNameOption === 'existing'}
                onChange={() => setSelectedNameOption('existing')}
                className="accent-emerald-500"
              />
              Atleta Existente
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="radio"
                name="nameOption"
                checked={selectedNameOption === 'new'}
                onChange={() => setSelectedNameOption('new')}
                className="accent-emerald-500"
              />
              Digitar Outro Nome
            </label>
          </div>

          {selectedNameOption === 'existing' ? (
            <select
              value={existingName}
              onChange={(e) => setExistingName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 notranslate font-bold"
              translate="no"
            >
              {existingNames.length === 0 ? (
                <option value="">Nenhum atleta ativo</option>
              ) : (
                existingNames.map(name => (
                  <option key={name} value={name} className="notranslate" translate="no">{name}</option>
                ))
              )}
            </select>
          ) : (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Exemplo: Nome Sobrenome..."
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-emerald-500 notranslate font-bold"
              translate="no"
              required
            />
          )}
        </div>

        {/* Activity Type Block */}
        <div>
          <label className="block text-slate-400 mb-1.5 font-semibold">Tipo de Atividade:</label>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            {[
              { label: 'Treino', value: 'Treino', icon: Dumbbell, color: 'text-red-400' },
              { label: 'Corrida', value: 'Corrida', icon: Route, color: 'text-indigo-400' },
              { label: 'Caminhada', value: 'Caminhada', icon: Compass, color: 'text-sky-400' },
              { label: 'Pedalada', value: 'Pedalada', icon: Route, color: 'text-amber-500' },
              { label: 'Natação', value: 'Natação', icon: Waves, color: 'text-cyan-400' },
              { label: 'Outras', value: 'Outra', icon: Flame, color: 'text-orange-500' },
            ].map(item => {
              const IconComp = item.icon;
              const isSel = activityType === item.value;
              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => {
                    setActivityType(item.value);
                    setDistance('0');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    isSel 
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 font-bold' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${item.color}`} />
                  <span className="text-[9px] truncate w-full">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conditional Fields: Distance vs Check-in Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Data da Atividade:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-center"
            />
          </div>

          {isCardio && (
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Distância (km):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Ex: 5.80"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-center font-bold"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1.5 block text-center leading-normal">
                {activityType === 'Corrida' && 'Proporção: 1 km Corrida = +1.0 Ponto Adicional'}
                {activityType === 'Caminhada' && 'Proporção: 1 km Caminhada = +1.0 Ponto Adicional'}
                {activityType === 'Pedalada' && 'Proporção: 3 km Pedal = +1.0 Ponto Adicional (Ex: 9 km = 3 pts)'}
              </span>
            </div>
          )}

          {isSwim && (
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Distância (Metros):</label>
              <input
                type="number"
                step="25"
                min="0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Ex: 500"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-center font-bold"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1.5 block text-center leading-normal">Proporção: 250 metros Natação = +1.0 Ponto Adicional</span>
            </div>
          )}

          {isOther && (
            <div className="col-span-1 sm:col-span-1">
              <label className="block text-slate-400 mb-1 font-semibold">Nome do Exercício:</label>
              <input
                type="text"
                value={customActivityName}
                onChange={(e) => setCustomActivityName(e.target.value)}
                placeholder="Ex: Pilates, Beach Tennis..."
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-center font-semibold"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1.5 block text-center leading-normal">
                Vale 5.0 pontos fixos (Ex: Beach Tennis, Luta, Dança, Pilates...)
              </span>
            </div>
          )}

          {activityType === 'Treino' && (
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Local do Treino (opcional):</label>
              <input
                type="text"
                value={checkInCode}
                onChange={(e) => setCheckInCode(e.target.value)}
                placeholder="Ex: Smart Fit, Bluefit, Local..."
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-center"
              />
            </div>
          )}
        </div>

        {/* Photo Upload Area (Optional) */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3">
          <label className="block text-slate-400 font-semibold text-xs flex items-center justify-between gap-1.5">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              Fotos do Treino e do Aeróbico (Opcional - Até 4 fotos):
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              {photos.length}/4
            </span>
          </label>
          
          {/* Upload Area */}
          <div className="relative border border-dashed border-slate-800 hover:border-emerald-400/50 bg-slate-900/40 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all min-h-[110px]">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={photos.length >= 4}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
              title="Selecione ou tire uma foto"
            />
            <UploadCloud className="w-6 h-6 text-slate-500 mb-1.5" />
            <span className="text-xs text-slate-300 font-medium font-sans">
              {photos.length >= 4 ? 'Limite máximo atingido (4)' : 'Selecionar ou tirar foto'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 font-sans">
              Fotos do treino, corrida, etc.
            </span>
          </div>

          {/* Image Previews Area */}
          {photos.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-slate-900">
              <span className="text-[10px] text-slate-400 font-bold block">Comprovações Anexadas ({photos.length}/4):</span>
              <div className="grid grid-cols-2 gap-2">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative p-1.5 bg-slate-900/60 rounded-lg border border-slate-850 flex items-center justify-between gap-2 animate-fadeIn font-sans">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <div className="w-8 h-8 rounded overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0">
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => {
                            setErrorInfo('Não foi possível carregar a imagem de um dos links.');
                          }}
                        />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[9px] font-semibold text-emerald-400 block truncate max-w-[80px]">
                          Foto #{idx + 1}
                        </span>
                        <span className="text-[8px] text-slate-500 truncate block max-w-[80px]">
                          {url.startsWith('data:') ? 'Dispositivo' : 'Link Web'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPhotos(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="p-1 px-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded border border-red-900/20 hover:border-red-500/30 transition-all cursor-pointer text-[9px] font-bold font-mono"
                      title="Excluir"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 font-bold p-2.5 rounded-xl text-xs tracking-wider transition-all shadow-md active:translate-y-px ${
            isSubmitting ? 'opacity-50 cursor-not-allowed bg-emerald-600' : 'hover:bg-emerald-600 cursor-pointer'
          }`}
        >
          {isSubmitting ? 'Gravando no Servidor...' : 'Gravar Atividade no App'}
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin shrink-0" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>

        {/* Visual feedback notice */}
        {successInfo && (
          <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-950/45 text-emerald-300 flex items-center gap-2 text-[10px] animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successInfo}</span>
          </div>
        )}

        {errorInfo && (
          <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/40 text-red-300 flex items-start gap-2 text-[10px] animate-fadeIn">
            <span className="text-red-400 shrink-0 font-bold mt-0.5">⚠️</span>
            <span className="leading-normal">{errorInfo}</span>
          </div>
        )}

      </form>

      {/* Meus Lançamentos Recentes */}
      {activities && activities.length > 0 && (() => {
        const currentAthleteName = selectedNameOption === 'existing' ? existingName : athleteName;
        // Filter by currently selected runner OR logged in athlete name
        const targetName = (currentAthleteName || athleteName || '').toLowerCase().trim();
        if (!targetName) return null;

        const myRecentActs = activities
          .filter(a => a.name && a.name.toLowerCase().trim() === targetName)
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          .slice(0, 15); // list more for convenience inside the scroll area

        if (myRecentActs.length === 0) return null;

        return (
          <div className="mt-5 pt-4 border-t border-slate-850 space-y-3">
            <button
              type="button"
              onClick={() => setShowRecentRoll(!showRecentRoll)}
              className="flex items-center justify-between w-full p-2.5 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-850/60 rounded-xl transition-all text-left cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Lançamentos Recentes ({myRecentActs.length})
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="text-slate-500">{showRecentRoll ? 'Recolher' : 'Exibir & Excluir'}</span>
                {showRecentRoll ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>
            
            {showRecentRoll && (
              <div className="space-y-2 mt-2 animate-fadeIn">
                <div className="flex items-center justify-between px-1 text-[9px] text-slate-500 font-mono italic">
                  <span>Mostrando últimos {myRecentActs.length} registros</span>
                  <span>Clique na lixeira para excluir</span>
                </div>
                
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                  {myRecentActs.map((act) => {
                    const isGym = act.isGymWorkout || act.type.toLowerCase().includes('treino');
                    const isNatacao = act.type.toLowerCase().includes('natação') || act.type.toLowerCase().includes('natacao');

                    return (
                      <div 
                        key={act.id} 
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-850/40 hover:border-slate-850 transition-all text-xs font-sans"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`p-1.5 rounded-md ${isGym ? 'bg-red-950/35 text-red-400' : isNatacao ? 'bg-cyan-950/35 text-cyan-400' : 'bg-indigo-950/35 text-indigo-400'} shrink-0`}>
                            {isGym ? <Dumbbell className="w-3.5 h-3.5" /> : isNatacao ? <Waves className="w-3.5 h-3.5" /> : <Route className="w-3.5 h-3.5" />}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                              {act.type} 
                              {act.distance > 0 && (
                                <span className="text-[10px] text-slate-400 font-mono font-medium">
                                  ({isNatacao ? `${act.distance}m` : `${act.distance.toFixed(2)}km`})
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono">
                              {act.date.split('-').reverse().join('/')} às {act.timestamp.split(' ')[1] || ''}
                            </div>
                          </div>
                        </div>

                        {confirmDeleteId === act.id ? (
                          <div className="flex items-center gap-1 shrink-0 animate-fadeIn font-sans">
                            <span className="text-[10px] text-red-400 font-bold">Excluir?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteActivity?.(act.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-slate-100 text-[9px] font-bold rounded transition-colors cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[9px] font-bold rounded transition-colors cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteId(act.id);
                            }}
                            className="p-1.5 hover:bg-red-950/35 text-slate-500 hover:text-red-400 rounded-lg cursor-pointer transition-colors shrink-0"
                            title="Excluir Atividade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
