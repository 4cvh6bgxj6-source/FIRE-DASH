
import React from 'react';
import { Skin } from '../types';

interface Props {
    skins: Skin[];
    unlockedSkins: string[];
    selectedSkinId: string;
    gems: number;
    isChristmasSeason: boolean;
    onUnlock: (skin: Skin, cost: number) => void;
    onSelect: (skinId: string) => void;
    onBack: () => void;
}

const SkinSelector: React.FC<Props> = ({ skins, unlockedSkins, selectedSkinId, gems, isChristmasSeason, onUnlock, onSelect, onBack }) => {
    return (
        <div className="flex flex-col items-center h-full w-full bg-black p-8 overflow-y-auto">
            <div className="w-full max-w-4xl flex justify-between items-center mb-12">
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-white font-bold transition-colors"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Skins & Cubi</h2>
                    {isChristmasSeason && <p className="text-red-500 text-xs font-black animate-pulse uppercase">Sconti di Natale -25%</p>}
                </div>
                <div className="w-[100px]"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 w-full max-w-4xl">
                {skins.map((skin) => {
                    const isUnlocked = unlockedSkins.includes(skin.id);
                    const isSelected = selectedSkinId === skin.id;
                    const discountedCost = isChristmasSeason ? Math.floor(skin.cost * 0.75) : skin.cost;

                    return (
                        <div 
                            key={skin.id}
                            className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${
                                isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-white/5 bg-gray-900'
                            }`}
                        >
                            {isChristmasSeason && !isUnlocked && skin.cost > 0 && (
                                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg z-10 rotate-12">
                                    -25%
                                </div>
                            )}
                            
                            <div 
                                className={`w-16 h-16 flex items-center justify-center rounded-xl text-3xl mb-4 transition-transform ${isSelected ? 'scale-110 rotate-12' : ''}`}
                                style={{ backgroundColor: skin.color, boxShadow: isSelected ? `0 0 15px ${skin.color}` : 'none' }}
                            >
                                <i className={`fas ${skin.icon} text-white`}></i>
                            </div>
                            
                            <h4 className="text-white font-bold text-xs uppercase text-center mb-3 h-8 flex items-center">{skin.name}</h4>
                            
                            {isUnlocked ? (
                                <button 
                                    onClick={() => onSelect(skin.id)}
                                    className={`w-full py-2 rounded-lg font-black text-xs uppercase ${
                                        isSelected ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {isSelected ? 'In Uso' : 'Seleziona'}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => onUnlock(skin, discountedCost)}
                                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase flex flex-col items-center justify-center leading-none"
                                >
                                    <div className="flex items-center gap-1 mb-1">
                                        <i className="fas fa-gem text-[10px]"></i> 
                                        {discountedCost}
                                    </div>
                                    {isChristmasSeason && (
                                        <span className="text-[8px] line-through opacity-60">{skin.cost}</span>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-16 flex items-center gap-4 bg-gray-900/50 p-6 rounded-3xl border border-white/5">
                <div className="text-blue-400 text-4xl">
                    <i className="fas fa-magic"></i>
                </div>
                <div>
                    <h5 className="text-white font-black uppercase text-sm">Personalizza il tuo Stile</h5>
                    <p className="text-gray-500 text-xs">Sblocca nuove skin con le gemme guadagnate giocando.</p>
                </div>
            </div>
        </div>
    );
};

export default SkinSelector;
