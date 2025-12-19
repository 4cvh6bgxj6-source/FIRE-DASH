
import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';
import AdminPanel from './AdminPanel';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

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
    
    const particles = useRef<Particle[]>([]);
    const inputHeld = useRef(false);
    const player = useRef({
        y: 300,
        dy: 0,
        width: 36,
        height: 44,
        rotation: 0,
        isGrounded: false,
        legPhase: 0
    });
    
    const world = useRef({
        x: 0,
        obstacles: [] as { x: number, width: number, height: number, type: 'spike' | 'block' | 'gem' }[],
        finished: false,
        levelLength: 8000
    });

    const isSeba = skin.id === 's-seba';
    const isMan = skin.id === 's-man';

    const createExplosion = (x: number, y: number, color: string) => {
        for (let i = 0; i < 15; i++) {
            particles.current.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0,
                color
            });
        }
    };

    const initLevel = () => {
        const obstacles: typeof world.current.obstacles = [];
        const levelBaseLength = 8000;
        const levelLength = isSeba ? 35000 : levelBaseLength + (parseInt(level.id) * 1500); 
        world.current.levelLength = levelLength;
        world.current.x = 0;
        world.current.finished = false;
        particles.current = [];
        
        player.current = {
            y: 300,
            dy: 0,
            width: 36,
            height: 44,
            rotation: 0,
            isGrounded: false,
            legPhase: 0
        };

        const spacing = 500 / level.speedMultiplier;
        for (let i = 1000; i < levelLength - 800; i += spacing + (Math.random() * 200)) {
            const rand = Math.random();
            if (rand < 0.35) obstacles.push({ x: i, width: 40, height: 40, type: 'spike' });
            else if (rand < 0.55) obstacles.push({ x: i, width: 60, height: 60, type: 'block' });
            else if (rand < 0.75) obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
        }

        if (isSeba) {
            for (let j = 0; j < 800; j++) {
                const randomX = 500 + Math.random() * (levelLength - 1000);
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

        const startAction = (e?: any) => {
            if (e && e.cancelable) e.preventDefault();
            if (gameStatus !== 'playing') return;
            if (isSeba) return;

            inputHeld.current = true;
            if (!skin.canFly && player.current.isGrounded) {
                player.current.dy = JUMP_FORCE;
                player.current.isGrounded = false;
                createExplosion(150 + 20, canvas.height - 100, '#ffffff66');
            }
        };

        const stopAction = () => { inputHeld.current = false; };

        const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') startAction(e); };
        const handleTouchStart = (e: TouchEvent) => { startAction(e); };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', stopAction);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchend', stopAction);
        canvas.addEventListener('mousedown', startAction);
        window.addEventListener('mouseup', stopAction);

        const update = () => {
            if (world.current.finished || gameStatus !== 'playing') return;

            if (skin.canFly && inputHeld.current) player.current.dy -= 1.6; 
            player.current.dy += GAME_GRAVITY;
            if (skin.canFly) player.current.dy = Math.max(-10, Math.min(8, player.current.dy));

            player.current.y += player.current.dy;
            const groundY = canvas.height - 100;
            
            if (player.current.y < 0) { player.current.y = 0; player.current.dy = 0.5; }

            if (player.current.y + player.current.height > groundY) {
                if (!player.current.isGrounded) {
                    createExplosion(150 + 20, groundY, '#ffffff33');
                }
                player.current.y = groundY - player.current.height;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                const rotSpeed = isSeba ? 0.9 : 0.18;
                if (!isMan) {
                    player.current.rotation += (skin.canFly && inputHeld.current ? 0.3 : rotSpeed) * level.speedMultiplier;
                }
                player.current.isGrounded = false;
            }

            if (isMan) {
                player.current.legPhase += 0.22 * level.speedMultiplier;
            }

            let effectiveSpeed = BASE_SPEED * level.speedMultiplier;
            if (isSeba) effectiveSpeed *= 10;
            
            world.current.x += effectiveSpeed;
            const currentProgress = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(currentProgress);

            if (currentProgress >= 100) { world.current.finished = true; setGameStatus('won'); }

            particles.current.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy; p.life -= 0.025;
                if (p.life <= 0) particles.current.splice(i, 1);
            });

            const px = 150;
            const hitboxMargin = 4;
            for (let i = 0; i < world.current.obstacles.length; i++) {
                const obs = world.current.obstacles[i];
                const obsX = obs.x - world.current.x;

                if (obsX < px - 150) continue;
                if (obsX > px + 150) break;

                const hasCollision = (
                    px + hitboxMargin < obsX + obs.width - hitboxMargin &&
                    px + player.current.width - hitboxMargin > obsX + hitboxMargin &&
                    player.current.y + hitboxMargin < groundY - 0 + obs.height - hitboxMargin &&
                    player.current.y + player.current.height - hitboxMargin > groundY - obs.height + hitboxMargin
                );

                if (hasCollision) {
                    if (obs.type === 'gem') {
                        setGemsCollected(prev => prev + 5);
                        world.current.obstacles.splice(i, 1);
                        continue;
                    }
                    if (!isGodMode) { 
                        setGameStatus('lost'); 
                        createExplosion(px + 20, player.current.y + 20, skin.color);
                        return; 
                    }
                }
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            if (isSeba) {
                bgGradient.addColorStop(0, '#050212'); bgGradient.addColorStop(1, '#1e1b4b');
            } else if (skin.id === 's666') {
                bgGradient.addColorStop(0, '#050000'); bgGradient.addColorStop(1, '#2d0000');
            } else {
                bgGradient.addColorStop(0, '#0f172a'); bgGradient.addColorStop(1, '#1e293b');
            }
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
            const gridSize = 60; const offsetX = -(world.current.x % gridSize);
            for (let x = offsetX; x < canvas.width; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }

            const groundY = canvas.height - 100;
            ctx.fillStyle = skin.id === 's666' ? '#150000' : '#020617';
            ctx.fillRect(0, groundY, canvas.width, 100);
            ctx.strokeStyle = isSeba ? '#6366f1' : (skin.id === 's666' ? '#ff0000' : level.color);
            ctx.lineWidth = 4; ctx.strokeRect(0, groundY, canvas.width, 2);

            world.current.obstacles.forEach(obs => {
                const obsX = obs.x - world.current.x;
                if (obsX < -100 || obsX > canvas.width + 100) return;

                if (obs.type === 'spike') {
                    ctx.fillStyle = isGodMode ? '#ef444466' : (isSeba ? '#6366f1' : (skin.id === 's666' ? '#990000' : '#ef4444'));
                    ctx.beginPath();
                    ctx.moveTo(obsX, groundY);
                    ctx.lineTo(obsX + obs.width / 2, groundY - obs.height);
                    ctx.lineTo(obsX + obs.width, groundY);
                    ctx.fill();
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
                } else if (obs.type === 'block') {
                    ctx.fillStyle = isGodMode ? '#47556966' : '#475569';
                    ctx.fillRect(obsX, groundY - obs.height, obs.width, obs.height);
                    ctx.strokeStyle = '#fff'; ctx.strokeRect(obsX, groundY - obs.height, obs.width, obs.height);
                } else if (obs.type === 'gem') {
                    ctx.fillStyle = isSeba ? '#fff' : (skin.id === 's666' ? '#ff0000' : '#60a5fa');
                    ctx.beginPath(); ctx.arc(obsX + obs.width / 2, groundY - obs.height / 2 - 20, 15, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = '#fff'; ctx.stroke();
                }
            });

            particles.current.forEach(p => {
                ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 4, 4);
            });
            ctx.globalAlpha = 1.0;

            ctx.save();
            let pX = 150 + player.current.width / 2;
            let pY = player.current.y + player.current.height / 2;
            
            if (skin.isGlitched || isSeba) {
                if (Math.random() > 0.4) {
                    pX += (Math.random() - 0.5) * (isSeba ? 30 : 15);
                    pY += (Math.random() - 0.5) * (isSeba ? 30 : 15);
                }
            }

            ctx.translate(pX, pY);
            ctx.rotate(player.current.rotation);
            
            if (isMan) {
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.arc(0, -15, 8, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 10); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-12, -2); ctx.lineTo(12, -2); ctx.stroke();
                
                const legSwing = Math.sin(player.current.legPhase) * 14;
                if (player.current.isGrounded) {
                    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(legSwing, 22); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(-legSwing, 22); ctx.stroke();
                } else {
                    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(-12, 18); ctx.lineTo(-6, 26); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(12, 14); ctx.lineTo(18, 20); ctx.stroke();
                }
            } else {
                ctx.fillStyle = skin.color;
                if (isSeba) {
                    const colors = ['#6366f1', '#ffffff', '#000000'];
                    ctx.fillStyle = colors[Math.floor(Date.now() / 20) % colors.length];
                } else if (skin.id === 's666') {
                    const colors = ['#ff0000', '#000000', '#7f0000'];
                    ctx.fillStyle = colors[Math.floor(Date.now() / 40) % colors.length];
                }

                ctx.font = '36px "Font Awesome 6 Free"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fontWeight = '900';
                
                let iconCode = '\uf0c8'; 
                if (skin.icon === 'fa-square') iconCode = '\uf0c8';
                else if (skin.icon === 'fa-cube') iconCode = '\uf1b2';
                else if (skin.icon === 'fa-diamond') iconCode = '\uf219';
                else if (skin.icon === 'fa-crown') iconCode = '\uf3a5';
                else if (skin.icon === 'fa-bolt') iconCode = '\uf0e7';
                else if (skin.icon === 'fa-terminal') iconCode = '\uf120';
                else if (skin.icon === 'fa-sun') iconCode = '\uf185';
                else if (skin.icon === 'fa-fire') iconCode = '\uf06d';
                else if (skin.icon === 'fa-user-secret') iconCode = '\uf21b';
                else if (skin.icon === 'fa-skull') iconCode = '\uf54c';
                else if (skin.icon === 'fa-ghost') iconCode = '\uf6e2';

                ctx.fillText(iconCode, 0, 0);
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeText(iconCode, 0, 0);
            }
            ctx.restore();

            update();
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', stopAction);
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchend', stopAction);
            canvas.removeEventListener('mousedown', startAction);
            window.removeEventListener('mouseup', stopAction);
        };
    }, [level, skin.id, isGodMode, gameStatus]);

    return (
        <div className="h-full w-full relative flex items-center justify-center bg-black overflow-hidden select-none touch-none">
            {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} onInstantWin={() => { world.current.x = world.current.levelLength - 100; }} onToggleGodMode={setIsGodMode} isGodMode={isGodMode} />}

            {gameStatus === 'lost' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className={`text-center p-8 bg-gray-900 border-2 rounded-3xl max-w-sm w-[90%] shadow-2xl ${isSeba ? 'border-indigo-600' : 'border-red-600'}`}>
                        <h2 className="text-4xl font-black italic mb-2 tracking-tighter text-white uppercase">{isSeba ? 'SEBA_CRASH' : 'HAI PERSO!'}</h2>
                        <p className="text-gray-400 font-bold uppercase text-[10px] mb-8 tracking-widest">RITENTA!</p>
                        <div className="flex flex-col gap-4">
                            <button onClick={initLevel} className={`w-full text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest ${isSeba ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-red-600 shadow-red-600/20'}`}>Riprova</button>
                            <button onClick={() => onEnd(false, gemsCollected)} className="w-full bg-gray-800 text-gray-300 font-black py-4 rounded-xl uppercase tracking-widest">Menu</button>
                        </div>
                    </div>
                </div>
            )}

            {gameStatus === 'won' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in zoom-in duration-500">
                    <div className="text-center p-10 bg-gray-900 border-2 border-yellow-500 rounded-3xl shadow-[0_0_60px_rgba(234,179,8,0.4)] max-w-sm w-[90%]">
                        <i className="fas fa-crown text-5xl text-yellow-400 animate-bounce mb-6"></i>
                        <h2 className="text-3xl font-black italic text-white mb-2 uppercase tracking-tighter">SUPREME!</h2>
                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-2xl mb-8">
                            <div className="text-xl font-black text-blue-400 flex items-center justify-center gap-2"><i className="fas fa-gem"></i> +{gemsCollected + (isSeba ? 5000 : 0)}</div>
                        </div>
                        <button onClick={() => onEnd(true, gemsCollected + (isSeba ? 5000 : 0))} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black py-5 rounded-2xl text-lg uppercase tracking-widest">Continua</button>
                    </div>
                </div>
            )}

            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
                <div className="flex flex-col gap-1 pointer-events-auto">
                    <div className="text-white font-bold text-[10px] tracking-widest uppercase opacity-70">
                        PLAYER: <span className={isVip ? 'rainbow-text' : ''}>{username}</span>
                    </div>
                    <div className={`text-white font-black text-xl italic tracking-tighter ${isSeba ? 'text-indigo-400 font-mono' : ''}`}>{isSeba ? 'SEBA_MODE' : level.name}</div>
                    <div className="text-blue-400 font-bold flex items-center gap-2 text-sm">
                        <i className="fas fa-gem animate-pulse"></i> {gemsCollected}
                    </div>
                </div>
                <div className={`text-white font-black text-4xl italic ${isSeba ? 'text-indigo-400' : ''}`}>{Math.floor(progress)}%</div>
            </div>

            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="w-full h-full cursor-pointer touch-none" />
        </div>
    );
};

export default GameView;
