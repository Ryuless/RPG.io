export const MAX_SKILL_LEVEL = 6

export const SKILL_RANKS = [
  'Common',
  'Uncommon',
  'Epic',
  'Legend',
  'Mytical',
  'Myth',
  'God',
]

export const RANK_REQUIREMENTS = {
  Common: 'Tersedia dari awal run.',
  Uncommon: 'Capai level 4 agar mulai sering muncul.',
  Epic: 'Capai level 8 dan bertahan minimal 2 menit.',
  Legend: 'Capai level 14 dan 90 kill.',
  Mytical: 'Capai level 20 serta survive 8 menit.',
  Myth: 'Capai level 26 dan kalahkan minimal 1 boss.',
  God: 'Capai level 35, kalahkan 3 boss, dan survive 15 menit.',
}

export const RANK_DROP_WEIGHT = {
  Common: 52,
  Uncommon: 26,
  Epic: 11,
  Legend: 6,
  Mytical: 3,
  Myth: 1.5,
  God: 0.5,
}

const CORE_SKILLS = {
  arcaneBolt: {
    id: 'arcaneBolt',
    name: 'Arcane Bolt',
    type: 'Magic',
    rank: 'Common',
    limited: false,
    desc: 'Peluru homing ke target terdekat. Level tinggi: cooldown lebih cepat dan bisa menembus 1 musuh.',
  },
  whirlSlash: {
    id: 'whirlSlash',
    name: 'Whirl Slash',
    type: 'Melee',
    rank: 'Common',
    limited: false,
    desc: 'Tebasan memutar di sekitar karakter. Naik level memperbesar radius dan burst damage.',
  },
  frostNova: {
    id: 'frostNova',
    name: 'Frost Nova',
    type: 'Magic',
    rank: 'Uncommon',
    limited: false,
    desc: 'Ledakan es melingkar yang memberi damage area dan efek slow beberapa detik.',
  },
  fireball: {
    id: 'fireball',
    name: 'Fireball Barrage',
    type: 'Magic',
    rank: 'Uncommon',
    limited: false,
    desc: 'Menembak beberapa fireball ke arah musuh. Level naik menambah jumlah bola api per cast.',
  },
  guardianAura: {
    id: 'guardianAura',
    name: 'Guardian Aura',
    type: 'Support',
    rank: 'Common',
    limited: false,
    desc: 'Aura pasif untuk bertahan hidup: menambah armor dan regenerasi HP tiap detik.',
  },
  chainLightning: {
    id: 'chainLightning',
    name: 'Chain Lightning',
    type: 'Magic',
    rank: 'Epic',
    limited: false,
    desc: 'Sambaran petir berantai ke beberapa musuh terdekat dengan burst damage tinggi.',
  },
  poisonCloud: {
    id: 'poisonCloud',
    name: 'Poison Cloud',
    type: 'Debuff',
    rank: 'Uncommon',
    limited: false,
    desc: 'Membuat kabut racun area yang memberi damage overtime pada musuh di sekitar.',
  },
  thunderTotem: {
    id: 'thunderTotem',
    name: 'Thunder Totem',
    type: 'Magic',
    rank: 'Legend',
    limited: false,
    desc: 'Pulse petir berkala yang menyambar musuh di sekitar player.',
  },
  shadowStep: {
    id: 'shadowStep',
    name: 'Shadow Step',
    type: 'Mobility',
    rank: 'Epic',
    limited: false,
    desc: 'Meningkatkan movement speed dan memberi peluang menghindari hit.',
  },
  vampiricEdge: {
    id: 'vampiricEdge',
    name: 'Vampiric Edge',
    type: 'Sustain',
    rank: 'Legend',
    limited: false,
    desc: 'Meningkatkan lifesteal dari semua sumber damage aktif.',
  },
  ironWill: {
    id: 'ironWill',
    name: 'Iron Will',
    type: 'Defense',
    rank: 'Uncommon',
    limited: false,
    desc: 'Meningkatkan max HP dan mengurangi tekanan dari burst musuh.',
  },
  runeMastery: {
    id: 'runeMastery',
    name: 'Rune Mastery',
    type: 'Support',
    rank: 'Epic',
    limited: false,
    desc: 'Meningkatkan attack speed dan magic scaling semua skill aktif.',
  },
  celestialLance: {
    id: 'celestialLance',
    name: 'Celestial Lance',
    type: 'Limited',
    rank: 'Myth',
    limited: true,
    desc: 'Tombak cahaya menembus banyak musuh dengan damage besar.',
  },
  godHand: {
    id: 'godHand',
    name: 'Hand of God',
    type: 'Limited',
    rank: 'God',
    limited: true,
    desc: 'Ledakan ilahi skala besar yang membersihkan area sekitar.',
  },
  bladeRush: {
    id: 'bladeRush',
    name: 'Blade Rush',
    type: 'Melee',
    rank: 'Common',
    limited: false,
    desc: 'Skill ofensif jarak dekat untuk meningkatkan burst melee dan menekan musuh di area sempit.',
  },
  emberVolley: {
    id: 'emberVolley',
    name: 'Ember Volley',
    type: 'Ranged',
    rank: 'Uncommon',
    limited: false,
    desc: 'Skill ofensif jarak jauh yang meningkatkan tekanan proyektil saat wave mulai padat.',
  },
  voidSpike: {
    id: 'voidSpike',
    name: 'Void Spike',
    type: 'Magic',
    rank: 'Epic',
    limited: false,
    desc: 'Skill ofensif magic dengan scaling kuat untuk damage tinggi di mid hingga late game.',
  },
  razorWind: {
    id: 'razorWind',
    name: 'Razor Wind',
    type: 'Control',
    rank: 'Legend',
    limited: false,
    desc: 'Menggabungkan offense dan control: menambah pressure sekaligus membantu menjaga jarak dari musuh.',
  },
  bloodHex: {
    id: 'bloodHex',
    name: 'Blood Hex',
    type: 'Debuff',
    rank: 'Epic',
    limited: false,
    desc: 'Debuff ofensif untuk memperkuat damage overtime dan mempercepat pembersihan wave.',
  },
  guardianPrayer: {
    id: 'guardianPrayer',
    name: 'Guardian Prayer',
    type: 'Support',
    rank: 'Common',
    limited: false,
    desc: 'Support yang menstabilkan sustain run melalui bonus pemulihan dan tempo bertahan.',
  },
  spiritLink: {
    id: 'spiritLink',
    name: 'Spirit Link',
    type: 'Support',
    rank: 'Uncommon',
    limited: false,
    desc: 'Skill support untuk memperkuat sinergi build campuran dan menjaga konsistensi performa.',
  },
  warDrum: {
    id: 'warDrum',
    name: 'War Drum',
    type: 'Utility',
    rank: 'Epic',
    limited: false,
    desc: 'Utility support yang membantu ritme farming dan mempercepat scaling keseluruhan.',
  },
  stoneSkin: {
    id: 'stoneSkin',
    name: 'Stone Skin',
    type: 'Defense',
    rank: 'Common',
    limited: false,
    desc: 'Skill defensif untuk menaikkan ketahanan dasar saat musuh mulai menumpuk.',
  },
  bastionCore: {
    id: 'bastionCore',
    name: 'Bastion Core',
    type: 'Defense',
    rank: 'Uncommon',
    limited: false,
    desc: 'Memperkuat durability saat menghadapi tekanan damage beruntun dari elite atau boss.',
  },
  aegisField: {
    id: 'aegisField',
    name: 'Aegis Field',
    type: 'Defense',
    rank: 'Legend',
    limited: false,
    desc: 'Defense tingkat tinggi untuk menahan burst besar dan menjaga momentum run.',
  },
  swiftStride: {
    id: 'swiftStride',
    name: 'Swift Stride',
    type: 'Mobility',
    rank: 'Common',
    limited: false,
    desc: 'Meningkatkan mobilitas agar reposition lebih cepat dan aman dari kepungan.',
  },
  phantomDrive: {
    id: 'phantomDrive',
    name: 'Phantom Drive',
    type: 'Mobility',
    rank: 'Epic',
    limited: false,
    desc: 'Mobilitas lanjutan untuk dodge agresif dan rotasi map yang lebih fleksibel.',
  },
  vitalityBloom: {
    id: 'vitalityBloom',
    name: 'Vitality Bloom',
    type: 'Sustain',
    rank: 'Uncommon',
    limited: false,
    desc: 'Sustain yang memperkuat regenerasi sehingga run panjang lebih stabil.',
  },
  soulFountain: {
    id: 'soulFountain',
    name: 'Soul Fountain',
    type: 'Sustain',
    rank: 'Legend',
    limited: false,
    desc: 'Sustain tingkat tinggi untuk menjaga HP tetap aman di pertarungan panjang.',
  },
  hunterInstinct: {
    id: 'hunterInstinct',
    name: 'Hunter Instinct',
    type: 'Ranged',
    rank: 'Common',
    limited: false,
    desc: 'Offensive ranged untuk memperkuat pressure tembakan sejak early game.',
  },
  chronoFocus: {
    id: 'chronoFocus',
    name: 'Chrono Focus',
    type: 'Utility',
    rank: 'Myth',
    limited: false,
    desc: 'Utility endgame yang meningkatkan kontrol tempo build dan konsistensi scaling.',
  },
  meteorSpear: {
    id: 'meteorSpear',
    name: 'Meteor Spear',
    type: 'Magic',
    rank: 'Common',
    limited: false,
    desc: 'Offensive magic untuk burst area kecil dan clear wave lebih cepat.',
  },
  ruptureShot: {
    id: 'ruptureShot',
    name: 'Rupture Shot',
    type: 'Ranged',
    rank: 'Common',
    limited: false,
    desc: 'Serangan jarak jauh beruntun untuk menambah tekanan DPS sejak early game.',
  },
  twinFang: {
    id: 'twinFang',
    name: 'Twin Fang',
    type: 'Melee',
    rank: 'Common',
    limited: false,
    desc: 'Melee ofensif dengan tempo cepat untuk duel melawan musuh dekat.',
  },
  toxicRain: {
    id: 'toxicRain',
    name: 'Toxic Rain',
    type: 'Debuff',
    rank: 'Uncommon',
    limited: false,
    desc: 'Debuff ofensif area untuk mempercepat eliminasi kelompok musuh.',
  },
  gravityRend: {
    id: 'gravityRend',
    name: 'Gravity Rend',
    type: 'Control',
    rank: 'Uncommon',
    limited: false,
    desc: 'Offense-control untuk memperlambat lawan sambil menjaga damage tetap tinggi.',
  },
  emberLance: {
    id: 'emberLance',
    name: 'Ember Lance',
    type: 'Magic',
    rank: 'Uncommon',
    limited: false,
    desc: 'Magic projectile yang fokus pada penetrasi dan burst target prioritas.',
  },
  bladeCyclone: {
    id: 'bladeCyclone',
    name: 'Blade Cyclone',
    type: 'Melee',
    rank: 'Epic',
    limited: false,
    desc: 'Tebasan ofensif berputar untuk menghancurkan musuh di sekitar player.',
  },
  spectralArrow: {
    id: 'spectralArrow',
    name: 'Spectral Arrow',
    type: 'Ranged',
    rank: 'Epic',
    limited: false,
    desc: 'Panah spektral dengan scaling kuat untuk menjaga output damage konsisten.',
  },
  plasmaOrbit: {
    id: 'plasmaOrbit',
    name: 'Plasma Orbit',
    type: 'Magic',
    rank: 'Epic',
    limited: false,
    desc: 'Orb ofensif yang memperkuat burst magic saat arena semakin padat.',
  },
  infernoDrive: {
    id: 'infernoDrive',
    name: 'Inferno Drive',
    type: 'Magic',
    rank: 'Legend',
    limited: false,
    desc: 'Magic offense late-game dengan damage tinggi untuk wave besar dan elite.',
  },
  stormBreaker: {
    id: 'stormBreaker',
    name: 'Storm Breaker',
    type: 'Melee',
    rank: 'Legend',
    limited: false,
    desc: 'Melee offense heavy-hit untuk menghancurkan musuh tanky dengan cepat.',
  },
  annihilationRay: {
    id: 'annihilationRay',
    name: 'Annihilation Ray',
    type: 'Ranged',
    rank: 'Myth',
    limited: false,
    desc: 'Serangan jarak jauh endgame dengan scaling damage sangat agresif.',
  },
  voidCollapse: {
    id: 'voidCollapse',
    name: 'Void Collapse',
    type: 'Control',
    rank: 'Myth',
    limited: false,
    desc: 'Control ofensif endgame untuk menahan posisi musuh sambil memberi burst besar.',
  },
  bloodSurge: {
    id: 'bloodSurge',
    name: 'Blood Surge',
    type: 'Debuff',
    rank: 'Legend',
    limited: false,
    desc: 'Debuff agresif untuk memperbesar tekanan DPS pada target ber-HP tebal.',
  },
  arcShield: {
    id: 'arcShield',
    name: 'Arc Shield',
    type: 'Defense',
    rank: 'Epic',
    limited: false,
    desc: 'Defensive cadangan untuk mengurangi beban damage masuk saat push berat.',
  },
  battleChant: {
    id: 'battleChant',
    name: 'Battle Chant',
    type: 'Support',
    rank: 'Legend',
    limited: false,
    desc: 'Support tempo yang memperkuat stabilitas build ketika run memanjang.',
  },
  quickHarvest: {
    id: 'quickHarvest',
    name: 'Quick Harvest',
    type: 'Utility',
    rank: 'Uncommon',
    limited: false,
    desc: 'Utility untuk mempercepat progres pengumpulan resource dan scaling run.',
  },
}

const TYPE_BLUEPRINTS = [
  {
    type: 'Magic',
    nouns: ['Prism', 'Comet', 'Vortex', 'Sigil', 'Rift'],
    effects: [
      'menambah burst magic dan penetrasi proyektil',
      'meningkatkan splash damage skill elemen',
      'mendorong scaling magic saat late game',
    ],
  },
  {
    type: 'Melee',
    nouns: ['Rend', 'Cleave', 'Ripper', 'Maul', 'Fury'],
    effects: [
      'meningkatkan damage jarak dekat dan tempo serangan',
      'memperkuat combo tebasan saat dikerubungi',
      'menambah tekanan DPS melee melawan elite',
    ],
  },
  {
    type: 'Ranged',
    nouns: ['Volley', 'Barrage', 'Tracer', 'Arrowstorm', 'Gale'],
    effects: [
      'meningkatkan kecepatan proyektil dan akurasi tembakan',
      'memperbesar output tembakan beruntun',
      'memperkuat poke damage dari jarak aman',
    ],
  },
  {
    type: 'Control',
    nouns: ['Snare', 'Gravity', 'Lock', 'Stasis', 'Bind'],
    effects: [
      'menambah durasi slow agar musuh mudah dikiting',
      'mempermudah kontrol area saat wave padat',
      'membuka ruang gerak dengan efek crowd-control',
    ],
  },
  {
    type: 'Debuff',
    nouns: ['Blight', 'Hex', 'Corrode', 'Venom', 'Curse'],
    effects: [
      'memperkuat damage overtime ke banyak target',
      'mengikis pertahanan musuh secara konsisten',
      'meningkatkan efektivitas efek racun dan kutukan',
    ],
  },
  {
    type: 'Mobility',
    nouns: ['Dash', 'Stride', 'Phantom', 'Sprint', 'Drift'],
    effects: [
      'meningkatkan mobilitas untuk reposition cepat',
      'memudahkan dodge saat boss burst',
      'menambah fleksibilitas rotasi di map besar',
    ],
  },
  {
    type: 'Defense',
    nouns: ['Bulwark', 'Bastion', 'Aegis', 'Citadel', 'Barrier'],
    effects: [
      'menambah armor efektif saat push wave',
      'mengurangi tekanan damage masuk dari swarm',
      'menguatkan durability saat duel boss',
    ],
  },
  {
    type: 'Sustain',
    nouns: ['Leech', 'Mend', 'Pulse', 'Vitality', 'Bloom'],
    effects: [
      'meningkatkan recovery HP agar tidak mudah tumbang',
      'memperpanjang daya tahan run panjang',
      'menjaga ritme regen saat tempo tinggi',
    ],
  },
  {
    type: 'Utility',
    nouns: ['Insight', 'Greed', 'Focus', 'Tempo', 'Catalyst'],
    effects: [
      'mempercepat progres leveling dan scaling build',
      'membantu efisiensi farming orb saat map ramai',
      'meningkatkan stabilitas performa antar wave',
    ],
  },
]

const fillerAdjectives = [
  'Astral',
  'Savage',
  'Swift',
  'Crimson',
  'Silent',
  'Runic',
  'Titan',
  'Venom',
  'Storm',
  'Eternal',
]

const groupedCoreByRank = SKILL_RANKS.reduce((map, rank) => {
  map[rank] = Object.values(CORE_SKILLS).filter((skill) => skill.rank === rank)
  return map
}, {})

const fillerSkills = {}

SKILL_RANKS.forEach((rank) => {
  const existingCount = groupedCoreByRank[rank].length
  const missingCount = Math.max(0, 15 - existingCount)

  for (let index = 0; index < missingCount; index += 1) {
    const fillerIndex = index + 1
    const id = `${rank.toLowerCase()}_filler_${fillerIndex}`
    const blueprint = TYPE_BLUEPRINTS[(index + rank.length) % TYPE_BLUEPRINTS.length]
    const adjective = fillerAdjectives[(index + rank.length) % fillerAdjectives.length]
    const noun = blueprint.nouns[(index + rank.length) % blueprint.nouns.length]
    const effect = blueprint.effects[(index + rank.length) % blueprint.effects.length]
    const type = blueprint.type

    fillerSkills[id] = {
      id,
      name: `${adjective} ${noun} ${rank}`,
      type,
      rank,
      limited: false,
      desc: `Skill rank ${rank} bertipe ${type.toLowerCase()} yang ${effect}.`,
    }
  }
})

const combinedSkills = {
  ...CORE_SKILLS,
  ...fillerSkills,
}

export const SKILLS = Object.fromEntries(
  Object.values(combinedSkills).map((skill) => {
    return [
      skill.id,
      {
        ...skill,
        requirement: RANK_REQUIREMENTS[skill.rank],
      },
    ]
  }),
)

export const SKILL_IDS = Object.keys(SKILLS)

export const RANK_SKILL_LIBRARY = SKILL_RANKS.reduce((library, rank) => {
  const ranked = Object.values(SKILLS)
    .filter((skill) => skill.rank === rank)
    .slice(0, 15)

  library[rank] = ranked
  return library
}, {})

export const SKILL_WIKI_LIBRARY = SKILL_RANKS.flatMap((rank) => RANK_SKILL_LIBRARY[rank])
