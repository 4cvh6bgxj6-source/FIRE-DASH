
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
        // La skin Error 666 appare solo se sbloccata tramite codice
        if (s.id === 's666') return unlockedSkins.includes(s.id);
        return true;
    });

    return (
        <div className={`flex flex-col items-center h-full w-full p-4 md:p-8 overflow-y-auto relative pb-32 ${isChristmasSeason ? 'bg-gradient-to-b from-red-950/30 to-black' : 'bg-black'}`}>
            {isChristmasSeason && <div className="snow-container pointer-events-none z-0"></div>}
            
            <div className="w-full max-w-6xl flex justify-between items-center mb-8 sticky top-0 bg-black/95 backdrop-blur-xl py-6 z-[60] border-b border-white/10 rounded-b-[2rem] px-6">
                <button onClick={onBack} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-white font-bold transition-all text-xs md:text-sm border border-white/5">
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-2xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Skins & Cubi</h2>
                    {isChristmasSeason && (
                        <div className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest mt-1 animate-pulse shadow-lg shadow-red-500/20">
                            -25% SALDI NATALE ATTIVI
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3 bg-gray-900/80 px-5 py-3 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
                    <i className="fas fa-gem text-blue-400 text-sm"></i>
                    <span className="text-white font-black text-sm md:text-lg">{gems}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 w-full max-w-6xl mt-6 z-10">
                {visibleSkins.map((skin) => {
                    const isUnlocked = unlockedSkins.includes(skin.id);
                    const isSelected = selectedSkinId === skin.id;
                    const hasRequiredTier = skin.requiredTier === 'free' || 
                                           (skin.requiredTier === 'premium' && (stats.isPremium || stats.isVip)) || 
                                           (skin.requiredTier === 'vip' && stats.isVip);

                    // Calcolo prezzo scontato del 25% su TUTTO
                    const discountedCost = isChristmasSeason ? Math.floor(skin.cost * 0.75) : skin.cost;

                    return (
                        <div 
                            key={skin.id} 
                            className={`relative flex flex-col items-center p-6 md:p-8 rounded-[2.5rem] border-2 transition-all duration-300 transform hover:scale-105 ${
                                isSelected ? 'border-blue-500 bg-blue-900/30 shadow-[0_0_30px_rgba(37,99,235,0.3)]' : 'border-white/5 bg-gray-900/50 backdrop-blur-sm'
                            } ${!hasRequiredTier && !isUnlocked ? 'opacity-40 grayscale' : ''}`}
                        >
                            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                {skin.requiredTier === 'vip' && <span className="text-[9px] bg-yellow-500 text-black px-2 py-0.5 rounded-full font-black shadow-lg">VIP</span>}
                                {skin.requiredTier === 'premium' && <span className="text-[9px] bg-purple-500 text-white px-2 py-0.5 rounded-full font-black shadow-lg">PREM</span>}
                                {isChristmasSeason && !isUnlocked && skin.cost > 0 && (
                                    <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase animate-bounce shadow-xl">OFFERTA</span>
                                )}
                            </div>

                            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-[1.5rem] text-3xl md:text-4xl mb-6 relative group"
                                style={{ backgroundColor: skin.color, boxShadow: `0 0 25px ${skin.color}66` }}
                            >
                                <i className={`fas ${skin.icon} text-white group-hover:scale-110 transition-transform`}></i>
                                {isSelected && (
                                    <div className="absolute -bottom-2 -right-2 bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center border-4 border-gray-900">
                                        <i className="fas fa-check text-white text-[10px]"></i>
                                    </div>
                                )}
                            </div>
                            
                            <h4 className="text-white font-black text-xs uppercase text-center mb-4 h-5 overflow-hidden tracking-tight">
                                {skin.name}
                            </h4>
                            
                            {isUnlocked ? (
                                <button 
                                    onClick={() => onSelect(skin.id)} 
                                    className={`w-full py-3 rounded-2xl font-black text-xs uppercase transition-all shadow-lg ${
                                        isSelected ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    {isSelected ? 'IN USO' : 'SELEZIONA'}
                                </button>
                            ) : (
                                <button 
                                    disabled={!hasRequiredTier || gems < discountedCost} 
                                    onClick={() => onUnlock(skin, discountedCost)} 
                                    className={`w-full py-3 rounded-2xl font-black text-xs uppercase transition-all flex flex-col items-center justify-center leading-tight shadow-xl ${
                                        hasRequiredTier && gems >= discountedCost
                                            ? 'bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-500 border-b-4 border-emerald-800' 
                                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    }`}
                                >
                                    {hasRequiredTier ? (
                                        <>
                                            {isChristmasSeason && skin.cost > 0 && <span className="text-[9px] line-through opacity-50 mb-0.5">{skin.cost} Gemme</span>}
                                            <span>{discountedCost} Gemme</span>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <i className="fas fa-lock text-[10px]"></i>
                                            <span>BLOCCATO</span>
                                        </div>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-16 text-center text-gray-600 max-w-lg z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Collezionale Tutte</p>
                <p className="text-[9px] italic">Alcune skin sono sbloccabili solo con il grado VIP o tramite codici segreti speciali.</p>
            </div>
        </div>
    );
};

export default SkinSelector;
