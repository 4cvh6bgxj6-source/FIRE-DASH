
import { Level, Skin } from './types';

export const LEVELS: Level[] = [
    { id: '1', name: 'Stereo Madness', difficulty: 'Easy', speedMultiplier: 1, color: '#34d399' },
    { id: '2', name: 'Back On Track', difficulty: 'Easy', speedMultiplier: 1, color: '#60a5fa' },
    { id: '3', name: 'Polargeist', difficulty: 'Normal', speedMultiplier: 1.2, color: '#a78bfa' },
    { id: '4', name: 'Darkness Hardcore', difficulty: 'Extreme', speedMultiplier: 4, color: '#ef4444' },
];

export const SKINS: Skin[] = [
    { id: 's1', name: 'Basic Cube', color: '#3b82f6', cost: 0, unlocked: true, icon: 'fa-square' },
    { id: 's2', name: 'Neon Green', color: '#10b981', cost: 50, unlocked: false, icon: 'fa-cube' },
    { id: 's3', name: 'Ruby Blaze', color: '#ef4444', cost: 150, unlocked: false, icon: 'fa-diamond' },
    { id: 's4', name: 'Golden God', color: '#f59e0b', cost: 500, unlocked: false, icon: 'fa-crown' },
    { id: 's5', name: 'Shadow Stalker', color: '#4b5563', cost: 1000, unlocked: false, icon: 'fa-ghost' },
];

export const GAME_GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const BASE_SPEED = 5;
