
import React from 'react';
import { Skin } from '../types';

interface Props {
    skins: Skin[];
    unlockedSkins: string[];
    gems: number;
    onUnlock: (skin: Skin, cost: number) => void;
    onUnlockBundle: (skins: Skin[], cost: number) => void;
    onBack: () => void;
}

const ChristmasEvent: React.FC<Props> = ({ skins, unlockedSkins, gems, onUnlock, onUnlockBundle, onBack }) => {
    // Filtra solo le skin evento
    const eventSkins = skins.filter(s => s.isEvent);
    
    // Calcola quante skin evento mancano
    const missingSkins = eventSkins.filter(s => !unlockedSkins.includes(s.id));
    const allUnlocked = missingSkins.length === 0;

    const BUNDLE_COST = 15000;

    return (
        <div className="flex flex-col items-center h-full w-full bg-gradient-to-b from-green-950 via-red-950 to-black p-4 md:p-8 overflow-y-auto relative pb-32">
            <div className="snow-container pointer-events-none z-0"></div>

            {/* Header */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-8 sticky top-0 bg-black/80 backdrop-blur-xl py-6 z-[60] border-b border-white/10 rounded-b-[2rem] px-6">
                <button onClick={onBack} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-white font-bold transition-all text-xs border border-white/5">
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-2xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 uppercase tracking-tighter drop-shadow-md">
                        NATALE EVENTO
                    </h2>
                    <div className="text-red-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-2 animate-pulse bg-black/40 px-3 py-1 rounded-full border border-red-500/30 inline-block">
                        <i className="fas fa-clock mr-2"></i> Termina il 1° Gennaio
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-900/80 px-5 py-3 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
                    <i className="fas fa-gem text-blue-400 text-sm"></i>
                    <span className="text-white font-black text-sm md:text-lg">{gems}</span>
                </div>
            </div>

            {/* Sezione Skins Singole */}
            <h3 className="text-white text-xl font-black uppercase tracking-[0.2em] mb-6 z-10 flex items-center gap-2">
                <i className="fas fa-snowflake text-blue-300 animate-spin-slow"></i> Collezione Invernale
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 w-full max-w-5xl z-10 mb-16">
                {eventSkins.map((skin) => {
                    const isUnlocked = unlockedSkins.includes(skin.id);
                    return (
                        <div key={skin.id} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col items-center relative overflow-hidden group hover:bg-white/10 transition-colors">
                            {/* Badge VOLA per Rudolph */}
                            {skin.canFly && (
                                <div className="absolute top-2 right-2 bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase z-10 animate-pulse shadow-lg shadow-blue-500/50">
                                    <i className="fas fa-wind mr-1"></i> VOLA!
                                </div>
                            )}
                            {/* Badge SPARA per Santa */}
                            {skin.canShoot && (
                                <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase z-10 animate-pulse shadow-lg shadow-red-500/50 border border-white/20">
                                    <i className="fas fa-bomb mr-1"></i> ATK
                                </div>
                            )}

                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg transition-transform group-hover:scale-110" style={{backgroundColor: skin.color}}>
                                <i className={`fas ${skin.icon} text-white`}></i>
                            </div>
                            <h4 className="text-white font-bold text-[10px] uppercase text-center mb-2">{skin.name}</h4>
                            
                            {isUnlocked ? (
                                <div className="bg-green-500/20 text-green-400 text-[10px] font-black px-4 py-2 rounded-full uppercase border border-green-500/50">Posseduto</div>
                            ) : (
                                <button 
                                    onClick={() => onUnlock(skin, skin.cost)}
                                    disabled={gems < skin.cost}
                                    className={`w-full py-2 rounded-xl text-[10px] font-black uppercase flex flex-col items-center ${gems >= skin.cost ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                >
                                    <span>{skin.cost} Gemme</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* BUNDLE NATALE */}
            <div className="w-full max-w-3xl relative z-10 mt-4 animate-in slide-in-from-bottom duration-700">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-[3rem] blur opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-b from-gray-900 to-black p-8 md:p-12 rounded-[3rem] border-2 border-yellow-500/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                    
                    {/* Grafica Bundle */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase mb-4 inline-block shadow-lg border border-red-400 animate-bounce">
                            Offerta Limitata
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-2 leading-none">
                            BUNDLE <br/> <span className="text-yellow-400">NATALE</span>
                        </h2>
                        
                        {/* Descrizione con specifica del volo e NOME */}
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 leading-relaxed">
                            <p className="mb-2">Sblocca tutte le {eventSkins.length} Skin esclusive istantaneamente!</p>
                            
                            <div className="flex flex-col gap-2 mt-4 text-left">
                                <p className="text-red-300 flex items-center justify-center md:justify-start gap-2 bg-red-900/30 p-2 rounded-lg border border-red-500/30">
                                    <i className="fas fa-gift text-lg animate-bounce"></i>
                                    <span>
                                        <span className="text-white font-black">SANTA CLAUS:</span> LANCIA REGALI PER <span className="text-yellow-400 underline decoration-red-500">DISTRUGGERE GLI OSTACOLI!</span>
                                    </span>
                                </p>
                                <p className="text-blue-300 flex items-center justify-center md:justify-start gap-2 bg-blue-900/30 p-2 rounded-lg border border-blue-500/30">
                                    <i className="fas fa-wind"></i>
                                    RUDOLPH PUÒ VOLARE
                                </p>
                                <p className="text-green-300 flex items-center justify-center md:justify-start gap-2 bg-green-900/30 p-2 rounded-lg border border-green-500/30 animate-pulse">
                                    <i className="fas fa-palette"></i>
                                    BONUS: COLORE NOME NATALIZIO
                                </p>
                            </div>
                        </div>

                        <div className="flex -space-x-4">
                            {eventSkins.map((s) => (
                                <div key={s.id} className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-xs shadow-lg relative group" style={{backgroundColor: s.color}}>
                                    <i className={`fas ${s.icon} text-white`}></i>
                                    {s.canFly && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-black animate-ping"></div>}
                                    {s.canShoot && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-black animate-ping"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottone Acquisto */}
                    <div className="w-full md:w-auto flex flex-col gap-3 min-w-[200px]">
                        {allUnlocked ? (
                            <div className="bg-green-600/20 border-2 border-green-500 text-green-400 font-black py-6 rounded-3xl text-center uppercase tracking-widest text-lg shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                <i className="fas fa-check-circle mr-2"></i> COMPLETATO
                            </div>
                        ) : (
                            <button 
                                onClick={() => onUnlockBundle(eventSkins, BUNDLE_COST)}
                                disabled={gems < BUNDLE_COST}
                                className={`group relative py-6 px-8 rounded-3xl font-black uppercase tracking-widest text-xl transition-all transform active:scale-95 shadow-2xl flex flex-col items-center justify-center border-b-4 ${
                                    gems >= BUNDLE_COST 
                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black border-yellow-800 hover:brightness-110' 
                                    : 'bg-gray-800 text-gray-500 border-gray-900 cursor-not-allowed'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span>{BUNDLE_COST.toLocaleString()}</span>
                                    <i className="fas fa-gem text-base"></i>
                                </div>
                                <span className="text-[10px] opacity-70 mt-1">Acquista Bundle</span>
                                
                                {gems >= BUNDLE_COST && (
                                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                                        <div className="absolute top-0 left-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
                                    </div>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-gray-500 text-[9px] uppercase font-bold mt-12 z-10 text-center">
                * Le skin evento rimarranno tue per sempre anche dopo la fine dell'evento.
            </p>
        </div>
    );
};

export default ChristmasEvent;
