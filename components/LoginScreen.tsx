
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
                <div className="flex items-center justify-center gap-2">
                    <span className="h-px w-8 bg-orange-500/50"></span>
                    <p className="text-orange-300 font-bold tracking-[0.3em] text-[10px] md:text-sm uppercase">Ultimate Edition</p>
                    <span className="h-px w-8 bg-orange-500/50"></span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 w-full max-w-md flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2 ml-1 tracking-widest">Il Tuo Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nome Giocatore"
                        className="w-full bg-black/50 border border-gray-600 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500 transition-all text-lg font-bold"
                        required
                    />
                    <div className="mt-3 flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                        <i className="fas fa-save text-emerald-400 text-xs mt-0.5"></i>
                        <p className="text-[9px] text-emerald-400 font-bold italic uppercase leading-tight tracking-tighter">
                            ACCOUNT PERSISTENTE: TUTTI I DATI E IL VIP VENGONO SALVATI AUTOMATICAMENTE SU QUESTO DISPOSITIVO.
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2 ml-1 tracking-widest">Codice Segreto (Opzionale)</label>
                    <input 
                        type="password" 
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        placeholder="Inserisci codice..."
                        className="w-full bg-black/50 border border-gray-600 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-mono"
                    />
                    <p className="text-[8px] text-gray-500 mt-2 ml-1">Usa codici come "ADMIN" o "VIP" per sbloccare privilegi istantanei.</p>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black py-5 rounded-2xl transition-all transform active:scale-95 shadow-lg shadow-red-500/30 text-lg uppercase tracking-widest border-b-4 border-red-800 relative z-10"
                >
                    ACCEDI AL CLOUD <i className="fas fa-bolt ml-2"></i>
                </button>
            </form>
            
            <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] font-bold">
                    Sviluppato da <span className="text-orange-500">Fire Dev Team</span>
                </p>
                <div className="flex gap-4 text-gray-700">
                    <i className="fab fa-discord"></i>
                    <i className="fab fa-twitter"></i>
                    <i className="fab fa-youtube"></i>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
