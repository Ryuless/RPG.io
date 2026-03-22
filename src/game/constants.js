const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1080

// Calculated from app-shell padding (8px * 2) + page padding (12px * 2) + page border (1px * 2) = 42px. We'll round it to 42.
export const VIEW_WIDTH = isMobile ? window.innerWidth - 42 : 960 
export const VIEW_HEIGHT = isMobile ? Math.min(window.innerHeight * 0.6, 480) : 540
export const WORLD_WIDTH = 2800
export const WORLD_HEIGHT = 1800
export const PLAYER_RADIUS = 16
export const ENEMY_RADIUS = 14
