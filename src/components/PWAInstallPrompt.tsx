import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X, Smartphone, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Detect if app is already running in standalone mode (installed)
    const isStandaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isStandaloneMode);

    // Detect if platform is iOS (iPhone/iPad/iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check if user has previously dismissed or is already using installed version
    const isDismissed = localStorage.getItem("es_capaz_pwa_prompt_dismissed") === "true";

    if (!isStandaloneMode && !isDismissed) {
      // Show prompt naturally after a 4-second delay so they engage with the app first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  useEffect(() => {
    // Listen for custom beforeinstallprompt event (Android / Chrome Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Make visible when event is captured if not dismissed
      const isDismissed = localStorage.getItem("es_capaz_pwa_prompt_dismissed") === "true";
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Trigger standard browser native installation prompt
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === "accepted") {
      console.log("Usuário aceitou a instalação do aplicativo!");
      localStorage.setItem("es_capaz_pwa_prompt_dismissed", "true");
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("es_capaz_pwa_prompt_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-md z-[9999] animate-bounce-in"
      id="pwa-install-banner"
    >
      <div className="bg-slate-900 border border-zinc-800 text-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-4 sm:p-5 relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/[0.04] to-indigo-500/[0.04] pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {!expanded ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
              <Smartphone className="w-6 h-6 text-neutral-950 font-bold" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-sm font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Baixar Aplicativo!
              </h3>
              <p className="text-xs text-zinc-300 font-sans mt-0.5 font-medium leading-relaxed">
                Use o <span className="font-bold text-white">Eu Sou Capaz</span> diretamente da tela do seu celular!
              </p>
            </div>

            <button
              onClick={() => setExpanded(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all font-mono whitespace-nowrap cursor-pointer hover:scale-[1.02]"
            >
              COMO BAIXAR
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black uppercase tracking-wider font-mono text-white">
                Instalar no seu celular
              </h3>
            </div>

            {deferredPrompt ? (
              // Android / Chrome Desktop
              <div className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium">
                  Excelente! Seu navegador suporta instalação direta em 1 segundo. Clique abaixo para fixar o aplicativo em sua Home de forma totalmente gratuita e rápida.
                </p>
                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-neutral-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-[1.01]"
                  >
                    <Download className="w-4 h-4" />
                    INSTALAR AGORA
                  </button>
                  <button
                    onClick={() => setExpanded(false)}
                    className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold text-xs py-2.5 px-3.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            ) : isIOS ? (
              // Apple iOS (Safari)
              <div className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium">
                  Siga estas instruções rápidas para instalar no seu <span className="text-white font-bold">iPhone / iPad</span> sem custo:
                </p>
                
                <ol className="text-xs text-zinc-400 space-y-2 pl-1 font-sans font-medium">
                  <li className="flex items-start gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-amber-500 text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>Abra este site pelo navegador <span className="text-white font-bold">Safari</span>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-amber-500 text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      Toque no ícone de <strong>Compartilhar</strong> 
                      <Share className="w-3.5 h-3.5 text-blue-400 inline shrink-0" /> 
                      no menu inferior do Safari.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-amber-500 text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      Role para baixo e toque em <strong>Adicionar à Tela de Início</strong> 
                      <PlusSquare className="w-3.5 h-3.5 text-zinc-300 inline shrink-0" />.
                    </span>
                  </li>
                </ol>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-amber-400 border border-amber-500/20 font-black py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Entendido, farei isso!
                  </button>
                  <button
                    onClick={() => setExpanded(false)}
                    className="bg-zinc-850 hover:bg-zinc-850 text-zinc-400 font-bold text-xs py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            ) : (
              // Other browsers / Unsupported automatic install (e.g., standard Safari on Mac, Firefox without triggers)
              <div className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium">
                  Você pode usar o aplicativo no seu navegador atual ou baixá-lo adicionando-o à tela inicial do seu celular usando as opções do seu navegador de internet móvel (Chrome, Edge ou Safari).
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 bg-zinc-805 hover:bg-zinc-800 text-zinc-200 font-black py-2 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    OK, Entendido!
                  </button>
                  <button
                    onClick={() => setExpanded(false)}
                    className="bg-zinc-850 hover:bg-zinc-800 text-zinc-400 font-bold text-xs py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
