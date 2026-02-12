export default function HomePage() {
  return (
    <div className="site-container">
      <section className="hero">
        <div className="kicker">Game Design &amp; Technology</div>
        <h1 className="hero-title">Game Night Hub</h1>
        <p className="hero-sub">Your gateway to epic gaming sessions at GU</p>
        <a href="/games" className="btn-cta">Browse Games →</a>
      </section>

      <section className="next-game">
        <h3>Next Game Night — Every Tuesday</h3>
        <div className="next-card">
          {/* Innehåll läggs till senare */}
        </div>
      </section>
    </div>
  );
}