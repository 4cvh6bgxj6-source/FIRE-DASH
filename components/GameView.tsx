
import React, { useEffect, useRef, useState } from 'react';
import { Level, Skin } from '../types';
import { GAME_GRAVITY, JUMP_FORCE, BASE_SPEED } from '../constants';

interface Props {
    level: Level;
    skin: Skin;
    onEnd: (success: boolean, gems: number) => void;
}

const GameView: React.FC<Props> = ({ level, skin, onEnd }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = useState(0);
    const [gemsCollected, setGemsCollected] = useState(0);
    
    // Internal game state refs to avoid re-renders
    const player = useRef({
        y: 300,
        dy: 0,
        width: 40,
        height: 40,
        rotation: 0,
        isGrounded: false
    });
    
    const world = useRef({
        x: 0,
        obstacles: [] as { x: number, width: number, height: number, type: 'spike' | 'block' | 'gem' }[],
        finished: false
    });

    useEffect(() => {
        // Initialize obstacles for this level
        const obstacles: typeof world.current.obstacles = [];
        const levelLength = 5000;
        
        for (let i = 800; i < levelLength; i += (400 / level.speedMultiplier)) {
            const rand = Math.random();
            if (rand < 0.4) {
                obstacles.push({ x: i, width: 40, height: 40, type: 'spike' });
            } else if (rand < 0.7) {
                obstacles.push({ x: i, width: 60, height: 60, type: 'block' });
                if (Math.random() > 0.5) {
                    obstacles.push({ x: i + 10, width: 30, height: 30, type: 'gem' });
                }
            } else {
                 obstacles.push({ x: i, width: 30, height: 30, type: 'gem' });
            }
        }
        world.current.obstacles = obstacles;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const handleInput = () => {
            if (player.current.isGrounded) {
                player.current.dy = JUMP_FORCE;
                player.current.isGrounded = false;
            }
        };

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') handleInput();
        });
        canvas.addEventListener('mousedown', handleInput);

        const update = () => {
            if (world.current.finished) return;

            // Physics
            player.current.dy += GAME_GRAVITY;
            player.current.y += player.current.dy;

            // Ground collision
            const groundY = canvas.height - 100;
            if (player.current.y + player.current.height > groundY) {
                player.current.y = groundY - player.current.height;
                player.current.dy = 0;
                player.current.isGrounded = true;
                // Snap rotation to 90deg increments when on ground
                player.current.rotation = Math.round(player.current.rotation / (Math.PI / 2)) * (Math.PI / 2);
            } else {
                player.current.rotation += 0.15 * level.speedMultiplier;
            }

            // Move world
            world.current.x += BASE_SPEED * level.speedMultiplier;
            const currentProgress = Math.min(100, (world.current.x / levelLength) * 100);
            setProgress(currentProgress);

            if (currentProgress >= 100) {
                world.current.finished = true;
                onEnd(true, gemsCollected);
            }

            // Collisions
            const px = 150; // Player fixed X screen position
            for (let i = 0; i < world.current.obstacles.length; i++) {
                const obs = world.current.obstacles[i];
                const obsX = obs.x - world.current.x;

                // Simple AABB collision
                if (
                    px < obsX + obs.width &&
                    px + player.current.width > obsX &&
                    player.current.y < groundY - 0 + obs.height && // Adjust based on obs type
                    player.current.y + player.current.height > groundY - obs.height
                ) {
                    if (obs.type === 'gem') {
                        setGemsCollected(prev => prev + 5);
                        world.current.obstacles.splice(i, 1);
                        continue;
                    }
                    // Crash
                    world.current.finished = true;
                    onEnd(false, gemsCollected);
                    return;
                }
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Background
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw Ground
            const groundY = canvas.height - 100;
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, groundY, canvas.width, 100);
            ctx.strokeStyle = level.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(canvas.width, groundY);
            ctx.stroke();

            // Draw Obstacles
            world.current.obstacles.forEach(obs => {
                const obsX = obs.x - world.current.x;
                if (obsX < -100 || obsX > canvas.width + 100) return;

                if (obs.type === 'spike') {
                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath();
                    ctx.moveTo(obsX, groundY);
                    ctx.lineTo(obsX + obs.width / 2, groundY - obs.height);
                    ctx.lineTo(obsX + obs.width, groundY);
                    ctx.fill();
                    // Glow
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ef4444';
                } else if (obs.type === 'block') {
                    ctx.fillStyle = '#475569';
                    ctx.fillRect(obsX, groundY - obs.height, obs.width, obs.height);
                    ctx.strokeStyle = '#fff';
                    ctx.strokeRect(obsX, groundY - obs.height, obs.width, obs.height);
                } else if (obs.type === 'gem') {
                    ctx.fillStyle = '#60a5fa';
                    ctx.beginPath();
                    ctx.arc(obsX + obs.width / 2, groundY - obs.height / 2 - 20, obs.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
            });

            // Draw Player
            ctx.save();
            ctx.translate(150 + player.current.width / 2, player.current.y + player.current.height / 2);
            ctx.rotate(player.current.rotation);
            
            // Skin rendering
            ctx.fillStyle = skin.color;
            ctx.fillRect(-player.current.width / 2, -player.current.height / 2, player.current.width, player.current.height);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(-player.current.width / 2, -player.current.height / 2, player.current.width, player.current.height);
            
            // Player face/detail
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(5, -15, 10, 10);
            ctx.fillRect(-15, -15, 10, 10);
            ctx.restore();

            update();
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleInput);
        };
    }, [level, skin, onEnd, gemsCollected]);

    return (
        <div className="h-full w-full relative flex items-center justify-center bg-black">
            {/* HUD */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-1">
                    <div className="text-white font-black text-2xl drop-shadow-md">{level.name}</div>
                    <div className="text-blue-400 font-bold flex items-center gap-2">
                        <i className="fas fa-gem"></i> {gemsCollected}
                    </div>
                </div>
                
                <div className="flex flex-col items-end">
                    <div className="text-white font-black text-4xl italic">{Math.floor(progress)}%</div>
                    <div className="w-64 h-2 bg-gray-800 rounded-full mt-2 overflow-hidden border border-white/10">
                        <div 
                            className="h-full transition-all duration-100" 
                            style={{ width: `${progress}%`, backgroundColor: level.color }}
                        ></div>
                    </div>
                </div>
            </div>

            <canvas 
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight}
                className="w-full h-full cursor-pointer"
            />
            
            {/* Speed Badge */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-red-600/20 border border-red-500/50 px-4 py-1 rounded-full text-red-500 font-black italic tracking-widest text-sm">
                VELOCITÀ {level.speedMultiplier}X
            </div>
        </div>
    );
};

export default GameView;
