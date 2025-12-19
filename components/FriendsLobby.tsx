
import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';

interface Props {
    onBack: () => void;
    onChallenge: (opponentUsername: string) => void;
    currentUser: string;
}

const GLOBAL_PLAYERS = [
    { name: 'FIRE_GOD_99', status: 'In Gara', level: 'Extreme' },
    { name: 'DASH_MASTER', status: 'Online', level: 'Hard' },
    { name: 'X_GLITCH_X', status: 'Online', level: 'Demon' },
    { name: 'CUBE_KING', status: 'Occupato', level: 'Normal' },
    { name: 'GHOST_PLAYER', status: 'Online', level: 'Insane' },
];

const FriendsLobby: React.FC<Props> = ({ onBack, onChallenge, currentUser }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [localPlayers, setLocalPlayers] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');
    const [inviteSent, setInviteSent] = useState<string | null>(null);

    useEffect(() => {
        const players: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('fd_user_data_')) {
                const username = key.replace('fd_user_data_', '');
                if (username !== currentUser.toLowerCase()) {
                    players.push(username.toUpperCase());
                }
            }
        }
        setLocalPlayers(players);
    }, [currentUser]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const target = searchQuery.trim();
        
        if (!target) return;
        if (target.toLowerCase() === currentUser.toLowerCase()) {
            setError("Non puoi sfidare te stesso!");
            return;
        }

        setError('');
        setIsSearching(true);

        // Simulazione ricerca sui server cloud
        setTimeout(() => {
            setIsSearching(false);
            setInviteSent(target.toUpperCase());
            
            // Dopo 2 secondi simula l'accettazione e avvia
            setTimeout(() => {
                onChallenge(target.toUpperCase());
            }, 2000);
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center h-full w-full bg-black p-8 overflow-y-auto font-['Orbitron']">
            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-12">
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-white font-bold transition-colors"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Menu
                </button>
                <div className="text-center">
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Play With Friends</h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <p className="text-blue-400 text-[10px] font-bold tracking-widest uppercase">Server Globali Connessi</p>
                    </div>
                </div>
                <div className="w-[100px]"></div>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonna Sinistra: Ricerca e Invito */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-900/50 border border-white/10 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden">
                        {isSearching && (
                            <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center">
                                <i className="fas fa-satellite-dish text-4xl text-blue-500 animate-bounce mb-4"></i>
                                <span className="text-white font-black text-xs uppercase tracking-[0.3em]">Ricerca nel Cloud...</span>
                            </div>
                        )}

                        {inviteSent ? (
                            <div className="text-center py-10 animate-in zoom-in duration-300">
                                <i className="fas fa-paper-plane text-5xl text-green-500 mb-4"></i>
                                <h3 className="text-white font-black text-xl uppercase mb-2">Invito Inviato a {inviteSent}!</h3>
                                <p className="text-gray-400 text-sm">In attesa che l'avversario accetti la sfida...</p>
                                <div className="mt-6 flex justify-center">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSearch}>
                                <div className="flex items-center gap-3 mb-6">
                                    <i className="fas fa-globe-europe text-blue-500"></i>
                                    <h3 className="text-white font-black uppercase text-sm tracking-widest">Sfida Globale</h3>
                                </div>
                                <label className="block text-gray-400 text-[10px] uppercase font-bold mb-3 ml-1 tracking-[0.2em]">Inserisci Username di chiunque nel mondo</label>
                                <div className="flex gap-4">
                                    <input 
                                        type="text" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Username Avversario..."
                                        className="flex-1 bg-black border border-gray-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-lg font-bold placeholder:text-gray-800"
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-2xl font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
                                    >
                                        Sfidalo
                                    </button>
                                </div>
                                {error && <p className="text-red-500 text-xs mt-3 font-bold italic"><i className="fas fa-exclamation-triangle mr-1"></i> {error}</p>}
                            </form>
                        )}
                    </div>

                    {/* Local Players */}
                    <div className="bg-gray-900/30 border border-white/5 p-6 rounded-3xl">
                        <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <i className="fas fa-map-marker-alt"></i> Giocatori su questo dispositivo
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {localPlayers.length > 0 ? localPlayers.map((player) => (
                                <div key={player} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                                    <span className="text-white font-black text-xs uppercase tracking-wider">{player}</span>
                                    <button 
                                        onClick={() => onChallenge(player)}
                                        className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                                    >
                                        Sfida
                                    </button>
                                </div>
                            )) : (
                                <div className="col-span-full text-center py-4 text-gray-600 italic text-xs">
                                    Nessun altro profilo trovato localmente.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Colonna Destra: Global Players Online */}
                <div className="bg-gray-900/50 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                    <h3 className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
                        <span>Online Ora (Cloud)</span>
                        <span className="bg-blue-500/10 px-2 py-0.5 rounded text-blue-300">{GLOBAL_PLAYERS.length}</span>
                    </h3>
                    <div className="space-y-4">
                        {GLOBAL_PLAYERS.map((p) => (
                            <div key={p.name} className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-white font-black text-xs uppercase tracking-tighter">{p.name}</span>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                                        p.status === 'Online' ? 'bg-green-900/30 text-green-500' : 
                                        p.status === 'In Gara' ? 'bg-blue-900/30 text-blue-400 animate-pulse' : 
                                        'bg-gray-800 text-gray-500'
                                    }`}>
                                        {p.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-[9px] uppercase font-bold italic">Livello: {p.level}</span>
                                    <button 
                                        disabled={p.status === 'Occupato'}
                                        onClick={() => onChallenge(p.name)}
                                        className={`p-2 rounded-lg transition-all ${
                                            p.status === 'Occupato' 
                                            ? 'text-gray-700 cursor-not-allowed' 
                                            : 'text-blue-400 hover:bg-blue-600 hover:text-white'
                                        }`}
                                    >
                                        <i className="fas fa-play"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center max-w-2xl bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl">
                <p className="text-gray-400 text-xs leading-relaxed uppercase tracking-tighter font-bold">
                    <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                    Grazie al sistema <span className="text-blue-400">Fire-Link</span>, puoi sfidare qualsiasi giocatore inserendo il suo username. 
                    Il sistema caricherà i suoi dati dal Cloud e ti permetterà di competere con i suoi record in tempo reale!
                </p>
            </div>
        </div>
    );
};

export default FriendsLobby;
