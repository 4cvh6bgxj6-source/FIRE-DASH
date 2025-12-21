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
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-red-900 via-black to-orange-900 overflow-y-auto overflow-x-hidden">
            <div className="min-h-full flex flex-col items-center justify-center p-4 py-8">
                <div className="mb-6 md:mb-10 text-center animate-in fade-in slide-in-from-top duration-700">
                    <h1 className="text-5xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 pixel-font mb-2 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)] leading-tight">
                        FIRE DASH
                    </h1>
                    <p className="text-orange-300 font-bold tracking-[0.3em] text-[10px] md:text-sm uppercase">Ultimate Edition</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/20 w-full max-w-md flex flex-col gap-5 md:gap-6 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                    
                    <div className="flex flex-col items-center mb-1">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-3xl md:text-4xl text-white shadow-xl mb-3 border-2 border-white/20">
                            <i className="fas fa-id-card"></i>
                        </div>
                        <h2 className="text-white font-black text-sm md:text-xl uppercase tracking-widest italic">PROFILO GIOCATORE</h2>
                    </div>

                    <div className="relative z-10 text-center">
                        <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2 tracking-widest">Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Il tuo nome..."
                            className="w-full bg-black/60 border-2 border-gray-700 rounded-2xl px-4 py-3 md:px-6 md:py-4 text-white focus:outline-none focus:border-red-500 transition-all text-lg md:text-xl font-bold text-center placeholder:text-gray-600"
                            required
                        />
                    </div>

                    <div className="relative z-10">
                        <input 
                            type="password" 
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            placeholder="Codice Segreto (Opzionale)"
                            className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all font-mono text-center text-xs md:text-sm"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black py-4 md:py-5 rounded-2xl transition-all transform active:scale-95 shadow-lg shadow-red-500/30 text-base md:text-lg uppercase tracking-[0.2em] border-b-4 border-red-800 relative z-10 mt-2"
                    >
                        SALVA ED ENTRA <i className="fas fa-save ml-2"></i>
                    </button>
                </form>
                
                <div className="mt-8 text-center pb-4">
                    <p className="text-gray-500 text-[9px] uppercase tracking-[0.5em] font-bold">
                        Powered by <span className="text-orange-500">Fire Dev</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;