import React from 'react';
import { AppState, UserStats } from '../types';

interface Props {
    stats: UserStats;
    onNavigate: (view: AppState) => void;
    isChristmas?: boolean;
    onUpdateStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

const MainMenu: React.FC<Props> = ({ stats, onNavigate, isChristmas }) => {
    return (
        <div className={`relative h-full w-full flex flex-col items-center justify-between overflow-hidden ${isChristmas ? 'bg-gradient-to-b from-red-950 via-black to-green-950' : 'bg-black'}`}>
            
            {/* Top HUD - Gigante e Leggibile */}
            <div className="w-full flex justify-between items-center z-30 p-4 pt-[calc(env(safe-area-inset-top)+10px)] px-[calc(env(safe-area-inset-left)+20px)] pr-[calc(env(safe-area-inset-right)+20px)]">
                <div className="bg-black/60 backdrop-blur-lg p-3 md:p-4 rounded-2xl border-2 border-white/20 shadow-2xl">
                    <div className="text-sm md:text-2xl font-black uppercase italic text-white flex items-center gap-3">
                        {stats.username}
                        {stats.isVip && <i className="fas fa-crown text-yellow-500"></i>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 md:mt-2">
                        <i className="fas fa-gem text-blue-400 text-sm md:text-2xl"></i>
                        <span className="text-white font-black text-sm md:text-2xl">{stats.gems.toLocaleString()}</span>
                    </div>
                </div>

                <button 
                    onClick={() => onNavigate(AppState.SHOP)}
                    className="bg-yellow-500 text-black px-6 py-3 md:px-8 md:py-4 rounded-2xl font-black text-xs md:text-xl uppercase shadow-xl active:scale-90 border-b-4 border-yellow-800"
                >
                    SHOP VIP
                </button>
            </div>

            {/* Area Centrale - Dimensioni Massime */}
            <div className="flex-1 w-full flex flex-col items-center justify-center gap-6 md:gap-20 px-6 landscape-menu-row">
                <div className="text-center">
                    <h1 className="text-5xl md:text-9xl lg:text-[12rem] font-black italic text-white pixel-font drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] leading-tight landscape-menu-logo">
                        FIRE DASH
                    </h1>
                    <p className="text-orange-500 font-bold tracking-[0.4em] text-[10px] md:text-2xl uppercase mt-2 landscape-hide">ULTIMATE EDITION</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button 
                        onClick={() => onNavigate(AppState.LEVEL_SELECT)}
                        className="w-40 h-40 md:w-80 md:h-80 bg-blue-600 rounded-[3rem] md:rounded-[5rem] flex items-center justify-center text-6xl md:text-[10rem] text-white shadow-[0_0_80px_rgba(37,99,235,0.6)] border-4 md:border-8 border-white/30 active:scale-95 transition-all hover:bg-blue-500 hover:shadow-blue-500/80 landscape-play-btn"
                    >
                        <i className="fas fa-play ml-3"></i>
                    </button>
                    <div className="text-white font-black uppercase tracking-[0.4em] text-xs md:text-3xl landscape-hide">GIOCA ORA</div>
                </div>
            </div>

            {/* Barra Navigazione Inferiore - Icone Grandi */}
            <div className="w-full flex justify-center items-center z-30 pb-[calc(env(safe-area-inset-bottom)+12px)] p-4">
                <div className="flex gap-6 md:gap-12 bg-black/70 backdrop-blur-2xl p-3 md:p-6 rounded-[2.5rem] border-2 border-white/20 shadow-2xl">
                    <button onClick={() => onNavigate(AppState.SKINS)} className="flex flex-col items-center justify-center w-20 h-16 md:w-36 md:h-28 bg-gray-900/90 rounded-2xl active:scale-95 border-2 border-white/10">
                        <i className="fas fa-tshirt text-emerald-400 text-2xl md:text-5xl mb-1"></i>
                        <span className="text-[9px] md:text-sm font-bold text-gray-400 uppercase">Skins</span>
                    </button>
                    <button onClick={() => onNavigate(AppState.GIFT_SHOP)} className="flex flex-col items-center justify-center w-20 h-16 md:w-36 md:h-28 bg-gray-900/90 rounded-2xl active:scale-95 border-2 border-white/10">
                        <i className="fas fa-gift text-red-500 text-2xl md:text-5xl mb-1"></i>
                        <span className="text-[9px] md:text-sm font-bold text-gray-400 uppercase">Doni</span>
                    </button>
                    {isChristmas && (
                        <button onClick={() => onNavigate(AppState.CHRISTMAS_EVENT)} className="flex flex-col items-center justify-center w-20 h-16 md:w-36 md:h-28 bg-gradient-to-br from-red-600 to-green-700 rounded-2xl active:scale-95 border-2 border-white/30 shadow-lg">
                            <i className="fas fa-snowflake text-white text-2xl md:text-5xl mb-1"></i>
                            <span className="text-[9px] md:text-sm font-bold text-white uppercase">Evento</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainMenu;