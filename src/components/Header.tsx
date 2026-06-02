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
  Sparkle,
  Smartphone
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

function LogoBadge() {
  const [logoSrcId, setLogoSrcId] = React.useState(0);
  const possiblePaths = [
    '/logo.png',
    '/logo.jpg',
    '/logo.jpeg',
    '/logo.webp',
    '/logo.svg',
    '/assets/logo.png',
    '/assets/logo.jpg',
    '/assets/logo.jpeg',
  ];

  const handleImageError = () => {
    setLogoSrcId((prev) => prev + 1);
  };

  const currentSrc = possiblePaths[logoSrcId];

  if (logoSrcId < possiblePaths.length) {
    return (
      <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] overflow-hidden border border-zinc-800 shadow-[0_12px_28px_rgba(0,0,0,0.85)] bg-[#09090b] flex items-center justify-center transition-transform duration-300 hover:scale-105" id="identical-spartan-badge">
        <img
          src={currentSrc}
          alt="Logo do Aplicativo"
          onError={handleImageError}
          className="w-full h-full object-cover select-none"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Fallback to our stunning custom vector rendering of the Man breaking Stone
  return (
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

        {/* Clipping container to keep all rendering layers cleanly contained within the squircle badge */}
        <g clipPath="url(#squircleClip)">
          {/* Dark Obsidian Canvas Background */}
          <rect x="9" y="9" width="382" height="382" fill="#0c0a09" />
          
          {/* Warm crimson-orange-golden radial backlight glow representing energy & transformation */}
          <circle cx="280" cy="200" r="180" fill="url(#transformationGlow)" />
          
          {/* Atmospheric floating glowing embers/sparks */}
          <circle cx="210" cy="120" r="1.5" fill="#f59e0b" opacity="0.6" />
          <circle cx="290" cy="100" r="2" fill="#f59e0b" opacity="0.5" />
          <circle cx="320" cy="160" r="1" fill="#fba518" opacity="0.4" />
          <circle cx="260" cy="220" r="2.5" fill="#ea580c" opacity="0.7" />
          <circle cx="230" cy="240" r="1.5" fill="#f97316" opacity="0.6" />
          <circle cx="340" cy="260" r="1" fill="#f59e0b" opacity="0.3" />

          {/* Character Group centered dynamically */}
          <g transform="translate(10, 0)">
            
            {/* LEFT SIDE: Rough, chunky, heavy outer stone/clay shell being broken away */}
            <path d="M 60,340 L 150,330 L 180,360 L 140,392 L 50,380 Z" fill="#2d2d30" stroke="#1c1c1e" strokeWidth="2" />
            <path d="M 60,340 L 140,392" stroke="#3f3f46" strokeWidth="1" />
            
            {/* Upper chunky stone shoulder cap & thick unformed helmet neck segment */}
            <path 
              d="M 90,260 
                 C 80,225 70,180 85,145 
                 C 100,110 130,95 160,95 
                 L 165,115
                 C 150,115 130,125 115,140
                 C 105,155 102,180 110,210
                 C 112,220 108,230 100,240 Z" 
              fill="#3f3f46" 
              stroke="#27272a" 
              strokeWidth="2" 
            />
            <path d="M 115,140 L 165,115" stroke="#52525b" strokeWidth="1.5" />

            {/* Unformed thick blocky stone torso left side */}
            <path 
              d="M 110,210 
                 C 65,225 50,265 62,310 
                 C 70,340 85,355 115,360 
                 L 180,345
                 L 165,280
                 L 135,220 Z" 
              fill="#27272a" 
              stroke="#18181b" 
              strokeWidth="2.5" 
            />
            {/* Stone surface fracture fissures */}
            <path d="M 70,260 L 105,290 L 135,285" stroke="#18181b" strokeWidth="2" fill="none" opacity="0.8" />
            <path d="M 85,320 L 115,300 M 115,300 L 140,335" stroke="#1c1c1f" strokeWidth="1.5" fill="none" opacity="0.7" />
            
            {/* Vivid orange-red energy lines surging through the cracking seam */}
            <path d="M 110,210 L 125,240 L 140,280 L 148,340" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95" />
            <path d="M 125,240 L 95,250" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 140,280 L 115,300" stroke="#fba518" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
            <path d="M 145,315 L 175,325" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 110,210 L 125,240 L 140,280 L 148,340" stroke="#ffedd5" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.9" />

            {/* RIGHT SIDE: Beautifully defined, highly athletic human physique emerging */}
            {/* Muscles shaded in elegant dark copper tone, rimmed with brilliant gold accents */}
            
            {/* Backlit focused head looking downward in grim focus */}
            <path 
              d="M 160,95
                 C 175,93 190,96 195,108
                 C 200,120 192,130 182,135
                 C 175,138 168,135 165,130
                 C 161,126 158,118 160,110 Z" 
              fill="#19120e" 
            />
            {/* Golden hair & cap highlights under backlight */}
            <path d="M 185,100 C 192,104 195,112 193,120 M 180,135 C 185,134 190,131 192,126" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
            
            {/* Tense neck muscles */}
            <path d="M 165,130 C 172,135 180,138 185,142 L 180,155 L 163,145 Z" fill="#201511" />
            <path d="M 185,142 C 187,146 189,150 190,154" stroke="#ea580c" strokeWidth="1.2" fill="none" />

            {/* Perfectly defined human chest & muscular torso */}
            <path 
              d="M 165,145
                 C 180,147 195,155 205,170
                 C 215,185 220,205 222,230
                 C 224,255 220,280 215,305
                 C 211,325 205,340 195,350
                 L 148,340
                 C 140,280 125,240 110,210
                 Z" 
              fill="#140f0c" 
            />
            
            {/* Pectoral structure definition */}
            <path d="M 160,165 Q 185,168 202,185 C 190,195 175,198 163,198" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
            <path d="M 160,165 Q 185,168 202,185" stroke="#ffedd5" strokeWidth="0.75" strokeLinecap="round" fill="none" opacity="0.9" />

            {/* Six-pack abs mapping */}
            {/* Muscle block 1 */}
            <path d="M 155,215 Q 175,217 190,225" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 155,215 Q 175,217 190,225" stroke="#fba518" strokeWidth="0.75" strokeLinecap="round" fill="none" opacity="0.9" />
            {/* Muscle block 2 */}
            <path d="M 152,240 Q 173,242 192,250" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
            {/* Muscle block 3 */}
            <path d="M 150,265 Q 170,268 188,277" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
            
            {/* Ribcage, obliques & tight core silhouette edges */}
            <path d="M 190,225 C 205,230 215,245 212,275 C 208,295 200,315 190,325" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
            <path d="M 190,225 C 205,230 215,245 212,275" stroke="#ffedd5" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity="0.9" />
            <path d="M 175,290 Q 195,295 205,310" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />

            {/* RIGHT ARM & SHOULDER: Raised high, pulling the sledgehammer */}
            {/* Deltoid muscle */}
            <path 
              d="M 205,170
                 C 225,165 245,170 255,185
                 C 265,200 262,220 250,235
                 C 238,245 225,240 220,230 Z" 
              fill="#1a1310" 
            />
            {/* Tricep/Deltoid outer edge golden highlight */}
            <path d="M 215,168 C 235,166 248,172 254,185 C 258,195 255,205 248,218" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M 215,168 C 235,166 248,172 254,185" stroke="#ffedd5" strokeWidth="1" strokeLinecap="round" fill="none" />

            {/* Massive loaded Bicep pointing to the hammer */}
            <path 
              d="M 252,185
                 C 268,175 285,170 300,185
                 C 310,195 305,210 290,220
                 C 275,230 262,228 250,220 Z" 
              fill="#16100c" 
            />
            <path d="M 268,175 C 285,170 298,178 304,188" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            
            {/* Solid forearm bending upwards */}
            <path 
              d="M 295,188
                 C 310,180 325,175 332,192
                 C 335,200 330,210 320,215
                 L 290,220 Z" 
              fill="#1d1612" 
            />
            <path d="M 310,180 C 322,176 328,183 331,192" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 310,180 C 322,176 328,183 331,192" stroke="#ffedd5" strokeWidth="0.5" strokeLinecap="round" fill="none" />

            {/* Clenched fist surrounding the hammer shaft */}
            <circle cx="328" cy="195" r="9" fill="#110d0a" />
            <path d="M 324,188 C 321,192 321,198 325,201" stroke="#fba518" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />

            {/* THE SLEDGEHAMMER (The tool of self-creation) */}
            {/* Metallic handle shaft */}
            <line x1="285" y1="215" x2="352" y2="181" stroke="#44403c" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="285" y1="215" x2="352" y2="181" stroke="#000000" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
            <line x1="285" y1="215" x2="352" y2="181" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />

            {/* Massive double-faced heavy metal hammer head */}
            <path 
              d="M 345,170 
                 L 375,155 
                 L 388,180 
                 L 358,195 
                 Z" 
              fill="#292524" 
              stroke="#0c0a09" 
              strokeWidth="1.5" 
            />
            {/* Hammer head front strike bevel */}
            <path 
              d="M 358,195 
                 L 388,180 
                 L 382,168 
                 L 352,183 
                 Z" 
              fill="#44403c" 
            />
            {/* Pure gold backlighting reflection along the sledgehammer */}
            <path d="M 345,170 L 375,155 L 388,180" stroke="#ffedd5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 375,155 L 358,195" stroke="#fba518" strokeWidth="1.5" fill="none" />

          </g>

          {/* FLYING JAGGED DEBRIS / SHATTERING STONE SHARDS */}
          <g transform="translate(10, 0)">
            {/* Shard 1 */}
            <polygon points="120,290 128,285 125,296" fill="#3f3f46" stroke="#18181b" strokeWidth="1" />
            {/* Shard 2 */}
            <polygon points="105,325 113,322 109,332" fill="#52525b" stroke="#18181b" strokeWidth="1" />
            {/* Shard 3 */}
            <polygon points="135,340 145,338 141,348" fill="#18181b" stroke="#09090b" strokeWidth="1" />
            {/* Shard 4 (massive falling boulder fragment) */}
            <polygon points="148,310 160,305 158,318 146,316" fill="#3f3f46" stroke="#18181b" strokeWidth="1.5" />
            {/* Shard 5 */}
            <polygon points="85,270 92,267 90,275" fill="#2d2d30" stroke="#18181b" strokeWidth="1" />
            {/* Shard 6 */}
            <polygon points="98,345 104,342 101,348" fill="#52525b" stroke="#18181b" strokeWidth="1" />
          </g>

        </g>

        {/* Gradients and Filters */}
        <defs>
          {/* Matching the outer squircle boundary perfectly */}
          <clipPath id="squircleClip">
            <rect x="9" y="9" width="382" height="382" rx="58" ry="58" />
          </clipPath>

          {/* Stunning radial energetic aura glow centered on the right athletic shoulder */}
          <radialGradient id="transformationGlow" cx="72%" cy="48%" r="65%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />    {/* Golden center reflection */}
            <stop offset="35%" stopColor="#ea580c" stopOpacity="0.25" />   {/* Orange halo */}
            <stop offset="70%" stopColor="#b45309" stopOpacity="0.1" />    {/* Dissipating deep amber */}
            <stop offset="100%" stopColor="#0c0a09" stopOpacity="0" />      {/* Pitch black border integration */}
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
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
            <LogoBadge />

            {/* Brand Titles and the 4-Icon Goal Grid in direct alignment */}
            <div className="space-y-2.5 flex-1 select-none">
              <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2">
                <h1 className="text-3xl font-black tracking-tight font-display text-white flex items-center gap-1.5 uppercase leading-none notranslate" translate="no">
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
                <div className="flex items-center gap-1.5 text-red-500 fill-red-500/5 group" title="Treino e Força">
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
            
            {/* Direct PWA Install trigger shortcut */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('pwa-open-prompt-force'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all hover:scale-[1.01]"
              title="Instalar este aplicativo no seu celular!"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
              Instalar App
            </button>

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
        <div className="flex items-center gap-1.5 mt-3.5 pt-2.5 border-t border-zinc-900/80 text-[8px] sm:text-[9px] text-zinc-500 font-mono tracking-wider select-none">
          <span className="font-semibold text-zinc-500 uppercase">Status do Sistema:</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500/80 shrink-0" />
          <span className="text-zinc-500 whitespace-nowrap">Sincronização ativa em tempo real</span>
        </div>

      </div>
    </header>
  );
}
