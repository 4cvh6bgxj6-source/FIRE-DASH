
import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';
import AdminPanel from './AdminPanel';

interface Props {
    level: Level;
    skin: Skin;
    onEnd: (success: boolean, gems: number) => void;
}

const GameView: React.FC<Props> = ({ level, skin, onEnd }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = useState(0);
    const [gemsCollected, setGemsCollected] = useState(0);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isGodMode, setIsGodMode] = useState(false);
    
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

        const handleInput = () => {
            if (player.current.isGrounded) {
                player.current.dy = JUMP_FORCE;
                player.current.isGrounded = false;
            }
        };

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') handleInput();
        });
        canvas.addEventListener('mousedown', handleInput);

        const update = () => {
            if (world.current.finished) return;

            player.current.dy += GAME_GRAVITY;
            player.current.y += player.current.dy;

            const groundY = canvas.height - 100;
            if (player.current.y + player.current.height > groundY) {
                player.current.y = groundY - player.current.height;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.rotation += 0.15 * level.speedMultiplier;
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

                    // COLLISION CHECK: Ignore if God Mode is on
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

            if (skin.isGlitched) {
                if (Math.random() > 0.95) {
                    ctx.fillStyle = `rgba(${Math.random()*50}, 255, ${Math.random()*50}, 0.08)`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                if (Math.random() > 0.9) {
                    ctx.strokeStyle = '#00ff41';
                    ctx.lineWidth = 0.5;
                    const ry = Math.random() * canvas.height;
                    ctx.beginPath();
                    ctx.moveTo(0, ry);
                    ctx.lineTo(canvas.width, ry);
                    ctx.stroke();
                }
            }

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const groundY = canvas.height - 100;
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, groundY, canvas.width, 100);
            ctx.strokeStyle = level.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(canvas.width, groundY);
            ctx.stroke();

            world.current.obstacles.forEach(obs => {
                const obsX = obs.x - world.current.x;
                if (obsX < -100 || obsX > canvas.width + 100) return;

                if (obs.type === 'spike') {
                    ctx.fillStyle = isGodMode ? '#ef444444' : '#ef4444';
                    ctx.beginPath();
                    ctx.moveTo(obsX, groundY);
                    ctx.lineTo(obsX + obs.width / 2, groundY - obs.height);
                    ctx.lineTo(obsX + obs.width, groundY);
                    ctx.fill();
                } else if (obs.type === 'block') {
                    ctx.fillStyle = isGodMode ? '#47556944' : '#475569';
                    ctx.fillRect(obsX, groundY - obs.height, obs.width, obs.height);
                    ctx.strokeStyle = '#fff';
                    ctx.strokeRect(obsX, groundY - obs.height, obs.width, obs.height);
                } else if (obs.type === 'gem') {
                    ctx.fillStyle = '#60a5fa';
                    ctx.beginPath();
                    ctx.arc(obsX + obs.width / 2, groundY - obs.height / 2 - 20, obs.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            ctx.save();
            let pX = 150 + player.current.width / 2;
            let pY = player.current.y + player.current.height / 2;
            
            if (skin.isGlitched) {
                if (Math.random() > 0.75) {
                    pX += (Math.random() - 0.5) * 20;
                    pY += (Math.random() - 0.5) * 20;
                }
            }

            ctx.translate(pX, pY);
            ctx.rotate(player.current.rotation);
            
            if (skin.isGlitched) {
                const glitchColors = ['#00ff41', '#ff0000', '#00ffff', '#ffffff', '#000000', '#f59e0b'];
                ctx.fillStyle = glitchColors[Math.floor(Date.now() / 60) % glitchColors.length];
                
                ctx.globalAlpha = 0.4;
                ctx.fillRect(-player.current.width / 2 - 12, -player.current.height / 2 + 8, player.current.width, player.current.height);
                ctx.globalAlpha = 1.0;
            } else {
                ctx.fillStyle = skin.color;
            }
            
            ctx.fillRect(-player.current.width / 2, -player.current.height / 2, player.current.width, player.current.height);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(-player.current.width / 2, -player.current.height / 2, player.current.width, player.current.height);
            
            ctx.restore();

            if (skin.isGlitched && Math.random() > 0.85) {
                ctx.fillStyle = '#00ff41';
                ctx.font = 'bold 9px monospace';
                const texts = ['MEM_ERR', 'NULL_PTR', 'ADMIN_OVR', '0x7F', 'CORRUPT', 'ROOT_ACCESS'];
                const t = texts[Math.floor(Math.random() * texts.length)];
                ctx.fillText(t, pX + 50, pY + (Math.random() - 0.5) * 60);
            }

            if (skin.isGlitched) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                for (let i = 0; i < canvas.height; i += 4) {
                    ctx.fillRect(0, i, canvas.width, 1);
                }
            }

            update();
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleInput);
        };
    }, [level, skin, onEnd, gemsCollected, isGodMode]);

    const handleInstantWin = () => {
        world.current.x = world.current.levelLength - 100;
    };

    return (
        <div className="h-full w-full relative flex items-center justify-center bg-black">
            {/* Admin Panel Overlay */}
            {isAdminOpen && (
                <AdminPanel 
                    onClose={() => setIsAdminOpen(false)} 
                    onInstantWin={handleInstantWin}
                    onToggleGodMode={setIsGodMode}
                    isGodMode={isGodMode}
                />
            )}

            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10">
                <div className="flex flex-col gap-1">
                    <div className="text-white font-black text-2xl drop-shadow-md uppercase italic tracking-tighter">
                        {skin.isGlitched ? <span className="text-green-400">#ERR_{level.name}</span> : level.name}
                    </div>
                    <div className="text-blue-400 font-bold flex items-center gap-2">
                        <i className="fas fa-gem"></i> {gemsCollected}
                        {isGodMode && <span className="text-red-500 text-[10px] animate-pulse ml-2">[GOD_MODE]</span>}
                    </div>
                </div>
                
                <div className="flex flex-col items-end pointer-events-auto">
                    <div className="text-white font-black text-4xl italic mb-2">{Math.floor(progress)}%</div>
                    
                    {/* ADMIN BUTTON - Visible only with Admin Glitch Skin */}
                    {skin.isGlitched && (
                        <button 
                            onClick={() => setIsAdminOpen(true)}
                            className="bg-green-600 hover:bg-green-500 text-black px-4 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/30 transition-all active:scale-90 mb-2"
                        >
                            <i className="fas fa-user-shield mr-1"></i> Admin Panel
                        </button>
                    )}

                    <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                        <div 
                            className="h-full transition-all duration-100" 
                            style={{ width: `${progress}%`, backgroundColor: skin.isGlitched ? '#00ff41' : level.color }}
                        ></div>
                    </div>
                </div>
            </div>

            <canvas 
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight}
                className={`w-full h-full cursor-pointer ${skin.isGlitched ? 'brightness-110' : ''}`}
            />
            
            <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-black italic tracking-widest text-sm pointer-events-none border ${
                skin.isGlitched ? 'bg-green-600/20 border-green-500 text-green-500' : 'bg-red-600/20 border-red-500 text-red-500'
            }`}>
                {level.speedMultiplier}X SPEED
            </div>

            {skin.isGlitched && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-500/5 to-transparent animate-pulse"></div>
                </div>
            )}
        </div>
    );
};

export default GameView;
