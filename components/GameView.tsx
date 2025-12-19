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
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color
            });
        }
    };

    const initLevel = () => {
        const obstacles: typeof world.current.obstacles = [];
        const levelBaseLength = 8000;
        const levelLength = isSeba ? 45000 : levelBaseLength + (parseInt(level.id) * 2000); 
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

        const spacing = 450 / level.speedMultiplier;
        for (let i = 1200; i < levelLength - 1000; i += spacing + (Math.random() * 250)) {
            const rand = Math.random();
            if (rand < 0.4) obstacles.push({ x: i, width: 40, height: 40, type: 'spike' });
            else if (rand < 0.6) obstacles.push({ x: i, width: 60, height: 60, type: 'block' });
            else if (rand < 0.8) obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
        }

        if (isSeba) {
            for (let j = 0; j < 1200; j++) {
                const randomX = 1000 + Math.random() * (levelLength - 1500);
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
    }, [level.id, skin.id]);

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
                createExplosion(150 + 20, canvas.height - 100, '#ffffff88');
            }
        };

        const stopAction = (e?: any) => { 
            if (e && e.cancelable) e.preventDefault();
            inputHeld.current = false; 
        };

        const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') startAction(e); };
        const handleTouchStart = (e: TouchEvent) => { startAction(e); };
        const handleTouchEnd = (e: TouchEvent) => { stopAction(e); };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', stopAction);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        canvas.addEventListener('mousedown', startAction);
        window.addEventListener('mouseup', stopAction);

        const update = () => {
            if (world.current.finished || gameStatus !== 'playing') return;

            if (skin.canFly && inputHeld.current) player.current.dy -= 1.8; 
            player.current.dy += GAME_GRAVITY;
            if (skin.canFly) player.current.dy = Math.max(-12, Math.min(10, player.current.dy));

            player.current.y += player.current.dy;
            const groundY = canvas.height - 100;
            
            if (player.current.y < 0) { player.current.y = 0; player.current.dy = 1; }

            if (player.current.y + player.current.height > groundY) {
                if (!player.current.isGrounded) {
                    createExplosion(150 + 20, groundY, '#ffffff44');
                }
                player.current.y = groundY - player.current.height;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                const rotSpeed = isSeba ? 1.2 : 0.22;
                if (!isMan) {
                    player.current.rotation += (skin.canFly && inputHeld.current ? 0.35 : rotSpeed) * level.speedMultiplier;
                }
                player.current.isGrounded = false;
            }

            if (isMan) {
                player.current.legPhase += 0.25 * level.speedMultiplier;
            }

            let effectiveSpeed = BASE_SPEED * level.speedMultiplier;
            if (isSeba) effectiveSpeed *= 12;
            
            world.current.x += effectiveSpeed;
            const currentProgress = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(currentProgress);

            if (currentProgress >= 100) { world.current.finished = true; setGameStatus('won'); }

            particles.current.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy; p.life -= 0.03;
                if (p.life <= 0) particles.current.splice(i, 1);
            });

            const px = 150;
            const hitboxMargin = 5;
            for (let i = 0; i < world.current.obstacles.length; i++) {
                const obs = world.current.obstacles[i];
                const obsX = obs.x - world.current.x;

                if (obsX < px - 200) continue;
                if (obsX > px + 200) break;

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
                bgGradient.addColorStop(0, '#020008'); bgGradient.addColorStop(1, '#0c0a2a');
            } else if (skin.id === 's666') {
                bgGradient.addColorStop(0, '#040000'); bgGradient.addColorStop(1, '#1a0000');
            } else {
                bgGradient.addColorStop(0, '#0a0f1d'); bgGradient.addColorStop(1, '#1a202c');
            }
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
            const gridSize = 64; const offsetX = -(world.current.x % gridSize);
            for (let x = offsetX; x < canvas.width; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }

            const groundY = canvas.height - 100;
            ctx.fillStyle = skin.id === 's666' ? '#100000' : '#01040a';
            ctx.fillRect(0, groundY, canvas.width, 100);
            ctx.strokeStyle = isSeba ? '#4f46e5' : (skin.id === 's666' ? '#7f0000' : level.color);
            ctx.lineWidth = 4; ctx.strokeRect(0, groundY, canvas.width, 2);

            world.current.obstacles.forEach(obs => {
                const obsX = obs.x - world.current.x;
                if (obsX < -150 || obsX > canvas.width + 150) return;

                if (obs.type === 'spike') {
                    ctx.fillStyle = isGodMode ? '#ef444444' : (isSeba ? '#4f46e5' : (skin.id === 's666' ? '#660000' : '#dc2626'));
                    ctx.beginPath();
                    ctx.moveTo(obsX, groundY);
                    ctx.lineTo(obsX + obs.width / 2, groundY - obs.height);
                    ctx.lineTo(obsX + obs.width, groundY);
                    ctx.fill();
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
                } else if (obs.type === 'block') {
                    ctx.fillStyle = isGodMode ? '#33415544' : '#334155';
                    ctx.fillRect(obsX, groundY - obs.height, obs.width, obs.height);
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(obsX, groundY - obs.height, obs.width, obs.height);
                } else if (obs.type === 'gem') {
                    ctx.fillStyle = isSeba ? '#fff' : (skin.id === 's666' ? '#ff0000' : '#3b82f6');
                    ctx.beginPath(); ctx.arc(obsX + obs.width / 2, groundY - obs.height / 2 - 25, 14, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
                }
            });

            particles.current.forEach(p => {
                ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 5, 5);
            });
            ctx.globalAlpha = 1.0;

            ctx.save();
            let pX = 150 + player.current.width / 2;
            let pY = player.current.y + player.current.height / 2;
            
            if (skin.isGlitched || isSeba) {
                if (Math.random() > 0.45) {
                    pX += (Math.random() - 0.5) * (isSeba ? 35 : 18);
                    pY += (Math.random() - 0.5) * (isSeba ? 35 : 18);
                }
            }

            ctx.translate(pX, pY);
            ctx.rotate(player.current.rotation);
            
            if (isMan) {
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.arc(0, -15, 8, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 10); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-12, -2); ctx.lineTo(12, -2); ctx.stroke();
                
                const legSwing = Math.sin(player.current.legPhase) * 16;
                if (player.current.isGrounded) {
                    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(legSwing, 24); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(-legSwing, 24); ctx.stroke();
                } else {
                    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(-14, 18); ctx.lineTo(-8, 28); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(14, 14); ctx.lineTo(20, 22); ctx.stroke();
                }
            } else {
                ctx.fillStyle = skin.color;
                if (isSeba) {
                    const colors = ['#4f46e5', '#ffffff', '#000000'];
                    ctx.fillStyle = colors[Math.floor(Date.now() / 30) % colors.length];
                } else if (skin.id === 's666') {
                    const colors = ['#ff0000', '#000000', '#4a0000'];
                    ctx.fillStyle = colors[Math.floor(Date.now() / 50) % colors.length];
                }

                ctx.font = 'bold 36px "Font Awesome 6 Free"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                
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
                initLevel(); 
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', stopAction);
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('mousedown', startAction);
            window.removeEventListener('mouseup', stopAction);
        };
    }, [level.id, skin.id, isGodMode, gameStatus]);

    return (
        <div className="h-full w-full relative flex items-center justify-center bg-black overflow-hidden select-none touch-none">
            {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} onInstantWin={() => { world.current.x = world.current.levelLength - 100; }} onToggleGodMode={setIsGodMode} isGodMode={isGodMode} />}

            {gameStatus === 'lost' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
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
                <div className="flex flex-col items-end gap-2 pointer-events-auto">
                   <div className={`text-white font-black text-4xl italic ${isSeba ? 'text-indigo-400' : ''}`}>{Math.floor(progress)}%</div>
                   {isVip && (
                     <button onClick={() => setIsAdminOpen(true)} className="bg-green-600/20 text-green-500 px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-green-500/50">ADMIN PANEL</button>
                   )}
                </div>
            </div>

            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="w-full h-full cursor-pointer touch-none" />
        </div>
    );
};

export default GameView;