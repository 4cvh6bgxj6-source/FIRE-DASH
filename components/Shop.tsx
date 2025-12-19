
import React from 'react';
import { UserStats } from '../types';

interface Props {
    stats: UserStats;
    isChristmasSeason: boolean;
    onPurchase: (type: 'premium' | 'vip', cost: number) => void;
    onBack: () => void;
}

const Shop: React.FC<Props> = ({ stats, isChristmasSeason, onPurchase, onBack }) => {
    const PREMIUM_ORIGINAL = 5000;
    const VIP_ORIGINAL = 10000;
    
    const premiumCost = isChristmasSeason ? Math.floor(PREMIUM_ORIGINAL * 0.75) : PREMIUM_ORIGINAL;
    const vipCost = isChristmasSeason ? Math.floor(VIP_ORIGINAL * 0.75) : VIP_ORIGINAL;

    return (
        <div className="flex flex-col items-center h-full w-full bg-black p-4 md:p-8 overflow-y-auto relative">
            {/* Floating Christmas Badge */}
            {isChristmasSeason && (
                <div className="fixed top-20 right-0 z-50 transform rotate-90 translate-x-12 origin-right pointer-events-none">
                    <div className="bg-red-600 text-white font-black px-8 py-2 rounded-t-2xl shadow-[0_-5px_20px_rgba(220,38,38,0.5)] border-x-2 border-t-2 border-white/20 flex items-center gap-4 uppercase tracking-widest text-sm italic">
                        <i className="fas fa-snowflake animate-spin-slow"></i>
                        XMAS SALE -25%
                        <i className="fas fa-snowflake animate-spin-slow"></i>
                    </div>
                </div>
            )}

            <div className="w-full max-w-6xl flex justify-between items-center mb-8 md:mb-12">
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-white font-bold transition-all transform active:scale-95"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Shop Membership</h2>
                    {isChristmasSeason && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="h-1 w-8 bg-red-600 rounded-full"></span>
                            <p className="text-red-500 text-xs font-black animate-pulse uppercase tracking-[0.2em]">Sconti di Natale Attivi</p>
                            <span className="h-1 w-8 bg-red-600 rounded-full"></span>
                        </div>
                    )}
                </div>
                <div className="hidden md:flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-xl border border-white/5">
                    <i className="fas fa-gem text-blue-400"></i>
                    <span className="text-white font-black">{stats.gems}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {/* Promo Sidebar */}
                {isChristmasSeason && (
                    <div className="bg-gradient-to-br from-red-900/40 to-black border-2 border-red-600/30 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(220,38,38,0.15)] order-first lg:order-none">
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg shadow-red-600/30 animate-bounce">
                            <i className="fas fa-gift text-white"></i>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase italic mb-4">Evento Natalizio</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            È il momento di splendere! Ottieni vantaggi esclusivi con lo sconto stagionale del <span className="text-red-500 font-black">25% su tutti gli abbonamenti</span> e le skin!
                        </p>
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                                <div className="text-red-500 font-black text-lg">-25%</div>
                                <div className="text-[8px] text-gray-500 uppercase font-bold">Prezzo</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                                <div className="text-blue-400 font-black text-lg">X2</div>
                                <div className="text-[8px] text-gray-500 uppercase font-bold">Regali</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Premium Card */}
                <div className={`relative overflow-hidden p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${
                    stats.isPremium ? 'border-purple-500 bg-purple-900/20' : 'border-white/10 bg-gray-900'
                } hover:border-purple-500/50`}>
                    <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-2">
                        <i className="fas fa-crown text-purple-400 text-4xl opacity-50"></i>
                    </div>
                    
                    <div className="mb-8">
                        <h3 className="text-4xl font-black text-white italic mb-1 uppercase tracking-tighter">PREMIUM</h3>
                        <div className="h-1.5 w-12 bg-purple-600 rounded-full"></div>
                    </div>

                    <ul className="space-y-4 mb-12 text-sm">
                        <li className="flex items-center gap-3 text-gray-300">
                            <div className="w-6 h-6 rounded-lg bg-purple-600/20 flex items-center justify-center text-[10px] text-purple-400"><i className="fas fa-check"></i></div>
                            Skin esclusiva
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <div className="w-6 h-6 rounded-lg bg-purple-600/20 flex items-center justify-center text-[10px] text-purple-400"><i className="fas fa-check"></i></div>
                            Tutte le Skin Base
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <div className="w-6 h-6 rounded-lg bg-purple-600/20 flex items-center justify-center text-[10px] text-purple-400"><i className="fas fa-check"></i></div>
                            +50% Gemme Bonus
                        </li>
                    </ul>

                    {stats.isPremium ? (
                        <div className="w-full bg-purple-600 text-white font-black py-5 rounded-2xl text-center shadow-lg shadow-purple-600/20 uppercase tracking-widest">Già Attivo</div>
                    ) : (
                        <button 
                            onClick={() => onPurchase('premium', premiumCost)}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black py-5 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 shadow-xl shadow-purple-500/20 transform active:scale-95"
                        >
                            <div className="flex items-center gap-2">
                                <i className="fas fa-gem text-sm"></i>
                                <span className="text-xl">{premiumCost} Gemme</span>
                            </div>
                            {isChristmasSeason && (
                                <span className="text-[10px] line-through opacity-50 uppercase font-bold tracking-widest">Invece di {PREMIUM_ORIGINAL}</span>
                            )}
                        </button>
                    )}
                </div>

                {/* VIP Card */}
                <div className={`relative overflow-hidden p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${
                    stats.isVip ? 'border-yellow-500 bg-yellow-900/20' : 'border-white/10 bg-gray-900'
                } hover:border-yellow-500/50`}>
                    <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-2">
                        <i className="fas fa-certificate text-yellow-400 text-4xl opacity-50 animate-spin-slow"></i>
                    </div>
                    
                    <div className="mb-8">
                        <h3 className="text-4xl font-black text-white italic mb-1 uppercase tracking-tighter">VIP</h3>
                        <div className="h-1.5 w-12 bg-yellow-600 rounded-full"></div>
                    </div>

                    <ul className="space-y-4 mb-12 text-sm">
                        <li className="flex flex-col gap-1">
                            <div className="flex items-center gap-3 text-yellow-400 font-black">
                                <div className="w-6 h-6 rounded-lg bg-yellow-600/20 flex items-center justify-center text-[10px] text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.4)]"><i className="fas fa-palette"></i></div>
                                Nome Arcobaleno
                            </div>
                            <span className="ml-9 text-[8px] text-yellow-600 font-bold uppercase tracking-tighter animate-pulse">(SOLO PER VIP)</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <div className="w-6 h-6 rounded-lg bg-yellow-600/20 flex items-center justify-center text-[10px] text-yellow-400"><i className="fas fa-check"></i></div>
                            Badge VIP Profilo
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <div className="w-6 h-6 rounded-lg bg-yellow-600/20 flex items-center justify-center text-[10px] text-yellow-400"><i className="fas fa-check"></i></div>
                            +100% Gemme (X2)
                        </li>
                        <li className="flex items-center gap-3 text-yellow-200 font-bold">
                            <div className="w-6 h-6 rounded-lg bg-yellow-600/20 flex items-center justify-center text-[10px] text-yellow-400"><i className="fas fa-star"></i></div>
                            Darkness (2x Speed)
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <div className="w-6 h-6 rounded-lg bg-yellow-600/20 flex items-center justify-center text-[10px] text-yellow-400"><i className="fas fa-check"></i></div>
                            Skin Segrete Sbloccate
                        </li>
                    </ul>

                    {stats.isVip ? (
                        <div className="w-full bg-yellow-600 text-white font-black py-5 rounded-2xl text-center shadow-lg shadow-yellow-600/20 uppercase tracking-widest">Già Attivo</div>
                    ) : (
                        <button 
                            onClick={() => onPurchase('vip', vipCost)}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black py-5 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 shadow-xl shadow-yellow-500/20 transform active:scale-95"
                        >
                            <div className="flex items-center gap-2">
                                <i className="fas fa-gem text-sm"></i>
                                <span className="text-xl">{vipCost} Gemme</span>
                            </div>
                            {isChristmasSeason && (
                                <span className="text-[10px] line-through text-yellow-900/50 uppercase font-bold tracking-widest">Invece di {VIP_ORIGINAL}</span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {isChristmasSeason && (
                <div className="mt-12 flex items-center gap-3 bg-red-950/40 border-y border-red-500/20 w-full py-4 justify-center overflow-hidden whitespace-nowrap">
                    <div className="flex gap-12 animate-marquee items-center">
                        <span className="text-red-500 font-black italic uppercase text-xs tracking-[0.3em]">PROMO NATALE: -25% SU TUTTO</span>
                        <i className="fas fa-snowflake text-white/20"></i>
                        <span className="text-red-500 font-black italic uppercase text-xs tracking-[0.3em]">SHOP AGGIORNATO</span>
                        <i className="fas fa-snowflake text-white/20"></i>
                        <span className="text-red-500 font-black italic uppercase text-xs tracking-[0.3em]">PROMO NATALE: -25% SU TUTTO</span>
                        <i className="fas fa-snowflake text-white/20"></i>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
