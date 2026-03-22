export let VIEW_WIDTH = 960
export let VIEW_HEIGHT = 540

export const updateViewSize = () => {
  if (typeof window === 'undefined') return
  const isMobile = window.innerWidth <= 1080 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  
  if (isMobile) {
    // Pada mobile padding kiri-kanan adalah 8px (app-shell) + 12px (page) + 1px border = 21px per sisi. Total 42px.
    // Tambahkan sedikit buffer agar tidak overflow di layar kecil (360px).
    VIEW_WIDTH = Math.max(280, (document.documentElement.clientWidth || window.innerWidth) - 46)
    VIEW_HEIGHT = Math.min(window.innerHeight * 0.55, 480)
  } else {
    VIEW_WIDTH = 960
    VIEW_HEIGHT = 540
  }
}

updateViewSize()
if (typeof window !== 'undefined') {
  window.addEventListener('resize', updateViewSize)
}

export const WORLD_WIDTH = 2800
export const WORLD_HEIGHT = 1800
export const PLAYER_RADIUS = 16
export const ENEMY_RADIUS = 14
