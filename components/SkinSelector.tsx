
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
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-white font-bold transition-colors"
                >
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
                    
                    const hasRequiredTier = 
                        skin.requiredTier === 'free' || 
                        (skin.requiredTier === 'premium' && (stats.isPremium || stats.isVip)) ||
                        (skin.requiredTier === 'vip' && stats.isVip);

                    // Gestione nome segreto per s666
                    const displayName = (skin.id === 's666' && !isUnlocked) ? 'SECRET...' : skin.name;

                    return (
                        <div 
                            key={skin.id}
                            className={`relative flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300 ${
                                isSelected ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-white/5 bg-gray-900'
                            } ${!hasRequiredTier ? 'opacity-40 grayscale' : ''}`}
                        >
                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                                {skin.requiredTier === 'premium' && (
                                    <div className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 uppercase">
                                        <i className="fas fa-crown"></i> Premium
                                    </div>
                                )}
                                {skin.requiredTier === 'vip' && (
                                    <div className="bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 uppercase shadow-lg">
                                        <i className="fas fa-star"></i> VIP
                                    </div>
                                )}
                                {skin.isGlitched && (
                                    <div className={`${skin.id === 's666' ? 'bg-red-950 text-red-500 border border-red-500' : 'bg-red-600 text-white'} text-[8px] font-black px-1.5 py-0.5 rounded animate-pulse uppercase`}>
                                        <i className={`fas ${skin.id === 's666' ? 'fa-biohazard' : 'fa-bug'}`}></i> {skin.id === 's666' ? 'ERROR' : 'Admin'}
                                    </div>
                                )}
                            </div>
                            
                            <div 
                                className={`w-20 h-20 flex items-center justify-center rounded-2xl text-4xl mb-4 transition-transform ${isSelected ? 'scale-110' : ''} ${skin.isGlitched ? 'animate-bounce' : ''}`}
                                style={{ 
                                    backgroundColor: (skin.id === 's666' && !isUnlocked) ? '#000' : skin.color, 
                                    boxShadow: isSelected ? `0 0 25px ${skin.color}` : `0 0 10px ${skin.color}44`,
                                    filter: skin.isGlitched ? (skin.id === 's666' ? 'contrast(2) brightness(0.8)' : 'hue-rotate(90deg) contrast(1.5)') : 'none',
                                    border: (skin.id === 's666' && !isUnlocked) ? '2px dashed #ff0000' : 'none'
                                }}
                            >
                                <i className={`fas ${ (skin.id === 's666' && !isUnlocked) ? 'fa-question' : skin.icon} text-white ${skin.isGlitched ? 'skew-x-12' : ''}`}></i>
                            </div>
                            
                            <h4 className={`text-white font-black text-xs uppercase text-center mb-3 h-8 flex items-center ${skin.isGlitched ? (skin.id === 's666' ? 'text-red-600 font-mono font-black' : 'text-green-400 font-mono italic') : ''}`}>
                                {displayName}
                            </h4>
                            
                            {isUnlocked ? (
                                <button 
                                    onClick={() => onSelect(skin.id)}
                                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase transition-all ${
                                        isSelected ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {isSelected ? 'In Uso' : 'Usa'}
                                </button>
                            ) : (
                                <button 
                                    disabled={!hasRequiredTier}
                                    onClick={() => onUnlock(skin, discountedCost)}
                                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase flex flex-col items-center justify-center transition-all ${
                                        hasRequiredTier 
                                        ? (skin.id === 's666' ? 'bg-red-900 hover:bg-red-800' : (skin.isGlitched ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500')) + ' text-white shadow-lg' 
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {hasRequiredTier ? (
                                        <>
                                            <div className="flex items-center gap-1">
                                                <i className="fas fa-gem text-[10px]"></i> 
                                                {discountedCost === 0 ? 'GRATIS' : discountedCost}
                                            </div>
                                            {isChristmasSeason && discountedCost > 0 && (
                                                <span className="text-[8px] line-through opacity-60">{skin.cost}</span>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <i className="fas fa-lock text-[10px] mb-0.5"></i>
                                            <span className="text-[9px]">{skin.requiredTier === 'vip' ? 'Solo VIP' : 'Solo Premium'}</span>
                                        </div>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-16 flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-3xl border border-white/10 max-w-4xl backdrop-blur-md">
                <div className="text-red-600 text-5xl animate-bounce">
                    <i className="fas fa-radiation"></i>
                </div>
                <div>
                    <h5 className="text-white font-black uppercase text-lg mb-1 tracking-tighter">Protocollo d'Emergenza 666</h5>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Esiste un'entità chiamata <span className="text-red-600 font-black">ERROR 666</span>. 
                        Sbloccarla richiede il massimo livello di VIP e una quantità enorme di gemme. 
                        Si dice che questa skin rompa le leggi della gravità permettendo al portatore di <span className="text-yellow-400 font-bold uppercase">volare infinitamente</span> tenendo premuto il salto.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SkinSelector;
