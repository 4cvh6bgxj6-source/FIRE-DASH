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
            
            {/* Top HUD - Più visibile e grande */}
            <div className="w-full flex justify-between items-center z-30 p-4 pt-[calc(env(safe-area-inset-top)+10px)] px-[calc(env(safe-area-inset-left)+16px)] pr-[calc(env(safe-area-inset-right)+16px)]">
                <div className="bg-black/60 backdrop-blur-lg p-2 md:p-3 rounded-2xl border border-white/20 shadow-2xl">
                    <div className="text-xs md:text-xl font-black uppercase italic text-white flex items-center gap-2">
                        {stats.username}
                        {stats.isVip && <i className="fas fa-crown text-yellow-500"></i>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <i className="fas fa-gem text-blue-400 text-xs md:text-lg"></i>
                        <span className="text-white font-black text-xs md:text-xl">{stats.gems.toLocaleString()}</span>
                    </div>
                </div>

                <button 
                    onClick={() => onNavigate(AppState.SHOP)}
                    className="bg-yellow-500 text-black px-4 py-2 md:px-6 md:py-3 rounded-xl font-black text-xs md:text-lg uppercase shadow-xl active:scale-90 border-b-4 border-yellow-800"
                >
                    SHOP VIP
                </button>
            </div>

            {/* Area Centrale - Ingrandita radicalmente */}
            <div className="flex-1 w-full flex flex-col items-center justify-center gap-8 md:gap-20 px-6 landscape-flex-row">
                <div className="text-center">
                    <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-black italic text-white pixel-font drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] leading-tight landscape-logo-size">
                        FIRE DASH
                    </h1>
                    <p className="text-orange-500 font-bold tracking-[0.4em] text-[10px] md:text-xl uppercase mt-2 landscape-hide-text">ULTIMATE EDITION</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button 
                        onClick={() => onNavigate(AppState.LEVEL_SELECT)}
                        className="w-32 h-32 md:w-64 md:h-64 bg-blue-600 rounded-[2.5rem] md:rounded-[4rem] flex items-center justify-center text-5xl md:text-9xl text-white shadow-[0_0_60px_rgba(37,99,235,0.5)] border-4 border-white/30 active:scale-95 transition-all hover:bg-blue-500 landscape-btn-size"
                    >
                        <i className="fas fa-play ml-2"></i>
                    </button>
                    <div className="text-white font-black uppercase tracking-[0.4em] text-xs md:text-2xl landscape-hide-text">GIOCA ORA</div>
                </div>
            </div>

            {/* Barra Inferiore - Icone più grandi e facili da cliccare */}
            <div className="w-full flex justify-center items-center z-30 pb-[calc(env(safe-area-inset-bottom)+12px)] p-4">
                <div className="flex gap-4 md:gap-8 bg-black/60 backdrop-blur-2xl p-2 md:p-4 rounded-[2rem] border border-white/20 shadow-2xl">
                    <button onClick={() => onNavigate(AppState.SKINS)} className="flex flex-col items-center justify-center w-16 h-14 md:w-28 md:h-24 bg-gray-900/90 rounded-2xl active:scale-95 border border-white/10">
                        <i className="fas fa-tshirt text-emerald-400 text-xl md:text-4xl mb-1"></i>
                        <span className="text-[8px] md:text-xs font-bold text-gray-400 uppercase">Skins</span>
                    </button>
                    <button onClick={() => onNavigate(AppState.GIFT_SHOP)} className="flex flex-col items-center justify-center w-16 h-14 md:w-28 md:h-24 bg-gray-900/90 rounded-2xl active:scale-95 border border-white/10">
                        <i className="fas fa-gift text-red-500 text-xl md:text-4xl mb-1"></i>
                        <span className="text-[8px] md:text-xs font-bold text-gray-400 uppercase">Doni</span>
                    </button>
                    {isChristmas && (
                        <button onClick={() => onNavigate(AppState.CHRISTMAS_EVENT)} className="flex flex-col items-center justify-center w-16 h-14 md:w-28 md:h-24 bg-gradient-to-br from-red-600 to-green-700 rounded-2xl active:scale-95 border border-white/20">
                            <i className="fas fa-snowflake text-white text-xl md:text-4xl mb-1"></i>
                            <span className="text-[8px] md:text-xs font-bold text-white uppercase">Evento</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainMenu;