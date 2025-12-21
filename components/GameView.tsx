import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';
import AdminPanel from './AdminPanel';

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
    
    // Admin States
    const [showAdmin, setShowAdmin] = useState(false);
    const [godMode, setGodMode] = useState(false);
    const [flyMode, setFlyMode] = useState(false);
    const [speedHack, setSpeedHack] = useState(1);

    const inputHeld = useRef(false);
    const player = useRef({ y: 0, dy: 0, width: 52, height: 52, rotation: 0, isGrounded: false });
    const world = useRef({ x: 0, obstacles: [] as any[], levelLength: 10000 });

    const isGlitchedSkin = skin.isGlitched;
    const effectiveMultiplier = (level.id === '14' && isVip) ? 2 : level.speedMultiplier;

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setIsPortrait(height > width);
            if (canvasRef.current) {
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                const groundH = height < 400 ? 70 : 120;
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
        const groundH = h < 400 ? 70 : 120;
        player.current.y = h - groundH - player.current.height;
        player.current.dy = 0;
        player.current.rotation = 0;

        const obstacles: any[] = [];
        const spacing = 550 / effectiveMultiplier;
        for (let i = 1300; i < levelLength - 500; i += spacing + (Math.random() * 450)) {
            const rand = Math.random();
            if (rand < 0.45) obstacles.push({ x: i, width: 52, height: 52, type: 'spike' });
            else if (rand < 0.75) obstacles.push({ x: i, width: 75, height: 75, type: 'block' });
            else obstacles.push({ x: i, width: 38, height: 38, type: 'gem' });
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

            const groundHeight = canvas.height < 400 ? 70 : 120;
            const groundY = canvas.height - groundHeight;
            
            // Logica Salto / Volo
            if ((skin.canFly || flyMode) && inputHeld.current) {
                player.current.dy -= 0.9;
            }
            
            player.current.dy += GAME_GRAVITY;
            
            if (skin.canFly || flyMode) {
                player.current.dy = Math.max(-10, Math.min(8, player.current.dy));
            }
            
            player.current.y += player.current.dy;

            if (player.current.y + player.current.height > groundY) {
                player.current.y = groundY - player.current.height;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                if (!skin.canFly && !flyMode) player.current.rotation += (0.17 * effectiveMultiplier * speedHack);
            }

            world.current.x += BASE_SPEED * effectiveMultiplier * speedHack;
            const prog = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(prog);

            if (prog >= 100) { setGameStatus('won'); return; }

            // EFFETTI GLITCH DINAMICI
            let glitchOffsetX = 0;
            let glitchOffsetY = 0;
            let bgColor = '#08081a';
            
            if (isGlitchedSkin) {
                if (Math.random() > 0.8) {
                    glitchOffsetX = (Math.random() - 0.5) * 10;
                    glitchOffsetY = (Math.random() - 0.5) * 10;
                    const colors = ['#08081a', '#200000', '#002000', '#000020', '#1a081a'];
                    bgColor = colors[Math.floor(Math.random() * colors.length)];
                }
            }

            // Rendering Background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Terreno con potenziale glitch
            ctx.fillStyle = isGlitchedSkin && Math.random() > 0.9 ? '#ff00ff' : '#050510';
            ctx.fillRect(glitchOffsetX, groundY + glitchOffsetY, canvas.width, groundHeight);
            ctx.strokeStyle = isGlitchedSkin && Math.random() > 0.9 ? '#00ff00' : level.color;
            ctx.lineWidth = 5;
            ctx.strokeRect(glitchOffsetX, groundY + glitchOffsetY, canvas.width, 4);

            const px = canvas.width > 600 ? 250 : 120;

            world.current.obstacles.forEach((o, i) => {
                const ox = o.x - world.current.x + glitchOffsetX;
                if (ox < -100 || ox > canvas.width + 100) return;

                if (o.type === 'spike') {
                    ctx.fillStyle = isGlitchedSkin && Math.random() > 0.9 ? '#ffffff' : '#ff4444';
                    ctx.beginPath(); 
                    ctx.moveTo(ox, groundY + glitchOffsetY); 
                    ctx.lineTo(ox + o.width/2, groundY - o.height + glitchOffsetY); 
                    ctx.lineTo(ox + o.width, groundY + glitchOffsetY); 
                    ctx.fill();
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
                } else if (o.type === 'block') {
                    ctx.fillStyle = isGlitchedSkin && Math.random() > 0.9 ? '#0000ff' : '#3b4d7a';
                    ctx.fillRect(ox, groundY - o.height + glitchOffsetY, o.width, o.height);
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 3; ctx.strokeRect(ox, groundY - o.height + glitchOffsetY, o.width, o.height);
                } else if (o.type === 'gem') {
                    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(ox + o.width/2, groundY - 60 + glitchOffsetY, 14, 0, Math.PI*2); ctx.fill();
                    ctx.shadowBlur = 15; ctx.shadowColor = '#00ffff'; ctx.stroke(); ctx.shadowBlur = 0;
                }

                // Hitbox Collision (Ignora se God Mode attivo)
                const pBox = { x: px + 8, y: player.current.y + 8, w: player.current.width - 16, h: player.current.height - 16 };
                const oBox = { x: ox, y: groundY - o.height + glitchOffsetY, w: o.width, h: o.height };

                if (pBox.x < oBox.x + oBox.w && pBox.x + pBox.w > oBox.x && pBox.y < oBox.y + oBox.h && pBox.y + pBox.h > oBox.y) {
                    if (o.type === 'gem') { world.current.obstacles.splice(i, 1); setGemsCollected(g => g + 5); }
                    else if (!godMode) setGameStatus('lost');
                }
            });

            // Player Icon (con sfarfallio glitch)
            if (!(isGlitchedSkin && Math.random() > 0.95)) {
                ctx.save();
                ctx.translate(px + player.current.width/2 + glitchOffsetX, player.current.y + player.current.height/2 + glitchOffsetY);
                ctx.rotate(player.current.rotation);
                ctx.fillStyle = isGlitchedSkin && Math.random() > 0.8 ? '#00ff00' : skin.color;
                ctx.font = '900 48px "Font Awesome 6 Free"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                const iconChar = { 'fa-square': '\uf0c8', 'fa-cat': '\uf6be', 'fa-dragon': '\uf6d5', 'fa-crown': '\uf521', 'fa-bolt': '\uf0e7', 'fa-robot': '\uf544', 'fa-sun': '\uf185', 'fa-spider': '\uf717', 'fa-skull': '\uf54c', 'fa-snowman': '\uf7d0', 'fa-sleigh': '\uf7cc', 'fa-tree': '\uf1bb', 'fa-gift': '\uf06b', 'fa-candy-cane': '\uf786', 'fa-crosshairs': '\uf05b', 'fa-user-secret': '\uf21b', 'fa-running': '\uf70c' }[skin.icon] || '\uf0c8';
                ctx.fillText(iconChar, 0, 0);
                ctx.strokeStyle = 'white'; ctx.lineWidth = 3; ctx.strokeText(iconChar, 0, 0);
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        const onStart = (e: any) => { 
            e.preventDefault(); 
            inputHeld.current = true; 
            if(!skin.canFly && !flyMode && player.current.isGrounded) { player.current.dy = JUMP_FORCE; player.current.isGrounded = false; } 
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
    }, [gameStatus, level, skin, godMode, flyMode, speedHack]);

    return (
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
            {isPortrait && (
                <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center backdrop-blur-3xl">
                    <i className="fas fa-mobile-screen text-8xl text-white rotate-90 mb-8 animate-bounce"></i>
                    <h2 className="text-3xl font-black text-white uppercase italic">RUOTA IL TELEFONO</h2>
                    <p className="text-gray-400 text-lg mt-4 uppercase font-bold">Usa lo schermo intero!</p>
                </div>
            )}

            {/* HUD Ultra-Big con Bottone Admin */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between pointer-events-none z-10 pt-[calc(env(safe-area-inset-top)+10px)] px-[calc(env(safe-area-inset-left)+25px)] pr-[calc(env(safe-area-inset-right)+25px)]">
                <div className="flex gap-4 pointer-events-auto">
                    <div className="bg-black/70 px-6 py-3 rounded-[1.5rem] border-2 border-white/30 backdrop-blur-md">
                        <span className="text-white font-black italic text-xl md:text-4xl">{Math.floor(progress)}%</span>
                    </div>
                    {/* Pulsante Admin visible solo in Landscape (non Portrait) */}
                    {!isPortrait && (
                        <button 
                            onClick={() => setShowAdmin(true)}
                            className="bg-green-600/80 px-4 py-3 rounded-[1.5rem] border-2 border-green-400 text-white active:scale-90"
                        >
                            <i className="fas fa-terminal md:text-2xl"></i>
                        </button>
                    )}
                </div>
                
                <div className="bg-black/70 px-6 py-3 rounded-[1.5rem] border-2 border-white/30 backdrop-blur-md">
                    <span className="text-blue-400 font-black text-lg md:text-3xl">+{gemsCollected} GEMME</span>
                </div>
            </div>

            {/* Admin Panel Modal */}
            {showAdmin && (
                <AdminPanel 
                    onClose={() => setShowAdmin(false)}
                    onInstantWin={() => setGameStatus('won')}
                    onToggleGodMode={setGodMode}
                    isGodMode={godMode}
                    onToggleFly={setFlyMode}
                    isFlyMode={flyMode}
                    onSetSpeed={setSpeedHack}
                    currentSpeed={speedHack}
                    restrictedView={!isVip}
                />
            )}

            {gameStatus !== 'playing' && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[200] backdrop-blur-xl p-6">
                    <div className="bg-gray-900 border-4 border-white/20 p-10 rounded-[4rem] text-center w-full max-w-lg shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                        <i className={`fas ${gameStatus === 'won' ? 'fa-trophy text-yellow-400' : 'fa-skull-crossbones text-red-600'} text-7xl mb-8`}></i>
                        <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase mb-12">{gameStatus === 'won' ? 'VITTORIA!' : 'HAI PERSO!'}</h2>
                        <div className="flex flex-col gap-6">
                            <button onClick={gameStatus === 'won' ? () => onEnd(true, gemsCollected) : initLevel} className="bg-blue-600 py-6 rounded-3xl text-white font-black uppercase text-xl md:text-3xl active:scale-95 shadow-lg border-b-8 border-blue-900">CONTINUA</button>
                            <button onClick={() => onEnd(false, 0)} className="bg-gray-800 py-5 rounded-3xl text-gray-500 font-black uppercase text-sm md:text-xl active:scale-95">TORNA AL MENU</button>
                        </div>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="flex-1 block" />
        </div>
    );
};

export default GameView;