import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles, RefreshCw } from "lucide-react";

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
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const isStandaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem("es_capaz_pwa_installed") === "true";
    
    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) {
      setIsInstalled(true);
    }

    // Set early-captured global event
    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
    }

    // Also check if Chrome already installed this related app
    let isTopLevel = false;
    try {
      isTopLevel = window.self === window.top;
    } catch (e) {
      isTopLevel = false;
    }

    if (isTopLevel && 'getInstalledRelatedApps' in navigator) {
      try {
        (navigator as any).getInstalledRelatedApps().then((relatedApps: any[]) => {
          if (relatedApps && relatedApps.length > 0) {
            setIsInstalled(true);
            localStorage.setItem("es_capaz_pwa_installed", "true");
          }
        }).catch((e: any) => console.log("Check related apps skipped", e));
      } catch (e) {
        console.log("Check related apps skipped synchronously", e);
      }
    }

    const isDismissed = sessionStorage.getItem("es_capaz_pwa_dismissed_v2") === "true";

    if (!isStandaloneMode && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      (window as any).deferredPWAInstallPrompt = e;
      setIsInstalled(false);
    };

    const handleGlobalPrompt = (e: any) => {
      setDeferredPrompt(e.detail);
      (window as any).deferredPWAInstallPrompt = e.detail;
      setIsInstalled(false);
    };

    const handleForceOpen = async () => {
      setIsVisible(true);
      const currentPrompt = deferredPrompt || (window as any).deferredPWAInstallPrompt;
      if (currentPrompt) {
        setDeferredPrompt(currentPrompt);
        try {
          await currentPrompt.prompt();
          const choice = await currentPrompt.userChoice;
          if (choice.outcome === "accepted") {
            localStorage.setItem("es_capaz_pwa_installed", "true");
            setIsInstalled(true);
            setIsVisible(false);
          }
        } catch (err) {
          console.error("Install prompt error", err);
        }
      } else {
        // Fallback or warning if prompt is occupied
        console.log("No prompt available yet. Browser is preparing.");
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-prompt-available", handleGlobalPrompt);
    window.addEventListener("pwa-open-prompt-force", handleForceOpen);

    // Listen for PWA installation complete
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      localStorage.setItem("es_capaz_pwa_installed", "true");
      setDeferredPrompt(null);
      (window as any).deferredPWAInstallPrompt = null;
      setIsVisible(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pwa-prompt-available", handleGlobalPrompt);
      window.removeEventListener("pwa-open-prompt-force", handleForceOpen);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    const activePrompt = deferredPrompt || (window as any).deferredPWAInstallPrompt;
    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice.outcome === "accepted") {
          localStorage.setItem("es_capaz_pwa_installed", "true");
          setIsInstalled(true);
          setIsVisible(false);
        }
        setDeferredPrompt(null);
        (window as any).deferredPWAInstallPrompt = null;
      } catch (err) {
        console.error("Install click error", err);
      }
    } else {
      // If the prompt isn't dispatched yet, trigger native fallback helper or inform nicely
      alert("Para baixar, clique no ícone de instalar na barra de navegação superior ou aguarde o convite do seu navegador!");
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("es_capaz_pwa_dismissed_v2", "true");
    setIsVisible(false);
  };

  if (!isVisible || isStandalone || isInstalled) return null;

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
                <Sparkles className="w-2.5 h-2.5" /> Aplicativo Oficial
              </span>
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-100 mt-1">
                Instalar Eu Sou Capaz
              </h4>
            </div>
          </div>

          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Baixe o aplicativo para ter acesso direto e rápido a partir da tela inicial do seu celular, sem peso e sem gastar memória.
          </p>

          {/* Action Trigger - DIRECT BTN ONLY */}
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-extrabold py-2.5 px-4 rounded-xl text-[11px] uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.99] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            Baixar Aplicativo Agora
          </button>

          {/* Clever Note about Icon / Photo Syncing */}
          <div className="border-t border-zinc-900 pt-3 text-[10px] text-zinc-400 leading-relaxed space-y-1">
            <span className="flex items-center gap-1.5 text-amber-500/80 font-bold">
              <RefreshCw className="w-3 h-3 text-amber-500" />
              Atualização do ícone:
            </span>
            <p>
              O aplicativo será baixado com o belíssimo ícone oficial e personalizado que você escolheu no seu perfil de atleta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
