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
            
            {/* Top HUD - Profilo e Valuta */}
            <div className="w-full flex justify-between items-start z-30 p-2 pt-[calc(env(safe-area-inset-top)+4px)] px-[calc(env(safe-area-inset-left)+12px)]">
                <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl">
                    <div className="text-[10px] md:text-lg font-black uppercase italic text-white flex items-center gap-2">
                        {stats.username}
                        {stats.isVip && <i className="fas fa-crown text-yellow-500 text-[8px] md:text-sm"></i>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                        <i className="fas fa-gem text-blue-400 text-[8px] md:text-xs"></i>
                        <span className="text-white font-black text-[9px] md:text-sm">{stats.gems.toLocaleString()}</span>
                    </div>
                </div>

                <button 
                    onClick={() => onNavigate(AppState.SHOP)}
                    className="bg-yellow-500 text-black px-3 py-1.5 rounded-lg font-black text-[8px] md:text-xs uppercase shadow-lg active:scale-90 pr-[calc(env(safe-area-inset-right)+4px)]"
                >
                    SHOP VIP
                </button>
            </div>

            {/* Centro Dinamico: Logo e Bottone Play */}
            <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-16 px-4 landscape-row">
                <div className="text-center">
                    <h1 className="text-3xl md:text-7xl lg:text-9xl font-black italic text-white pixel-font drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] leading-none landscape-logo">
                        FIRE DASH
                    </h1>
                    <p className="text-orange-500 font-bold tracking-[0.3em] text-[7px] md:text-base uppercase mt-1 landscape-hide">ULTIMATE EDITION</p>
                </div>

                <div className="flex flex-col items-center gap-2 md:gap-4 landscape-shrink">
                    <button 
                        onClick={() => onNavigate(AppState.LEVEL_SELECT)}
                        className="w-20 h-20 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-blue-600 rounded-2xl md:rounded-[3rem] flex items-center justify-center text-3xl md:text-7xl lg:text-9xl text-white shadow-2xl border-4 border-white/20 active:scale-95 transition-all hover:bg-blue-500"
                    >
                        <i className="fas fa-play ml-1 md:ml-2"></i>
                    </button>
                    <div className="text-white font-black uppercase tracking-[0.3em] text-[8px] md:text-xl landscape-hide">Gioca</div>
                </div>
            </div>

            {/* Navigazione Inferiore */}
            <div className="w-full flex justify-center items-center z-30 pb-[calc(env(safe-area-inset-bottom)+8px)] p-2">
                <div className="flex gap-2 md:gap-4 bg-black/50 backdrop-blur-2xl p-1.5 rounded-2xl md:rounded-3xl border border-white/10">
                    <button onClick={() => onNavigate(AppState.SKINS)} className="flex flex-col items-center justify-center w-12 h-10 md:w-20 md:h-20 bg-gray-900/80 rounded-xl active:scale-95">
                        <i className="fas fa-tshirt text-emerald-400 text-sm md:text-2xl mb-1"></i>
                        <span className="text-[6px] md:text-[9px] font-bold text-gray-500 uppercase landscape-hide">Skins</span>
                    </button>
                    <button onClick={() => onNavigate(AppState.GIFT_SHOP)} className="flex flex-col items-center justify-center w-12 h-10 md:w-20 md:h-20 bg-gray-900/80 rounded-xl active:scale-95">
                        <i className="fas fa-gift text-red-500 text-sm md:text-2xl mb-1"></i>
                        <span className="text-[6px] md:text-[9px] font-bold text-gray-500 uppercase landscape-hide">Doni</span>
                    </button>
                    {isChristmas && (
                        <button onClick={() => onNavigate(AppState.CHRISTMAS_EVENT)} className="flex flex-col items-center justify-center w-12 h-10 md:w-20 md:h-20 bg-gradient-to-br from-red-600 to-green-700 rounded-xl active:scale-95">
                            <i className="fas fa-snowflake text-white text-sm md:text-2xl mb-1"></i>
                            <span className="text-[6px] md:text-[9px] font-bold text-white uppercase landscape-hide">Evento</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainMenu;