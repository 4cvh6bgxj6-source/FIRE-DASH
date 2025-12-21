
import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';

interface Projectile { x: number; y: number; width: number; height: number; speed: number; type: 'normal' | 'laser'; }
interface PlayerProjectile { x: number; y: number; width: number; height: number; speed: number; rotation: number; active: boolean; type: 'gift' | 'rocket'; }

interface Props {
    level: Level;
    skin: Skin;
    username: string;
    isVip: boolean; 
    onEnd: (success: boolean, gems: number) => void;
}

const GameView: React.FC<Props> = ({ level, skin, username, isVip, onEnd }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = useState(0);
    const [gemsCollected, setGemsCollected] = useState(0);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [isPortrait, setIsPortrait] = useState(false);
    
    const inputHeld = useRef(false);
    const shootCooldown = useRef(0); 

    const player = useRef({ y: 0, dy: 0, width: 40, height: 40, rotation: 0, isGrounded: false });
    const world = useRef({ x: 0, obstacles: [] as any[], levelLength: 10000 });

    const canFlyActive = skin.canFly || false;
    const isBossLevel = level.isBossBattle || false;
    const showShootButton = skin.canShoot || (skin.id === 's-boss' && isBossLevel);
    const effectiveMultiplier = (level.id === '14' && isVip) ? 2 : level.speedMultiplier;

    // Gestione ridimensionamento reale
    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setIsPortrait(height > width);
            
            if (canvasRef.current) {
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                
                // Forza il riposizionamento se il gioco è attivo
                if (gameStatus === 'playing') {
                    const groundH = height < 450 ? 60 : 100;
                    player.current.y = height - groundH - 40;
                }
            }
        };

        window.addEventListener('resize', updateSize);
        window.addEventListener('orientationchange', updateSize);
        updateSize();
        return () => {
            window.removeEventListener('resize', updateSize);
            window.removeEventListener('orientationchange', updateSize);
        };
    }, [gameStatus]);

    const initLevel = () => {
        const h = window.innerHeight;
        const levelLength = 10000 + (parseInt(level.id) * 2000); 
        world.current.levelLength = levelLength;
        world.current.x = 0;
        
        const groundH = h < 450 ? 60 : 100;
        player.current.y = h - groundH - 40;
        player.current.dy = 0;
        player.current.rotation = 0;

        const obstacles: any[] = [];
        const spacing = 450 / effectiveMultiplier;
        if (!level.isBossBattle) {
            for (let i = 1200; i < levelLength - 1000; i += spacing + (Math.random() * 400)) {
                const rand = Math.random();
                if (rand < 0.45) obstacles.push({ x: i, width: 40, height: 40, type: 'spike' });
                else if (rand < 0.75) obstacles.push({ x: i, width: 60, height: 60, type: 'block' });
                else obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
            }
        }
        world.current.obstacles = obstacles;
        setGemsCollected(0);
        setProgress(0);
        setGameStatus('playing');
    };

    useEffect(() => { initLevel(); }, [level.id]);

    const handleShoot = () => {
        if (gameStatus !== 'playing' || !showShootButton || shootCooldown.current > 0) return;
        shootCooldown.current = 20;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;
        let animationFrameId: number;

        const loop = () => {
            if (gameStatus !== 'playing') return;
            if (shootCooldown.current > 0) shootCooldown.current--;

            const groundHeight = canvas.height < 450 ? 60 : 100;
            const groundY = canvas.height - groundHeight;
            
            // Player Physics
            if (canFlyActive && inputHeld.current) player.current.dy -= 0.8;
            player.current.dy += GAME_GRAVITY;
            if (canFlyActive) player.current.dy = Math.max(-10, Math.min(8, player.current.dy));
            player.current.y += player.current.dy;

            if (player.current.y + 40 > groundY) {
                player.current.y = groundY - 40;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                if (!canFlyActive) player.current.rotation += (0.16 * effectiveMultiplier);
            }

            world.current.x += BASE_SPEED * effectiveMultiplier;
            const prog = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(prog);

            if (prog >= 100 && gameStatus === 'playing') {
                setGemsCollected(100); setGameStatus('won'); return;
            }

            // RENDERING
            ctx.fillStyle = '#08081a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#05050f'; ctx.fillRect(0, groundY, canvas.width, groundHeight);
            ctx.strokeStyle = level.color; ctx.lineWidth = 4; ctx.strokeRect(0, groundY, canvas.width, 2);

            const px = 150;

            // Ostacoli
            world.current.obstacles.forEach((o, i) => {
                const ox = o.x - world.current.x;
                if (ox < -100 || ox > canvas.width + 100) return;

                if (o.type === 'spike') {
                    ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.moveTo(ox, groundY); ctx.lineTo(ox+20, groundY-40); ctx.lineTo(ox+40, groundY); ctx.fill();
                } else if (o.type === 'block') {
                    ctx.fillStyle = '#3a4e82'; ctx.fillRect(ox, groundY-o.height, o.width, o.height);
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.strokeRect(ox, groundY-o.height, o.width, o.height);
                } else if (o.type === 'gem') {
                    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(ox+20, groundY-50, 10, 0, Math.PI*2); ctx.fill();
                }

                // Collision Detection
                if (ox < px + 35 && ox + o.width > px + 5 && player.current.y + 5 < groundY - o.height + o.height && player.current.y + 35 > groundY - o.height) {
                    if (o.type === 'gem') { world.current.obstacles.splice(i, 1); setGemsCollected(g => g + 5); }
                    else setGameStatus('lost');
                }
            });

            // Player Draw
            ctx.save();
            ctx.translate(px + 20, player.current.y + 20);
            ctx.rotate(player.current.rotation);
            ctx.fillStyle = skin.color;
            ctx.font = '900 36px "Font Awesome 6 Free"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const iconChar = { 'fa-square': '\uf0c8', 'fa-cat': '\uf6be', 'fa-dragon': '\uf6d5', 'fa-crown': '\uf521', 'fa-bolt': '\uf0e7', 'fa-robot': '\uf544', 'fa-sun': '\uf185', 'fa-spider': '\uf717', 'fa-skull': '\uf54c', 'fa-snowman': '\uf7d0', 'fa-sleigh': '\uf7cc', 'fa-tree': '\uf1bb', 'fa-gift': '\uf06b', 'fa-candy-cane': '\uf786', 'fa-crosshairs': '\uf05b', 'fa-user-secret': '\uf21b' }[skin.icon] || '\uf0c8';
            ctx.fillText(iconChar, 0, 0);
            ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.strokeText(iconChar, 0, 0);
            ctx.restore();

            animationFrameId = requestAnimationFrame(loop);
        };

        const onStart = (e: any) => { e.preventDefault(); inputHeld.current = true; if(!canFlyActive && player.current.isGrounded) { player.current.dy = JUMP_FORCE; player.current.isGrounded = false; } };
        const onEndInput = (e: any) => { e.preventDefault(); inputHeld.current = false; };

        canvas.addEventListener('touchstart', onStart, { passive: false });
        canvas.addEventListener('touchend', onEndInput, { passive: false });
        loop();
        return () => { 
            cancelAnimationFrame(animationFrameId); 
            canvas.removeEventListener('touchstart', onStart); 
            canvas.removeEventListener('touchend', onEndInput); 
        };
    }, [gameStatus, level, skin]);

    return (
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
            
            {/* Overlay Rotazione Solo in Portrait (obbliga Landscape) */}
            {isPortrait && (
                <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                    <i className="fas fa-mobile-screen text-6xl text-white rotate-90 mb-6 animate-bounce"></i>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">RUOTA LO SCHERMO</h2>
                    <p className="text-gray-500 text-[9px] mt-2 uppercase tracking-widest font-bold">L'esperienza di gioco richiede la modalità orizzontale.</p>
                </div>
            )}

            {/* UI di Gioco Minimale */}
            <div className="absolute top-0 left-0 w-full p-2 flex justify-between pointer-events-none z-10 pt-[calc(env(safe-area-inset-top)+6px)] px-[calc(env(safe-area-inset-left)+12px)]">
                <div className="bg-black/70 px-4 py-1 rounded-full border border-white/10 shadow-xl">
                    <span className="text-white font-black italic text-xs md:text-lg">{Math.floor(progress)}%</span>
                </div>
                <div className="bg-black/70 px-4 py-1 rounded-full border border-white/10 shadow-xl mr-[env(safe-area-inset-right)]">
                    <span className="text-blue-400 font-black text-[10px] md:text-sm">+{gemsCollected} GEMME</span>
                </div>
            </div>

            {showShootButton && gameStatus === 'playing' && (
                <button 
                    onClick={handleShoot}
                    className="absolute bottom-6 right-6 w-14 h-14 md:w-20 md:h-20 bg-red-600 rounded-full border-2 border-white text-white z-20 shadow-2xl active:scale-90 mr-[env(safe-area-inset-right)]"
                >
                    <i className="fas fa-bomb text-xl"></i>
                </button>
            )}

            {/* Fine Gara Modal */}
            {gameStatus !== 'playing' && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[200] backdrop-blur-xl animate-in zoom-in duration-300">
                    <div className="bg-gray-900 border-2 border-white/10 p-6 rounded-[2.5rem] text-center w-full max-w-xs shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <i className={`fas ${gameStatus === 'won' ? 'fa-trophy text-yellow-400' : 'fa-skull-crossbones text-red-600'} text-4xl mb-4`}></i>
                        <h2 className="text-xl font-black italic text-white uppercase mb-4 tracking-tighter">
                            {gameStatus === 'won' ? 'Vittoria!' : 'Hai Perso!'}
                        </h2>
                        <div className="flex flex-col gap-2">
                            <button onClick={gameStatus === 'won' ? () => onEnd(true, gemsCollected) : initLevel} className="bg-blue-600 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-[11px] active:scale-95 shadow-lg border-b-4 border-blue-800">Continua</button>
                            <button onClick={() => onEnd(false, 0)} className="bg-gray-800 py-3 rounded-2xl text-gray-500 font-black uppercase tracking-widest text-[9px] active:scale-95">Menu</button>
                        </div>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="flex-1 block" />
        </div>
    );
};

export default GameView;
