
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
        <div className="flex flex-col items-center h-full w-full bg-black p-8 overflow-y-auto">
            <div className="w-full max-w-4xl flex justify-between items-center mb-12">
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-white font-bold transition-colors"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Shop Membership</h2>
                    {isChristmasSeason && <p className="text-red-500 text-xs font-black animate-pulse">SCONTO NATALIZIO ATTIVO -25%</p>}
                </div>
                <div className="w-[100px]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Premium Card */}
                <div className={`relative overflow-hidden p-8 rounded-3xl border-2 transition-all ${
                    stats.isPremium ? 'border-purple-500 bg-purple-900/20' : 'border-white/10 bg-gray-900'
                }`}>
                    <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
                        <i className="fas fa-crown text-purple-400 text-3xl"></i>
                        {isChristmasSeason && !stats.isPremium && (
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded italic">-25% OFF</span>
                        )}
                    </div>
                    <h3 className="text-4xl font-black text-white mb-2 italic">PREMIUM</h3>
                    <p className="text-gray-400 mb-6 text-sm">Accesso a skin esclusive e 50% di gemme bonus ad ogni completamento.</p>
                    
                    <ul className="space-y-3 mb-8 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                            <i className="fas fa-check text-green-500"></i> Nome utente colorato
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="fas fa-check text-green-500"></i> Skin Base Sbloccate
                        </li>
                    </ul>

                    {stats.isPremium ? (
                        <div className="w-full bg-purple-600 text-white font-black py-4 rounded-xl text-center">ATTIVO</div>
                    ) : (
                        <button 
                            onClick={() => onPurchase('premium', premiumCost)}
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                        >
                            <i className="fas fa-gem"></i> 
                            {isChristmasSeason && <span className="line-through text-purple-300 mr-2 text-sm">{PREMIUM_ORIGINAL}</span>}
                            <span>{premiumCost} Gemme</span>
                        </button>
                    )}
                </div>

                {/* VIP Card */}
                <div className={`relative overflow-hidden p-8 rounded-3xl border-2 transition-all ${
                    stats.isVip ? 'border-yellow-500 bg-yellow-900/20' : 'border-white/10 bg-gray-900'
                }`}>
                    <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
                        <i className="fas fa-certificate text-yellow-400 text-3xl"></i>
                        {isChristmasSeason && !stats.isVip && (
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded italic">-25% OFF</span>
                        )}
                    </div>
                    <h3 className="text-4xl font-black text-white mb-2 italic">VIP</h3>
                    <p className="text-gray-400 mb-6 text-sm">Il massimo del prestigio. Bonus raddoppiati e supporto prioritario.</p>
                    
                    <ul className="space-y-3 mb-8 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                            <i className="fas fa-check text-green-500"></i> Badge VIP nel menu
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="fas fa-check text-green-500"></i> 100% Gemme Bonus
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="fas fa-check text-yellow-400"></i> Darkness Hardcore (2x Speed)
                        </li>
                    </ul>

                    {stats.isVip ? (
                        <div className="w-full bg-yellow-600 text-white font-black py-4 rounded-xl text-center">ATTIVO</div>
                    ) : (
                        <button 
                            onClick={() => onPurchase('vip', vipCost)}
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
                        >
                            <i className="fas fa-gem"></i>
                            {isChristmasSeason && <span className="line-through text-yellow-900/50 mr-2 text-sm">{VIP_ORIGINAL}</span>}
                            <span>{vipCost} Gemme</span>
                        </button>
                    )}
                </div>
            </div>

            {isChristmasSeason && (
                <div className="mt-8 flex items-center gap-3 bg-red-900/20 border border-red-500/30 px-6 py-3 rounded-2xl animate-bounce">
                    <i className="fas fa-snowflake text-white"></i>
                    <p className="text-white text-sm font-black italic">PROMO NATALE: RISPARMIA IL 25% SU TUTTO!</p>
                    <i className="fas fa-snowflake text-white"></i>
                </div>
            )}
        </div>
    );
};

export default Shop;
