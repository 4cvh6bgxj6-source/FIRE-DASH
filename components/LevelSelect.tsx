
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
            
            {/* Header Sticky e Compatto */}
            <div className="w-full bg-black/95 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3 flex justify-between items-center z-50 pt-[calc(env(safe-area-inset-top)+8px)] pl-[calc(env(safe-area-inset-left)+16px)] pr-[calc(env(safe-area-inset-right)+16px)]">
                <button onClick={onBack} className="w-8 h-8 md:w-10 md:h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-white active:scale-90 transition-all border border-white/10">
                    <i className="fas fa-arrow-left text-xs"></i>
                </button>
                <h2 className="text-white font-black italic uppercase tracking-[0.2em] text-[10px] md:text-lg">SELEZIONE LIVELLO</h2>
                <div className="flex items-center gap-2 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/20">
                    <i className="fas fa-gem text-blue-400 text-[9px]"></i>
                    <span className="text-white font-black text-[10px]">{stats.gems}</span>
                </div>
            </div>

            {/* Lista Livelli - Griglia fitta per Landscape */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-[calc(env(safe-area-inset-bottom)+20px)] pl-[calc(env(safe-area-inset-left)+16px)] pr-[calc(env(safe-area-inset-right)+16px)]">
                {levels.map((level) => {
                    const isVipLocked = level.requiredTier === 'vip' && !stats.isVip;
                    const isLocked = isVipLocked || (level.requiredSkinId && stats.selectedSkinId !== level.requiredSkinId);
                    
                    return (
                        <div 
                            key={level.id}
                            onClick={() => !isLocked && onSelectLevel(level)}
                            className={`group relative rounded-2xl p-3 transition-all border ${
                                isLocked 
                                ? 'bg-gray-900/40 border-gray-800 grayscale' 
                                : 'bg-gray-900 border-white/5 hover:border-blue-500/50 active:scale-95 cursor-pointer'
                            }`}
                        >
                            {isLocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-2xl">
                                    <i className="fas fa-lock text-white/30 text-xl"></i>
                                </div>
                            )}

                            <div className="flex flex-col gap-1 relative z-20">
                                <h3 className="text-white font-black uppercase text-[10px] md:text-xs truncate tracking-tighter">{level.name}</h3>
                                <div className="flex justify-between items-center mt-1">
                                    <span className={`text-[7px] md:text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                                        level.difficulty === 'Extreme' ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-100'
                                    }`}>
                                        {level.difficulty}
                                    </span>
                                    <span className="text-white font-black text-[8px] opacity-40">{level.speedMultiplier}x</span>
                                </div>
                            </div>

                            {/* Barra decorativa progresso (finta per ora) */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 rounded-b-2xl overflow-hidden">
                                <div className="h-full bg-emerald-500 opacity-40" style={{width: '0%'}}></div>
                            </div>

                            {/* Glow di sfondo */}
                            <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{backgroundColor: level.color}}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelSelect;
