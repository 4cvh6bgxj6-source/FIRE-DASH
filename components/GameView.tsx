
import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';
import AdminPanel from './AdminPanel';

interface Particle {
    x: number; y: number; vx: number; vy: number; life: number; color: string; size: number;
}

interface Props {
    level: Level;
    skin: Skin;
    username: string;
    onEnd: (success: boolean, gems: number) => void;
}

const GameView: React.FC<Props> = ({ level, skin, username, onEnd }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = useState(0);
    const [gemsCollected, setGemsCollected] = useState(0);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [isGodMode, setIsGodMode] = useState(false);
    
    const inputHeld = useRef(false);
    const player = useRef({
        y: 300, dy: 0, width: 40, height: 40, rotation: 0, isGrounded: false,
    });
    
    const world = useRef({
        x: 0,
        obstacles: [] as { x: number, width: number, height: number, type: 'spike' | 'block' | 'gem' }[],
        levelLength: 8000
    });

    const isError666 = skin.id === 's666';
    const isAdminGlitch = skin.id === 's8';
    const isOmino = skin.id === 's-man';
    
    const hasAdminAccess = isError666 || isAdminGlitch;

    const initLevel = () => {
        const obstacles: typeof world.current.obstacles = [];
        const levelLength = 8000 + (parseInt(level.id) * 2000); 
        world.current.levelLength = levelLength;
        world.current.x = 0;
        player.current.y = 300;
        player.current.dy = 0;
        player.current.rotation = 0;
        const spacing = 450 / level.speedMultiplier;
        for (let i = 1200; i < levelLength - 1000; i += spacing + (Math.random() * 250)) {
            const rand = Math.random();
            if (rand < 0.45) obstacles.push({ x: i, width: 40, height: 40, type: 'spike' });
            else if (rand < 0.75) obstacles.push({ x: i, width: 60, height: 60, type: 'block' });
            else obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
        }
        world.current.obstacles = obstacles;
        setGemsCollected(0);
        setProgress(0);
        setGameStatus('playing');
    };

    useEffect(() => { initLevel(); }, [level.id, skin.id]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;

        const handleInput = (active: boolean) => {
            if (gameStatus !== 'playing') return;
            inputHeld.current = active;
            if (!skin.canFly && active && player.current.isGrounded) {
                player.current.dy = JUMP_FORCE;
                player.current.isGrounded = false;
            }
        };

        const onKey = (e: KeyboardEvent) => { if(e.code === 'Space' || e.code === 'ArrowUp') handleInput(true); };
        const onKeyUp = (e: KeyboardEvent) => { if(e.code === 'Space' || e.code === 'ArrowUp') handleInput(false); };
        
        window.addEventListener('keydown', onKey);
        window.addEventListener('keyup', onKeyUp);
        
        const drawPlayer = (pX: number, pY: number) => {
            ctx.save();
            ctx.translate(pX + 20, pY + 20);
            
            if (isOmino) {
                // --- OMINO BIANCO (STICKMAN) ---
                // Disegno manuale per l'omino che corre
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                
                const jumpProgress = player.current.isGrounded ? 0 : Math.min(1, Math.abs(player.current.dy / JUMP_FORCE));
                
                // Testa
                ctx.beginPath(); ctx.arc(0, -18, 7, 0, Math.PI * 2); ctx.stroke();
                // Corpo
                ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(0, 5); ctx.stroke();
                // Braccia
                const armAngle = player.current.isGrounded ? 0 : (jumpProgress * Math.PI / 1.5);
                ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(-12, -5 - (armAngle * 5)); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(12, -5 - (armAngle * 5)); ctx.stroke();
                // Gambe
                const legSpread = player.current.isGrounded ? 6 : 10 + (jumpProgress * 5);
                ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(-legSpread, 18); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(legSpread, 18); ctx.stroke();
            } else {
                // --- TUTTE LE ALTRE SKIN (ICONE) ---
                if (!skin.canFly) ctx.rotate(player.current.rotation);
                
                ctx.fillStyle = skin.color;
                // Effetto glitch per Admin e 666
                if (isAdminGlitch && Math.random() > 0.85) ctx.fillStyle = '#ffffff';
                if (isError666 && Math.random() > 0.9) ctx.fillStyle = '#ff0000';
                
                ctx.shadowBlur = (isError666 || isGodMode) ? 20 : 10;
                ctx.shadowColor = skin.color;

                // Mappa Completa Icone FontAwesome 6 (Solid)
                // Deve corrispondere a 'constants.ts'
                const iconMap: Record<string, string> = { 
                    'fa-square': '\uf0c8',      // s1 - Cubo
                    'fa-cat': '\uf6be',         // s2 - Gatto
                    'fa-dragon': '\uf6d5',      // s3 - Drago
                    'fa-crown': '\uf521',       // s4 - Corona (King)
                    'fa-running': '\uf70c',     // s-man (fallback icon)
                    'fa-bolt': '\uf0e7',        // s6 - Fulmine
                    'fa-robot': '\uf544',       // s9 - Robot
                    'fa-sun': '\uf185',         // s7 - Sole
                    'fa-spider': '\uf717',      // s10 - Ragno
                    'fa-user-secret': '\uf21b', // s8 - ADMIN GLITCH (Hacker)
                    'fa-skull': '\uf54c'        // s666 - Teschio
                };
                
                // IMPORTANTE: '900' è il font-weight necessario per le icone Solid
                ctx.font = '900 36px "Font Awesome 6 Free"';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                const iconChar = iconMap[skin.icon] || '\uf0c8'; // Default quadrato se non trova icona
                
                // Disegna l'icona piena
                ctx.fillText(iconChar, 0, 0);
                
                // Disegna il bordo bianco
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1.5;
                ctx.strokeText(iconChar, 0, 0);
            }
            ctx.restore();
        };

        const render = () => {
            if (gameStatus !== 'playing') return;

            if (skin.canFly && inputHeld.current) player.current.dy -= 0.85;
            player.current.dy += GAME_GRAVITY;
            if (skin.canFly) player.current.dy = Math.max(-7, Math.min(7, player.current.dy));
            player.current.y += player.current.dy;

            const groundY = canvas.height - 100;
            if (player.current.y + 40 > groundY) {
                player.current.y = groundY - 40;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                if (!isOmino) player.current.rotation += 0.18 * level.speedMultiplier;
            }

            world.current.x += BASE_SPEED * level.speedMultiplier;
            const prog = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(prog);
            if (prog >= 100) setGameStatus('won');

            const px = 150;
            const obstacles = world.current.obstacles;
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                const ox = obs.x - world.current.x;
                if (ox < px - 60 || ox > px + 60) continue;
                
                const hitMargin = 6;
                const collided = px + hitMargin < ox + obs.width - hitMargin && 
                               px + 40 - hitMargin > ox + hitMargin && 
                               player.current.y + hitMargin < groundY - obs.height + obs.height - hitMargin && 
                               player.current.y + 40 - hitMargin > groundY - obs.height + hitMargin;
                
                if (collided) {
                    if (obs.type === 'gem') { 
                        setGemsCollected(g => g + 10); 
                        obstacles.splice(i, 1); 
                    } else if (!isGodMode) {
                        setGameStatus('lost');
                    }
                }
            }

            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#050510';
            ctx.fillRect(0, groundY, canvas.width, 100);
            ctx.strokeStyle = level.color; ctx.lineWidth = 3; ctx.strokeRect(0, groundY, canvas.width, 2);

            world.current.obstacles.forEach(o => {
                const ox = o.x - world.current.x;
                if (ox < -100 || ox > canvas.width + 100) return;
                
                if (o.type === 'spike') {
                    ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.moveTo(ox, groundY); ctx.lineTo(ox+20, groundY-40); ctx.lineTo(ox+40, groundY); ctx.fill();
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.stroke();
                } else if (o.type === 'block') {
                    ctx.fillStyle = '#334466'; ctx.fillRect(ox, groundY-o.height, o.width, o.height);
                    ctx.strokeStyle = '#ffffff55'; ctx.strokeRect(ox, groundY-o.height, o.width, o.height);
                } else if (o.type === 'gem') {
                    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(ox+15, groundY-45, 10, 0, Math.PI*2); ctx.fill();
                    ctx.strokeStyle = 'white'; ctx.stroke();
                }
            });

            drawPlayer(px, player.current.y);
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [gameStatus, level, skin, isGodMode]);

    return (
        <div className="h-full w-full relative bg-black overflow-hidden">
            {hasAdminAccess && (
                <button 
                    onClick={() => setShowAdminPanel(true)} 
                    className={`fixed top-20 left-6 z-50 bg-black/80 border w-12 h-12 rounded-full shadow-lg transition-all active:scale-90 ${isAdminGlitch ? 'border-green-500 text-green-500 shadow-green-500/20' : 'border-red-500 text-red-500 shadow-red-500/20'}`}
                >
                    <i className="fas fa-terminal"></i>
                </button>
            )}

            {showAdminPanel && (
                <AdminPanel 
                    onClose={() => setShowAdminPanel(false)} 
                    onInstantWin={() => { setGameStatus('won'); setShowAdminPanel(false); }} 
                    onToggleGodMode={setIsGodMode} 
                    isGodMode={isGodMode} 
                />
            )}
            
            <div className="absolute top-6 left-6 text-white z-10">
                <div className="text-[10px] uppercase font-bold opacity-50 tracking-widest">Giocatore</div>
                <div className="text-xl font-black italic">{username}</div>
                <div className="text-blue-400 font-bold"><i className="fas fa-gem"></i> {gemsCollected}</div>
            </div>
            <div className="absolute top-6 right-6 text-white text-4xl font-black italic z-10">{Math.floor(progress)}%</div>

            {gameStatus !== 'playing' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="text-center p-10 bg-gray-900 border-2 border-white/10 rounded-[3rem] shadow-2xl max-w-sm w-full mx-4 relative overflow-hidden">
                        
                        {/* SCHERMATA VITTORIA */}
                        {gameStatus === 'won' && (
                            <>
                                <h2 className="text-4xl font-black italic mb-2 uppercase tracking-tighter text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                                    CONGRATULAZIONI!
                                </h2>
                                
                                <div className="my-8 flex flex-col items-center gap-2 animate-bounce">
                                    <i className="fas fa-gem text-5xl text-blue-400 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]"></i>
                                    <span className="text-3xl font-black text-white italic">+100 GEMME</span>
                                    {gemsCollected > 0 && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PIÙ {gemsCollected} RACCOLTE</span>}
                                </div>
                                
                                <button 
                                    onClick={() => onEnd(true, gemsCollected)} 
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all border-b-4 border-blue-900 shadow-xl"
                                >
                                    MENU
                                </button>
                            </>
                        )}

                        {/* SCHERMATA SCONFITTA */}
                        {gameStatus === 'lost' && (
                            <>
                                <h2 className="text-5xl font-black italic mb-6 uppercase tracking-tighter text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] shake-animation">
                                    HAI PERSO!
                                </h2>
                                
                                <div className="flex flex-col gap-4 mt-4">
                                    <button 
                                        onClick={initLevel} 
                                        className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all transform active:scale-95 border-b-4 border-green-900 flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <i className="fas fa-redo"></i> RIPROVA
                                    </button>
                                    
                                    <button 
                                        onClick={() => onEnd(false, 0)} 
                                        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-black py-4 rounded-2xl uppercase tracking-widest transition-all border border-white/10"
                                    >
                                        MENU
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            <canvas 
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight} 
                className="w-full h-full"
                onMouseDown={(e) => { e.preventDefault(); if(gameStatus === 'playing') { inputHeld.current = true; if(!skin.canFly && player.current.isGrounded) { player.current.dy = JUMP_FORCE; player.current.isGrounded = false; } } }}
                onMouseUp={(e) => { e.preventDefault(); inputHeld.current = false; }}
                onTouchStart={(e) => { e.preventDefault(); if(gameStatus === 'playing') { inputHeld.current = true; if(!skin.canFly && player.current.isGrounded) { player.current.dy = JUMP_FORCE; player.current.isGrounded = false; } } }}
                onTouchEnd={(e) => { e.preventDefault(); inputHeld.current = false; }}
            />
        </div>
    );
};

export default GameView;
