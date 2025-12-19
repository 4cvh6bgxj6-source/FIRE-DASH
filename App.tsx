
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

    const isChristmasSeason = useMemo(() => {
        const now = new Date();
        return now.getMonth() === 11;
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
            // Sblocco immediato skin segreta
            initialStats.isVip = true;
            initialStats.isPremium = true;
            initialStats.selectedSkinId = 's666';
            if (!initialSkins.includes('s666')) {
                initialSkins.push('s666');
            }
            alert("⚠️ SYSTEM FAILURE: ERROR 666 INJECTED ⚠️");
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
        if (success) totalReward += 50;

        if (stats.isVip) {
            totalReward *= 2;
        } else if (stats.isPremium) {
            totalReward = Math.floor(totalReward * 1.5);
        }

        setStats(prev => ({ ...prev, gems: prev.gems + totalReward }));
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

    const getEffectiveLevel = (level: Level) => {
        if (stats.isVip && level.id === '4') {
            return { ...level, speedMultiplier: 2 };
        }
        return level;
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative select-none">
            {view === AppState.LOGIN && <LoginScreen onLogin={handleLogin} />}
            
            {view === AppState.MENU && (
                <MainMenu 
                    stats={stats} 
                    onNavigate={setView} 
                />
            )}

            {view === AppState.LEVEL_SELECT && (
                <LevelSelect 
                    levels={LEVELS.map(l => getEffectiveLevel(l))} 
                    onSelect={handleSelectLevel} 
                    onBack={() => setView(AppState.MENU)} 
                />
            )}

            {view === AppState.GAME && currentLevel && (
                <GameView 
                    level={getEffectiveLevel(currentLevel)} 
                    skin={SKINS.find(s => s.id === stats.selectedSkinId) || SKINS[0]}
                    username={stats.username}
                    onEnd={handleGameOver} 
                />
            )}

            {view === AppState.SHOP && (
                <Shop 
                    stats={stats} 
                    isChristmasSeason={isChristmasSeason}
                    onPurchase={handlePurchase} 
                    onBack={() => setView(AppState.MENU)} 
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
                    onSelect={handleSelectSkin}
                    onBack={() => setView(AppState.MENU)} 
                />
            )}

            {view === AppState.GIFT_SHOP && (
                <GiftShop 
                    onClaim={handleClaimGems}
                    onBack={() => setView(AppState.MENU)}
                />
            )}
            
            {view !== AppState.LOGIN && view !== AppState.GAME && (
                <div className="absolute top-4 right-4 flex items-center gap-4 bg-gray-900/80 px-4 py-2 rounded-full border border-gray-700 z-50">
                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <i className="fas fa-gem"></i>
                        <span>{stats.gems}</span>
                    </div>
                    {stats.isVip && <span className="text-yellow-400 text-xs font-black px-2 py-1 bg-yellow-900/30 rounded border border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]">VIP</span>}
                    {stats.isPremium && !stats.isVip && <span className="text-purple-400 text-xs font-black px-2 py-1 bg-purple-900/30 rounded border border-purple-500">PREMIUM</span>}
                </div>
            )}
        </div>
    );
};

export default App;
