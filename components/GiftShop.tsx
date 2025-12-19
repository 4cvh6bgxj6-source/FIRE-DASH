
import React, { useState, useEffect } from 'react';

interface Props {
    onClaim: (amount: number) => void;
    onBack: () => void;
}

const GiftShop: React.FC<Props> = ({ onClaim, onBack }) => {
    const [canClaim, setCanClaim] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(50);
    const [isChristmas, setIsChristmas] = useState(false);

    useEffect(() => {
        const now = new Date();
        const month = now.getMonth(); // 11 = December
        const day = now.getDate();
        const todayStr = now.toDateString();
        
        const lastClaim = localStorage.getItem('last_gem_claim');
        setCanClaim(lastClaim !== todayStr);

        if (month === 11 && day === 24) {
            setRewardAmount(7500);
            setIsChristmas(true);
        } else {
            setRewardAmount(50);
            setIsChristmas(false);
        }
    }, []);

    const handleClaim = () => {
        const todayStr = new Date().toDateString();
        localStorage.setItem('last_gem_claim', todayStr);
        onClaim(rewardAmount);
        setCanClaim(false);
        alert(`Hai riscosso ${rewardAmount} gemme!`);
    };

    return (
        <div className="flex flex-col items-center h-full w-full bg-gradient-to-b from-red-950 via-black to-black p-8">
            <div className="w-full max-w-4xl flex justify-between items-center mb-12">
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-white font-bold transition-colors"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Gift Shop</h2>
                <div className="w-[100px]"></div>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 w-full">
                <div className={`relative mb-12 transform transition-all duration-500 ${canClaim ? 'scale-110 hover:scale-125 cursor-pointer' : 'opacity-50 grayscale'}`}>
                    <div className={`absolute inset-0 bg-red-500 rounded-full blur-3xl opacity-20 animate-pulse`}></div>
                    <i className={`fas fa-gift text-9xl ${isChristmas ? 'text-yellow-400' : 'text-red-500'} drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]`}></i>
                    {isChristmas && (
                        <div className="absolute -top-4 -right-4 bg-yellow-400 text-black font-black px-3 py-1 rounded-full text-xs animate-bounce border-2 border-white">
                            SPECIALE 24 DIC!
                        </div>
                    )}
                </div>

                <div className="text-center max-w-md bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <h3 className="text-2xl font-black text-white mb-4 uppercase">
                        {canClaim ? 'Il tuo regalo è pronto!' : 'Torna domani!'}
                    </h3>
                    <p className="text-gray-400 text-sm mb-8">
                        {canClaim 
                            ? `Oggi puoi riscuotere un fantastico pacchetto di gemme per sbloccare nuove skin e potenziamenti.`
                            : `Hai già riscosso il tuo regalo oggi. Riprova tra qualche ora per nuove ricompense.`}
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-3 text-4xl font-black text-blue-400 mb-4">
                            <i className="fas fa-gem"></i>
                            <span>+{rewardAmount}</span>
                        </div>

                        {canClaim ? (
                            <button 
                                onClick={handleClaim}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black py-5 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-green-500/20 uppercase tracking-widest text-lg"
                            >
                                Riscuoti Ora!
                            </button>
                        ) : (
                            <div className="w-full bg-gray-800 text-gray-500 font-black py-5 rounded-2xl text-center uppercase tracking-widest text-lg border border-white/5">
                                Già Riscosso
                            </div>
                        )}
                    </div>
                </div>
                
                {isChristmas && canClaim && (
                    <div className="mt-8 text-yellow-400 font-bold italic animate-pulse">
                        <i className="fas fa-star mr-2"></i> Buon Natale! Goditi le 7500 gemme!
                    </div>
                )}
            </div>
        </div>
    );
};

export default GiftShop;
