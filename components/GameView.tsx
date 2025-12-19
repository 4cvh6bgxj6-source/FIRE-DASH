
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
    size: number;
}

interface Props {
    level: Level;
    skin: Skin;
    username: string;
    isVip?: boolean;
    onEnd: (success: boolean, gems: number) => void;
}

const GameView: React.FC<Props> = ({ level, skin, username, isVip, onEnd }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = useState(0);
    const [gemsCollected, setGemsCollected] = useState(0);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [isGodMode, setIsGodMode] = useState(false);
    
    const particles = useRef<Particle[]>([]);
    const inputHeld = useRef(false);
    const player = useRef({
        y: 300,
        dy: 0,
        width: 40,
        height: 40,
        rotation: 0,
        isGrounded: false,
    });
    
    const world = useRef({
        x: 0,
        obstacles: [] as { x: number, width: number, height: number, type: 'spike' | 'block' | 'gem' }[],
        levelLength: 8000
    });

    const isAdminGlitch = skin.id === 's8';
    const isError666 = skin.id === 's666';
    const isOmino = skin.id === 's-man';
    const hasAdminAccess = isAdminGlitch || isError666;

    const createParticles = (x: number, y: number, color: string, count = 5, isTrail = false) => {
        for (let i = 0; i < count; i++) {
            particles.current.push({
                x,
                y,
                vx: isTrail ? -2 : (Math.random() - 0.5) * 10,
                vy: isTrail ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 10,
                life: 1.0,
                color,
                size: isTrail ? Math.random() * 3 + 1 : Math.random() * 5 + 2
            });
        }
    };

    const initLevel = () => {
        const obstacles: typeof world.current.obstacles = [];
        const levelLength = 8000 + (parseInt(level.id) * 2000); 
        world.current.levelLength = levelLength;
        world.current.x = 0;
        particles.current = [];
        setIsGodMode(false);
        
        player.current = {
            y: 300,
            dy: 0,
            width: 40,
            height: 40,
            rotation: 0,
            isGrounded: false,
        };

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

    const handleRetry = () => initLevel();
    const handleInstantWin = () => {
        world.current.x = world.current.levelLength;
        setProgress(100);
        setGemsCollected(prev => prev + 100);
        setGameStatus('won');
    };

    useEffect(() => { initLevel(); }, [level.id, skin.id]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const startAction = (e?: any) => {
            if (e && e.cancelable) e.preventDefault();
            if (gameStatus !== 'playing') return;
            inputHeld.current = true;
            if (!skin.canFly && player.current.isGrounded) {
                player.current.dy = JUMP_FORCE;
                player.current.isGrounded = false;
                createParticles(150 + 20, canvas.height - 100, '#ffffff');
            }
        };

        const stopAction = (e?: any) => { 
            if (e && e.cancelable) e.preventDefault();
            inputHeld.current = false; 
        };

        window.addEventListener('keydown', (e) => { if(e.code === 'Space') startAction(); });
        window.addEventListener('keyup', (e) => { if(e.code === 'Space') stopAction(); });
        canvas.addEventListener('touchstart', startAction, { passive: false });
        canvas.addEventListener('touchend', stopAction, { passive: false });
        canvas.addEventListener('mousedown', startAction);
        window.addEventListener('mouseup', stopAction);

        const update = () => {
            if (gameStatus !== 'playing') return;

            if (skin.canFly && inputHeld.current) {
                player.current.dy -= 1.2;
            }
            
            player.current.dy += GAME_GRAVITY;
            if (skin.canFly) player.current.dy = Math.max(-10, Math.min(8, player.current.dy));

            player.current.y += player.current.dy;
            const groundY = canvas.height - 100;
            
            if (player.current.y + player.current.height > groundY) {
                player.current.y = groundY - player.current.height;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                player.current.rotation += 0.2 * level.speedMultiplier;
            }

            world.current.x += BASE_SPEED * level.speedMultiplier;
            const currentProgress = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(currentProgress);
            if (currentProgress >= 100) {
                setGemsCollected(prev => prev + 100);
                setGameStatus('won');
            }

            if (isAdminGlitch) createParticles(150, player.current.y + 20, '#00ff41', 1, true);
            if (isError666) createParticles(150, player.current.y + 20, '#ff0000', 1, true);

            particles.current.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy; p.life -= 0.02;
                if (p.life <= 0) particles.current.splice(i, 1);
            });

            const px = 150;
            const hitboxMargin = isError666 ? 10 : 5;
            world.current.obstacles.forEach((obs, i) => {
                const obsX = obs.x - world.current.x;
                if (obsX < px - 100 || obsX > px + 100) return;
                const collided = (
                    px + hitboxMargin < obsX + obs.width - hitboxMargin &&
                    px + player.current.width - hitboxMargin > obsX + hitboxMargin &&
                    player.current.y + hitboxMargin < groundY - obs.height + obs.height - hitboxMargin &&
                    player.current.y + player.current.height - hitboxMargin > groundY - obs.height + hitboxMargin
                );
                if (collided) {
                    if (obs.type === 'gem') {
                        setGemsCollected(prev => prev + 10);
                        world.current.obstacles.splice(i, 1);
                    } else if (!isGodMode) {
                        setGameStatus('lost');
                    }
                }
            });
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (isError666) {
                ctx.fillStyle = '#1a0000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                if (Math.random() > 0.95) {
                    ctx.fillStyle = 'rgba(255,0,0,0.1)';
                    ctx.fillRect(Math.random()*canvas.width, 0, 50, canvas.height);
                }
            } else {
                const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
                grad.addColorStop(0, '#0f172a');
                grad.addColorStop(1, '#1e293b');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const groundY = canvas.height - 100;
            ctx.fillStyle = isError666 ? '#000000' : '#020617';
            ctx.fillRect(0, groundY, canvas.width, 100);
            ctx.strokeStyle = isError666 ? '#ff0000' : level.color;
            ctx.lineWidth = 4;
            ctx.strokeRect(0, groundY, canvas.width, 2);

            world.current.obstacles.forEach(obs => {
                const obsX = obs.x - world.current.x;
                if (obsX < -100 || obsX > canvas.width + 100) return;
                if (obs.type === 'spike') {
                    ctx.fillStyle = isError666 ? '#4a0000' : '#ef4444';
                    ctx.beginPath();
                    ctx.moveTo(obsX, groundY);
                    ctx.lineTo(obsX + obs.width / 2, groundY - obs.height);
                    ctx.lineTo(obsX + obs.width, groundY);
                    ctx.fill();
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
                } else if (obs.type === 'block') {
                    ctx.fillStyle = '#334155';
                    ctx.fillRect(obsX, groundY - obs.height, obs.width, obs.height);
                    ctx.strokeStyle = '#fff'; ctx.strokeRect(obsX, groundY - obs.height, obs.width, obs.height);
                } else if (obs.type === 'gem') {
                    ctx.fillStyle = '#3b82f6';
                    ctx.beginPath(); ctx.arc(obsX + 15, groundY - 40, 10, 0, Math.PI*2); ctx.fill();
                }
            });

            particles.current.forEach(p => {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            });
            ctx.globalAlpha = 1.0;

            // PLAYER RENDERING
            ctx.save();
            let pX = 150 + player.current.width / 2;
            let pY = player.current.y + player.current.height / 2;
            
            if (skin.isGlitched && Math.random() > 0.8) {
                pX += (Math.random() - 0.5) * 15;
                pY += (Math.random() - 0.5) * 15;
            }

            ctx.translate(pX, pY);
            if (!isOmino) ctx.rotate(player.current.rotation);

            if (isOmino) {
                // DISEGNO OMINO SALTERINO (STICKMAN)
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                
                // Testa
                ctx.beginPath();
                ctx.arc(0, -15, 8, 0, Math.PI * 2);
                ctx.stroke();
                
                // Corpo
                ctx.beginPath();
                ctx.moveTo(0, -7);
                ctx.lineTo(0, 8);
                ctx.stroke();
                
                // Braccia
                ctx.beginPath();
                ctx.moveTo(-10, -2);
                ctx.lineTo(10, -2);
                ctx.stroke();
                
                // Gambe (Animazione)
                const legY = player.current.isGrounded ? 18 : 12;
                const legX = player.current.isGrounded ? 8 : 12;
                ctx.beginPath();
                ctx.moveTo(0, 8);
                ctx.lineTo(-legX, legY); // Gamba sinistra
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, 8);
                ctx.lineTo(legX, legY); // Gamba destra
                ctx.stroke();

            } else {
                // DISEGNO SKIN COME ICONA (IMMAGINE)
                ctx.fillStyle = skin.color;
                if (isAdminGlitch) ctx.fillStyle = Math.random() > 0.5 ? '#00ff41' : '#000000';
                
                ctx.shadowBlur = (isError666 || isGodMode) ? 20 : 0;
                ctx.shadowColor = isAdminGlitch ? '#00ff41' : '#ff0000';

                // Usiamo l'icona FontAwesome come forma principale
                ctx.font = '45px "Font Awesome 6 Free"';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Effetto ombra interna per profondità
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                
                const iconMap: {[key: string]: string} = {
                    'fa-square': '\uf0c8',
                    'fa-cube': '\uf1b2',
                    'fa-diamond': '\uf219',
                    'fa-crown': '\uf44b',
                    'fa-bolt': '\uf0e7',
                    'fa-terminal': '\uf120',
                    'fa-sun': '\uf185',
                    'fa-fire': '\uf06d',
                    'fa-user-secret': '\uf21b',
                    'fa-skull': '\uf54c'
                };
                
                const iconCode = iconMap[skin.icon] || '\uf0c8';
                ctx.fillText(iconCode, 0, 0);
                
                // Bordo bianco sottile intorno all'icona
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.strokeText(iconCode, 0, 0);
            }
            
            ctx.restore();

            update();
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameStatus, level.id, skin.id, isGodMode]);

    return (
        <div className="h-full w-full relative bg-black overflow-hidden">
            {hasAdminAccess && (
                <button 
                    onClick={() => setShowAdminPanel(true)}
                    className={`fixed top-20 left-6 z-[80] bg-black border w-12 h-12 rounded-lg flex items-center justify-center shadow-lg active:scale-90 transition-transform pointer-events-auto ${
                        isAdminGlitch ? 'border-green-500 text-green-500 shadow-green-500/20' : 'border-red-500 text-red-500 shadow-red-500/20'
                    }`}
                >
                    <i className="fas fa-terminal"></i>
                </button>
            )}

            {showAdminPanel && (
                <AdminPanel 
                    onClose={() => setShowAdminPanel(false)} 
                    onInstantWin={handleInstantWin}
                    onToggleGodMode={setIsGodMode}
                    isGodMode={isGodMode}
                />
            )}

            {gameStatus !== 'playing' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="text-center p-8 md:p-12 bg-gray-900 border-2 border-white/10 rounded-[3rem] shadow-2xl max-w-sm w-full mx-4">
                        <h2 className={`text-4xl md:text-5xl font-black italic mb-2 uppercase tracking-tighter ${gameStatus === 'won' ? 'text-emerald-400' : 'text-red-500'}`}>
                            {gameStatus === 'won' ? 'CONGRATULAZIONI!' : 'HAI PERSO'}
                        </h2>
                        
                        {gameStatus === 'won' && (
                            <div className="mb-8 animate-bounce">
                                <div className="text-yellow-400 font-black text-xl">+100 GEMME BONUS!</div>
                                <div className="text-blue-400 text-sm font-bold">Totale raccolte: {gemsCollected}</div>
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-4">
                            {gameStatus === 'lost' && (
                                <button 
                                    onClick={handleRetry} 
                                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black px-8 py-5 rounded-2xl uppercase tracking-widest transition-all transform active:scale-95 shadow-lg shadow-red-500/20 text-lg border-b-4 border-red-800"
                                >
                                    <i className="fas fa-redo mr-3"></i> Riprova
                                </button>
                            )}
                            
                            <button 
                                onClick={() => onEnd(gameStatus === 'won', gemsCollected)} 
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-black px-8 py-5 rounded-2xl uppercase tracking-widest transition-all transform active:scale-95 border border-white/10"
                            >
                                <i className="fas fa-home mr-3"></i> Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
                <div className="text-white">
                    <div className="text-[10px] font-black uppercase opacity-50">Player</div>
                    <div className={`text-xl font-black italic ${isAdminGlitch || isError666 ? 'rainbow-text' : ''}`}>{username}</div>
                    {isGodMode && (
                        <div className={`text-[9px] font-bold uppercase animate-pulse mt-1 ${isAdminGlitch ? 'text-green-500' : 'text-red-500'}`}>
                            [ GOD_MODE: ACTIVE ]
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black italic text-white">{Math.floor(progress)}%</div>
                    <div className="text-blue-400 font-bold"><i className="fas fa-gem"></i> {gemsCollected}</div>
                </div>
            </div>

            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="w-full h-full" />
        </div>
    );
};

export default GameView;
