
import React, { useState } from 'react';

interface Props {
    onLogin: (username: string, secretCode: string) => void;
}

const LoginScreen: React.FC<Props> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [secretCode, setSecretCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;
        onLogin(username, secretCode);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-red-900 via-black to-orange-900 p-4">
            <div className="mb-12 text-center">
                <h1 className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 pixel-font mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                    FIRE DASH
                </h1>
                <p className="text-orange-300 font-bold tracking-[0.3em] text-sm uppercase">Ultimate Edition</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 w-full max-w-md flex flex-col gap-6">
                <div>
                    <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">Il Tuo Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nome Giocatore"
                        className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                        required
                    />
                    <p className="text-[10px] text-orange-400 mt-2 font-bold italic uppercase leading-tight">
                        USA IL TUO USERNAME TUTTI I GIORNI COSI I DATI SI SALVANO
                    </p>
                </div>

                <div>
                    <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">Codice Segreto (Opzionale)</label>
                    <input 
                        type="password" 
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        placeholder="Inserisci codice..."
                        className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-red-500/30 text-lg uppercase tracking-widest"
                >
                    Avanti <i className="fas fa-chevron-right ml-2"></i>
                </button>
            </form>
            
            <p className="mt-8 text-gray-500 text-sm">
                Sviluppato da <span className="text-gray-400 font-bold">Fire Dev Team</span>
            </p>
        </div>
    );
};

export default LoginScreen;
