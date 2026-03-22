import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { CHARACTER_OPTIONS } from './data/characters'
import { RANK_SKILL_LIBRARY, SKILLS } from './data/skills'
import HomeScreen from './pages/HomeScreen'
import RunScreen from './pages/RunScreen'
import StartScreen from './pages/StartScreen'
import WikiCharsPage from './pages/WikiCharsPage'
import WikiSkillsPage from './pages/WikiSkillsPage'
import './App.css'

const PROFILE_STORAGE_KEY = 'iogemu-profile-v1'

const getInitialProfile = () => {
  const fallback = {
    discoveredSkills: [],
    playedCharacters: [],
  }

  const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY)
  if (!rawProfile) {
    return fallback
  }

  try {
    const parsed = JSON.parse(rawProfile)
    return {
      discoveredSkills: Array.isArray(parsed.discoveredSkills)
        ? parsed.discoveredSkills
        : [],
      playedCharacters: Array.isArray(parsed.playedCharacters)
        ? parsed.playedCharacters
        : [],
    }
  } catch {
    return fallback
  }
}

function App() {
  const navigate = useNavigate()
  const [wikiBackPath, setWikiBackPath] = useState('/home')
  const [selectedCharacterId, setSelectedCharacterId] = useState(
    CHARACTER_OPTIONS[0].id,
  )
  const [profile, setProfile] = useState(getInitialProfile)

  const selectedCharacter = useMemo(
    () =>
      CHARACTER_OPTIONS.find((character) => character.id === selectedCharacterId) ||
      CHARACTER_OPTIONS[0],
    [selectedCharacterId],
  )

  useEffect(() => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    const moveHandler = (event) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) {
        return
      }

      const button = target.closest('button')
      if (!(button instanceof HTMLElement)) {
        return
      }

      const rect = button.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      button.style.setProperty('--mx', `${x}px`)
      button.style.setProperty('--my', `${y}px`)
    }

    document.addEventListener('mousemove', moveHandler)

    return () => {
      document.removeEventListener('mousemove', moveHandler)
    }
  }, [])

  const addPlayedCharacter = useCallback((characterId) => {
    setProfile((current) => {
      if (current.playedCharacters.includes(characterId)) {
        return current
      }
      return {
        ...current,
        playedCharacters: [...current.playedCharacters, characterId],
      }
    })
  }, [])

  const addDiscoveredSkill = useCallback((skillId) => {
    setProfile((current) => {
      if (current.discoveredSkills.includes(skillId)) {
        return current
      }
      return {
        ...current,
        discoveredSkills: [...current.discoveredSkills, skillId],
      }
    })
  }, [])

  const openWiki = (fromPath) => {
    setWikiBackPath(fromPath)
    navigate('/wiki/skills')
  }

  const backFromWiki = () => {
    navigate(wikiBackPath)
  }

  return (
    <main className="app-shell">
      <Routes>
        <Route
          path="/"
          element={
            <StartScreen
              onStart={() => navigate('/home')}
              onWiki={() => openWiki('/')}
            />
          }
        />
        <Route
          path="/home"
          element={
            <HomeScreen
              characters={CHARACTER_OPTIONS}
              selectedCharacterId={selectedCharacterId}
              setSelectedCharacterId={setSelectedCharacterId}
              onStartRun={() => {
                addPlayedCharacter(selectedCharacter.id)
                addDiscoveredSkill('arcaneBolt')
                navigate('/run')
              }}
              onOpenWiki={() => openWiki('/home')}
              onBackStart={() => navigate('/')}
            />
          }
        />
        <Route
          path="/run"
          element={
            <RunScreen
              character={selectedCharacter}
              onBackHome={() => navigate('/home')}
              onSkillDiscovered={addDiscoveredSkill}
            />
          }
        />
        <Route
          path="/wiki"
          element={<Navigate to="/wiki/skills" replace />}
        />
        <Route
          path="/wiki/skills"
          element={
            <WikiSkillsPage
              libraryByRank={RANK_SKILL_LIBRARY}
              profile={profile}
              onBack={backFromWiki}
            />
          }
        />
        <Route
          path="/wiki/chars"
          element={
            <WikiCharsPage
              characters={CHARACTER_OPTIONS}
              skills={SKILLS}
              profile={profile}
              onBack={backFromWiki}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}

export default App
