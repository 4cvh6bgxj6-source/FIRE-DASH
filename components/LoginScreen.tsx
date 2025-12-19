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
            <div className="mb-12 text-center animate-in fade-in slide-in-from-top duration-700">
                <h1 className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 pixel-font mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                    FIRE DASH
                </h1>
                <div className="flex items-center justify-center gap-2">
                    <span className="h-px w-8 bg-orange-500/50"></span>
                    <p className="text-orange-300 font-bold tracking-[0.3em] text-[10px] md:text-sm uppercase">Ultimate Edition</p>
                    <span className="h-px w-8 bg-orange-500/50"></span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 w-full max-w-md flex flex-col gap-6 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2 ml-1 tracking-widest">Username Giocatore</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Es: FirePlayer"
                        className="w-full bg-black/50 border border-gray-600 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500 transition-all text-lg font-bold"
                        required
                    />
                    
                    {/* Box informativo migliorato per leggibilità */}
                    <div className="mt-4 flex items-start gap-3 bg-black/80 border border-emerald-500/50 p-4 rounded-xl shadow-lg backdrop-blur-md">
                        <i className="fas fa-save text-emerald-400 text-sm mt-0.5 animate-pulse"></i>
                        <p className="text-xs text-emerald-200 font-bold uppercase leading-relaxed tracking-wide shadow-black drop-shadow-md">
                            Account Locale: I progressi vengono salvati solo su questo dispositivo.
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2 ml-1 tracking-widest">
                        Codice Segreto <span className="text-xs text-gray-500 normal-case tracking-normal ml-2 opacity-80">(opzionale)</span>
                    </label>
                    <input 
                        type="password" 
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        placeholder="Inserisci codice se ne hai uno..."
                        className="w-full bg-black/50 border border-gray-600 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-mono"
                    />
                    <p className="text-[9px] text-orange-500 mt-2 ml-1 font-black uppercase tracking-[0.2em] italic">I codici sbloccano vantaggi esclusivi istantaneamente.</p>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black py-5 rounded-2xl transition-all transform active:scale-95 shadow-lg shadow-red-500/30 text-lg uppercase tracking-widest border-b-4 border-red-800 relative z-10"
                >
                    ACCEDI AL GIOCO <i className="fas fa-bolt ml-2"></i>
                </button>
            </form>
            
            <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] font-bold">
                    Sviluppato da <span className="text-orange-500">Fire Dev Team</span>
                </p>
                <div className="flex gap-4 text-gray-700">
                    <i className="fab fa-discord hover:text-white transition-colors cursor-pointer"></i>
                    <i className="fab fa-twitter hover:text-white transition-colors cursor-pointer"></i>
                    <i className="fab fa-youtube hover:text-white transition-colors cursor-pointer"></i>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;