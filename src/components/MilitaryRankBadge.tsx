import React from 'react';

// Helper components for Military Ranks (Patentes matching the photos)
export const MilitaryStar = ({ gold, size = 15 }: { gold: boolean; size?: number; key?: React.Key }) => {
  const primaryStroke = gold ? '#f59e0b' : '#94a3b8'; // amber-500 or slate-400
  const secondaryStroke = gold ? '#fbbf24' : '#cbd5e1'; // amber-400 or slate-300
  const centerBg = '#1e40af'; // royal blue
  const coreRed = '#ef4444'; // red center star
  
  return (
    <svg 
      viewBox="0 0 24 24" 
      style={{ width: `${size}px`, height: `${size}px` }} 
      className="filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.65)] shrink-0" 
      fill="none"
    >
      {/* 8-pointed outer sunburst matching physical insignia */}
      <polygon 
        points="12,2 14.1,8.1 19.1,4.9 15.9,10.9 22,12 15.9,13.1 19.1,19.1 14.1,15.9 12,22 9.9,15.9 4.9,19.1 8.1,13.1 2,12 8.1,10.9 4.9,4.9 9.9,8.1" 
        fill={gold ? '#92400e' : '#334155'} 
        stroke={primaryStroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Outer circular gold/silver border inside the star */}
      <circle cx="12" cy="12" r="5" fill={centerBg} stroke={secondaryStroke} strokeWidth="0.8" />
      {/* Centered red star */}
      <polygon 
        points="12,9.8 12.6,11.3 14.2,11.5 13,12.5 13.4,14.1 12,13.2 10.6,14.1 11,12.5 9.8,11.2 11.4,11.3" 
        fill={coreRed} 
      />
    </svg>
  );
};

export const RankStarsRow = ({ stars, size = 15 }: { stars: boolean[]; size?: number }) => (
  <div className="flex items-center justify-center gap-0.5 py-0.5">
    {stars.map((gold, idx) => (
      <MilitaryStar key={idx} gold={gold} size={size} />
    ))}
  </div>
);

export const SubtenenteBadge = ({ size = 28 }: { size?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    style={{ width: `${size}px`, height: `${size}px` }} 
    className="filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.7)] shrink-0" 
    fill="none"
  >
    {/* Gold triangle pointing left like < outline inside the photo */}
    <polygon 
      points="17,5 7,12 17,19" 
      stroke="#f59e0b" 
      strokeWidth="3.2" 
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none" 
    />
    <polygon 
      points="16,7 8.5,12 16,17" 
      stroke="#fbbf24" 
      strokeWidth="1" 
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none" 
    />
  </svg>
);

export const MilitaryChevronBadge = ({ count, width = 36, height = 44 }: { count: number; width?: number; height?: number }) => {
  return (
    <svg 
      viewBox="0 0 50 60" 
      style={{ width: `${width}px`, height: `${height}px` }} 
      className="filter drop-shadow-[0_2px_2.5px_rgba(0,0,0,0.6)] shrink-0" 
      fill="none"
    >
      {/* Background shield in dark military slate-gray */}
      <path 
        d="M 25,2 C 25,2 47,6 47,6 C 47,6 47,40 25,58 C 3,40 3,6 3,6 Z" 
        fill="#090d12" 
        stroke="#1e293b" 
        strokeWidth="1.2" 
      />
      {/* Shield golden inner border like the golden border in photo */}
      <path 
        d="M 25,4.5 C 25,4.5 44.5,8 44.5,8 C 44.5,8 44.5,38.5 25,55 C 5.5,38.5 5.5,8 5.5,8 Z" 
        stroke="#fbbf24" 
        strokeWidth="1" 
        opacity="0.8"
      />

      {/* Crossed axes and torch insignia at the upper chest of shield */}
      <g>
        {/* Crossed axes */}
        <line x1="17" y1="9" x2="33" y2="21" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="9" x2="17" y2="21" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Axe blades */}
        <path d="M 17,9 L 14.5,7 L 14.5,12.5 Z" fill="#f59e0b" />
        <path d="M 33,9 L 35.5,7 L 35.5,12.5 Z" fill="#f59e0b" />

        {/* Central Torch */}
        <path d="M 23.5,10 L 26.5,10 L 26,22 L 24,22 Z" fill="#d97706" />
        {/* Flame in Red */}
        <path 
          d="M 25,4 C 23.5,6.5 24,8.5 25,9.5 C 26,8.5 26.5,6.5 25,4" 
          fill="#ef4444" 
        />
      </g>

      {/* Downward pointing chevrons (V-shape) spacing downwards */}
      {Array.from({ length: count }).map((_, idx) => {
        const offsetY = 23 + idx * 4.4;
        return (
          <path 
            key={idx}
            d={`M 10,${offsetY} L 25,${offsetY + 8} L 40,${offsetY}`} 
            stroke="#eab308" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none"
          />
        );
      })}
    </svg>
  );
};

export const RecrutaBadge = ({ width = 36, height = 44 }: { width?: number; height?: number }) => (
  <svg 
    viewBox="0 0 50 60" 
    style={{ width: `${width}px`, height: `${height}px` }} 
    className="filter drop-shadow-[0_2px_2.5px_rgba(0,0,0,0.6)] shrink-0" 
    fill="none"
  >
    <path 
      d="M 25,2 C 25,2 47,6 47,6 C 47,6 47,40 25,58 C 3,40 3,6 3,6 Z" 
      fill="#0b0f14" 
      stroke="#334155" 
      strokeWidth="1.2" 
    />
    <path 
      d="M 25,4.5 C 25,4.5 44.5,8 44.5,8 C 44.5,8 44.5,38.5 25,55 C 5.5,38.5 5.5,8 5.5,8 Z" 
      stroke="#475569" 
      strokeWidth="1" 
    />
    {/* Recruta symbol: simple crossed training axes or shield insignia */}
    <g stroke="#475569" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
      <line x1="18" y1="18" x2="32" y2="32" />
      <line x1="32" y1="18" x2="18" y2="32" />
      <circle cx="25" cy="25" r="3.5" fill="#1e293b" />
    </g>
    <text x="25" y="45" fill="#475569" fontSize="6" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">RECRUTA</text>
  </svg>
);

export interface MilitaryRankInfo {
  name: string;
  icon: React.ReactNode;
  bgClass: string;
}

export const getMilitaryRankInfo = (rank: number): MilitaryRankInfo => {
  if (rank === 1) {
    return {
      name: "Coronel",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
          <RankStarsRow stars={[true, true, true]} />
          <span className="text-[7.5px] font-bold text-amber-400 font-mono tracking-tighter leading-none mt-0.5">CORONEL</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-amber-500/50 shadow-md shadow-amber-500/10"
    };
  }
  if (rank === 2) {
    return {
      name: "Tenente-Coronel",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
          {/* Duas estrelas douradas e uma prateada */}
          <RankStarsRow stars={[true, true, false]} />
          <span className="text-[7.5px] font-bold text-slate-300 font-mono tracking-tighter leading-none mt-0.5">TEN-CORONEL</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-slate-400/40"
    };
  }
  if (rank === 3) {
    return {
      name: "Major",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
          {/* Uma dourada e duas prateadas */}
          <RankStarsRow stars={[true, false, false]} />
          <span className="text-[7.5px] font-bold text-slate-400 font-mono tracking-tighter leading-none mt-0.5">MAJOR</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-slate-500/35"
    };
  }
  if (rank === 4) {
    return {
      name: "Capitão",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
          {/* Três estrelas prateadas */}
          <RankStarsRow stars={[false, false, false]} />
          <span className="text-[7.5px] font-bold text-slate-400 font-mono tracking-tighter leading-none mt-0.5">CAPITÃO</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-slate-600/30"
    };
  }
  if (rank === 5) {
    return {
      name: "1º Tenente",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
          {/* Duas estrelas prateadas */}
          <RankStarsRow stars={[false, false]} />
          <span className="text-[7.5px] font-bold text-slate-400 font-mono tracking-tighter leading-none mt-0.5">1º TENENTE</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-slate-700/25"
    };
  }
  if (rank === 6) {
    return {
      name: "2º Tenente",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
          {/* Uma estrela prateada */}
          <RankStarsRow stars={[false]} />
          <span className="text-[7.5px] font-bold text-slate-455 font-mono tracking-tighter leading-none mt-0.5">2º TENENTE</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-slate-700/20"
    };
  }
  if (rank === 7) {
    return {
      name: "Subtenente",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
          <SubtenenteBadge />
          <span className="text-[7.5px] font-bold text-amber-500 font-mono tracking-tighter leading-none mt-0.5">SUBTE</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-amber-600/30"
    };
  }
  if (rank === 8) {
    return {
      name: "1º Sargento",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <MilitaryChevronBadge count={5} />
          <span className="text-[7px] font-bold text-amber-400 font-mono tracking-tighter leading-none mt-0.5">1º SGT</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-emerald-600/30"
    };
  }
  if (rank === 9) {
    return {
      name: "2º Sargento",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <MilitaryChevronBadge count={4} />
          <span className="text-[7px] font-bold text-slate-350 font-mono tracking-tighter leading-none mt-0.5">2º SGT</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-slate-700/25"
    };
  }
  if (rank === 10) {
    return {
      name: "3º Sargento",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <MilitaryChevronBadge count={3} />
          <span className="text-[7px] font-bold text-slate-400 font-mono tracking-tighter leading-none mt-0.5">3º SGT</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-slate-800"
    };
  }
  if (rank === 11) {
    return {
      name: "Cabo",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <MilitaryChevronBadge count={2} />
          <span className="text-[7.5px] font-bold text-slate-400 font-mono tracking-tighter leading-none mt-0.5">CABO</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-slate-800"
    };
  }
  if (rank === 12) {
    return {
      name: "Soldado",
      icon: (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <MilitaryChevronBadge count={1} />
          <span className="text-[7.5px] font-bold text-slate-455 font-mono tracking-tighter leading-none mt-0.5">SOLDADO</span>
        </div>
      ),
      bgClass: "from-slate-950 to-slate-900 border-slate-850"
    };
  }

  // Default and Recruta (rank >= 13)
  return {
    name: "Recruta",
    icon: (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <RecrutaBadge />
        <span className="text-[7.5px] font-bold text-slate-500 font-mono tracking-tighter leading-none mt-0.5">RECRUTA</span>
      </div>
    ),
    bgClass: "from-slate-950 to-slate-900 border-slate-850"
  };
};

export const getMiniInsignia = (rank: number, size: number = 13) => {
  if (rank === 1) return <RankStarsRow stars={[true, true, true]} size={size} />;
  if (rank === 2) return <RankStarsRow stars={[true, true, false]} size={size} />;
  if (rank === 3) return <RankStarsRow stars={[true, false, false]} size={size} />;
  if (rank === 4) return <RankStarsRow stars={[false, false, false]} size={size} />;
  if (rank === 5) return <RankStarsRow stars={[false, false]} size={size} />;
  if (rank === 6) return <RankStarsRow stars={[false]} size={size} />;
  if (rank === 7) return <SubtenenteBadge size={size + 3} />;
  if (rank === 8) return <MilitaryChevronBadge count={5} width={size + 5} height={size + 9} />;
  if (rank === 9) return <MilitaryChevronBadge count={4} width={size + 5} height={size + 9} />;
  if (rank === 10) return <MilitaryChevronBadge count={3} width={size + 5} height={size + 9} />;
  if (rank === 11) return <MilitaryChevronBadge count={2} width={size + 5} height={size + 9} />;
  if (rank === 12) return <MilitaryChevronBadge count={1} width={size + 5} height={size + 9} />;
  return <RecrutaBadge width={size + 5} height={size + 9} />;
};

