function WikiPage({ characters, skills, profile, onBack }) {
  const discoveredSkills = new Set(profile.discoveredSkills)
  const playedCharacters = new Set(profile.playedCharacters)

  return (
    <section className="page wiki-page">
      <header className="wiki-head">
        <div>
          <span className="eyebrow">Knowledge Base</span>
          <h2>Wikipedia</h2>
          <p>Catatan skill dan karakter yang sudah kamu temui.</p>
        </div>
        <button className="ghost" onClick={onBack}>
          Kembali
        </button>
      </header>

      <div className="wiki-grid">
        <section className="wiki-section">
          <div className="wiki-title-row">
          <h3>Skill Codex</h3>
          </div>
          <div className="wiki-list">
            {Object.values(skills).map((skill) => {
              const known = discoveredSkills.has(skill.id)
              return (
                <div key={skill.id} className="wiki-row">
                  <div className="wiki-row-head">
                    <strong>{known ? skill.name : '???'}</strong>
                    <span>{known ? skill.type : '?'}</span>
                  </div>
                  <p>{known ? skill.desc : 'Belum pernah digunakan oleh player.'}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="wiki-section">
          <div className="wiki-title-row">
          <h3>Character Archive</h3>
          </div>
          <div className="wiki-list">
            {characters.map((character) => (
              <div key={character.id} className="wiki-row">
                <div className="wiki-row-head">
                  <strong>
                    {character.name} · {character.race}{' '}
                    {playedCharacters.has(character.id) ? '(Known)' : '(Unplayed)'}
                  </strong>
                  <span>{character.abilityName}</span>
                </div>
                <p>
                  {character.passive} HP {character.stats.maxHp}, SPD {character.stats.speed},
                  ARM {character.stats.armor}.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

export default WikiPage
