export default function GamesPage() {
  return (
    <div className="site-container">
      <div className="games-header">
        <div className="games-header-top">
          <span className="games-icon">🎮</span>
          <h1>Game Library</h1>
        </div>
        <p className="games-count">12 games available</p>
      </div>

      <div className="site-container games-layout">
        <aside className="filters">
          <div className="filter-card">
            {/* Filter-innehål läggs till senare */}
          </div>
        </aside>

        <section className="games-grid">
          {/* Game cards läggs till senare */}
        </section>
      </div>
    </div>
  );
}