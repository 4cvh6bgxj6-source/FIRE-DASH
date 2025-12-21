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
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-red-900 via-black to-orange-900 overflow-y-auto overflow-x-hidden flex items-center justify-center">
            <div className="w-full min-h-full flex flex-col items-center justify-center p-4 py-6 md:py-8 landscape:py-2">
                
                {/* Logo Section - Si rimpicciolisce molto in landscape mobile */}
                <div className="mb-4 md:mb-10 text-center animate-in fade-in slide-in-from-top duration-700 landscape:mb-2 landscape:scale-75 origin-bottom">
                    <h1 className="text-5xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 pixel-font mb-1 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)] leading-tight">
                        FIRE DASH
                    </h1>
                    <p className="text-orange-300 font-bold tracking-[0.3em] text-[10px] md:text-sm uppercase landscape:hidden">Ultimate Edition</p>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/20 w-full max-w-md flex flex-col gap-4 md:gap-6 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500 landscape:p-4 landscape:gap-3 landscape:max-w-xl landscape:flex-row landscape:items-end">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl landscape:hidden"></div>
                    
                    {/* Icona Profilo - Nascosta in landscape molto basso */}
                    <div className="flex flex-col items-center mb-1 landscape:hidden">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-3xl md:text-4xl text-white shadow-xl mb-3 border-2 border-white/20">
                            <i className="fas fa-id-card"></i>
                        </div>
                        <h2 className="text-white font-black text-sm md:text-xl uppercase tracking-widest italic">PROFILO</h2>
                    </div>

                    <div className="w-full flex flex-col gap-4 landscape:gap-2">
                        <div className="relative z-10 text-center w-full">
                            <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest landscape:text-left landscape:mb-0">Username</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Tuo Nome"
                                className="w-full bg-black/60 border-2 border-gray-700 rounded-2xl px-4 py-3 md:px-6 md:py-4 text-white focus:outline-none focus:border-red-500 transition-all text-lg md:text-xl font-bold text-center placeholder:text-gray-600 landscape:py-2 landscape:text-left"
                                required
                            />
                        </div>

                        <div className="relative z-10 w-full">
                            <input 
                                type="password" 
                                value={secretCode}
                                onChange={(e) => setSecretCode(e.target.value)}
                                placeholder="Codice Segreto (Opz.)"
                                className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all font-mono text-center text-xs md:text-sm landscape:py-2 landscape:text-left"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full landscape:w-auto landscape:whitespace-nowrap landscape:px-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black py-4 md:py-5 rounded-2xl transition-all transform active:scale-95 shadow-lg shadow-red-500/30 text-base md:text-lg uppercase tracking-[0.2em] border-b-4 border-red-800 relative z-10 mt-2 landscape:mt-0 landscape:h-[82px]"
                    >
                        <span className="landscape:hidden">SALVA ED ENTRA</span>
                        <span className="hidden landscape:inline"><i className="fas fa-play text-2xl"></i></span>
                        <i className="fas fa-save ml-2 landscape:hidden"></i>
                    </button>
                </form>
                
                <div className="mt-6 text-center pb-4 landscape:hidden">
                    <p className="text-gray-500 text-[9px] uppercase tracking-[0.5em] font-bold">
                        Fire Dev
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;