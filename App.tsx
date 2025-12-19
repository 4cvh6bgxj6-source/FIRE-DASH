
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, UserStats, Level, Skin, MPChallenge } from './types';
import { LEVELS, SKINS } from './constants';
import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import GameView from './components/GameView';
import Shop from './components/Shop';
import SkinSelector from './components/SkinSelector';
import GiftShop from './components/GiftShop';
import FriendsLobby from './components/FriendsLobby';
import MPLobby from './components/MPLobby';
import MPGameView from './components/MPGameView';

const App: React.FC = () => {
    const [view, setView] = useState<AppState>(AppState.LOGIN);
    const [stats, setStats] = useState<UserStats>({
        username: '',
        gems: 0,
        isPremium: false,
        isVip: false,
        selectedSkinId: 's1'
    });
    const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['s1']);
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [activeChallenge, setActiveChallenge] = useState<MPChallenge | null>(null);
    const [opponentData, setOpponentData] = useState<{username: string, skinId: string} | null>(null);

    const isChristmasSeason = true;

    // Gestione Inviti Reali via URL (Migliorata per skin)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const challengeFrom = params.get('challenge');
        const challengeSkin = params.get('skin') || 's1';
        
        if (challengeFrom && stats.username && stats.username !== 'Guest' && view === AppState.MENU) {
            const challenge: MPChallenge = {
                id: 'url-' + Date.now(),
                from: challengeFrom,
                to: stats.username,
                status: 'pending',
                timestamp: Date.now()
            };
            // Usiamo lo stato per salvare temporaneamente la skin dell'avversario reale
            (window as any)._oppSkin = challengeSkin;
            setActiveChallenge(challenge);
        }
    }, [stats.username, view]);

    // Salvataggio dati
    useEffect(() => {
        if (stats.username && stats.username !== '' && stats.username !== 'Guest') {
            const saveData = { stats, unlockedSkins };
            localStorage.setItem(`fd_user_data_${stats.username.toLowerCase()}`, JSON.stringify(saveData));
        }
    }, [stats, unlockedSkins]);

    const handleLogin = (username: string, secretCode: string) => {
        const lowerName = username.trim().toLowerCase();
        const savedRaw = localStorage.getItem(`fd_user_data_${lowerName}`);
        
        let initialStats: UserStats = {
            username: username || 'Guest',
            gems: 0,
            isPremium: false,
            isVip: false,
            selectedSkinId: 's1'
        };
        let initialSkins: string[] = ['s1'];

        if (savedRaw) {
            try {
                const parsed = JSON.parse(savedRaw);
                initialStats = { ...parsed.stats, username: username };
                initialSkins = parsed.unlockedSkins;
            } catch (e) {}
        }

        const code = secretCode.trim().toUpperCase();
        if (code === 'ADMIN') {
            initialStats.isVip = true;
            initialStats.isPremium = true;
            initialStats.gems += 5000;
            if (!initialSkins.includes('s8')) initialSkins.push('s8');
        } else if (code === 'VIP') {
            initialStats.isVip = true;
            initialStats.gems += 1000;
        } else if (code === 'PREMIUM') {
            initialStats.isPremium = true;
            initialStats.gems += 500;
        } else if (code === 'ERROR666') {
            initialStats.isVip = true; 
            initialStats.isPremium = true; 
            initialStats.selectedSkinId = 's666';
            if (!initialSkins.includes('s666')) initialSkins.push('s666');
            initialStats.gems += 666;
        }

        setStats(initialStats);
        setUnlockedSkins(initialSkins);
        setView(AppState.MENU);
    };

    const handleLevelEnd = (success: boolean, gems: number) => {
        if (success) {
            setStats(prev => ({
                ...prev,
                gems: prev.gems + gems + 100
            }));
        }
        setView(AppState.LEVEL_SELECT);
    };

    const acceptChallenge = () => {
        if (!activeChallenge) return;
        const oppSkin = (window as any)._oppSkin || 's-man';
        setOpponentData({ username: activeChallenge.from, skinId: oppSkin }); 
        setView(AppState.MP_LOBBY);
        setActiveChallenge(null);
        window.history.replaceState({}, document.title, window.location.pathname);
    };

    const handleChallengeBot = (name: string, isBot: boolean) => {
        setOpponentData({ username: name, skinId: isBot ? 's2' : 's-man' });
        setView(AppState.MP_LOBBY);
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden select-none relative">
            {isChristmasSeason && <div className="snow-container pointer-events-none z-0"></div>}

            {activeChallenge && view === AppState.MENU && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-gray-900 border-2 border-red-500 p-8 rounded-[3rem] shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col gap-6 max-w-sm w-full text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
                        <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center text-4xl self-center animate-bounce shadow-2xl shadow-red-500/40 border-b-4 border-red-900">
                            <i className="fas fa-swords text-white"></i>
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase text-xl mb-2 tracking-tighter">SFIDA REALE!</h4>
                            <p className="text-gray-400 text-xs font-bold leading-relaxed">
                                L'utente <span className="text-red-400">{activeChallenge.from}</span> ti ha inviato un link di sfida. Accetti il duello?
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 mt-4">
                            <button onClick={acceptChallenge} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-xl border-b-4 border-red-950 transform active:scale-95 transition-all">Accetta Sfida</button>
                            <button onClick={() => { setActiveChallenge(null); window.history.replaceState({}, document.title, window.location.pathname); }} className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all">Rifiuta</button>
                        </div>
                    </div>
                </div>
            )}

            {view === AppState.LOGIN && <LoginScreen onLogin={handleLogin} />}
            {view === AppState.MENU && <MainMenu stats={stats} onNavigate={setView} isChristmas={isChristmasSeason} />}
            {view === AppState.LEVEL_SELECT && (
                <LevelSelect levels={LEVELS} onSelectLevel={(l) => { setCurrentLevel(l); setView(AppState.GAME); }} onBack={() => setView(AppState.MENU)} />
            )}
            {view === AppState.GAME && currentLevel && (
                <GameView 
                    level={currentLevel} 
                    skin={SKINS.find(s => s.id === stats.selectedSkinId) || SKINS[0]} 
                    username={stats.username} 
                    onEnd={handleLevelEnd} 
                />
            )}
            {view === AppState.SKINS && (
                <SkinSelector 
                    skins={SKINS} 
                    unlockedSkins={unlockedSkins} 
                    selectedSkinId={stats.selectedSkinId} 
                    gems={stats.gems} 
                    stats={stats} 
                    isChristmasSeason={isChristmasSeason} 
                    onUnlock={(s, c) => { setStats(p => ({...p, gems: p.gems - c})); setUnlockedSkins(p => [...p, s.id]); }} 
                    onSelect={(id) => setStats(p => ({...p, selectedSkinId: id}))} 
                    onBack={() => setView(AppState.MENU)} 
                />
            )}
            {view === AppState.SHOP && (
                <Shop 
                    stats={stats} 
                    isChristmasSeason={isChristmasSeason} 
                    onPurchase={(t, c) => setStats(p => ({...p, gems: p.gems - c, isPremium: t === 'premium' ? true : p.isPremium, isVip: t === 'vip' ? true : p.isVip}))} 
                    onBack={() => setView(AppState.MENU)} 
                />
            )}
            {view === AppState.GIFT_SHOP && (
                <GiftShop onClaim={(a) => setStats(p => ({...p, gems: p.gems + a}))} onBack={() => setView(AppState.MENU)} />
            )}
            {view === AppState.FRIENDS_LOBBY && (
                <FriendsLobby currentUser={stats.username} selectedSkinId={stats.selectedSkinId} isVip={stats.isVip} onBack={() => setView(AppState.MENU)} onChallenge={handleChallengeBot} />
            )}
            {view === AppState.MP_LOBBY && opponentData && (
                <MPLobby stats={stats} opponentName={opponentData.username} levels={LEVELS} onStart={(l, s) => { setCurrentLevel(l); setView(AppState.MP_GAME); }} onBack={() => setView(AppState.MENU)} />
            )}
            {view === AppState.MP_GAME && currentLevel && opponentData && (
                <MPGameView 
                    level={currentLevel} 
                    mySkin={SKINS.find(s => s.id === stats.selectedSkinId) || SKINS[0]} 
                    oppSkin={SKINS.find(s => s.id === opponentData.skinId) || SKINS[1]}
                    username={stats.username} 
                    opponentName={opponentData.username}
                    onEnd={() => setView(AppState.MENU)} 
                />
            )}
        </div>
    );
};

export default App;
