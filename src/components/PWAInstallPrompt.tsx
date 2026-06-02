import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X, Smartphone, Sparkles, RefreshCw, Info } from "lucide-react";

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
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Detect if app is running in installed mode (standalone)
    const isStandaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // If already installed or dismissed in this session, keep hidden
    const isDismissed = sessionStorage.getItem("es_capaz_pwa_dismissed_v2") === "true";

    // Set early-captured global event
    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
    }

    if (!isStandaloneMode && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstalled(false);
    };

    const handleGlobalPrompt = (e: any) => {
      setDeferredPrompt(e.detail);
      setIsInstalled(false);
    };

    const handleForceOpen = () => {
      setIsVisible(true);
      setShowGuide(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-prompt-available", handleGlobalPrompt);
    window.addEventListener("pwa-open-prompt-force", handleForceOpen);

    // Listen for PWA installation complete
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setIsVisible(false), 3000);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pwa-prompt-available", handleGlobalPrompt);
      window.removeEventListener("pwa-open-prompt-force", handleForceOpen);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          sessionStorage.setItem("es_capaz_pwa_dismissed_v2", "true");
          setIsVisible(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error", err);
        setShowGuide(true);
      }
    } else {
      // If deferredPrompt is null, meaning PWA is already installed or browser blocked automatic prompting
      setShowGuide(true);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("es_capaz_pwa_dismissed_v2", "true");
    setIsVisible(false);
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm z-[9999] animate-fade-in font-sans"
      id="pwa-install-banner"
    >
      <div className="bg-zinc-950/95 backdrop-blur-md border border-amber-500/30 text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-5 relative overflow-hidden">
        {/* Glow corner detail */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-white p-1 hover:bg-zinc-900 rounded-md transition-colors"
          title="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1 w-max">
                <Sparkles className="w-2.5 h-2.5" /> Aplicativo Instalável
              </span>
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-100 mt-1">
                Instalar Eu Sou Capaz
              </h4>
            </div>
          </div>

          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Tenha o painel direto na sua tela inicial! Mais rápido, leve e sem ocupar espaço de aplicativos tradicionais.
          </p>

          {/* Action Area */}
          {isIOS ? (
            /* IOS Instructions minimal and stylish */
            <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-900">
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wide">
                Como instalar no Safari (iPhone/iPad):
              </p>
              <div className="text-[11px] text-zinc-300 space-y-1.5 pl-0.5">
                <p>1. Toque em <strong>Compartilhar</strong> <Share className="w-3 h-3 text-blue-400 inline mx-0.5" /> no navegador.</p>
                <p>2. Selecione <strong>Adicionar à Tela de Início</strong> <PlusSquare className="w-3.5 h-3.5 text-zinc-300 inline mx-0.5" />.</p>
              </div>
              <button
                onClick={handleDismiss}
                className="w-full bg-zinc-800 hover:bg-zinc-750 text-white font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider transition-colors"
              >
                Entendi
              </button>
            </div>
          ) : (
            /* Android / Desktop Chrome block */
            <div className="space-y-3">
              {deferredPrompt ? (
                /* Native prompt trigger button is available */
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-extrabold py-2.5 px-4 rounded-xl text-[11px] uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.99]"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  Instalar Agora
                </button>
              ) : (
                /* No native prompt is available (Already installed, testing, or disabled by browser cache) */
                <div className="space-y-3">
                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-amber-500/30 text-amber-400 font-extrabold py-2.5 px-4 rounded-xl text-[11px] uppercase tracking-wider transition-colors hover:bg-amber-500/30"
                  >
                    <Info className="w-3.5 h-3.5 stroke-[2.5]" />
                    {showGuide ? "Ocultar Instruções" : "Como Instalar Manualmente"}
                  </button>

                  {showGuide && (
                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 space-y-2 text-[11px] text-zinc-300">
                      <p className="font-bold text-amber-400">Instalação Rápida em 2 passos:</p>
                      <div className="space-y-1">
                        <p>1. Toque nos <strong>Três Pontinhos (⋮)</strong> no canto superior do Chrome.</p>
                        <p>2. Escolha <strong>"Instalar Aplicativo"</strong> ou <strong>"Adicionar à Tela Inicial"</strong>.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Clever Note about Icon / Photo Syncing */}
          <div className="border-t border-zinc-900 pt-3 text-[10px] text-zinc-400 leading-relaxed space-y-1">
            <span className="flex items-center gap-1.5 text-amber-500/80 font-bold">
              <RefreshCw className="w-3 h-3 text-amber-500" />
              Sua foto no ícone do Celular:
            </span>
            <p>
              Se você colocou sua foto nova no app, mas o ícone da tela inicial ainda mostra a montanha, remova o atalho/app do celular e instale novamente para ver o ícone atualizado!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
