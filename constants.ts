
import { Level, Skin } from './types';

export const LEVELS: Level[] = [
    { id: '1', name: 'Stereo Madness', difficulty: 'Easy', speedMultiplier: 1, color: '#34d399' },
    { id: '2', name: 'Back On Track', difficulty: 'Easy', speedMultiplier: 1, color: '#60a5fa' },
    { id: '3', name: 'Polargeist', difficulty: 'Normal', speedMultiplier: 1.2, color: '#a78bfa' },
    { id: '4', name: 'Dry Out', difficulty: 'Normal', speedMultiplier: 1.3, color: '#facc15' },
    { id: '5', name: 'Base After Base', difficulty: 'Normal', speedMultiplier: 1.3, color: '#fb923c' },
    { id: '6', name: 'Cant Let Go', difficulty: 'Hard', speedMultiplier: 1.5, color: '#f87171' },
    { id: '7', name: 'Jumper', difficulty: 'Hard', speedMultiplier: 1.6, color: '#c084fc' },
    { id: '8', name: 'Darkness Hardcore', difficulty: 'Extreme', speedMultiplier: 4, color: '#ef4444' },
];

export const SKINS: Skin[] = [
    // Base Skins - Stile Geometry Dash
    { id: 's1', name: 'Cubo Classico', color: '#3b82f6', cost: 0, unlocked: true, icon: 'fa-square', requiredTier: 'free' },
    { id: 's2', name: 'KitT (Cat)', color: '#10b981', cost: 100, unlocked: false, icon: 'fa-cat', requiredTier: 'free' },
    { id: 's3', name: 'Nave Drago', color: '#ef4444', cost: 250, unlocked: false, icon: 'fa-dragon', requiredTier: 'free' },
    { id: 's4', name: 'King Rank', color: '#f59e0b', cost: 600, unlocked: false, icon: 'fa-crown', requiredTier: 'free' },
    
    // Omino Bianco - Stickman Speciale
    { id: 's-man', name: 'Omino Bianco', color: '#ffffff', cost: 300, unlocked: false, icon: 'fa-running', requiredTier: 'free' },
    
    // Premium Skins
    { id: 's6', name: 'Wave (Fulmine)', color: '#00ffff', cost: 0, unlocked: false, icon: 'fa-bolt', requiredTier: 'premium' },
    { id: 's9', name: 'Robo-X', color: '#888888', cost: 400, unlocked: false, icon: 'fa-robot', requiredTier: 'premium' },
    
    // VIP Skins
    { id: 's7', name: 'Ball (Sole)', color: '#ffd700', cost: 0, unlocked: false, icon: 'fa-sun', requiredTier: 'vip' },
    { id: 's10', name: 'Spider Dash', color: '#ff4500', cost: 550, unlocked: false, icon: 'fa-spider', requiredTier: 'vip' },
    
    // Secrets
    { 
        id: 's8', 
        name: 'Hacker Glitch', 
        color: '#00ff41', 
        cost: 999, 
        unlocked: false, 
        icon: 'fa-user-secret', 
        requiredTier: 'vip', 
        isGlitched: true 
    },
    { 
        id: 's666', 
        name: 'Demon Skull', 
        color: '#ff0000', 
        cost: 0, 
        unlocked: false, 
        icon: 'fa-skull', 
        requiredTier: 'vip', 
        isGlitched: true, 
        canFly: true 
    }
];

export const GAME_GRAVITY = 0.65;
export const JUMP_FORCE = -13;
export const BASE_SPEED = 5.2;
