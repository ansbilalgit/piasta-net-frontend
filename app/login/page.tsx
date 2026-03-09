"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./page.module.css";

type AuthMode = "login" | "signup";

const API_BASE_URL = "https://piasta-net-app.azurewebsites.net";

export default function LoginPage() {
  const router = useRouter();

  // Clean up any lingering toasts when component unmounts
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const [mode, setMode] = useState<AuthMode>("login");
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [isGdprModalOpen, setIsGdprModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  const validatePassword = (value: string): boolean => {
    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value.length > 0) {
      validatePassword(value);
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate password length
    if (!validatePassword(password)) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Validate username is not empty
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLoginMode
        ? `${API_BASE_URL}/api/Auth/login`
        : `${API_BASE_URL}/api/Auth/signup`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      // Check status and handle response
      if (response.ok) {
        const data = await response.json();

        if (isLoginMode) {
          // Login success - store token and redirect
          if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            // Dispatch storage event to trigger header update
            window.dispatchEvent(new Event("storage"));
            toast.success("Login successful!");
            // Wait a moment so user can see the message, then dismiss and navigate
            setTimeout(() => {
              toast.dismiss();
              router.push("/");
            }, 1000);
          } else {
            toast.error("Invalid response from server");
          }
        } else {
          // Signup success
          toast.success("Account created successfully! Please log in.");
          setMode("login");
          setPassword("");
          setGdprAccepted(false);
        }
      } else {
        // Handle error responses
        const errorText = await response.text();
        let errorMessage = "An error occurred";

        try {
          const errorData = JSON.parse(errorText);

          // Handle ASP.NET Identity error format: [{"code":"...","description":"..."}]
          if (Array.isArray(errorData) && errorData.length > 0) {
            const firstError = errorData[0];
            if (firstError.code && firstError.description) {
              // Map error codes to user-friendly messages
              const errorCodeMap: Record<string, string> = {
                DuplicateUserName: "This username is already taken. Please choose a different one.",
                DuplicateEmail: "This email is already registered.",
                PasswordTooShort: "Password is too short. It must be at least 6 characters.",
                PasswordRequiresNonAlphanumeric: "Password must contain at least one non-alphanumeric character.",
                PasswordRequiresDigit: "Password must contain at least one digit.",
                PasswordRequiresUpper: "Password must contain at least one uppercase letter.",
                PasswordRequiresLower: "Password must contain at least one lowercase letter.",
                InvalidUserName: "The username contains invalid characters.",
              };

              errorMessage = errorCodeMap[firstError.code] || firstError.description;
            } else {
              errorMessage = firstError.message || firstError.title || errorText;
            }
          } else if (typeof errorData === "object" && errorData !== null) {
            errorMessage = errorData.message || errorData.title || errorText;
          } else {
            errorMessage = errorText;
          }
        } catch {
          // Use text response as is (for non-JSON errors like "User created!")
          errorMessage = errorText || `Error: ${response.status} ${response.statusText}`;
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Network error. Please check your connection and try again.");
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
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
            onClick={() => {
              setMode("login");
              setPasswordError("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLoginMode}
            className={styles.toggleButton}
            data-active={!isLoginMode}
            onClick={() => {
              setMode("signup");
              setPasswordError("");
            }}
          >
            Sign Up
          </button>
        </div>

        <p className="kicker">{copy.kicker}</p>
        <h1 id="auth-title" className={styles.title}>
          {copy.title}
        </h1>
        <p className={styles.subtitle}>{copy.subtitle}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            Username:
            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Enter your username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
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
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              aria-invalid={passwordError ? "true" : "false"}
            />
            {passwordError && (
              <span className={styles.errorText} role="alert">
                {passwordError}
              </span>
            )}
          </label>

          {!isLoginMode ? (
            <label className={styles.gdprConsent}>
              <input
                type="checkbox"
                name="gdprAccepted"
                checked={gdprAccepted}
                onChange={(event) => setGdprAccepted(event.target.checked)}
                required
                disabled={isLoading}
              />
              <span>
                I accept the GDPR regulations.{" "}
                <button
                  type="button"
                  className={styles.moreInfoButton}
                  onClick={() => setIsGdprModalOpen(true)}
                  disabled={isLoading}
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
              disabled={isSignupButtonDisabled || isLoading}
            >
              {isLoading ? "Please wait..." : copy.buttonLabel}
            </button>
            <Link href="/" className={styles.secondaryLink}>
              Back To Home
            </Link>
          </div>
        </form>

        {isGdprModalOpen ? (
          <div
            className={styles.modalOverlay}
            onClick={() => setIsGdprModalOpen(false)}
          >
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
                The General Data Protection Regulation (GDPR) is an EU law that
                protects personal data. By signing up, you agree that we can
                process your account details to provide this service.
              </p>
              <p className={styles.modalText}>
                You have the right to request access, correction, deletion, and
                export of your data. You can also withdraw consent at any time
                by contacting support.
              </p>
              <p className={styles.modalText}>
                We only keep your data for as long as needed to run your
                account and comply with legal obligations.
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
