
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

    // Sincronizzazione automatica delle skin VIP/Premium
    useEffect(() => {
        if (stats.username) {
            const currentUnlocked = [...unlockedSkins];
            let changed = false;

            SKINS.forEach(skin => {
                if (skin.requiredTier === 'vip' && stats.isVip && !currentUnlocked.includes(skin.id)) {
                    currentUnlocked.push(skin.id);
                    changed = true;
                }
                if (skin.requiredTier === 'premium' && (stats.isPremium || stats.isVip) && !currentUnlocked.includes(skin.id)) {
                    currentUnlocked.push(skin.id);
                    changed = true;
                }
            });

            if (changed) {
                setUnlockedSkins(currentUnlocked);
            }
        }
    }, [stats.isVip, stats.isPremium]);

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
        if (normalizedCode === 'VIP') {
            initialStats.isVip = true;
            initialStats.isPremium = true;
            initialStats.gems += 1000;
        } else if (normalizedCode === 'PREMIUM') {
            initialStats.isPremium = true;
            initialStats.gems += 500;
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
            alert("🔥 SEBASTIAN GHOST UNLOCKED 🔥\n- Velocità 10x\n- 1000 Trappole extra\n- SALTO DISATTIVATO!");
        }

        setStats(initialStats);
        setUnlockedSkins(initialSkins);
        setView(AppState.MENU);
    };

    const handleSelectLevel = (level: Level) => {
        setCurrentLevel(level);
        setView(AppState.GAME);
    };

    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);

    const handleGameOver = (success: boolean, gemsCollected: number) => {
        let totalReward = gemsCollected;
        if (success) totalReward += 90; 
        if (stats.isVip) totalReward *= 2;
        else if (stats.isPremium) totalReward = Math.floor(totalReward * 1.5);

        setStats(prev => ({ ...prev, gems: prev.gems + totalReward }));
        setOpponent(null); 
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
            alert(`Acquistato: ${type.toUpperCase()}`);
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

    const getEffectiveLevel = (level: Level) => {
        if (stats.isVip && level.id === '8') return { ...level, speedMultiplier: 2 };
        return level;
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative select-none">
            {view === AppState.LOGIN && <LoginScreen onLogin={handleLogin} />}
            {view === AppState.MENU && <MainMenu stats={stats} onNavigate={setView} />}
            {view === AppState.FRIENDS_LOBBY && <FriendsLobby currentUser={stats.username} isVip={stats.isVip} onBack={() => setView(AppState.MENU)} onChallenge={handleStartChallenge} />}
            {view === AppState.LEVEL_SELECT && <LevelSelect levels={LEVELS.map(l => getEffectiveLevel(l))} onSelect={handleSelectLevel} onBack={() => { setOpponent(null); setView(AppState.MENU); }} />}
            {view === AppState.GAME && currentLevel && <GameView level={getEffectiveLevel(currentLevel)} skin={SKINS.find(s => s.id === stats.selectedSkinId) || SKINS[0]} username={stats.username} isVip={stats.isVip} onEnd={handleGameOver} isSebastianMode={isSebastianMode} />}
            {view === AppState.SHOP && <Shop stats={stats} isChristmasSeason={isChristmasSeason} onPurchase={handlePurchase} onBack={() => setView(AppState.MENU)} />}
            {view === AppState.SKINS && <SkinSelector skins={SKINS} unlockedSkins={unlockedSkins} selectedSkinId={stats.selectedSkinId} gems={stats.gems} stats={stats} isChristmasSeason={isChristmasSeason} onUnlock={handleUnlockSkin} onSelect={handleSelectSkin} onBack={() => setView(AppState.MENU)} />}
            {view === AppState.GIFT_SHOP && <GiftShop onClaim={handleClaimGems} onBack={() => setView(AppState.MENU)} />}

            {incomingInvite && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-gray-900 border-2 border-blue-500 p-8 rounded-[40px] shadow-[0_0_100px_rgba(59,130,246,0.5)] max-w-sm w-full text-center">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl animate-bounce">
                            <i className="fas fa-swords text-white"></i>
                        </div>
                        <h2 className="text-white font-black text-2xl uppercase italic tracking-tighter mb-2">Sfida in arrivo!</h2>
                        <p className="text-gray-400 text-sm mb-8"><span className="text-blue-400 font-black">{incomingInvite}</span> ti ha sfidato!</p>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => { setOpponent(incomingInvite); setIncomingInvite(null); setView(AppState.LEVEL_SELECT); }} className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all transform active:scale-95 uppercase tracking-widest">Accetta</button>
                            <button onClick={() => setIncomingInvite(null)} className="text-gray-500 font-bold hover:text-white transition-colors uppercase text-xs">Rifiuta</button>
                        </div>
                    </div>
                </div>
            )}

            {opponent && view !== AppState.GAME && view !== AppState.LOGIN && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 px-6 py-2 rounded-full border border-white/20 shadow-2xl animate-bounce z-[100] flex items-center gap-3">
                    <i className="fas fa-swords text-white"></i>
                    <span className="text-white font-black text-xs uppercase tracking-widest">CONTRO {opponent}</span>
                    <button onClick={() => setOpponent(null)} className="ml-2 text-blue-200 hover:text-white"><i className="fas fa-times"></i></button>
                </div>
            )}
            
            {view !== AppState.LOGIN && view !== AppState.GAME && (
                <div className="absolute top-4 right-4 flex items-center gap-4 bg-gray-900/80 px-4 py-2 rounded-full border border-gray-700 z-50">
                    <span className={`text-[10px] font-black uppercase tracking-widest mr-2 ${stats.isVip ? 'rainbow-text' : 'text-gray-300'}`}>
                        {stats.username}
                    </span>
                    <div className="flex items-center gap-2 text-blue-400 font-bold border-l border-white/10 pl-4">
                        <i className="fas fa-gem"></i>
                        <span>{stats.gems}</span>
                    </div>
                    {stats.isVip && <span className="text-yellow-400 text-[8px] font-black px-1.5 py-0.5 bg-yellow-900/30 rounded border border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]">VIP</span>}
                    {stats.isPremium && !stats.isVip && <span className="text-purple-400 text-[8px] font-black px-1.5 py-0.5 bg-purple-900/30 rounded border border-purple-500">PREMIUM</span>}
                </div>
            )}

            {isSebastianMode && view !== AppState.GAME && view !== AppState.LOGIN && (
                <div className="absolute bottom-6 left-6 text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">
                    <i className="fas fa-ghost mr-2"></i> SEBASTIAN MODE: 1000 TRAPS & X10 SPEED ACTIVE
                </div>
            )}
        </div>
    );
};

export default App;
