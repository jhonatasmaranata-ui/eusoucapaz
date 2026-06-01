/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LogIn, 
  LogOut, 
  Sparkles, 
  Dumbbell, 
  Target, 
  Brain, 
  Footprints,
  Sparkle
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  isUsingCustomData: boolean;
  totalParticipants: number;
  startDate: string;
  endDate?: string;
  onReset: () => void;
  user: User | null;
  athleteName: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onEditName: () => void;
  onSignInLocal: () => void;
}

export function Header({ 
  isUsingCustomData, 
  totalParticipants, 
  startDate, 
  endDate,
  onReset,
  user,
  athleteName,
  onSignIn,
  onSignOut,
  onEditName,
  onSignInLocal
}: HeaderProps) {
  // Format start date beautifully (from YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <header className="bg-slate-950 border-b border-zinc-900 text-white relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.8)]" id="brand-header">
      {/* Dynamic ambient flow on background */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-orange-500/[0.04] to-transparent pointer-events-none" />
      <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-orange-600/[0.02] blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 -top-12 w-96 h-96 rounded-full bg-indigo-600/[0.02] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Brand/Logo Area & Interactive SVG Spartan Emblem */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* The Identical Combined Spartan Branding Badge from User's Image */}
            <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center transition-transform duration-300 hover:scale-105" id="identical-spartan-badge">
              <svg 
                viewBox="0 0 400 400" 
                className="w-full h-full filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer sleek border & solid dark canvas background matching user's image exactly */}
                <rect x="3" y="3" width="394" height="394" rx="64" ry="64" fill="#09090b" stroke="#1c1917" strokeWidth="6" />
                <rect x="9" y="9" width="382" height="382" rx="58" ry="58" fill="none" stroke="#2e2a24" strokeWidth="1.5" opacity="0.6" />

                {/* Squal/Clipping container to keep all rendering layers cleanly contained within the squircle badge */}
                <g clipPath="url(#squircleClip)">
                  {/* Atmospheric gradient sky matching the foggy dusk/morning light of the reference image */}
                  <rect x="9" y="9" width="382" height="382" fill="url(#foggySky)" />

                  {/* Foggy light source on the center-right to illuminate behind the mountains */}
                  <circle cx="280" cy="180" r="140" fill="url(#mistyGlow)" opacity="0.35" />

                  {/* 1. LAYER ONE: Very distant, pale blue-grey needle peaks fading into the fog */}
                  <path 
                    d="M -20,280 L 30,190 L 80,240 L 130,200 L 190,265 L 240,220 L 310,290" 
                    fill="#b4c6d6" 
                    opacity="0.32" 
                  />
                  
                  {/* 2. LAYER TWO: Meso-distance dramatic sharp mountain ridges (reproducing the sharp needle peak structures perfectly) */}
                  <path 
                    d="M -10,295 L 45,170 L 95,225 L 140,160 L 210,240 L 265,190 L 330,295 Z" 
                    fill="#6e8294" 
                    opacity="0.5" 
                  />
                  {/* Inner ridge shadows for Meso-depth range to give real 3D volume */}
                  <path d="M 45,170 L 45,295 L 95,225 L 95,295" stroke="#4a5a6a" strokeWidth="1.2" opacity="0.35" />
                  <path d="M 140,160 L 140,295 L 210,240 L 210,295" stroke="#4a5a6a" strokeWidth="1.2" opacity="0.35" />

                  {/* 3. LAYER THREE: Closer prominent sharp mountains in deep greyish-blue silhouettes */}
                  <path 
                    d="M -10,320 L 60,195 L 115,250 L 180,180 L 255,270 L 315,220 L 370,320 Z" 
                    fill="#3b4b5c" 
                    opacity="0.75" 
                  />
                  {/* Distinctive razor sharp edges highlights on closest peaks in icy grey */}
                  <path d="M -10,320 L 60,195 L 115,250 L 180,180 L 255,270 L 315,220 L 370,320" stroke="#718596" strokeWidth="1" opacity="0.5" />

                  {/* Deep glowing canyon fog/mist separator between background mountains and foreground ridge */}
                  <rect x="9" y="240" width="382" height="110" fill="url(#valleyFog)" opacity="0.65" />

                  {/* 4. LAYER FOUR (Foreground): Solid dark irregular rocky ridge where the athlete stands */}
                  <path 
                    d="M 9,330 C 80,314 180,305 270,318 C 310,324 350,336 391,350 L 391,400 L 9,400 Z" 
                    fill="#010103" 
                  />
                  {/* Slight rock textures/crevices for premium touch */}
                  <path d="M 50,324 Q 120,315 200,312" stroke="#1d1d22" strokeWidth="2.5" />
                  <path d="M 230,314 Q 300,322 360,335" stroke="#101014" strokeWidth="1.5" />

                  {/* 5. THE ULTIMATE MOUNTAINEER SILHOUETTE (Faithfully mimicking the reference image's pose) */}
                  {/* Scaling and positioning our hero on the right-hand ridge looking across the landscape */}
                  <g transform="translate(262, 185)" className="select-none animate-fadeIn">
                    {/* Shadow underneath feet */}
                    <ellipse cx="14" cy="130" rx="16" ry="3.5" fill="#000000" opacity="0.6" />

                    {/* Left Leg and Boot (firmly planted) */}
                    <path d="M 8,102 L 7,128 L 3,129 L 4,130 L 11,130 L 12,128 L 11,102 Z" fill="#010103" />

                    {/* Right Leg and Boot (slightly forward/stabilized on the slope) */}
                    <path d="M 17,102 L 18,127 L 15,129 L 16,130 L 23,130 L 23,128 L 19,102 Z" fill="#010103" />

                    {/* Trekking/Walking Pole resting on the ground in high-altitude angle */}
                    <line x1="2" x2="-8" y1="44" y2="130" stroke="#0d0d10" strokeWidth="2.2" strokeLinecap="round" />
                    <line x1="2" x2="-8" y1="44" y2="130" stroke="#ffffff" strokeWidth="0.85" strokeLinecap="round" opacity="0.3" id="poleHighlight" />
                    
                    {/* Big Professional expedition backing pack (Heavy volume load) */}
                    {/* Rucksack main sack details reproducing the prominent square heavy back silhoette */}
                    <rect x="15" y="24" width="22" height="54" rx="8" fill="#010103" />
                    {/* Upper sleeping pad roll mounted on backpack */}
                    <rect x="13" y="16" width="24" height="9" rx="3.5" fill="#010103" />
                    {/* Lower accessory pouches */}
                    <rect x="23" y="44" width="16" height="28" rx="6" fill="#010103" />
                    <circle cx="22" cy="74" r="5" fill="#010103" />

                    {/* Athlete Torso/Body wearing cold-climate outer jacket with hood folded down */}
                    <path d="M 5,34 C 4,50 5,72 8,102 L 19,102 C 20,74 21,50 18,34 Z" fill="#010103" />

                    {/* Left Arm hanging naturally near the trekking style pole */}
                    <path d="M 6,34 C 3,46 1,58 2,68 L 7,66 C 6,56 8,46 10,34 Z" fill="#010103" />

                    {/* Right Arm: Refined muscular arm shading eyes, sweeping organically with NO hollow spaces (No skull/jaw bone illusion) */}
                    <path 
                      d="M 11,33
                         C 9,29 5,27 1,26
                         C -2.5,25 -4.5,23.5 -5,21.5
                         C -5.5,19.5 -3.5,16.5 0.5,14.5
                         C 2.5,13.5 5,13 6.5,13
                         L -6,13
                         C -6,15.5 -4,18 -3.5,19.5
                         C -3,21 -4.2,23 -5.5,25.5
                         C -7,28.5 -5.2,31 -2,32.5
                         C 0.5,33.5 4,34 7,34 Z" 
                      fill="#010103" 
                    />

                    {/* Head: Solid, high-resolution silhouette of the athlete's head and neck wearing a Beanie cap, facing Left */}
                    <path 
                      d="M 11.5,26.5 
                         C 13,21.5 13.5,18 12.5,14.5 
                         C 11.5,11 9,10 6.5,10.5 
                         C 4.5,11 3.5,12 3,13.5
                         C 2.5,15 2.8,16.5 3.5,18 
                         C 3.8,18.5 3.2,19.3 2.5,19.5 
                         C 1.5,19.7 1,20.5 1.2,21.3 
                         C 1.4,22.1 2.2,22.6 3.2,22.3
                         C 3.8,22.1 4.3,22.5 4.5,23 
                         C 4.8,23.7 4.2,24.5 4.5,25.3 
                         C 4.8,26.1 6,26.5 7.5,26.8
                         C 9,27 10,27 11.5,26.5 Z" 
                      fill="#010103" 
                    />
                  </g>
                </g>

                {/* Defs/Gradients */}
                <defs>
                  {/* Clipping path of the squircle frame itself */}
                  <clipPath id="squircleClip">
                    <rect x="9" y="9" width="382" height="382" rx="58" ry="58" />
                  </clipPath>

                  {/* Atmospheric gradient containing clear white/light-grey horizon that darkens upwards to premium steel blue */}
                  <linearGradient id="foggySky" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#f4f6f9" />
                    <stop offset="25%" stopColor="#e2e8f0" />
                    <stop offset="65%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>

                  {/* Heavenly light radiating near the adventurer from behind the mountains */}
                  <radialGradient id="mistyGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
                  </radialGradient>

                  {/* Linear split gradient for standard carbon fibers and elements */}
                  <pattern id="carbonMesh" width="8" height="8" patternUnits="userSpaceOnUse">
                    <rect width="8" height="8" fill="#0b0b0d" />
                    <path d="M -1,3 L 3,-1 M 0,8 L 8,0 M 5,9 L 9,5" stroke="#17171d" strokeWidth="1" />
                    <path d="M -1,7 L 7,-1 M 0,0 L 8,8 M 1,9 L 9,1" stroke="#121215" strokeWidth="0.8" />
                  </pattern>

                  {/* Radiant valley canyon fog to separate layers with incredible depth */}
                  <linearGradient id="valleyFog" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f4f6f9" stopOpacity="0" />
                    <stop offset="60%" stopColor="#e2e8f0" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="goldTextGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="30%" stopColor="#f59e0b" />
                    <stop offset="70%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Brand Titles and the 4-Icon Goal Grid in direct alignment */}
            <div className="space-y-2.5 flex-1 select-none">
              <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2">
                <h1 className="text-3xl font-black tracking-tight font-display text-white flex items-center gap-1.5 uppercase leading-none">
                  EU SOU <span className="text-amber-500">CAPAZ</span>
                </h1>
              </div>

              {/* The 4-Element Art Icons aligned neatly like the bottom of the shield */}
              <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-slate-500 text-[10px] font-mono border-t border-zinc-900/80">
                <div className="flex items-center gap-1.5 text-indigo-400 fill-indigo-400/5 group" title="Cardio & Corrida">
                  <Footprints className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Cardio</span>
                </div>
                <div className="w-px h-3 bg-zinc-800" />
                <div className="flex items-center gap-1.5 text-red-500 fill-red-500/5 group" title="Treino Academia">
                  <Dumbbell className="w-3.5 h-3.5 text-red-500" />
                  <span>Treino</span>
                </div>
                <div className="w-px h-3 bg-zinc-800" />
                <div className="flex items-center gap-1.5 text-amber-500 fill-amber-500/5 group" title="Foco & Metas">
                  <Target className="w-3.5 h-3.5 text-amber-500" />
                  <span>Foco</span>
                </div>

              </div>
            </div>
          </div>

          {/* User Profile Area or Authenticated Actions Grouped cleanly */}
          <div className="flex flex-col sm:flex-row items-center lg:items-end gap-3 shrink-0 self-center lg:self-center">
            
            {/* Connection Status Indicator pill */}
            {user && user.uid.startsWith('local_') ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 text-amber-405 text-amber-400 text-[10px] font-bold font-mono uppercase tracking-wide" title="Você está logado no Modo Offline Local!">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Modo Offline
              </div>
            ) : (
              isUsingCustomData && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />
                  Sincronizado
                </div>
              )
            )}

            {user ? (
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-850 p-1.5 pl-3.5 pr-2 rounded-2xl shadow-lg shadow-black/60">
                <div className="text-right">
                  <div className="text-xs font-bold text-stone-200 font-mono flex items-center gap-1 justify-end notranslate" translate="no">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {athleteName || user.displayName || 'Atleta'}
                  </div>
                  <button
                    onClick={onEditName}
                    className="text-[9.5px] text-amber-500 hover:text-amber-400 font-mono font-bold block hover:underline cursor-pointer"
                    title="Alterar nome"
                  >
                    Alterar Atleta
                  </button>
                </div>

                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full border border-stone-800" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-xs border border-amber-600/20 font-mono notranslate shrink-0"
                    translate="no"
                  >
                    {(athleteName || user.displayName || 'A').substring(0, 1).toUpperCase()}
                  </div>
                )}

                <button
                  onClick={onSignOut}
                  title="Sair da Conta"
                  className="p-1.5 hover:bg-red-500/10 text-stone-400 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <button
                  onClick={onSignIn}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-neutral-950 font-black px-4.5 py-2.5 rounded-xl text-xs tracking-wider transition-all shadow-lg hover:shadow-orange-500/10 hover:scale-[1.01] active:scale-95 cursor-pointer font-sans"
                  title="Fazer login usando sua Conta do Google"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  FAZER LOGIN / REGISTRAR
                </button>
                <button
                  onClick={onSignInLocal}
                  className="text-[10.5px] text-zinc-400 hover:text-amber-500 font-mono font-bold tracking-tight block hover:underline cursor-pointer bg-transparent border-none py-0.5"
                  title="Entrar offline usando apenas o seu nome de atleta, sem precisar da conta Google"
                >
                  Entrar Offline / Sem Conta (Nome)
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Flat Bottom Integration Status Row (Highly Minimalist & Structured) */}
        <div className="flex items-center gap-2 mt-5 pt-3.5 border-t border-zinc-900 text-[10px] text-zinc-500 tracking-wider font-mono">
          <span className="font-bold text-zinc-400 uppercase tracking-widest text-[9px]">Status do Sistema:</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Sincronização Integrada em Tempo Real</span>
        </div>

      </div>
    </header>
  );
}
