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
    // Ordiniamo le skin: prima le sbloccate, poi le altre. Le speciali s666 e s8 sempre alla fine.
    const sortedSkins = [...skins].sort((a, b) => {
        const aSpecial = a.id === 's666' || a.id === 's8' ? 2 : (unlockedSkins.includes(a.id) ? 0 : 1);
        const bSpecial = b.id === 's666' || b.id === 's8' ? 2 : (unlockedSkins.includes(b.id) ? 0 : 1);
        return aSpecial - bSpecial;
    });

    const visibleSkins = sortedSkins.filter(s => {
        if (s.id === 's-seba') return unlockedSkins.includes(s.id);
        return true;
    });

    return (
        <div className="flex flex-col items-center h-full w-full bg-black p-4 md:p-8 overflow-y-auto relative pb-32">
            <div className="w-full max-w-6xl flex justify-between items-center mb-8 sticky top-0 bg-black/90 backdrop-blur-md py-4 z-[60] border-b border-white/5">
                <button onClick={onBack} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white font-bold transition-all transform active:scale-95 text-xs">
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Skins & Cubi</h2>
                    <p className="text-gray-500 text-[8px] uppercase font-bold tracking-[0.2em] hidden sm:block">Personalizza il tuo Fire Dasher</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-xl border border-white/5">
                    <i className="fas fa-gem text-blue-400 text-xs"></i>
                    <span className="text-white font-black text-xs">{gems}</span>
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
                            } ${!hasRequiredTier && !isUnlocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-default'} ${skin.isGlitched ? 'glow-red' : ''}`}
                        >
                            {/* Special Badges */}
                            <div className="absolute -top-2 -right-2 flex flex-col gap-1 items-end z-20">
                                {skin.id === 's666' && <span className="bg-red-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full shadow-lg animate-pulse uppercase border border-white/20">ERROR_CODE</span>}
                                {skin.id === 's8' && <span className="bg-emerald-600 text-black text-[7px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase border border-white/20">ADMIN_SYS</span>}
                                {skin.requiredTier === 'vip' && !skin.isGlitched && <span className="bg-yellow-500 text-black text-[7px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase">VIP</span>}
                            </div>
                            
                            <div className={`w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-2xl text-2xl md:text-4xl mb-4 transition-transform ${isSelected ? 'scale-110' : ''}`}
                                style={{ 
                                    backgroundColor: skin.color, 
                                    boxShadow: isSelected ? `0 0 25px ${skin.color}` : `0 0 5px ${skin.color}44`,
                                    filter: skin.isGlitched ? 'contrast(1.3) brightness(1.1) hue-rotate(15deg)' : 'none'
                                }}
                            >
                                <i className={`fas ${skin.icon} text-white`}></i>
                            </div>
                            
                            <h4 className={`text-white font-black text-[9px] md:text-xs uppercase text-center mb-3 h-8 flex items-center justify-center ${skin.isGlitched ? 'text-red-500 font-mono' : ''}`}>
                                {skin.name}
                            </h4>
                            
                            {isUnlocked ? (
                                <button 
                                    onClick={() => onSelect(skin.id)} 
                                    className={`w-full py-2 md:py-2.5 rounded-xl font-black text-[9px] md:text-xs uppercase transition-all transform active:scale-95 ${
                                        isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    {isSelected ? 'In Uso' : 'Seleziona'}
                                </button>
                            ) : (
                                <button 
                                    disabled={!hasRequiredTier} 
                                    onClick={() => onUnlock(skin, discountedCost)} 
                                    className={`w-full py-2 md:py-2.5 rounded-xl font-black text-[9px] md:text-xs uppercase transition-all transform active:scale-95 ${
                                        hasRequiredTier 
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg' 
                                            : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-1.5">
                                        <i className="fas fa-gem text-[8px] md:text-[10px]"></i>
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