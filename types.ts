
export enum AppState {
    LOGIN = 'LOGIN',
    MENU = 'MENU',
    LEVEL_SELECT = 'LEVEL_SELECT',
    GAME = 'GAME',
    SHOP = 'SHOP',
    SKINS = 'SKINS',
    GIFT_SHOP = 'GIFT_SHOP',
    CHRISTMAS_EVENT = 'CHRISTMAS_EVENT'
}

export interface Level {
    id: string;
    name: string;
    difficulty: 'Easy' | 'Normal' | 'Hard' | 'Insane' | 'Demon' | 'Extreme';
    speedMultiplier: number;
    color: string;
    locked?: boolean;
    requiredTier?: 'vip'; 
    requiredSkinId?: string; // Nuova proprietà: Richiede una skin specifica equipaggiata
    isBossBattle?: boolean; 
}

// Definizione dell'interfaccia Skin utilizzata nel catalogo skin e nei componenti di gioco
export interface Skin {
    id: string;
    name: string;
    color: string;
    cost: number;
    unlocked: boolean;
    icon: string;
    requiredTier: 'free' | 'premium' | 'vip';
    hasBossFinisher?: boolean;
    isEvent?: boolean;
    canFly?: boolean;
    canShoot?: boolean;
    isGlitched?: boolean;
}

export interface UserStats {
    username: string;
    gems: number;
    isPremium: boolean;
    isVip: boolean;
    selectedSkinId: string;
    hasChristmasName?: boolean; 
    nameColorType?: 'default' | 'rainbow' | 'christmas' | 'custom'; 
    customNameHex?: string; 
}
