import { Serializer } from "v8"

export function Header() {
  return (
    <header className="header">
        <div className="header-content">
            <div className="header-left">
                <span className="header-icon">🎮</span>
                <span>GU Game Night</span>
            </div>

        <nav className="header-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/games" className="nav-link">Game Library</a>
        </nav>
        
            <div className="header-right">
                <span className="header-credit">random text</span>
        </div>
    </div>
</header>
  );
}