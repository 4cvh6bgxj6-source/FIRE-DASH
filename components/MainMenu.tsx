
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

    const getNameStyle = () => {
        if (stats.nameColorType === 'christmas') return { className: 'christmas-text' };
        if (stats.nameColorType === 'rainbow') return { className: 'rainbow-text' };
        if (stats.nameColorType === 'custom') return { className: '', style: { color: stats.customNameHex || '#ffffff' } };
        return { className: 'text-white' };
    };

    const nameStyle = getNameStyle();

    return (
        <div className={`relative h-full w-full flex flex-col items-center justify-between overflow-hidden ${isChristmas ? 'bg-gradient-to-b from-red-950 via-black to-green-950' : 'bg-black'}`}>
            
            {/* Profilo Utente - Angolo Superiore Sinistro con Safe Area */}
            <div className="absolute top-0 left-0 p-3 md:p-6 z-30 pointer-events-none pt-[calc(env(safe-area-inset-top)+8px)] pl-[calc(env(safe-area-inset-left)+12px)]">
                <div className="pointer-events-auto bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="text-[7px] md:text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">PLAYER</div>
                    <div className="flex items-center gap-2">
                        <div className={`text-[10px] md:text-xl font-black uppercase italic ${nameStyle.className}`} style={nameStyle.style}>
                            {stats.username}
                        </div>
                        {(stats.hasChristmasName || stats.isVip) && (
                            <button onClick={() => setShowColorModal(true)} className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] md:text-[10px] border border-white/20 active:scale-90 transition-transform">
                                <i className="fas fa-palette"></i>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 bg-blue-900/40 px-2 py-0.5 rounded-lg border border-blue-500/20">
                        <i className="fas fa-gem text-blue-400 text-[8px] md:text-xs"></i>
                        <span className="text-white font-black text-[9px] md:text-sm">{stats.gems.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Shop/VIP - Angolo Superiore Destro */}
            <div className="absolute top-0 right-0 p-3 md:p-6 z-30 pointer-events-none pt-[calc(env(safe-area-inset-top)+8px)] pr-[calc(env(safe-area-inset-right)+12px)]">
                <button 
                    onClick={() => onNavigate(AppState.SHOP)}
                    className="pointer-events-auto bg-yellow-500 text-black px-4 py-2 rounded-xl font-black text-[9px] md:text-xs uppercase shadow-lg shadow-yellow-500/30 active:scale-90 transition-transform flex items-center gap-2 border-b-2 border-yellow-800"
                >
                    <i className="fas fa-crown"></i> <span className="landscape-hide">SHOP</span> VIP
                </button>
            </div>

            {/* Titolo Centrale - Adattivo */}
            <div className="z-10 text-center mt-20 md:mt-32 px-4">
                <h1 className="text-4xl md:text-7xl lg:text-9xl font-black italic text-white pixel-font drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] leading-none">
                    FIRE DASH
                </h1>
                <p className="text-orange-500 font-bold tracking-[0.4em] text-[8px] md:text-base uppercase mt-2 landscape-hide">ULTIMATE EDITION</p>
            </div>

            {/* Bottone Play Gigante - Si ridimensiona drasticamente in orizzontale mobile */}
            <div className="z-10 flex flex-col items-center gap-4 mb-8">
                <button 
                    onClick={() => onNavigate(AppState.LEVEL_SELECT)}
                    className="w-24 h-24 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-blue-600 rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] flex items-center justify-center text-4xl md:text-7xl lg:text-9xl text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] border-4 border-white/20 active:scale-90 transition-all hover:bg-blue-500"
                >
                    <i className="fas fa-play ml-2"></i>
                </button>
                <div className="text-white font-black uppercase tracking-[0.4em] text-[9px] md:text-2xl drop-shadow-md">Inizia</div>
            </div>

            {/* Navigazione Inferiore - Compatta e fluida */}
            <div className="w-full p-4 flex justify-center items-center z-30 pb-[calc(env(safe-area-inset-bottom)+12px)]">
                <div className="flex gap-2 md:gap-4 bg-black/50 backdrop-blur-2xl p-2 rounded-3xl border border-white/10 shadow-2xl">
                    <button onClick={() => onNavigate(AppState.SKINS)} className="flex flex-col items-center justify-center w-14 h-12 md:w-24 md:h-20 bg-gray-900/80 rounded-2xl active:scale-95 transition-all">
                        <i className="fas fa-tshirt text-emerald-400 text-sm md:text-2xl mb-1"></i>
                        <span className="text-[7px] md:text-[10px] font-bold text-gray-500 uppercase landscape-hide">Skins</span>
                    </button>
                    <button onClick={() => onNavigate(AppState.GIFT_SHOP)} className="flex flex-col items-center justify-center w-14 h-12 md:w-24 md:h-20 bg-gray-900/80 rounded-2xl active:scale-95 transition-all">
                        <i className="fas fa-gift text-red-500 text-sm md:text-2xl mb-1"></i>
                        <span className="text-[7px] md:text-[10px] font-bold text-gray-500 uppercase landscape-hide">Doni</span>
                    </button>
                    {isChristmas && (
                        <button onClick={() => onNavigate(AppState.CHRISTMAS_EVENT)} className="flex flex-col items-center justify-center w-14 h-12 md:w-24 md:h-20 bg-gradient-to-br from-red-600 to-green-700 rounded-2xl active:scale-95 transition-all">
                            <i className="fas fa-snowflake text-white text-sm md:text-2xl mb-1"></i>
                            <span className="text-[7px] md:text-[10px] font-bold text-white uppercase landscape-hide">Evento</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Modale Colore Nome (Semplice e Full-Screen Overlay) */}
            {showColorModal && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md" onClick={() => setShowColorModal(false)}>
                    <div className="bg-gray-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-xs text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-black uppercase mb-6 italic text-sm md:text-lg">Scegli Colore</h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => {onUpdateStats(s => ({...s, nameColorType: 'default'})); setShowColorModal(false);}} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold uppercase text-[10px] md:text-xs">Bianco Classico</button>
                            {stats.isVip && <button onClick={() => {onUpdateStats(s => ({...s, nameColorType: 'rainbow'})); setShowColorModal(false);}} className="p-4 bg-white/5 border border-white/10 rounded-2xl rainbow-text font-black uppercase text-[10px] md:text-xs">Rainbow VIP</button>}
                            {stats.hasChristmasName && <button onClick={() => {onUpdateStats(s => ({...s, nameColorType: 'christmas'})); setShowColorModal(false);}} className="p-4 bg-red-900/40 border border-red-500/30 rounded-2xl text-red-200 font-bold uppercase text-[10px] md:text-xs">Christmas Special</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainMenu;
