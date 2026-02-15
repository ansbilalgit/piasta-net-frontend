import Playground from "../playground/page";

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

      <Playground />
    </div>
  );
}