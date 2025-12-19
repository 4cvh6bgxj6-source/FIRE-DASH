
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, UserStats, Level, Skin } from './types';
import { LEVELS, SKINS } from './constants';
import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import GameView from './components/GameView';
import Shop from './components/Shop';
import SkinSelector from './components/SkinSelector';
import GiftShop from './components/GiftShop';

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

    // Salvataggio automatico ogni volta che cambiano le stats o le skin
    useEffect(() => {
        if (stats.username && stats.username !== 'Guest') {
            const saveData = {
                stats,
                unlockedSkins
            };
            localStorage.setItem(`fd_user_data_${stats.username.toLowerCase()}`, JSON.stringify(saveData));
        }
    }, [stats, unlockedSkins]);

    const isChristmasSeason = useMemo(() => {
        const now = new Date();
        return now.getMonth() === 11; 
    }, []);

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

        // Se l'account esiste già, carichiamo i dati salvati
        if (savedRaw) {
            try {
                const parsed = JSON.parse(savedRaw);
                initialStats = { ...parsed.stats, username: username }; // Assicuriamo che l'username sia quello corretto
                initialSkins = parsed.unlockedSkins;
            } catch (e) {
                console.error("Errore nel caricamento dei dati", e);
            }
        }

        // Applichiamo i codici segreti sopra i dati caricati (se inseriti)
        const code = secretCode.trim().toUpperCase();
        if (code === 'ADMIN') {
            initialStats.isVip = true;
            initialStats.isPremium = true;
            initialStats.gems += 2000; 
        } else if (code === 'ERROR666') {
            initialStats.isVip = true;
            initialStats.isPremium = true;
            initialStats.selectedSkinId = 's666';
            if (!initialSkins.includes('s666')) initialSkins.push('s666');
            initialStats.gems += 666;
        } else if (code === 'VIP') {
            initialStats.isVip = true;
            initialStats.isPremium = true;
            initialStats.gems += 1000;
        }

        setStats(initialStats);
        setUnlockedSkins(initialSkins);
        setView(AppState.MENU);
    };

    const handleGameOver = (success: boolean, gems: number) => {
        setStats(prev => ({ ...prev, gems: prev.gems + gems }));
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
        }
    };

    const handleUnlockSkin = (skin: Skin, cost: number) => {
        if (stats.gems >= cost) {
            setStats(prev => ({ ...prev, gems: prev.gems - cost }));
            setUnlockedSkins(prev => [...prev, skin.id]);
        }
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden select-none relative">
            {isChristmasSeason && (
                <div className="absolute inset-0 pointer-events-none z-[100] opacity-30">
                    <div className="snow-container"></div>
                </div>
            )}

            {view === AppState.LOGIN && <LoginScreen onLogin={handleLogin} />}
            {view === AppState.MENU && <MainMenu stats={stats} onNavigate={setView} />}
            {view === AppState.LEVEL_SELECT && (
                <LevelSelect 
                    levels={LEVELS} 
                    onSelectLevel={(l) => { setCurrentLevel(l); setView(AppState.GAME); }} 
                    onBack={() => setView(AppState.MENU)} 
                />
            )}
            {view === AppState.GAME && currentLevel && (
                <GameView 
                    level={currentLevel} 
                    skin={SKINS.find(s => s.id === stats.selectedSkinId) || SKINS[0]} 
                    username={stats.username} 
                    isVip={stats.isVip} 
                    onEnd={handleGameOver} 
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
                    onUnlock={handleUnlockSkin} 
                    onSelect={(id) => setStats(p => ({...p, selectedSkinId: id}))} 
                    onBack={() => setView(AppState.MENU)} 
                />
            )}
            {view === AppState.SHOP && (
                <Shop stats={stats} isChristmasSeason={isChristmasSeason} onPurchase={handlePurchase} onBack={() => setView(AppState.MENU)} />
            )}
            {view === AppState.GIFT_SHOP && (
                <GiftShop onClaim={(a) => setStats(p => ({...p, gems: p.gems + a}))} onBack={() => setView(AppState.MENU)} />
            )}
        </div>
    );
};

export default App;
