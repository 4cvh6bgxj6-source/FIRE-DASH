
import React from 'react';
import { Level } from '../types';

interface Props {
    levels: Level[];
    onSelect: (level: Level) => void;
    onBack: () => void;
}

const LevelSelect: React.FC<Props> = ({ levels, onSelect, onBack }) => {
    return (
        <div className="flex flex-col items-center h-full w-full bg-black p-8 overflow-y-auto">
            <div className="w-full max-w-4xl flex justify-between items-center mb-12">
                <button 
                    onClick={onBack}
                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-white font-bold transition-colors flex items-center gap-2"
                >
                    <i className="fas fa-arrow-left"></i> Indietro
                </button>
                <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Seleziona Livello</h2>
                <div className="w-[100px]"></div> {/* Spacer */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {levels.map((level) => (
                    <div 
                        key={level.id}
                        onClick={() => onSelect(level)}
                        className="group relative bg-gray-900 border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 transition-all transform hover:-translate-y-1 overflow-hidden"
                    >
                        <div 
                            className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 group-hover:opacity-20 transition-opacity rotate-12"
                            style={{ backgroundColor: level.color }}
                        ></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-black text-white mb-1">{level.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${
                                        level.difficulty === 'Extreme' ? 'bg-red-900 text-red-200' : 
                                        level.difficulty === 'Hard' ? 'bg-orange-900 text-orange-200' : 
                                        'bg-blue-900 text-blue-200'
                                    }`}>
                                        {level.difficulty}
                                    </span>
                                    {level.id === '4' && level.speedMultiplier === 2 && (
                                        <span className="text-[10px] font-black bg-yellow-400 text-black px-2 py-1 rounded shadow-sm animate-pulse">
                                            VIP BENEFIT
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-gray-500 text-xs uppercase font-bold">Velocità</div>
                                <div className={`font-black text-xl ${level.id === '4' && level.speedMultiplier === 2 ? 'text-yellow-400' : 'text-white'}`}>
                                    {level.speedMultiplier}x
                                    {level.id === '4' && level.speedMultiplier === 2 && <span className="text-[10px] line-through text-gray-500 ml-1">4x</span>}
                                </div>
                            </div>
                        </div>

                        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 w-0 group-hover:w-full transition-all duration-700"
                                style={{ backgroundColor: level.color }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Suggestion Section */}
            <div className="mt-12 bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl w-full max-w-4xl flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <i className="fas fa-lightbulb text-white"></i>
                </div>
                <div>
                    <h4 className="text-blue-400 font-black uppercase text-sm mb-1">Suggerimento</h4>
                    <p className="text-gray-400 text-sm italic">"I membri VIP ricevono un vantaggio esclusivo nel livello Darkness Hardcore: la velocità è ridotta a 2x invece di 4x!"</p>
                </div>
            </div>
        </div>
    );
};

export default LevelSelect;
