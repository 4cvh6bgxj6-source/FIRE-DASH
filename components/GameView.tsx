
import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';
import AdminPanel from './AdminPanel';

interface Props {
    level: Level;
    skin: Skin;
    username: string;
    isVip?: boolean;
    onEnd: (success: boolean, gems: number) => void;
    isSebastianMode?: boolean;
}

const GameView: React.FC<Props> = ({ level, skin, username, isVip, onEnd, isSebastianMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = useState(0);
    const [gemsCollected, setGemsCollected] = useState(0);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isGodMode, setIsGodMode] = useState(false);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    
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

    const isSeba = skin.id === 's-seba';

    const initLevel = () => {
        const obstacles: typeof world.current.obstacles = [];
        const levelLength = isSeba ? 35000 : 8000; 
        world.current.levelLength = levelLength;
        world.current.x = 0;
        world.current.finished = false;
        
        player.current = {
            y: 300,
            dy: 0,
            width: 40,
            height: 40,
            rotation: 0,
            isGrounded: false
        };

        for (let i = 800; i < levelLength; i += (450 / level.speedMultiplier)) {
            const rand = Math.random();
            if (rand < 0.4) obstacles.push({ x: i, width: 40, height: 40, type: 'spike' });
            else if (rand < 0.6) obstacles.push({ x: i, width: 60, height: 60, type: 'block' });
            else obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
        }

        if (isSeba) {
            for (let j = 0; j < 1000; j++) {
                const randomX = 500 + Math.random() * (levelLength - 600);
                obstacles.push({ x: randomX, width: 40, height: 40, type: 'spike' });
            }
        }

        obstacles.sort((a, b) => a.x - b.x);
        world.current.obstacles = obstacles;
        setGemsCollected(0);
        setProgress(0);
        setGameStatus('playing');
    };

    useEffect(() => {
        initLevel();
    }, [level, skin.id]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const startAction = () => {
            if (gameStatus !== 'playing') return;
            if (isSeba) return;

            inputHeld.current = true;
            if (!skin.canFly && player.current.isGrounded) {
                player.current.dy = JUMP_FORCE;
                player.current.isGrounded = false;
            }
        };

        const stopAction = () => { inputHeld.current = false; };

        const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') startAction(); };
        const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') stopAction(); };
        const handleMouseDown = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('button')) startAction(); };
        const handleTouchStart = (e: TouchEvent) => { if (!(e.target as HTMLElement).closest('button')) { if (e.cancelable) e.preventDefault(); startAction(); } };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', stopAction);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchend', stopAction);

        const update = () => {
            if (world.current.finished || gameStatus !== 'playing') return;

            if (skin.canFly && inputHeld.current) player.current.dy -= 1.6; 
            player.current.dy += GAME_GRAVITY;
            if (skin.canFly) player.current.dy = Math.max(-12, Math.min(8, player.current.dy));

            player.current.y += player.current.dy;
            const groundY = canvas.height - 100;
            
            if (player.current.y < 0) { player.current.y = 0; player.current.dy = 0.5; }

            if (player.current.y + player.current.height > groundY) {
                player.current.y = groundY - player.current.height;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                const rotSpeed = isSeba ? 0.9 : 0.15;
                player.current.rotation += (skin.canFly && inputHeld.current ? 0.3 : rotSpeed) * level.speedMultiplier;
                player.current.isGrounded = false;
            }

            let effectiveSpeed = BASE_SPEED * level.speedMultiplier;
            if (isSeba) effectiveSpeed *= 10;
            
            world.current.x += effectiveSpeed;
            const currentProgress = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(currentProgress);

            if (currentProgress >= 100) { world.current.finished = true; setGameStatus('won'); }

            const px = 150;
            for (let i = 0; i < world.current.obstacles.length; i++) {
                const obs = world.current.obstacles[i];
                const obsX = obs.x - world.current.x;

                if (obsX < px - 100) continue;
                if (obsX > px + 100) break;

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
                    if (!isGodMode) { setGameStatus('lost'); return; }
                }
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (isSeba) {
                ctx.fillStyle = '#050212';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
                ctx.fillRect(0, (Date.now() / 1.5) % canvas.height, canvas.width, 60);
            } else if (skin.id === 's666') {
                ctx.fillStyle = '#050000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const groundY = canvas.height - 100;
            ctx.fillStyle = skin.id === 's666' ? '#1a0000' : '#1e293b';
            ctx.fillRect(0, groundY, canvas.width, 100);
            ctx.strokeStyle = isSeba ? '#6366f1' : (skin.id === 's666' ? '#ff0000' : level.color);
            ctx.lineWidth = 4;
            ctx.strokeRect(0, groundY, canvas.width, 1);

            world.current.obstacles.forEach(obs => {
                const obsX = obs.x - world.current.x;
                if (obsX < -100 || obsX > canvas.width + 100) return;

                if (obs.type === 'spike') {
                    ctx.fillStyle = isGodMode ? '#ef444444' : (isSeba ? '#6366f1' : (skin.id === 's666' ? '#990000' : '#ef4444'));
                    ctx.beginPath();
                    ctx.moveTo(obsX, groundY);
                    ctx.lineTo(obsX + obs.width / 2, groundY - obs.height);
                    ctx.lineTo(obsX + obs.width, groundY);
                    ctx.fill();
                    if (isSeba || skin.id === 's666') {
                        ctx.strokeStyle = isSeba ? '#fff' : '#ff0000';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                } else if (obs.type === 'block') {
                    ctx.fillStyle = isGodMode ? '#47556944' : '#475569';
                    ctx.fillRect(obsX, groundY - obs.height, obs.width, obs.height);
                    ctx.strokeStyle = skin.id === 's666' ? '#ff0000' : '#fff';
                    ctx.strokeRect(obsX, groundY - obs.height, obs.width, obs.height);
                } else if (obs.type === 'gem') {
                    ctx.fillStyle = isSeba ? '#fff' : (skin.id === 's666' ? '#ff0000' : '#60a5fa');
                    ctx.beginPath();
                    ctx.arc(obsX + obs.width / 2, groundY - obs.height / 2 - 20, obs.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            ctx.save();
            let pX = 150 + player.current.width / 2;
            let pY = player.current.y + player.current.height / 2;
            
            if (skin.isGlitched || isSeba) {
                if (Math.random() > 0.3) {
                    pX += (Math.random() - 0.5) * (isSeba ? 35 : 20);
                    pY += (Math.random() - 0.5) * (isSeba ? 35 : 20);
                }
            }

            ctx.translate(pX, pY);
            ctx.rotate(player.current.rotation);
            
            if (isSeba) {
                const colors = ['#6366f1', '#4f46e5', '#ffffff', '#000000'];
                ctx.fillStyle = colors[Math.floor(Date.now() / 15) % colors.length];
            } else if (skin.id === 's666') {
                const colors = ['#ff0000', '#000000', '#660000', '#ffffff'];
                ctx.fillStyle = colors[Math.floor(Date.now() / 30) % colors.length];
            } else ctx.fillStyle = skin.color;
            
            // Render skin as FontAwesome icon
            ctx.font = '24px "Font Awesome 6 Free"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fontWeight = '900';
            
            // Map common FA icon classes to unicode for canvas
            let iconCode = '\uf0c8'; // square default
            if (skin.icon === 'fa-square') iconCode = '\uf0c8';
            if (skin.icon === 'fa-cube') iconCode = '\uf1b2';
            if (skin.icon === 'fa-diamond') iconCode = '\uf219';
            if (skin.icon === 'fa-crown') iconCode = '\uf3a5';
            if (skin.icon === 'fa-bolt') iconCode = '\uf0e7';
            if (skin.icon === 'fa-terminal') iconCode = '\uf120';
            if (skin.icon === 'fa-sun') iconCode = '\uf185';
            if (skin.icon === 'fa-fire') iconCode = '\uf06d';
            if (skin.icon === 'fa-user-secret') iconCode = '\uf21b';
            if (skin.icon === 'fa-skull') iconCode = '\uf54c';
            if (skin.icon === 'fa-ghost') iconCode = '\uf6e2';
            if (skin.icon === 'fa-walking') iconCode = '\uf554'; // Omino che cammina/salta

            ctx.fillText(iconCode, 0, 0);
            
            if (isSeba || skin.id === 's666') {
                ctx.strokeStyle = isSeba ? '#fff' : '#000';
                ctx.lineWidth = 1;
                ctx.strokeText(iconCode, 0, 0);
            }
            ctx.restore();

            update();
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', stopAction);
            canvas.addEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', stopAction);
        };
    }, [level, skin.id, isGodMode, gameStatus]);

    return (
        <div className="h-full w-full relative flex items-center justify-center bg-black overflow-hidden select-none">
            {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} onInstantWin={() => { world.current.x = world.current.levelLength - 100; }} onToggleGodMode={setIsGodMode} isGodMode={isGodMode} />}

            {gameStatus === 'lost' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className={`text-center p-8 bg-gray-900 border-2 rounded-3xl max-w-sm w-full shadow-2xl ${isSeba ? 'border-indigo-600' : 'border-red-600'}`}>
                        <h2 className="text-5xl font-black italic mb-2 tracking-tighter text-white uppercase">{isSeba ? 'SEBA_CRASH' : 'HAI PERSO!'}</h2>
                        <p className="text-gray-400 font-bold uppercase text-xs mb-8 tracking-widest">{isSeba ? 'VELOCITÀ FOLLE...' : 'RITENTA!'}</p>
                        <div className="flex flex-col gap-4">
                            <button onClick={initLevel} className={`w-full text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest ${isSeba ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-red-600 shadow-red-600/20'}`}>Riprova</button>
                            <button onClick={() => onEnd(false, gemsCollected)} className="w-full bg-gray-800 text-gray-300 font-black py-4 rounded-xl uppercase tracking-widest">Menu</button>
                        </div>
                    </div>
                </div>
            )}

            {gameStatus === 'won' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in zoom-in duration-500">
                    <div className="text-center p-10 bg-gray-900 border-2 border-yellow-500 rounded-3xl shadow-[0_0_60px_rgba(234,179,8,0.4)] max-md w-full">
                        <i className="fas fa-crown text-6xl text-yellow-400 animate-bounce mb-6"></i>
                        <h2 className="text-4xl font-black italic text-white mb-2 uppercase">SUPREME!</h2>
                        <p className="text-yellow-400 font-black text-2xl mb-8">PREMIO MASSIMO!</p>
                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-2xl mb-8">
                            <div className="text-2xl font-black text-blue-400 flex items-center justify-center gap-2"><i className="fas fa-gem"></i> {gemsCollected + (isSeba ? 5000 : 0)}</div>
                        </div>
                        <button onClick={() => onEnd(true, gemsCollected + (isSeba ? 5000 : 0))} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black py-5 rounded-2xl text-lg uppercase">Continua</button>
                    </div>
                </div>
            )}

            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <div className="text-white font-bold text-sm tracking-widest uppercase opacity-70">
                        PLAYER: <span className={isVip ? 'rainbow-text' : ''}>{username}</span>
                    </div>
                    <div className={`text-white font-black text-3xl italic tracking-tighter ${isSeba ? 'text-indigo-400 font-mono' : ''}`}>{isSeba ? 'SEBASTIAN_MOD_ON' : level.name}</div>
                    <div className="text-blue-400 font-bold flex items-center gap-3 text-lg">
                        <i className="fas fa-gem animate-bounce"></i> {gemsCollected}
                        {isSeba && <span className="text-red-500 text-[10px] font-black px-2 py-0.5 bg-red-950/50 rounded border border-red-500 animate-pulse">NO_JUMP</span>}
                        {isSeba && <span className="text-indigo-400 text-[10px] font-black px-2 py-0.5 bg-indigo-950/50 rounded border border-indigo-500 animate-pulse">10X_SPEED</span>}
                        {isSeba && <span className="text-indigo-200 text-[10px] font-black px-2 py-0.5 bg-indigo-900/50 rounded border border-indigo-300">1000_TRAPS</span>}
                    </div>
                </div>
                <div className={`text-white font-black text-5xl italic ${isSeba ? 'text-indigo-400' : ''}`}>{Math.floor(progress)}%</div>
            </div>

            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className={`w-full h-full cursor-pointer ${isSeba ? 'brightness-125 contrast-125' : ''}`} />
            {isSeba && <div className="absolute inset-0 pointer-events-none border-[30px] border-indigo-600/20 animate-pulse shadow-[inset_0_0_200px_rgba(99,102,241,0.35)]"></div>}
        </div>
    );
};

export default GameView;
