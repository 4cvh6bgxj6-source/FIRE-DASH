
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
    
    const particles = useRef<Particle[]>([]);
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
    
    // L'Admin Panel appare SOLO se hai una di queste due skin selezionate
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
            if (rand < 0.4) obstacles.push({ x: i, width: 40, height: 40, type: 'spike' });
            else if (rand < 0.7) obstacles.push({ x: i, width: 60, height: 60, type: 'block' });
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
        const ctx = canvas.getContext('2d');
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
        canvas.ontouchstart = (e) => { e.preventDefault(); handleInput(true); };
        canvas.ontouchend = (e) => { e.preventDefault(); handleInput(false); };

        const drawPlayer = (pX: number, pY: number) => {
            ctx.save();
            ctx.translate(pX + 20, pY + 20);
            
            if (isOmino) {
                // DISEGNO STICKMAN STILIZZATO
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                // Testa
                ctx.beginPath(); ctx.arc(0, -15, 8, 0, Math.PI * 2); ctx.stroke();
                // Tronco
                ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 10); ctx.stroke();
                // Braccia
                const armAnim = player.current.isGrounded ? 0 : Math.sin(Date.now()/100) * 10;
                ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(-15, - armAnim); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(15, - armAnim); ctx.stroke();
                // Gambe
                const legOffset = player.current.isGrounded ? 8 : 12;
                ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(-legOffset, 20); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(legOffset, 20); ctx.stroke();
            } else {
                if (!skin.canFly) ctx.rotate(player.current.rotation);
                
                ctx.fillStyle = skin.color;
                if (isAdminGlitch && Math.random() > 0.8) ctx.fillStyle = '#000000';
                
                ctx.shadowBlur = (isError666 || isGodMode) ? 25 : 10;
                ctx.shadowColor = skin.color;

                const iconMap: any = { 
                    'fa-square': '\uf0c8', 'fa-cube': '\uf1b2', 'fa-diamond': '\uf219', 
                    'fa-crown': '\uf44b', 'fa-bolt': '\uf0e7', 'fa-terminal': '\uf120', 
                    'fa-sun': '\uf185', 'fa-fire': '\uf06d', 'fa-user-secret': '\uf21b', 
                    'fa-skull': '\uf54c' 
                };
                
                ctx.font = '40px "Font Awesome 6 Free"';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(iconMap[skin.icon] || '\uf0c8', 0, 0);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1.5;
                ctx.strokeText(iconMap[skin.icon] || '\uf0c8', 0, 0);
            }
            ctx.restore();
        };

        const render = () => {
            if (gameStatus !== 'playing') return;

            if (skin.canFly && inputHeld.current) player.current.dy -= 1.0;
            player.current.dy += GAME_GRAVITY;
            if (skin.canFly) player.current.dy = Math.max(-8, Math.min(8, player.current.dy));
            player.current.y += player.current.dy;

            const groundY = canvas.height - 100;
            if (player.current.y + 40 > groundY) {
                player.current.y = groundY - 40;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                if (!isOmino) player.current.rotation += 0.2 * level.speedMultiplier;
            }

            world.current.x += BASE_SPEED * level.speedMultiplier;
            const prog = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(prog);
            if (prog >= 100) setGameStatus('won');

            const px = 150;
            world.current.obstacles.forEach((obs, i) => {
                const ox = obs.x - world.current.x;
                if (ox < px - 60 || ox > px + 60) return;
                const hitMargin = 5;
                const collided = px + hitMargin < ox + obs.width - hitMargin && 
                               px + 40 - hitMargin > ox + hitMargin && 
                               player.current.y + hitMargin < groundY - obs.height + obs.height - hitMargin && 
                               player.current.y + 40 - hitMargin > groundY - obs.height + hitMargin;
                
                if (collided) {
                    if (obs.type === 'gem') { setGemsCollected(g => g + 10); world.current.obstacles.splice(i, 1); }
                    else if (!isGodMode) setGameStatus('lost');
                }
            });

            ctx.fillStyle = isError666 ? '#1a0000' : '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = isError666 ? '#000000' : '#020617';
            ctx.fillRect(0, groundY, canvas.width, 100);
            ctx.strokeStyle = level.color; ctx.lineWidth = 4; ctx.strokeRect(0, groundY, canvas.width, 2);

            world.current.obstacles.forEach(o => {
                const ox = o.x - world.current.x;
                if (o.type === 'spike') {
                    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(ox, groundY); ctx.lineTo(ox+20, groundY-40); ctx.lineTo(ox+40, groundY); ctx.fill();
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.stroke();
                } else if (o.type === 'block') {
                    ctx.fillStyle = '#475569'; ctx.fillRect(ox, groundY-o.height, o.width, o.height);
                    ctx.strokeStyle = 'white'; ctx.strokeRect(ox, groundY-o.height, o.width, o.height);
                } else if (o.type === 'gem') {
                    ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(ox+15, groundY-40, 8, 0, Math.PI*2); ctx.fill();
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
                <div className="text-[10px] uppercase font-bold opacity-50">Player</div>
                <div className="text-xl font-black italic">{username}</div>
                <div className="text-blue-400 font-bold"><i className="fas fa-gem"></i> {gemsCollected}</div>
            </div>
            <div className="absolute top-6 right-6 text-white text-4xl font-black italic z-10">{Math.floor(progress)}%</div>

            {gameStatus !== 'playing' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="text-center p-10 bg-gray-900 border-2 border-white/10 rounded-[3rem] shadow-2xl max-w-sm w-full mx-4">
                        <h2 className={`text-4xl font-black italic mb-2 uppercase tracking-tighter ${gameStatus === 'won' ? 'text-yellow-400' : 'text-red-500'}`}>
                            {gameStatus === 'won' ? 'CONGRATULAZIONI!' : 'HAI PERSO'}
                        </h2>
                        
                        {gameStatus === 'won' && (
                            <div className="mb-8 animate-bounce">
                                <div className="text-emerald-400 font-black text-xl mt-2">+100 GEMME BONUS</div>
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-4 mt-8">
                            {gameStatus === 'lost' && (
                                <button 
                                    onClick={initLevel} 
                                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all transform active:scale-95 shadow-lg shadow-red-500/20 border-b-4 border-red-950"
                                >
                                    <i className="fas fa-redo mr-2"></i> Riprova
                                </button>
                            )}
                            
                            <button 
                                onClick={() => onEnd(gameStatus === 'won', gemsCollected)} 
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all border border-white/10"
                            >
                                <i className="fas fa-home mr-2"></i> Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="w-full h-full" />
        </div>
    );
};

export default GameView;
