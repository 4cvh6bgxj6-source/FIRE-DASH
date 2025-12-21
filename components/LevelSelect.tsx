
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
        <div className="flex flex-col items-center h-full w-full bg-black p-4 md:p-8 overflow-y-auto pb-24">
            <div className="w-full max-w-4xl flex justify-between items-center mb-10 sticky top-0 bg-black/80 backdrop-blur-md py-4 z-50">
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white font-bold transition-all text-xs border border-white/5"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <h2 className="text-xl md:text-3xl font-black italic text-white uppercase tracking-tighter">Seleziona Livello</h2>
                <div className="w-10"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-4xl">
                {levels.map((level) => {
                    const isVipLocked = level.requiredTier === 'vip' && !stats.isVip;
                    const isSkinLocked = level.requiredSkinId && stats.selectedSkinId !== level.requiredSkinId;
                    const isLocked = isVipLocked || isSkinLocked;
                    
                    const isDarknessHardcore = level.id === '14';
                    const isTheFinalBoss = level.id === '99';
                    
                    return (
                        <div 
                            key={level.id}
                            onClick={() => {
                                if (!isLocked) {
                                    onSelectLevel(level);
                                } else {
                                    if (isVipLocked && isSkinLocked) {
                                        alert("REQUISITI MANCANTI:\n1. Devi essere VIP\n2. Devi equipaggiare la skin BOSS HUNTER");
                                    } else if (isVipLocked) {
                                        alert("Questo livello richiede l'abbonamento VIP!");
                                    } else if (isSkinLocked) {
                                        alert("Devi equipaggiare la skin BOSS HUNTER per giocare questo livello!");
                                    }
                                }
                            }}
                            className={`group relative border rounded-2xl p-6 transition-all transform ${
                                isLocked 
                                ? 'bg-gray-900/50 border-gray-800 cursor-not-allowed grayscale opacity-70' 
                                : 'bg-gray-900 border-white/10 cursor-pointer hover:border-blue-500/50 hover:-translate-y-1 active:scale-95'
                            }`}
                        >
                            {/* Sfondo Colorato */}
                            <div 
                                className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 opacity-10 group-hover:opacity-20 transition-opacity rotate-12"
                                style={{ backgroundColor: level.color }}
                            ></div>
                            
                            {/* Overlay di Blocco Multiplo */}
                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 rounded-2xl p-4 text-center backdrop-blur-[2px]">
                                    {isVipLocked && isSkinLocked ? (
                                        <div className="flex flex-col items-center">
                                            <div className="flex gap-4 mb-2">
                                                <i className="fas fa-crown text-yellow-500 text-3xl animate-bounce"></i>
                                                <i className="fas fa-crosshairs text-emerald-400 text-3xl animate-pulse"></i>
                                            </div>
                                            <span className="text-white font-black uppercase tracking-tighter text-sm">REQUISITI DOPPI</span>
                                            <span className="text-red-500 text-[9px] font-black uppercase mt-1">VIP + BOSS HUNTER SKIN</span>
                                        </div>
                                    ) : isVipLocked ? (
                                        <>
                                            <i className="fas fa-crown text-yellow-500 text-4xl mb-2 animate-bounce"></i>
                                            <span className="text-yellow-500 font-black uppercase tracking-widest text-xs">Richiede VIP</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-crosshairs text-emerald-400 text-4xl mb-2 animate-pulse"></i>
                                            <span className="text-emerald-400 font-black uppercase tracking-tighter text-xs">EQUIPAGGIA BOSS HUNTER</span>
                                            <span className="text-white/40 text-[8px] mt-1 font-bold uppercase tracking-widest">Vai nel menu Skins</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Badge Boss */}
                            {level.isBossBattle && !isLocked && (
                                <div className="absolute top-2 right-2 bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse shadow-[0_0_10px_#a855f7]">
                                    <i className="fas fa-skull mr-1"></i> BOSS FIGHT
                                </div>
                            )}
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tighter">{level.name}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                        level.difficulty === 'Extreme' ? 'bg-red-900 text-red-200' : 
                                        level.difficulty === 'Demon' ? 'bg-purple-900 text-purple-200' :
                                        'bg-blue-900 text-blue-200'
                                    }`}>
                                        {level.difficulty}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Speed</div>
                                    <div className={`font-black text-lg ${isDarknessHardcore && stats.isVip ? 'text-emerald-400' : 'text-white'}`}>
                                        {isDarknessHardcore && stats.isVip ? '2x' : `${level.speedMultiplier}x`}
                                    </div>
                                    
                                    {isDarknessHardcore && !stats.isVip && (
                                        <div className="text-[7px] md:text-[8px] text-yellow-500 font-black animate-pulse uppercase tracking-tighter mt-1">
                                            (SOLO 2x PER I VIP)
                                        </div>
                                    )}
                                    {isDarknessHardcore && stats.isVip && (
                                        <div className="text-[7px] md:text-[8px] text-emerald-400 font-black uppercase tracking-tighter mt-1">
                                            VIP BONUS: 2x SPEED
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 w-0 group-hover:w-full transition-all duration-500"
                                    style={{ backgroundColor: level.color }}
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
