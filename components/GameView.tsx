
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
    
    // Admin Cheats State
    const [isGodMode, setIsGodMode] = useState(false);
    const [adminFly, setAdminFly] = useState(false); // Fly Hack
    const [adminSpeed, setAdminSpeed] = useState(1); // Speed Hack (1x, 2x, 3x)
    
    const inputHeld = useRef(false);
    const player = useRef({
        y: 300, dy: 0, width: 40, height: 40, rotation: 0, isGrounded: false,
    });
    
    const world = useRef({
        x: 0,
        obstacles: [] as { x: number, width: number, height: number, type: 'spike' | 'block' | 'gem' }[],
        levelLength: 8000
    });

    const isError666 = skin.id === 's666'; // Error 666 (ex Demon Skull)
    const isAdminGlitch = skin.id === 's8'; // Admin Glitch
    const isOmino = skin.id === 's-man';
    
    const hasAdminAccess = isError666 || isAdminGlitch;

    // Determina se il giocatore può volare (o per skin nativa o per hack)
    const canFlyActive = skin.canFly || adminFly;

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
            // Salto normale solo se NON si vola e si è a terra
            if (!canFlyActive && active && player.current.isGrounded) {
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
                // --- TUTTE LE ALTRE SKIN ---
                // Se vola, ruota leggermente in base alla velocità verticale, altrimenti rotazione classica
                if (canFlyActive) {
                    const flyAngle = Math.max(-0.5, Math.min(0.5, player.current.dy * 0.1));
                    ctx.rotate(flyAngle);
                } else {
                    ctx.rotate(player.current.rotation);
                }
                
                ctx.fillStyle = skin.color;
                
                // Effetti glitch sui colori del player
                if (isAdminGlitch && Math.random() > 0.85) ctx.fillStyle = '#ffffff';
                if (isError666 && Math.random() > 0.9) ctx.fillStyle = '#330000'; // Dark red per horror
                
                ctx.shadowBlur = (isError666 || isGodMode) ? 20 : 10;
                ctx.shadowColor = skin.color;
                if (isError666) ctx.shadowColor = '#ff0000';

                const iconMap: Record<string, string> = { 
                    'fa-square': '\uf0c8',
                    'fa-cat': '\uf6be',
                    'fa-dragon': '\uf6d5',
                    'fa-crown': '\uf521',
                    'fa-running': '\uf70c',
                    'fa-bolt': '\uf0e7',
                    'fa-robot': '\uf544',
                    'fa-sun': '\uf185',
                    'fa-spider': '\uf717',
                    'fa-user-secret': '\uf21b',
                    'fa-skull': '\uf54c',
                    'fa-snowman': '\uf7d0',
                    'fa-sleigh': '\uf7cc',
                    'fa-tree': '\uf1bb',
                    'fa-gift': '\uf06b',
                    'fa-candy-cane': '\uf786'
                };
                
                ctx.font = '900 36px "Font Awesome 6 Free"';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                const iconChar = iconMap[skin.icon] || '\uf0c8'; 
                ctx.fillText(iconChar, 0, 0);
                
                ctx.strokeStyle = 'white';
                if (isError666) ctx.strokeStyle = '#000000'; // Outline nera per Error 666
                ctx.lineWidth = 1.5;
                ctx.strokeText(iconChar, 0, 0);
            }
            ctx.restore();
        };

        const render = () => {
            if (gameStatus !== 'playing') return;

            // Logica Volo: Se active (per skin o admin), inputHeld spinge su
            if (canFlyActive && inputHeld.current) player.current.dy -= 0.85;
            
            player.current.dy += GAME_GRAVITY;
            
            // Cap velocità verticale se si vola
            if (canFlyActive) player.current.dy = Math.max(-7, Math.min(7, player.current.dy));
            
            player.current.y += player.current.dy;

            const groundY = canvas.height - 100;
            if (player.current.y + 40 > groundY) {
                player.current.y = groundY - 40;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                if (!isOmino && !canFlyActive) player.current.rotation += (0.18 * level.speedMultiplier * adminSpeed);
            }

            // Movimento Mondo con Moltiplicatore Admin Speed
            world.current.x += BASE_SPEED * level.speedMultiplier * adminSpeed;
            
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

            // --- RENDERING MAPPA ---
            // Glitch Effect logic
            let shakeX = 0;
            let shakeY = 0;
            
            // Effetto Tremolio: Per Admin Glitch e Error 666 (più forte per 666)
            if (isAdminGlitch && Math.random() > 0.92) {
                shakeX = (Math.random() - 0.5) * 15;
                shakeY = (Math.random() - 0.5) * 15;
            } else if (isError666 && Math.random() > 0.8) {
                shakeX = (Math.random() - 0.5) * 25; // Tremolio Horror più forte
                shakeY = (Math.random() - 0.5) * 25;
            }

            ctx.save();
            ctx.translate(shakeX, shakeY);

            // Sfondo
            ctx.fillStyle = '#0a0a1a';
            if (isAdminGlitch && Math.random() > 0.96) {
                 ctx.fillStyle = Math.random() > 0.5 ? '#001100' : '#1a0a0a'; 
            }
            if (isError666) {
                // Sfondo Horror: Rosso scuro pulsante
                ctx.fillStyle = Math.random() > 0.9 ? '#330000' : '#1a0505';
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Pavimento
            ctx.fillStyle = '#050510';
            if (isError666) ctx.fillStyle = '#1a0000'; // Pavimento rosso sangue
            ctx.fillRect(0, groundY, canvas.width, 100);
            
            ctx.strokeStyle = level.color; 
            if (isError666) ctx.strokeStyle = '#ff0000'; // Linea rossa
            ctx.lineWidth = 3; 
            ctx.strokeRect(0, groundY, canvas.width, 2);

            world.current.obstacles.forEach(o => {
                const ox = o.x - world.current.x;
                if (ox < -100 || ox > canvas.width + 100) return;
                
                // Colori Default
                let obsColorSpike = '#ff4444';
                let obsColorBlock = '#334466';

                // Modifiche Admin Glitch
                if (isAdminGlitch && Math.random() > 0.95) {
                    obsColorSpike = '#00ff41'; // Matrix green
                    obsColorBlock = '#00ff41';
                }

                // Modifiche Error 666 (Horror)
                if (isError666) {
                    obsColorSpike = '#880000'; // Sangue
                    obsColorBlock = '#220000'; // Nero/Rosso
                    // Occasionale distorsione
                    if (Math.random() > 0.9) {
                        obsColorSpike = '#ffffff'; // Flash bianco
                    }
                }

                if (o.type === 'spike') {
                    ctx.fillStyle = obsColorSpike; ctx.beginPath(); ctx.moveTo(ox, groundY); ctx.lineTo(ox+20, groundY-40); ctx.lineTo(ox+40, groundY); ctx.fill();
                    ctx.strokeStyle = isError666 ? '#ff0000' : 'white'; ctx.lineWidth = 1; ctx.stroke();
                } else if (o.type === 'block') {
                    ctx.fillStyle = obsColorBlock; ctx.fillRect(ox, groundY-o.height, o.width, o.height);
                    ctx.strokeStyle = isError666 ? '#ff0000' : '#ffffff55'; ctx.strokeRect(ox, groundY-o.height, o.width, o.height);
                } else if (o.type === 'gem') {
                    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(ox+15, groundY-45, 10, 0, Math.PI*2); ctx.fill();
                    ctx.strokeStyle = 'white'; ctx.stroke();
                }
            });

            // Random visual artifacts
            if (isAdminGlitch && Math.random() > 0.85) {
                ctx.fillStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.2)`;
                ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 200, Math.random() * 20);
            }

            // Horror Overlay per Error 666
            if (isError666) {
                // Vignettatura rossa
                const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.height/4, canvas.width/2, canvas.height/2, canvas.height);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(1, 'rgba(100, 0, 0, 0.4)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Static noise casuale
                if (Math.random() > 0.85) {
                    ctx.fillStyle = `rgba(255, 0, 0, ${Math.random() * 0.1})`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }
            
            drawPlayer(px, player.current.y);

            ctx.restore(); // Restore shake transform
            
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [gameStatus, level, skin, isGodMode, adminFly, adminSpeed, canFlyActive, isAdminGlitch, isError666]);

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
                    onToggleFly={setAdminFly}
                    isFlyMode={adminFly}
                    onSetSpeed={setAdminSpeed}
                    currentSpeed={adminSpeed}
                    restrictedView={isAdminGlitch} // Limita le opzioni se è Admin Glitch
                />
            )}
            
            <div className="absolute top-6 left-6 text-white z-10">
                <div className="text-[10px] uppercase font-bold opacity-50 tracking-widest">Giocatore</div>
                <div className="text-xl font-black italic">{username}</div>
                <div className="text-blue-400 font-bold"><i className="fas fa-gem"></i> {gemsCollected}</div>
            </div>
            <div className="absolute top-6 right-6 text-white text-4xl font-black italic z-10">{Math.floor(progress)}%</div>

            {gameStatus !== 'playing' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-500 p-4">
                    
                    {/* MODALE VITTORIA RIDISEGNATA */}
                    {gameStatus === 'won' && (
                        <div className="relative z-10 w-[90%] max-w-md bg-gray-900 border-2 border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col items-center animate-in zoom-in duration-300 overflow-hidden">
                            {/* Gradiente Sfondo */}
                            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-yellow-500/20 to-transparent pointer-events-none"></div>

                            <h2 className="relative z-10 text-2xl md:text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-6 tracking-tighter drop-shadow-sm text-center break-words w-full">
                                CONGRATULAZIONI!
                            </h2>
                            
                            <div className="flex flex-col items-center justify-center gap-4 mb-6 relative z-10">
                                <i className="fas fa-gem text-5xl md:text-6xl text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-[bounce_2s_infinite]"></i>
                                
                                <div className="text-center">
                                    <div className="text-4xl md:text-5xl font-black text-white italic tracking-wide">+100</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Gemme Base</div>
                                </div>

                                {gemsCollected > 0 && (
                                    <div className="bg-white/10 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-inner">
                                        <i className="fas fa-plus text-green-400 text-xs"></i>
                                        <span className="text-xs font-bold text-gray-200 uppercase tracking-wide">{gemsCollected} Bonus</span>
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => onEnd(true, gemsCollected)} 
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] transition-all transform active:scale-95 border-b-4 border-blue-900 shadow-lg relative z-10 text-sm md:text-base"
                            >
                                CONTINUA
                            </button>
                        </div>
                    )}

                    {/* MODALE SCONFITTA */}
                    {gameStatus === 'lost' && (
                        <div className="relative z-10 w-[90%] max-w-md bg-gray-900 border-2 border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col items-center text-center animate-in zoom-in duration-300">
                            <h2 className="text-4xl md:text-5xl font-black italic mb-6 uppercase tracking-tighter text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] shake-animation break-words w-full">
                                {isError666 ? 'ERROR 666' : 'HAI PERSO!'}
                            </h2>
                            
                            <div className="flex flex-col gap-3 w-full mt-2">
                                <button 
                                    onClick={initLevel} 
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all transform active:scale-95 border-b-4 border-green-900 flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"
                                >
                                    <i className="fas fa-redo"></i> RIPROVA
                                </button>
                                
                                <button 
                                    onClick={() => onEnd(false, 0)} 
                                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-black py-4 rounded-xl uppercase tracking-widest transition-all border border-white/10 text-sm md:text-base"
                                >
                                    MENU
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <canvas 
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight} 
                className="w-full h-full"
                onMouseDown={(e) => { e.preventDefault(); if(gameStatus === 'playing') { inputHeld.current = true; if(!canFlyActive && player.current.isGrounded) { player.current.dy = JUMP_FORCE; player.current.isGrounded = false; } } }}
                onMouseUp={(e) => { e.preventDefault(); inputHeld.current = false; }}
                onTouchStart={(e) => { e.preventDefault(); if(gameStatus === 'playing') { inputHeld.current = true; if(!canFlyActive && player.current.isGrounded) { player.current.dy = JUMP_FORCE; player.current.isGrounded = false; } } }}
                onTouchEnd={(e) => { e.preventDefault(); inputHeld.current = false; }}
            />
        </div>
    );
};

export default GameView;
