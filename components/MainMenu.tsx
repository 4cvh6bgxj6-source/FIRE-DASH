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
        <div className={`flex flex-col items-center justify-between h-full w-full font-['Orbitron'] p-4 overflow-y-auto ${isChristmas ? 'bg-gradient-to-b from-red-950 via-black to-green-950' : 'bg-black'}`}>
            
            {/* Header Profilo & Gemme */}
            <div className="w-full flex justify-between items-start pt-2 px-2 z-20">
                <div className="flex flex-col gap-1">
                    <div className="text-gray-500 text-[10px] uppercase font-bold">Player</div>
                    <div className={`text-xl md:text-3xl font-black flex items-center gap-2 ${nameStyle.className}`} style={nameStyle.style}>
                        {stats.username}
                        {stats.isVip && <i className="fas fa-crown text-yellow-500 text-sm"></i>}
                        {(stats.hasChristmasName || stats.isVip) && (
                            <button onClick={() => setShowColorModal(true)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-300 ml-2">
                                <i className="fas fa-palette"></i>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 bg-blue-900/40 border border-blue-500/30 px-4 py-2 rounded-full w-fit mt-1">
                        <i className="fas fa-gem text-blue-400 text-sm md:text-base animate-pulse"></i>
                        <span className="text-white font-black text-sm md:text-lg">{stats.gems.toLocaleString()}</span>
                    </div>
                </div>
                
                <button onClick={forceUpdate} className="bg-gray-800/50 p-3 rounded-xl text-gray-400 hover:text-white">
                    <i className="fas fa-sync-alt"></i>
                </button>
            </div>

            {/* Logo */}
            <div className="text-center z-10 mt-4 md:mt-0">
                <h1 className="text-6xl md:text-9xl font-black italic text-white pixel-font drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                    FIRE DASH
                </h1>
                <p className="text-orange-500 font-bold tracking-[0.5em] text-[10px] md:text-lg uppercase">ULTIMATE</p>
            </div>

            {/* Pulsanti Principali Ingranditi */}
            <div className="flex flex-col gap-6 items-center justify-center w-full max-w-lg z-10 mb-8">
                
                <button 
                    onClick={() => onNavigate(AppState.LEVEL_SELECT)}
                    className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-500 rounded-[2rem] p-6 shadow-[0_0_40px_rgba(37,99,235,0.4)] border-4 border-blue-400/30 transition-all active:scale-95 group"
                >
                    <div className="flex flex-col items-start">
                        <span className="text-white font-black text-3xl md:text-5xl italic uppercase">GIOCA</span>
                        <span className="text-blue-200 text-xs md:text-sm font-bold tracking-widest">SELEZIONA LIVELLO</span>
                    </div>
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-black/20 rounded-full flex items-center justify-center text-3xl md:text-4xl text-white group-hover:scale-110 transition-transform">
                        <i className="fas fa-play ml-1"></i>
                    </div>
                </button>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <button 
                        onClick={() => onNavigate(AppState.SKINS)}
                        className="bg-gray-900/80 hover:bg-gray-800 p-6 rounded-[2rem] border-2 border-white/10 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all min-h-[140px]"
                    >
                        <i className="fas fa-tshirt text-3xl md:text-4xl text-emerald-400 mb-1"></i>
                        <span className="text-white font-black text-sm md:text-lg uppercase">SKINS</span>
                    </button>

                    <button 
                        onClick={() => onNavigate(AppState.SHOP)}
                        className="bg-gray-900/80 hover:bg-gray-800 p-6 rounded-[2rem] border-2 border-white/10 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all min-h-[140px]"
                    >
                        <i className="fas fa-shopping-cart text-3xl md:text-4xl text-purple-400 mb-1"></i>
                        <span className="text-white font-black text-sm md:text-lg uppercase">SHOP VIP</span>
                    </button>
                    
                    {isChristmas && (
                        <button 
                            onClick={() => onNavigate(AppState.CHRISTMAS_EVENT)}
                            className="col-span-2 bg-gradient-to-r from-red-900 to-green-900 p-5 rounded-[2rem] border-2 border-yellow-400/30 flex items-center justify-center gap-4 active:scale-95 transition-all shadow-lg animate-pulse"
                        >
                            <i className="fas fa-gift text-2xl text-yellow-400"></i>
                            <span className="text-white font-black text-sm md:text-xl uppercase tracking-widest">EVENTO NATALE</span>
                            <i className="fas fa-tree text-2xl text-green-400"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="pb-6 z-10">
                <p className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.3em]">Fire Dev Team</p>
            </div>

            {/* ... Color Modal Code (omitted for brevity, assume unchanged logic) ... */}
            {showColorModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                     <div className="bg-gray-900 border-2 border-white/20 rounded-3xl p-6 w-full max-w-sm relative">
                        <button onClick={() => setShowColorModal(false)} className="absolute top-4 right-4 text-white text-xl"><i className="fas fa-times"></i></button>
                        <h3 className="text-xl font-black text-white uppercase mb-6 text-center">Colore Nome</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={() => onUpdateStats(s => ({...s, nameColorType: 'default'}))} className="p-4 bg-white/10 rounded-xl text-white font-bold border border-white/20">Bianco (Default)</button>
                            <button onClick={() => stats.isVip && onUpdateStats(s => ({...s, nameColorType: 'rainbow'}))} disabled={!stats.isVip} className={`p-4 rounded-xl font-bold border ${stats.isVip ? 'bg-purple-900/30 border-purple-500 rainbow-text' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>Rainbow (VIP)</button>
                            <button onClick={() => stats.hasChristmasName && onUpdateStats(s => ({...s, nameColorType: 'christmas'}))} disabled={!stats.hasChristmasName} className={`p-4 rounded-xl font-bold border ${stats.hasChristmasName ? 'bg-red-900/30 border-red-500 christmas-text' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>Natale (Bundle)</button>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default MainMenu;