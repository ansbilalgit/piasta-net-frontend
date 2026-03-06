"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [isGdprModalOpen, setIsGdprModalOpen] = useState(false);
  const isLoginMode = mode === "login";
  const isSignupButtonDisabled = !isLoginMode && !gdprAccepted;

  const copy = isLoginMode
    ? {
        kicker: "Welcome Back",
        title: "Sign In to Piasta net",
        subtitle:
          "Log in to join events, track your game nights, and connect with other players.",
        buttonLabel: "Sign In",
        passwordAutocomplete: "current-password",
      }
    : {
        kicker: "Create Your Account",
        title: "Sign Up for Piasta net",
        subtitle:
          "Create an account to join upcoming events and meet new players in your area.",
        buttonLabel: "Sign Up",
        passwordAutocomplete: "new-password",
      };

  return (
    <div className={`site-container ${styles.loginPage}`}>
      <section className={styles.card} aria-labelledby="auth-title">
        <div className={styles.modeToggle} role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={isLoginMode}
            className={styles.toggleButton}
            data-active={isLoginMode}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLoginMode}
            className={styles.toggleButton}
            data-active={!isLoginMode}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <p className="kicker">{copy.kicker}</p>
        <h1 id="auth-title" className={styles.title}>
          {copy.title}
        </h1>
        <p className={styles.subtitle}>{copy.subtitle}</p>

        <form className={styles.form} action="#" method="post">
          <label className={styles.field}>
            Email:
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className={styles.field}>
            Password:
            <input
              type="password"
              name="password"
              autoComplete={copy.passwordAutocomplete}
              placeholder="Enter your password"
              required
            />
          </label>

          {!isLoginMode ? (
            <label className={styles.gdprConsent}>
              <input
                type="checkbox"
                name="gdprAccepted"
                checked={gdprAccepted}
                onChange={(event) => setGdprAccepted(event.target.checked)}
                required
              />
              <span>
                I accept the GDPR regulations.
                {" "}
                <button
                  type="button"
                  className={styles.moreInfoButton}
                  onClick={() => setIsGdprModalOpen(true)}
                >
                  More information
                </button>
              </span>
            </label>
          ) : null}

          <div className={styles.actions}>
            <button
              type="submit"
              className={`btn-cta ${styles.submitButton}`}
              disabled={isSignupButtonDisabled}
            >
              {copy.buttonLabel}
            </button>
            <Link href="/" className={styles.secondaryLink}>
              Back To Home
            </Link>
          </div>
        </form>

        {isGdprModalOpen ? (
          <div className={styles.modalOverlay} onClick={() => setIsGdprModalOpen(false)}>
            <div
              className={styles.modalCard}
              role="dialog"
              aria-modal="true"
              aria-labelledby="gdpr-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="gdpr-modal-title" className={styles.modalTitle}>
                GDPR Information
              </h2>
              <p className={styles.modalText}>
                The General Data Protection Regulation (GDPR) is an EU law that protects
                personal data. By signing up, you agree that we can process your account
                details to provide this service.
              </p>
              <p className={styles.modalText}>
                You have the right to request access, correction, deletion, and export of
                your data. You can also withdraw consent at any time by contacting support.
              </p>
              <p className={styles.modalText}>
                We only keep your data for as long as needed to run your account and comply
                with legal obligations.
              </p>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCloseButton}
                  onClick={() => setIsGdprModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}