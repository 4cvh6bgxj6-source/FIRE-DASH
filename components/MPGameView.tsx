
import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';

interface Props {
    level: Level;
    mySkin: Skin;
    oppSkin: Skin;
    username: string;
    opponentName: string;
    onEnd: () => void;
}

const MPGameView: React.FC<Props> = ({ level, mySkin, oppSkin, username, opponentName, onEnd }) => {
    const canvasTopRef = useRef<HTMLCanvasElement>(null);
    const canvasBottomRef = useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);

    const world = useRef({ x: 0, obstacles: [] as any[], levelLength: 8000 });
    const p1 = useRef({ y: 150, dy: 0, rotation: 0, isGrounded: false, alive: true });
    const p2 = useRef({ y: 150, dy: 0, rotation: 0, isGrounded: false, alive: true });

    useEffect(() => {
        // Inizializzazione Mondo (Sincronizzato per entrambi)
        const obs: any[] = [];
        const levelLength = 8000;
        world.current.levelLength = levelLength;
        const spacing = 450 / level.speedMultiplier;
        for (let i = 1000; i < levelLength - 500; i += spacing + (Math.random() * 300)) {
            const type = Math.random() > 0.4 ? 'spike' : 'block';
            obs.push({ x: i, type, width: type === 'spike' ? 40 : 60, height: type === 'spike' ? 40 : 60 });
        }
        world.current.obstacles = obs;

        const handleInput = (active: boolean) => {
            if (p1.current.alive && active && p1.current.isGrounded) {
                p1.current.dy = JUMP_FORCE;
                p1.current.isGrounded = false;
            }
        };

        const onKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') handleInput(true); };
        window.addEventListener('keydown', onKeyDown);
        
        let frame: number;
        const update = () => {
            if (winner) return;

            // Avanzamento Mondo
            world.current.x += BASE_SPEED * level.speedMultiplier;
            const prog = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(prog);

            const groundY = 240;

            // --- PLAYER 1 (TU - SOPRA) ---
            if (p1.current.alive) {
                p1.current.dy += GAME_GRAVITY;
                p1.current.y += p1.current.dy;
                if (p1.current.y > groundY - 40) {
                    p1.current.y = groundY - 40;
                    p1.current.dy = 0;
                    p1.current.isGrounded = true;
                    p1.current.rotation = Math.round(p1.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
                } else {
                    p1.current.isGrounded = false;
                    if (mySkin.id !== 's-man') p1.current.rotation += 0.2;
                }

                world.current.obstacles.forEach(o => {
                    const ox = o.x - world.current.x;
                    if (ox > 120 && ox < 180 && p1.current.y > groundY - o.height - 10) {
                        p1.current.alive = false;
                    }
                });
            }

            // --- PLAYER 2 (SFIDANTE - SOTTO) ---
            if (p2.current.alive) {
                p2.current.dy += GAME_GRAVITY;
                p2.current.y += p2.current.dy;
                
                // IA di salto simulata (per inviti offline)
                const nextObstacle = world.current.obstacles.find(o => (o.x - world.current.x) > 180 && (o.x - world.current.x) < 350);
                if (nextObstacle && p2.current.isGrounded && Math.random() > 0.85) {
                    p2.current.dy = JUMP_FORCE;
                    p2.current.isGrounded = false;
                }

                if (p2.current.y > groundY - 40) {
                    p2.current.y = groundY - 40;
                    p2.current.dy = 0;
                    p2.current.isGrounded = true;
                    p2.current.rotation = Math.round(p2.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
                } else {
                    p2.current.isGrounded = false;
                    if (oppSkin.id !== 's-man') p2.current.rotation += 0.2;
                }

                world.current.obstacles.forEach(o => {
                    const ox = o.x - world.current.x;
                    if (ox > 120 && ox < 180 && p2.current.y > groundY - o.height - 10) {
                        if (Math.random() > 0.99) p2.current.alive = false;
                    }
                });
            }

            // Gestione Vittoria
            if (!p1.current.alive && p2.current.alive) setWinner(opponentName);
            else if (!p2.current.alive && p1.current.alive) setWinner(username);
            else if (prog >= 100) setWinner(p1.current.alive ? username : opponentName);

            // Rendering Distinto
            draw(canvasTopRef.current, p1.current, mySkin, username, true);
            draw(canvasBottomRef.current, p2.current, oppSkin, opponentName, false);

            frame = requestAnimationFrame(update);
        };

        const draw = (canvas: HTMLCanvasElement | null, p: any, skin: Skin, name: string, isMe: boolean) => {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.fillStyle = isMe ? '#0f172a' : '#1e1b4b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const groundY = 240;
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, groundY, canvas.width, 60);
            ctx.strokeStyle = level.color; ctx.lineWidth = 4; ctx.strokeRect(0, groundY, canvas.width, 2);

            world.current.obstacles.forEach(o => {
                const ox = o.x - world.current.x;
                if (ox < -100 || ox > canvas.width + 100) return;
                if (o.type === 'spike') {
                    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(ox, groundY); ctx.lineTo(ox+20, groundY-40); ctx.lineTo(ox+40, groundY); ctx.fill();
                } else {
                    ctx.fillStyle = '#475569'; ctx.fillRect(ox, groundY-60, 60, 60);
                }
            });

            if (p.alive) {
                ctx.save();
                ctx.translate(150 + 20, p.y + 20);
                
                if (skin.id === 's-man') {
                    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
                    ctx.beginPath(); ctx.arc(0, -15, 7, 0, Math.PI * 2); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 10); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(-12, -2); ctx.lineTo(12, -2); ctx.stroke();
                    const legOff = p.isGrounded ? 8 : 12;
                    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(-legOff, 20); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(legOff, 20); ctx.stroke();
                } else {
                    ctx.rotate(p.rotation);
                    ctx.fillStyle = skin.color;
                    const iconMap: any = { 'fa-square': '\uf0c8', 'fa-cube': '\uf1b2', 'fa-diamond': '\uf219', 'fa-crown': '\uf44b', 'fa-bolt': '\uf0e7', 'fa-terminal': '\uf120', 'fa-sun': '\uf185', 'fa-fire': '\uf06d', 'fa-user-secret': '\uf21b', 'fa-skull': '\uf54c' };
                    ctx.font = '36px "Font Awesome 6 Free"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(iconMap[skin.icon] || '\uf0c8', 0, 0);
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.strokeText(iconMap[skin.icon] || '\uf0c8', 0, 0);
                }
                ctx.restore();
            } else {
                ctx.fillStyle = 'white'; ctx.font = 'bold 24px Orbitron'; ctx.textAlign = 'center';
                ctx.fillText('BUM!', 170, p.y + 20);
            }

            // LABEL NOMI CORRETTI
            ctx.fillStyle = isMe ? '#3b82f6' : '#ef4444';
            ctx.font = 'black 16px Orbitron';
            ctx.textAlign = 'left';
            const label = isMe ? `TU: ${name.toUpperCase()}` : `AVVERSARIO: ${name.toUpperCase()}`;
            ctx.fillText(label, 20, 40);
            
            // Bordino per separare gli schermi
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.strokeRect(0,0,canvas.width, canvas.height);
        };

        update();
        return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', onKeyDown); };
    }, [winner, level, mySkin, oppSkin, username, opponentName]);

    return (
        <div className="h-full w-full bg-black flex flex-col overflow-hidden">
            <div className="flex-1 relative border-b-2 border-white/20">
                <canvas ref={canvasTopRef} width={window.innerWidth} height={window.innerHeight/2} className="w-full h-full" />
                <div className="absolute top-4 right-4 text-white font-black text-2xl italic">{Math.floor(progress)}%</div>
            </div>

            <div className="flex-1 relative">
                <canvas ref={canvasBottomRef} width={window.innerWidth} height={window.innerHeight/2} className="w-full h-full" />
                <div className="absolute top-4 right-4 text-white font-black text-2xl italic opacity-30">{Math.floor(progress)}%</div>
            </div>

            {winner && (
                <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-8 backdrop-blur-3xl animate-in fade-in zoom-in duration-500">
                    <div className="text-center bg-gray-900 p-16 rounded-[4rem] border-4 border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.1)] max-w-lg w-full">
                        <h2 className="text-6xl font-black italic text-white uppercase mb-4 tracking-tighter">FINE GARA</h2>
                        <div className={`text-4xl font-black mb-12 uppercase italic ${winner === username ? 'text-emerald-400 animate-pulse' : 'text-red-500'}`}>
                            {winner === username ? 'HAI VINTO TU!' : 'VINCE LO SFIDANTE!'}
                        </div>
                        <button onClick={onEnd} className="w-full bg-white text-black font-black px-12 py-6 rounded-3xl uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-2xl text-xl">Torna al Menu</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MPGameView;
