
import React from 'react';
import { AppState, UserStats } from '../types';

interface Props {
    stats: UserStats;
    onNavigate: (view: AppState) => void;
}

const MainMenu: React.FC<Props> = ({ stats, onNavigate }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black font-['Orbitron'] p-4 overflow-hidden">
            {/* Header Profilo - Più compatto su mobile */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
                <div className="text-gray-500 text-[10px] md:text-sm mb-0 md:mb-1 uppercase tracking-tighter">Bentornato,</div>
                <div className={`text-lg md:text-2xl font-black flex items-center gap-2 ${stats.isVip ? 'rainbow-text' : 'text-white'}`}>
                    {stats.username}
                    {stats.isVip && <i className="fas fa-certificate text-yellow-400 text-xs animate-pulse"></i>}
                </div>
            </div>

            {/* Grid Pulsanti - Rimossa la scala fissa per evitare bug di tocco */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center w-full max-w-4xl">
                
                {/* Tasto Gioca - Area di tocco ottimizzata e feedback visivo migliorato */}
                <button 
                    onClick={() => onNavigate(AppState.LEVEL_SELECT)}
                    className="group relative flex flex-col items-center touch-manipulation"
                >
                    <div className="w-32 h-32 md:w-48 md:h-48 bg-blue-600 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-5xl md:text-7xl shadow-[0_0_50px_rgba(37,99,235,0.4)] transform transition-all duration-300 group-hover:scale-105 group-active:scale-90 group-hover:bg-blue-500 border-4 border-white/10">
                        <i className="fas fa-play text-white ml-2 drop-shadow-lg"></i>
                    </div>
                    <div className="mt-6 flex flex-col items-center">
                        <span className="font-black text-white uppercase tracking-[0.3em] text-lg md:text-2xl group-hover:text-blue-400 transition-colors drop-shadow-md">Gioca</span>
                        <div className="h-1 w-8 bg-blue-500 mt-1 rounded-full group-hover:w-16 transition-all"></div>
                    </div>
                </button>

                {/* Colonna Secondaria */}
                <div className="flex flex-col gap-4 md:gap-6 w-full md:w-auto px-4 md:px-0">
                    
                    <div className="flex flex-row md:flex-col gap-4">
                        {/* Friends Button */}
                        <button 
                            onClick={() => onNavigate(AppState.FRIENDS_LOBBY)}
                            className="flex-1 group relative flex items-center justify-center md:justify-start gap-4 bg-blue-700 hover:bg-blue-600 px-6 py-4 rounded-2xl shadow-xl transition-all hover:translate-x-1 active:scale-95 border-b-4 border-blue-900"
                        >
                            <i className="fas fa-users text-xl text-white"></i>
                            <span className="font-black text-white uppercase tracking-widest text-xs md:text-sm">Sfida Amici</span>
                        </button>

                        {/* Gift Shop Button */}
                        <button 
                            onClick={() => onNavigate(AppState.GIFT_SHOP)}
                            className="flex-1 group relative flex items-center justify-center md:justify-start gap-4 bg-red-600 hover:bg-red-500 px-6 py-4 rounded-2xl shadow-xl transition-all hover:translate-x-1 active:scale-95 border-b-4 border-red-900"
                        >
                            <i className="fas fa-gift text-xl text-white animate-bounce"></i>
                            <span className="font-black text-white uppercase tracking-widest text-xs md:text-sm">Regali</span>
                        </button>
                    </div>

                    <div className="flex gap-4">
                        {/* Skins Button */}
                        <button 
                            onClick={() => onNavigate(AppState.SKINS)}
                            className="flex-1 group relative flex flex-col items-center bg-gray-900/50 p-4 rounded-2xl border border-white/5 hover:border-emerald-500 transition-all active:scale-95"
                        >
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg transform transition-all group-hover:rotate-12">
                                <i className="fas fa-tshirt text-white"></i>
                            </div>
                            <span className="mt-3 font-bold text-gray-400 uppercase tracking-widest text-[9px]">Skins</span>
                        </button>

                        {/* Shop Button */}
                        <button 
                            onClick={() => onNavigate(AppState.SHOP)}
                            className="flex-1 group relative flex flex-col items-center bg-gray-900/50 p-4 rounded-2xl border border-white/5 hover:border-purple-500 transition-all active:scale-95"
                        >
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg transform transition-all group-hover:-rotate-12">
                                <i className="fas fa-shopping-cart text-white"></i>
                            </div>
                            <span className="mt-3 font-bold text-gray-400 uppercase tracking-widest text-[9px]">Shop</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* News - Nascosta su mobile molto piccolo per non affollare */}
            <div className="mt-12 md:mt-24 max-w-lg text-center px-4 hidden sm:block">
                <div className="text-[10px] text-gray-600 uppercase mb-3 tracking-[0.4em]">Aggiornamenti Live</div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                    <p className="text-gray-400 text-xs italic font-bold">
                        SUGGERIMENTO: <span className="text-orange-400 uppercase">USA I CODICI SEGRETI PER COMPLETARE LE SFIDE!</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
