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
        <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-red-900 via-black to-orange-900 p-4 overflow-hidden">
            {/* Header compatto */}
            <div className="mb-4 md:mb-10 text-center landscape-logo-mini">
                <h1 className="text-4xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 pixel-font mb-2 drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]">
                    FIRE DASH
                </h1>
                <p className="text-orange-300 font-bold tracking-[0.4em] text-[9px] md:text-sm uppercase landscape-hide">Ultimate Edition</p>
            </div>

            {/* Form Ultra-Ottimizzato */}
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-2 border-white/20 w-full max-w-lg flex flex-col gap-4 md:gap-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] landscape-form-compact">
                
                <div className="text-center relative z-10">
                    <label className="block text-gray-400 text-[10px] md:text-xs uppercase font-black mb-2 tracking-widest">Username Giocatore</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ES: FIREPLAYER_1"
                        className="w-full bg-black/70 border-2 border-gray-700 rounded-2xl px-6 py-3 md:py-6 text-white focus:outline-none focus:border-red-500 transition-all text-sm md:text-2xl font-black text-center placeholder:text-gray-700"
                        required
                    />
                </div>

                <div className="relative z-10">
                    <input 
                        type="password" 
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        placeholder="CODICE SEGRETO (OPZ.)"
                        className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-2 md:py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-mono text-center text-[11px] md:text-lg"
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black py-5 md:py-7 rounded-2xl md:rounded-3xl transition-all transform active:scale-90 shadow-2xl text-xs md:text-2xl uppercase tracking-[0.2em] border-b-8 border-red-900 relative z-10"
                >
                    SALVA ED ENTRA <i className="fas fa-save ml-3"></i>
                </button>
            </form>
            
            <div className="mt-4 md:mt-12 text-center opacity-50 landscape-hide">
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black">
                    POWERED BY <span className="text-orange-500">FIRE DEV TEAM</span>
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;