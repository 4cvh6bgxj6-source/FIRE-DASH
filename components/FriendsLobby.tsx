
import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';

interface Props {
    onBack: () => void;
    onChallenge: (opponentUsername: string, isBot: boolean) => void;
    currentUser: string;
    selectedSkinId: string;
    isVip: boolean;
}

const BOT_PLAYERS = [
    { name: 'FIRE_BOT_01', status: 'Online', level: 'Easy' },
    { name: 'DASH_DRONE', status: 'Online', level: 'Normal' },
    { name: 'GLITCH_AI', status: 'In Gara', level: 'Hard' },
];

const FriendsLobby: React.FC<Props> = ({ onBack, onChallenge, currentUser, selectedSkinId, isVip }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);

    const generateInviteLink = () => {
        const baseUrl = window.location.origin + window.location.pathname;
        // Includiamo nome e skin nel link per "passarli" all'amico
        const params = new URLSearchParams();
        params.set('challenge', currentUser);
        params.set('skin', selectedSkinId);
        
        const inviteUrl = `${baseUrl}?${params.toString()}`;
        
        navigator.clipboard.writeText(inviteUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        });
    };

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        // La ricerca manuale qui simula la ricerca di un "Bot" specifico o player cloud
        onChallenge(searchQuery.trim().toUpperCase(), true);
    };

    return (
        <div className="flex flex-col items-center h-full w-full bg-black p-4 md:p-8 overflow-y-auto font-['Orbitron'] pb-24">
            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-10 sticky top-0 bg-black/80 backdrop-blur-md py-4 z-50">
                <button onClick={onBack} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white font-bold transition-all text-xs border border-white/5">
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-xl md:text-3xl font-black italic text-white uppercase tracking-tighter">Multiplayer Lobby</h2>
                    <p className="text-emerald-400 text-[9px] font-bold tracking-[0.2em] uppercase animate-pulse">Status: Cloud Online</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[8px] text-gray-500 uppercase font-black">Utente</span>
                    <span className={`text-[10px] md:text-xs font-black uppercase ${isVip ? 'rainbow-text' : 'text-white'}`}>{currentUser}</span>
                </div>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* SEZIONE 1: INVITI REALI (INVITI VERI) */}
                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/20 border-2 border-blue-500/30 p-8 rounded-[2.5rem] shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
                                <i className="fas fa-link text-white"></i>
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase text-lg leading-tight">SFIDA REALE</h3>
                                <p className="text-blue-400 text-[10px] font-bold">Manda il link a un amico vero</p>
                            </div>
                        </div>

                        <p className="text-gray-400 text-xs mb-8 leading-relaxed italic">
                            Copia questo link e invialo su WhatsApp, Discord o Telegram. Chi lo apre entrerà direttamente in gara contro di te con il tuo nome e la tua skin!
                        </p>

                        <button 
                            onClick={generateInviteLink}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all transform active:scale-95 flex items-center justify-center gap-3 border-b-4 ${
                                copied 
                                ? 'bg-emerald-600 text-white border-emerald-900' 
                                : 'bg-white text-black hover:bg-blue-400 border-gray-300'
                            }`}
                        >
                            <i className={`fas ${copied ? 'fa-check-circle' : 'fa-copy'}`}></i>
                            {copied ? 'Link Copiato!' : 'Copia Link Sfida'}
                        </button>
                    </div>

                    <form onSubmit={handleManualSearch} className="bg-gray-900/50 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
                        <h4 className="text-gray-500 text-[10px] font-black uppercase mb-4 tracking-widest">Cerca Player Cloud</h4>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cerca Username..."
                                className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-xs font-bold"
                            />
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl font-black text-[10px] uppercase transition-all">
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                    </form>
                </div>

                {/* SEZIONE 2: SFIDE BOT (BOT PLAYERS) */}
                <div className="bg-gray-900/30 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2">
                            <i className="fas fa-robot text-gray-500 text-xs"></i> Sfide Rapide (Bot)
                        </h3>
                        <span className="bg-white/5 px-2 py-1 rounded text-[9px] text-gray-500 font-bold">Cloud IA</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {BOT_PLAYERS.map((bot) => (
                            <div key={bot.name} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-blue-400 transition-colors">
                                        <i className="fas fa-microchip"></i>
                                    </div>
                                    <div>
                                        <div className="text-white font-black text-xs uppercase tracking-tighter">{bot.name}</div>
                                        <div className="text-[9px] text-gray-500 font-bold uppercase italic">Difficoltà: {bot.level}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onChallenge(bot.name, true)}
                                    className="w-10 h-10 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-90"
                                >
                                    <i className="fas fa-play text-xs"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                        <p className="text-orange-500/60 text-[9px] font-bold uppercase italic text-center">
                            I bot sono simulazioni cloud per allenarti quando i tuoi amici non sono online.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FriendsLobby;
