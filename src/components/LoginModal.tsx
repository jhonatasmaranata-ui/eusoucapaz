/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  LogIn, 
  Sparkles, 
  UserCheck, 
  AlertCircle, 
  FileLock, 
  CornerDownRight,
  ShieldCheck,
  User,
  Activity,
  Smartphone
} from 'lucide-react';
import { 
  auth 
} from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  sendPasswordResetEmail
} from 'firebase/auth';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
  onSelectLocal: () => void;
}

export function LoginModal({ onClose, onSuccess, onSelectLocal }: LoginModalProps) {
  const [authMode, setAuthMode] = useState<'email' | 'options'>('email');
  const [emailAction, setEmailAction] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = async () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        localStorage.getItem("es_capaz_pwa_installed") === "true";
      
      if (isStandaloneMode) {
        setIsInstalled(true);
        return;
      }

      if ('getInstalledRelatedApps' in navigator) {
        try {
          const relatedApps = await (navigator as any).getInstalledRelatedApps();
          if (relatedApps && relatedApps.length > 0) {
            setIsInstalled(true);
            localStorage.setItem("es_capaz_pwa_installed", "true");
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    checkInstalled();

    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem("es_capaz_pwa_installed", "true");
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    return () => window.removeEventListener("appinstalled", handleAppInstalled);
  }, []);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg("Por favor, digite seu endereço de e-mail no campo acima antes de clicar em redefinir a senha.");
      setSuccessMsg(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg("E-mail de redefinição de senha enviado! Verifique sua caixa de entrada e spam.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      let friendlyError = "Erro ao enviar redefinição de senha.";
      const code = err?.code;
      if (code === 'auth/user-not-found') {
        friendlyError = "Nenhum usuário encontrado com este e-mail.";
      } else if (code === 'auth/invalid-email') {
        friendlyError = "O e-mail digitado é inválido.";
      } else if (code === 'auth/invalid-credential') {
        friendlyError = "Falha nas credenciais de envio de redefinição de senha.";
      } else {
        friendlyError = err.message || friendlyError;
      }
      setErrorMsg(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      onSuccess(result.user);
      onClose();
    } catch (err: any) {
      console.error("Popup Google sign-in failed:", err);
      let friendlyError = "Falha ao autenticar com o Google.";
      
      if (err?.code === 'auth/unauthorized-domain') {
        friendlyError = `Este domínio não está autorizado no Firebase. Por favor, tente a opção "Login por E-mail" abaixo, que funciona instantaneamente em qualquer domínio sem restrições!`;
      } else if (err?.code === 'auth/popup-closed-by-user') {
        friendlyError = "A janela de login do Google foi fechada.";
      } else if (err?.code === 'auth/popup-blocked') {
        friendlyError = "O navegador bloqueou o popup de login. Por favor, desative o bloqueador de popups para este site.";
      } else {
        friendlyError = `Erro Google: ${err.message || 'Tente logar por e-mail.'}`;
      }
      setErrorMsg(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await signInAnonymously(auth);
      onSuccess(result.user);
      onClose();
    } catch (err: any) {
      console.error("Anonymous authentication failed:", err);
      setErrorMsg("Falha ao entrar como Convidado. Certifique-se de que o provedor 'Anônimo' está ativo no seu console Firebase, ou use a opção de E-mail!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("A senha precisa ter pelo menos 6 de tamanho.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (emailAction === 'login') {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        onSuccess(result.user);
        onClose();
      } else {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        onSuccess(result.user);
        onClose();
      }
    } catch (err: any) {
      console.error("Email auth error:", err);
      let friendlyError = "Ocorreu um erro ao processar sua solicitação.";
      
      const code = err?.code;
      if (code === 'auth/invalid-credential') {
        friendlyError = "E-mail ou senha inválidos. Se você ainda não se cadastrou, selecione a aba 'Option 2: Criar Nova Conta' logo abaixo!";
      } else if (code === 'auth/wrong-password') {
        friendlyError = "Senha inválida para o e-mail digitado.";
      } else if (code === 'auth/user-not-found') {
        friendlyError = "Nenhum usuário encontrado com este e-mail. Altere para a aba 'Criar Nova Conta' abaixo!";
      } else if (code === 'auth/email-already-in-use') {
        friendlyError = "Este endereço de e-mail já está sendo usado por outro atleta.";
      } else if (code === 'auth/invalid-email') {
        friendlyError = "O formato do e-mail digitado é inválido.";
      } else if (code === 'auth/weak-password') {
        friendlyError = "A senha informada é considerada muito fraca pelo Firebase.";
      } else if (code === 'auth/operation-not-allowed') {
        friendlyError = "O Provedor de E-mail/Senha está desativado no Firebase deste projeto. Ative-0 no console do Firebase (Authentication -> Sign-in method -> E-mail/Senha), ou use Google ou o Modo Offline!";
      } else {
        friendlyError = err.message || friendlyError;
      }
      setErrorMsg(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn" id="login-modal-overlay">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col" id="login-modal-card">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/35 rounded-xl text-amber-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-sans">Acesse o Desafio</h2>
            <p className="text-[10px] text-slate-400 font-mono">CADASTRAR OU ENTRAR COLETIVO</p>
          </div>
        </div>

        {/* Action Alert Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/45 border border-red-900/40 text-red-200 rounded-xl flex items-start gap-2.5 text-xs font-sans leading-relaxed animate-pulse">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/45 border border-emerald-950/40 text-emerald-250 rounded-xl flex items-start gap-2.5 text-xs font-sans leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{successMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Nav Tabs for Email Action */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setEmailAction('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-sans text-center transition cursor-pointer ${emailAction === 'login' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Option 1: Entrar com E-mail
            </button>
            <button
              type="button"
              onClick={() => { setEmailAction('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-sans text-center transition cursor-pointer ${emailAction === 'register' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Option 2: Criar Nova Conta
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 font-sans">
            <div className="space-y-3.5">
              <div>
                <label className="block text-slate-400 font-mono text-[10px] font-semibold mb-1 uppercase tracking-wider">Endereço de E-mail (Gmail ou outro):</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-100 text-xs rounded-xl pl-9.5 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[10px] font-semibold mb-1 uppercase tracking-wider">Senha de Acesso (mínimo 6 dígitos):</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-100 text-xs rounded-xl pl-9.5 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                {emailAction === 'login' && (
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[10px] text-amber-500 hover:text-amber-400 font-mono hover:underline transition cursor-pointer focus:outline-none"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs py-3 tracking-wider font-sans cursor-pointer flex items-center justify-center gap-1.5 transition-all active:translate-y-px"
            >
              {isLoading ? 'CONECTANDO...' : (emailAction === 'login' ? 'ACESSAR MINHA CONTA' : 'CADASTRAR CONTA ATLETA')}
              <UserCheck className="w-4 h-4" />
            </button>
          </form>

          {/* Separator line */}
          <div className="flex items-center gap-3 py-1 text-slate-600 text-[10px] font-mono justify-center">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span>OU SE PREFERIR</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          {/* Quick Alternative Login buttons */}
          <div className="space-y-2">
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <LogIn className="w-4 h-4 text-orange-400 group-hover:scale-105 transition" />
                <span className="text-xs font-bold text-slate-300">Conectar direto com o Google</span>
              </div>
              <CornerDownRight className="w-3.5 h-3.5 text-slate-600" />
            </button>

            <button
              onClick={handleAnonymousAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-105 transition" />
                <span className="text-xs font-bold text-slate-300">Entrada Rápida de Convidado</span>
              </div>
              <CornerDownRight className="w-3.5 h-3.5 text-slate-600" />
            </button>

            <button
              onClick={() => {
                onSelectLocal();
                onClose();
              }}
              className="w-full flex items-center justify-center p-2.5 bg-slate-950/40 hover:bg-slate-950 border border-dashed border-slate-850 hover:border-slate-700 rounded-xl text-[10px] font-mono text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Entrar sem internet (Modo Offline / Cache Local)
            </button>
          </div>

          {/* Install Shortcut within Login Section */}
          {!isInstalled && (
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-500 justify-center">
                <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider">Usar no Celular</span>
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('pwa-open-prompt-force'))}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500/15 to-amber-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-amber-500/30 text-amber-405 text-amber-400 font-extrabold py-2 px-4 rounded-xl text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                Instalar Aplicativo (PWA)
              </button>
              <p className="text-[9.5px] text-slate-500 text-center leading-normal">
                Adicione o painel direto na sua tela de início sem ocupar memória!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
