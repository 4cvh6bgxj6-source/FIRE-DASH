
import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';
import AdminPanel from './AdminPanel';

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
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isGodMode, setIsGodMode] = useState(false);
    
    const inputHeld = useRef(false);
    const player = useRef({
        y: 300,
        dy: 0,
        width: 40,
        height: 40,
        rotation: 0,
        isGrounded: false
    });
    
    const world = useRef({
        x: 0,
        obstacles: [] as { x: number, width: number, height: number, type: 'spike' | 'block' | 'gem' }[],
        finished: false,
        levelLength: 6000
    });

    useEffect(() => {
        const obstacles: typeof world.current.obstacles = [];
        const levelLength = 6000;
        world.current.levelLength = levelLength;
        
        for (let i = 800; i < levelLength; i += (450 / level.speedMultiplier)) {
            const rand = Math.random();
            if (rand < 0.45) {
                obstacles.push({ x: i, width: 40, height: 40, type: 'spike' });
            } else if (rand < 0.75) {
                obstacles.push({ x: i, width: 60, height: 60, type: 'block' });
                if (Math.random() > 0.4) {
                    obstacles.push({ x: i + 15, width: 30, height: 30, type: 'gem' });
                }
            } else {
                 obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
            }
        }
        world.current.obstacles = obstacles;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                inputHeld.current = true;
                if (!skin.canFly && player.current.isGrounded) {
                    player.current.dy = JUMP_FORCE;
                    player.current.isGrounded = false;
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                inputHeld.current = false;
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('button')) return;
            inputHeld.current = true;
            if (!skin.canFly && player.current.isGrounded) {
                player.current.dy = JUMP_FORCE;
                player.current.isGrounded = false;
            }
        };

        const handleMouseUp = () => {
            inputHeld.current = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        const update = () => {
            if (world.current.finished) return;

            // Meccanica Volo ERROR 666
            if (skin.canFly && inputHeld.current) {
                player.current.dy -= 1.6; // Spinta verso l'alto
            }

            player.current.dy += GAME_GRAVITY;
            
            if (skin.canFly) {
                // Controllo velocità di volo per non sfrecciare via troppo velocemente
                player.current.dy = Math.max(-12, Math.min(8, player.current.dy));
            }

            player.current.y += player.current.dy;
            const groundY = canvas.height - 100;
            
            // Rimbalzo o stop al soffitto
            if (player.current.y < 0) {
                player.current.y = 0;
                player.current.dy = 0.5;
            }

            if (player.current.y + player.current.height > groundY) {
                player.current.y = groundY - player.current.height;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                // Durante il volo la rotazione è più frenetica
                player.current.rotation += (skin.canFly && inputHeld.current ? 0.3 : 0.15) * level.speedMultiplier;
                player.current.isGrounded = false;
            }

            world.current.x += BASE_SPEED * level.speedMultiplier;
            const currentProgress = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(currentProgress);

            if (currentProgress >= 100) {
                world.current.finished = true;
                onEnd(true, gemsCollected);
            }

            const px = 150;
            for (let i = 0; i < world.current.obstacles.length; i++) {
                const obs = world.current.obstacles[i];
                const obsX = obs.x - world.current.x;

                if (
                    px < obsX + obs.width &&
                    px + player.current.width > obsX &&
                    player.current.y < groundY - 0 + obs.height &&
                    player.current.y + player.current.height > groundY - obs.height
                ) {
                    if (obs.type === 'gem') {
                        setGemsCollected(prev => prev + 5);
                        world.current.obstacles.splice(i, 1);
                        continue;
                    }
                    if (!isGodMode) {
                        world.current.finished = true;
                        onEnd(false, gemsCollected);
                        return;
                    }
                }
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Background speciale per ERROR 666
            if (skin.id === 's666') {
                ctx.fillStyle = '#050000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                if (Math.random() > 0.8) {
                    ctx.fillStyle = `rgba(150, 0, 0, ${Math.random() * 0.15})`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            } else {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const groundY = canvas.height - 100;
            ctx.fillStyle = skin.id === 's666' ? '#1a0000' : '#1e293b';
            ctx.fillRect(0, groundY, canvas.width, 100);
            ctx.strokeStyle = skin.id === 's666' ? '#ff0000' : level.color;
            ctx.lineWidth = 4;
            ctx.strokeRect(0, groundY, canvas.width, 1);

            world.current.obstacles.forEach(obs => {
                const obsX = obs.x - world.current.x;
                if (obsX < -100 || obsX > canvas.width + 100) return;

                if (obs.type === 'spike') {
                    ctx.fillStyle = isGodMode ? '#ef444444' : (skin.id === 's666' ? '#990000' : '#ef4444');
                    ctx.beginPath();
                    ctx.moveTo(obsX, groundY);
                    ctx.lineTo(obsX + obs.width / 2, groundY - obs.height);
                    ctx.lineTo(obsX + obs.width, groundY);
                    ctx.fill();
                    if (skin.id === 's666') {
                        ctx.strokeStyle = '#ff0000';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                } else if (obs.type === 'block') {
                    ctx.fillStyle = isGodMode ? '#47556944' : '#475569';
                    ctx.fillRect(obsX, groundY - obs.height, obs.width, obs.height);
                    ctx.strokeStyle = skin.id === 's666' ? '#ff0000' : '#fff';
                    ctx.strokeRect(obsX, groundY - obs.height, obs.width, obs.height);
                } else if (obs.type === 'gem') {
                    ctx.fillStyle = skin.id === 's666' ? '#ff0000' : '#60a5fa';
                    ctx.beginPath();
                    ctx.arc(obsX + obs.width / 2, groundY - obs.height / 2 - 20, obs.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                    if (skin.id === 's666') {
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = 'red';
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }
            });

            ctx.save();
            let pX = 150 + player.current.width / 2;
            let pY = player.current.y + player.current.height / 2;
            
            if (skin.isGlitched) {
                if (Math.random() > 0.6) {
                    pX += (Math.random() - 0.5) * (skin.id === 's666' ? 45 : 20);
                    pY += (Math.random() - 0.5) * (skin.id === 's666' ? 45 : 20);
                }
            }

            ctx.translate(pX, pY);
            ctx.rotate(player.current.rotation);
            
            if (skin.id === 's666') {
                const colors = ['#ff0000', '#000000', '#660000', '#ffffff'];
                ctx.fillStyle = colors[Math.floor(Date.now() / 30) % colors.length];
                // Scie di glitch
                if (Math.random() > 0.5) {
                    ctx.fillRect(-player.current.width, -player.current.height / 4, player.current.width * 2, 2);
                }
            } else if (skin.isGlitched) {
                const colors = ['#00ff41', '#ff0000', '#ffffff'];
                ctx.fillStyle = colors[Math.floor(Date.now() / 60) % colors.length];
            } else {
                ctx.fillStyle = skin.color;
            }
            
            ctx.fillRect(-player.current.width / 2, -player.current.height / 2, player.current.width, player.current.height);
            ctx.strokeStyle = skin.id === 's666' ? '#000' : '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(-player.current.width / 2, -player.current.height / 2, player.current.width, player.current.height);
            ctx.restore();

            if (skin.id === 's666' && Math.random() > 0.92) {
                ctx.fillStyle = 'red';
                ctx.font = 'bold 20px Orbitron';
                ctx.fillText('CRITICAL_ERROR', Math.random() * canvas.width, Math.random() * canvas.height);
            }

            update();
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [level, skin, onEnd, gemsCollected, isGodMode]);

    return (
        <div className="h-full w-full relative flex items-center justify-center bg-black overflow-hidden select-none">
            {isAdminOpen && (
                <AdminPanel 
                    onClose={() => setIsAdminOpen(false)} 
                    onInstantWin={() => { world.current.x = world.current.levelLength - 100; }}
                    onToggleGodMode={setIsGodMode}
                    isGodMode={isGodMode}
                />
            )}

            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs border border-white/10">
                            <i className="fas fa-user text-gray-400"></i>
                        </div>
                        <span className="text-white font-bold text-sm tracking-widest uppercase opacity-70">{username}</span>
                    </div>

                    <div className={`text-white font-black text-3xl drop-shadow-lg uppercase italic tracking-tighter flex items-center gap-3 ${skin.id === 's666' ? 'text-red-600 animate-pulse' : ''}`}>
                        {skin.id === 's666' ? 'ERROR_666' : (skin.isGlitched ? <span className="text-green-500">#GLITCH_MODE</span> : level.name)}
                    </div>
                    
                    <div className="text-blue-400 font-bold flex items-center gap-3 text-lg">
                        <i className="fas fa-gem animate-bounce"></i> {gemsCollected}
                        {isGodMode && <span className="text-red-500 text-xs font-black px-2 py-0.5 bg-red-950/50 rounded border border-red-500 animate-pulse">GOD_MODE</span>}
                        {skin.canFly && <span className="text-yellow-400 text-xs font-black px-2 py-0.5 bg-yellow-950/50 rounded border border-yellow-500">FLY_ENABLED</span>}
                    </div>

                    {skin.isGlitched && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsAdminOpen(true); }}
                            className={`mt-2 w-fit px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-90 flex items-center gap-2 ${
                                skin.id === 's666' ? 'bg-red-700 text-white shadow-red-500/40 border border-red-500' : 'bg-green-600 text-black shadow-green-500/40'
                            }`}
                        >
                            <i className="fas fa-terminal"></i> Admin Console
                        </button>
                    )}
                </div>
                
                <div className="flex flex-col items-end pointer-events-none">
                    <div className={`text-white font-black text-5xl italic mb-3 drop-shadow-2xl ${skin.id === 's666' ? 'text-red-600' : ''}`}>
                        {Math.floor(progress)}%
                    </div>
                </div>
            </div>

            <canvas 
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight}
                className={`w-full h-full cursor-pointer ${skin.id === 's666' ? 'grayscale-[0.5] contrast-[1.5]' : ''}`}
            />

            {skin.id === 's666' && (
                <div className="absolute inset-0 pointer-events-none border-[15px] border-red-900/10 animate-pulse"></div>
            )}
        </div>
    );
};

export default GameView;
