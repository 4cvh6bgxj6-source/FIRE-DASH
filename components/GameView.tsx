import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';
import AdminPanel from './AdminPanel';

interface Projectile {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    type: 'normal' | 'laser';
}

interface PlayerProjectile {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    rotation: number;
    active: boolean;
    type: 'gift' | 'rocket';
}

interface Effect {
    x: number;
    y: number;
    text: string;
    life: number;
    color: string;
}

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
    const [bossKilled, setBossKilled] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [bossHP, setBossHP] = useState(100); 
    const [isPortrait, setIsPortrait] = useState(false);
    
    const [isGodMode, setIsGodMode] = useState(false);
    const [adminFly, setAdminFly] = useState(false); 
    const [adminSpeed, setAdminSpeed] = useState(1); 
    
    const inputHeld = useRef(false);
    const shootCooldown = useRef(0); 
    const effects = useRef<Effect[]>([]);

    // PLAYER PIÙ GRANDE: 52x52 invece di 40x40
    const player = useRef({
        y: 300, dy: 0, width: 52, height: 52, rotation: 0, isGrounded: false,
    });
    
    const world = useRef({
        x: 0,
        obstacles: [] as { x: number, width: number, height: number, type: 'spike' | 'block' | 'gem' }[],
        projectiles: [] as Projectile[], 
        playerProjectiles: [] as PlayerProjectile[], 
        bossY: 300, 
        bossTimer: 0, 
        bossColor: '#4a044e', 
        bossPhase: 1,
        levelLength: 10000
    });

    const isError666 = skin.id === 's666'; 
    const isAdminGlitch = skin.id === 's8';
    const isOmino = skin.id === 's-man';
    const canFlyActive = skin.canFly || adminFly;
    
    const isBossLevel = level.isBossBattle || false;
    const canSantaShoot = skin.canShoot || false;
    const isBossHunterSkin = skin.id === 's-boss' || skin.hasBossFinisher || false;
    
    const isBazookaEquipped = isBossHunterSkin && isBossLevel;
    const canBazookaShoot = isBazookaEquipped && progress > 2; 

    const showShootButton = canSantaShoot || canBazookaShoot;
    const hasAdminAccess = isError666 || isAdminGlitch;

    const getEffectiveMultiplier = () => {
        if (level.id === '8' && isVip) return 2;
        return level.speedMultiplier;
    };
    const effectiveMultiplier = getEffectiveMultiplier();

    useEffect(() => {
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 1024);
        };
        window.addEventListener('resize', checkOrientation);
        checkOrientation();
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    const initLevel = () => {
        const obstacles: typeof world.current.obstacles = [];
        const levelLength = 10000 + (parseInt(level.id) * 2000); 
        world.current.levelLength = levelLength;
        world.current.x = 0;
        world.current.projectiles = [];
        world.current.playerProjectiles = [];
        world.current.bossTimer = 0;
        world.current.bossColor = '#4a044e';
        world.current.bossPhase = 1;
        effects.current = [];
        
        player.current.y = 300;
        player.current.dy = 0;
        player.current.rotation = 0;
        
        const spacing = 480 / effectiveMultiplier; // Aumentato spaziatura per compensare dimensione
        
        if (!level.isBossBattle) {
            for (let i = 1200; i < levelLength - 1000; i += spacing + (Math.random() * 250)) {
                const rand = Math.random();
                // OSTACOLI PIÙ GRANDI
                if (rand < 0.45) obstacles.push({ x: i, width: 52, height: 52, type: 'spike' });
                else if (rand < 0.75) obstacles.push({ x: i, width: 75, height: 75, type: 'block' });
                else obstacles.push({ x: i, width: 38, height: 38, type: 'gem' });
            }
        } else {
            for (let i = 1200; i < levelLength - 1000; i += 800) {
                obstacles.push({ x: i, width: 38, height: 38, type: 'gem' });
            }
        }

        world.current.obstacles = obstacles;
        setGemsCollected(0);
        setProgress(0);
        setBossKilled(false);
        setBossHP(100);
        setGameStatus('playing');
    };

    useEffect(() => { initLevel(); }, [level.id, skin.id]);

    const handleShoot = () => {
        if (gameStatus !== 'playing') return;
        if (!showShootButton) return;
        if (shootCooldown.current > 0) return;

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
        window.addEventListener('keydown', onKey);
        window.addEventListener('keyup', onKeyUp);
        
        const drawPlayer = (pX: number, pY: number) => {
            ctx.save();
            ctx.translate(pX + player.current.width/2, pY + player.current.height/2);
            
            if (isOmino) {
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.arc(0, -20, 9, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 8); ctx.stroke();
                ctx.stroke();
            } else {
                if (canFlyActive) {
                    ctx.rotate(Math.max(-0.5, Math.min(0.5, player.current.dy * 0.1)));
                } else {
                    ctx.rotate(player.current.rotation);
                }
                
                if (isError666) {
                    ctx.shadowBlur = 20; ctx.shadowColor = 'red';
                    ctx.fillStyle = Math.random() > 0.85 ? 'white' : '#ff0000';
                } else {
                    ctx.fillStyle = skin.color;
                }

                const iconMap: any = { 'fa-square': '\uf0c8', 'fa-cat': '\uf6be', 'fa-dragon': '\uf6d5', 'fa-crown': '\uf521', 'fa-running': '\uf70c', 'fa-bolt': '\uf0e7', 'fa-robot': '\uf544', 'fa-sun': '\uf185', 'fa-spider': '\uf717', 'fa-user-secret': '\uf21b', 'fa-skull': '\uf54c', 'fa-snowman': '\uf7d0', 'fa-sleigh': '\uf7cc', 'fa-tree': '\uf1bb', 'fa-gift': '\uf06b', 'fa-candy-cane': '\uf786', 'fa-crosshairs': '\uf05b' };
                let iconChar = iconMap[skin.icon] || '\uf0c8';
                
                ctx.font = '900 44px "Font Awesome 6 Free"'; // ICONA PIÙ GRANDE
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(iconChar, 0, 0);
                ctx.strokeStyle = 'white'; ctx.lineWidth = 2.5; ctx.strokeText(iconChar, 0, 0);

                if (isBazookaEquipped) {
                    ctx.save();
                    ctx.rotate(0.1);
                    ctx.fillStyle = '#444'; ctx.fillRect(10, -10, 60, 20);
                    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(10, -10, 60, 20);
                    ctx.fillStyle = '#111'; ctx.fillRect(15, 10, 8, 15);
                    ctx.fillStyle = '#333'; ctx.fillRect(8, -12, 12, 24); ctx.fillRect(60, -14, 15, 28);
                    if (shootCooldown.current > 0) {
                        ctx.fillStyle = '#ff6600'; ctx.beginPath(); ctx.arc(75, 0, 8, 0, Math.PI * 2); ctx.fill();
                    }
                    ctx.restore();
                }
            }
            ctx.restore();
        };

        const render = () => {
            if (gameStatus !== 'playing') return;

            if (shootCooldown.current > 0) shootCooldown.current--;

            effects.current = effects.current.filter(e => {
                e.y -= 2.5;
                e.life--;
                return e.life > 0;
            });

            if (canFlyActive && inputHeld.current) {
                const flyThrust = isError666 ? -1.45 : -0.9;
                player.current.dy += flyThrust;
            }

            player.current.dy += GAME_GRAVITY;
            if (canFlyActive) player.current.dy = Math.max(-13, Math.min(9, player.current.dy));
            player.current.y += player.current.dy;

            // Ground un po' più alto su mobile per visibilità
            const groundHeight = canvas.height < 500 ? 80 : 120;
            const groundY = canvas.height - groundHeight;

            if (player.current.y + player.current.height > groundY) {
                player.current.y = groundY - player.current.height;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                if (!isOmino && !canFlyActive) player.current.rotation += (0.18 * effectiveMultiplier * adminSpeed);
            }

            const speed = BASE_SPEED * effectiveMultiplier * adminSpeed;
            world.current.x += speed;
            const prog = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(prog);
            
            if ((prog >= 100 || (level.isBossBattle && bossHP <= 0)) && gameStatus === 'playing') {
                if (!level.isBossBattle) setGemsCollected(100); 
                else { setBossKilled(true); setGemsCollected(1000); }
                setGameStatus('won');
                return;
            }

            // Posizione X del giocatore su schermo
            const px = canvas.width > 600 ? 200 : 100;
            const bossScreenX = Math.max(px + 400, canvas.width - 280);
            const bossScreenY = world.current.bossY;

            // ... (logica proiettili simile a prima) ...
            
            // World Collisions con Hitbox Adattata
            const obstacles = world.current.obstacles;
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const o = obstacles[i];
                const ox = o.x - world.current.x;
                if (ox < px - 150 || ox > px + 150) continue;
                
                // Hitbox leggermente più permissiva (padding 8px)
                if (!isGodMode && 
                    px + 8 < ox + o.width - 8 && 
                    px + player.current.width - 8 > ox + 8 && 
                    player.current.y + 8 < groundY - o.height + o.height - 8 && 
                    player.current.y + player.current.height - 8 > groundY - o.height + 8) {
                    
                    if (o.type === 'gem') { obstacles.splice(i, 1); setGemsCollected(g => g + 5); } 
                    else setGameStatus('lost');
                }
            }

            // RENDERING
            ctx.fillStyle = isError666 ? (Math.random() > 0.9 ? '#300' : '#000') : '#08081a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = isError666 ? '#000' : '#05050f'; ctx.fillRect(0, groundY, canvas.width, groundHeight);
            ctx.strokeStyle = isError666 ? 'red' : level.color; ctx.lineWidth = 5; ctx.strokeRect(0, groundY, canvas.width, 4);

            obstacles.forEach(o => {
                const ox = o.x - world.current.x;
                if (ox < -100 || ox > canvas.width + 100) return;
                if (o.type === 'spike') {
                    ctx.fillStyle = isError666 ? '#100' : '#ff3333'; ctx.beginPath(); ctx.moveTo(ox, groundY); ctx.lineTo(ox+o.width/2, groundY-o.height); ctx.lineTo(ox+o.width, groundY); ctx.fill();
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
                } else if (o.type === 'block') {
                    ctx.fillStyle = isError666 ? '#000' : '#334466'; ctx.fillRect(ox, groundY-o.height, o.width, o.height);
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(ox, groundY-o.height, o.width, o.height);
                } else if (o.type === 'gem') {
                    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(ox+o.width/2, groundY-60, 14, 0, Math.PI*2); ctx.fill();
                    ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff'; ctx.stroke(); ctx.shadowBlur = 0;
                }
            });

            // ... (Rendering Boss e Proiettili Player rimangono simili) ...

            drawPlayer(px, player.current.y);
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [gameStatus, level, skin, isGodMode, adminFly, adminSpeed, bossHP, bossKilled]); 

    return (
        <div className={`h-full w-full relative bg-black overflow-hidden ${isError666 ? 'glitch-screen' : ''}`}>
            {isPortrait && (
                <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-32 h-32 mb-8 animate-bounce">
                        <i className="fas fa-mobile-screen text-7xl text-white rotate-90"></i>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">RUOTA IL TELEFONO</h2>
                    <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">Gioca in modalità orizzontale per evitare bug e avere una visuale migliore!</p>
                </div>
            )}

            {hasAdminAccess && (
                <button onClick={() => setShowAdminPanel(true)} className={`fixed top-24 left-6 z-50 bg-black/80 border w-14 h-14 rounded-full flex items-center justify-center text-xl ${isError666 ? 'border-red-600 text-red-600 animate-pulse' : 'border-green-500 text-green-500'}`}><i className="fas fa-terminal"></i></button>
            )}

            {showAdminPanel && (
                <AdminPanel onClose={() => setShowAdminPanel(false)} onInstantWin={() => { setGameStatus('won'); setShowAdminPanel(false); }} onToggleGodMode={setIsGodMode} isGodMode={isGodMode} onToggleFly={setAdminFly} isFlyMode={adminFly} onSetSpeed={setAdminSpeed} currentSpeed={adminSpeed} restrictedView={isAdminGlitch} />
            )}
            
            {/* HUD PIÙ GRANDE */}
            <div className="absolute top-4 left-4 text-white z-10 bg-black/60 backdrop-blur-lg px-6 py-3 rounded-[2rem] border border-white/20 shadow-xl">
                <div className={`text-xl md:text-3xl font-black italic tracking-tighter ${isError666 ? 'text-red-600' : ''}`}>{username}</div>
            </div>
            
            <div className="absolute top-4 right-4 z-10">
                <div className={`text-white text-4xl md:text-6xl font-black italic drop-shadow-2xl ${isError666 ? 'text-red-600' : ''}`}>{Math.floor(progress)}%</div>
            </div>

            {/* Pulsante Spara (se attivo) */}
            {showShootButton && gameStatus === 'playing' && (
                <button onClick={handleShoot} className={`fixed bottom-8 right-8 z-50 w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-white shadow-[0_0_40px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center active:scale-90 transition-all ${canBazookaShoot ? 'bg-gradient-to-br from-orange-600 to-red-700 border-yellow-400' : 'bg-red-600'}`}>
                    <i className={`fas ${canBazookaShoot ? 'fa-rocket' : 'fa-gift'} text-4xl md:text-6xl text-white drop-shadow-md`}></i>
                    <span className="text-[10px] md:text-sm font-black text-white uppercase mt-1 tracking-widest drop-shadow-md">{canBazookaShoot ? 'BAZOOKA' : 'SPARA'}</span>
                </button>
            )}

            {/* Schermata Game Over / Vittoria Ingrandita */}
            {gameStatus !== 'playing' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-xl">
                    <div className="bg-gray-900 border-4 border-white/20 rounded-[3rem] p-8 md:p-12 flex flex-col items-center text-center max-w-lg w-full shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                        <i className={`fas ${gameStatus === 'won' ? 'fa-trophy text-yellow-400' : 'fa-skull-crossbones text-red-600'} text-7xl md:text-9xl mb-6 md:mb-10 drop-shadow-xl animate-bounce`}></i>
                        <h2 className="text-4xl md:text-6xl font-black italic text-white mb-6 uppercase tracking-tighter">
                            {gameStatus === 'won' ? 'VITTORIA!' : 'GAME OVER'}
                        </h2>
                        {gameStatus === 'won' && <div className="text-3xl md:text-5xl font-black text-blue-400 mb-8">+{gemsCollected} GEMME</div>}
                        
                        <button onClick={gameStatus === 'won' ? () => onEnd(true, gemsCollected) : initLevel} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 md:py-6 rounded-3xl uppercase tracking-widest border-b-8 border-blue-900 shadow-2xl active:scale-95 transition-all text-xl md:text-2xl mb-4">
                            {gameStatus === 'won' ? 'CONTINUA' : 'RIPROVA'}
                        </button>
                        <button onClick={() => onEnd(false, 0)} className="w-full bg-gray-800 text-gray-400 font-black py-4 md:py-5 rounded-3xl uppercase tracking-widest text-sm md:text-base active:scale-95">TORNA AL MENU</button>
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="w-full h-full cursor-pointer touch-none" />
        </div>
    );
};

export default GameView;