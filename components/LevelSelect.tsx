
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
        <div className="flex flex-col items-center h-full w-full bg-black overflow-y-auto pb-24 relative">
            <div className="w-full max-w-4xl flex justify-between items-center p-3 md:p-8 sticky top-0 bg-black/90 backdrop-blur-md z-50 pt-safe pl-safe pr-safe border-b border-white/5">
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white font-bold transition-all text-[10px] border border-white/5 active:scale-90"
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h2 className="text-base md:text-3xl font-black italic text-white uppercase tracking-widest">LIVELLI</h2>
                <div className="flex items-center gap-1.5 bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-500/20">
                    <i className="fas fa-gem text-blue-400 text-[8px]"></i>
                    <span className="text-white text-[10px] font-black">{stats.gems}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-5xl px-3 md:px-8 mt-4">
                {levels.map((level) => {
                    const isVipLocked = level.requiredTier === 'vip' && !stats.isVip;
                    const isSkinLocked = level.requiredSkinId && stats.selectedSkinId !== level.requiredSkinId;
                    const isLocked = isVipLocked || isSkinLocked;
                    
                    return (
                        <div 
                            key={level.id}
                            onClick={() => {
                                if (!isLocked) onSelectLevel(level);
                                else alert(isVipLocked ? "Richiede VIP!" : "Richiede Skin BOSS HUNTER!");
                            }}
                            className={`group relative border rounded-xl p-3 md:p-5 transition-all ${
                                isLocked 
                                ? 'bg-gray-900/30 border-gray-800 opacity-60 grayscale' 
                                : 'bg-gray-900/60 border-white/5 hover:border-blue-500/50 active:scale-95'
                            }`}
                        >
                            {isLocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 rounded-xl">
                                    <i className={`fas ${isVipLocked ? 'fa-crown text-yellow-500' : 'fa-crosshairs text-emerald-400'} text-xl`}></i>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                                <div className="max-w-[70%]">
                                    <h3 className="text-xs md:text-base font-black text-white uppercase tracking-tighter truncate leading-tight">{level.name}</h3>
                                    <span className={`text-[7px] md:text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                        level.difficulty === 'Extreme' ? 'bg-red-900/50 text-red-200' : 
                                        level.difficulty === 'Demon' ? 'bg-purple-900/50 text-purple-200' :
                                        'bg-blue-900/50 text-blue-200'
                                    }`}>
                                        {level.difficulty}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-600 text-[6px] md:text-[8px] uppercase font-black">SPEED</div>
                                    <div className="font-black text-[10px] md:text-sm text-white">{level.speedMultiplier}x</div>
                                </div>
                            </div>

                            <div className="h-1 w-full bg-gray-800/50 rounded-full overflow-hidden mt-1">
                                <div 
                                    className="h-full transition-all duration-500"
                                    style={{ backgroundColor: level.color, width: isLocked ? '0%' : '100%' }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelSelect;
