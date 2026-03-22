import { Link } from 'react-router-dom'
import { SKILL_RANKS } from '../data/skills'

function WikiSkillsPage({ libraryByRank, profile, onBack }) {
  const discoveredSkills = new Set(profile.discoveredSkills)

  return (
    <section className="page wiki-page">
      <header className="wiki-head">
        <div>
          <span className="eyebrow">Knowledge Base</span>
          <h2>Wikipedia · Skills</h2>
          <p>Skill rank dari Common hingga God, masing-masing 15 skill.</p>
        </div>
        <div className="run-nav">
          <button className="ghost" onClick={onBack}>
            Kembali
          </button>
        </div>
      </header>

      <div className="wiki-nav-links">
        <Link to="/wiki/skills" className="wiki-link active">
          Skills
        </Link>
        <Link to="/wiki/chars" className="wiki-link">
          Characters
        </Link>
      </div>

      {SKILL_RANKS.map((rank) => (
        <section key={rank} className="wiki-section">
          <div className="wiki-title-row">
            <h3>{rank} Rank</h3>
          </div>
          <div className="wiki-list">
            {libraryByRank[rank].map((skill) => {
              const known = discoveredSkills.has(skill.id)
              return (
                <div key={skill.id} className="wiki-row">
                  <div className="wiki-row-head">
                    <strong>{known ? skill.name : '???'}</strong>
                    <span>{known ? `${skill.type} · ${skill.rank}` : '?'}</span>
                  </div>
                  <p>{known ? skill.desc : 'Belum ditemukan pada run.'}</p>
                  <p className="small-note">Req: {skill.requirement}</p>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </section>
  )
}

export default WikiSkillsPage
