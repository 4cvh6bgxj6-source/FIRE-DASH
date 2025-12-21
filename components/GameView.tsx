
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

    const player = useRef({
        y: 300, dy: 0, width: 40, height: 40, rotation: 0, isGrounded: false,
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
        if (level.id === '14' && isVip) return 2;
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
        
        const spacing = 450 / effectiveMultiplier;
        
        if (!level.isBossBattle) {
            for (let i = 1200; i < levelLength - 1000; i += spacing + (Math.random() * 250)) {
                const rand = Math.random();
                if (rand < 0.45) obstacles.push({ x: i, width: 40, height: 40, type: 'spike' });
                else if (rand < 0.75) obstacles.push({ x: i, width: 60, height: 60, type: 'block' });
                else obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
            }
        } else {
            for (let i = 1200; i < levelLength - 1000; i += 800) {
                obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
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
            ctx.translate(pX + 20, pY + 20);
            
            if (isOmino) {
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.arc(0, -18, 7, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(0, 5); ctx.stroke();
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
                
                ctx.font = '900 36px "Font Awesome 6 Free"';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(iconChar, 0, 0);
                ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5; ctx.strokeText(iconChar, 0, 0);

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

            const groundY = canvas.height - 100;
            if (player.current.y + 40 > groundY) {
                player.current.y = groundY - 40;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                if (!isOmino && !canFlyActive) player.current.rotation += (0.2 * effectiveMultiplier * adminSpeed);
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

            const px = 150; 
            const bossScreenX = Math.max(px + 400, canvas.width - 280);
            const bossScreenY = world.current.bossY;

            // Player Projectiles vs Boss
            world.current.playerProjectiles.forEach(p => {
                if (!p.active) return;
                p.x += p.speed;
                const screenX = p.x - world.current.x;

                if (level.isBossBattle && !bossKilled && screenX + p.width > bossScreenX && screenX < bossScreenX + 220 && p.y + p.height > bossScreenY && p.y < bossScreenY + 220) {
                    p.active = false;
                    const dmg = p.type === 'rocket' ? 20 : 5;
                    setBossHP(prev => Math.max(0, prev - dmg));
                    effects.current.push({ x: bossScreenX + 110, y: bossScreenY + 110, text: `-${dmg}`, life: 35, color: '#ffcc00' });
                }
            });
            world.current.playerProjectiles = world.current.playerProjectiles.filter(p => p.active && p.x < world.current.x + canvas.width + 100);

            // AI del Boss
            if (level.isBossBattle && !bossKilled) {
                world.current.bossY = (groundY - 280) + Math.sin(world.current.x * 0.02) * 160;
                let fireRate = (bossHP < 30 ? 18 : 32) / effectiveMultiplier;
                let projSpd = (bossHP < 30 ? 16 : 13) * effectiveMultiplier;

                world.current.bossTimer++;
                if (world.current.bossTimer > fireRate) { 
                    world.current.bossTimer = 0;
                    const isL = bossHP < 50 && Math.random() > 0.4;
                    world.current.projectiles.push({
                        x: world.current.x + canvas.width, 
                        y: isL ? player.current.y + 5 : (Math.random() > 0.5 ? groundY - 60 : groundY - 160),
                        width: isL ? 300 : 60,
                        height: isL ? 35 : 60,
                        speed: projSpd * (isL ? 2.8 : 1.8),
                        type: isL ? 'laser' : 'normal'
                    });
                }
            }

            // World Collisions
            const obstacles = world.current.obstacles;
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const o = obstacles[i];
                const ox = o.x - world.current.x;
                if (ox < px - 100 || ox > px + 100) continue;
                if (!isGodMode && px + 10 < ox + o.width - 10 && px + 30 > ox + 10 && player.current.y + 10 < groundY - o.height + o.height - 10 && player.current.y + 30 > groundY - o.height + 10) {
                    if (o.type === 'gem') { obstacles.splice(i, 1); setGemsCollected(g => g + 5); } 
                    else setGameStatus('lost');
                }
            }

            // Boss Projs vs Player - LOGICA MIGLIORATA
            const projs = world.current.projectiles;
            for (let i = projs.length - 1; i >= 0; i--) {
                const p = projs[i];
                const prevX = p.x;
                p.x -= p.speed; 
                
                const sProjX = p.x - world.current.x;
                const prevSProjX = prevX - world.current.x;
                
                if (sProjX < -400) { projs.splice(i, 1); continue; }

                if (!isGodMode) {
                    // Controllo collisione robusto: verifica se il proiettile ha intersecato la X del giocatore in questo frame
                    const playerXStart = px + 5;
                    const playerXEnd = px + 35;
                    const projXStart = sProjX;
                    const projXEnd = prevSProjX + p.width;

                    const horizontalOverlap = projXStart < playerXEnd && projXEnd > playerXStart;
                    const verticalOverlap = player.current.y + 5 < p.y + p.height - 5 && player.current.y + 35 > p.y + 5;

                    if (horizontalOverlap && verticalOverlap) {
                        // SCHIVATA AGGIORNATA AL 80% (Solo per colpi normali)
                        if (isBossHunterSkin && p.type !== 'laser' && Math.random() < 0.8) { 
                            effects.current.push({ x: px, y: player.current.y - 45, text: "MISS!", life: 55, color: '#00ffcc' });
                            projs.splice(i, 1); 
                        } else {
                            setGameStatus('lost');
                        }
                    }
                }
            }

            // --- DISEGNO ---
            ctx.fillStyle = isError666 ? (Math.random() > 0.9 ? '#300' : '#000') : '#08081a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (level.isBossBattle && !bossKilled) {
                let bgMsg = "HAHA NABBO!";
                let bgColor = 'white';
                if (bossHP < 25) { bgMsg = "È L'ORA DELLA TUA FINE!"; bgColor = '#ff0000'; }
                else if (bossHP < 40) { bgMsg = "ORA TI UCCIDO!"; bgColor = 'white'; }
                else if (bossHP < 60) { bgMsg = "TI HO SOTTOVALUTATO"; bgColor = 'white'; }
                else if (bossHP < 80) { bgMsg = "NON SAI GIOCARE!"; bgColor = 'white'; }

                ctx.save();
                ctx.globalAlpha = 0.12; 
                ctx.fillStyle = bgColor;
                const fontSize = Math.min(canvas.width / 10, 100);
                ctx.font = `900 ${fontSize}px Orbitron`;
                ctx.textAlign = 'center';
                
                const pulse = 1 + Math.sin(world.current.x * 0.01) * 0.1;
                let tx = canvas.width / 2;
                let ty = canvas.height / 2.5;

                if (bossHP < 25) { 
                    tx += Math.random() * 10 - 5;
                    ty += Math.random() * 10 - 5;
                    ctx.globalAlpha = 0.25; 
                }

                ctx.translate(tx, ty);
                ctx.scale(pulse, pulse);
                ctx.fillText(bgMsg, 0, 0);
                ctx.restore();
            }

            ctx.fillStyle = isError666 ? '#000' : '#05050f'; ctx.fillRect(0, groundY, canvas.width, 100);
            ctx.strokeStyle = isError666 ? 'red' : level.color; ctx.lineWidth = 4; ctx.strokeRect(0, groundY, canvas.width, 2);

            obstacles.forEach(o => {
                const ox = o.x - world.current.x;
                if (ox < -100 || ox > canvas.width + 100) return;
                if (o.type === 'spike') {
                    ctx.fillStyle = isError666 ? '#100' : '#ff3333'; ctx.beginPath(); ctx.moveTo(ox, groundY); ctx.lineTo(ox+20, groundY-40); ctx.lineTo(ox+40, groundY); ctx.fill();
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.stroke();
                } else if (o.type === 'block') {
                    ctx.fillStyle = isError666 ? '#000' : '#334466'; ctx.fillRect(ox, groundY-o.height, o.width, o.height);
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.strokeRect(ox, groundY-o.height, o.width, o.height);
                } else if (o.type === 'gem') {
                    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(ox+20, groundY-50, 12, 0, Math.PI*2); ctx.fill();
                    ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff'; ctx.stroke(); ctx.shadowBlur = 0;
                }
            });

            world.current.playerProjectiles.forEach(p => {
                const sX = p.x - world.current.x;
                ctx.fillStyle = p.type === 'rocket' ? '#ff3300' : '#ef4444';
                ctx.fillRect(sX, p.y, p.width, p.height);
                ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(sX, p.y, p.width, p.height);
            });

            if (level.isBossBattle && !bossKilled) {
                ctx.save();
                const bX = bossScreenX + 110;
                const bY = bossScreenY + 110;
                ctx.translate(bX, bY);
                
                const shakeIntensity = bossHP < 25 ? 14 : (bossHP < 50 ? 7 : 0);
                if (shakeIntensity > 0) ctx.translate(Math.random()*shakeIntensity - shakeIntensity/2, Math.random()*shakeIntensity - shakeIntensity/2);

                let skinColor = 'white';
                if (bossHP < 25) skinColor = '#1a0000';
                else if (bossHP < 50) skinColor = '#444';
                else if (bossHP < 75) skinColor = '#ccc';

                if (bossHP < 50) {
                    ctx.shadowBlur = bossHP < 25 ? 60 : 30;
                    ctx.shadowColor = 'red';
                }

                if (bossHP < 50) {
                    ctx.fillStyle = '#200';
                    ctx.beginPath();
                    ctx.moveTo(-75, -55); ctx.quadraticCurveTo(-110, -125, -135, -95); ctx.quadraticCurveTo(-100, -85, -65, -35);
                    ctx.fill();
                    ctx.moveTo(75, -55); ctx.quadraticCurveTo(110, -125, 135, -95); ctx.quadraticCurveTo(100, -85, 65, -35);
                    ctx.fill();
                }

                ctx.beginPath(); ctx.fillStyle = skinColor; ctx.strokeStyle = bossHP < 25 ? '#ff0000' : 'black'; ctx.lineWidth = 6;
                ctx.ellipse(0, 0, 110, 95, 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                
                const eyeColor = bossHP < 75 ? 'red' : 'black';
                ctx.beginPath(); ctx.arc(-45, -25, 18, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.arc(45, -25, 18, 0, Math.PI * 2); ctx.stroke();
                
                ctx.fillStyle = eyeColor;
                ctx.beginPath(); ctx.arc(-40, -20, 8, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(50, -20, 8, 0, Math.PI * 2); ctx.fill();
                
                if (bossHP < 25) { 
                    ctx.shadowBlur = 20; ctx.shadowColor = 'red';
                    ctx.fillStyle = 'red';
                    ctx.beginPath(); ctx.arc(-40, -20, 5, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(50, -20, 5, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                }

                ctx.beginPath(); 
                ctx.arc(0, 25, 65, 0.1, Math.PI - 0.1, false); 
                ctx.strokeStyle = bossHP < 25 ? 'red' : 'black';
                ctx.stroke();

                ctx.beginPath(); ctx.moveTo(-60, 25); ctx.lineTo(-80, 5); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(60, 25); ctx.lineTo(80, 5); ctx.stroke();

                ctx.font = '900 24px Orbitron'; ctx.textAlign = 'center';
                let msg = "HAHA NABBO!";
                let msgColor = 'black';
                if (bossHP < 25) { msg = "DIE!"; msgColor = '#ff0000'; }
                else if (bossHP < 40) { msg = "ORA TI UCCIDO!"; msgColor = 'white'; }
                else if (bossHP < 60) { msg = "TI HO SOTTOVALUTATO"; msgColor = 'white'; }
                else if (bossHP < 80) { msg = "NOOB!"; msgColor = 'black'; }

                ctx.fillStyle = msgColor;
                ctx.fillText(msg, 0, -135);
                ctx.restore();

                projs.forEach(p => {
                    ctx.shadowBlur = 20; ctx.shadowColor = p.type === 'laser' ? 'red' : '#ffff00';
                    ctx.fillStyle = p.type === 'laser' ? '#ff0000' : '#ffff00';
                    ctx.fillRect(p.x - world.current.x, p.y, p.width, p.height);
                    ctx.shadowBlur = 0;
                });
            }

            effects.current.forEach(e => {
                ctx.fillStyle = e.color;
                ctx.font = '900 36px Orbitron'; ctx.textAlign = 'center';
                ctx.fillText(e.text, e.x, e.y);
            });
            
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
                <button onClick={() => setShowAdminPanel(true)} className={`fixed top-20 left-6 z-50 bg-black/80 border w-12 h-12 rounded-full flex items-center justify-center ${isError666 ? 'border-red-600 text-red-600 animate-pulse' : 'border-green-500 text-green-500'}`}><i className="fas fa-terminal"></i></button>
            )}

            {showAdminPanel && (
                <AdminPanel onClose={() => setShowAdminPanel(false)} onInstantWin={() => { setGameStatus('won'); setShowAdminPanel(false); }} onToggleGodMode={setIsGodMode} isGodMode={isGodMode} onToggleFly={setAdminFly} isFlyMode={adminFly} onSetSpeed={setAdminSpeed} currentSpeed={adminSpeed} restrictedView={isAdminGlitch} />
            )}
            
            <div className="absolute top-6 left-6 text-white z-10 bg-black/50 backdrop-blur-lg p-4 rounded-3xl border border-white/20 shadow-2xl">
                <div className="text-[10px] uppercase font-bold opacity-60 mb-1 tracking-widest">Utente Attivo</div>
                <div className={`text-2xl font-black italic tracking-tighter ${isError666 ? 'text-red-600' : ''}`}>{username}</div>
                {isBossHunterSkin && <div className="text-[10px] text-emerald-400 font-black mt-1">SCHIVATA: 80%</div>}
            </div>
            
            <div className="absolute top-6 right-6 z-10 text-right flex flex-col items-end">
                <div className={`text-white text-5xl font-black italic drop-shadow-2xl ${isError666 ? 'text-red-600' : ''}`}>{Math.floor(progress)}%</div>
            </div>

            {isBossLevel && !bossKilled && gameStatus === 'playing' && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[85%] max-w-2xl z-20 flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-2 px-4">
                        <span className={`font-black italic uppercase text-xs md:text-sm tracking-[0.2em] md:tracking-[0.5em] animate-pulse drop-shadow-lg ${bossHP < 25 ? 'text-red-600' : 'text-white'}`}>
                            {bossHP < 25 ? 'BOSS: INFERNAL TROLLFACE' : 'BOSS: TROLLFACE LORD'}
                        </span>
                        <span className="text-white font-black text-xs md:text-sm bg-red-600 px-3 py-1 rounded-full shadow-lg">{Math.ceil(bossHP)}%</span>
                    </div>
                    <div className={`w-full bg-gray-950 h-6 md:h-8 rounded-full overflow-hidden border-2 md:border-4 border-white/30 shadow-[0_0_40px_rgba(255,0,0,0.6)] relative transition-all duration-700 ${bossHP < 25 ? 'scale-110' : ''}`}>
                        <div 
                            className={`h-full transition-all duration-300 relative shadow-[inset_0_0_15px_rgba(255,255,255,0.4)] ${bossHP < 25 ? 'bg-gradient-to-r from-red-950 via-red-600 to-red-900' : 'bg-gradient-to-r from-red-700 via-red-500 to-red-400'}`} 
                            style={{width: `${bossHP}%`}}
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-white/20"></div>
                        </div>
                    </div>
                </div>
            )}

            {showShootButton && gameStatus === 'playing' && (
                <button onClick={handleShoot} className={`fixed bottom-6 right-6 md:bottom-12 md:right-12 z-50 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-[0_0_40px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center active:scale-90 transition-all ${canBazookaShoot ? 'bg-gradient-to-br from-orange-600 to-red-700 border-yellow-400' : 'bg-red-600'}`}>
                    <i className={`fas ${canBazookaShoot ? 'fa-rocket' : 'fa-gift'} text-3xl md:text-5xl text-white drop-shadow-md`}></i>
                    <span className="text-[10px] md:text-[14px] font-black text-white uppercase mt-1 md:mt-2 tracking-widest drop-shadow-md">{canBazookaShoot ? 'BAZOOKA' : 'FIRE'}</span>
                    {canBazookaShoot && <div className="absolute -top-2 -left-2 bg-yellow-400 text-black text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full border-2 border-black rotate-[-15deg] shadow-xl">ULTIMATE</div>}
                </button>
            )}

            {gameStatus !== 'playing' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-6 backdrop-blur-xl">
                    {gameStatus === 'won' && (
                        <div className="bg-gray-900 border-4 border-white/20 rounded-[3rem] md:rounded-[5rem] p-8 md:p-12 flex flex-col items-center text-center max-w-md w-full shadow-[0_0_100px_rgba(34,197,94,0.3)] animate-in zoom-in-95 duration-500">
                            <i className="fas fa-trophy text-6xl md:text-8xl text-yellow-400 mb-6 md:mb-8 drop-shadow-[0_0_40px_rgba(250,204,21,0.6)] animate-bounce"></i>
                            <h2 className="text-3xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-4 md:mb-6 uppercase tracking-tighter">
                                MISSION WON!
                            </h2>
                            <div className="text-4xl md:text-6xl font-black text-white mb-8 md:mb-10">+{gemsCollected} <span className="text-xl md:text-2xl text-blue-400">GEMS</span></div>
                            <button onClick={() => onEnd(true, gemsCollected)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 md:py-6 rounded-2xl md:rounded-3xl uppercase tracking-[0.3em] border-b-8 border-blue-900 shadow-2xl active:scale-95 transition-all text-lg md:text-xl">CONTINUA</button>
                        </div>
                    )}
                    {gameStatus === 'lost' && (
                        <div className="bg-gray-900 border-4 border-white/20 rounded-[3rem] md:rounded-[5rem] p-8 md:p-12 flex flex-col items-center text-center max-w-md w-full shadow-[0_0_100px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-500">
                            <i className={`fas ${isError666 ? 'fa-virus' : 'fa-skull-crossbones'} text-6xl md:text-8xl text-red-600 mb-6 md:mb-8 drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]`}></i>
                            <h2 className="text-4xl md:text-6xl font-black italic text-red-600 mb-8 md:mb-10 uppercase tracking-tighter">GAME OVER</h2>
                            <button onClick={initLevel} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 md:py-6 rounded-2xl md:rounded-3xl uppercase mb-4 md:mb-5 shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 text-lg md:text-xl border-b-8 border-red-900"><i className="fas fa-redo"></i> RIPROVA</button>
                            <button onClick={() => onEnd(false, 0)} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 font-black py-4 md:py-5 rounded-2xl md:rounded-3xl uppercase tracking-widest text-xs transition-all active:scale-95">TORNA AL MENU</button>
                        </div>
                    )}
                </div>
            )}
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="w-full h-full cursor-pointer" />
        </div>
    );
};

export default GameView;
