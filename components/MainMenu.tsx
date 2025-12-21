
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
            
            {/* Top Bar - Profilo e Shop */}
            <div className="w-full flex justify-between items-start z-30 pointer-events-none p-3 pt-[calc(env(safe-area-inset-top)+8px)] px-[calc(env(safe-area-inset-left)+12px)]">
                <div className="pointer-events-auto bg-black/60 backdrop-blur-md p-1.5 md:p-2 rounded-xl border border-white/10 shadow-2xl flex flex-col">
                    <div className="flex items-center gap-2">
                        <div className={`text-[9px] md:text-lg font-black uppercase italic truncate max-w-[80px] md:max-w-none ${nameStyle.className}`} style={nameStyle.style}>
                            {stats.username}
                        </div>
                        {(stats.hasChristmasName || stats.isVip) && (
                            <button onClick={() => setShowColorModal(true)} className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[7px] border border-white/20 active:scale-90">
                                <i className="fas fa-palette"></i>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                        <i className="fas fa-gem text-blue-400 text-[8px] md:text-xs"></i>
                        <span className="text-white font-black text-[9px] md:text-sm">{stats.gems.toLocaleString()}</span>
                    </div>
                </div>

                <button 
                    onClick={() => onNavigate(AppState.SHOP)}
                    className="pointer-events-auto bg-yellow-500 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[8px] md:text-xs uppercase shadow-lg shadow-yellow-500/30 active:scale-90 transition-transform flex items-center gap-1 border-b-2 border-yellow-800 pr-[env(safe-area-inset-right)]"
                >
                    <i className="fas fa-crown"></i> <span className="landscape-hide">SHOP</span> VIP
                </button>
            </div>

            {/* Contenuto Centrale Dinamico */}
            <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 px-4 landscape-compact-ui">
                {/* Logo - Diventa piccolo in orizzontale */}
                <div className="text-center landscape-logo-shrink">
                    <h1 className="text-4xl md:text-8xl font-black italic text-white pixel-font drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] leading-none">
                        FIRE DASH
                    </h1>
                    <p className="text-orange-500 font-bold tracking-[0.4em] text-[7px] md:text-base uppercase mt-1 landscape-hide">ULTIMATE</p>
                </div>

                {/* Play Button - Centrale */}
                <div className="flex flex-col items-center gap-2 md:gap-4 landscape-btn-shrink">
                    <button 
                        onClick={() => onNavigate(AppState.LEVEL_SELECT)}
                        className="w-24 h-24 md:w-56 md:h-56 bg-blue-600 rounded-[2rem] md:rounded-[4rem] flex items-center justify-center text-3xl md:text-8xl text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] border-4 border-white/20 active:scale-95 transition-all hover:bg-blue-500"
                    >
                        <i className="fas fa-play ml-1 md:ml-2"></i>
                    </button>
                    <div className="text-white font-black uppercase tracking-[0.3em] text-[9px] md:text-xl landscape-hide">Inizia</div>
                </div>
            </div>

            {/* Navigazione Inferiore */}
            <div className="w-full flex justify-center items-center z-30 pb-[calc(env(safe-area-inset-bottom)+8px)] p-2">
                <div className="flex gap-2 md:gap-4 bg-black/50 backdrop-blur-2xl p-1.5 rounded-2xl md:rounded-3xl border border-white/10 landscape-nav-mini">
                    <button onClick={() => onNavigate(AppState.SKINS)} className="flex flex-col items-center justify-center w-12 h-10 md:w-24 md:h-20 bg-gray-900/80 rounded-xl md:rounded-2xl active:scale-95 transition-all">
                        <i className="fas fa-tshirt text-emerald-400 text-sm md:text-2xl mb-1"></i>
                        <span className="text-[6px] md:text-[9px] font-bold text-gray-500 uppercase landscape-hide">Skins</span>
                    </button>
                    <button onClick={() => onNavigate(AppState.GIFT_SHOP)} className="flex flex-col items-center justify-center w-12 h-10 md:w-24 md:h-20 bg-gray-900/80 rounded-xl md:rounded-2xl active:scale-95 transition-all">
                        <i className="fas fa-gift text-red-500 text-sm md:text-2xl mb-1"></i>
                        <span className="text-[6px] md:text-[9px] font-bold text-gray-500 uppercase landscape-hide">Doni</span>
                    </button>
                    {isChristmas && (
                        <button onClick={() => onNavigate(AppState.CHRISTMAS_EVENT)} className="flex flex-col items-center justify-center w-12 h-10 md:w-24 md:h-20 bg-gradient-to-br from-red-600 to-green-700 rounded-xl md:rounded-2xl active:scale-95 transition-all">
                            <i className="fas fa-snowflake text-white text-sm md:text-2xl mb-1"></i>
                            <span className="text-[6px] md:text-[9px] font-bold text-white uppercase landscape-hide">Evento</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Modal Colore Nome */}
            {showColorModal && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md" onClick={() => setShowColorModal(false)}>
                    <div className="bg-gray-900 border border-white/10 p-6 rounded-[2rem] w-full max-w-xs text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-black uppercase mb-4 italic text-xs">Scegli Colore</h3>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => {onUpdateStats(s => ({...s, nameColorType: 'default'})); setShowColorModal(false);}} className="p-3 bg-white/5 rounded-xl text-white font-bold uppercase text-[9px]">Bianco</button>
                            {stats.isVip && <button onClick={() => {onUpdateStats(s => ({...s, nameColorType: 'rainbow'})); setShowColorModal(false);}} className="p-3 bg-white/5 rounded-xl rainbow-text font-black uppercase text-[9px]">Rainbow VIP</button>}
                            {stats.hasChristmasName && <button onClick={() => {onUpdateStats(s => ({...s, nameColorType: 'christmas'})); setShowColorModal(false);}} className="p-3 bg-red-900/40 rounded-xl text-red-200 font-bold uppercase text-[9px]">Christmas</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainMenu;
