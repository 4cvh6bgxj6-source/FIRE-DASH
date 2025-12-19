
import React, { useState, useEffect } from 'react';

interface Props {
    onClaim: (amount: number) => void;
    onBack: () => void;
}

const GiftShop: React.FC<Props> = ({ onClaim, onBack }) => {
    const [canClaimBig, setCanClaimBig] = useState(false);
    const [canClaimDaily, setCanClaimDaily] = useState(false);
    const [isChristmasDay, setIsChristmasDay] = useState(false);

    useEffect(() => {
        const now = new Date();
        const month = now.getMonth(); // 11 = Dicembre
        const day = now.getDate();
        const todayStr = now.toDateString();
        
        // Controllo Regalo Gigante (24 Dic)
        const lastBigClaim = localStorage.getItem('last_big_claim');
        const isActually24Dec = (month === 11 && day === 24);
        setIsChristmasDay(isActually24Dec);
        setCanClaimBig(isActually24Dec && lastBigClaim !== todayStr);

        // Controllo Bonus Giornaliero (50 gemme)
        const lastDailyClaim = localStorage.getItem('last_daily_claim');
        setCanClaimDaily(lastDailyClaim !== todayStr);
    }, []);

    const handleBigClaim = () => {
        const todayStr = new Date().toDateString();
        localStorage.setItem('last_big_claim', todayStr);
        onClaim(10000);
        setCanClaimBig(false);
        alert(`BUON NATALE! Hai riscosso il super regalo di 10.000 gemme!`);
    };

    const handleDailyClaim = () => {
        const todayStr = new Date().toDateString();
        localStorage.setItem('last_daily_claim', todayStr);
        onClaim(50);
        setCanClaimDaily(false);
        alert(`Bonus Giornaliero riscosso! +50 gemme`);
    };

    return (
        <div className="flex flex-col items-center h-full w-full bg-gradient-to-b from-red-950 via-black to-black p-8 relative overflow-hidden">
            {/* Decorazioni di sfondo */}
            <div className="absolute top-10 left-10 text-white/5 text-9xl rotate-12 pointer-events-none">
                <i className="fas fa-snowflake"></i>
            </div>
            <div className="absolute bottom-10 right-10 text-white/5 text-9xl -rotate-12 pointer-events-none">
                <i className="fas fa-gift"></i>
            </div>

            <div className="w-full max-w-4xl flex justify-between items-center mb-12 z-10">
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-white font-bold transition-colors border border-white/5"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Regalo di Natale</h2>
                <div className="w-[100px]"></div>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 w-full z-10 gap-8">
                {/* CARD REGALO GRANDE */}
                <div className="text-center max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-2xl relative">
                    <div className={`relative mb-6 transform transition-all duration-700 ${canClaimBig ? 'scale-110 hover:scale-125 animate-bounce' : 'opacity-40 grayscale scale-90'}`}>
                        <i className={`fas fa-gift text-8xl ${isChristmasDay ? 'text-yellow-400' : 'text-red-600'} drop-shadow-[0_0_35px_rgba(239,68,68,0.7)]`}></i>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">
                        {isChristmasDay 
                            ? (canClaimBig ? 'IL TUO REGALO DA 10K!' : 'REGALO RISCOSSO!') 
                            : 'NON È ANCORA IL 24!'}
                    </h3>
                    
                    <p className="text-gray-400 text-xs mb-8 leading-relaxed px-4">
                        {isChristmasDay 
                            ? "Oggi è il 24! Prendi le tue 10.000 gemme gratuite!" 
                            : "Il pacco gigante da 10.000 gemme si aprirà solo il 24 Dicembre. Torna a trovarci!"}
                    </p>

                    {isChristmasDay && canClaimBig ? (
                        <button 
                            onClick={handleBigClaim}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black py-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl uppercase text-lg border-b-4 border-orange-800"
                        >
                            APRI 10.000 GEMME 🎁
                        </button>
                    ) : (
                        <div className="w-full bg-gray-900/50 text-gray-600 font-black py-4 rounded-2xl text-center uppercase text-sm border border-white/5 italic">
                            {isChristmasDay ? 'GIÀ RISCOSSO' : 'TORNA IL 24 DIC'}
                        </div>
                    )}
                </div>

                {/* CARD BONUS GIORNALIERO (NOVITÀ) */}
                <div className="w-full max-w-md bg-blue-900/10 backdrop-blur-md p-6 rounded-[2rem] border border-blue-500/20 flex items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${canClaimDaily ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <div className="text-left">
                            <h4 className="text-white font-black text-xs uppercase tracking-widest">Bonus Quotidiano</h4>
                            <p className="text-blue-400 font-black text-sm">+50 Gemme</p>
                        </div>
                    </div>

                    {canClaimDaily ? (
                        <button 
                            onClick={handleDailyClaim}
                            className="bg-white text-black font-black px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-400 transition-all active:scale-90"
                        >
                            Prendi
                        </button>
                    ) : (
                        <div className="text-gray-500 font-black text-[9px] uppercase italic">
                            Domani <i className="fas fa-clock ml-1"></i>
                        </div>
                    )}
                </div>
                
                {isChristmasDay && (
                    <div className="mt-4 text-yellow-400 font-black italic animate-pulse flex items-center gap-3 bg-black/40 px-6 py-2 rounded-full border border-yellow-400/20">
                        <i className="fas fa-star text-lg"></i>
                        <span className="text-xs uppercase">Buon Natale da Fire Dash!</span>
                        <i className="fas fa-star text-lg"></i>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GiftShop;
