import React, { useEffect, useMemo, useState } from "react";

/**
 * Delivio Auth (No-Backend MVP)
 * - Dark/Light mode toggle
 * - Restaurant sign-up + login
 * - Persists accounts + session in browser (localStorage)
 *
 * Storage keys:
 * - delivio_accounts_v1: [{ id, role, email, password, businessName, createdAt }]
 * - delivio_session_v1: { accountId, email, role, businessName, remember, createdAt }
 *
 * NOTE: This is for class/demo only (passwords stored in plain text). Replace with real auth ASAP.
 */

const LS_ACCOUNTS = "delivio_accounts_v1";
const LS_SESSION = "delivio_session_v1";

function safeJsonParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function loadAccounts() {
  if (typeof window === "undefined") return [];
  return safeJsonParse(localStorage.getItem(LS_ACCOUNTS), []);
}

function saveAccounts(accounts) {
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
}

function loadSession() {
  if (typeof window === "undefined") return null;
  return safeJsonParse(localStorage.getItem(LS_SESSION), null);
}

function saveSession(session) {
  localStorage.setItem(LS_SESSION, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(LS_SESSION);
}

function makeId() {
  // Good enough for demo
  return `acc_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function DelivioLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="drop-shadow"
      >
        <path
          d="M32 60C46 48.7 54 39.9 54 28.5C54 16.6 44.6 7 32 7C19.4 7 10 16.6 10 28.5C10 39.9 18 48.7 32 60Z"
          className="fill-emerald-500 dark:fill-emerald-400"
        />
        <path
          d="M32 52C41 44.8 46 38.8 46 30.8C46 22.3 39.3 16 32 16C24.7 16 18 22.3 18 30.8C18 38.8 23 44.8 32 52Z"
          className="fill-black/10 dark:fill-black/25"
        />
        {/* Food tray */}
        <path
          d="M22 30.5C22 27.5 24.4 25 27.5 25H36.5C39.6 25 42 27.5 42 30.5V33H22V30.5Z"
          className="fill-yellow-400"
        />
        <path
          d="M18 33H46C47.1 33 48 33.9 48 35C48 36.1 47.1 37 46 37H18C16.9 37 16 36.1 16 35C16 33.9 16.9 33 18 33Z"
          className="fill-purple-600"
        />
        {/* Steam */}
        <path d="M26 20C24.5 18.4 25.2 16.7 26.6 15.3" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 20C30.5 18.4 31.2 16.7 32.6 15.3" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 20C36.5 18.4 37.2 16.7 38.6 15.3" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Wordmark */}
      <div className="leading-tight">
        <div className="text-2xl font-extrabold tracking-tight">
          <span className="text-purple-600 dark:text-purple-400">Deli</span>
          <span className="text-yellow-500">vio</span>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">Local pickup & delivery</div>
      </div>
    </div>
  );
}

function IconSun(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4.93 4.93 6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17.66 17.66l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4.93 19.07l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconMoon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M21 13.2A8.5 8.5 0 0 1 10.8 3a6.8 6.8 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Banner({ kind = "info", children }) {
  const styles =
    kind === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-100"
      : kind === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
      : "border-white/10 bg-white/5 text-white/80";

  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

export default function DelivioAuth() {
  const [mode, setMode] = useState("dark");
  const [view, setView] = useState("login"); // login | signup

  // login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  // signup (restaurant)
  const [businessName, setBusinessName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPassword2, setSignupPassword2] = useState("");

  // state
  const [accounts, setAccounts] = useState([]);
  const [session, setSession] = useState(null);
  const [message, setMessage] = useState(null); // {kind, text}

  const isDark = mode === "dark";

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  useEffect(() => {
    const a = loadAccounts();
    setAccounts(a);

    const s = loadSession();
    if (s && s.remember) {
      setSession(s);
    }
  }, []);

  useEffect(() => {
    // persist accounts
    if (typeof window === "undefined") return;
    saveAccounts(accounts);
  }, [accounts]);

  const containerBg = useMemo(
    () =>
      "bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900",
    []
  );

  const resetMessageSoon = () => {
    // clear message after a bit (small UX touch)
    window.clearTimeout(resetMessageSoon._t);
    resetMessageSoon._t = window.setTimeout(() => setMessage(null), 3500);
  };

  const doLogin = (e) => {
    e.preventDefault();
    setMessage(null);

    const normalized = email.trim().toLowerCase();
    const found = accounts.find((a) => a.email.toLowerCase() === normalized);
    if (!found) {
      setMessage({ kind: "error", text: "No account found with that email. Try signing up your restaurant." });
      resetMessageSoon();
      return;
    }

    if (found.password !== password) {
      setMessage({ kind: "error", text: "Wrong password. Please try again." });
      resetMessageSoon();
      return;
    }

    const newSession = {
      accountId: found.id,
      email: found.email,
      role: found.role,
      businessName: found.businessName,
      remember,
      createdAt: Date.now(),
    };

    if (remember) saveSession(newSession);
    else clearSession();

    setSession(newSession);
    setPassword("");
    setMessage({ kind: "success", text: `Welcome back${found.businessName ? ", " + found.businessName : ""}!` });
    resetMessageSoon();
  };

  const doSignUpRestaurant = (e) => {
    e.preventDefault();
    setMessage(null);

    const bn = businessName.trim();
    const se = signupEmail.trim().toLowerCase();

    if (bn.length < 2) {
      setMessage({ kind: "error", text: "Business name is too short." });
      resetMessageSoon();
      return;
    }

    if (!se.includes("@") || !se.includes(".")) {
      setMessage({ kind: "error", text: "Please enter a valid email." });
      resetMessageSoon();
      return;
    }

    if (signupPassword.length < 6) {
      setMessage({ kind: "error", text: "Password must be at least 6 characters." });
      resetMessageSoon();
      return;
    }

    if (signupPassword !== signupPassword2) {
      setMessage({ kind: "error", text: "Passwords do not match." });
      resetMessageSoon();
      return;
    }

    const exists = accounts.some((a) => a.email.toLowerCase() === se);
    if (exists) {
      setMessage({ kind: "error", text: "That email is already registered. Try logging in." });
      resetMessageSoon();
      return;
    }

    const newAcc = {
      id: makeId(),
      role: "restaurant",
      email: se,
      password: signupPassword,
      businessName: bn,
      createdAt: Date.now(),
    };

    const nextAccounts = [newAcc, ...accounts];
    setAccounts(nextAccounts);

    // Auto-login after signup
    const newSession = {
      accountId: newAcc.id,
      email: newAcc.email,
      role: newAcc.role,
      businessName: newAcc.businessName,
      remember: true,
      createdAt: Date.now(),
    };
    saveSession(newSession);
    setSession(newSession);

    setBusinessName("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupPassword2("");

    setMessage({ kind: "success", text: "Restaurant account created! You're now logged in." });
    resetMessageSoon();
  };

  const logout = () => {
    clearSession();
    setSession(null);
    setEmail("");
    setPassword("");
    setView("login");
    setMessage({ kind: "info", text: "Logged out." });
    resetMessageSoon();
  };

  const clearDemoData = () => {
    localStorage.removeItem(LS_ACCOUNTS);
    clearSession();
    setAccounts([]);
    setSession(null);
    setMessage({ kind: "info", text: "Demo data cleared." });
    resetMessageSoon();
  };

  // If logged in, show a simple dashboard placeholder
  if (session) {
    return (
      <div className={`min-h-screen ${containerBg} dark:bg-black`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <DelivioLogo />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode(isDark ? "light" : "dark")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 active:scale-[0.99]"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <>
                  <IconSun className="h-4 w-4" /> Light
                </>
              ) : (
                <>
                  <IconMoon className="h-4 w-4" /> Dark
                </>
              )}
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white hover:bg-white/10 active:scale-[0.99]"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-white/60">Logged in as</div>
                  <div className="text-2xl font-extrabold text-white">
                    {session.businessName || "Restaurant Account"}
                  </div>
                  <div className="mt-1 text-sm text-white/70">{session.email}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs text-white/70">
                  Role: <span className="font-extrabold text-yellow-400">{session.role}</span>
                </div>
              </div>

              {message ? (
                <div className="mt-4">
                  <Banner kind={message.kind}>{message.text}</Banner>
                </div>
              ) : null}

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-sm font-extrabold text-white">Orders</div>
                  <div className="mt-1 text-sm text-white/70">Connect your real order system later.</div>
                  <div className="mt-3 text-xs text-white/50">(Placeholder)</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-sm font-extrabold text-white">Menu</div>
                  <div className="mt-1 text-sm text-white/70">Add menu management in Sprint 2.</div>
                  <div className="mt-3 text-xs text-white/50">(Placeholder)</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="text-lg font-extrabold text-white">Demo Tools</div>
              <div className="mt-2 text-sm text-white/70">
                Since you’re storing accounts in the browser, you can clear them for testing.
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={clearDemoData}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-extrabold text-white hover:bg-white/10 active:scale-[0.99]"
                >
                  Clear saved accounts
                </button>
                <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-white/60">
                  Accounts stored: <span className="font-extrabold text-white">{accounts.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-white/40">
            © {new Date().getFullYear()} Delivio • Demo auth (localStorage)
          </div>
        </div>
      </div>
    );
  }

  // Auth screen
  return (
    <div className={`min-h-screen ${containerBg} dark:bg-black`}>
      {/* Top bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <DelivioLogo />

        <button
          type="button"
          onClick={() => setMode(isDark ? "light" : "dark")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 active:scale-[0.99]"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <>
              <IconSun className="h-4 w-4" /> Light
            </>
          ) : (
            <>
              <IconMoon className="h-4 w-4" /> Dark
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-12 pt-4 md:grid-cols-2 md:items-center">
        {/* Left: value */}
        <div className="text-white">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Deliver local. <span className="text-yellow-400">Keep more profit.</span>
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            Delivio helps small businesses offer pickup and delivery without the huge platform fees.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">Pickup</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">Delivery</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">Restaurant tools</span>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold text-white/90">Restaurant owners</div>
            <div className="mt-1 text-sm text-white/70">Create your business page, upload your menu, and start taking orders.</div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setView("signup");
                  setMessage(null);
                }}
                className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-extrabold text-black hover:brightness-95 active:scale-[0.99]"
              >
                Sign up your restaurant
              </button>
              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setMessage(null);
                }}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-extrabold text-white hover:bg-white/10 active:scale-[0.99]"
              >
                Log in
              </button>
            </div>

            <div className="mt-4 text-xs text-white/50">
              For demo: accounts are stored in your browser only.
            </div>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="md:justify-self-end">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-extrabold text-white">
                  {view === "login" ? "Welcome back" : "Create restaurant account"}
                </div>
                <div className="text-sm text-white/70">
                  {view === "login"
                    ? "Log in to manage orders and deliveries."
                    : "Sign up your business to start taking pickup & delivery orders."}
                </div>
              </div>
              <div className="hidden sm:block">
                <DelivioLogo className="scale-[0.85]" />
              </div>
            </div>

            {/* Messages */}
            {message ? (
              <div className="mt-5">
                <Banner kind={message.kind}>{message.text}</Banner>
              </div>
            ) : null}

            {/* Tabs */}
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setMessage(null);
                }}
                className={`rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                  view === "login"
                    ? "bg-white text-black"
                    : "bg-transparent text-white/80 hover:bg-white/10"
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => {
                  setView("signup");
                  setMessage(null);
                }}
                className={`rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                  view === "signup"
                    ? "bg-white text-black"
                    : "bg-transparent text-white/80 hover:bg-white/10"
                }`}
              >
                Restaurant sign up
              </button>
            </div>

            {view === "login" ? (
              <form onSubmit={doLogin} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-white/80">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-white/80">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-black/30"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-sm font-semibold text-purple-300 hover:text-purple-200"
                    onClick={() => setMessage({ kind: "info", text: "Demo only: reset is not implemented yet." })}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-extrabold text-white hover:brightness-95 active:scale-[0.99]"
                >
                  Log in
                </button>

                <div className="pt-2 text-center text-sm text-white/60">
                  New business?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setView("signup");
                      setMessage(null);
                    }}
                    className="font-extrabold text-yellow-400 hover:text-yellow-300"
                  >
                    Create a restaurant account
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={doSignUpRestaurant} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-white/80">Business name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Tasty Kitchen"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-white/80">Business email</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="owner@tastykitchen.com"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-white/80">Create password</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-white/80">Confirm password</label>
                  <input
                    type="password"
                    value={signupPassword2}
                    onChange={(e) => setSignupPassword2(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-extrabold text-black hover:brightness-95 active:scale-[0.99]"
                >
                  Create restaurant account
                </button>

                <div className="pt-2 text-center text-sm text-white/60">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setMessage(null);
                    }}
                    className="font-extrabold text-purple-300 hover:text-purple-200"
                  >
                    Log in
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-4 text-xs text-white/50">
            Tip: The toggle switches Tailwind <code className="rounded bg-white/10 px-1 py-0.5">dark</code> on the <code className="rounded bg-white/10 px-1 py-0.5">html</code> tag.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto max-w-6xl px-4 pb-8 text-xs text-white/40">
        © {new Date().getFullYear()} Delivio • Demo auth stored in browser
      </div>
    </div>
  );
}
