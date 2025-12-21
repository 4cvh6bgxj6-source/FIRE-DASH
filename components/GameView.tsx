
import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';
import AdminPanel from './AdminPanel';

interface Projectile { x: number; y: number; width: number; height: number; speed: number; type: 'normal' | 'laser'; }
interface PlayerProjectile { x: number; y: number; width: number; height: number; speed: number; rotation: number; active: boolean; type: 'gift' | 'rocket'; }
interface Effect { x: number; y: number; text: string; life: number; color: string; }

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
    const [bossHP, setBossHP] = useState(100); 
    const [isPortrait, setIsPortrait] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [isGodMode, setIsGodMode] = useState(false);
    const [adminFly, setAdminFly] = useState(false); 
    const [adminSpeed, setAdminSpeed] = useState(1); 
    
    const inputHeld = useRef(false);
    const shootCooldown = useRef(0); 
    const effects = useRef<Effect[]>([]);

    const player = useRef({ y: 0, dy: 0, width: 40, height: 40, rotation: 0, isGrounded: false });
    const world = useRef({ x: 0, obstacles: [] as any[], projectiles: [] as Projectile[], playerProjectiles: [] as PlayerProjectile[], bossY: 300, bossTimer: 0, bossColor: '#4a044e', bossPhase: 1, levelLength: 10000 });

    const isError666 = skin.id === 's666'; 
    const canFlyActive = skin.canFly || adminFly;
    const isBossLevel = level.isBossBattle || false;
    const canSantaShoot = skin.canShoot || false;
    const isBossHunterSkin = skin.id === 's-boss' || skin.hasBossFinisher || false;
    const isBazookaEquipped = isBossHunterSkin && isBossLevel;
    const canBazookaShoot = isBazookaEquipped && progress > 2; 
    const showShootButton = canSantaShoot || canBazookaShoot;
    const hasAdminAccess = isError666 || skin.id === 's8';

    const getEffectiveMultiplier = () => (level.id === '14' && isVip) ? 2 : level.speedMultiplier;
    const effectiveMultiplier = getEffectiveMultiplier();

    // Gestione ridimensionamento e orientamento
    useEffect(() => {
        const updateLayout = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const portrait = height > width;
            setIsPortrait(portrait);
            
            if (canvasRef.current) {
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                // Inizializza posizione player rispetto al suolo corrente
                if (gameStatus === 'playing' && player.current.y === 0) {
                    player.current.y = height - 140;
                }
            }
        };

        window.addEventListener('resize', updateLayout);
        window.addEventListener('orientationchange', updateLayout);
        updateLayout();
        
        return () => {
            window.removeEventListener('resize', updateLayout);
            window.removeEventListener('orientationchange', updateLayout);
        };
    }, [gameStatus]);

    const initLevel = () => {
        const obstacles: any[] = [];
        const levelLength = 10000 + (parseInt(level.id) * 2000); 
        world.current.levelLength = levelLength;
        world.current.x = 0;
        world.current.projectiles = [];
        world.current.playerProjectiles = [];
        world.current.bossTimer = 0;
        effects.current = [];
        
        const canvas = canvasRef.current;
        player.current.y = (canvas ? canvas.height : window.innerHeight) - 140;
        player.current.dy = 0;
        player.current.rotation = 0;

        const spacing = 450 / effectiveMultiplier;
        if (!level.isBossBattle) {
            for (let i = 1200; i < levelLength - 1000; i += spacing + (Math.random() * 250)) {
                const rand = Math.random();
                if (rand < 0.45) obstacles.push({ x: i, width: 40, height: 40, type: 'spike' });
                else if (rand < 0.75) obstacles.push({ x: i, width: 60, height: 60, type: 'block' });
                else obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
            }
        } else {
            for (let i = 1200; i < levelLength - 1000; i += 800) obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
        }
        world.current.obstacles = obstacles;
        setGemsCollected(0);
        setProgress(0);
        setBossHP(100);
        setGameStatus('playing');
    };

    useEffect(() => { initLevel(); }, [level.id, skin.id]);

    const handleShoot = () => {
        if (gameStatus !== 'playing' || !showShootButton || shootCooldown.current > 0) return;
        const currentWorldSpeed = BASE_SPEED * effectiveMultiplier * adminSpeed;
        let projType: 'gift' | 'rocket' = canBazookaShoot ? 'rocket' : 'gift';
        world.current.playerProjectiles.push({
            x: world.current.x + 150 + 60, 
            y: player.current.y + 10,
            width: projType === 'rocket' ? 80 : 35,
            height: projType === 'rocket' ? 25 : 35,
            speed: currentWorldSpeed + (projType === 'rocket' ? 40 : 22),
            rotation: 0,
            active: true,
            type: projType
        });
        shootCooldown.current = projType === 'rocket' ? 9 : 25; 
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;
        let animationFrameId: number;

        const handleInput = (active: boolean) => {
            if (gameStatus !== 'playing') return;
            inputHeld.current = active;
            if (!canFlyActive && active && player.current.isGrounded) {
                player.current.dy = JUMP_FORCE;
                player.current.isGrounded = false;
            }
        };

        const onKey = (e: KeyboardEvent) => { 
            if(e.code === 'Space' || e.code === 'ArrowUp') handleInput(true); 
            if(e.code === 'KeyF') handleShoot(); 
        };
        const onKeyUp = (e: KeyboardEvent) => { if(e.code === 'Space' || e.code === 'ArrowUp') handleInput(false); };
        
        const onTouchStart = (e: TouchEvent) => { if (e.target === canvas) handleInput(true); };
        const onTouchEnd = (e: TouchEvent) => { if (e.target === canvas) handleInput(false); };

        window.addEventListener('keydown', onKey);
        window.addEventListener('keyup', onKeyUp);
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd, { passive: false });
        
        const drawPlayer = (pX: number, pY: number) => {
            ctx.save();
            ctx.translate(pX + 20, pY + 20);
            if (skin.id === 's-man') {
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -18, 7, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(0, 5); ctx.stroke();
            } else {
                ctx.rotate(canFlyActive ? Math.max(-0.5, Math.min(0.5, player.current.dy * 0.1)) : player.current.rotation);
                ctx.fillStyle = isError666 ? (Math.random() > 0.85 ? 'white' : '#ff0000') : skin.color;
                const iconMap: any = { 'fa-square': '\uf0c8', 'fa-cat': '\uf6be', 'fa-dragon': '\uf6d5', 'fa-crown': '\uf521', 'fa-bolt': '\uf0e7', 'fa-robot': '\uf544', 'fa-sun': '\uf185', 'fa-spider': '\uf717', 'fa-skull': '\uf54c', 'fa-snowman': '\uf7d0', 'fa-sleigh': '\uf7cc', 'fa-tree': '\uf1bb', 'fa-gift': '\uf06b', 'fa-candy-cane': '\uf786', 'fa-crosshairs': '\uf05b', 'fa-user-secret': '\uf21b' };
                let iconChar = iconMap[skin.icon] || '\uf0c8';
                ctx.font = '900 36px "Font Awesome 6 Free"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(iconChar, 0, 0);
                ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5; ctx.strokeText(iconChar, 0, 0);
                if (isBazookaEquipped) {
                    ctx.save(); ctx.rotate(0.1); ctx.fillStyle = '#444'; ctx.fillRect(10, -10, 60, 20); ctx.restore();
                }
            }
            ctx.restore();
        };

        const render = () => {
            if (gameStatus !== 'playing') return;
            if (shootCooldown.current > 0) shootCooldown.current--;
            
            if (canFlyActive && inputHeld.current) player.current.dy += isError666 ? -1.45 : -0.9;
            player.current.dy += GAME_GRAVITY;
            if (canFlyActive) player.current.dy = Math.max(-13, Math.min(9, player.current.dy));
            player.current.y += player.current.dy;

            const groundY = canvas.height - 100;
            if (player.current.y + 40 > groundY) {
                player.current.y = groundY - 40;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                if (skin.id !== 's-man' && !canFlyActive) player.current.rotation += (0.2 * effectiveMultiplier * adminSpeed);
            }

            world.current.x += BASE_SPEED * effectiveMultiplier * adminSpeed;
            const prog = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(prog);
            
            if ((prog >= 100 || (level.isBossBattle && bossHP <= 0)) && gameStatus === 'playing') {
                setGemsCollected(level.isBossBattle ? 1000 : 100); setGameStatus('won'); return;
            }

            const px = 150;
            const bossScreenX = Math.max(px + 400, canvas.width - 280);
            const bossScreenY = world.current.bossY;

            // Logica Proiettili Player
            world.current.playerProjectiles.forEach(p => {
                if (!p.active) return; p.x += p.speed;
                const screenX = p.x - world.current.x;
                if (isBossLevel && screenX + p.width > bossScreenX && screenX < bossScreenX + 220 && p.y + p.height > bossScreenY && p.y < bossScreenY + 220) {
                    p.active = false; setBossHP(prev => Math.max(0, prev - (p.type === 'rocket' ? 20 : 5)));
                }
            });
            world.current.playerProjectiles = world.current.playerProjectiles.filter(p => p.active && p.x < world.current.x + canvas.width + 100);

            // Logica Boss
            if (isBossLevel && bossHP > 0) {
                world.current.bossY = (groundY - 280) + Math.sin(world.current.x * 0.02) * 160;
                world.current.bossTimer++;
                if (world.current.bossTimer > (bossHP < 30 ? 18 : 32) / effectiveMultiplier) {
                    world.current.bossTimer = 0;
                    const isL = bossHP < 50 && Math.random() > 0.4;
                    world.current.projectiles.push({ x: world.current.x + canvas.width, y: isL ? player.current.y + 5 : (Math.random() > 0.5 ? groundY - 60 : groundY - 160), width: isL ? 300 : 60, height: isL ? 35 : 60, speed: (bossHP < 30 ? 16 : 13) * effectiveMultiplier * (isL ? 2.8 : 1.8), type: isL ? 'laser' : 'normal' });
                }
            }

            // Collisioni Ostacoli
            world.current.obstacles.forEach((o, i) => {
                const ox = o.x - world.current.x;
                if (ox < px - 100 || ox > px + 100) return;
                if (px + 10 < ox + o.width - 10 && px + 30 > ox + 10 && player.current.y + 10 < groundY - o.height + o.height - 10 && player.current.y + 30 > groundY - o.height + 10) {
                    if (o.type === 'gem') { world.current.obstacles.splice(i, 1); setGemsCollected(g => g + 5); } 
                    else if (!isGodMode) setGameStatus('lost');
                }
            });

            // Collisioni Proiettili Boss
            world.current.projectiles.forEach((p, i) => {
                p.x -= p.speed; const sProjX = p.x - world.current.x;
                if (sProjX < -400) { world.current.projectiles.splice(i, 1); return; }
                if (sProjX < px + 35 && sProjX + p.width > px + 5 && player.current.y + 5 < p.y + p.height - 5 && player.current.y + 35 > p.y + 5) {
                    if (isBossHunterSkin && p.type !== 'laser' && Math.random() < 0.8) { world.current.projectiles.splice(i, 1); } 
                    else if (!isGodMode) setGameStatus('lost');
                }
            });

            // RENDERING
            ctx.fillStyle = isError666 ? (Math.random() > 0.9 ? '#300' : '#000') : '#08081a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#05050f'; ctx.fillRect(0, groundY, canvas.width, 100);
            ctx.strokeStyle = level.color; ctx.lineWidth = 4; ctx.strokeRect(0, groundY, canvas.width, 2);

            world.current.obstacles.forEach(o => {
                const ox = o.x - world.current.x; if (ox < -100 || ox > canvas.width + 100) return;
                if (o.type === 'spike') {
                    ctx.fillStyle = '#ff3333'; ctx.beginPath(); ctx.moveTo(ox, groundY); ctx.lineTo(ox+20, groundY-40); ctx.lineTo(ox+40, groundY); ctx.fill();
                } else if (o.type === 'block') {
                    ctx.fillStyle = '#334466'; ctx.fillRect(ox, groundY-o.height, o.width, o.height);
                } else if (o.type === 'gem') {
                    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(ox+20, groundY-50, 12, 0, Math.PI*2); ctx.fill();
                }
            });

            if (isBossLevel && bossHP > 0) {
                ctx.save(); ctx.translate(bossScreenX + 110, bossScreenY + 110);
                ctx.beginPath(); ctx.fillStyle = 'white'; ctx.ellipse(0, 0, 110, 95, 0.1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
                world.current.projectiles.forEach(p => { ctx.fillStyle = p.type === 'laser' ? '#ff0000' : '#ffff00'; ctx.fillRect(p.x - world.current.x, p.y, p.width, p.height); });
            }

            drawPlayer(px, player.current.y);
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => { 
            cancelAnimationFrame(animationFrameId); 
            window.removeEventListener('keydown', onKey); 
            window.removeEventListener('keyup', onKeyUp); 
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchend', onTouchEnd);
        };
    }, [gameStatus, level, skin, isGodMode, adminFly, adminSpeed, bossHP]); 

    return (
        <div className={`h-full w-full relative bg-black overflow-hidden flex flex-col ${isError666 ? 'glitch-screen' : ''}`}>
            {/* Overlay Orientamento */}
            {isPortrait && (
                <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 mb-6 animate-bounce">
                        <i className="fas fa-mobile-screen text-6xl text-white rotate-90"></i>
                    </div>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">GIOCA IN ORIZZONTALE</h2>
                    <p className="text-blue-400 font-bold uppercase tracking-widest text-[9px]">Ruota il telefono per iniziare la sfida!</p>
                </div>
            )}

            {hasAdminAccess && (
                <button onClick={() => setShowAdminPanel(true)} className="fixed top-4 left-4 z-50 bg-black/80 border w-8 h-8 rounded-full flex items-center justify-center text-green-500 border-green-500 pt-safe pl-safe"><i className="fas fa-terminal text-[10px]"></i></button>
            )}

            {showAdminPanel && (
                <AdminPanel onClose={() => setShowAdminPanel(false)} onInstantWin={() => setGameStatus('won')} onToggleGodMode={setIsGodMode} isGodMode={isGodMode} onToggleFly={setAdminFly} isFlyMode={adminFly} onSetSpeed={setAdminSpeed} currentSpeed={adminSpeed} restrictedView={skin.id === 's8'} />
            )}
            
            {/* UI Overlay di Gioco */}
            <div className="absolute top-2 left-2 z-10 pl-safe pt-safe pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 flex items-center gap-3">
                    <div className="flex flex-col">
                        <div className="text-[7px] uppercase font-bold text-gray-400 tracking-tighter">{username}</div>
                        <div className="text-xs font-black italic text-white leading-none">{Math.floor(progress)}%</div>
                    </div>
                    <div className="h-6 w-[1px] bg-white/10"></div>
                    <div className="flex items-center gap-1.5">
                        <i className="fas fa-gem text-blue-400 text-[9px]"></i>
                        <span className="text-[10px] font-black text-white">{gemsCollected}</span>
                    </div>
                </div>
            </div>

            {isBossLevel && bossHP > 0 && gameStatus === 'playing' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[60%] max-w-sm z-20 flex flex-col items-center pt-safe">
                    <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-white/20 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                        <div className="h-full bg-red-600 transition-all duration-300" style={{width: `${bossHP}%`}}></div>
                    </div>
                    <div className="text-[7px] font-black text-red-500 uppercase mt-1 tracking-widest">BOSS HP</div>
                </div>
            )}

            {showShootButton && gameStatus === 'playing' && (
                <button 
                    onClick={handleShoot} 
                    className="fixed bottom-4 right-4 z-50 w-16 h-16 rounded-full border-2 border-white shadow-xl flex items-center justify-center active:scale-90 transition-all bg-red-600 pr-safe pb-safe"
                >
                    <i className={`fas ${canBazookaShoot ? 'fa-rocket' : 'fa-gift'} text-xl text-white`}></i>
                </button>
            )}

            {/* Schermata Fine Gara */}
            {gameStatus !== 'playing' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl">
                    <div className="bg-gray-900 border-2 border-white/10 rounded-[2rem] p-6 flex flex-col items-center text-center max-w-[280px] w-full">
                        <i className={`fas ${gameStatus === 'won' ? 'fa-trophy text-yellow-400' : 'fa-skull-crossbones text-red-600'} text-4xl mb-4`}></i>
                        <h2 className="text-xl font-black italic text-white mb-2 uppercase">{gameStatus === 'won' ? 'LIVELLO COMPLETATO!' : 'GAME OVER!'}</h2>
                        <div className="text-xl font-black text-white mb-6">+{gemsCollected} <span className="text-[10px] text-blue-400 uppercase">GEMME</span></div>
                        <div className="flex flex-col gap-2 w-full">
                            <button onClick={gameStatus === 'won' ? () => onEnd(true, gemsCollected) : initLevel} className="w-full bg-blue-600 text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs active:scale-95">{gameStatus === 'won' ? 'CONTINUA' : 'RIPROVA'}</button>
                            <button onClick={() => onEnd(gameStatus === 'won', gameStatus === 'won' ? gemsCollected : 0)} className="w-full bg-gray-800 text-gray-400 font-black py-2 rounded-xl uppercase text-[9px] active:scale-95">MENU PRINCIPALE</button>
                        </div>
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} className="w-full h-full bg-black" />
        </div>
    );
};

export default GameView;
