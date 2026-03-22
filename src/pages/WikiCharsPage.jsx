import { Link } from 'react-router-dom'

function WikiCharsPage({ characters, profile, onBack }) {
  const playedCharacters = new Set(profile.playedCharacters)

  return (
    <section className="page wiki-page">
      <header className="wiki-head">
        <div>
          <span className="eyebrow">Knowledge Base</span>
          <h2>Wikipedia · Characters</h2>
          <p>Data ras, passive, skill unik, dan status eksplorasi karakter.</p>
        </div>
        <div className="run-nav">
          <button className="ghost" onClick={onBack}>
            Kembali
          </button>
        </div>
      </header>

      <div className="wiki-nav-links">
        <Link to="/wiki/skills" className="wiki-link">
          Skills
        </Link>
        <Link to="/wiki/chars" className="wiki-link active">
          Characters
        </Link>
      </div>

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
              <p>{character.passive}</p>
              <p className="small-note">
                HP {character.stats.maxHp}, SPD {character.stats.speed}, ARM {character.stats.armor},
                AS {character.stats.attackSpeed}, Crit {Math.round(character.stats.critChance * 100)}%
              </p>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

export default WikiCharsPage
