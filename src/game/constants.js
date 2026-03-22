export let VIEW_WIDTH = 960
export let VIEW_HEIGHT = 540

export const updateViewSize = () => {
  if (typeof window === 'undefined') return
  const isMobile = window.innerWidth <= 1080 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  // Calculated using clientWidth to exclude scrollbars and added extra margin for safety
  VIEW_WIDTH = isMobile ? (document.documentElement.clientWidth || window.innerWidth) - 56 : 960 
  VIEW_HEIGHT = isMobile ? Math.min(window.innerHeight * 0.55, 480) : 540
}

updateViewSize()
if (typeof window !== 'undefined') {
  window.addEventListener('resize', updateViewSize)
}

export const WORLD_WIDTH = 2800
export const WORLD_HEIGHT = 1800
export const PLAYER_RADIUS = 16
export const ENEMY_RADIUS = 14
