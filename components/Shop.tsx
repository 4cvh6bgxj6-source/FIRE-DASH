
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
        <div className="flex flex-col items-center h-full w-full bg-black p-4 md:p-8 overflow-y-auto relative pb-20">
            <div className="w-full max-w-6xl flex justify-between items-center mb-8">
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white font-bold transition-all transform active:scale-95 text-xs md:text-base"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-2xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Shop Membership</h2>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Premium Card */}
                <div className={`relative overflow-hidden p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${
                    stats.isPremium ? 'border-purple-500 bg-purple-900/20' : 'border-white/10 bg-gray-900'
                }`}>
                    <div className="mb-6">
                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">PREMIUM</h3>
                        <div className="h-1.5 w-12 bg-purple-600 rounded-full mt-1"></div>
                    </div>

                    <ul className="space-y-4 mb-10 text-xs md:text-sm">
                        <li className="flex items-center gap-3 text-gray-300">
                            <i className="fas fa-check text-purple-400"></i>
                            Skin Esclusiva
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <i className="fas fa-check text-purple-400"></i>
                            Tutte le Skin Base Sbloccate
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <i className="fas fa-check text-purple-400"></i>
                            +50% Gemme ogni Gara
                        </li>
                    </ul>

                    {stats.isPremium ? (
                        <div className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl text-center uppercase tracking-widest text-xs">Già Attivo</div>
                    ) : (
                        <button 
                            onClick={() => onPurchase('premium', premiumCost)}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black py-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-purple-500/20 transform active:scale-95"
                        >
                            <span className="text-lg">{premiumCost} Gemme</span>
                        </button>
                    )}
                </div>

                {/* VIP Card */}
                <div className={`relative overflow-hidden p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${
                    stats.isVip ? 'border-yellow-500 bg-yellow-900/20' : 'border-white/10 bg-gray-900'
                }`}>
                    <div className="mb-6">
                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">VIP</h3>
                        <div className="h-1.5 w-12 bg-yellow-600 rounded-full mt-1"></div>
                    </div>

                    <ul className="space-y-4 mb-10 text-xs md:text-sm">
                        <li className="flex items-center gap-3 text-yellow-400 font-bold">
                            <i className="fas fa-palette"></i>
                            Nome Arcobaleno
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <i className="fas fa-check text-yellow-400"></i>
                            Tutte le Skin Premium incluse
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <i className="fas fa-check text-yellow-400"></i>
                            X2 Gemme (Double reward)
                        </li>
                        <li className="flex items-center gap-3 text-yellow-200">
                            <i className="fas fa-star"></i>
                            Skin ADMIN & ERROR 666
                        </li>
                    </ul>

                    {stats.isVip ? (
                        <div className="w-full bg-yellow-600 text-black font-black py-4 rounded-2xl text-center uppercase tracking-widest text-xs">Abbonamento VIP Attivo</div>
                    ) : (
                        <button 
                            onClick={() => onPurchase('vip', vipCost)}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black py-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-yellow-500/20 transform active:scale-95"
                        >
                            <span className="text-lg">{vipCost} Gemme</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;
