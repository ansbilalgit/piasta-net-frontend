"use client";

import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
        <div className="header-content">
            <div className="header-left">
                <span className="header-icon">🎮</span>
                <span className="header-logo-text">GU Game Night</span>
            </div>

        <nav className="header-links">
            <a href="/" className={`nav-link ${pathname === "/" ? "is-active" : ""}`}>Home</a>
            <a href="/games" className={`nav-link ${pathname?.startsWith("/games") ? "is-active" : ""}`}>Game Library</a>
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