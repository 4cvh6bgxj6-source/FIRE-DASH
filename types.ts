
export enum AppState {
    LOGIN = 'LOGIN',
    MENU = 'MENU',
    LEVEL_SELECT = 'LEVEL_SELECT',
    GAME = 'GAME',
    SHOP = 'SHOP',
    SKINS = 'SKINS',
    GIFT_SHOP = 'GIFT_SHOP',
    FRIENDS_LOBBY = 'FRIENDS_LOBBY',
    MP_LOBBY = 'MP_LOBBY',
    MP_GAME = 'MP_GAME'
}

export interface Level {
    id: string;
    name: string;
    difficulty: 'Easy' | 'Normal' | 'Hard' | 'Insane' | 'Demon' | 'Extreme';
    speedMultiplier: number;
    color: string;
    locked?: boolean;
}

export interface Skin {
    id: string;
    name: string;
    color: string;
    cost: number;
    unlocked: boolean;
    icon: string;
    requiredTier?: 'free' | 'premium' | 'vip';
    isGlitched?: boolean;
    canFly?: boolean;
}

export interface UserStats {
    username: string;
    gems: number;
    isPremium: boolean;
    isVip: boolean;
    selectedSkinId: string;
}

export interface MPChallenge {
    id: string;
    from: string;
    to: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    timestamp: number;
}
