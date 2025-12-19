import React, { useState, useEffect, useMemo } from 'react';
import { AppState, UserStats, Level, Skin } from './types';
import { LEVELS, SKINS } from './constants';
import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import GameView from './components/GameView';
import Shop from './components/Shop';
import SkinSelector from './components/SkinSelector';
import GiftShop from './components/GiftShop';
import FriendsLobby from './components/FriendsLobby';

const App: React.FC = () => {
    const [view, setView] = useState<AppState>(AppState.LOGIN);
    const [opponent, setOpponent] = useState<string | null>(null);
    const [incomingInvite, setIncomingInvite] = useState<string | null>(null);
    const [isSebastianMode, setIsSebastianMode] = useState(false);
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    
    const [stats, setStats] = useState<UserStats>({
        username: '',
        gems: 0,
        isPremium: false,
        isVip: false,
        selectedSkinId: 's1'
    });
    
    const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['s1']);

    const isChristmasSeason = useMemo(() => {
        const now = new Date();
        return now.getMonth() === 11;
    }, []);

    // Sincronizzazione automatica delle skin VIP/Admin se l'utente ha il tier richiesto
    useEffect(() => {
        if (stats.username) {
            setUnlockedSkins(prev => {
                const current = new Set(prev);
                let changed = false;

                SKINS.forEach(skin => {
                    const shouldBeUnlocked = 
                        (skin.requiredTier === 'vip' && stats.isVip) || 
                        (skin.requiredTier === 'premium' && (stats.isPremium || stats.isVip));
                    
                    if (shouldBeUnlocked && !current.has(skin.id)) {
                        current.add(skin.id);
                        changed = true;
                    }
                });

                return changed ? Array.from(current) : prev;
            });
        }
    }, [stats.isVip, stats.isPremium, stats.username]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const challenger = params.get('challenge');
        if (challenger) {
            setIncomingInvite(challenger.toUpperCase());
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (stats.username) {
            const userData = {
                stats,
                unlockedSkins
            };
            localStorage.setItem(`fd_user_data_${stats.username.toLowerCase()}`, JSON.stringify(userData));
        }
    }, [stats, unlockedSkins]);

    const handleLogin = (username: string, secretCode: string) => {
        const lowerUsername = username.trim().toLowerCase();
        const savedDataStr = localStorage.getItem(`fd_user_data_${lowerUsername}`);
        
        let initialStats: UserStats;
        let initialSkins: string[];

        if (savedDataStr) {
            const savedData = JSON.parse(savedDataStr);
            initialStats = { ...savedData.stats, username: username.trim() };
            initialSkins = savedData.unlockedSkins || ['s1'];
        } else {
            initialStats = {
                username: username.trim(),
                gems: 0,
                isPremium: false,
                isVip: false,
                selectedSkinId: 's1'
            };
            initialSkins = ['s1'];
        }

        const normalizedCode = secretCode.trim().toUpperCase();
        if (normalizedCode === 'VIP' || normalizedCode === 'ADMIN') {
            initialStats.isVip = true;
            initialStats.isPremium = true;
            initialStats.gems += 5000;
        } else if (normalizedCode === 'PREMIUM') {
            initialStats.isPremium = true;
            initialStats.gems += 1500;
        } else if (normalizedCode === 'ERROR 666' || normalizedCode === 'ERROR666') {
            initialStats.isVip = true;
            initialStats.isPremium = true;
            initialStats.selectedSkinId = 's666';
            if (!initialSkins.includes('s666')) initialSkins.push('s666');
            alert("⚠️ SYSTEM FAILURE: ERROR 666 INJECTED ⚠️");
        } else if (normalizedCode === 'SEBASTIAN') {
            initialStats.selectedSkinId = 's-seba';
            if (!initialSkins.includes('s-seba')) initialSkins.push('s-seba');
            setIsSebastianMode(true);
        }

        setStats(initialStats);
        setUnlockedSkins(initialSkins);
        setView(AppState.MENU);
    };

    const handleGameOver = (success: boolean, gemsCollected: number) => {
        let totalReward = gemsCollected;
        if (success) totalReward += 100; 
        if (stats.isVip) totalReward *= 2;
        else if (stats.isPremium) totalReward = Math.floor(totalReward * 1.5);

        setStats(prev => ({ ...prev, gems: prev.gems + totalReward }));
        setOpponent(null); 
        setCurrentLevel(null);
        setView(AppState.LEVEL_SELECT);
    };

    const handlePurchase = (type: 'premium' | 'vip', cost: number) => {
        if (stats.gems >= cost) {
            setStats(prev => ({
                ...prev,
                gems: prev.gems - cost,
                isPremium: type === 'premium' ? true : prev.isPremium,
                isVip: type === 'vip' ? true : prev.isVip
            }));
            alert(`Complimenti! Sei ora ${type.toUpperCase()}`);
        } else {
            alert('Gemme insufficienti!');
        }
    };

    const handleUnlockSkin = (skin: Skin, cost: number) => {
        if (stats.gems >= cost) {
            setStats(prev => ({ ...prev, gems: prev.gems - cost }));
            setUnlockedSkins(prev => [...prev, skin.id]);
        } else {
            alert('Gemme insufficienti!');
        }
    };

    const handleSelectSkin = (skinId: string) => {
        setStats(prev => ({ ...prev, selectedSkinId: skinId }));
    };

    const handleClaimGems = (amount: number) => {
        setStats(prev => ({ ...prev, gems: prev.gems + amount }));
    };

    const handleStartChallenge = (opponentUsername: string) => {
        setOpponent(opponentUsername);
        setView(AppState.LEVEL_SELECT);
    };

    const handleLevelSelect = (level: Level) => {
        setCurrentLevel(level);
        setView(AppState.GAME);
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative select-none">
            {view === AppState.LOGIN && <LoginScreen onLogin={handleLogin} />}
            {view === AppState.MENU && <MainMenu stats={stats} onNavigate={setView} />}
            {view === AppState.FRIENDS_LOBBY && <FriendsLobby currentUser={stats.username} isVip={stats.isVip} onBack={() => setView(AppState.MENU)} onChallenge={handleStartChallenge} />}
            {view === AppState.LEVEL_SELECT && <LevelSelect levels={LEVELS} onSelectLevel={handleLevelSelect} onBack={() => { setOpponent(null); setView(AppState.MENU); }} />}
            {view === AppState.GAME && currentLevel && <GameView level={currentLevel} skin={SKINS.find(s => s.id === stats.selectedSkinId) || SKINS[0]} username={stats.username} isVip={stats.isVip} onEnd={handleGameOver} isSebastianMode={isSebastianMode} />}
            {view === AppState.SHOP && <Shop stats={stats} isChristmasSeason={isChristmasSeason} onPurchase={handlePurchase} onBack={() => setView(AppState.MENU)} />}
            {view === AppState.SKINS && <SkinSelector skins={SKINS} unlockedSkins={unlockedSkins} selectedSkinId={stats.selectedSkinId} gems={stats.gems} stats={stats} isChristmasSeason={isChristmasSeason} onUnlock={handleUnlockSkin} onSelect={handleSelectSkin} onBack={() => setView(AppState.MENU)} />}
            {view === AppState.GIFT_SHOP && <GiftShop onClaim={handleClaimGems} onBack={() => setView(AppState.MENU)} />}
            
            {view !== AppState.LOGIN && view !== AppState.GAME && (
                <div className="absolute top-4 right-4 flex items-center gap-3 bg-gray-900/90 px-4 py-2 rounded-full border border-gray-700 z-[70] shadow-xl">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${stats.isVip ? 'rainbow-text' : 'text-gray-300'}`}>
                        {stats.username}
                    </span>
                    <div className="flex items-center gap-2 text-blue-400 font-bold border-l border-white/10 pl-3">
                        <i className="fas fa-gem text-[10px]"></i>
                        <span className="text-xs">{stats.gems}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;