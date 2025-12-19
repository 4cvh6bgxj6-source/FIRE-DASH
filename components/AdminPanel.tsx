
import React from 'react';

interface Props {
    onClose: () => void;
    onInstantWin: () => void;
    onToggleGodMode: (enabled: boolean) => void;
    isGodMode: boolean;
    onToggleFly: (enabled: boolean) => void;
    isFlyMode: boolean;
    onSetSpeed: (speed: number) => void;
    currentSpeed: number;
    restrictedView?: boolean;
}

const AdminPanel: React.FC<Props> = ({ 
    onClose, 
    onInstantWin, 
    onToggleGodMode, 
    isGodMode, 
    onToggleFly, 
    isFlyMode, 
    onSetSpeed, 
    currentSpeed,
    restrictedView = false
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-start bg-black/60 backdrop-blur-sm p-4 md:p-12 font-mono">
            <div className={`w-full max-w-sm bg-black border-2 shadow-[0_0_30px_rgba(34,197,94,0.3)] rounded-lg overflow-hidden animate-in slide-in-from-left duration-300 ${restrictedView ? 'border-green-700 shadow-green-900/20' : 'border-green-500'}`}>
                {/* Header */}
                <div className={`text-black px-4 py-2 flex justify-between items-center font-bold ${restrictedView ? 'bg-green-700' : 'bg-green-500'}`}>
                    <span><i className="fas fa-terminal mr-2"></i>{restrictedView ? 'ADMIN_LITE_PANEL' : 'ADMIN_OVR_PANEL'}</span>
                    <button onClick={onClose} className="hover:bg-black/10 px-2 rounded">X</button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-4">
                    <div className="text-green-500 text-[10px] opacity-70 mb-2">
                        [SYSTEM] TARGET_LOC: MEM_ADR_0xFF<br/>
                        [SYSTEM] AUTH_LEVEL: {restrictedView ? 'RESTRICTED_USER' : 'ROOT_ADMIN'}
                    </div>

                    <button 
                        onClick={() => {
                            onInstantWin();
                            onClose();
                        }}
                        className="w-full bg-green-900/30 border border-green-500 hover:bg-green-500 hover:text-black text-green-500 py-3 rounded transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs"
                    >
                        <i className="fas fa-fast-forward"></i>
                        Arriva alla Fine
                    </button>

                    <button 
                        onClick={() => onToggleGodMode(!isGodMode)}
                        className={`w-full border py-3 rounded transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs ${
                            isGodMode 
                            ? 'bg-red-900/50 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                            : 'bg-green-900/30 border-green-500 text-green-500 hover:bg-green-500 hover:text-black'
                        }`}
                    >
                        <i className={`fas ${isGodMode ? 'fa-shield-alt' : 'fa-skull-crossbones'}`}></i>
                        {isGodMode ? 'Trappole Off' : 'Togli Trappole'}
                    </button>

                    {!restrictedView && (
                        <>
                            <button 
                                onClick={() => onToggleFly(!isFlyMode)}
                                className={`w-full border py-3 rounded transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs ${
                                    isFlyMode 
                                    ? 'bg-blue-900/50 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                    : 'bg-green-900/30 border-green-500 text-green-500 hover:bg-green-500 hover:text-black'
                                }`}
                            >
                                <i className="fas fa-plane"></i>
                                {isFlyMode ? 'Fly Mode ATTIVA' : 'Attiva Fly Mode'}
                            </button>

                            <div className="border border-green-500/50 p-3 rounded bg-green-900/10">
                                <div className="text-[10px] text-green-500 uppercase font-bold mb-2 text-center">Speed Hack Modifier</div>
                                <div className="flex gap-2 justify-between">
                                    {[1, 2, 3].map(speed => (
                                        <button
                                            key={speed}
                                            onClick={() => onSetSpeed(speed)}
                                            className={`flex-1 py-2 rounded text-xs font-black transition-all ${
                                                currentSpeed === speed
                                                ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                                                : 'bg-black border border-green-500/30 text-green-500 hover:border-green-500'
                                            }`}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="text-[9px] text-green-700 mt-2 text-center">
                        BYPASS_MODE: ENABLED // OVERRIDE_LVL: 5
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
