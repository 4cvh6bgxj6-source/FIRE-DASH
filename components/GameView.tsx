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
    // Player e Ostacoli più grandi (da 32 a 42 pixel)
    const player = useRef({ y: 0, dy: 0, width: 42, height: 42, rotation: 0, isGrounded: false });
    const world = useRef({ x: 0, obstacles: [] as any[], levelLength: 10000 });

    const effectiveMultiplier = (level.id === '14' && isVip) ? 2 : level.speedMultiplier;

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setIsPortrait(height > width);
            
            if (canvasRef.current) {
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                
                // Ground proporzionale all'altezza
                const groundH = height < 400 ? 60 : 100;
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
        
        const groundH = h < 400 ? 60 : 100;
        player.current.y = h - groundH - player.current.height;
        player.current.dy = 0;
        player.current.rotation = 0;

        const obstacles: any[] = [];
        const spacing = 500 / effectiveMultiplier;
        for (let i = 1200; i < levelLength - 500; i += spacing + (Math.random() * 400)) {
            const rand = Math.random();
            // Dimensioni ostacoli aumentate
            if (rand < 0.45) obstacles.push({ x: i, width: 42, height: 42, type: 'spike' });
            else if (rand < 0.75) obstacles.push({ x: i, width: 60, height: 60, type: 'block' });
            else obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
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

            const groundHeight = canvas.height < 400 ? 60 : 100;
            const groundY = canvas.height - groundHeight;
            
            if (skin.canFly && inputHeld.current) player.current.dy -= 0.8;
            player.current.dy += GAME_GRAVITY;
            if (skin.canFly) player.current.dy = Math.max(-9, Math.min(7, player.current.dy));
            player.current.y += player.current.dy;

            if (player.current.y + player.current.height > groundY) {
                player.current.y = groundY - player.current.height;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                if (!skin.canFly) player.current.rotation += (0.16 * effectiveMultiplier);
            }

            world.current.x += BASE_SPEED * effectiveMultiplier;
            const prog = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(prog);

            if (prog >= 100) { setGameStatus('won'); return; }

            ctx.fillStyle = '#08081a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#050510'; ctx.fillRect(0, groundY, canvas.width, groundHeight);
            ctx.strokeStyle = level.color; ctx.lineWidth = 4; ctx.strokeRect(0, groundY, canvas.width, 3);

            const px = canvas.width > 600 ? 200 : 100;

            world.current.obstacles.forEach((o, i) => {
                const ox = o.x - world.current.x;
                if (ox < -100 || ox > canvas.width + 100) return;

                if (o.type === 'spike') {
                    ctx.fillStyle = '#ff4444'; ctx.beginPath(); 
                    ctx.moveTo(ox, groundY); ctx.lineTo(ox+o.width/2, groundY-o.height); ctx.lineTo(ox+o.width, groundY); 
                    ctx.fill();
                } else if (o.type === 'block') {
                    ctx.fillStyle = '#3b4d7a'; ctx.fillRect(ox, groundY-o.height, o.width, o.height);
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(ox, groundY-o.height, o.width, o.height);
                } else if (o.type === 'gem') {
                    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(ox+o.width/2, groundY-50, 10, 0, Math.PI*2); ctx.fill();
                }

                const pBox = { x: px + 6, y: player.current.y + 6, w: player.current.width - 12, h: player.current.height - 12 };
                const oBox = { x: ox, y: groundY - o.height, w: o.width, h: o.height };

                if (pBox.x < oBox.x + oBox.w && pBox.x + pBox.w > oBox.x && pBox.y < oBox.y + oBox.h && pBox.y + pBox.h > oBox.y) {
                    if (o.type === 'gem') { world.current.obstacles.splice(i, 1); setGemsCollected(g => g + 5); }
                    else setGameStatus('lost');
                }
            });

            ctx.save();
            ctx.translate(px + player.current.width/2, player.current.y + player.current.height/2);
            ctx.rotate(player.current.rotation);
            ctx.fillStyle = skin.color;
            ctx.font = '900 38px "Font Awesome 6 Free"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const iconChar = { 'fa-square': '\uf0c8', 'fa-cat': '\uf6be', 'fa-dragon': '\uf6d5', 'fa-crown': '\uf521', 'fa-bolt': '\uf0e7', 'fa-robot': '\uf544', 'fa-sun': '\uf185', 'fa-spider': '\uf717', 'fa-skull': '\uf54c', 'fa-snowman': '\uf7d0', 'fa-sleigh': '\uf7cc', 'fa-tree': '\uf1bb', 'fa-gift': '\uf06b', 'fa-candy-cane': '\uf786', 'fa-crosshairs': '\uf05b', 'fa-user-secret': '\uf21b', 'fa-running': '\uf70c' }[skin.icon] || '\uf0c8';
            ctx.fillText(iconChar, 0, 0);
            ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeText(iconChar, 0, 0);
            ctx.restore();

            animationFrameId = requestAnimationFrame(loop);
        };

        const onStart = (e: any) => { 
            e.preventDefault(); 
            inputHeld.current = true; 
            if(!skin.canFly && player.current.isGrounded) { player.current.dy = JUMP_FORCE; player.current.isGrounded = false; } 
        };
        const onEndInput = (e: any) => { e.preventDefault(); inputHeld.current = false; };

        canvas.addEventListener('touchstart', onStart, { passive: false });
        canvas.addEventListener('touchend', onEndInput, { passive: false });
        canvas.addEventListener('mousedown', onStart);
        canvas.addEventListener('mouseup', onEndInput);

        loop();
        return () => { 
            cancelAnimationFrame(animationFrameId); 
            canvas.removeEventListener('touchstart', onStart); canvas.removeEventListener('touchend', onEndInput);
            canvas.removeEventListener('mousedown', onStart); canvas.removeEventListener('mouseup', onEndInput);
        };
    }, [gameStatus, level, skin]);

    return (
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
            {isPortrait && (
                <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl">
                    <i className="fas fa-mobile-screen text-7xl text-white rotate-90 mb-6 animate-bounce"></i>
                    <h2 className="text-2xl font-black text-white uppercase italic">GIRA IL TELEFONO</h2>
                    <p className="text-gray-400 text-sm mt-3 uppercase font-bold">Usa la modalità orizzontale!</p>
                </div>
            )}

            {/* HUD Ingrandito */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between pointer-events-none z-10 pt-[calc(env(safe-area-inset-top)+8px)] px-[calc(env(safe-area-inset-left)+20px)] pr-[calc(env(safe-area-inset-right)+20px)]">
                <div className="bg-black/70 px-5 py-2 rounded-2xl border border-white/20 backdrop-blur-md">
                    <span className="text-white font-black italic text-sm md:text-2xl">{Math.floor(progress)}%</span>
                </div>
                <div className="bg-black/70 px-5 py-2 rounded-2xl border border-white/20 backdrop-blur-md">
                    <span className="text-blue-400 font-black text-xs md:text-xl">+{gemsCollected} GEMME</span>
                </div>
            </div>

            {gameStatus !== 'playing' && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[200] backdrop-blur-xl p-6">
                    <div className="bg-gray-900 border-4 border-white/20 p-8 rounded-[3rem] text-center w-full max-w-sm shadow-2xl">
                        <i className={`fas ${gameStatus === 'won' ? 'fa-trophy text-yellow-400' : 'fa-skull-crossbones text-red-600'} text-5xl mb-6`}></i>
                        <h2 className="text-2xl md:text-4xl font-black italic text-white uppercase mb-8">{gameStatus === 'won' ? 'VITTORIA!' : 'HAI PERSO!'}</h2>
                        <div className="flex flex-col gap-4">
                            <button onClick={gameStatus === 'won' ? () => onEnd(true, gemsCollected) : initLevel} className="bg-blue-600 py-5 rounded-2xl text-white font-black uppercase text-sm md:text-xl active:scale-95 shadow-lg border-b-4 border-blue-900">CONTINUA</button>
                            <button onClick={() => onEnd(false, 0)} className="bg-gray-800 py-4 rounded-2xl text-gray-500 font-black uppercase text-xs md:text-sm active:scale-95">ESCI</button>
                        </div>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="flex-1 block" />
        </div>
    );
};

export default GameView;