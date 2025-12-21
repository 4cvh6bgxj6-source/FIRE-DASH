
import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';

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

    const player = useRef({ y: 0, dy: 0, width: 32, height: 32, rotation: 0, isGrounded: false });
    const world = useRef({ x: 0, obstacles: [] as any[], levelLength: 10000 });

    const canFlyActive = skin.canFly || false;
    const effectiveMultiplier = (level.id === '14' && isVip) ? 2 : level.speedMultiplier;

    // Gestione ridimensionamento e orientamento
    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setIsPortrait(height > width);
            
            if (canvasRef.current) {
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                
                // Inizializza posizione player se non ancora impostata
                const groundH = height < 400 ? 50 : 80;
                player.current.y = height - groundH - player.current.height;
            }
        };

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const initLevel = () => {
        const h = window.innerHeight;
        const levelLength = 10000 + (parseInt(level.id) * 1500); 
        world.current.levelLength = levelLength;
        world.current.x = 0;
        
        const groundH = h < 400 ? 50 : 80;
        player.current.y = h - groundH - player.current.height;
        player.current.dy = 0;
        player.current.rotation = 0;

        const obstacles: any[] = [];
        const spacing = 400 / effectiveMultiplier;
        if (!level.isBossBattle) {
            for (let i = 1000; i < levelLength - 500; i += spacing + (Math.random() * 400)) {
                const rand = Math.random();
                if (rand < 0.4) obstacles.push({ x: i, width: 32, height: 32, type: 'spike' });
                else if (rand < 0.7) obstacles.push({ x: i, width: 48, height: 48, type: 'block' });
                else obstacles.push({ x: i, width: 24, height: 24, type: 'gem' });
            }
        }
        world.current.obstacles = obstacles;
        setGemsCollected(0);
        setProgress(0);
        setGameStatus('playing');
    };

    useEffect(() => { initLevel(); }, [level.id]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;
        let animationFrameId: number;

        const loop = () => {
            if (gameStatus !== 'playing') return;

            const groundHeight = canvas.height < 400 ? 50 : 80;
            const groundY = canvas.height - groundHeight;
            
            // Player Physics
            if (canFlyActive && inputHeld.current) player.current.dy -= 0.7;
            player.current.dy += GAME_GRAVITY;
            if (canFlyActive) player.current.dy = Math.max(-8, Math.min(6, player.current.dy));
            player.current.y += player.current.dy;

            // Collisione con il pavimento
            if (player.current.y + player.current.height > groundY) {
                player.current.y = groundY - player.current.height;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                if (!canFlyActive) player.current.rotation += (0.15 * effectiveMultiplier);
            }

            world.current.x += BASE_SPEED * effectiveMultiplier;
            const prog = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(prog);

            if (prog >= 100) {
                setGameStatus('won'); return;
            }

            // Rendering Sfondo
            ctx.fillStyle = '#08081a'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Rendering Pavimento
            ctx.fillStyle = '#04040c'; 
            ctx.fillRect(0, groundY, canvas.width, groundHeight);
            ctx.strokeStyle = level.color; 
            ctx.lineWidth = 3; 
            ctx.strokeRect(0, groundY, canvas.width, 2);

            const px = canvas.width > 600 ? 150 : 80;

            // Ostacoli e Collisioni
            world.current.obstacles.forEach((o, i) => {
                const ox = o.x - world.current.x;
                if (ox < -100 || ox > canvas.width + 100) return;

                if (o.type === 'spike') {
                    ctx.fillStyle = '#ff4444'; 
                    ctx.beginPath(); 
                    ctx.moveTo(ox, groundY); 
                    ctx.lineTo(ox + o.width/2, groundY - o.height); 
                    ctx.lineTo(ox + o.width, groundY); 
                    ctx.fill();
                } else if (o.type === 'block') {
                    ctx.fillStyle = '#2d3a61'; 
                    ctx.fillRect(ox, groundY - o.height, o.width, o.height);
                    ctx.strokeStyle = 'white'; 
                    ctx.lineWidth = 1; 
                    ctx.strokeRect(ox, groundY - o.height, o.width, o.height);
                } else if (o.type === 'gem') {
                    ctx.fillStyle = '#00ffff'; 
                    ctx.beginPath(); 
                    ctx.arc(ox + o.width/2, groundY - 40, 8, 0, Math.PI * 2); 
                    ctx.fill();
                }

                // Hitbox Collision
                const pBox = { x: px + 5, y: player.current.y + 5, w: player.current.width - 10, h: player.current.height - 10 };
                const oBox = { x: ox, y: groundY - o.height, w: o.width, h: o.height };

                if (pBox.x < oBox.x + oBox.w && pBox.x + pBox.w > oBox.x && pBox.y < oBox.y + oBox.h && pBox.y + pBox.h > oBox.y) {
                    if (o.type === 'gem') { 
                        world.current.obstacles.splice(i, 1); 
                        setGemsCollected(g => g + 5); 
                    } else {
                        setGameStatus('lost');
                    }
                }
            });

            // Player Icon
            ctx.save();
            ctx.translate(px + player.current.width/2, player.current.y + player.current.height/2);
            ctx.rotate(player.current.rotation);
            ctx.fillStyle = skin.color;
            ctx.font = '900 30px "Font Awesome 6 Free"'; 
            ctx.textAlign = 'center'; 
            ctx.textBaseline = 'middle';
            const iconChar = { 'fa-square': '\uf0c8', 'fa-cat': '\uf6be', 'fa-dragon': '\uf6d5', 'fa-crown': '\uf521', 'fa-bolt': '\uf0e7', 'fa-robot': '\uf544', 'fa-sun': '\uf185', 'fa-spider': '\uf717', 'fa-skull': '\uf54c', 'fa-snowman': '\uf7d0', 'fa-sleigh': '\uf7cc', 'fa-tree': '\uf1bb', 'fa-gift': '\uf06b', 'fa-candy-cane': '\uf786', 'fa-crosshairs': '\uf05b', 'fa-user-secret': '\uf21b' }[skin.icon] || '\uf0c8';
            ctx.fillText(iconChar, 0, 0);
            ctx.strokeStyle = 'white'; 
            ctx.lineWidth = 1; 
            ctx.strokeText(iconChar, 0, 0);
            ctx.restore();

            animationFrameId = requestAnimationFrame(loop);
        };

        const onStart = (e: any) => { 
            e.preventDefault(); 
            inputHeld.current = true; 
            if(!canFlyActive && player.current.isGrounded) { 
                player.current.dy = JUMP_FORCE; 
                player.current.isGrounded = false; 
            } 
        };
        const onEndInput = (e: any) => { 
            e.preventDefault(); 
            inputHeld.current = false; 
        };

        canvas.addEventListener('touchstart', onStart, { passive: false });
        canvas.addEventListener('touchend', onEndInput, { passive: false });
        canvas.addEventListener('mousedown', onStart);
        canvas.addEventListener('mouseup', onEndInput);

        loop();
        return () => { 
            cancelAnimationFrame(animationFrameId); 
            canvas.removeEventListener('touchstart', onStart); 
            canvas.removeEventListener('touchend', onEndInput);
            canvas.removeEventListener('mousedown', onStart);
            canvas.removeEventListener('mouseup', onEndInput);
        };
    }, [gameStatus, level, skin]);

    return (
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
            
            {/* Forza Orizzontale */}
            {isPortrait && (
                <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center">
                    <i className="fas fa-mobile-screen text-6xl text-white rotate-90 mb-6 animate-bounce"></i>
                    <h2 className="text-xl font-black text-white uppercase italic">RUOTA IL TELEFONO</h2>
                    <p className="text-gray-500 text-[9px] mt-2 uppercase font-bold">Usa la modalità orizzontale per giocare correttamente.</p>
                </div>
            )}

            {/* HUD Gara */}
            <div className="absolute top-0 left-0 w-full p-2 flex justify-between pointer-events-none z-10 pt-[calc(env(safe-area-inset-top)+6px)] px-[calc(env(safe-area-inset-left)+12px)] pr-[calc(env(safe-area-inset-right)+12px)]">
                <div className="bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                    <span className="text-white font-black italic text-[10px] md:text-sm">{Math.floor(progress)}%</span>
                </div>
                <div className="bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                    <span className="text-blue-400 font-black text-[9px] md:text-sm">+{gemsCollected} Gemme</span>
                </div>
            </div>

            {/* Modal Fine Gara */}
            {gameStatus !== 'playing' && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[200] backdrop-blur-xl animate-in zoom-in duration-300 p-4">
                    <div className="bg-gray-900 border-2 border-white/10 p-5 md:p-8 rounded-[2rem] text-center w-full max-w-xs shadow-2xl">
                        <i className={`fas ${gameStatus === 'won' ? 'fa-trophy text-yellow-400' : 'fa-skull-crossbones text-red-600'} text-4xl mb-4`}></i>
                        <h2 className="text-lg font-black italic text-white uppercase mb-4">{gameStatus === 'won' ? 'LIVELLO COMPLETATO!' : 'HAI PERSO!'}</h2>
                        <div className="flex flex-col gap-2">
                            <button onClick={gameStatus === 'won' ? () => onEnd(true, gemsCollected) : initLevel} className="bg-blue-600 py-3 rounded-xl text-white font-black uppercase tracking-widest text-[10px] active:scale-95 shadow-lg border-b-4 border-blue-800">Continua</button>
                            <button onClick={() => onEnd(false, 0)} className="bg-gray-800 py-2 rounded-xl text-gray-500 font-black uppercase tracking-widest text-[8px] active:scale-95">Esci</button>
                        </div>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="flex-1 block" />
        </div>
    );
};

export default GameView;
