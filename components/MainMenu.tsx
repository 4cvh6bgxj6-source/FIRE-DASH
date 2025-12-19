
import React from 'react';
import { AppState, UserStats } from '../types';

interface Props {
    stats: UserStats;
    onNavigate: (view: AppState) => void;
    isChristmas?: boolean;
}

const MainMenu: React.FC<Props> = ({ stats, onNavigate, isChristmas }) => {
    const forceUpdate = () => {
        sessionStorage.clear();
        const url = new URL(window.location.href);
        url.searchParams.set('reload', Date.now().toString());
        window.location.href = url.toString();
    };

    return (
        <div className={`flex flex-col items-center justify-center h-full w-full font-['Orbitron'] p-4 overflow-hidden ${isChristmas ? 'bg-gradient-to-b from-red-950 via-black to-green-950' : 'bg-black'}`}>
            
            {/* Header Profilo */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20 flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                    <div className="text-gray-500 text-[10px] md:text-sm uppercase tracking-tighter font-bold">Bentornato,</div>
                    <div className="flex items-center gap-3">
                        <div className={`text-lg md:text-2xl font-black flex items-center gap-2 ${stats.isVip ? 'rainbow-text' : 'text-white'}`}>
                            {stats.username}
                            {stats.isVip && <i className="fas fa-certificate text-yellow-400 text-xs animate-pulse"></i>}
                        </div>
                        
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

            {/* Logo Natalizio */}
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

            {/* Grid Pulsanti */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center w-full max-w-4xl z-10">
                
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

                <div className="flex flex-col gap-4 md:gap-6 w-full md:w-auto px-4 md:px-0">
                    <div className="flex flex-row md:flex-col gap-4">
                        <button 
                            onClick={() => onNavigate(AppState.FRIENDS_LOBBY)}
                            className="flex-1 group relative flex items-center justify-center md:justify-start gap-4 bg-blue-700 hover:bg-blue-600 px-6 py-4 rounded-2xl shadow-xl transition-all border-b-4 border-blue-900"
                        >
                            <i className="fas fa-users text-xl text-white"></i>
                            <span className="font-black text-white uppercase tracking-widest text-xs md:text-sm">Amici</span>
                        </button>

                        <button 
                            onClick={() => onNavigate(AppState.GIFT_SHOP)}
                            className="flex-1 group relative flex items-center justify-center md:justify-start gap-4 bg-red-600 hover:bg-red-500 px-6 py-4 rounded-2xl shadow-xl transition-all border-b-4 border-red-900"
                        >
                            <i className="fas fa-gift text-xl text-white animate-bounce"></i>
                            <span className="font-black text-white uppercase tracking-widest text-xs md:text-sm">Regali</span>
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => onNavigate(AppState.SKINS)}
                            className="flex-1 group relative flex flex-col items-center bg-gray-900/80 p-4 rounded-2xl border border-white/5 hover:border-emerald-500 transition-all active:scale-95 backdrop-blur-md"
                        >
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg transform transition-all group-hover:rotate-12">
                                <i className="fas fa-tshirt text-white"></i>
                            </div>
                            <span className="mt-3 font-bold text-gray-400 uppercase tracking-widest text-[9px]">Skins</span>
                        </button>

                        <button 
                            onClick={() => onNavigate(AppState.SHOP)}
                            className="flex-1 group relative flex flex-col items-center bg-gray-900/80 p-4 rounded-2xl border border-white/5 hover:border-purple-500 transition-all active:scale-95 backdrop-blur-md"
                        >
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg transform transition-all group-hover:-rotate-12">
                                <i className="fas fa-shopping-cart text-white"></i>
                            </div>
                            <span className="mt-3 font-bold text-gray-400 uppercase tracking-widest text-[9px]">Shop</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Natalizio */}
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
