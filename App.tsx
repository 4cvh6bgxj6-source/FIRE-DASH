
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

    // Periodo natalizio attivo
    const isChristmasSeason = true;

    // Salvataggio automatico
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
            // Aggiunge le gemme raccolte + 100 di bonus vittoria
            setStats(prev => ({
                ...prev,
                gems: prev.gems + gems + 100
            }));
        }
        setView(AppState.LEVEL_SELECT);
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden select-none relative">
            {isChristmasSeason && <div className="snow-container pointer-events-none z-0"></div>}

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
                <FriendsLobby currentUser={stats.username} isVip={stats.isVip} onBack={() => setView(AppState.MENU)} onChallenge={() => {}} />
            )}
        </div>
    );
};

export default App;
