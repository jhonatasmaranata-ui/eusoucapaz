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
  const [showManualNotice, setShowManualNotice] = useState(false);

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

    // Check if dismissed in this session (this prevents lock-out after reinstalling/revisiting)
    const isDismissedThisSession = sessionStorage.getItem("es_capaz_pwa_dismissed_session") === "true";

    // Check if we already have the early-captured global event
    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
    }

    if (!isStandaloneMode && !isDismissedThisSession) {
      // Show immediately after a brief 1-second clean mount transition
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  useEffect(() => {
    // Listen for custom beforeinstallprompt event (Android / Chrome Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const isDismissedThisSession = sessionStorage.getItem("es_capaz_pwa_dismissed_session") === "true";
      if (!isStandalone && !isDismissedThisSession) {
        setIsVisible(true);
      }
    };

    // Listen for the custom dispatcher from index.html (in case React mounted after the event fired)
    const handleGlobalPrompt = (e: any) => {
      setDeferredPrompt(e.detail);
      
      const isDismissedThisSession = sessionStorage.getItem("es_capaz_pwa_dismissed_session") === "true";
      if (!isStandalone && !isDismissedThisSession) {
        setIsVisible(true);
      }
    };

    // Listen for manual triggers (e.g. from the Header button click)
    const handleForceOpen = () => {
      setIsVisible(true);
      setShowManualNotice(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-prompt-available", handleGlobalPrompt);
    window.addEventListener("pwa-open-prompt-force", handleForceOpen);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pwa-prompt-available", handleGlobalPrompt);
      window.removeEventListener("pwa-open-prompt-force", handleForceOpen);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        // Trigger standard browser native installation prompt
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === "accepted") {
          console.log("Usuário aceitou a instalação!");
          sessionStorage.setItem("es_capaz_pwa_dismissed_session", "true");
          setIsVisible(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Erro ao invocar prompt nativo:", err);
        setShowManualNotice(true);
      }
    } else {
      // If prompt event is not active (like on standard Chrome on certain devices or preview frames),
      // we show the helpful manual instructions instantly under the button.
      setShowManualNotice(true);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("es_capaz_pwa_dismissed_session", "true");
    setIsVisible(false);
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-md z-[9999] animate-bounce-in font-sans"
      id="pwa-install-banner"
    >
      <div className="bg-zinc-950 border-2 border-amber-500/30 text-white rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.95)] p-5 relative overflow-hidden">
        {/* Backdrop visual neon decorations */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/[0.04] to-orange-500/[0.04] pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-zinc-900 rounded-xl transition-all cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-4">
          {/* Header section */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
              <Smartphone className="w-6 h-6 text-black font-black" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-505 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                <Sparkles className="w-2.5 h-2.5" /> PWA INSTALÁVEL
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider text-white mt-1">
                INSTALAR NO CELULAR
              </h3>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            Acesse o <span className="font-bold text-white">Eu Sou Capaz</span> diretamente da sua tela de início sem precisar abrir o navegador! É leve, gratuito e instantâneo.
          </p>

          {/* Conditional paths based on platform */}
          {isIOS ? (
            // Apple Safari iOS
            <div className="space-y-3 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
              <p className="text-[11px] text-amber-400 font-bold">
                Como instalar no seu iPhone / iPad:
              </p>
              
              <ol className="text-xs text-zinc-300 space-y-2.5 pl-1 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-amber-500 text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span>Toque no botão de <strong>Compartilhar</strong> <Share className="w-3.5 h-3.5 text-blue-400 inline shrink-0 mx-1" /> no Safari.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-amber-500 text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong> <PlusSquare className="w-3.5 h-3.5 text-zinc-300 inline shrink-0 mx-1" />.</span>
                </li>
              </ol>

              <button
                onClick={handleDismiss}
                className="w-full bg-zinc-800 hover:bg-zinc-750 text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-all mt-1"
              >
                Entendi, vou fazer isso!
              </button>
            </div>
          ) : (
            // Chrome Desktop / Android / Edge (Has automatic installer support)
            <div className="space-y-3">
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-black py-3 px-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md hover:scale-[1.01] hover:shadow-orange-500/10 cursor-pointer"
              >
                <Download className="w-4 h-4 text-black stroke-[3]" />
                INSTALAR AGORA
              </button>

              {/* Seamless instruction helper displayed immediately when requested or fallback triggered */}
              {showManualNotice && (
                <div className="bg-zinc-900/90 border border-amber-500/20 p-3.5 rounded-2xl animate-fade-in space-y-2">
                  <p className="text-[11px] text-amber-400 font-black uppercase tracking-wider">
                    ⚠️ Instalação Manual Rápida:
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    Se a janela não saltou na tela automaticamente, faça isso em 5 segundos:
                  </p>
                  <ol className="text-xs text-zinc-400 space-y-2 pl-1 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">1.</span>
                      <span>Toque no botão de <strong>Três Pontinhos (⋮)</strong> no canto superior direito do seu navegador Chrome.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">2.</span>
                      <span>Toque na opção <strong>"Instalar Aplicativo"</strong> ou <strong>"Adicionar à Tela Inicial"</strong>.</span>
                    </li>
                  </ol>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-zinc-500 px-1 pt-1">
                <span>* Compatível com Chrome, Opera e Edge</span>
                <button 
                  onClick={() => setShowManualNotice(!showManualNotice)} 
                  className="text-amber-500 hover:underline font-bold"
                >
                  {showManualNotice ? "Ocultar ajuda" : "Precisa de ajuda?"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
