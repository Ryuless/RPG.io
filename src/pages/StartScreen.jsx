function StartScreen({ onStart, onWiki }) {
  return (
    <section className="page start-page">
      <div className="start-backdrop"></div>
      <div className="start-grid">
        <div className="start-main">
          <span className="eyebrow">Survival IO RPG</span>
          <h1>Chronicles of Orbfall</h1>
          <p>
            Bertahan hidup di arena luas, kumpulkan EXP, kuasai skill, dan bangun
            codex milikmu.
          </p>

          <div className="start-actions">
            <button onClick={onStart}>Masuk ke Home</button>
            <button className="ghost" onClick={onWiki}>
              Buka Wikipedia
            </button>
          </div>

          <div className="start-tip">
            Tip: Tekan <b>ESC</b> saat run untuk pause session.
          </div>
        </div>

        <aside className="start-rail">
          <h3>Session Flow</h3>
          <ul>
            <li>Pilih hero terbaik di Home.</li>
            <li>Masuk Run dan kumpulkan EXP.</li>
            <li>Upgrade skill saat level up.</li>
            <li>Buka Wikipedia untuk codex.</li>
          </ul>
        </aside>
      </div>
    </section>
  )
}

export default StartScreen
