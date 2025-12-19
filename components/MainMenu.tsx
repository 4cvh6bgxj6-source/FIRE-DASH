
import React from 'react';
import { AppState, UserStats } from '../types';

interface Props {
    stats: UserStats;
    onNavigate: (view: AppState) => void;
}

const MainMenu: React.FC<Props> = ({ stats, onNavigate }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black font-['Orbitron']">
            <div className="absolute top-8 left-8">
                <div className="text-gray-400 text-sm mb-1 uppercase tracking-tighter">Bentornato,</div>
                <div className="text-2xl font-black text-white flex items-center gap-2">
                    {stats.username}
                    {stats.isVip && <i className="fas fa-certificate text-yellow-400 text-xs"></i>}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-center scale-110">
                {/* Play Button */}
                <button 
                    onClick={() => onNavigate(AppState.LEVEL_SELECT)}
                    className="group relative flex flex-col items-center"
                >
                    <div className="w-40 h-40 bg-blue-600 rounded-3xl flex items-center justify-center text-6xl shadow-2xl shadow-blue-500/50 transform transition-all group-hover:scale-110 group-active:scale-95 group-hover:bg-blue-500">
                        <i className="fas fa-play text-white ml-2"></i>
                    </div>
                    <span className="mt-4 font-black text-white uppercase tracking-widest text-lg group-hover:text-blue-400 transition-colors">Gioca</span>
                </button>

                <div className="flex flex-col gap-6">
                    {/* Friends Button (NUOVO) */}
                    <button 
                        onClick={() => onNavigate(AppState.FRIENDS_LOBBY)}
                        className="group relative flex items-center gap-4 bg-blue-700 hover:bg-blue-600 px-6 py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <i className="fas fa-users text-2xl text-white"></i>
                        <span className="font-black text-white uppercase tracking-widest">Sfida Amici</span>
                    </button>

                    {/* Gift Shop Button */}
                    <button 
                        onClick={() => onNavigate(AppState.GIFT_SHOP)}
                        className="group relative flex items-center gap-4 bg-red-600 hover:bg-red-500 px-6 py-4 rounded-2xl shadow-xl shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <i className="fas fa-gift text-2xl text-white animate-bounce"></i>
                        <span className="font-black text-white uppercase tracking-widest">Regali</span>
                    </button>

                    <div className="flex gap-6">
                        {/* Skins Button */}
                        <button 
                            onClick={() => onNavigate(AppState.SKINS)}
                            className="group relative flex flex-col items-center"
                        >
                            <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/40 transform transition-all group-hover:scale-110 group-active:scale-95 group-hover:bg-emerald-500">
                                <i className="fas fa-tshirt text-white"></i>
                            </div>
                            <span className="mt-2 font-bold text-gray-400 uppercase tracking-widest text-[10px] group-hover:text-emerald-400 transition-colors">Skins</span>
                        </button>

                        {/* Shop Button */}
                        <button 
                            onClick={() => onNavigate(AppState.SHOP)}
                            className="group relative flex flex-col items-center"
                        >
                            <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-purple-500/40 transform transition-all group-hover:scale-110 group-active:scale-95 group-hover:bg-purple-500">
                                <i className="fas fa-shopping-cart text-white"></i>
                            </div>
                            <span className="mt-2 font-bold text-gray-400 uppercase tracking-widest text-[10px] group-hover:text-purple-400 transition-colors">Shop</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-24 max-w-lg text-center px-4">
                <div className="text-xs text-gray-600 uppercase mb-2 tracking-[0.5em]">Novità</div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-300 text-sm">Passa dal <span className="text-red-500 font-black">GIFT SHOP</span> per riscuotere le tue gemme giornaliere!</p>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
