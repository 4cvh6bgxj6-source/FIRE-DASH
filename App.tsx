
import React, { useState, useMemo } from 'react';
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

    // Rileva automaticamente se siamo a Dicembre (mese 11 in JS)
    const isChristmasSeason = useMemo(() => {
        const now = new Date();
        return now.getMonth() === 11; 
    }, []);

    const handleLogin = (username: string, secretCode: string) => {
        let isVip = false;
        let startSkin = 's1';
        let extraGems = 0;
        let autoUnlocked: string[] = ['s1'];

        const code = secretCode.trim().toUpperCase();
        
        if (code === 'ADMIN') {
            isVip = true;
            extraGems = 2000; 
        } else if (code === 'ERROR666') {
            isVip = true;
            startSkin = 's666';
            autoUnlocked.push('s666');
            extraGems = 666;
        } else if (code === 'VIP') {
            isVip = true;
            extraGems = 1000;
        }

        setStats({
            username: username || 'Guest',
            gems: extraGems,
            isPremium: isVip,
            isVip: isVip,
            selectedSkinId: startSkin
        });

        setUnlockedSkins(autoUnlocked);
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
            {/* Effetto neve globale se è Natale */}
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
