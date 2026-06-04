/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Última sincronização e atualização de segurança do Firebase: 2026-05-26 12:30 UTC

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Leaderboard } from './components/Leaderboard';
import { ParticipantDetails } from './components/ParticipantDetails';
import { AddActivityForm } from './components/AddActivityForm';
import { RegistrationModal } from './components/RegistrationModal';
import { LoginModal } from './components/LoginModal';
import { ChallengeSection } from './components/ChallengeSection';
import { GroupManager } from './components/GroupManager';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Challenge, Activity, RuleConfig, GroupChallenge, GroupMember, UserProfile } from './types';
import { calculateScores, INITIAL_MOCK_ACTIVITIES, DEFAULT_RULES, getGlobalChallengeRules, isSameAthlete, extractGroupCode } from './utils';
import { parseFradeActivities, FRADE_MEMBERS } from './data/fradeChallenge';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  query, 
  orderBy, 
  onSnapshot,
  getDocFromServer,
  deleteField
} from 'firebase/firestore';
import { 
  Dumbbell, 
  Route, 
  Flame, 
  Calculator, 
  SlidersHorizontal,
  Info,
  Lock,
  Unlock,
  CalendarDays,
  Trophy,
  CheckSquare
} from 'lucide-react';

export default function App() {
  // 1. Group Selector & Routing Configuration
  const [activeGroupId, setActiveGroupId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      let urlGroup = urlParams.get('group') || urlParams.get('g');
      
      // Dynamic case-insensitive query parameter lookups for absolute user resilience
      if (!urlGroup) {
        for (const [key, value] of urlParams.entries()) {
          const lowerKey = key.toLowerCase();
          if (lowerKey === 'group' || lowerKey === 'g') {
            urlGroup = value;
            break;
          }
        }
      }

      if (urlGroup) {
        const cleaned = extractGroupCode(urlGroup);
        if (cleaned) {
          localStorage.setItem('es_capaz_active_group_id', cleaned);
          return cleaned;
        }
      }
      const stored = localStorage.getItem('es_capaz_active_group_id') || 'demo-group';
      if (stored === 'EMPTY-PRIVATE') return 'EMPTY-PRIVATE';
      return extractGroupCode(stored) || 'demo-group';
    }
    return 'demo-group';
  });

  const [localGroups, setLocalGroups] = useState<Record<string, GroupChallenge>>(() => {
    try {
      return JSON.parse(localStorage.getItem('local_groups_data') || '{}');
    } catch (_) {
      return {};
    }
  });

  const [localMembers, setLocalMembers] = useState<Record<string, GroupMember[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem('local_groups_members') || '{}');
    } catch (_) {
      return {};
    }
  });

  const [groupDetails, setGroupDetails] = useState<GroupChallenge | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [userGroups, setUserGroups] = useState<{ id: string; name: string }[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('local_groups_data') || '{}');
      return Object.values(stored).map((g: any) => ({
        id: g.id,
        name: g.name
      }));
    } catch (_) {
      return [];
    }
  });

  // 2. React Core States
  const translateFirebaseError = (msg: string | unknown): string => {
    if (!msg) return '';
    const errorStr = msg instanceof Error ? msg.message : String(msg);
    const lower = errorStr.toLowerCase();

    if (lower.includes('permission-denied') || lower.includes('insufficient permissions') || lower.includes('permissão negada')) {
      return `🚨 Erro de Permissão do Firebase:\n\nAs Regras de Segurança do Firestore no seu projeto Firebase (eusoucapazapp) estão impedindo esta ação.\n\nPara corrigir:\n1. Certifique-se de implantar o arquivo 'firestore.rules' em seu projeto de produção.\n2. Verifique se o seu usuário está devidamente logado e associado para gravação no grupo.`;
    }
    if (lower.includes('unauthorized-domain') || lower.includes('host') || lower.includes('auth/unauthorized-domain')) {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'seu site';
      return `🚨 Domínio Não Autorizado no Firebase!\n\nPara liberar o login no endereço atual (${host}), você precisa autorizar este link no console do seu Firebase:\n\n1. Copie o domínio atual: ${host}\n2. Acesse a página do seu Firebase Console (projeto eusoucapazapp):\nhttps://console.firebase.google.com/project/eusoucapazapp/authentication/providers\n3. Role até a seção "Domínios autorizados" e clique em "Adicionar domínio".\n4. Cole o link do domínio copiado e clique em salvar! O login popup começará a funcionar no mesmo instante.`;
    }
    if (lower.includes('timeout') || lower.includes('tempo limite') || lower.includes('tempo de resposta')) {
      return `⚠️ Tempo Limite Esgotado:\n\nNão foi possível se comunicar com o servidor Firestore dentro do prazo esperado.\n\nSe você estiver usando um projeto Firebase recém-criado ou personalizado, certifique-se de:\n1. Criar o banco de dados Cloud Firestore no Console do seu Firebase.\n2. Iniciar o Firestore em "Modo Produção" ou habilitar as regras de acesso apropriadas.`;
    }
    if (lower.includes('not-found') || lower.includes('não encontrado')) {
      return `🔍 Grupo ou Documento não encontrado no banco de dados. Verifique se o código está correto e tente novamente!`;
    }
    return errorStr;
  };

  const [activities, setActivities] = useState<Activity[]>(INITIAL_MOCK_ACTIVITIES);
  const [isUsingCustomData, setIsUsingCustomData] = useState(false);
  const [rules, setRules] = useState<RuleConfig>(() => {
    if (activeGroupId === 'demo-group') {
      return getGlobalChallengeRules();
    }
    return DEFAULT_RULES;
  });
  const [selectedParticipantName, setSelectedParticipantName] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showResetChallengeConfirm, setShowResetChallengeConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'painel' | 'registrar' | 'classificacao'>('painel');

  const isChallengeActive = useMemo(() => {
    if (!rules.startDate) return false;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    const start = rules.startDate;
    const end = rules.endDate;
    
    if (!end) {
      return todayStr >= start;
    }
    
    return todayStr >= start && todayStr <= end;
  }, [rules.startDate, rules.endDate]);

  const isChallengeLocked = useMemo(() => {
    if (!rules.startDate) return false;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    const start = rules.startDate;
    const end = rules.endDate;
    
    // Se passou da data de término, o desafio acabou e está livre para ser editado / criar outro
    if (end && todayStr > end) {
      return false;
    }
    
    // Caso contrário, se tem data de início, está criado e não acabou, logo fica bloqueado
    return true;
  }, [rules.startDate, rules.endDate]);

  const handleResetOrNewChallenge = async () => {
    const updatedRules: RuleConfig = {
      ...rules,
      startDate: '', // Limpa datas para destravar e permitir configurar novo desafio
      endDate: ''
    };
    
    setRules(updatedRules);
    setShowResetChallengeConfirm(false);
    
    if (activeGroupId !== 'demo-group' && user && groupDetails && groupDetails.creatorId === user.uid && !user.uid.startsWith('local_')) {
      try {
        const docRef = doc(db, 'groups', activeGroupId);
        await setDoc(docRef, { rules: updatedRules }, { merge: true });
      } catch (e) {
        console.error("Rules save blocked by security rules:", e);
      }
    }
  };

  // Authentications states
  const [user, setUser] = useState<User | null>(null);
  const [athleteName, setAthleteName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRegistrationPending, setIsRegistrationPending] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isSychronizationNotice = useMemo(() => {
    if (!authError) return false;
    const lower = authError.toLowerCase();
    return lower.includes('localmente') || 
           lower.includes('sincronização') || 
           lower.includes('offline') || 
           lower.includes('contingência') || 
           lower.includes('conectar') || 
           lower.includes('metas') || 
           lower.includes('aviso de') ||
           lower.includes('comunicar') ||
           lower.includes('banco de dados') ||
           lower.includes('failed to get document') ||
           lower.includes('client is offline');
  }, [authError]);

  // Validate Connection on mount (Skill checklist mandatory requirement)
  useEffect(() => {
    async function testConnection() {
      try {
        const ref = doc(db, 'groups', 'connection_test_doc');
        await getDocFromServer(ref);
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Sync Auth State & Profile Registration Mapping
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const fallbackName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Atleta';
        setAthleteName(fallbackName);
        
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            setAthleteName(profileData.athleteName || fallbackName);
            setUserRole(profileData.role || 'user');
            
            // Map joinedGroups
            if (profileData.joinedGroups) {
              const list = Object.entries(profileData.joinedGroups).map(([id, details]: [string, any]) => ({
                id,
                name: details.name || id
              }));
              setUserGroups(list);
            } else {
              setUserGroups([]);
            }
            setIsRegistrationPending(false);
          } else {
            // Initiate automatic schema registration record
            setIsRegistrationPending(true);
            setAthleteName(fallbackName);
            setUserRole('user');
            try {
              await setDoc(userDocRef, {
                athleteName: fallbackName,
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || '',
                registeredAt: new Date().toISOString(),
                role: 'user',
                joinedGroups: {}
              });
            } catch (err) {
              console.error("Auto registration document write failed:", err);
            }
          }
        } catch (error: any) {
          console.error("Error fetching reader profile from Firestore:", error);
          setAthleteName(fallbackName);
          setUserRole('user');
          const errMessage = error instanceof Error ? error.message : String(error);
          if (errMessage.includes('permission-denied') || errMessage.includes('Missing or insufficient permissions')) {
            setAuthError(translateFirebaseError(error));
          }
        }
      } else {
        const localUserRaw = localStorage.getItem('es_capaz_simulated_user');
        if (localUserRaw) {
          try {
            const parsed = JSON.parse(localUserRaw);
            if (parsed && parsed.uid) {
              setUser(parsed);
              setAthleteName(parsed.displayName);
              setUserRole('user');
              return;
            }
          } catch (_) {}
        }
        setAthleteName(null);
        setUserRole(null);
        setUserGroups([]);
        setIsRegistrationPending(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update dynamic list of User groups continuously in the profile
  useEffect(() => {
    if (!user) return;

    // Get the blacklist of left groups to filter out of the UI and cache
    const getLeftGroupsSet = () => {
      const leftGroupsRaw = localStorage.getItem('es_capaz_left_group_ids');
      let leftGroupsSet = new Set<string>();
      if (leftGroupsRaw) {
        try {
          const parsed = JSON.parse(leftGroupsRaw);
          if (Array.isArray(parsed)) {
            leftGroupsSet = new Set(parsed);
          }
        } catch (_) {}
      }
      return leftGroupsSet;
    };

    if (user.uid.startsWith('local_')) {
      const rawLocalData = localStorage.getItem('local_groups_data');
      let currentLocalKeysObj: Record<string, any> = {};
      try {
        if (rawLocalData) {
          currentLocalKeysObj = JSON.parse(rawLocalData);
        }
      } catch (_) {}
      
      const leftGroupsSet = getLeftGroupsSet();
      const merged = Object.values(currentLocalKeysObj)
        .filter((lg: any) => lg && lg.id && !leftGroupsSet.has(lg.id))
        .map((lg: any) => ({
          id: lg.id,
          name: lg.name || lg.id
        }));
      setUserGroups(merged);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsub = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const profileData = snap.data() as UserProfile;
        const joinedGroupsData = profileData.joinedGroups || {};
        
        const leftGroupsSet = getLeftGroupsSet();
        const list = Object.entries(joinedGroupsData)
          .map(([id, details]: [string, any]) => ({
            id,
            name: details.name || id
          }))
          .filter(g => !leftGroupsSet.has(g.id));
        
        // Merge offline/local groups only if they are still officially saved in localStorage and not left
        const onlineIds = new Set(list.map(g => g.id));
        const merged = [...list];
        
        const rawLocalData = localStorage.getItem('local_groups_data');
        let currentLocalKeysObj: Record<string, any> = {};
        let cacheChanged = false;
        try {
          if (rawLocalData) {
            currentLocalKeysObj = JSON.parse(rawLocalData);
          }
        } catch (_) {}

        // Auto-sync any group found in online list to the local storage cache if missing (e.g. on new device)
        list.forEach(g => {
          if (!currentLocalKeysObj[g.id]) {
            currentLocalKeysObj[g.id] = {
              id: g.id,
              name: g.name,
              description: 'Sincronizado da sua conta',
              creatorId: 'cloud_sync',
              inviteCode: g.id,
              rules: DEFAULT_RULES,
              createdAt: new Date().toISOString()
            };
            cacheChanged = true;
          }
        });

        if (cacheChanged) {
          localStorage.setItem('local_groups_data', JSON.stringify(currentLocalKeysObj));
          setLocalGroups(currentLocalKeysObj);
        }

        Object.values(currentLocalKeysObj).forEach((lg: any) => {
          if (lg && lg.id && !onlineIds.has(lg.id) && !leftGroupsSet.has(lg.id)) {
            merged.push({ id: lg.id, name: lg.name || lg.id });
          }
        });
        setUserGroups(merged);
      }
    }, (error) => {
      console.warn("Could not list user groups from profile:", error);
    });
    return () => unsub();
  }, [user]);

  // Auto-join group if user lands on an invite URL link with activeGroupId query parameter
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    
    // Dynamic case-insensitive or standard parameter check
    let inviteParamName = '';
    for (const key of urlParams.keys()) {
      const lk = key.toLowerCase();
      if (lk === 'group' || lk === 'g') {
        inviteParamName = key;
        break;
      }
    }

    if (inviteParamName && user && athleteName) {
      const urlValue = urlParams.get(inviteParamName);
      const codeToJoin = urlValue ? extractGroupCode(urlValue) : null;
      
      if (!codeToJoin) return;

      // Check if group is in left blacklist
      const leftGroupsRaw = localStorage.getItem('es_capaz_left_group_ids');
      let leftGroupsSet = new Set<string>();
      if (leftGroupsRaw) {
        try {
          const parsed = JSON.parse(leftGroupsRaw);
          if (Array.isArray(parsed)) {
            leftGroupsSet = new Set(parsed);
          }
        } catch (_) {}
      }

      if (leftGroupsSet.has(codeToJoin)) {
        // User explicitly left this group in this session - DO NOT auto-join it again!
        // Clean up URL parameter/invite link immediately so it does not persist or auto-rejoin
        const url = new URL(window.location.href);
        const keysToDelete: string[] = [];
        for (const key of url.searchParams.keys()) {
          const lk = key.toLowerCase();
          if (lk === 'group' || lk === 'g') {
            keysToDelete.push(key);
          }
        }
        keysToDelete.forEach(k => url.searchParams.delete(k));
        window.history.pushState({}, '', url.pathname + url.search);
        return;
      }

      const alreadyJoined = userGroups.some(g => g.id === codeToJoin);
      if (!alreadyJoined) {
        console.log("Auto-joining challenge from URL link:", codeToJoin);
        handleJoinGroup(codeToJoin)
          .then(() => {
            console.log("Auto-join completed successfully");
            const url = new URL(window.location.href);
            const keysToDelete: string[] = [];
            for (const key of url.searchParams.keys()) {
              const lk = key.toLowerCase();
              if (lk === 'group' || lk === 'g') {
                keysToDelete.push(key);
              }
            }
            keysToDelete.forEach(k => url.searchParams.delete(k));
            window.history.pushState({}, '', url.pathname + url.search);
          })
          .catch(err => {
            console.warn("Auto-join did not complete, user will fallback to manual join:", err);
            const url = new URL(window.location.href);
            const keysToDelete: string[] = [];
            for (const key of url.searchParams.keys()) {
              const lk = key.toLowerCase();
              if (lk === 'group' || lk === 'g') {
                keysToDelete.push(key);
              }
            }
            keysToDelete.forEach(k => url.searchParams.delete(k));
            window.history.pushState({}, '', url.pathname + url.search);
          });
      } else {
        console.log("User has already joined the group, cleaning up invite parameters from URL immediately to prevent future rejoin loops");
        const url = new URL(window.location.href);
        const keysToDelete: string[] = [];
        for (const key of url.searchParams.keys()) {
          const lk = key.toLowerCase();
          if (lk === 'group' || lk === 'g') {
            keysToDelete.push(key);
          }
        }
        keysToDelete.forEach(k => url.searchParams.delete(k));
        window.history.pushState({}, '', url.pathname + url.search);
      }
    }
  }, [user, athleteName, userGroups]);

  // Master Access Control
  const isModerator = useMemo(() => {
    if (!user) return false;
    if (user.email === 'jhonatasmaranata@gmail.com') return true;
    if (activeGroupId === 'demo-group') return true; // allow everyone to customize rules on the demonstration group
    return groupDetails?.creatorId === user.uid || userRole === 'admin' || userRole === 'moderator';
  }, [user, userRole, activeGroupId, groupDetails]);

  // 3. Dynamic Subscriptions per Selected Group Ingress Route
  // A. Subscription: Group Rules definition
  useEffect(() => {
    if (!activeGroupId || activeGroupId === 'EMPTY-PRIVATE') {
      setGroupDetails(null);
      setRules(DEFAULT_RULES);
      return;
    }
    if (activeGroupId === 'demo-group') {
      setGroupDetails(null);
      setRules(getGlobalChallengeRules());
      return;
    }

    // Load from local storage immediately if available
    const rawLocalData = typeof window !== 'undefined' ? localStorage.getItem('local_groups_data') : null;
    let offlineGroup: GroupChallenge | null = null;
    try {
      if (rawLocalData) {
        const parsed = JSON.parse(rawLocalData);
        offlineGroup = parsed ? parsed[activeGroupId] : null;
      }
    } catch (_) {}

    if (offlineGroup) {
      setGroupDetails(offlineGroup);
      if (offlineGroup.rules) {
        setRules(offlineGroup.rules);
      }
    }

    const unsub = onSnapshot(doc(db, 'groups', activeGroupId), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as GroupChallenge;
        setGroupDetails(data);
        if (data.rules) {
          setRules(data.rules);
        }
        // Save to cache only if we didn't voluntarily leave this group
        setLocalGroups(prev => {
          const isStillInStorage = (() => {
            try {
              const raw = localStorage.getItem('local_groups_data');
              const parsed = raw ? JSON.parse(raw) : null;
              return !!(parsed && parsed[activeGroupId]);
            } catch (_) {
              return false;
            }
          })();
          if (activeGroupId && activeGroupId !== 'demo-group' && (!prev[activeGroupId] || !isStillInStorage)) {
            return prev;
          }
          const updated = { ...prev, [activeGroupId]: data };
          localStorage.setItem('local_groups_data', JSON.stringify(updated));
          return updated;
        });
      } else {
        if (activeGroupId === '99H0DP') {
          const defaultFradeGroup: GroupChallenge = {
            id: '99H0DP',
            name: 'DESAFIO DO FRADE',
            description: 'Desafio ativo do Frade com ranking e pontuação dos atletas.',
            creatorId: 'local_proxy',
            inviteCode: '99H0DP',
            rules: {
              startDate: '2026-05-11',
              endDate: '2026-06-11',
              gymPointsPerCheckIn: 5,
              distanceMultiplier: 1.0,
              comboPointsPerDay: 10,
            },
            createdAt: new Date().toISOString()
          };
          setGroupDetails(defaultFradeGroup);
          setRules(defaultFradeGroup.rules);
          if (user && !user.uid.startsWith('local_')) {
            setDoc(doc(db, 'groups', '99H0DP'), defaultFradeGroup)
              .catch(e => console.warn("Self-healing group setup deferred:", e));
          }
        } else if (offlineGroup) {
          // Self-healing: If we are logged in and this group doesn't exist on Firestore yet, upload it!
          if (user && !user.uid.startsWith('local_')) {
            console.log("Self-healing: Uploading offline group registry to Cloud:", activeGroupId);
            setDoc(doc(db, 'groups', activeGroupId), offlineGroup)
              .then(() => console.log("Self-healing: Group synced to Firestore successfully."))
              .catch(err => console.warn("Self-healing: Group sync deferred due to connection:", err));
          }
        } else {
          console.warn(`Group ${activeGroupId} not found. Reverting to sandbox demo.`);
          setActiveGroupId('demo-group');
        }
      }

    }, (error) => {
      console.warn("Could not load group custom configuration in real-time:", error);
    });

    return () => unsub();
  }, [activeGroupId, user]);

  // B. Subscription: Enrolled Group members
  useEffect(() => {
    if (!activeGroupId || activeGroupId === 'EMPTY-PRIVATE') {
      setGroupMembers([]);
      return;
    }
    if (activeGroupId === 'demo-group') {
      const mockMembers: GroupMember[] = [
        { userId: 'm1', athleteName: 'Almeida', email: 'a@c.com', role: 'member', joinedAt: '2026-05-01' },
         { userId: 'm2', athleteName: 'Alex Bispo', email: 'ab@c.com', role: 'member', joinedAt: '2026-05-01' },
         { userId: 'm3', athleteName: 'Braga', email: 'b@c.com', role: 'member', joinedAt: '2026-05-01' },
         { userId: 'm4', athleteName: 'Martins', email: 'm@c.com', role: 'member', joinedAt: '2026-05-01' },
         { userId: 'm5', athleteName: 'Diego Tavares', email: 'd@c.com', role: 'member', joinedAt: '2026-05-01' },
         { userId: 'm6', athleteName: 'Solange', email: 's@c.com', role: 'member', joinedAt: '2026-05-01' },
         { userId: 'm7', athleteName: 'Elieser', email: 'e@c.com', role: 'member', joinedAt: '2026-05-01' },
         { userId: 'm8', athleteName: 'Quintanilha', email: 'q@c.com', role: 'member', joinedAt: '2026-05-01' }
      ];
      setGroupMembers(mockMembers);
      return;
    }

    // Load from local storage immediately if available
    const rawRoster = typeof window !== 'undefined' ? localStorage.getItem('local_groups_members') : null;
    let offlineRoster: GroupMember[] | null = null;
    try {
      if (rawRoster) {
        const parsed = JSON.parse(rawRoster);
        offlineRoster = parsed ? parsed[activeGroupId] : null;
      }
    } catch (_) {}

    if (offlineRoster) {
      setGroupMembers(offlineRoster);
    }

    const colRef = collection(db, 'groups', activeGroupId, 'members');
    const unsub = onSnapshot(colRef, (snapshot) => {
      const rosterList: GroupMember[] = [];
      snapshot.forEach((docSnap) => {
        rosterList.push(docSnap.data() as GroupMember);
      });

      const isStillInGroupLocalStorage = (() => {
        try {
          const raw = localStorage.getItem('local_groups_data');
          const parsed = raw ? JSON.parse(raw) : null;
          return !!(parsed && parsed[activeGroupId]);
        } catch (_) {
          return false;
        }
      })();

      if (rosterList.length > 0) {
        setGroupMembers(rosterList);
        setLocalMembers(prev => {
          if (activeGroupId && activeGroupId !== 'demo-group' && (!prev[activeGroupId] || !isStillInGroupLocalStorage)) {
            return prev;
          }
          const updated = { ...prev, [activeGroupId]: rosterList };
          localStorage.setItem('local_groups_members', JSON.stringify(updated));
          return updated;
        });
      } else {
        const cachedRoster = (() => {
          try {
            const raw = localStorage.getItem('local_groups_members');
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed ? (parsed[activeGroupId] || []) : [];
          } catch (_) {
            return [];
          }
        })();
        if (cachedRoster.length > 0) {
          setGroupMembers(cachedRoster);
        } else if (activeGroupId === '99H0DP') {
          setGroupMembers(FRADE_MEMBERS);
        }
      }


      // SELF-HEALING SYSTEM: If online, make sure our current logged user is registered in the cloud group roster
      // BUT ONLY if the group is still active in their profile/local list (they didn't voluntarily leave/unsubscribe)
      if (user && athleteName && !user.uid.startsWith('local_')) {
        const isUserInCloudRoster = rosterList.some(m => m.userId === user.uid);
        const hasJoinedInProfile = isStillInGroupLocalStorage;
        if (!isUserInCloudRoster && hasJoinedInProfile) {
          console.log("Self-healing: Uploading cached local membership to cloud for group:", activeGroupId);
          const memberPayload: GroupMember = {
            userId: user.uid,
            athleteName,
            email: user.email || '',
            photoURL: user.photoURL || '',
            role: 'member',
            joinedAt: new Date().toISOString()
          };
          const memberDocRef = doc(db, 'groups', activeGroupId, 'members', user.uid);
          setDoc(memberDocRef, memberPayload)
            .then(() => console.log("Self-healing: Local status synced to the cloud."))
            .catch(err => console.warn("Self-healing: Sync blocked or delayed:", err));
        }
      }
    }, (err) => {
      console.warn("Could not retrieve group members in real-time:", err);
    });

    return () => unsub();
  }, [activeGroupId, user, athleteName]);

  // C. Subscription: Group workout Activities
  useEffect(() => {
    if (!activeGroupId || activeGroupId === 'EMPTY-PRIVATE') {
      setActivities([]);
      setIsUsingCustomData(false);
      return;
    }
    if (activeGroupId === 'demo-group') {
      setActivities(INITIAL_MOCK_ACTIVITIES);
      setIsUsingCustomData(false);
      return;
    }

    const q = query(collection(db, 'groups', activeGroupId, 'activities'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let liveActivities: Activity[] = [];
      snapshot.forEach((snapDoc) => {
        liveActivities.push({
          id: snapDoc.id,
          ...snapDoc.data()
        } as Activity);
      });

      // Maintain baseline Frade spreadsheet activities even after new live workouts are posted to Firestore
      let mergedActivities: Activity[] = [];
      if (activeGroupId === '99H0DP') {
        const fradeBaseline = parseFradeActivities();
        const activityMap = new Map<string, Activity>();
        
        fradeBaseline.forEach(act => {
          activityMap.set(act.id, act);
        });
        
        // Let live online workouts from Firestore overwrite or append to the baseline list by unique activity ID
        liveActivities.forEach(liveAct => {
          activityMap.set(liveAct.id, liveAct);
        });
        
        mergedActivities = Array.from(activityMap.values());
      } else {
        mergedActivities = liveActivities;
      }

      if (mergedActivities.length > 0) {
        setIsUsingCustomData(true);
      }


      setActivities(() => {
        // Load custom local backup to preserve offline entries
        let localCustoms: Activity[] = [];
        const localKey = `es_capaz_${activeGroupId}_local_activities`;
        const localSaved = localStorage.getItem(localKey);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved) as Activity[];
            if (Array.isArray(parsed)) {
              localCustoms = parsed;
            }
          } catch (_) {}
        }

        const mergedIds = new Set(mergedActivities.map(a => a.id));
        let needsClearing = false;

        const unsyncedLocals = localCustoms.filter(localAct => {
          if (mergedIds.has(localAct.id)) {
            needsClearing = true;
            return false;
          }
          
          const hasCloudMatch = mergedActivities.some(liveAct => 
            liveAct.name === localAct.name &&
            liveAct.type === localAct.type &&
            liveAct.date === localAct.date &&
            Math.abs((liveAct.distance || 0) - (localAct.distance || 0)) < 0.01 &&
            liveAct.timestamp === localAct.timestamp
          );

          if (hasCloudMatch) {
            needsClearing = true;
            return false;
          }

          return true;
        });

        if (needsClearing) {
          try {
            localStorage.setItem(localKey, JSON.stringify(unsyncedLocals));
          } catch (_) {}
        }

        // SELF-HEALING AUTOMATIC SYNC: Upload offline local workouts to cloud
        if (unsyncedLocals.length > 0 && user && athleteName && !user.uid.startsWith('local_')) {
          console.log(`Self-healing: Uploading ${unsyncedLocals.length} offline activities to cloud...`);
          const colRef = collection(db, 'groups', activeGroupId, 'activities');
          unsyncedLocals.forEach(act => {
            const cleanedActivity = Object.fromEntries(
              Object.entries({
                name: act.name,
                type: act.type,
                distance: act.distance,
                date: act.date,
                timestamp: act.timestamp,
                userId: user.uid,
                isGymWorkout: act.isGymWorkout || false,
                checkInCode: act.checkInCode || '',
                customActivityName: act.customActivityName || '',
                calories: act.calories || 0
              }).filter(([_, v]) => v !== undefined && v !== null && v !== '')
            );

            addDoc(colRef, cleanedActivity).then((newCloudDoc) => {
              console.log("Self-healing: Offline activity successfully synchronized. Cloud ID:", newCloudDoc.id);
              // Clean up the local cached activity from local storage list
              const updatedLocalSaved = localStorage.getItem(localKey);
              if (updatedLocalSaved) {
                try {
                  const currentLocs = JSON.parse(updatedLocalSaved) as Activity[];
                  const filtered = currentLocs.filter(a => a.id !== act.id);
                  localStorage.setItem(localKey, JSON.stringify(filtered));
                } catch (_) {}
              }
            }).catch(e => {
              console.warn("Self-healing: Activity sync failed/delayed:", e);
            });
          });
        }

        return [...mergedActivities, ...unsyncedLocals];
      });
    }, (error) => {
      console.warn("Could not retrieve activities list in real-time, loading local fallback:", error);
      const localSaved = localStorage.getItem(`es_capaz_${activeGroupId}_local_activities`);
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved) as Activity[];
          if (Array.isArray(parsed)) {
            setActivities(parsed);
            setIsUsingCustomData(true);
          }
        } catch (_) {}
      }
    });

    return () => unsubscribe();
  }, [activeGroupId, user, athleteName]);

  // D. Subscription: Personal targets inside group
  useEffect(() => {
    if (!activeGroupId || activeGroupId === 'EMPTY-PRIVATE') {
      setChallenges([]);
      return;
    }
    if (activeGroupId === 'demo-group') {
      setChallenges([]);
      return;
    }

    const unsub = onSnapshot(collection(db, 'groups', activeGroupId, 'challenges'), (snapshot) => {
      const liveChallenges: Challenge[] = [];
      snapshot.forEach((snapDoc) => {
        liveChallenges.push({
          id: snapDoc.id,
          ...snapDoc.data()
        } as Challenge);
      });
      setChallenges(liveChallenges);
    }, (error) => {
      console.warn("Could not load challenges list:", error);
    });
    return () => unsub();
  }, [activeGroupId]);


  // 4. Action Handlers (Fully mapped to subcollection ABAC system)
  
  // Timeout helper to avoid indefinite hanging when Firestore is slow, offline or newly provisioned
  const executeWithTimeout = async <T,>(
    promise: Promise<T>, 
    ms = 15000, 
    errorMsg = 'Tempo limite de sincronização esgotado. Verifique sua conexão à internet.'
  ): Promise<T> => {
    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(errorMsg));
      }, ms);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // Create Challenge Group
  const handleCreateGroup = async (name: string, description: string, groupRules: RuleConfig) => {
    if (!user || !athleteName) throw new Error('É necessário login para criar grupos.');

    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const inviteCode = generateCode();
    const groupId = inviteCode; // Alphanumeric uppercase ID for extreme join flexibility

    const groupPayload: GroupChallenge = {
      id: groupId,
      name,
      description,
      creatorId: user.uid,
      inviteCode,
      rules: groupRules,
      createdAt: new Date().toISOString()
    };

    const memberPayload: GroupMember = {
      userId: user.uid,
      athleteName,
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: 'admin',
      joinedAt: new Date().toISOString()
    };

    // 1. Save locally first so the user has immediate access and no blocking!
    setLocalGroups(prev => {
      const updated = { ...prev, [groupId]: groupPayload };
      localStorage.setItem('local_groups_data', JSON.stringify(updated));
      return updated;
    });

    setLocalMembers(prev => {
      const updated = { ...prev, [groupId]: [memberPayload] };
      localStorage.setItem('local_groups_members', JSON.stringify(updated));
      return updated;
    });

    // Instantly enrich the local groups menu list
    setUserGroups(prev => {
      if (prev.some(g => g.id === groupId)) return prev;
      return [...prev, { id: groupId, name }];
    });

    // Instantly transition to newly created group
    setActiveGroupId(groupId);
    localStorage.setItem('es_capaz_active_group_id', groupId);

    if (user.uid.startsWith('local_')) {
      return groupId;
    }

    // 2. Perform background/fast-timeout Firestore write
    try {
      const groupDocRef = doc(db, 'groups', groupId);
      await executeWithTimeout(
        setDoc(groupDocRef, groupPayload),
        25000,
        'timeout'
      );

      // Save admin membership directly
      const memberDocRef = doc(db, 'groups', groupId, 'members', user.uid);
      await executeWithTimeout(
        setDoc(memberDocRef, memberPayload),
        25000,
        'timeout'
      );

      // Update user profile record of joinedGroups list
      const userDocRef = doc(db, 'users', user.uid);
      let previousJoined = {};
      try {
        const userSnap = await executeWithTimeout(getDoc(userDocRef), 25000);
        previousJoined = userSnap.exists() ? (userSnap.data().joinedGroups || {}) : {};
      } catch (_) {}
      
      await executeWithTimeout(
        setDoc(userDocRef, {
          joinedGroups: {
            ...previousJoined,
            [groupId]: {
              name,
              joinedAt: new Date().toISOString()
            }
          }
        }, { merge: true }),
        25000,
        'timeout'
      );
    } catch (dbError: any) {
      console.warn("Dual-Write Firestore delay. The group was fully initialized locally:", dbError);
      setAuthError(translateFirebaseError(dbError));
    }

    return groupId;
  };

  // Sync Desafio do Frade local spreadsheet data to Cloud Firestore
  const handleSyncFradeChallenge = async () => {
    if (!user || user.uid.startsWith('local_')) {
      throw new Error("Por favor, faça login com o Google para poder sincronizar dados na Nuvem.");
    }

    try {
      // 1. Ensure group metadata is uploaded
      const defaultFradeGroup: GroupChallenge = {
        id: '99H0DP',
        name: 'DESAFIO DO FRADE',
        description: 'Desafio ativo do Frade com ranking e pontuação dos atletas.',
        creatorId: user.uid,
        inviteCode: '99H0DP',
        rules: {
          startDate: '2026-05-11',
          endDate: '2026-06-11',
          gymPointsPerCheckIn: 5,
          distanceMultiplier: 1.0,
          comboPointsPerDay: 10,
        },
        createdAt: new Date().toISOString()
      };

      const groupDocRef = doc(db, 'groups', '99H0DP');
      await setDoc(groupDocRef, defaultFradeGroup);

      // 2. Upload all 8 members of FRADE_MEMBERS
      for (const m of FRADE_MEMBERS) {
        const memberRef = doc(db, 'groups', '99H0DP', 'members', m.userId);
        await setDoc(memberRef, m);
      }

      // 3. Upload all 83 activities
      const fradeActivities = parseFradeActivities();
      for (const act of fradeActivities) {
        const actRef = doc(db, 'groups', '99H0DP', 'activities', act.id);
        const { id, ...payload } = act;
        await setDoc(actRef, payload);
      }

      // Enrich localGroups
      setLocalGroups(prev => ({
        ...prev,
        '99H0DP': defaultFradeGroup
      }));

      console.log("Successfully sync'd Desafio do Frade online.");
    } catch (e: any) {
      console.error("Failed to sync Desafio do Frade online:", e);
      throw e;
    }
  };

  // Join existing challenge group using inviteCode
  const handleJoinGroup = async (inviteCode: string) => {
    if (!user || !athleteName) throw new Error('É necessário login para participar de grupos.');

    const cleanCode = extractGroupCode(inviteCode);
    if (!cleanCode) throw new Error('Código do grupo inválido.');

    // Remove from left blacklist in case the user previously left this group
    try {
      const leftGroupsRaw = localStorage.getItem('es_capaz_left_group_ids');
      if (leftGroupsRaw) {
        const parsed = JSON.parse(leftGroupsRaw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((id: string) => id !== cleanCode);
          localStorage.setItem('es_capaz_left_group_ids', JSON.stringify(filtered));
        }
      }
    } catch (_) {}

    // Check if we already have it in localGroups
    if (localGroups[cleanCode]) {
      // Already joined locally
      setActiveGroupId(cleanCode);
      localStorage.setItem('es_capaz_active_group_id', cleanCode);
      return true;
    }

    const groupDocRef = doc(db, 'groups', cleanCode);
    let groupData: GroupChallenge;

    try {
      const groupSnap = await executeWithTimeout(
        getDoc(groupDocRef),
        25000,
        'Não foi possível se comunicar com o banco de dados.'
      );

      if (!groupSnap.exists()) {
        if (cleanCode === '99H0DP') {
          groupData = {
            id: '99H0DP',
            name: 'DESAFIO DO FRADE',
            description: 'Desafio ativo do Frade com ranking e pontuação dos atletas.',
            creatorId: 'local_proxy',
            inviteCode: '99H0DP',
            rules: {
              startDate: '2026-05-11',
              endDate: '2026-06-11',
              gymPointsPerCheckIn: 5,
              distanceMultiplier: 1.0,
              comboPointsPerDay: 10,
            },
            createdAt: new Date().toISOString()
          };
          try {
            await setDoc(groupDocRef, groupData);
          } catch (_) {}
        } else {
          throw new Error('Grupo não encontrado. Digite o código de convite de 6 caracteres corretamente!');
        }
      } else {
        groupData = groupSnap.data() as GroupChallenge;
      }

    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('não encontrado')) {
        throw err;
      }
      
      // FIREBASE IS TIMING OUT OR OFFLINE - RESILIENT FALLBACK:
      // Since Firebase is offline/stuck, we dynamically build a local placeholder group for them!
      // This allows them to proceed smoothly without being blocked by network timeouts.
      console.warn("Firestore timed out or failed. Generating local fallback group:", err);
      
      groupData = {
        id: cleanCode,
        name: `Grupo Sincronizado (${cleanCode})`,
        description: 'Desafio ativo offline devido a lentidão de sincronização da nuvem.',
        creatorId: 'local_proxy',
        inviteCode: cleanCode,
        rules: DEFAULT_RULES,
        createdAt: new Date().toISOString()
      };
      
      setAuthError(translateFirebaseError(err));
    }

    // Join membership
    const memberDocRef = doc(db, 'groups', cleanCode, 'members', user.uid);
    const memberPayload: GroupMember = {
      userId: user.uid,
      athleteName,
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: 'member',
      joinedAt: new Date().toISOString()
    };

    if (user.uid.startsWith('local_')) {
      setLocalGroups(prev => {
        const updated = { ...prev, [cleanCode]: groupData };
        localStorage.setItem('local_groups_data', JSON.stringify(updated));
        return updated;
      });

      setLocalMembers(prev => {
        const current = prev[cleanCode] || [];
        const updatedList = current.some(m => m.userId === user.uid) ? current : [...current, memberPayload];
        const updated = { ...prev, [cleanCode]: updatedList };
        localStorage.setItem('local_groups_members', JSON.stringify(updated));
        return updated;
      });

      setUserGroups(prev => {
        if (prev.some(g => g.id === cleanCode)) return prev;
        return [...prev, { id: cleanCode, name: groupData.name }];
      });

      setActiveGroupId(cleanCode);
      localStorage.setItem('es_capaz_active_group_id', cleanCode);
      return true;
    }

    try {
      await executeWithTimeout(
        setDoc(memberDocRef, memberPayload),
        25000,
        'timeout'
      );

      // Update user profile map
      const userDocRef = doc(db, 'users', user.uid);
      let previousJoined = {};
      try {
        const userSnap = await executeWithTimeout(getDoc(userDocRef), 25000);
        previousJoined = userSnap.exists() ? (userSnap.data().joinedGroups || {}) : {};
      } catch (_) {}

      await executeWithTimeout(
        setDoc(userDocRef, {
          joinedGroups: {
            ...previousJoined,
            [cleanCode]: {
              name: groupData.name,
              joinedAt: new Date().toISOString()
            }
          }
        }, { merge: true }),
        25000,
        'timeout'
      );
    } catch (saveErr: any) {
      console.warn("Could not save membership online initially, configuring cache:", saveErr);
      setAuthError(translateFirebaseError(saveErr));
    }

    // Keep cached copies
    setLocalGroups(prev => {
      const updated = { ...prev, [cleanCode]: groupData };
      localStorage.setItem('local_groups_data', JSON.stringify(updated));
      return updated;
    });

    setLocalMembers(prev => {
      const current = prev[cleanCode] || [];
      const updatedList = current.some(m => m.userId === user.uid) ? current : [...current, memberPayload];
      const updated = { ...prev, [cleanCode]: updatedList };
      localStorage.setItem('local_groups_members', JSON.stringify(updated));
      return updated;
    });

    // Update state lists
    setUserGroups(prev => {
      if (prev.some(g => g.id === cleanCode)) return prev;
      return [...prev, { id: cleanCode, name: groupData.name }];
    });

    // Transition state
    setActiveGroupId(cleanCode);
    localStorage.setItem('es_capaz_active_group_id', cleanCode);

    return true;
  };

  // Leave challenge group (clean up offline and online registries)
  const handleLeaveGroup = async (groupId: string) => {
    if (!user) {
      return;
    }

    if (groupId === 'demo-group') {
      return;
    }

    // Add to left blacklist array to prevent Firestore snapshot updates from temporarily reviving this group
    try {
      const leftGroupsRaw = localStorage.getItem('es_capaz_left_group_ids');
      let leftList = [];
      if (leftGroupsRaw) {
        const parsed = JSON.parse(leftGroupsRaw);
        if (Array.isArray(parsed)) {
          leftList = parsed;
        }
      }
      if (!leftList.includes(groupId)) {
        leftList.push(groupId);
        localStorage.setItem('es_capaz_left_group_ids', JSON.stringify(leftList));
      }
    } catch (_) {}

    // 1. Clear from local state registries first for instant UI response and zero lag
    setLocalGroups(prev => {
      const updated = { ...prev };
      delete updated[groupId];
      localStorage.setItem('local_groups_data', JSON.stringify(updated));
      return updated;
    });

    setLocalMembers(prev => {
      const updated = { ...prev };
      delete updated[groupId];
      localStorage.setItem('local_groups_members', JSON.stringify(updated));
      return updated;
    });

    // Remove local saved activities for this group
    localStorage.removeItem(`es_capaz_${groupId}_local_activities`);

    // Update frontend state list
    setUserGroups(prev => prev.filter(g => g.id !== groupId));

    // Reset current active group since user just left it
    if (activeGroupId === groupId) {
      const remainingPrivateGroups = userGroups.filter(g => g.id !== groupId && g.id !== 'demo-group' && g.id !== 'EMPTY-PRIVATE');
      if (remainingPrivateGroups.length > 0) {
        setActiveGroupId(remainingPrivateGroups[0].id);
        localStorage.setItem('es_capaz_active_group_id', remainingPrivateGroups[0].id);
      } else {
        setActiveGroupId('EMPTY-PRIVATE');
        localStorage.setItem('es_capaz_active_group_id', 'EMPTY-PRIVATE');
      }
    }

    // Clean up address bar query parameters so that a page refresh doesn't auto-join this group again
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const keysToDelete: string[] = [];
      for (const key of url.searchParams.keys()) {
        const lk = key.toLowerCase();
        if (lk === 'group' || lk === 'g') {
          keysToDelete.push(key);
        }
      }
      if (keysToDelete.length > 0) {
        keysToDelete.forEach(k => url.searchParams.delete(k));
        window.history.pushState({}, '', url.pathname + url.search);
      }
    }

    try {
      if (!user.uid.startsWith('local_')) {
        // 2. Delete membership document inside subcollection in an isolated block
        const memberRef = doc(db, 'groups', groupId, 'members', user.uid);
        try {
          await deleteDoc(memberRef);
          console.log("Successfully deleted membership from group members subcollection:", groupId);
        } catch (memberErr: any) {
          console.warn("Resilient group exit: members subcollection delete deferred or denied (already left?):", memberErr);
        }

        // 3. Remove group entry from the user's registry under users/{uid}/joinedGroups
        const userDocRef = doc(db, 'users', user.uid);
        try {
          // Attempt atomic update using deleteField first (robust and recommended)
          await updateDoc(userDocRef, {
            [`joinedGroups.${groupId}`]: deleteField()
          });
          console.log("Atomically removed group from profile joinedGroups via deleteField:", groupId);
        } catch (atomicErr: any) {
          console.warn("Atomic deleteField failed, trying fallback manual document rewrite:", atomicErr);
          try {
            // Fallback to manual document rewrite
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              const profileData = userSnap.data() as UserProfile;
              const updatedJoinedGroups = { ...profileData.joinedGroups || {} };
              delete updatedJoinedGroups[groupId];

              await updateDoc(userDocRef, {
                joinedGroups: updatedJoinedGroups
              });
              console.log("Fallback manual document rewrite succeeded.");
            }
          } catch (fallbackErr: any) {
            console.error("Critical error: both atomic and manual group excision failed:", fallbackErr);
            setAuthError(translateFirebaseError(fallbackErr));
          }
        }
      }
    } catch (err: any) {
      console.warn("Could not synchronize group exit online:", err);
    }
  };

  // Kick / Exclude a member from a private group challenge (Creator only)
  const handleKickMember = async (groupId: string, memberUserId: string) => {
    if (!user) return;
    
    // Check if the current user is authorized as admin/creator
    const isUserAuthorized = user.email === 'jhonatasmaranata@gmail.com' || (groupDetails && (groupDetails.creatorId === user.uid || groupDetails.creatorId === 'local_proxy'));
    if (!isUserAuthorized) {
      throw new Error("Apenas o criador do desafio pode excluir participantes.");
    }

    try {
      if (memberUserId && !memberUserId.startsWith('local_')) {
        // 1. Delete membership document inside Firestore subcollection
        const memberRef = doc(db, 'groups', groupId, 'members', memberUserId);
        await deleteDoc(memberRef);
        console.log(`Deleted member ${memberUserId} from cloud subcollection for group ${groupId}`);

        // 2. Remove group entry from the kicked user's registry under users/{memberUserId}/joinedGroups
        const userDocRef = doc(db, 'users', memberUserId);
        try {
          await updateDoc(userDocRef, {
            [`joinedGroups.${groupId}`]: deleteField()
          });
        } catch (e) {
          console.warn("Could not remove group from kicked user's registry:", e);
        }
      }

      // 3. Clear from local state registries for instant UI response
      setLocalMembers(prev => {
        const currentList = prev[groupId] || [];
        const updatedList = currentList.filter(m => m.userId !== memberUserId);
        const updated = { ...prev, [groupId]: updatedList };
        localStorage.setItem('local_groups_members', JSON.stringify(updated));
        return updated;
      });

      // Update active group members list state if this is the active group
      if (activeGroupId === groupId) {
        setGroupMembers(prev => prev.filter(m => m.userId !== memberUserId));
      }

    } catch (err: any) {
      console.error("Failed to exclude member:", err);
      throw err;
    }
  };

  // Update dynamic Group rules (admin creators only)
  const handleUpdateGroupRules = async (updatedRules: RuleConfig) => {
    if (isChallengeLocked) {
      console.warn("Rules are currently locked and cannot be updated.");
      return;
    }

    if (activeGroupId === 'demo-group') {
      setRules(updatedRules);
      return;
    }

    if (user && groupDetails && groupDetails.creatorId === user.uid && !user.uid.startsWith('local_')) {
      try {
        const docRef = doc(db, 'groups', activeGroupId);
        await setDoc(docRef, {
          rules: updatedRules
        }, { merge: true });
        setRules(updatedRules);
      } catch (error) {
        console.error("Failed to update group rules in Firestore:", error);
      }
    }
  };

  // Configure Point multiplier parameters directly in App
  const handleUpdateRules = async (field: keyof RuleConfig, value: any) => {
    if (isChallengeLocked) {
      console.warn("Rules are currently locked and cannot be updated.");
      return;
    }

    const updated = {
      ...rules,
      [field]: value
    };
    setRules(updated);
    if (activeGroupId !== 'demo-group' && user && groupDetails && groupDetails.creatorId === user.uid && !user.uid.startsWith('local_')) {
      try {
        const docRef = doc(db, 'groups', activeGroupId);
        await setDoc(docRef, { rules: updated }, { merge: true });
      } catch (e) {
        console.error("Rules save blocked by security rules:", e);
      }
    }
  };

  // Save personal challenges
  const handleSaveChallenge = async (challengeData: Omit<Challenge, 'id'>) => {
    if (!athleteName) return;
    const documentId = user ? user.uid : athleteName.trim().toLowerCase().replace(/\s+/g, '-');
    const cleanChallenge: Challenge = {
      id: documentId,
      ...challengeData,
      athleteName: athleteName.trim()
    };

    setChallenges(prev => {
      const filtered = prev.filter(c => c.id !== documentId);
      return [cleanChallenge, ...filtered];
    });

    if (activeGroupId !== 'demo-group' && user && !user.uid.startsWith('local_')) {
      const docRef = doc(db, 'groups', activeGroupId, 'challenges', documentId);
      const dataToSave = {
        id: documentId,
        athleteName: cleanChallenge.athleteName,
        type: cleanChallenge.type,
        targetGymDays: cleanChallenge.targetGymDays,
        targetActivityType: cleanChallenge.targetActivityType,
        targetActivityValue: cleanChallenge.targetActivityValue,
        targetActivityMetric: cleanChallenge.targetActivityMetric,
        targetActivityDays: cleanChallenge.targetActivityDays ?? null,
        targetActivityKm: cleanChallenge.targetActivityKm ?? null
      };
      try {
        await executeWithTimeout(
          setDoc(docRef, dataToSave),
          25000,
          'timeout'
        );
      } catch (err: any) {
        console.warn("Could not save personal targets online initially, saved locally on the screen:", err);
        setAuthError(`Metas Salvas Localmente! (Sincronização pendente)\n\n${translateFirebaseError(err)}`);
      }
    }
  };

  // Activity Log creation
  const handleAddManualActivity = async (newActivity: Omit<Activity, 'id'>) => {
    const generatedId = 'usr_local_' + Math.random().toString(36).substring(2, 9);
    const localActivity: Activity = {
      id: generatedId,
      ...newActivity,
    };

    // Backup inside local storage
    try {
      const localKey = `es_capaz_${activeGroupId}_local_activities`;
      const localSaved = localStorage.getItem(localKey);
      let currentLocals: Activity[] = [];
      if (localSaved) {
        try { currentLocals = JSON.parse(localSaved); } catch (_) {}
      }
      const updatedLocals = [localActivity, ...currentLocals];
      localStorage.setItem(localKey, JSON.stringify(updatedLocals));
    } catch (e) {
      console.error("Local save failed:", e);
    }

    setActivities(prev => {
      if (prev.some(a => a.id === localActivity.id)) return prev;
      return [localActivity, ...prev];
    });
    setIsUsingCustomData(true);

    if (activeGroupId !== 'demo-group' && user && athleteName && !user.uid.startsWith('local_')) {
      try {
        const colRef = collection(db, 'groups', activeGroupId, 'activities');
        const cleanedActivity = Object.fromEntries(
          Object.entries({
            ...newActivity,
            userId: user.uid
          }).filter(([_, v]) => v !== undefined)
        );
        await executeWithTimeout(
          addDoc(colRef, cleanedActivity),
          25000,
          'timeout'
        );
      } catch (error: any) {
        console.warn("Firestore write delayed, but local copy remains stored securely:", error);
        setAuthError(`Treino Salvo Localmente! (Sincronização pendente)\n\n${translateFirebaseError(error)}`);
      }
    }
  };

  // Delete exercise Activity
  const handleDeleteActivity = async (activityId: string) => {
    const isLocal = activityId.startsWith('usr_local_');

    // 1. If it's a cloud activity, but they are not securely logged in:
    if (!isLocal && activeGroupId !== 'demo-group' && (!user || user.uid.startsWith('local_'))) {
      setAuthError("Você está visualizando o grupo no modo Offline/Convidado. Para excluir atividades da nuvem, faça login com a conta que as criou!");
      return;
    }

    // 2. Remove from localStorage backup
    try {
      const localKey = `es_capaz_${activeGroupId}_local_activities`;
      const localSaved = localStorage.getItem(localKey);
      if (localSaved) {
        const parsed = JSON.parse(localSaved) as Activity[];
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(a => a.id !== activityId);
          localStorage.setItem(localKey, JSON.stringify(filtered));
        }
      }
    } catch (e) {
      console.error("Failed to remove local activity:", e);
    }

    // 3. Keep a backup of the original state in case the delete fails so we can restore it
    let originalActivities: Activity[] = [];
    setActivities(prev => {
      originalActivities = [...prev];
      return prev.filter(a => a.id !== activityId);
    });

    // 4. Call Firestore deletion if it's an online activity
    if (!isLocal && activeGroupId !== 'demo-group') {
      try {
        const docRef = doc(db, 'groups', activeGroupId, 'activities', activityId);
        await executeWithTimeout(deleteDoc(docRef), 20000, 'timeout');
      } catch (error: any) {
        console.warn("Firestore delete failed:", error);
        setAuthError("Não foi possível excluir o treino da nuvem. Você só pode excluir as suas próprias atividades (ou o criador do grupo)!");
        // Revert local UI state immediately
        setActivities(originalActivities);
      }
    }
  };

  // Update exercise Activity Photo
  const handleUpdateActivityPhoto = async (activityId: string, photoOrPhotos: string | string[]) => {
    const isArray = Array.isArray(photoOrPhotos);
    const photoUrl = isArray ? (photoOrPhotos[0] || '') : photoOrPhotos;
    const photoUrls = isArray ? photoOrPhotos : undefined;

    try {
      const localKey = `es_capaz_${activeGroupId}_local_activities`;
      const localSaved = localStorage.getItem(localKey);
      if (localSaved) {
        const parsed = JSON.parse(localSaved) as Activity[];
        if (Array.isArray(parsed)) {
          const updated = parsed.map(a => a.id === activityId ? { ...a, photoUrl, photoUrls } : a);
          localStorage.setItem(localKey, JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error("Failed to update local activity photo in localStorage:", e);
    }

    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, photoUrl, photoUrls } : a));

    if (activeGroupId !== 'demo-group' && user && !user.uid.startsWith('local_')) {
      try {
        const docRef = doc(db, 'groups', activeGroupId, 'activities', activityId);
        await executeWithTimeout(updateDoc(docRef, { 
          photoUrl,
          photoUrls: photoUrls || null
        }), 25000, 'timeout');
      } catch (error) {
        console.warn("Firestore update delayed, but local copy updated successfully:", error);
      }
    }
  };


  // 5. Unified Business Calculations & Scoring Calculations
  const scores = useMemo(() => {
    return calculateScores(activities, rules);
  }, [activities, rules]);

  const activeParticipantScore = useMemo(() => {
    if (scores.length === 0) return null;
    if (!selectedParticipantName) {
      if (athleteName) {
        const myScore = scores.find(s => isSameAthlete(s.name, athleteName));
        if (myScore) return myScore;
      }
      return scores[0]; 
    }
    return scores.find(s => isSameAthlete(s.name, selectedParticipantName)) || scores[0];
  }, [scores, selectedParticipantName, athleteName]);

  const summaryMetrics = useMemo(() => {
    let totalKm = 0;
    let totalWorkouts = 0;
    let totalCombos = 0;

    activities.forEach(act => {
      if (act.date >= rules.startDate) {
        if (act.distance > 0) {
          totalKm += act.distance;
        }
        if (act.isGymWorkout) {
          totalWorkouts += 1;
        }
      }
    });

    const personDays: { [key: string]: { hasTreino: boolean; hasOutdoor: boolean } } = {};
    activities.forEach(act => {
      if (act.date >= rules.startDate) {
        const key = `${act.name.trim()}_${act.date}`;
        if (!personDays[key]) {
          personDays[key] = { hasTreino: false, hasOutdoor: false };
        }
        if (act.type.toLowerCase().includes('treino')) {
          personDays[key].hasTreino = true;
        }
        const t = act.type.toLowerCase();
        if ((t.includes('corrida') || t.includes('caminhada') || t.includes('pedalada')) && act.distance > 0) {
          personDays[key].hasOutdoor = true;
        }
      }
    });

    Object.values(personDays).forEach(day => {
      if (day.hasTreino && day.hasOutdoor) {
        totalCombos += 1;
      }
    });

    return { totalKm, totalWorkouts, totalCombos };
  }, [activities, rules]);

  // Extracts roster roster
  const existingNames = useMemo(() => {
    const list = new Set<string>();
    groupMembers.forEach(m => {
      if (m.athleteName) list.add(m.athleteName.trim());
    });
    // Add any logged names that may represent historic entries
    activities.forEach(a => {
      if (a.name) list.add(a.name.trim());
    });
    return Array.from(list).sort();
  }, [groupMembers, activities]);


  // Login Routines with detailed help details
  const handleSignIn = () => {
    setAuthError(null);
    setIsLoginModalOpen(true);
  };

  const handleSignInLocal = () => {
    const athleteNameInput = prompt("Digite seu Nome de Atleta para entrar em modo Offline/Local:");
    if (athleteNameInput && athleteNameInput.trim()) {
      const cleanName = athleteNameInput.trim();
      const localId = 'local_' + cleanName.toLowerCase().replace(/[^a-z0-9\u00C0-\u00FF]/g, '_');
      const simulatedUser = {
        uid: localId,
        email: localId + '@local_es_capaz.com',
        displayName: cleanName,
        photoURL: null
      } as unknown as User;

      localStorage.setItem('es_capaz_simulated_user', JSON.stringify(simulatedUser));
      setUser(simulatedUser);
      setAthleteName(cleanName);
      setUserRole('user');
      setAuthError('Você entrou usando o Modo Offline (Sem Conta)! Seus desafios, treinos e placar serão criados e computados em cache localmente no navegador.');
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('es_capaz_simulated_user');
      await signOut(auth);
      setGroupDetails(null);
      setActiveGroupId('demo-group');
      localStorage.setItem('es_capaz_active_group_id', 'demo-group');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleCompleteRegistration = async (selectedAthleteName: string) => {
    if (!user) return;
    if (user.uid.startsWith('local_')) {
      const updatedUser = { ...user, displayName: selectedAthleteName };
      setUser(updatedUser as any);
      localStorage.setItem('es_capaz_simulated_user', JSON.stringify(updatedUser));
      setAthleteName(selectedAthleteName);
      setIsRegistrationPending(false);
      
      // Join the active group directly as participant upon claiming a name locally
      if (activeGroupId !== 'demo-group') {
        const memberPayload: GroupMember = {
          userId: user.uid,
          athleteName: selectedAthleteName,
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: 'member',
          joinedAt: new Date().toISOString()
        };
        setLocalMembers(prev => {
          const current = prev[activeGroupId] || [];
          const updatedList = current.some(m => m.userId === user.uid) ? current : [...current, memberPayload];
          const updated = { ...prev, [activeGroupId]: updatedList };
          localStorage.setItem('local_groups_members', JSON.stringify(updated));
          return updated;
        });
      }
      return;
    }
    try {
      const profileDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(profileDocRef);
      const originalRegisteredAt = userDoc.exists() ? userDoc.data().registeredAt : new Date().toISOString();

      await setDoc(profileDocRef, {
        athleteName: selectedAthleteName,
        email: user.email || '',
        photoURL: user.photoURL || '',
        registeredAt: originalRegisteredAt
      }, { merge: true });

      setAthleteName(selectedAthleteName);
      setIsRegistrationPending(false);

      // Join the active group directly as participant upon claiming a name
      if (activeGroupId !== 'demo-group') {
        const memberRef = doc(db, 'groups', activeGroupId, 'members', user.uid);
        await setDoc(memberRef, {
          userId: user.uid,
          athleteName: selectedAthleteName,
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: 'member',
          joinedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Registration write failed:", error);
    }
  };

  const handleResetToDemo = () => {
    setActivities(INITIAL_MOCK_ACTIVITIES);
    setIsUsingCustomData(false);
    setRules(getGlobalChallengeRules());
    setSelectedParticipantName(null);
    setActiveGroupId('demo-group');
    localStorage.setItem('es_capaz_active_group_id', 'demo-group');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="applet-root">
      
      {/* Complete Claims Registration Modal */}
      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)} 
          onSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setIsLoginModalOpen(false);
          }}
          onSelectLocal={handleSignInLocal}
        />
      )}

      {isRegistrationPending && user && (
        <RegistrationModal 
          existingNames={existingNames} 
          email={user.email || ''} 
          onRegister={handleCompleteRegistration} 
          onCancel={() => setIsRegistrationPending(false)}
        />
      )}

      {/* Styled Corporate Sportive Header */}
      <Header 
        isUsingCustomData={isUsingCustomData}
        totalParticipants={scores.length}
        startDate={rules.startDate}
        endDate={rules.endDate || ''}
        onReset={handleResetToDemo}
        user={user}
        athleteName={athleteName}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onEditName={() => setIsRegistrationPending(true)}
        onSignInLocal={handleSignInLocal}
      />

      {/* Auth Error or Synchronization status Banner info */}
      {authError && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-4" id="auth-error-banner">
          {isSychronizationNotice ? (
            <div className="bg-amber-950/40 border border-amber-800/40 text-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <div className="text-amber-400 shrink-0 font-bold">💡</div>
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-amber-300">Aviso de Sincronização</span>
                <p className="text-[11px] leading-relaxed text-amber-100/90 font-sans whitespace-pre-wrap">{authError}</p>
              </div>
              <button onClick={() => setAuthError(null)} className="text-slate-400 hover:text-white text-xs font-mono font-bold cursor-pointer">FECHAR</button>
            </div>
          ) : (
            <div className="bg-red-950/70 border border-red-800/60 text-red-100 p-4 rounded-xl flex items-start gap-3 shadow-md">
              <div className="text-red-400 shrink-0 font-bold">⚠️</div>
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-red-200">Erro de Autenticação</span>
                <p className="text-[11px] leading-relaxed text-slate-200 font-sans whitespace-pre-wrap">{authError}</p>
                {authError.toLowerCase().includes('tempo limite') && (
                  <div className="mt-3 pt-3 border-t border-red-950/60 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <span className="text-[10px] text-red-300 font-mono font-bold uppercase shrink-0">💡 Solução Rápida:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          localStorage.setItem('es_capaz_database_id_override', 'default');
                          window.location.reload();
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black font-mono rounded-lg transition shadow-md cursor-pointer"
                        title="Se o banco especial do sandbox do AI Studio ainda não terminou de propagar no console, esta opção alterna para o seu banco de dados padrão '(default)' que é ativado instantaneamente."
                      >
                        Alternar para Banco Padrão (default)
                      </button>
                      <button
                        onClick={() => {
                          window.location.reload();
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 text-[10px] font-bold font-mono rounded-lg transition border border-slate-700 shadow-md cursor-pointer"
                      >
                        Recarregar Página
                      </button>
                    </div>
                  </div>
                )}
                {typeof window !== 'undefined' && localStorage.getItem('es_capaz_database_id_override') === 'default' && (
                  <div className="mt-2 text-[10px] text-slate-400 font-mono">
                    Ativo em modo de contingência no banco <strong className="text-amber-450 font-bold">(default)</strong>. 
                    <button
                      onClick={() => {
                        localStorage.removeItem('es_capaz_database_id_override');
                        window.location.reload();
                      }}
                      className="ml-2 underline text-amber-500 hover:text-amber-400 cursor-pointer font-bold"
                    >
                      Restaurar Banco Sandbox Original
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => setAuthError(null)} className="text-slate-400 hover:text-white text-xs font-mono font-bold cursor-pointer">FECHAR</button>
            </div>
          )}
        </div>
      )}

      {/* Core Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {activeGroupId && activeGroupId !== 'EMPTY-PRIVATE' ? (
          <>
             {/* Athletic App Tab Selector */}
            <div className="border-b border-slate-900/60 sticky top-0 bg-slate-950/95 backdrop-blur-md z-40 py-1.5 sm:py-2.5 mb-4">
              <div className="grid grid-cols-3 max-w-[380px] w-full mx-auto p-0.5 bg-slate-900/90 border border-slate-850/75 rounded-lg gap-0.5 shadow-md shadow-slate-950/50" id="app-challenge-navigation-tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('painel')}
                  className={`py-1 px-0.5 font-sans text-[7.5px] min-[330px]:text-[8px] min-[350px]:text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-black uppercase tracking-tighter min-[350px]:tracking-tight sm:tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-0.5 sm:gap-1.5 notranslate select-none ${
                    activeTab === 'painel' 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20 scale-100 hover:scale-[1.01]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
                  }`}
                  translate="no"
                >
                  <Flame className={`w-3 h-3 min-[340px]:w-3.5 min-[340px]:h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'painel' ? 'text-slate-950 animate-pulse' : 'text-orange-550'}`} />
                  <span className="whitespace-nowrap">DESAFIO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('registrar')}
                  className={`py-1 px-0.5 font-sans text-[7.5px] min-[330px]:text-[8px] min-[350px]:text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-black uppercase tracking-tighter min-[350px]:tracking-tight sm:tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-0.5 sm:gap-1.5 notranslate select-none ${
                    activeTab === 'registrar' 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20 scale-100 hover:scale-[1.01]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
                  }`}
                  translate="no"
                >
                  <CheckSquare className={`w-3 h-3 min-[340px]:w-3.5 min-[340px]:h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'registrar' ? 'text-slate-950' : 'text-emerald-500'}`} />
                  <span className="whitespace-nowrap">ATIVIDADE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('classificacao')}
                  className={`py-1 px-0.5 font-sans text-[7.5px] min-[330px]:text-[8px] min-[350px]:text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-black uppercase tracking-tighter min-[350px]:tracking-tight sm:tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-0.5 sm:gap-1.5 notranslate select-none ${
                    activeTab === 'classificacao' 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20 scale-100 hover:scale-[1.01]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
                  }`}
                  translate="no"
                >
                  <Trophy className={`w-3 h-3 min-[340px]:w-3.5 min-[340px]:h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'classificacao' ? 'text-slate-950' : 'text-amber-500'}`} />
                  <span className="whitespace-nowrap">CLASSIFICAÇÃO</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: Painel de Desafios */}
            {activeTab === 'painel' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Dynamic Challenges Workspaces Group Selection Panel (Only on first tab) */}
                <GroupManager 
                  user={user}
                  athleteName={athleteName}
                  activeGroup={groupDetails}
                  userGroups={userGroups}
                  groupMembers={groupMembers}
                  onSelectGroup={(groupId) => {
                    setActiveGroupId(groupId);
                    localStorage.setItem('es_capaz_active_group_id', groupId);
                  }}
                  onCreateGroup={handleCreateGroup}
                  onJoinGroup={handleJoinGroup}
                  onUpdateGroupRules={handleUpdateGroupRules}
                  onLeaveGroup={handleLeaveGroup}
                  onRemoveMember={(userId) => handleKickMember(activeGroupId, userId)}
                />

                {/* Goals / Targets Display Block */}
                <ChallengeSection 
                  athleteName={athleteName}
                  activeParticipantScore={activeParticipantScore}
                  challenges={challenges}
                  onSaveChallenge={handleSaveChallenge}
                  isLoggedIn={user !== null}
                  scores={scores}
                  isAdmin={isModerator}
                  startDate={rules.startDate}
                  endDate={rules.endDate || ''}
                />
              </div>
            )}

            {/* TAB CONTENT: Logar Atividade */}
            {activeTab === 'registrar' && (
              <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
                <AddActivityForm 
                  existingNames={existingNames} 
                  onAddActivity={handleAddManualActivity} 
                  athleteName={athleteName}
                  onSignIn={handleSignIn}
                  activities={activities}
                  onDeleteActivity={handleDeleteActivity}
                />
              </div>
            )}

            {/* TAB CONTENT: Classificação do Desafio */}
            {activeTab === 'classificacao' && (
              <div className="space-y-6 animate-fadeIn">
                <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <Leaderboard 
                      scores={scores}
                      selectedParticipant={activeParticipantScore?.name || null}
                      onSelectParticipant={(name) => setSelectedParticipantName(name)}
                      challenges={challenges}
                      groupMembers={groupMembers}
                    />
                  </div>

                  <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                    <ParticipantDetails 
                      score={activeParticipantScore} 
                      currentUserId={user?.uid}
                      onDeleteActivity={handleDeleteActivity}
                      onUpdateActivityPhoto={handleUpdateActivityPhoto}
                      challenges={challenges}
                      rules={rules}
                    />
                  </div>
                </section>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <GroupManager 
              user={user}
              athleteName={athleteName}
              activeGroup={groupDetails}
              userGroups={userGroups}
              groupMembers={groupMembers}
              onSelectGroup={(groupId) => {
                setActiveGroupId(groupId);
                localStorage.setItem('es_capaz_active_group_id', groupId);
              }}
              onCreateGroup={handleCreateGroup}
              onJoinGroup={handleJoinGroup}
              onUpdateGroupRules={handleUpdateGroupRules}
              onLeaveGroup={handleLeaveGroup}
              onRemoveMember={(userId) => handleKickMember(activeGroupId, userId)}
            />

            <div className="bg-slate-900/20 border border-slate-855 border-slate-850/60 rounded-2xl p-8 text-center space-y-4 shadow-xl max-w-2xl mx-auto" id="private-challenges-empty-state-placeholder">
              <div className="w-12 h-12 bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-100 text-sm">Painel de Atividades Oculto</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                  Você selecionou a aba de <strong>Desafios Particulares</strong>. Crie um novo desafio ou entre em um através do código no painel para habilitar o placar, as metas e postar novos treinos!
                </p>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  Para navegar no torneio geral público, clique no botão <strong>Desafio Público Geral (Mensal)</strong> acima.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Styled Footer */}
      <footer className="bg-slate-950 border-t border-slate-850 py-6 text-center text-xs text-slate-500 font-mono mt-12">
        <p className="notranslate" translate="no">© {new Date().getFullYear()} Eu Sou Capaz • Desafio Grupo Fitness • Foco, Consistência e Evolução • Todo Treino Conta!</p>
      </footer>

      {/* PWA mobile installation option banner */}
      <PWAInstallPrompt />

    </div>
  );
}
