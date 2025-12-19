
import React from 'react';

interface Props {
    onClose: () => void;
    onInstantWin: () => void;
    onToggleGodMode: (enabled: boolean) => void;
    isGodMode: boolean;
}

const AdminPanel: React.FC<Props> = ({ onClose, onInstantWin, onToggleGodMode, isGodMode }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-start bg-black/60 backdrop-blur-sm p-4 md:p-12 font-mono">
            <div className="w-full max-w-sm bg-black border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] rounded-lg overflow-hidden animate-in slide-in-from-left duration-300">
                {/* Header */}
                <div className="bg-green-500 text-black px-4 py-2 flex justify-between items-center font-bold">
                    <span><i className="fas fa-terminal mr-2"></i>ADMIN_OVR_PANEL</span>
                    <button onClick={onClose} className="hover:bg-black/10 px-2 rounded">X</button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-6">
                    <div className="text-green-500 text-[10px] opacity-70 mb-2">
                        [SYSTEM] TARGET_LOC: MEM_ADR_0xFF<br/>
                        [SYSTEM] AUTH_LEVEL: ROOT_ADMIN
                    </div>

                    <button 
                        onClick={() => {
                            onInstantWin();
                            onClose();
                        }}
                        className="w-full bg-green-900/30 border border-green-500 hover:bg-green-500 hover:text-black text-green-500 py-4 rounded transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs"
                    >
                        <i className="fas fa-fast-forward"></i>
                        Arriva alla Fine
                    </button>

                    <button 
                        onClick={() => onToggleGodMode(!isGodMode)}
                        className={`w-full border py-4 rounded transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs ${
                            isGodMode 
                            ? 'bg-red-900/50 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                            : 'bg-green-900/30 border-green-500 text-green-500 hover:bg-green-500 hover:text-black'
                        }`}
                    >
                        <i className={`fas ${isGodMode ? 'fa-shield-alt' : 'fa-skull-crossbones'}`}></i>
                        {isGodMode ? 'Trappole Off' : 'Togli Trappole'}
                    </button>

                    <div className="text-[9px] text-green-700 mt-4 text-center">
                        BYPASS_MODE: ENABLED // OVERRIDE_LVL: 5
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
