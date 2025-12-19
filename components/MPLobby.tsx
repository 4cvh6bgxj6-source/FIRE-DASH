
import React, { useState } from 'react';
import { Level, UserStats } from '../types';

interface Props {
    stats: UserStats;
    opponentName: string;
    levels: Level[];
    onStart: (level: Level, oppSkinId: string) => void;
    onBack: () => void;
}

const MPLobby: React.FC<Props> = ({ stats, opponentName, levels, onStart, onBack }) => {
    const [myVote, setMyVote] = useState<string | null>(null);
    const [oppVote, setOppVote] = useState<string | null>(null); // Simulato o via storage
    const [isReady, setIsReady] = useState(false);

    const handleReady = () => {
        if (!myVote) return;
        setIsReady(true);
        
        // Simulazione: L'avversario vota dopo 1-2 secondi
        setTimeout(() => {
            const randomLevel = levels[Math.floor(Math.random() * levels.length)];
            const chosenOppVote = randomLevel.id;
            setOppVote(chosenOppVote);

            setTimeout(() => {
                // Logica Votazione: Se pari o diversi, decidiamo
                let finalLevelId = myVote;
                if (myVote !== chosenOppVote) {
                    finalLevelId = Math.random() > 0.5 ? myVote : chosenOppVote;
                }
                const level = levels.find(l => l.id === finalLevelId) || levels[0];
                onStart(level, 's2'); // In una versione reale caricheremmo la skin dell'avversario
            }, 1500);
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center h-full w-full bg-gradient-to-b from-blue-950 to-black p-8 font-['Orbitron']">
            <div className="w-full max-w-4xl flex justify-between items-center mb-12">
                <button onClick={onBack} className="bg-white/10 px-6 py-2 rounded-xl text-white font-bold">Indietro</button>
                <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter text-center">
                    Multiplayer Lobby<br/>
                    <span className="text-blue-400 text-sm">{stats.username} VS {opponentName}</span>
                </h2>
                <div className="w-20"></div>
            </div>

            <div className="w-full max-w-4xl bg-gray-900/50 border border-white/10 p-8 rounded-[3rem] backdrop-blur-md">
                <h3 className="text-white font-black uppercase tracking-widest text-center mb-8">Vota il Livello della Sfida</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {levels.map(level => (
                        <button 
                            key={level.id}
                            onClick={() => !isReady && setMyVote(level.id)}
                            className={`p-4 rounded-2xl border-2 transition-all ${
                                myVote === level.id ? 'border-blue-500 bg-blue-900/40 shadow-lg' : 'border-white/5 bg-black/40'
                            } ${isReady ? 'opacity-50 grayscale' : ''}`}
                        >
                            <div className="text-[10px] text-gray-400 font-bold mb-1">{level.difficulty}</div>
                            <div className="text-white font-black text-xs uppercase truncate">{level.name}</div>
                        </button>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-6">
                    {isReady ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:'200ms'}}></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:'400ms'}}></div>
                            </div>
                            <p className="text-blue-400 font-black uppercase text-xs animate-pulse">In attesa dell'avversario...</p>
                            {oppVote && <p className="text-emerald-400 text-[10px] font-bold uppercase">L'avversario ha votato!</p>}
                        </div>
                    ) : (
                        <button 
                            onClick={handleReady}
                            disabled={!myVote}
                            className={`px-12 py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all transform active:scale-95 shadow-2xl ${
                                myVote ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            PRONTO ALLA GARA
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-12 flex items-center gap-12 text-white">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl">
                        <i className="fas fa-user"></i>
                    </div>
                    <span className="text-[10px] font-bold uppercase">{stats.username}</span>
                </div>
                <div className="text-4xl font-black italic text-gray-600">VS</div>
                <div className="flex flex-col items-center gap-2 opacity-60">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl">
                        <i className="fas fa-user-ninja"></i>
                    </div>
                    <span className="text-[10px] font-bold uppercase">{opponentName}</span>
                </div>
            </div>
        </div>
    );
};

export default MPLobby;
