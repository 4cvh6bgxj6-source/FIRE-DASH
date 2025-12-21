
import React, { useState } from 'react';
import { AppState, UserStats } from '../types';

interface Props {
    stats: UserStats;
    onNavigate: (view: AppState) => void;
    isChristmas?: boolean;
    onUpdateStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

const MainMenu: React.FC<Props> = ({ stats, onNavigate, isChristmas, onUpdateStats }) => {
    const [showColorModal, setShowColorModal] = useState(false);

    const forceUpdate = () => {
        sessionStorage.clear();
        const url = new URL(window.location.href);
        url.searchParams.set('reload', Date.now().toString());
        window.location.href = url.toString();
    };

    const getNameStyle = () => {
        if (stats.nameColorType === 'christmas') return { className: 'christmas-text' };
        if (stats.nameColorType === 'rainbow') return { className: 'rainbow-text' };
        if (stats.nameColorType === 'custom') return { className: '', style: { color: stats.customNameHex || '#ffffff', textShadow: `0 0 10px ${stats.customNameHex}88` } };
        return { className: 'text-white' };
    };

    const nameStyle = getNameStyle();

    return (
        <div className={`flex flex-col items-center justify-between h-full w-full font-['Orbitron'] p-4 md:p-8 overflow-hidden relative ${isChristmas ? 'bg-gradient-to-b from-red-950 via-black to-green-950' : 'bg-black'}`}>
            
            {/* Header Profilo Compattato per Mobile */}
            <div className="w-full pt-safe pl-safe pr-safe z-20 flex justify-between items-center px-2 py-2">
                <div className="flex flex-col gap-0.5">
                    <div className="text-gray-500 text-[7px] md:text-[10px] uppercase tracking-tighter font-bold">UTENTE</div>
                    <div className="flex items-center gap-1.5">
                        <div className={`text-xs md:text-xl font-black flex items-center gap-1 ${nameStyle.className}`} style={nameStyle.style}>
                            {stats.username}
                            {stats.hasChristmasName && stats.nameColorType === 'christmas' && <i className="fas fa-holly-berry text-red-500 text-[7px]"></i>}
                        </div>
                        {(stats.hasChristmasName || stats.isVip) && (
                            <button onClick={() => setShowColorModal(true)} className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[7px] text-gray-300 border border-white/20">
                                <i className="fas fa-palette"></i>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-blue-900/40 border border-blue-500/30 px-2 py-0.5 rounded-full">
                        <i className="fas fa-gem text-blue-400 text-[8px] md:text-xs"></i>
                        <span className="text-white font-black text-[10px] md:text-sm">{stats.gems.toLocaleString()}</span>
                    </div>
                    <button onClick={forceUpdate} className="bg-white/5 p-1.5 rounded-lg text-[10px] text-gray-400 border border-white/5 active:scale-90">
                        <i className="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>

            {/* Logo Centrale Ridimensionato */}
            <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
                <div className="mb-4 md:mb-10">
                    <h1 className="text-4xl md:text-8xl font-black italic text-white pixel-font mb-1 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] tracking-tighter">
                        FIRE DASH
                    </h1>
                    {isChristmas && (
                        <div className="text-red-500 animate-pulse font-black uppercase text-[8px] md:text-xs tracking-[0.3em]">
                            XMAS EDITION
                        </div>
                    )}
                </div>

                {/* Pulsante Play Gigante ma Responsivo */}
                <button 
                    onClick={() => onNavigate(AppState.LEVEL_SELECT)}
                    className="group relative flex flex-col items-center touch-manipulation mb-6 md:mb-12"
                >
                    <div className={`w-24 h-24 md:w-48 md:h-48 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-3xl md:text-7xl shadow-2xl transform transition-all active:scale-90 border-4 border-white/20 ${isChristmas ? 'bg-red-600 shadow-red-500/40' : 'bg-blue-600 shadow-blue-500/40'}`}>
                        <i className="fas fa-play text-white ml-1"></i>
                    </div>
                    <span className="mt-2 font-black text-white uppercase tracking-[0.3em] text-[10px] md:text-2xl">AVVIA</span>
                </button>

                {/* Grid Sottomenu Compatta */}
                <div className="grid grid-cols-3 gap-2 w-full max-w-sm px-2">
                    {isChristmas && (
                        <button 
                            onClick={() => onNavigate(AppState.CHRISTMAS_EVENT)}
                            className="col-span-3 group flex items-center justify-center gap-2 bg-gradient-to-r from-green-800 to-red-800 p-2.5 rounded-xl border border-yellow-400/30 active:scale-95"
                        >
                            <i className="fas fa-tree text-green-400 text-xs"></i>
                            <span className="font-black text-white uppercase text-[9px]">EVENTO NATALE</span>
                            <i className="fas fa-gift text-red-400 text-xs"></i>
                        </button>
                    )}

                    <button onClick={() => onNavigate(AppState.GIFT_SHOP)} className="bg-red-600/90 p-2.5 rounded-xl border border-white/10 flex flex-col items-center active:scale-95">
                        <i className="fas fa-gift text-white text-xs mb-1"></i>
                        <span className="font-black text-white uppercase text-[7px]">REGALI</span>
                    </button>

                    <button onClick={() => onNavigate(AppState.SKINS)} className="bg-gray-900/80 p-2.5 rounded-xl border border-white/5 flex flex-col items-center active:scale-95">
                        <i className="fas fa-tshirt text-emerald-500 text-xs mb-1"></i>
                        <span className="font-bold text-gray-400 uppercase text-[7px]">SKINS</span>
                    </button>

                    <button onClick={() => onNavigate(AppState.SHOP)} className="bg-gray-900/80 p-2.5 rounded-xl border border-white/5 flex flex-col items-center active:scale-95">
                        <i className="fas fa-shopping-cart text-purple-500 text-xs mb-1"></i>
                        <span className="font-bold text-gray-400 uppercase text-[7px]">SHOP</span>
                    </button>
                </div>
            </div>

            {/* Footer per Safe Area Bottom */}
            <div className="pb-safe pt-4 z-10 w-full flex justify-center">
                <p className="text-gray-500 text-[7px] italic font-bold uppercase tracking-[0.3em] px-4 py-1 rounded-full bg-white/5 border border-white/5">
                    POWERED BY <span className="text-orange-500">FIRE DEV</span>
                </p>
            </div>

            {/* Modal Colore Nome (Invariato) */}
            {showColorModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-gray-900 border-2 border-white/10 rounded-3xl p-6 w-full max-w-xs shadow-2xl">
                        <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 text-center italic">Personalizza Nome</h3>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => { onUpdateStats(s => ({...s, nameColorType: 'default'})); setShowColorModal(false); }} className={`p-3 rounded-xl border-2 flex items-center justify-between text-xs font-bold ${stats.nameColorType === 'default' ? 'border-white bg-white/10' : 'border-white/5'}`}>
                                <span className="text-white">Bianco Classico</span>
                                {stats.nameColorType === 'default' && <i className="fas fa-check text-green-400"></i>}
                            </button>
                            {stats.isVip && (
                                <button onClick={() => { onUpdateStats(s => ({...s, nameColorType: 'rainbow'})); setShowColorModal(false); }} className={`p-3 rounded-xl border-2 flex items-center justify-between text-xs font-bold ${stats.nameColorType === 'rainbow' ? 'border-purple-500 bg-purple-900/20' : 'border-white/5'}`}>
                                    <span className="rainbow-text">Rainbow VIP</span>
                                    {stats.nameColorType === 'rainbow' && <i className="fas fa-check text-green-400"></i>}
                                </button>
                            )}
                            {stats.hasChristmasName && (
                                <button onClick={() => { onUpdateStats(s => ({...s, nameColorType: 'christmas'})); setShowColorModal(false); }} className={`p-3 rounded-xl border-2 flex items-center justify-between text-xs font-bold ${stats.nameColorType === 'christmas' ? 'border-red-500 bg-red-900/20' : 'border-white/5'}`}>
                                    <span className="christmas-text">Xmas Special</span>
                                    {stats.nameColorType === 'christmas' && <i className="fas fa-check text-green-400"></i>}
                                </button>
                            )}
                            <button onClick={() => setShowColorModal(false)} className="mt-4 text-gray-500 uppercase font-black text-[9px] hover:text-white transition-colors">CHIUDI</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainMenu;
