
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
        <div className="flex flex-col items-center h-full w-full bg-black p-4 md:p-8 overflow-y-auto relative pb-32">
            {/* Christmas Corner Ribbon */}
            {isChristmasSeason && (
                <div className="fixed top-0 left-0 w-32 h-32 z-50 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-0 bg-red-600 text-white font-black text-[10px] px-10 py-1 -rotate-45 -translate-x-10 translate-y-4 shadow-lg border-b border-white/20 uppercase">
                        SALE -25%
                    </div>
                </div>
            )}

            <div className="w-full max-w-6xl flex justify-between items-center mb-8 md:mb-12 sticky top-0 bg-black/80 backdrop-blur-md py-4 z-[60] border-b border-white/5">
                <button onClick={onBack} className="bg-white/10 hover:bg-white/20 px-4 md:px-6 py-2 rounded-xl text-white font-bold transition-all transform active:scale-95 text-xs md:text-base">
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-2xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Skins & Cubi</h2>
                    <p className="text-gray-500 text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em]">Personalizza il tuo Fire Dasher</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-900 px-3 md:px-4 py-2 rounded-xl border border-white/5">
                    <i className="fas fa-gem text-blue-400 text-xs md:text-base"></i>
                    <span className="text-white font-black text-xs md:text-base">{gems}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 w-full max-w-6xl">
                {visibleSkins.map((skin) => {
                    const isUnlocked = unlockedSkins.includes(skin.id);
                    const isSelected = selectedSkinId === skin.id;
                    const discountedCost = isChristmasSeason ? Math.floor(skin.cost * 0.75) : skin.cost;
                    const hasRequiredTier = skin.requiredTier === 'free' || (skin.requiredTier === 'premium' && (stats.isPremium || stats.isVip)) || (skin.requiredTier === 'vip' && stats.isVip);

                    return (
                        <div 
                            key={skin.id} 
                            className={`relative flex flex-col items-center p-4 md:p-6 rounded-3xl border-2 transition-all duration-300 ${
                                isSelected ? 'border-blue-500 bg-blue-900/20 scale-[1.02]' : 'border-white/5 bg-gray-900 hover:border-white/20'
                            } ${!hasRequiredTier && !isUnlocked ? 'opacity-40 grayscale' : ''} ${skin.id === 's666' ? 'border-red-900/30' : ''}`}
                        >
                            {/* Sale Tag */}
                            {isChristmasSeason && !isUnlocked && skin.cost > 0 && (
                                <div className="absolute -top-2 -left-2 bg-red-600 text-white font-black text-[8px] px-2 py-1 rounded-lg shadow-lg z-20 border border-white/20 animate-pulse">
                                    -25%
                                </div>
                            )}

                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                                {skin.isGlitched && (
                                    <div className={`${skin.id === 's666' || skin.id === 's-seba' ? 'bg-red-950 text-red-500 border border-red-500' : 'bg-emerald-950 text-emerald-500 border border-emerald-500'} text-[7px] font-black px-1.5 py-0.5 rounded animate-pulse uppercase`}>
                                        <i className="fas fa-biohazard mr-1"></i> {skin.id === 's666' ? 'ERROR' : (skin.id === 's8' ? 'ADMIN' : 'MOD')}
                                    </div>
                                )}
                            </div>
                            
                            <div className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl text-3xl md:text-4xl mb-4 transition-transform ${isSelected ? 'scale-110' : ''}`}
                                style={{ 
                                    backgroundColor: skin.color, 
                                    boxShadow: isSelected ? `0 0 25px ${skin.color}` : `0 0 10px ${skin.color}44`,
                                    filter: skin.isGlitched ? 'contrast(1.2) brightness(1.2)' : 'none',
                                    border: skin.id === 's666' ? '2px solid #ff0000' : 'none'
                                }}
                            >
                                <i className={`fas ${skin.icon} text-white`}></i>
                            </div>
                            
                            <h4 className={`text-white font-black text-[10px] md:text-xs uppercase text-center mb-3 h-8 flex items-center justify-center ${skin.id === 's666' || skin.id === 's-seba' ? 'text-red-600 font-mono tracking-tighter' : ''}`}>
                                {skin.name}
                            </h4>
                            
                            {isUnlocked ? (
                                <button 
                                    onClick={() => onSelect(skin.id)} 
                                    className={`w-full py-2 md:py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase transition-all transform active:scale-95 ${
                                        isSelected ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {isSelected ? 'In Uso' : 'Usa'}
                                </button>
                            ) : (
                                <button 
                                    disabled={!hasRequiredTier} 
                                    onClick={() => onUnlock(skin, discountedCost)} 
                                    className={`w-full py-2 md:py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase transition-all transform active:scale-95 ${
                                        hasRequiredTier 
                                            ? (skin.id === 's666' ? 'bg-red-900 hover:bg-red-800' : 'bg-emerald-600 hover:bg-emerald-500') + ' text-white shadow-lg' 
                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <i className="fas fa-gem text-[8px] md:text-[10px]"></i>
                                            <span>{discountedCost}</span>
                                        </div>
                                        {isChristmasSeason && skin.cost > 0 && (
                                            <span className="text-[7px] line-through opacity-50">{skin.cost}</span>
                                        )}
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
