
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
    
    // Sconto del 25% (moltiplicatore 0.75)
    const premiumCost = isChristmasSeason ? Math.floor(PREMIUM_ORIGINAL * 0.75) : PREMIUM_ORIGINAL;
    const vipCost = isChristmasSeason ? Math.floor(VIP_ORIGINAL * 0.75) : VIP_ORIGINAL;

    return (
        <div className={`flex flex-col items-center h-full w-full p-4 md:p-8 overflow-y-auto relative pb-20 ${isChristmasSeason ? 'bg-gradient-to-b from-red-950 to-black' : 'bg-black'}`}>
            {isChristmasSeason && (
                <>
                    <div className="snow-container pointer-events-none z-0"></div>
                    <div className="absolute top-0 w-full text-center bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-black py-3 uppercase tracking-[0.3em] text-[10px] md:text-xs shadow-lg z-[60] border-b-2 border-yellow-400/30">
                        <i className="fas fa-snowflake mr-2"></i> SALDI DI NATALE: -25% SU TUTTO IL CATALOGO! <i className="fas fa-gift ml-2"></i>
                    </div>
                </>
            )}

            <div className="w-full max-w-6xl flex justify-between items-center mb-8 mt-12 z-10">
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-white font-bold transition-all transform active:scale-95 text-xs md:text-base border border-white/5"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-3xl md:text-6xl font-black italic text-white uppercase tracking-tighter flex items-center gap-6 justify-center">
                        {isChristmasSeason && <i className="fas fa-holly-berry text-red-500"></i>}
                        Shop Membership
                        {isChristmasSeason && <i className="fas fa-holly-berry text-red-500"></i>}
                    </h2>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.4em] mt-2">Acquista Potenziamenti Unici</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl mt-4 z-10">
                {/* Premium Card */}
                <div className={`relative overflow-hidden p-10 rounded-[3rem] border-2 transition-all duration-500 ${
                    stats.isPremium ? 'border-purple-500 bg-purple-950/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]' : 'border-white/10 bg-gray-900/40 backdrop-blur-md'
                }`}>
                    {isChristmasSeason && !stats.isPremium && (
                        <div className="absolute -top-2 -right-10 bg-red-600 text-white font-black px-12 py-4 rounded-full text-[12px] uppercase rotate-12 shadow-xl border-2 border-white/20 z-10">
                            -25% NATALE
                        </div>
                    )}
                    
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <i className="fas fa-gem text-purple-400 text-2xl"></i>
                            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">PREMIUM</h3>
                        </div>
                        <div className="h-2 w-20 bg-gradient-to-r from-purple-600 to-transparent rounded-full"></div>
                    </div>

                    <ul className="space-y-5 mb-12">
                        <li className="flex items-center gap-4 text-gray-300 font-medium">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">
                                <i className="fas fa-check text-purple-400"></i>
                            </div>
                            Skin "Neon Spark" Esclusiva
                        </li>
                        <li className="flex items-center gap-4 text-gray-300 font-medium">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">
                                <i className="fas fa-check text-purple-400"></i>
                            </div>
                            Tutte le Skin Base Sbloccate
                        </li>
                        <li className="flex items-center gap-4 text-gray-300 font-medium">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">
                                <i className="fas fa-check text-purple-400"></i>
                            </div>
                            +50% Gemme ogni Gara
                        </li>
                    </ul>

                    {stats.isPremium ? (
                        <div className="w-full bg-purple-600/30 text-purple-300 border border-purple-500/50 font-black py-5 rounded-3xl text-center uppercase tracking-widest text-sm">Abbonamento Attivo</div>
                    ) : (
                        <button 
                            onClick={() => onPurchase('premium', premiumCost)}
                            className="w-full bg-gradient-to-br from-purple-500 to-indigo-700 text-white font-black py-5 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-2xl shadow-purple-500/30 transform active:scale-95 hover:brightness-110 transition-all border-b-4 border-purple-900"
                        >
                            {isChristmasSeason && <span className="text-xs line-through opacity-60 font-bold">{PREMIUM_ORIGINAL} Gemme</span>}
                            <span className="text-xl tracking-wider">{premiumCost} Gemme</span>
                        </button>
                    )}
                </div>

                {/* VIP Card */}
                <div className={`relative overflow-hidden p-10 rounded-[3rem] border-2 transition-all duration-500 ${
                    stats.isVip ? 'border-yellow-500 bg-yellow-950/40 shadow-[0_0_50px_rgba(234,179,8,0.2)]' : 'border-white/10 bg-gray-900/40 backdrop-blur-md'
                }`}>
                    {isChristmasSeason && !stats.isVip && (
                        <div className="absolute -top-2 -right-10 bg-red-600 text-white font-black px-12 py-4 rounded-full text-[12px] uppercase rotate-12 shadow-xl border-2 border-white/20 z-10">
                            SPECIAL PRICE
                        </div>
                    )}

                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <i className="fas fa-crown text-yellow-400 text-2xl animate-bounce"></i>
                            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">VIP</h3>
                        </div>
                        <div className="h-2 w-20 bg-gradient-to-r from-yellow-500 to-transparent rounded-full"></div>
                    </div>

                    <ul className="space-y-5 mb-12">
                        <li className="flex items-center gap-4 text-yellow-400 font-black tracking-wide">
                            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-[10px]">
                                <i className="fas fa-skull text-yellow-400"></i>
                            </div>
                            Mappa Extra Sbloccata: "THE FINAL BOSS"
                        </li>
                        <li className="flex items-center gap-4 text-green-400 font-black tracking-wide bg-green-900/20 p-2 rounded-lg border border-green-500/30">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-[10px]">
                                <i className="fas fa-crosshairs text-green-400"></i>
                            </div>
                            SKIN APPOSTA PER FINAL BOSS (BOSS HUNTER)
                        </li>
                        <li className="flex items-center gap-4 text-yellow-300 font-bold">
                            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-[10px]">
                                <i className="fas fa-tachometer-alt text-yellow-400"></i>
                            </div>
                            Darkness Hardcore a 2x (Invece di 4x)
                        </li>
                        <li className="flex items-center gap-4 text-gray-300 font-medium">
                            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-[10px]">
                                <i className="fas fa-check text-yellow-400"></i>
                            </div>
                            X2 Gemme (Double reward!)
                        </li>
                    </ul>

                    {stats.isVip ? (
                        <div className="w-full bg-yellow-600/30 text-yellow-300 border border-yellow-500/50 font-black py-5 rounded-3xl text-center uppercase tracking-widest text-sm italic">Status: LEGGENDARIO</div>
                    ) : (
                        <button 
                            onClick={() => onPurchase('vip', vipCost)}
                            className="w-full bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 text-black font-black py-5 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-2xl shadow-yellow-500/30 transform active:scale-95 hover:brightness-110 transition-all border-b-4 border-yellow-900"
                        >
                            {isChristmasSeason && <span className="text-xs line-through opacity-60 font-bold">{VIP_ORIGINAL} Gemme</span>}
                            <span className="text-xl tracking-wider">{vipCost} Gemme</span>
                        </button>
                    )}
                </div>
            </div>
            
            <p className="mt-12 text-gray-600 text-[10px] uppercase font-bold tracking-widest text-center max-w-sm z-10">
                * Gli abbonamenti sono permanenti e legati al tuo username. Non dimenticarlo!
            </p>
        </div>
    );
};

export default Shop;
