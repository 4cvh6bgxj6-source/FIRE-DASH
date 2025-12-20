
import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';
import AdminPanel from './AdminPanel';

interface Particle {
    x: number; y: number; vx: number; vy: number; life: number; color: string; size: number;
}

interface Projectile {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    type: 'normal' | 'laser'; // Nuova proprietà per distinguere i colpi
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
    
    // Admin Cheats State
    const [isGodMode, setIsGodMode] = useState(false);
    const [adminFly, setAdminFly] = useState(false); 
    const [adminSpeed, setAdminSpeed] = useState(1); 
    
    const inputHeld = useRef(false);
    const shootCooldown = useRef(0); 

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
        levelLength: 8000
    });

    const isError666 = skin.id === 's666'; 
    const isAdminGlitch = skin.id === 's8';
    const isOmino = skin.id === 's-man';
    const canFlyActive = skin.canFly || adminFly;
    
    const isBossLevel = level.isBossBattle || false;
    const canSantaShoot = skin.canShoot || false;
    
    // BAZOOKA: Si attiva solo al 90% (Fase Demoniaca)
    const isBossHunterSkin = skin.hasBossFinisher || false;
    const canBazookaShoot = isBossHunterSkin && isBossLevel && progress > 90;

    const showShootButton = canSantaShoot || canBazookaShoot;
    const hasAdminAccess = isError666 || isAdminGlitch;

    const getEffectiveMultiplier = () => {
        if (level.id === '8' && isVip) return 2;
        return level.speedMultiplier;
    };
    const effectiveMultiplier = getEffectiveMultiplier();

    const initLevel = () => {
        const obstacles: typeof world.current.obstacles = [];
        const levelLength = 8000 + (parseInt(level.id) * 2000); 
        world.current.levelLength = levelLength;
        world.current.x = 0;
        world.current.projectiles = [];
        world.current.playerProjectiles = [];
        world.current.bossTimer = 0;
        world.current.bossColor = '#4a044e';
        world.current.bossPhase = 1;
        
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
            for (let i = 1200; i < levelLength - 1000; i += 600) {
                obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
            }
        }

        world.current.obstacles = obstacles;
        setGemsCollected(0);
        setProgress(0);
        setBossKilled(false);
        setGameStatus('playing');
    };

    useEffect(() => { initLevel(); }, [level.id, skin.id]);

    const handleShoot = () => {
        if (gameStatus !== 'playing') return;
        if (!showShootButton) return;
        if (shootCooldown.current > 0) return;

        const currentWorldSpeed = BASE_SPEED * effectiveMultiplier * adminSpeed;
        
        let projType: 'gift' | 'rocket' = 'gift';
        let width = 30;
        let height = 30;
        let speed = currentWorldSpeed + 12;

        if (canBazookaShoot) {
            projType = 'rocket';
            width = 60; // Bazooka più grande
            height = 25;
            speed = currentWorldSpeed + 30; // Velocissimo per battere il laser
        }

        world.current.playerProjectiles.push({
            x: world.current.x + 150 + 20, 
            y: player.current.y + 10,
            width: width,
            height: height,
            speed: speed,
            rotation: 0,
            active: true,
            type: projType
        });

        shootCooldown.current = canBazookaShoot ? 25 : 45; 
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
                const jumpProgress = player.current.isGrounded ? 0 : Math.min(1, Math.abs(player.current.dy / JUMP_FORCE));
                ctx.beginPath(); ctx.arc(0, -18, 7, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(0, 5); ctx.stroke();
                const armAngle = player.current.isGrounded ? 0 : (jumpProgress * Math.PI / 1.5);
                ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(-12, -5 - (armAngle * 5)); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(12, -5 - (armAngle * 5)); ctx.stroke();
                const legSpread = player.current.isGrounded ? 6 : 10 + (jumpProgress * 5);
                ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(-legSpread, 18); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(legSpread, 18); ctx.stroke();
            } else {
                if (canFlyActive) {
                    const flyAngle = Math.max(-0.5, Math.min(0.5, player.current.dy * 0.1));
                    ctx.rotate(flyAngle);
                } else {
                    ctx.rotate(player.current.rotation);
                }
                
                ctx.fillStyle = skin.color;
                if (isAdminGlitch && Math.random() > 0.85) ctx.fillStyle = '#ffffff';
                if (isError666 && Math.random() > 0.9) ctx.fillStyle = '#330000';
                
                ctx.shadowBlur = (isError666 || isGodMode) ? 20 : 10;
                ctx.shadowColor = skin.color;
                if (isError666) ctx.shadowColor = '#ff0000';

                const iconMap: Record<string, string> = { 
                    'fa-square': '\uf0c8', 'fa-cat': '\uf6be', 'fa-dragon': '\uf6d5', 'fa-crown': '\uf521',
                    'fa-running': '\uf70c', 'fa-bolt': '\uf0e7', 'fa-robot': '\uf544', 'fa-sun': '\uf185',
                    'fa-spider': '\uf717', 'fa-user-secret': '\uf21b', 'fa-skull': '\uf54c', 'fa-snowman': '\uf7d0',
                    'fa-sleigh': '\uf7cc', 'fa-tree': '\uf1bb', 'fa-gift': '\uf06b', 'fa-candy-cane': '\uf786',
                    'fa-crosshairs': '\uf05b'
                };
                
                ctx.font = '900 36px "Font Awesome 6 Free"';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                let iconChar = iconMap[skin.icon] || '\uf0c8';
                if (skin.id === 'xmas-santa') iconChar = '\uf786'; 
                
                ctx.fillText(iconChar, 0, 0);
                ctx.strokeStyle = isError666 ? '#000000' : 'white'; ctx.lineWidth = 1.5; ctx.strokeText(iconChar, 0, 0);

                if (canBazookaShoot) {
                    ctx.save();
                    ctx.translate(15, 0);
                    ctx.fillStyle = '#333'; ctx.fillRect(-10, -5, 40, 10);
                    ctx.fillStyle = '#111'; ctx.fillRect(-10, -8, 10, 16);
                    ctx.fillStyle = '#ef4444'; ctx.fillRect(20, -6, 5, 12); // Dettaglio Rosso Demoniaco
                    ctx.restore();
                }
            }
            ctx.restore();
        };

        const render = () => {
            if (gameStatus !== 'playing') return;

            if (shootCooldown.current > 0) shootCooldown.current--;

            if (canFlyActive && inputHeld.current) player.current.dy -= 0.85;
            player.current.dy += GAME_GRAVITY;
            if (canFlyActive) player.current.dy = Math.max(-7, Math.min(7, player.current.dy));
            player.current.y += player.current.dy;

            const groundY = canvas.height - 100;
            if (player.current.y + 40 > groundY) {
                player.current.y = groundY - 40;
                player.current.dy = 0;
                player.current.isGrounded = true;
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.isGrounded = false;
                if (!isOmino && !canFlyActive) player.current.rotation += (0.18 * effectiveMultiplier * adminSpeed);
            }

            const speed = BASE_SPEED * effectiveMultiplier * adminSpeed;
            world.current.x += speed;
            const rawProgress = (world.current.x / world.current.levelLength) * 100;
            const prog = Math.min(100, rawProgress);
            setProgress(prog);
            
            if (prog >= 100 && !bossKilled) {
                if (!level.isBossBattle) setGemsCollected(g => g + 100);
                setGameStatus('won');
            }

            const px = 150; 
            const bossScreenX = canvas.width - 180;
            const bossScreenY = world.current.bossY;

            // Collisione Player Projectiles
            if (world.current.playerProjectiles.length > 0) {
                world.current.playerProjectiles.forEach(p => {
                    if (p.active) {
                        p.x += p.speed;
                        if (p.type === 'gift') p.rotation += 0.1; 
                    }
                });
                world.current.playerProjectiles = world.current.playerProjectiles.filter(p => p.active && p.x < world.current.x + canvas.width + 100);

                world.current.playerProjectiles.forEach(p => {
                    if (!p.active) return;
                    const screenPX = p.x - world.current.x;

                    if (p.type === 'gift') {
                        const obstacles = world.current.obstacles;
                        for (let i = obstacles.length - 1; i >= 0; i--) {
                            const obs = obstacles[i];
                            const obsX = obs.x - world.current.x; 
                            if (screenPX < obsX + obs.width && screenPX + p.width > obsX && p.y < groundY - 0 && p.y + p.height > groundY - obs.height) {
                                if (obs.type !== 'gem') { obstacles.splice(i, 1); p.active = false; }
                            }
                        }
                    }
                    if (p.type === 'rocket' && level.isBossBattle) {
                        if (screenPX + p.width > bossScreenX && screenPX < bossScreenX + 100 && p.y + p.height > bossScreenY && p.y < bossScreenY + 100) {
                            p.active = false;
                            setBossKilled(true);
                            setGemsCollected(g => g + 500); // 500 Gemme per Boss Kill
                            setGameStatus('won');
                        }
                    }
                });
            }

            // --- LOGICA BOSS & FASI ---
            if (level.isBossBattle) {
                world.current.bossY = (groundY - 150) + Math.sin(world.current.x * 0.01) * 100;
                let fireRate = 60 / effectiveMultiplier;
                let projSpeed = speed * 1.5;
                world.current.bossColor = '#4a044e'; 

                if (prog > 50) {
                    fireRate = 40 / effectiveMultiplier; 
                    projSpeed = speed * 1.8;
                    world.current.bossColor = '#b91c1c'; 
                    world.current.bossPhase = 2;
                }
                if (prog > 85) {
                    fireRate = 20 / effectiveMultiplier; 
                    projSpeed = speed * 2.2; 
                    world.current.bossColor = '#ff0000'; 
                    world.current.bossPhase = 3;
                }
                // --- FASE DEMONIACA (10% HP) ---
                if (prog > 90) {
                    fireRate = 15 / effectiveMultiplier; // Spammo brutale
                    projSpeed = speed * 3; // Laser velocissimi
                    world.current.bossColor = '#000000'; // Nero totale
                    world.current.bossPhase = 4;
                }

                if (!bossKilled) {
                    world.current.bossTimer++;
                    if (world.current.bossTimer > fireRate) { 
                        world.current.bossTimer = 0;
                        const shootLow = Math.random() > 0.5;
                        const projY = shootLow ? groundY - 40 : groundY - 110;
                        
                        // SE FASE 4 (Demoniaca) -> Spara LASER
                        const isLaser = world.current.bossPhase === 4;

                        world.current.projectiles.push({
                            x: world.current.x + canvas.width, 
                            y: projY,
                            width: isLaser ? 80 : 40, // Laser più lungo
                            height: isLaser ? 15 : 30, // Laser più sottile
                            speed: projSpeed,
                            type: isLaser ? 'laser' : 'normal'
                        });
                    }
                }
            }

            // Collisioni Ostacoli
            const obstacles = world.current.obstacles;
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                const ox = obs.x - world.current.x;
                if (ox < px - 60 || ox > px + 60) continue;
                
                const hitMargin = 6;
                const collided = px + hitMargin < ox + obs.width - hitMargin && px + 40 - hitMargin > ox + hitMargin && player.current.y + hitMargin < groundY - obs.height + obs.height - hitMargin && player.current.y + 40 - hitMargin > groundY - obs.height + hitMargin;
                
                if (collided) {
                    if (obs.type === 'gem') { setGemsCollected(g => g + 10); obstacles.splice(i, 1); } 
                    else if (!isGodMode) { setGameStatus('lost'); }
                }
            }

            // Collisioni Proiettili Boss
            const projectiles = world.current.projectiles;
            for (let i = projectiles.length - 1; i >= 0; i--) {
                const p = projectiles[i];
                p.x -= 8 * effectiveMultiplier; 
                const screenProjX = p.x - world.current.x;
                if (screenProjX < -100) { projectiles.splice(i, 1); continue; }

                const hitMargin = 2; 
                const speedBuffer = p.speed > 20 ? p.speed / 2 : 0;

                const collided = px + hitMargin < screenProjX + p.width - hitMargin + speedBuffer && px + 40 - hitMargin > screenProjX + hitMargin && player.current.y + hitMargin < p.y + p.height - hitMargin && player.current.y + 40 - hitMargin > p.y + hitMargin;

                if (collided && !isGodMode) {
                    // --- LOGICA SCHIVATA ---
                    if (p.type === 'laser') {
                        // IL LASER NON SI PUÒ SCHIVARE! (Nemmeno con Boss Hunter)
                        setGameStatus('lost');
                    } else if (isBossHunterSkin && Math.random() < 0.95) {
                        // Schivata normale (95%)
                        projectiles.splice(i, 1);
                        const ctx = canvasRef.current?.getContext('2d');
                        if (ctx) {
                            ctx.fillStyle = 'rgba(74, 222, 128, 0.5)';
                            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                        }
                    } else {
                        setGameStatus('lost');
                    }
                }
            }

            // --- RENDERING ---
            let shakeX = 0; let shakeY = 0;
            if (level.isBossBattle && world.current.bossPhase >= 3 && !bossKilled) {
                 const intensity = world.current.bossPhase === 4 ? 15 : 5; // Terremoto forte in fase 4
                 shakeX = (Math.random()-0.5)*intensity; shakeY = (Math.random()-0.5)*intensity;
            }
            if (isAdminGlitch && Math.random() > 0.92) { shakeX = (Math.random()-0.5)*15; shakeY = (Math.random()-0.5)*15; }
            else if (isError666 && Math.random() > 0.8) { shakeX = (Math.random()-0.5)*25; shakeY = (Math.random()-0.5)*25; }

            ctx.save();
            ctx.translate(shakeX, shakeY);

            // Sfondo
            ctx.fillStyle = '#0a0a1a';
            if (level.isBossBattle) {
                if (world.current.bossPhase === 4) ctx.fillStyle = '#1a0000'; // Sfondo Rossastro scuro fase 4
                else if (world.current.bossPhase === 3) ctx.fillStyle = '#330000';
                else if (world.current.bossPhase === 2) ctx.fillStyle = '#2a0a2a';
                else ctx.fillStyle = '#1a051a'; 
            }
            if (isAdminGlitch && Math.random() > 0.96) ctx.fillStyle = Math.random()>0.5 ? '#001100' : '#1a0a0a'; 
            if (isError666) ctx.fillStyle = Math.random()>0.9 ? '#330000' : '#1a0505';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Pavimento
            ctx.fillStyle = world.current.bossPhase === 4 ? '#220000' : '#050510'; // Pavimento rosso fase 4
            if (isError666) ctx.fillStyle = '#1a0000';
            ctx.fillRect(0, groundY, canvas.width, 100);
            
            ctx.strokeStyle = level.color; 
            if (world.current.bossPhase === 4) ctx.strokeStyle = '#ff0000';
            if (isError666) ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3; 
            ctx.strokeRect(0, groundY, canvas.width, 2);

            // Ostacoli
            world.current.obstacles.forEach(o => {
                const ox = o.x - world.current.x;
                if (ox < -100 || ox > canvas.width + 100) return;
                
                let obsColorSpike = '#ff4444'; let obsColorBlock = '#334466';
                if (isAdminGlitch && Math.random() > 0.95) { obsColorSpike = '#00ff41'; obsColorBlock = '#00ff41'; }
                if (isError666) { obsColorSpike = '#880000'; obsColorBlock = '#220000'; }

                if (o.type === 'spike') {
                    ctx.fillStyle = obsColorSpike; ctx.beginPath(); ctx.moveTo(ox, groundY); ctx.lineTo(ox+20, groundY-40); ctx.lineTo(ox+40, groundY); ctx.fill();
                    ctx.strokeStyle = isError666 ? '#ff0000' : 'white'; ctx.lineWidth = 1; ctx.stroke();
                } else if (o.type === 'block') {
                    ctx.fillStyle = obsColorBlock; ctx.fillRect(ox, groundY-o.height, o.width, o.height);
                    ctx.strokeStyle = isError666 ? '#ff0000' : '#ffffff55'; ctx.strokeRect(ox, groundY-o.height, o.width, o.height);
                } else if (o.type === 'gem') {
                    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(ox+15, groundY-45, 10, 0, Math.PI*2); ctx.fill();
                    ctx.strokeStyle = 'white'; ctx.stroke();
                }
            });

            // Disegna Proiettili Giocatore
            world.current.playerProjectiles.forEach(p => {
                if (!p.active) return;
                const pX = p.x - world.current.x;
                if (pX < -100 || pX > canvas.width + 100) return;

                ctx.save();
                ctx.translate(pX + p.width/2, p.y + p.height/2);
                ctx.rotate(p.rotation); 
                
                if (p.type === 'gift') {
                    ctx.fillStyle = '#ef4444'; ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
                    ctx.fillStyle = '#fbbf24'; ctx.fillRect(-p.width/2 + 12, -p.height/2, 6, p.height); ctx.fillRect(-p.width/2, -p.height/2 + 12, p.width, 6);
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.strokeRect(-p.width/2, -p.height/2, p.width, p.height);
                } else if (p.type === 'rocket') {
                    ctx.fillStyle = '#333'; ctx.fillRect(-p.width/2, -p.height/4, p.width, p.height/2);
                    ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.moveTo(p.width/2, -p.height/4); ctx.lineTo(p.width/2 + 10, 0); ctx.lineTo(p.width/2, p.height/4); ctx.fill();
                    ctx.fillStyle = '#ffa500'; ctx.beginPath(); ctx.arc(-p.width/2, 0, 8 + Math.random()*8, 0, Math.PI*2); ctx.fill();
                }
                ctx.restore();
            });

            // RENDERING BOSS
            if (level.isBossBattle && !bossKilled) {
                const bossHP = Math.max(0, 100 - prog);
                const barWidth = 100; const barHeight = 10; const barX = bossScreenX; const barY = bossScreenY - 30;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(barX, barY, barWidth, barHeight);
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barWidth, barHeight);

                let hpColor = '#22c55e';
                if (bossHP < 50) hpColor = '#eab308';
                if (bossHP < 20) hpColor = '#ef4444';
                if (bossHP < 10) hpColor = Math.floor(Date.now() / 50) % 2 === 0 ? '#ff0000' : '#000000'; // HP Glitchati in fase 4

                const fillWidth = (bossHP / 100) * barWidth;
                ctx.fillStyle = hpColor; ctx.fillRect(barX, barY, fillWidth, barHeight);

                ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px "Orbitron", sans-serif'; ctx.textAlign = 'center';
                const hpText = world.current.bossPhase === 4 ? "DEMONIC" : `BOSS HP ${Math.floor(bossHP)}%`;
                ctx.fillText(hpText, barX + barWidth/2, barY - 4);
                
                ctx.shadowBlur = world.current.bossPhase === 4 ? 80 : 30;
                ctx.shadowColor = world.current.bossPhase === 4 ? '#ff0000' : world.current.bossColor;
                ctx.fillStyle = world.current.bossColor;
                ctx.fillRect(bossScreenX, bossScreenY, 100, 100);
                
                // Disegna occhi rossi se demoniaco
                if (world.current.bossPhase === 4) {
                    ctx.fillStyle = '#ff0000';
                    ctx.beginPath(); ctx.arc(bossScreenX + 30, bossScreenY + 40, 10, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(bossScreenX + 70, bossScreenY + 40, 10, 0, Math.PI*2); ctx.fill();
                    // Sorriso malvagio
                    ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(bossScreenX + 50, bossScreenY + 60, 20, 0, Math.PI, false); ctx.stroke();
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = '900 60px "Font Awesome 6 Free"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    const bossIcon = world.current.bossPhase >= 3 ? '\uf7f6' : '\uf54c'; 
                    ctx.fillText(bossIcon, bossScreenX + 50, bossScreenY + 50); 
                }
                ctx.shadowBlur = 0;

                world.current.projectiles.forEach(p => {
                    const pxScreen = p.x - world.current.x;
                    if (pxScreen < -100 || pxScreen > canvas.width + 100) return;
                    
                    if (p.type === 'laser') {
                        // DISEGNO LASER
                        ctx.fillStyle = '#ff0000';
                        ctx.shadowBlur = 20; ctx.shadowColor = '#ff0000';
                        ctx.fillRect(pxScreen, p.y + p.height/2 - 5, p.width, 10); // Core del laser
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(pxScreen, p.y + p.height/2 - 2, p.width, 4); // Centro bianco
                        ctx.shadowBlur = 0;
                    } else {
                        // Proiettile normale
                        ctx.fillStyle = world.current.bossPhase === 3 ? '#ff0000' : '#ff5500';
                        ctx.beginPath(); ctx.arc(pxScreen + p.width/2, p.y + p.height/2, 20, 0, Math.PI*2); ctx.fill();
                        ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(pxScreen + p.width/2 + 10, p.y + p.height/2, 10, 0, Math.PI*2); ctx.fill();
                    }
                });
            }

            if (isAdminGlitch && Math.random() > 0.85) {
                ctx.fillStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.2)`;
                ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 200, Math.random() * 20);
            }
            if (isError666) {
                const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.height/4, canvas.width/2, canvas.height/2, canvas.height);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(1, 'rgba(100, 0, 0, 0.4)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            drawPlayer(px, player.current.y);
            ctx.restore(); 
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [gameStatus, level, skin, isGodMode, adminFly, adminSpeed, canFlyActive, isAdminGlitch, isError666, isVip, effectiveMultiplier, canSantaShoot, canBazookaShoot, bossKilled]); 

    return (
        <div className="h-full w-full relative bg-black overflow-hidden">
            {hasAdminAccess && (
                <button onClick={() => setShowAdminPanel(true)} className={`fixed top-20 left-6 z-50 bg-black/80 border w-12 h-12 rounded-full shadow-lg transition-all active:scale-90 ${isAdminGlitch ? 'border-green-500 text-green-500 shadow-green-500/20' : 'border-red-500 text-red-500 shadow-red-500/20'}`}><i className="fas fa-terminal"></i></button>
            )}

            {showAdminPanel && (
                <AdminPanel onClose={() => setShowAdminPanel(false)} onInstantWin={() => { setGameStatus('won'); setShowAdminPanel(false); }} onToggleGodMode={setIsGodMode} isGodMode={isGodMode} onToggleFly={setAdminFly} isFlyMode={adminFly} onSetSpeed={setAdminSpeed} currentSpeed={adminSpeed} restrictedView={isAdminGlitch} />
            )}
            
            <div className="absolute top-6 left-6 text-white z-10">
                <div className="text-[10px] uppercase font-bold opacity-50 tracking-widest">Giocatore</div>
                <div className="text-xl font-black italic">{username}</div>
                <div className="text-blue-400 font-bold"><i className="fas fa-gem"></i> {gemsCollected}</div>
            </div>
            
            <div className="absolute top-6 right-6 z-10 text-right">
                <div className="text-white text-4xl font-black italic">{Math.floor(progress)}%</div>
                {level.isBossBattle && progress > 85 && !bossKilled && (
                    <div className="text-red-500 font-black text-xs uppercase animate-pulse">BOSS ENRAGED!</div>
                )}
                {level.id === '8' && isVip && (
                    <div className="text-yellow-400 font-black text-[9px] uppercase mt-1"><i className="fas fa-crown"></i> VIP SPEED (2X)</div>
                )}
            </div>

            {/* PULSANTE SPARO BAZOOKA AGGIORNATO GRAFICAMENTE */}
            {showShootButton && gameStatus === 'playing' && (
                <button
                    onClick={handleShoot}
                    className={`fixed bottom-8 right-8 z-50 w-24 h-24 rounded-full border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.5)] flex flex-col items-center justify-center active:scale-90 transition-transform ${canBazookaShoot ? 'bg-red-900 border-red-500 shadow-red-500/80 animate-pulse' : 'bg-red-600 shadow-red-500/50'}`}
                >
                    <i className={`fas ${canBazookaShoot ? 'fa-bomb' : 'fa-gift'} text-3xl text-white`}></i>
                    <span className="text-[10px] font-black text-white uppercase mt-1">{canBazookaShoot ? 'FINISH HIM!' : 'LANCIA'}</span>
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-2 rounded-full border border-black">Tasto F</span>
                </button>
            )}

            {gameStatus !== 'playing' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-500 p-4">
                    {gameStatus === 'won' && (
                        <div className="relative z-10 w-[90%] max-w-md bg-gray-900 border-2 border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col items-center animate-in zoom-in duration-300 overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-yellow-500/20 to-transparent pointer-events-none"></div>
                            <h2 className="relative z-10 text-2xl md:text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-6 tracking-tighter drop-shadow-sm text-center break-words w-full">{bossKilled ? 'BOSS DISTRUTTO!' : 'CONGRATULAZIONI!'}</h2>
                            <div className="flex flex-col items-center justify-center gap-4 mb-6 relative z-10">
                                <i className="fas fa-gem text-5xl md:text-6xl text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-[bounce_2s_infinite]"></i>
                                <div className="text-center"><div className="text-4xl md:text-5xl font-black text-white italic tracking-wide">+{gemsCollected}</div><div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Totale Gemme</div></div>
                                {bossKilled && <div className="bg-red-900/50 border border-red-500 px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse mt-2"><i className="fas fa-skull text-red-500 text-lg"></i><span className="text-red-200 font-black uppercase text-xs">BOSS KILL BONUS (+500)</span></div>}
                                {!bossKilled && !level.isBossBattle && <div className="bg-green-900/50 border border-green-500 px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse mt-2"><i className="fas fa-flag-checkered text-green-500 text-lg"></i><span className="text-green-200 font-black uppercase text-xs">LEVEL COMPLETE (+100)</span></div>}
                            </div>
                            <button onClick={() => onEnd(true, gemsCollected)} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] transition-all transform active:scale-95 border-b-4 border-blue-900 shadow-lg relative z-10 text-sm md:text-base">CONTINUA</button>
                        </div>
                    )}
                    {gameStatus === 'lost' && (
                        <div className="relative z-10 w-[90%] max-w-md bg-gray-900 border-2 border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col items-center text-center animate-in zoom-in duration-300">
                            <h2 className="text-4xl md:text-5xl font-black italic mb-6 uppercase tracking-tighter text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] shake-animation break-words w-full">{isError666 ? 'ERROR 666' : 'HAI PERSO!'}</h2>
                            <div className="flex flex-col gap-3 w-full mt-2">
                                <button onClick={initLevel} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all transform active:scale-95 border-b-4 border-green-900 flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"><i className="fas fa-redo"></i> RIPROVA</button>
                                <button onClick={() => onEnd(false, 0)} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-black py-4 rounded-xl uppercase tracking-widest transition-all border border-white/10 text-sm md:text-base">MENU</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <canvas 
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight} 
                className="w-full h-full"
                onMouseDown={(e) => { e.preventDefault(); if(gameStatus === 'playing') { inputHeld.current = true; if(!canFlyActive && player.current.isGrounded) { player.current.dy = JUMP_FORCE; player.current.isGrounded = false; } } }}
                onMouseUp={(e) => { e.preventDefault(); inputHeld.current = false; }}
                onTouchStart={(e) => { if(gameStatus === 'playing') { inputHeld.current = true; if(!canFlyActive && player.current.isGrounded) { player.current.dy = JUMP_FORCE; player.current.isGrounded = false; } } }}
                onTouchEnd={(e) => { e.preventDefault(); inputHeld.current = false; }}
            />
        </div>
    );
};

export default GameView;
