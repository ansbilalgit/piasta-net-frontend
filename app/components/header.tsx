"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on mount and when storage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();

    // Listen for storage changes (in case login/logout happens in another tab)
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    // Dispatch custom event to notify other components in the same tab
    window.dispatchEvent(new Event("authChange"));
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <span className="header-icon">🎮</span>
          <span className="header-logo-text">GU Game Night</span>
        </div>

        <nav className="header-links">
          <a href="/" className={`nav-link ${pathname === "/" ? "is-active" : ""}`}>
            Home
          </a>
          <a
            href="/games"
            className={`nav-link ${pathname?.startsWith("/games") ? "is-active" : ""}`}
          >
            Game Library
          </a>
        </nav>
        <div className="header-right">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="login-btn">
              <span>👤</span>
              <span>Sign Out</span>
            </button>
          ) : (
            <a href="/login" className="login-btn">
              <span>👤</span>
              <span>Login</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
