
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
    { id: 's1', name: 'Basic Cube', color: '#3b82f6', cost: 0, unlocked: true, icon: 'fa-square', requiredTier: 'free' },
    { id: 's2', name: 'Neon Green', color: '#10b981', cost: 50, unlocked: false, icon: 'fa-cube', requiredTier: 'free' },
    { id: 's3', name: 'Ruby Blaze', color: '#ef4444', cost: 150, unlocked: false, icon: 'fa-diamond', requiredTier: 'free' },
    { id: 's4', name: 'Golden God', color: '#f59e0b', cost: 500, unlocked: false, icon: 'fa-crown', requiredTier: 'free' },
    { id: 's-man', name: 'Omino Salterino', color: '#ffffff', cost: 200, unlocked: false, icon: 'fa-walking', requiredTier: 'free' },
    
    // Premium
    { id: 's6', name: 'Neon Spark', color: '#ff00ff', cost: 0, unlocked: false, icon: 'fa-bolt', requiredTier: 'premium' },
    { id: 's9', name: 'Matrix Runner', color: '#003b00', cost: 300, unlocked: false, icon: 'fa-terminal', requiredTier: 'premium' },
    
    // VIP
    { id: 's7', name: 'Gold Void', color: '#ffd700', cost: 0, unlocked: false, icon: 'fa-sun', requiredTier: 'vip' },
    { id: 's10', name: 'Fire Lord', color: '#ff4500', cost: 450, unlocked: false, icon: 'fa-fire', requiredTier: 'vip' },
    
    // ADMIN GLITCH: Richiede VIP e 999 Gemme
    { 
        id: 's8', 
        name: 'ADMIN GLITCH', 
        color: '#00ff41', 
        cost: 999, 
        unlocked: false, 
        icon: 'fa-user-secret', 
        requiredTier: 'vip', 
        isGlitched: true 
    },

    // ERROR 666: Skin Segreta (Codice)
    { 
        id: 's666', 
        name: 'ERROR 666', 
        color: '#ff0000', 
        cost: 0, 
        unlocked: false, 
        icon: 'fa-skull', 
        requiredTier: 'vip', 
        isGlitched: true, 
        canFly: true 
    }
];

export const GAME_GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const BASE_SPEED = 5;
