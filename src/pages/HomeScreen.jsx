function HomeScreen({
  characters,
  selectedCharacterId,
  setSelectedCharacterId,
  onStartRun,
  onOpenWiki,
  onBackStart,
}) {
  const selectedCharacter =
    characters.find((character) => character.id === selectedCharacterId) ||
    characters[0]

  return (
    <section className="page home-page">
      <header className="home-head">
        <div className="home-title">
          <span className="eyebrow">Command Deck</span>
          <h2>Home Screen</h2>
          <p>Pilih hero, cek stat, lalu mulai run berikutnya.</p>
        </div>
        <div className="home-head-actions">
          <button className="ghost" onClick={onBackStart}>
            Start Page
          </button>
          <button className="ghost" onClick={onOpenWiki}>
            Wikipedia
          </button>
        </div>
      </header>

      <div className="home-layout">
        <aside className="character-list">
          {characters.map((character) => (
            <button
              key={character.id}
              className={`char-row ${
                selectedCharacterId === character.id ? 'active' : ''
              }`}
              onClick={() => setSelectedCharacterId(character.id)}
            >
              <span
                className="char-color"
                style={{ backgroundColor: character.color }}
              ></span>
              <span>{character.name}</span>
              <small>{character.race}</small>
            </button>
          ))}
        </aside>

        <section className="character-details">
          <div className="details-top">
            <h3>
              {selectedCharacter.name} · {selectedCharacter.race}
            </h3>
            <span
              className="char-mark"
              style={{ backgroundColor: selectedCharacter.color }}
            ></span>
          </div>

          <p className="muted">{selectedCharacter.passive}</p>

          <div className="ability-line">
            <label>Ability</label>
            <p>
              <b>{selectedCharacter.abilityName}</b> — {selectedCharacter.abilityDesc}
            </p>
          </div>

          <ul>
            <li>HP: {selectedCharacter.stats.maxHp}</li>
            <li>Speed: {selectedCharacter.stats.speed}</li>
            <li>Armor: {selectedCharacter.stats.armor}</li>
            <li>Attack Speed: {selectedCharacter.stats.attackSpeed}</li>
            <li>Crit Chance: {Math.round(selectedCharacter.stats.critChance * 100)}%</li>
          </ul>

          <div className="home-action-bar">
            <button className="accent" onClick={onStartRun}>
              Start Run
            </button>
          </div>
        </section>
      </div>
    </section>
  )
}

export default HomeScreen
