import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MAX_SKILL_LEVEL,
  RANK_DROP_WEIGHT,
  RANK_REQUIREMENTS,
  SKILLS,
} from '../data/skills'
import {
  ENEMY_RADIUS,
  PLAYER_RADIUS,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../game/constants'
import {
  clamp,
  createCamera,
  distance,
  getNearestEnemy,
  inViewport,
  randomRange,
  spawnEnemyAroundPlayer,
  xpForLevel,
} from '../game/utils'

import useDeviceDetect from '../hooks/useDeviceDetect'
import VirtualJoystick from '../components/VirtualJoystick'

const rankPriority = {
  Common: 1,
  Uncommon: 2,
  Epic: 3,
  Legend: 4,
  Mytical: 5,
  Myth: 6,
  God: 7,
}

const SPECIAL_ACTIVE_SKILL_IDS = new Set([
  'arcaneBolt',
  'whirlSlash',
  'frostNova',
  'fireball',
  'guardianAura',
  'chainLightning',
  'poisonCloud',
  'thunderTotem',
  'shadowStep',
  'vampiricEdge',
  'ironWill',
  'runeMastery',
  'celestialLance',
  'godHand',
])

const OFFENSIVE_TYPES = new Set(['Magic', 'Melee', 'Ranged', 'Control', 'Debuff'])
const CHARACTER_NORMAL_ATTACK_LABEL = {
  human: 'Arcane Shot (magic bolt + slow)',
  elf: 'Wind Arrow (rapid pierce + poison)',
  dwarf: 'Hammer Cleave (close AoE)',
  orc: 'Brutal Swing (melee + heal on hit)',
  draconid: 'Drake Wave (magic wave + slow)',
  shade: 'Shadow Dagger (high crit + lifesteal)',
  automata: 'Twin Pulse (double arc bolts)',
}

const weightedPickFromPool = (pool) => {
  const totalWeight = pool.reduce((sum, skill) => {
    return sum + (RANK_DROP_WEIGHT[skill.rank] || 1)
  }, 0)

  let roll = Math.random() * totalWeight
  let selectedIndex = 0

  for (let index = 0; index < pool.length; index += 1) {
    roll -= RANK_DROP_WEIGHT[pool[index].rank] || 1
    if (roll <= 0) {
      selectedIndex = index
      break
    }
  }

  return pool[selectedIndex]
}

const crateLimitedSkillIds = Object.values(SKILLS)
  .filter((skill) => skill.limited)
  .map((skill) => skill.id)

const canUnlockRank = (game, rank) => {
  if (rank === 'Common') return true
  if (rank === 'Uncommon') return game.level >= 4
  if (rank === 'Epic') return game.level >= 8 && game.time >= 120
  if (rank === 'Legend') return game.level >= 14 && game.kills >= 90
  if (rank === 'Mytical') return game.level >= 20 && game.time >= 480
  if (rank === 'Myth') return game.level >= 26 && game.bossesKilled >= 1
  if (rank === 'God') {
    return game.level >= 35 && game.bossesKilled >= 3 && game.time >= 900
  }
  return false
}

const canOfferSkill = (game, skill) => {
  if (!canUnlockRank(game, skill.rank)) {
    return false
  }
  if (game.skills[skill.id] >= MAX_SKILL_LEVEL) {
    return false
  }
  return true
}

const pickWeightedSkills = (game) => {
  const candidates = Object.values(SKILLS).filter((skill) => canOfferSkill(game, skill))

  const picks = []
  const pickedTypes = new Set()

  while (picks.length < 3 && candidates.length) {
    const needOffensive =
      picks.length === 2 &&
      !picks.some((skillId) => OFFENSIVE_TYPES.has(SKILLS[skillId].type)) &&
      candidates.some((skill) => OFFENSIVE_TYPES.has(skill.type))

    const uniqueTypePool = candidates.filter((skill) => !pickedTypes.has(skill.type))
    const offensivePool = candidates.filter((skill) => OFFENSIVE_TYPES.has(skill.type))
    const offensiveUniquePool = uniqueTypePool.filter((skill) => OFFENSIVE_TYPES.has(skill.type))

    let selectionPool = candidates
    if (needOffensive && offensiveUniquePool.length) {
      selectionPool = offensiveUniquePool
    } else if (needOffensive && offensivePool.length) {
      selectionPool = offensivePool
    } else if (uniqueTypePool.length) {
      selectionPool = uniqueTypePool
    }

    const chosen = weightedPickFromPool(selectionPool)
    if (!chosen) {
      break
    }

    picks.push(chosen.id)
    pickedTypes.add(chosen.type)

    const selectedIndex = candidates.findIndex((skill) => skill.id === chosen.id)
    if (selectedIndex >= 0) {
      candidates.splice(selectedIndex, 1)
    } else {
      const fallbackIndex = candidates.findIndex((skill) => !picks.includes(skill.id))
      if (fallbackIndex >= 0) {
        candidates.splice(fallbackIndex, 1)
      }
    }
  }

  return picks
}
const performCharacterNormalAttack = (game, totalAttackSpeed, berserkMultiplier) => {
  if (!game.enemies.length || game.time < game.player.normalAttackReady) {
    return
  }

  const nearest = getNearestEnemy(game.player, game.enemies)
  if (!nearest) {
    return
  }

  const angle = Math.atan2(nearest.y - game.player.y, nearest.x - game.player.x)

  if (game.selectedCharacter.id === 'human') {
    game.projectiles.push({
      id: game.projectileId++,
      x: game.player.x,
      y: game.player.y,
      vx: Math.cos(angle) * 340,
      vy: Math.sin(angle) * 340,
      ttl: 1,
      radius: 6,
      damage: 13 * game.player.magicPower * berserkMultiplier,
      pierce: 0,
      hitSlowDuration: 0.85,
      color: '#8b5cf6',
    })
    game.player.normalAttackReady = game.time + 0.62 / totalAttackSpeed
    return
  }

  if (game.selectedCharacter.id === 'elf') {
    game.projectiles.push({
      id: game.projectileId++,
      x: game.player.x,
      y: game.player.y,
      vx: Math.cos(angle) * 420,
      vy: Math.sin(angle) * 420,
      ttl: 0.95,
      radius: 5,
      damage: 11 * game.player.rangedPower * berserkMultiplier,
      pierce: 1,
      critBonus: 0.14,
      hitPoisonDuration: 1.6,
      hitPoisonDps: 7,
      color: '#22c55e',
    })
    game.player.normalAttackReady = game.time + 0.42 / totalAttackSpeed
    return
  }

  if (game.selectedCharacter.id === 'dwarf') {
    const radius = 66
    const damage = 20 * game.player.meleePower * berserkMultiplier
    game.effects.push({
      id: game.effectId++,
      x: game.player.x,
      y: game.player.y,
      radius,
      ttl: 0.2,
      color: 'rgba(245, 158, 11, 0.4)',
    })
    game.enemies.forEach((enemy) => {
      if (distance(enemy, game.player) <= radius + enemy.radius) {
        enemy.hp -= damage
        enemy.slowUntil = Math.max(enemy.slowUntil || 0, game.time + 0.8)
      }
    })
    game.player.normalAttackReady = game.time + 0.78 / totalAttackSpeed
    return
  }

  if (game.selectedCharacter.id === 'orc') {
    const radius = 74
    const damage = 17 * game.player.meleePower * berserkMultiplier
    let hitCount = 0
    game.effects.push({
      id: game.effectId++,
      x: game.player.x,
      y: game.player.y,
      radius,
      ttl: 0.18,
      color: 'rgba(239, 68, 68, 0.36)',
    })
    game.enemies.forEach((enemy) => {
      if (distance(enemy, game.player) <= radius + enemy.radius) {
        enemy.hp -= damage
        hitCount += 1
      }
    })
    if (hitCount > 0) {
      game.player.hp = clamp(
        game.player.hp + hitCount * game.player.baseMaxHp * 0.01,
        0,
        game.player.baseMaxHp,
      )
    }
    game.player.normalAttackReady = game.time + 0.7 / totalAttackSpeed
    return
  }

  if (game.selectedCharacter.id === 'draconid') {
    game.projectiles.push({
      id: game.projectileId++,
      x: game.player.x,
      y: game.player.y,
      vx: Math.cos(angle) * 320,
      vy: Math.sin(angle) * 320,
      ttl: 1,
      radius: 7,
      damage: 14 * game.player.magicPower * berserkMultiplier,
      pierce: 0,
      hitSlowDuration: 1,
      color: '#06b6d4',
    })
    game.player.normalAttackReady = game.time + 0.66 / totalAttackSpeed
    return
  }

  if (game.selectedCharacter.id === 'shade') {
    game.projectiles.push({
      id: game.projectileId++,
      x: game.player.x,
      y: game.player.y,
      vx: Math.cos(angle) * 390,
      vy: Math.sin(angle) * 390,
      ttl: 0.9,
      radius: 5,
      damage: 12 * game.player.meleePower * berserkMultiplier,
      pierce: 0,
      critBonus: 0.25,
      lifestealRatio: 0.06,
      color: '#a855f7',
    })
    game.player.normalAttackReady = game.time + 0.48 / totalAttackSpeed
    return
  }

  const offset = 0.12
  for (const spread of [-offset, offset]) {
    const shotAngle = angle + spread
    game.projectiles.push({
      id: game.projectileId++,
      x: game.player.x,
      y: game.player.y,
      vx: Math.cos(shotAngle) * 360,
      vy: Math.sin(shotAngle) * 360,
      ttl: 0.95,
      radius: 5,
      damage: 9.5 * game.player.magicPower * berserkMultiplier,
      pierce: 0,
      color: '#0ea5e9',
    })
  }
  game.player.normalAttackReady = game.time + 0.46 / totalAttackSpeed
}

const createGameState = (character) => {
  const player = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    hp: character.stats.maxHp,
    baseMaxHp: character.stats.maxHp,
    speed: character.stats.speed,
    armor: character.stats.armor,
    meleePower: character.stats.meleePower,
    magicPower: character.stats.magicPower,
    rangedPower: character.stats.rangedPower,
    attackSpeed: character.stats.attackSpeed,
    expGain: character.stats.expGain,
    regen: character.stats.regen,
    critChance: character.stats.critChance,
    lifesteal: character.stats.lifesteal,
    thorns: character.stats.thorns || 0,
    abilityCooldown: character.abilityCooldown,
    abilityReady: 0,
    normalAttackReady: 0,
    berserkUntil: 0,
    wardUntil: 0,
    dodgeBoostUntil: 0,
    matrixUntil: 0,
  }

  return {
    time: 0,
    points: 0,
    level: 1,
    exp: 0,
    expNext: xpForLevel(1),
    paused: false,
    pausedForLevel: false,
    levelChoices: [],
    gameOver: false,
    kills: 0,
    bossesKilled: 0,
    enemyId: 0,
    orbId: 0,
    projectileId: 0,
    effectId: 0,
    crateId: 0,
    player,
    camera: createCamera(player),
    selectedCharacter: character,
    enemies: [],
    orbs: [],
    projectiles: [],
    effects: [],
    crates: [],
    skills: Object.keys(SKILLS).reduce((map, skillId) => {
      map[skillId] = skillId === 'arcaneBolt' ? 1 : 0
      return map
    }, {}),
    cooldowns: {
      arcaneBolt: 0,
      whirlSlash: 0,
      frostNova: 0,
      fireball: 0,
      chainLightning: 0,
      poisonCloud: 0,
      thunderTotem: 0,
      matrixPulse: 0,
      celestialLance: 0,
      godHand: 0,
    },
    spawnEnemyAt: 0,
    spawnOrbAt: 0.7,
    spawnCrateAt: randomRange(40, 75),
    nextBossAt: randomRange(180, 300),
  }
}

const createGameSnapshot = (game) => ({
  ...game,
  player: { ...game.player },
  camera: { ...game.camera },
  selectedCharacter: {
    ...game.selectedCharacter,
    stats: { ...game.selectedCharacter.stats },
  },
  skills: { ...game.skills },
  cooldowns: { ...game.cooldowns },
  enemies: game.enemies.map((enemy) => ({ ...enemy })),
  orbs: game.orbs.map((orb) => ({ ...orb })),
  projectiles: game.projectiles.map((projectile) => ({ ...projectile })),
  effects: game.effects.map((effect) => ({ ...effect })),
  crates: game.crates.map((crate) => ({ ...crate })),
  levelChoices: [...game.levelChoices],
})

const formatSurviveTime = (seconds) => {
  const safe = Math.max(0, Math.floor(seconds))
  const minute = String(Math.floor(safe / 60)).padStart(2, '0')
  const sec = String(safe % 60).padStart(2, '0')
  return `${minute}:${sec}`
}

function RunScreen({ character, onBackHome, onSkillDiscovered }) {
  const initialGame = useMemo(() => createGameState(character), [character])
  const gameRef = useRef(initialGame)
  const keysRef = useRef({})
  const joystickRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const lastTimeRef = useRef(0)

  const { isMobile } = useDeviceDetect()

  const [gameView, setGameView] = useState(() => createGameSnapshot(initialGame))

  useEffect(() => {
    onSkillDiscovered('arcaneBolt')
  }, [onSkillDiscovered])

  useEffect(() => {
    const downHandler = (event) => {
      const key = event.key.toLowerCase()
      keysRef.current[key] = true

      if (event.code === 'Space') {
        event.preventDefault()
      }

      if (event.code === 'Escape') {
        const game = gameRef.current
        if (!game.gameOver && !game.pausedForLevel) {
          game.paused = !game.paused
          setGameView(createGameSnapshot(game))
        }
      }
    }

    const upHandler = (event) => {
      keysRef.current[event.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)

    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    const update = (timestamp) => {
      const game = gameRef.current
      const prevTime = lastTimeRef.current || timestamp
      const dt = Math.min((timestamp - prevTime) / 1000, 0.05)
      lastTimeRef.current = timestamp

      if (!game.gameOver && !game.paused && !game.pausedForLevel) {
        game.time += dt

        const ironWillLevel = game.skills.ironWill
        const maxHpMultiplier = 1 + ironWillLevel * 0.06
        const effectiveMaxHp = game.player.baseMaxHp * maxHpMultiplier
        game.player.hp = clamp(game.player.hp, 0, effectiveMaxHp)

        const auraLevel = game.skills.guardianAura
        const regenBonus = auraLevel * 0.6
        const armorBonus = auraLevel * 5

        const shadowStepLevel = game.skills.shadowStep
        const characterDodgeBonus = game.time < game.player.dodgeBoostUntil ? 0.22 : 0
        const dodgeChance = Math.min(0.65, shadowStepLevel * 0.03 + characterDodgeBonus)
        const speedBonus = shadowStepLevel * 7

        const vampiricLevel = game.skills.vampiricEdge
        const extraLifesteal = vampiricLevel * 0.015

        const runeMasteryLevel = game.skills.runeMastery
        const attackSpeedBonus = runeMasteryLevel * 0.05
        const magicBonus = runeMasteryLevel * 0.04

        let genericArmorBonus = 0
        let genericSpeedBonus = 0
        let genericRegenBonus = 0
        let genericAttackSpeedBonus = 0
        let genericMagicBonus = 0
        let genericExpBonus = 0

        Object.values(SKILLS).forEach((skill) => {
          if (SPECIAL_ACTIVE_SKILL_IDS.has(skill.id)) {
            return
          }

          const level = game.skills[skill.id] || 0
          if (level <= 0) {
            return
          }

          const rankScale = rankPriority[skill.rank] || 1
          genericArmorBonus += level * rankScale * 0.8
          genericSpeedBonus += level * rankScale * 1.15
          genericRegenBonus += level * rankScale * 0.028
          genericAttackSpeedBonus += level * rankScale * 0.008
          genericMagicBonus += level * rankScale * 0.01
          genericExpBonus += level * rankScale * 0.003
        })

        const totalArmor = game.player.armor + armorBonus + genericArmorBonus
        const totalAttackSpeed =
          game.player.attackSpeed * (1 + attackSpeedBonus + genericAttackSpeedBonus)
        const totalMagicPower = game.player.magicPower * (1 + magicBonus + genericMagicBonus)
        const totalExpGain = game.player.expGain * (1 + genericExpBonus)

        game.player.hp = clamp(
          game.player.hp + (game.player.regen + regenBonus) * dt,
          0,
          effectiveMaxHp,
        )

        game.player.hp = clamp(game.player.hp + genericRegenBonus * dt, 0, effectiveMaxHp)

        const left = keysRef.current.a || keysRef.current.arrowleft
        const right = keysRef.current.d || keysRef.current.arrowright
        const up = keysRef.current.w || keysRef.current.arrowup
        const down = keysRef.current.s || keysRef.current.arrowdown

        let moveX = joystickRef.current.x
        let moveY = joystickRef.current.y

        if (moveX === 0 && moveY === 0) {
          if (left) moveX -= 1
          if (right) moveX += 1
          if (up) moveY -= 1
          if (down) moveY += 1

          if (moveX !== 0 || moveY !== 0) {
            const len = Math.hypot(moveX, moveY)
            moveX /= len
            moveY /= len
          }
        }

        game.player.x = clamp(
          game.player.x + moveX * (game.player.speed + speedBonus) * dt,
          PLAYER_RADIUS,
          WORLD_WIDTH - PLAYER_RADIUS,
        )
        game.player.y = clamp(
          game.player.y + moveY * (game.player.speed + speedBonus + genericSpeedBonus) * dt,
          PLAYER_RADIUS,
          WORLD_HEIGHT - PLAYER_RADIUS,
        )

        if (keysRef.current[' '] && game.time >= game.player.abilityReady) {
          const nearest = getNearestEnemy(game.player, game.enemies)

          if (game.selectedCharacter.id === 'human') {
            const directionX = moveX || (nearest ? nearest.x - game.player.x : 1)
            const directionY = moveY || (nearest ? nearest.y - game.player.y : 0)
            const length = Math.hypot(directionX, directionY) || 1

            game.player.x = clamp(
              game.player.x + (directionX / length) * 95,
              PLAYER_RADIUS,
              WORLD_WIDTH - PLAYER_RADIUS,
            )
            game.player.y = clamp(
              game.player.y + (directionY / length) * 95,
              PLAYER_RADIUS,
              WORLD_HEIGHT - PLAYER_RADIUS,
            )

            const radius = 95
            game.effects.push({
              id: game.effectId++,
              x: game.player.x,
              y: game.player.y,
              radius,
              ttl: 0.35,
              color: 'rgba(124, 92, 255, 0.45)',
            })

            game.enemies.forEach((enemy) => {
              if (distance(enemy, game.player) <= radius + enemy.radius) {
                enemy.hp -= 38 * totalMagicPower
                enemy.slowUntil = Math.max(enemy.slowUntil || 0, game.time + 1.2)
              }
            })
          } else if (game.selectedCharacter.id === 'elf') {
            const amount = 6
            for (let index = 0; index < amount; index += 1) {
              const angle = (Math.PI * 2 * index) / amount
              game.projectiles.push({
                id: game.projectileId++,
                x: game.player.x,
                y: game.player.y,
                vx: Math.cos(angle) * 360,
                vy: Math.sin(angle) * 360,
                ttl: 1,
                radius: 6,
                damage: 20 * game.player.rangedPower,
                pierce: 2,
                hitPoisonDuration: 2.2,
                hitPoisonDps: 10,
                color: '#22c55e',
              })
            }
          } else if (game.selectedCharacter.id === 'dwarf') {
            const radius = 120
            game.player.wardUntil = game.time + 2.6
            game.effects.push({
              id: game.effectId++,
              x: game.player.x,
              y: game.player.y,
              radius,
              ttl: 0.45,
              color: 'rgba(245, 158, 11, 0.45)',
            })
            game.enemies.forEach((enemy) => {
              if (distance(enemy, game.player) <= radius + enemy.radius) {
                enemy.hp -= 45 * game.player.meleePower
                enemy.slowUntil = Math.max(enemy.slowUntil || 0, game.time + 1.1)
              }
            })
          } else if (game.selectedCharacter.id === 'orc') {
            game.player.hp = clamp(
              game.player.hp + effectiveMaxHp * 0.16,
              0,
              effectiveMaxHp,
            )
            game.player.berserkUntil = game.time + 5
            game.enemies.forEach((enemy) => {
              if (distance(enemy, game.player) <= 120 + enemy.radius) {
                enemy.slowUntil = Math.max(enemy.slowUntil || 0, game.time + 1.4)
              }
            })
            game.effects.push({
              id: game.effectId++,
              x: game.player.x,
              y: game.player.y,
              radius: 124,
              ttl: 0.3,
              color: 'rgba(239, 68, 68, 0.42)',
            })
          } else if (game.selectedCharacter.id === 'draconid') {
            const radius = 130
            game.player.wardUntil = game.time + 4.2
            game.effects.push({
              id: game.effectId++,
              x: game.player.x,
              y: game.player.y,
              radius,
              ttl: 0.4,
              color: 'rgba(6, 182, 212, 0.38)',
            })
            game.enemies.forEach((enemy) => {
              if (distance(enemy, game.player) <= radius + enemy.radius) {
                enemy.hp -= 34 * totalMagicPower
                enemy.slowUntil = Math.max(enemy.slowUntil || 0, game.time + 1.8)
              }
            })
          } else if (game.selectedCharacter.id === 'shade') {
            const directionX = moveX || (nearest ? nearest.x - game.player.x : 1)
            const directionY = moveY || (nearest ? nearest.y - game.player.y : 0)
            const length = Math.hypot(directionX, directionY) || 1

            game.player.x = clamp(
              game.player.x + (directionX / length) * 120,
              PLAYER_RADIUS,
              WORLD_WIDTH - PLAYER_RADIUS,
            )
            game.player.y = clamp(
              game.player.y + (directionY / length) * 120,
              PLAYER_RADIUS,
              WORLD_HEIGHT - PLAYER_RADIUS,
            )

            game.player.dodgeBoostUntil = game.time + 2.8
            const radius = 96
            game.effects.push({
              id: game.effectId++,
              x: game.player.x,
              y: game.player.y,
              radius,
              ttl: 0.28,
              color: 'rgba(139, 92, 246, 0.4)',
            })
            game.enemies.forEach((enemy) => {
              if (distance(enemy, game.player) <= radius + enemy.radius) {
                enemy.hp -= 28 * game.player.meleePower
                enemy.slowUntil = Math.max(enemy.slowUntil || 0, game.time + 0.9)
              }
            })
          } else {
            game.player.matrixUntil = game.time + 5
            game.cooldowns.matrixPulse = 0
            game.effects.push({
              id: game.effectId++,
              x: game.player.x,
              y: game.player.y,
              radius: 105,
              ttl: 0.32,
              color: 'rgba(14, 165, 233, 0.38)',
            })
          }

          game.player.abilityReady =
            game.time + game.player.abilityCooldown / totalAttackSpeed
        }

        const berserkActive = game.time < game.player.berserkUntil
        const berserkMultiplier = berserkActive ? 1.35 : 1

        Object.keys(game.cooldowns).forEach((cooldownId) => {
          game.cooldowns[cooldownId] -= dt
        })

        performCharacterNormalAttack(game, totalAttackSpeed, berserkMultiplier)

        if (game.time < game.player.matrixUntil && game.cooldowns.matrixPulse <= 0) {
          const radius = 118
          game.effects.push({
            id: game.effectId++,
            x: game.player.x,
            y: game.player.y,
            radius,
            ttl: 0.18,
            color: 'rgba(56, 189, 248, 0.34)',
          })
          game.enemies.forEach((enemy) => {
            if (distance(enemy, game.player) <= radius + enemy.radius) {
              enemy.hp -= 18 * totalMagicPower
              enemy.slowUntil = Math.max(enemy.slowUntil || 0, game.time + 0.6)
            }
          })
          game.cooldowns.matrixPulse = Math.max(0.25, 0.62 / totalAttackSpeed)
        }

        if (
          game.skills.arcaneBolt > 0 &&
          game.cooldowns.arcaneBolt <= 0 &&
          game.enemies.length
        ) {
          const target = getNearestEnemy(game.player, game.enemies)
          const level = game.skills.arcaneBolt
          if (target) {
            const angle = Math.atan2(target.y - game.player.y, target.x - game.player.x)
            game.projectiles.push({
              id: game.projectileId++,
              x: game.player.x,
              y: game.player.y,
              vx: Math.cos(angle) * 320,
              vy: Math.sin(angle) * 320,
              ttl: 1.2,
              radius: 7,
              damage: (13 + level * 8) * totalMagicPower * berserkMultiplier,
              pierce: level >= 5 ? 1 : 0,
              color: '#8b5cf6',
            })

            game.cooldowns.arcaneBolt = Math.max(0.28, 1.15 - level * 0.09) / totalAttackSpeed
          }
        }

        if (game.skills.whirlSlash > 0 && game.cooldowns.whirlSlash <= 0) {
          const level = game.skills.whirlSlash
          const radius = 62 + level * 10
          const damage = (18 + level * 9) * game.player.meleePower * berserkMultiplier

          game.effects.push({
            id: game.effectId++,
            x: game.player.x,
            y: game.player.y,
            radius,
            ttl: 0.25,
            color: 'rgba(239, 68, 68, 0.4)',
          })

          game.enemies.forEach((enemy) => {
            if (distance(enemy, game.player) <= radius + enemy.radius) {
              enemy.hp -= damage
            }
          })

          game.cooldowns.whirlSlash = Math.max(0.7, 2.1 - level * 0.18) / totalAttackSpeed
        }

        if (game.skills.frostNova > 0 && game.cooldowns.frostNova <= 0) {
          const level = game.skills.frostNova
          const radius = 110 + level * 12
          const damage = (14 + level * 6) * totalMagicPower * berserkMultiplier

          game.effects.push({
            id: game.effectId++,
            x: game.player.x,
            y: game.player.y,
            radius,
            ttl: 0.4,
            color: 'rgba(59, 130, 246, 0.35)',
          })

          game.enemies.forEach((enemy) => {
            if (distance(enemy, game.player) <= radius + enemy.radius) {
              enemy.hp -= damage
              enemy.slowUntil = game.time + (1.6 + level * 0.3)
            }
          })

          game.cooldowns.frostNova = Math.max(2.2, 6.2 - level * 0.45)
        }

        if (game.skills.fireball > 0 && game.cooldowns.fireball <= 0 && game.enemies.length) {
          const target = getNearestEnemy(game.player, game.enemies)
          const level = game.skills.fireball
          if (target) {
            const baseAngle = Math.atan2(
              target.y - game.player.y,
              target.x - game.player.x,
            )
            const amount = Math.min(7, 2 + level)
            for (let index = 0; index < amount; index += 1) {
              const spread = (index - (amount - 1) / 2) * 0.15
              const angle = baseAngle + spread
              game.projectiles.push({
                id: game.projectileId++,
                x: game.player.x,
                y: game.player.y,
                vx: Math.cos(angle) * 260,
                vy: Math.sin(angle) * 260,
                ttl: 1.2,
                radius: 8,
                damage: (10 + level * 6) * totalMagicPower * berserkMultiplier,
                pierce: 0,
                color: '#f97316',
              })
            }
          }
          game.cooldowns.fireball = Math.max(1.1, 3.8 - level * 0.25)
        }

        if (
          game.skills.chainLightning > 0 &&
          game.cooldowns.chainLightning <= 0 &&
          game.enemies.length
        ) {
          const level = game.skills.chainLightning
          const nearestTargets = [...game.enemies]
            .sort((a, b) => distance(a, game.player) - distance(b, game.player))
            .slice(0, Math.min(2 + level, 7))

          nearestTargets.forEach((enemy) => {
            enemy.hp -= (16 + level * 9) * totalMagicPower
            game.effects.push({
              id: game.effectId++,
              x: enemy.x,
              y: enemy.y,
              radius: 34,
              ttl: 0.2,
              color: 'rgba(56, 189, 248, 0.45)',
            })
          })

          game.cooldowns.chainLightning = Math.max(1.7, 4.5 - level * 0.3)
        }

        if (game.skills.poisonCloud > 0 && game.cooldowns.poisonCloud <= 0) {
          const level = game.skills.poisonCloud
          const radius = 95 + level * 9
          game.effects.push({
            id: game.effectId++,
            x: game.player.x,
            y: game.player.y,
            radius,
            ttl: 0.6,
            color: 'rgba(16, 185, 129, 0.38)',
          })

          game.enemies.forEach((enemy) => {
            if (distance(enemy, game.player) <= radius + enemy.radius) {
              enemy.poisonUntil = game.time + 2.2 + level * 0.2
              enemy.poisonDps = 8 + level * 2
            }
          })

          game.cooldowns.poisonCloud = Math.max(2.4, 6.1 - level * 0.35)
        }

        if (game.skills.thunderTotem > 0 && game.cooldowns.thunderTotem <= 0) {
          const level = game.skills.thunderTotem
          const radius = 120 + level * 11
          game.effects.push({
            id: game.effectId++,
            x: game.player.x,
            y: game.player.y,
            radius,
            ttl: 0.32,
            color: 'rgba(168, 85, 247, 0.36)',
          })

          game.enemies.forEach((enemy) => {
            if (distance(enemy, game.player) <= radius + enemy.radius) {
              enemy.hp -= (20 + level * 8) * totalMagicPower
            }
          })

          game.cooldowns.thunderTotem = Math.max(1.8, 5.2 - level * 0.35)
        }

        if (
          game.skills.celestialLance > 0 &&
          game.cooldowns.celestialLance <= 0 &&
          game.enemies.length
        ) {
          const target = getNearestEnemy(game.player, game.enemies)
          const level = game.skills.celestialLance
          if (target) {
            const angle = Math.atan2(target.y - game.player.y, target.x - game.player.x)
            game.projectiles.push({
              id: game.projectileId++,
              x: game.player.x,
              y: game.player.y,
              vx: Math.cos(angle) * 420,
              vy: Math.sin(angle) * 420,
              ttl: 0.95,
              radius: 9,
              damage: (34 + level * 10) * totalMagicPower,
              pierce: 4,
              color: '#eab308',
            })
          }
          game.cooldowns.celestialLance = Math.max(1.1, 3.3 - level * 0.2)
        }

        if (game.skills.godHand > 0 && game.cooldowns.godHand <= 0) {
          const level = game.skills.godHand
          const radius = 170 + level * 14
          game.effects.push({
            id: game.effectId++,
            x: game.player.x,
            y: game.player.y,
            radius,
            ttl: 0.42,
            color: 'rgba(250, 204, 21, 0.4)',
          })

          game.enemies.forEach((enemy) => {
            if (distance(enemy, game.player) <= radius + enemy.radius) {
              enemy.hp -= (60 + level * 16) * totalMagicPower
            }
          })

          game.cooldowns.godHand = Math.max(4.2, 10 - level * 0.4)
        }

        game.projectiles.forEach((projectile) => {
          projectile.x += projectile.vx * dt
          projectile.y += projectile.vy * dt
          projectile.ttl -= dt
        })

        game.effects.forEach((effect) => {
          effect.ttl -= dt
        })

        game.spawnEnemyAt -= dt
        if (game.spawnEnemyAt <= 0) {
          const spawn = spawnEnemyAroundPlayer(game.player)
          const scaling = 1 + game.time / 70
          game.enemies.push({
            id: game.enemyId++,
            x: spawn.x,
            y: spawn.y,
            radius: ENEMY_RADIUS,
            hp: 32 * scaling,
            maxHp: 32 * scaling,
            speed: randomRange(58, 95) + Math.min(65, game.time * 0.65),
            touchDamage: 11 * scaling,
            slowUntil: 0,
            poisonUntil: 0,
            poisonDps: 0,
            isBoss: false,
          })
          game.spawnEnemyAt = Math.max(0.32, 1.18 - game.time / 150)
        }

        game.spawnOrbAt -= dt
        if (game.spawnOrbAt <= 0) {
          const amount = 1 + Math.floor(Math.random() * 2)
          for (let index = 0; index < amount; index += 1) {
            game.orbs.push({
              id: game.orbId++,
              x: randomRange(24, WORLD_WIDTH - 24),
              y: randomRange(24, WORLD_HEIGHT - 24),
              value: randomRange(8, 13),
              type: 'exp',
            })
          }
          game.spawnOrbAt = randomRange(0.65, 1.55)
        }

        game.spawnCrateAt -= dt
        if (game.spawnCrateAt <= 0) {
          game.crates.push({
            id: game.crateId++,
            x: randomRange(40, WORLD_WIDTH - 40),
            y: randomRange(40, WORLD_HEIGHT - 40),
            radius: 14,
          })
          game.spawnCrateAt = randomRange(45, 90)
        }

        if (game.time >= game.nextBossAt) {
          const spawn = spawnEnemyAroundPlayer(game.player)
          const scaling = 1 + game.time / 80
          game.enemies.push({
            id: game.enemyId++,
            x: spawn.x,
            y: spawn.y,
            radius: 30,
            hp: 620 * scaling,
            maxHp: 620 * scaling,
            speed: 90 + Math.min(90, game.time * 0.2),
            touchDamage: 52 * scaling,
            slowUntil: 0,
            poisonUntil: 0,
            poisonDps: 0,
            isBoss: true,
          })
          game.nextBossAt = game.time + randomRange(180, 300)
        }

        game.enemies.forEach((enemy) => {
          const angle = Math.atan2(game.player.y - enemy.y, game.player.x - enemy.x)
          const slowMultiplier = game.time < enemy.slowUntil ? 0.55 : 1
          enemy.x += Math.cos(angle) * enemy.speed * slowMultiplier * dt
          enemy.y += Math.sin(angle) * enemy.speed * slowMultiplier * dt

          if (game.time < enemy.poisonUntil) {
            enemy.hp -= enemy.poisonDps * dt
          }

          const touchRange = enemy.radius + PLAYER_RADIUS
          if (distance(enemy, game.player) <= touchRange) {
            const incoming = enemy.touchDamage * dt
            if (Math.random() < dodgeChance) {
              return
            }
            const wardMultiplier = game.time < game.player.wardUntil ? 0.72 : 1
            const reduced = incoming * (100 / (100 + totalArmor)) * wardMultiplier
            game.player.hp -= reduced
            if (game.player.thorns > 0) {
              enemy.hp -= game.player.thorns * dt
            }
          }
        })

        game.projectiles.forEach((projectile) => {
          if (projectile.ttl <= 0) {
            return
          }

          game.enemies.forEach((enemy) => {
            if (enemy.hp <= 0) {
              return
            }
            if (distance(projectile, enemy) <= projectile.radius + enemy.radius) {
              const projectileCritChance = Math.min(
                0.92,
                game.player.critChance + (projectile.critBonus || 0),
              )
              const damage =
                Math.random() < projectileCritChance
                  ? projectile.damage * 1.5
                  : projectile.damage
              enemy.hp -= damage

              if (projectile.hitSlowDuration) {
                enemy.slowUntil = Math.max(
                  enemy.slowUntil || 0,
                  game.time + projectile.hitSlowDuration,
                )
              }

              if (projectile.hitPoisonDuration && projectile.hitPoisonDps) {
                enemy.poisonUntil = Math.max(
                  enemy.poisonUntil || 0,
                  game.time + projectile.hitPoisonDuration,
                )
                enemy.poisonDps = Math.max(enemy.poisonDps || 0, projectile.hitPoisonDps)
              }

              if (projectile.lifestealRatio) {
                game.player.hp = clamp(
                  game.player.hp + damage * projectile.lifestealRatio,
                  0,
                  effectiveMaxHp,
                )
              }

              projectile.pierce -= 1
              if (projectile.pierce < 0) {
                projectile.ttl = 0
              }
            }
          })
        })

        game.enemies = game.enemies.filter((enemy) => {
          if (enemy.hp > 0) {
            return true
          }

          game.kills += 1
          if (enemy.isBoss) {
            game.bossesKilled += 1
            game.points += 300
            for (let index = 0; index < 18; index += 1) {
              game.orbs.push({
                id: game.orbId++,
                x: enemy.x + randomRange(-26, 26),
                y: enemy.y + randomRange(-26, 26),
                value: randomRange(14, 22),
                type: 'exp',
              })
            }
          } else {
            game.points += 10
            if (Math.random() < 0.06) {
              game.orbs.push({
                id: game.orbId++,
                x: enemy.x + randomRange(-8, 8),
                y: enemy.y + randomRange(-8, 8),
                value: randomRange(7, 14),
                type: 'exp',
              })
            }
          }

          if (Math.random() < 0.05) {
            game.orbs.push({
              id: game.orbId++,
              x: enemy.x,
              y: enemy.y,
              value: effectiveMaxHp * 0.08,
              type: 'heal',
            })
          }

          return false
        })

        game.crates = game.crates.filter((crate) => {
          if (distance(crate, game.player) > crate.radius + PLAYER_RADIUS + 6) {
            return true
          }

          const eligibleLimited = crateLimitedSkillIds.filter((skillId) => {
            const skill = SKILLS[skillId]
            return canOfferSkill(game, skill)
          })

          if (eligibleLimited.length) {
            const ranked = eligibleLimited
              .map((skillId) => SKILLS[skillId])
              .sort((a, b) => rankPriority[a.rank] - rankPriority[b.rank])

            const guaranteed = ranked[0]
            const veryRare = ranked[ranked.length - 1]
            const pickedSkill =
              Math.random() < 0.12 && canOfferSkill(game, veryRare)
                ? veryRare
                : guaranteed

            game.skills[pickedSkill.id] += 1
            onSkillDiscovered(pickedSkill.id)
            game.effects.push({
              id: game.effectId++,
              x: crate.x,
              y: crate.y,
              radius: 62,
              ttl: 0.35,
              color: 'rgba(250, 204, 21, 0.35)',
            })
          } else {
            game.exp += 40
          }

          return false
        })

        game.projectiles = game.projectiles.filter(
          (projectile) =>
            projectile.ttl > 0 &&
            projectile.x > -20 &&
            projectile.x < WORLD_WIDTH + 20 &&
            projectile.y > -20 &&
            projectile.y < WORLD_HEIGHT + 20,
        )

        game.effects = game.effects.filter((effect) => effect.ttl > 0)

        game.orbs = game.orbs.filter((orb) => {
          const pickRange = orb.type === 'heal' ? 18 : 20
          if (distance(orb, game.player) > pickRange + PLAYER_RADIUS) {
            return true
          }

          if (orb.type === 'exp') {
            game.exp += orb.value * totalExpGain
          } else {
            game.player.hp = clamp(game.player.hp + orb.value, 0, effectiveMaxHp)
          }

          return false
        })

        if (game.player.lifesteal + extraLifesteal > 0) {
          const passiveHeal = 3.2 * (game.player.lifesteal + extraLifesteal) * dt
          game.player.hp = clamp(game.player.hp + passiveHeal, 0, effectiveMaxHp)
        }

        while (game.exp >= game.expNext) {
          game.exp -= game.expNext
          game.level += 1
          game.expNext = xpForLevel(game.level)
          game.pausedForLevel = true
          game.levelChoices = pickWeightedSkills(game)
          break
        }

        if (game.player.hp <= 0) {
          game.gameOver = true
        }
      }

      game.camera = createCamera(game.player)
      setGameView(createGameSnapshot(game))
      rafRef.current = requestAnimationFrame(update)
    }

    rafRef.current = requestAnimationFrame(update)

    return () => cancelAnimationFrame(rafRef.current)
  }, [onSkillDiscovered])

  const togglePause = () => {
    const game = gameRef.current
    if (game.gameOver || game.pausedForLevel) {
      return
    }
    game.paused = !game.paused
    setGameView(createGameSnapshot(game))
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  const handleJoystickMove = (pos) => {
    joystickRef.current.x = pos.x
    joystickRef.current.y = pos.y
  }

  const handleJoystickActionDown = () => {
    keysRef.current[' '] = true
  }

  const handleJoystickActionUp = () => {
    keysRef.current[' '] = false
  }

  const pickSkillUpgrade = (skillId) => {
    const game = gameRef.current
    if (!game.pausedForLevel) {
      return
    }

    game.skills[skillId] = Math.min(MAX_SKILL_LEVEL, game.skills[skillId] + 1)
    game.pausedForLevel = false
    game.levelChoices = []
    onSkillDiscovered(skillId)
    setGameView(createGameSnapshot(game))
  }

  const game = gameView

  const abilityCooldownLeft = Math.max(
    0,
    game.player.abilityReady - game.time,
  ).toFixed(1)

  const worldPosition = `${Math.round(game.player.x)} , ${Math.round(game.player.y)}`

  const surviveLabel = formatSurviveTime(game.time)
  const activeEffects = [
    game.time < game.player.berserkUntil ? 'Berserk' : null,
    game.time < game.player.wardUntil ? 'Dragon Ward' : null,
    game.time < game.player.matrixUntil ? 'Pulse Matrix' : null,
    game.time < game.player.dodgeBoostUntil ? 'Shadow Veil' : null,
  ].filter(Boolean)

  const activeEffectsLabel = activeEffects.length ? activeEffects.join(' · ') : 'None'

  const visibleEnemies = useMemo(
    () =>
      game.enemies.filter((enemy) => inViewport(enemy.x, enemy.y, enemy.radius, game.camera)),
    [game.camera, game.enemies],
  )
  const visibleProjectiles = useMemo(
    () =>
      game.projectiles.filter((projectile) =>
        inViewport(projectile.x, projectile.y, projectile.radius, game.camera),
      ),
    [game.camera, game.projectiles],
  )
  const visibleOrbs = useMemo(
    () => game.orbs.filter((orb) => inViewport(orb.x, orb.y, 8, game.camera)),
    [game.camera, game.orbs],
  )
  const visibleEffects = useMemo(
    () => game.effects.filter((effect) => inViewport(effect.x, effect.y, effect.radius, game.camera)),
    [game.camera, game.effects],
  )
  const visibleCrates = useMemo(
    () => game.crates.filter((crate) => inViewport(crate.x, crate.y, crate.radius, game.camera)),
    [game.camera, game.crates],
  )

  const nearestCrateInfo = useMemo(() => {
    if (!game.crates.length) {
      return null
    }

    const nearest = [...game.crates].sort(
      (a, b) => distance(a, game.player) - distance(b, game.player),
    )[0]

    const dx = nearest.x - game.player.x
    const dy = nearest.y - game.player.y
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI
    const dist = Math.round(Math.hypot(dx, dy))

    return {
      angleDeg,
      dist,
    }
  }, [game.crates, game.player])

  const ownedSkills = useMemo(
    () =>
      Object.values(SKILLS)
        .filter((skill) => game.skills[skill.id] > 0)
        .sort((a, b) => rankPriority[a.rank] - rankPriority[b.rank]),
    [game.skills],
  )

  const effectiveMaxHp = Math.round(game.player.baseMaxHp * (1 + game.skills.ironWill * 0.06))

  return (
    <section className="page run-page">
      <header className="run-head">
        <div>
          <span className="eyebrow">Live Session</span>
          <h2>Run Screen</h2>
        </div>
        <nav className="run-nav">
          <button className="ghost" onClick={toggleFullscreen}>
            Fullscreen
          </button>
          <button className="ghost" onClick={togglePause}>
            {game.paused ? 'Resume' : 'Pause'}
          </button>
          <button className="ghost" onClick={onBackHome}>
            End Run
          </button>
        </nav>
      </header>

      <div className="hud-stripe run-meta">
        <span>{game.selectedCharacter.name}</span>
        <span>Survive {surviveLabel}</span>
        <span>Level {game.level}</span>
        <span>Kills {game.kills}</span>
        <span>Boss {game.bossesKilled}</span>
        <span>Points {game.points}</span>
        <span>Normal {CHARACTER_NORMAL_ATTACK_LABEL[game.selectedCharacter.id]}</span>
        <span>Effects {activeEffectsLabel}</span>
        <span>
          {game.selectedCharacter.abilityName}:{' '}
          {abilityCooldownLeft === '0.0' ? 'Ready' : `${abilityCooldownLeft}s`}
        </span>
        <span>
          Pos {worldPosition} / {WORLD_WIDTH}x{WORLD_HEIGHT}
        </span>
      </div>

      <div className="bars-inline">
        <div className="meter hp">
          <label>
            HP {Math.ceil(game.player.hp)} / {effectiveMaxHp}
          </label>
          <div className="fill" style={{ width: `${(game.player.hp / effectiveMaxHp) * 100}%` }}></div>
        </div>
        <div className="meter exp">
          <label>
            EXP {Math.floor(game.exp)} / {game.expNext}
          </label>
          <div className="fill" style={{ width: `${(game.exp / game.expNext) * 100}%` }}></div>
        </div>
      </div>

      <div
        className="arena"
        style={{
          width: VIEW_WIDTH,
          height: VIEW_HEIGHT,
          backgroundPosition: `${-game.camera.x * 0.4}px ${-game.camera.y * 0.4}px`,
        }}
      >
        <div className="world-bounds-label top-left">0,0</div>
        <div className="world-bounds-label bottom-right">
          {WORLD_WIDTH},{WORLD_HEIGHT}
        </div>

        {nearestCrateInfo && (
          <div className="crate-pointer-wrap">
            <div
              className="crate-pointer"
              style={{ transform: `rotate(${nearestCrateInfo.angleDeg}deg)` }}
            >
              ➤
            </div>
            <span className="crate-distance">Crate {nearestCrateInfo.dist}m</span>
          </div>
        )}

        <div
          className="player"
          style={{
            left: game.player.x - game.camera.x - PLAYER_RADIUS,
            top: game.player.y - game.camera.y - PLAYER_RADIUS,
            backgroundColor: game.selectedCharacter.color,
          }}
        ></div>

        {visibleEnemies.map((enemy) => (
          <div
            key={enemy.id}
            className={`enemy ${enemy.isBoss ? 'boss' : ''}`}
            style={{
              left: enemy.x - game.camera.x - enemy.radius,
              top: enemy.y - game.camera.y - enemy.radius,
              width: enemy.radius * 2,
              height: enemy.radius * 2,
            }}
          >
            <div
              className="enemy-hp"
              style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
            ></div>
          </div>
        ))}

        {visibleProjectiles.map((projectile) => (
          <div
            key={projectile.id}
            className="projectile"
            style={{
              left: projectile.x - game.camera.x - projectile.radius,
              top: projectile.y - game.camera.y - projectile.radius,
              width: projectile.radius * 2,
              height: projectile.radius * 2,
              backgroundColor: projectile.color,
            }}
          ></div>
        ))}

        {visibleOrbs.map((orb) => (
          <div
            key={orb.id}
            className={`orb ${orb.type}`}
            style={{
              left: orb.x - game.camera.x - 6,
              top: orb.y - game.camera.y - 6,
            }}
          ></div>
        ))}

        {visibleCrates.map((crate) => (
          <div
            key={crate.id}
            className="crate"
            style={{
              left: crate.x - game.camera.x - crate.radius,
              top: crate.y - game.camera.y - crate.radius,
            }}
          ></div>
        ))}

        {visibleEffects.map((effect) => (
          <div
            key={effect.id}
            className="effect"
            style={{
              left: effect.x - game.camera.x - effect.radius,
              top: effect.y - game.camera.y - effect.radius,
              width: effect.radius * 2,
              height: effect.radius * 2,
              backgroundColor: effect.color,
            }}
          ></div>
        ))}

        {game.paused && !game.gameOver && (
          <div className="overlay">
            <h3>Paused</h3>
            <p>Session dihentikan sementara. Tekan ESC atau Resume untuk lanjut.</p>
            <div className="overlay-actions">
              <button onClick={togglePause}>Resume</button>
              <button className="ghost" onClick={onBackHome}>
                End Run
              </button>
            </div>
          </div>
        )}

        {game.pausedForLevel && (
          <div className="overlay">
            <h3>Level Up</h3>
            <p>Pilih 1 skill untuk upgrade.</p>
            <div className="upgrade-list">
              {game.levelChoices.map((skillId) => (
                <button key={skillId} onClick={() => pickSkillUpgrade(skillId)}>
                  <b>{SKILLS[skillId].name}</b>
                  <span>
                    {SKILLS[skillId].type} · {SKILLS[skillId].rank}
                  </span>
                  <small>
                    Lv {game.skills[skillId]} → Lv{' '}
                    {Math.min(MAX_SKILL_LEVEL, game.skills[skillId] + 1)}
                  </small>
                  <p>{SKILLS[skillId].desc}</p>
                  <small>Req: {RANK_REQUIREMENTS[SKILLS[skillId].rank]}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        {game.gameOver && (
          <div className="overlay">
            <h3>Game Over</h3>
            <p>
              Bertahan {surviveLabel} · Kill {game.kills} · Boss {game.bossesKilled} ·
              Points {game.points}
            </p>
            <button onClick={onBackHome}>Kembali ke Home</button>
          </div>
        )}

        {isMobile && !game.paused && !game.pausedForLevel && !game.gameOver && (
          <VirtualJoystick 
            onMove={handleJoystickMove} 
            onActionDown={handleJoystickActionDown} 
            onActionUp={handleJoystickActionUp} 
          />
        )}
      </div>

      <div className="owned-skill-strip">
        <strong>Owned Skills</strong>
        <ul>
          {ownedSkills.map((skill) => (
            <li key={skill.id}>
              {skill.name} [{skill.rank}] · Lv {game.skills[skill.id]} / {MAX_SKILL_LEVEL}
            </li>
          ))}
        </ul>
      </div>

      <div className="run-help">
        WASD / Arrow untuk bergerak · Space untuk ability karakter · ESC untuk pause.
        Boss spawn tiap 3–5 menit · Crate rare berisi skill limited.
      </div>
    </section>
  )
}

export default RunScreen
