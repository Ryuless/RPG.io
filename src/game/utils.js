import {
  VIEW_HEIGHT,
  VIEW_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from './constants'

export const randomRange = (min, max) => Math.random() * (max - min) + min

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export const distance = (a, b) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

export const xpForLevel = (level) => Math.round(35 + level * level * 9)

export const getNearestEnemy = (player, enemies) => {
  if (!enemies.length) {
    return null
  }

  let nearest = enemies[0]
  let nearestDist = distance(player, nearest)

  for (let index = 1; index < enemies.length; index += 1) {
    const candidate = enemies[index]
    const candidateDist = distance(player, candidate)
    if (candidateDist < nearestDist) {
      nearest = candidate
      nearestDist = candidateDist
    }
  }

  return nearest
}

export const createCamera = (player) => {
  const x = clamp(player.x - VIEW_WIDTH / 2, 0, WORLD_WIDTH - VIEW_WIDTH)
  const y = clamp(player.y - VIEW_HEIGHT / 2, 0, WORLD_HEIGHT - VIEW_HEIGHT)
  return { x, y }
}

export const inViewport = (x, y, radius, camera) => {
  return (
    x + radius > camera.x &&
    y + radius > camera.y &&
    x - radius < camera.x + VIEW_WIDTH &&
    y - radius < camera.y + VIEW_HEIGHT
  )
}

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 1080 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export const spawnEnemyAroundPlayer = (player) => {
  const angle = randomRange(0, Math.PI * 2)
  const minRadius = Math.max(VIEW_WIDTH, VIEW_HEIGHT) * 0.55
  const maxRadius = minRadius + 220
  const distanceFromPlayer = randomRange(minRadius, maxRadius)

  return {
    x: clamp(player.x + Math.cos(angle) * distanceFromPlayer, 25, WORLD_WIDTH - 25),
    y: clamp(player.y + Math.sin(angle) * distanceFromPlayer, 25, WORLD_HEIGHT - 25),
  }
}
