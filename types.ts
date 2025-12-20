
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
    requiredTier?: 'vip'; // Nuova proprietà: Richiede VIP
    isBossBattle?: boolean; // Nuova proprietà: Attiva la logica del Boss
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
    canShoot?: boolean; // Abilità Santa Claus (Gifts)
    hasBossFinisher?: boolean; // NUOVA ABILITÀ: Bazooka finale contro il Boss
    isEvent?: boolean; // Nuova proprietà per identificare skin evento
}

export interface UserStats {
    username: string;
    gems: number;
    isPremium: boolean;
    isVip: boolean;
    selectedSkinId: string;
    hasChristmasName?: boolean; // Ha sbloccato la funzionalità (Bundle Natale)
    nameColorType?: 'default' | 'rainbow' | 'christmas' | 'custom'; // Tipo di colore attivo
    customNameHex?: string; // Colore esadecimale personalizzato
}
