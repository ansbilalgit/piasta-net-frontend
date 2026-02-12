import { Serializer } from "v8"

export function Header() {
  return (
    <header className="header">
        <div className="header-content">
            <div className="header-left">
                <span className="header-icon">🎮</span>
                <span className="header-logo-text">GU Game Night</span>
            </div>

        <nav className="header-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/GamesPage" className="nav-link">Game Library</a>
        </nav>
        <div className="header-right">
            <a href="/login" className="login-btn">
                <span>👤</span>
                <span>Login</span>
            </a>
        </div>
    </div>
</header>
  );
}