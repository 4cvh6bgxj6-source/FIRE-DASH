
import React from 'react';
import { Skin, UserStats } from '../types';

interface Props {
    skins: Skin[];
    unlockedSkins: string[];
    selectedSkinId: string;
    gems: number;
    stats: UserStats;
    isChristmasSeason: boolean;
    onUnlock: (skin: Skin, cost: number) => void;
    onSelect: (skinId: string) => void;
    onBack: () => void;
}

const SkinSelector: React.FC<Props> = ({ skins, unlockedSkins, selectedSkinId, gems, stats, isChristmasSeason, onUnlock, onSelect, onBack }) => {
    const visibleSkins = skins.filter(s => {
        if (s.id === 's-seba') return unlockedSkins.includes(s.id);
        return true;
    });

    return (
        <div className="flex flex-col items-center h-full w-full bg-black p-8 overflow-y-auto">
            <div className="w-full max-w-6xl flex justify-between items-center mb-12">
                <button onClick={onBack} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-white font-bold transition-colors">
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Skins & Cubi</h2>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">Personalizza il tuo Fire Dasher</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-xl border border-white/5">
                    <i className="fas fa-gem text-blue-400"></i>
                    <span className="text-white font-black">{gems}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-6xl">
                {visibleSkins.map((skin) => {
                    const isUnlocked = unlockedSkins.includes(skin.id);
                    const isSelected = selectedSkinId === skin.id;
                    const discountedCost = isChristmasSeason ? Math.floor(skin.cost * 0.75) : skin.cost;
                    const hasRequiredTier = skin.requiredTier === 'free' || (skin.requiredTier === 'premium' && (stats.isPremium || stats.isVip)) || (skin.requiredTier === 'vip' && stats.isVip);

                    const isSecret = skin.id === 's666' && !isUnlocked;
                    const displayName = isSecret ? 'SECRET...' : skin.name;

                    return (
                        <div 
                            key={skin.id} 
                            className={`relative flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300 ${
                                isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-white/5 bg-gray-900'
                            } ${!hasRequiredTier && !isUnlocked ? 'opacity-40 grayscale' : ''} ${isSecret ? 'border-red-900/30' : ''}`}
                        >
                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                                {skin.isGlitched && (
                                    <div className={`${skin.id === 's666' || skin.id === 's-seba' ? 'bg-red-950 text-red-500 border border-red-500' : 'bg-red-600 text-white'} text-[8px] font-black px-1.5 py-0.5 rounded animate-pulse uppercase`}>
                                        <i className="fas fa-biohazard mr-1"></i> {isSecret ? 'UNKNOWN' : (skin.id === 's-seba' ? 'SEBA_GHOST' : 'ERROR')}
                                    </div>
                                )}
                            </div>
                            
                            <div className={`w-20 h-20 flex items-center justify-center rounded-2xl text-4xl mb-4 transition-transform ${isSelected ? 'scale-110' : ''}`}
                                style={{ 
                                    backgroundColor: isSecret ? '#0a0000' : skin.color, 
                                    boxShadow: isSelected ? `0 0 25px ${skin.color}` : (isSecret ? '0 0 15px rgba(255,0,0,0.1)' : `0 0 10px ${skin.color}44`),
                                    filter: skin.isGlitched ? 'contrast(1.5)' : 'none',
                                    border: isSecret ? '2px dashed #440000' : 'none'
                                }}
                            >
                                <i className={`fas ${isSecret ? 'fa-question-circle animate-pulse' : skin.icon} text-white`}></i>
                            </div>
                            
                            <h4 className={`text-white font-black text-xs uppercase text-center mb-3 h-8 flex items-center justify-center ${skin.id === 's666' || skin.id === 's-seba' ? 'text-red-600 font-mono tracking-tighter' : ''}`}>
                                {displayName}
                            </h4>
                            
                            {isUnlocked ? (
                                <button 
                                    onClick={() => onSelect(skin.id)} 
                                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase transition-all ${
                                        isSelected ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {isSelected ? 'In Uso' : 'Usa'}
                                </button>
                            ) : (
                                <button 
                                    disabled={!hasRequiredTier} 
                                    onClick={() => onUnlock(skin, discountedCost)} 
                                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase transition-all ${
                                        hasRequiredTier 
                                            ? (skin.id === 's666' ? 'bg-red-900 hover:bg-red-800' : 'bg-emerald-600 hover:bg-emerald-500') + ' text-white shadow-lg' 
                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <i className="fas fa-gem text-[10px]"></i>
                                        <span>{discountedCost}</span>
                                    </div>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SkinSelector;
