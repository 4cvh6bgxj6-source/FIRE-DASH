
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

    // Determina la classe CSS o lo stile inline in base al tipo di colore selezionato
    const getNameStyle = () => {
        if (stats.nameColorType === 'christmas') return { className: 'christmas-text' };
        if (stats.nameColorType === 'rainbow') return { className: 'rainbow-text' };
        if (stats.nameColorType === 'custom') return { className: '', style: { color: stats.customNameHex || '#ffffff', textShadow: `0 0 10px ${stats.customNameHex}88` } };
        return { className: 'text-white' }; // Default
    };

    const nameStyle = getNameStyle();

    return (
        <div className={`flex flex-col items-center justify-center h-full w-full font-['Orbitron'] p-4 overflow-hidden ${isChristmas ? 'bg-gradient-to-b from-red-950 via-black to-green-950' : 'bg-black'}`}>
            
            {/* Header Profilo */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20 flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                    <div className="text-gray-500 text-[10px] md:text-sm uppercase tracking-tighter font-bold">Bentornato,</div>
                    <div className="flex items-center gap-3">
                        <div className={`text-lg md:text-2xl font-black flex items-center gap-2 ${nameStyle.className}`} style={nameStyle.style}>
                            {stats.username}
                            {stats.hasChristmasName && stats.nameColorType === 'christmas' && <i className="fas fa-holly-berry text-red-500 text-xs animate-bounce"></i>}
                            {stats.isVip && stats.nameColorType === 'rainbow' && <i className="fas fa-certificate text-yellow-400 text-xs animate-pulse"></i>}
                        </div>

                        {/* Tasto Edit Colore (Visibile se ha il bundle o è VIP) */}
                        {(stats.hasChristmasName || stats.isVip) && (
                            <button 
                                onClick={() => setShowColorModal(true)}
                                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[10px] text-gray-300 border border-white/20 transition-all"
                            >
                                <i className="fas fa-palette"></i>
                            </button>
                        )}
                        
                        <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <i className="fas fa-gem text-blue-400 text-xs md:text-sm animate-pulse"></i>
                            <span className="text-white font-black text-xs md:text-sm tracking-tighter">
                                {stats.gems.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={forceUpdate}
                    className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 px-4 py-2 rounded-xl text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-2 group w-fit"
                >
                    <i className="fas fa-sync-alt group-hover:rotate-180 transition-transform duration-500"></i> Aggiorna
                </button>
            </div>

            {/* MODALE SCELTA COLORE */}
            {showColorModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-gray-900 border-2 border-white/10 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl">
                        <button 
                            onClick={() => setShowColorModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                        
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 text-center">
                            Personalizza Nome
                        </h3>

                        <div className="flex flex-col gap-3">
                            {/* Default */}
                            <button 
                                onClick={() => { onUpdateStats(s => ({...s, nameColorType: 'default'})); }}
                                className={`p-4 rounded-xl border-2 flex items-center justify-between ${stats.nameColorType === 'default' ? 'border-white bg-white/10' : 'border-white/5 bg-black/40 hover:bg-white/5'}`}
                            >
                                <span className="text-white font-bold">Bianco Classico</span>
                                {stats.nameColorType === 'default' && <i className="fas fa-check text-green-400"></i>}
                            </button>

                            {/* Rainbow (VIP) */}
                            <button 
                                onClick={() => { if(stats.isVip) onUpdateStats(s => ({...s, nameColorType: 'rainbow'})); }}
                                disabled={!stats.isVip}
                                className={`p-4 rounded-xl border-2 flex items-center justify-between group ${stats.nameColorType === 'rainbow' ? 'border-purple-500 bg-purple-900/20' : 'border-white/5 bg-black/40'} ${!stats.isVip && 'opacity-50 cursor-not-allowed'}`}
                            >
                                <span className="rainbow-text font-bold">Rainbow VIP</span>
                                <div className="flex items-center gap-2">
                                    {!stats.isVip && <i className="fas fa-lock text-[10px] text-gray-500"></i>}
                                    {stats.nameColorType === 'rainbow' && <i className="fas fa-check text-green-400"></i>}
                                </div>
                            </button>

                            {/* Christmas Gradient */}
                            <button 
                                onClick={() => { if(stats.hasChristmasName) onUpdateStats(s => ({...s, nameColorType: 'christmas'})); }}
                                disabled={!stats.hasChristmasName}
                                className={`p-4 rounded-xl border-2 flex items-center justify-between group ${stats.nameColorType === 'christmas' ? 'border-red-500 bg-red-900/20' : 'border-white/5 bg-black/40'} ${!stats.hasChristmasName && 'opacity-50 cursor-not-allowed'}`}
                            >
                                <span className="christmas-text font-bold">Christmas Special</span>
                                <div className="flex items-center gap-2">
                                    {!stats.hasChristmasName && <i className="fas fa-lock text-[10px] text-gray-500"></i>}
                                    {stats.nameColorType === 'christmas' && <i className="fas fa-check text-green-400"></i>}
                                </div>
                            </button>

                            {/* Custom Color */}
                            <div className={`p-4 rounded-xl border-2 flex flex-col gap-3 transition-all ${stats.nameColorType === 'custom' ? 'border-blue-500 bg-blue-900/10' : 'border-white/5 bg-black/40'} ${!stats.hasChristmasName && 'opacity-50 pointer-events-none'}`}>
                                <div className="flex items-center justify-between cursor-pointer" onClick={() => { if(stats.hasChristmasName) onUpdateStats(s => ({...s, nameColorType: 'custom'})); }}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold" style={{color: stats.customNameHex}}>Colore Personalizzato</span>
                                        {!stats.hasChristmasName && <span className="text-[9px] bg-red-600 text-white px-2 rounded font-black">BUNDLE</span>}
                                    </div>
                                    {stats.nameColorType === 'custom' && <i className="fas fa-check text-green-400"></i>}
                                    {!stats.hasChristmasName && <i className="fas fa-lock text-gray-500"></i>}
                                </div>
                                
                                {stats.hasChristmasName && (
                                    <div className="flex items-center gap-3 bg-black/30 p-2 rounded-lg">
                                        <input 
                                            type="color" 
                                            value={stats.customNameHex || '#ffffff'}
                                            onChange={(e) => onUpdateStats(s => ({...s, customNameHex: e.target.value, nameColorType: 'custom'}))}
                                            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                                        />
                                        <div className="text-[10px] text-gray-400 font-mono">{stats.customNameHex}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logo */}
            <div className="mb-12 text-center z-10 scale-75 md:scale-100">
                <h1 className="text-5xl md:text-7xl font-black italic text-white pixel-font mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    FIRE DASH
                </h1>
                {isChristmas && (
                    <div className="flex items-center justify-center gap-4 text-red-500 animate-pulse font-black uppercase text-xs tracking-widest">
                        <i className="fas fa-holly-berry"></i>
                        XMAS EDITION
                        <i className="fas fa-holly-berry"></i>
                    </div>
                )}
            </div>

            {/* Grid Pulsanti Centrale */}
            <div className="flex flex-col gap-8 items-center justify-center w-full max-w-xl z-10">
                
                <button 
                    onClick={() => onNavigate(AppState.LEVEL_SELECT)}
                    className="group relative flex flex-col items-center touch-manipulation"
                >
                    <div className={`w-32 h-32 md:w-48 md:h-48 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-5xl md:text-7xl shadow-2xl transform transition-all duration-300 group-hover:scale-105 group-active:scale-90 border-4 border-white/20 ${isChristmas ? 'bg-red-600 shadow-red-500/40 group-hover:bg-red-500' : 'bg-blue-600 shadow-blue-500/40 group-hover:bg-blue-500'}`}>
                        <i className="fas fa-play text-white ml-2 drop-shadow-lg"></i>
                    </div>
                    <div className="mt-6 flex flex-col items-center">
                        <span className="font-black text-white uppercase tracking-[0.3em] text-lg md:text-2xl drop-shadow-md">Gioca</span>
                        <div className={`h-1 w-8 mt-1 rounded-full group-hover:w-16 transition-all ${isChristmas ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    </div>
                </button>

                <div className="grid grid-cols-3 gap-4 w-full">
                    {/* Pulsante Evento Natale */}
                    {isChristmas && (
                        <button 
                            onClick={() => onNavigate(AppState.CHRISTMAS_EVENT)}
                            className="col-span-3 group relative flex items-center justify-center gap-4 bg-gradient-to-r from-green-800 to-red-800 p-4 rounded-2xl border-2 border-yellow-400/30 shadow-lg shadow-red-900/40 transition-all active:scale-95 animate-[pulse_3s_infinite]"
                        >
                            <i className="fas fa-tree text-2xl text-green-400"></i>
                            <div className="flex flex-col items-center">
                                <span className="font-black text-white uppercase tracking-widest text-sm">EVENTO NATALE</span>
                                <span className="text-[9px] text-yellow-400 font-bold bg-black/40 px-2 rounded-full">NUOVE SKIN</span>
                            </div>
                            <i className="fas fa-gift text-2xl text-red-400"></i>
                        </button>
                    )}

                    <button 
                        onClick={() => onNavigate(AppState.GIFT_SHOP)}
                        className="group relative flex flex-col items-center bg-red-600/90 hover:bg-red-500 p-4 rounded-2xl border border-white/10 shadow-xl transition-all active:scale-95"
                    >
                        <i className="fas fa-gift text-2xl text-white mb-2 animate-bounce"></i>
                        <span className="font-black text-white uppercase tracking-widest text-[10px]">Regali</span>
                    </button>

                    <button 
                        onClick={() => onNavigate(AppState.SKINS)}
                        className="group relative flex flex-col items-center bg-gray-900/80 p-4 rounded-2xl border border-white/5 hover:border-emerald-500 transition-all active:scale-95 backdrop-blur-md"
                    >
                        <i className="fas fa-tshirt text-2xl text-emerald-500 mb-2"></i>
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Skins</span>
                    </button>

                    <button 
                        onClick={() => onNavigate(AppState.SHOP)}
                        className="group relative flex flex-col items-center bg-gray-900/80 p-4 rounded-2xl border border-white/5 hover:border-purple-500 transition-all active:scale-95 backdrop-blur-md"
                    >
                        <i className="fas fa-shopping-cart text-2xl text-purple-500 mb-2"></i>
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Shop</span>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 md:mt-24 max-w-lg text-center px-4 z-10">
                <p className="text-gray-400 text-xs italic font-bold uppercase tracking-widest bg-white/5 px-6 py-3 rounded-full border border-white/10">
                    <i className="fas fa-snowflake mr-2 text-blue-400"></i>
                    PROJECT BY <span className="text-orange-500">FIRE DEV TEAM</span>
                    <i className="fas fa-snowflake ml-2 text-blue-400"></i>
                </p>
            </div>
        </div>
    );
};

export default MainMenu;
