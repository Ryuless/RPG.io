const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1080

export const VIEW_WIDTH = isMobile ? window.innerWidth - 60 : 960 // Padded properly for mobile layout
export const VIEW_HEIGHT = isMobile ? Math.max(300, Math.min(window.innerHeight * 0.5, 540)) : 540
export const WORLD_WIDTH = 2800
export const WORLD_HEIGHT = 1800
export const PLAYER_RADIUS = 16
export const ENEMY_RADIUS = 14
