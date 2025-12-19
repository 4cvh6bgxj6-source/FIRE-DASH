
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
    const [oppProgress, setOppProgress] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);

    const world = useRef({ x: 0, obstacles: [] as any[], levelLength: 10000 });
    const p1 = useRef({ y: 150, dy: 0, rotation: 0, isGrounded: false, alive: true });
    const p2 = useRef({ y: 150, dy: 0, rotation: 0, isGrounded: false, alive: true });

    useEffect(() => {
        const obs: any[] = [];
        for (let i = 1000; i < world.current.levelLength; i += 400 + Math.random() * 300) {
            obs.push({ x: i, type: Math.random() > 0.5 ? 'spike' : 'block' });
        }
        world.current.obstacles = obs;

        const startAction = (e: any) => {
            if (e.cancelable) e.preventDefault();
            if (p1.current.alive && p1.current.isGrounded) {
                p1.current.dy = JUMP_FORCE;
                p1.current.isGrounded = false;
            }
        };

        window.addEventListener('keydown', (e) => { if(e.code === 'Space') startAction(e); });
        window.addEventListener('touchstart', startAction, { passive: false });

        let frame: number;
        const update = () => {
            if (winner) return;

            // Movimento Mondo
            world.current.x += BASE_SPEED * level.speedMultiplier;
            const prog = Math.min(100, (world.current.x / world.current.levelLength) * 100);
            setProgress(prog);

            // Giocatore 1 (TU)
            if (p1.current.alive) {
                p1.current.dy += GAME_GRAVITY;
                p1.current.y += p1.current.dy;
                if (p1.current.y > 200) { p1.current.y = 200; p1.current.dy = 0; p1.current.isGrounded = true; }
                else { p1.current.isGrounded = false; p1.current.rotation += 0.2; }

                world.current.obstacles.forEach(o => {
                    const ox = o.x - world.current.x;
                    if (ox > 130 && ox < 170 && p1.current.y > 170) p1.current.alive = false;
                });
            }

            // Giocatore 2 (AVVERSARIO SIMULATO / SINCRONIZZATO)
            if (p2.current.alive) {
                p2.current.dy += GAME_GRAVITY;
                p2.current.y += p2.current.dy;
                // IA semplice per simulazione
                if (p2.current.isGrounded && Math.random() > 0.98) { p2.current.dy = JUMP_FORCE; p2.current.isGrounded = false; }
                if (p2.current.y > 200) { p2.current.y = 200; p2.current.dy = 0; p2.current.isGrounded = true; }
                else { p2.current.isGrounded = false; p2.current.rotation += 0.2; }

                world.current.obstacles.forEach(o => {
                    const ox = o.x - world.current.x;
                    if (ox > 130 && ox < 170 && p2.current.y > 170 && Math.random() > 0.99) p2.current.alive = false;
                });
            }

            if (!p1.current.alive && p2.current.alive) setWinner(opponentName);
            if (!p2.current.alive && p1.current.alive) setWinner(username);
            if (prog >= 100) setWinner(username);

            draw(canvasTopRef.current, p1.current, mySkin, username);
            draw(canvasBottomRef.current, p2.current, oppSkin, opponentName);

            frame = requestAnimationFrame(update);
        };

        const draw = (canvas: HTMLCanvasElement | null, p: any, skin: Skin, name: string) => {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Background
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Ground
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 240, canvas.width, 60);

            // Obstacles
            ctx.fillStyle = '#ef4444';
            world.current.obstacles.forEach(o => {
                const ox = o.x - world.current.x;
                if (ox < -50 || ox > canvas.width + 50) return;
                ctx.beginPath();
                ctx.moveTo(ox, 240);
                ctx.lineTo(ox+20, 200);
                ctx.lineTo(ox+40, 240);
                ctx.fill();
            });

            // Player
            if (p.alive) {
                ctx.save();
                ctx.translate(150, p.y + 20);
                ctx.rotate(p.rotation);
                ctx.fillStyle = skin.color;
                ctx.fillRect(-20, -20, 40, 40);
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(-20,-20,40,40);
                ctx.restore();
            }

            // Info
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Orbitron';
            ctx.fillText(name.toUpperCase(), 20, 30);
        };

        update();
        return () => { cancelAnimationFrame(frame); window.removeEventListener('touchstart', startAction); };
    }, [winner, level, mySkin, oppSkin, username, opponentName]);

    return (
        <div className="h-full w-full bg-black flex flex-col overflow-hidden">
            {/* Split Screen Top */}
            <div className="flex-1 relative border-b-4 border-yellow-500">
                <canvas ref={canvasTopRef} width={window.innerWidth} height={window.innerHeight/2} className="w-full h-full" />
                <div className="absolute top-4 right-4 text-white font-black text-2xl italic">{Math.floor(progress)}%</div>
                <div className="absolute top-4 left-4 text-blue-400 text-[10px] font-bold uppercase tracking-widest">TU ({username})</div>
            </div>

            {/* Split Screen Bottom */}
            <div className="flex-1 relative">
                <canvas ref={canvasBottomRef} width={window.innerWidth} height={window.innerHeight/2} className="w-full h-full" />
                <div className="absolute top-4 right-4 text-white font-black text-2xl italic opacity-50">{Math.floor(progress)}%</div>
                <div className="absolute top-4 left-4 text-red-400 text-[10px] font-bold uppercase tracking-widest">{opponentName}</div>
            </div>

            {winner && (
                <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-8">
                    <div className="text-center">
                        <h2 className="text-5xl font-black italic text-white uppercase mb-4 tracking-tighter">GARA FINITA</h2>
                        <div className="text-2xl font-black text-yellow-400 mb-8 uppercase italic">VINCITORE: {winner}</div>
                        <button onClick={onEnd} className="bg-white text-black font-black px-12 py-4 rounded-2xl uppercase tracking-widest">Torna al Menu</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MPGameView;
