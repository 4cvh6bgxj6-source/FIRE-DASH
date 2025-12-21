
import React from 'react';
import { Level, UserStats } from '../types';

interface Props {
    levels: Level[];
    stats: UserStats;
    onSelectLevel: (level: Level) => void;
    onBack: () => void;
}

const LevelSelect: React.FC<Props> = ({ levels, stats, onSelectLevel, onBack }) => {
    return (
        <div className="h-full w-full bg-black flex flex-col relative overflow-hidden">
            
            {/* Header Sticky e Compatto con Safe Areas */}
            <div className="w-full bg-black/95 backdrop-blur-xl border-b border-white/10 px-4 md:px-10 py-4 flex justify-between items-center z-50 pt-[calc(env(safe-area-inset-top)+10px)] pl-[calc(env(safe-area-inset-left)+20px)] pr-[calc(env(safe-area-inset-right)+20px)] shadow-2xl">
                <button onClick={onBack} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/10">
                    <i className="fas fa-arrow-left text-sm"></i>
                </button>
                <h2 className="text-white font-black italic uppercase tracking-[0.25em] text-[11px] md:text-xl lg:text-3xl drop-shadow-lg">SELEZIONE LIVELLO</h2>
                <div className="flex items-center gap-2 bg-blue-900/30 px-4 py-1.5 rounded-full border border-blue-500/20">
                    <i className="fas fa-gem text-blue-400 text-xs"></i>
                    <span className="text-white font-black text-xs md:text-sm">{stats.gems}</span>
                </div>
            </div>

            {/* Lista Livelli - Griglia ad alta densità per Landscape */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 pb-[calc(env(safe-area-inset-bottom)+30px)] pl-[calc(env(safe-area-inset-left)+20px)] pr-[calc(env(safe-area-inset-right)+20px)]">
                {levels.map((level) => {
                    const isVipLocked = level.requiredTier === 'vip' && !stats.isVip;
                    const isLocked = isVipLocked || (level.requiredSkinId && stats.selectedSkinId !== level.requiredSkinId);
                    
                    return (
                        <div 
                            key={level.id}
                            onClick={() => !isLocked && onSelectLevel(level)}
                            className={`group relative rounded-2xl p-4 transition-all border overflow-hidden ${
                                isLocked 
                                ? 'bg-gray-900/40 border-gray-800 grayscale' 
                                : 'bg-gray-900/80 border-white/5 hover:border-blue-500/50 hover:bg-gray-800 active:scale-95 cursor-pointer shadow-xl'
                            }`}
                        >
                            {isLocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 rounded-2xl">
                                    <i className="fas fa-lock text-white/30 text-2xl"></i>
                                </div>
                            )}

                            <div className="flex flex-col gap-1 relative z-20">
                                <h3 className="text-white font-black uppercase text-[10px] md:text-sm truncate tracking-tighter drop-shadow-md">{level.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className={`text-[7px] md:text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                        level.difficulty === 'Extreme' ? 'bg-red-900 text-red-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-blue-900 text-blue-100'
                                    }`}>
                                        {level.difficulty}
                                    </span>
                                    <span className="text-white font-black text-[9px] md:text-xs opacity-50 italic">{level.speedMultiplier}x</span>
                                </div>
                            </div>

                            {/* Barra decorativa fissa */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 rounded-b-2xl overflow-hidden">
                                <div className="h-full bg-blue-500 opacity-20" style={{width: '20%'}}></div>
                            </div>

                            {/* Bagliore di sfondo adattivo */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-5 group-hover:opacity-15 transition-opacity duration-500" style={{backgroundColor: level.color}}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelSelect;
