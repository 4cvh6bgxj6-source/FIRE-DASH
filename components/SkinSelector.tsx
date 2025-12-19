
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
                <div className="w-[100px]"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-6xl">
                {skins.map((skin) => {
                    const isUnlocked = unlockedSkins.includes(skin.id);
                    const isSelected = selectedSkinId === skin.id;
                    const discountedCost = isChristmasSeason ? Math.floor(skin.cost * 0.75) : skin.cost;
                    const hasRequiredTier = skin.requiredTier === 'free' || (skin.requiredTier === 'premium' && (stats.isPremium || stats.isVip)) || (skin.requiredTier === 'vip' && stats.isVip);

                    const displayName = (skin.id === 's666' && !isUnlocked) ? 'SECRET...' : skin.name;

                    return (
                        <div key={skin.id} className={`relative flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300 ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-white/5 bg-gray-900'} ${!hasRequiredTier ? 'opacity-40 grayscale' : ''}`}>
                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                                {skin.isGlitched && <div className={`${skin.id === 's666' ? 'bg-red-950 text-red-500 border border-red-500' : 'bg-red-600 text-white'} text-[8px] font-black px-1.5 py-0.5 rounded animate-pulse uppercase`}><i className="fas fa-biohazard mr-1"></i> ERROR</div>}
                            </div>
                            
                            <div className={`w-20 h-20 flex items-center justify-center rounded-2xl text-4xl mb-4 transition-transform ${isSelected ? 'scale-110' : ''}`}
                                style={{ 
                                    backgroundColor: (skin.id === 's666' && !isUnlocked) ? '#000' : skin.color, 
                                    boxShadow: isSelected ? `0 0 25px ${skin.color}` : `0 0 10px ${skin.color}44`,
                                    filter: skin.isGlitched ? 'contrast(1.5)' : 'none',
                                    border: (skin.id === 's666' && !isUnlocked) ? '2px dashed #ff0000' : 'none'
                                }}
                            >
                                <i className={`fas ${(skin.id === 's666' && !isUnlocked) ? 'fa-question' : skin.icon} text-white`}></i>
                            </div>
                            
                            <h4 className={`text-white font-black text-xs uppercase text-center mb-3 h-8 flex items-center ${skin.id === 's666' ? 'text-red-600 font-mono' : ''}`}>
                                {displayName}
                            </h4>
                            
                            {isUnlocked ? (
                                <button onClick={() => onSelect(skin.id)} className={`w-full py-2.5 rounded-xl font-black text-xs uppercase transition-all ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                    {isSelected ? 'In Uso' : 'Usa'}
                                </button>
                            ) : (
                                <button disabled={!hasRequiredTier} onClick={() => onUnlock(skin, discountedCost)} className={`w-full py-2.5 rounded-xl font-black text-xs uppercase transition-all ${hasRequiredTier ? (skin.id === 's666' ? 'bg-red-900' : 'bg-emerald-600') + ' text-white' : 'bg-gray-800 text-gray-500'}`}>
                                    <i className="fas fa-gem mr-1"></i> {discountedCost}
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
