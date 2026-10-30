import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutGrid, LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';
import GoogleMark from './GoogleMark';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Header() {
  const { user, loading, logout, openAuth } = useAuth();
  const { notify } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Your account';
  const firstName = displayName.split(' ')[0];
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!userMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [userMenuOpen]);

  const goToSection = (hash) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(`/#${hash}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      setMobileOpen(false);
      if (location.pathname === '/boards') navigate('/');
    } catch {
      notify('Could not sign out. Please try again.', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          <button
            type="button"
            onClick={() => goToSection('meter')}
            className="text-sm font-medium text-mauve transition hover:text-ink"
          >
            The meter
          </button>
          <button
            type="button"
            onClick={() => goToSection('how-it-works')}
            className="text-sm font-medium text-mauve transition hover:text-ink"
          >
            How it works
          </button>
          <Link
            to="/boards"
            className={`flex items-center gap-1.5 text-sm font-medium transition hover:text-ink ${
              location.pathname === '/boards' ? 'text-ink' : 'text-mauve'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            My boards
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-full bg-ink/5" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full border border-ink/10 bg-paper/70 py-1 pl-1 pr-2.5 transition hover:border-ink/20 hover:bg-paper"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-plum text-[11px] font-bold text-cream">
                    {initial}
                  </span>
                )}
                <span className="hidden max-w-[110px] truncate text-xs font-semibold text-ink sm:block">
                  {firstName}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-mauve transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {userMenuOpen && (
                <div
                  className="animate-fade-up absolute right-0 top-[calc(100%+10px)] w-60 overflow-hidden rounded-2xl border border-ink/10 bg-paper p-1.5 shadow-lift"
                  role="menu"
                >
                  <div className="border-b border-ink/[0.06] px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-mauve">{user.email}</p>
                  </div>
                  <Link
                    to="/boards"
                    role="menuitem"
                    className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink transition hover:bg-ink/[0.04]"
                  >
                    <LayoutGrid className="h-4 w-4 text-mauve" />
                    My boards
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-rose transition hover:bg-rose/5"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuth}
              className="hidden items-center gap-1.5 rounded-full bg-plum px-4 py-2.5 text-xs font-semibold text-cream transition hover:bg-ink sm:inline-flex"
            >
              <GoogleMark className="h-3.5 w-3.5" />
              Sign in with Google
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-paper/60 text-ink md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade-up border-t border-ink/[0.06] bg-paper px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            <button
              type="button"
              onClick={() => goToSection('meter')}
              className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-ink/5"
            >
              The meter
            </button>
            <button
              type="button"
              onClick={() => goToSection('how-it-works')}
              className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-ink/5"
            >
              How it works
            </button>
            <Link
              to="/boards"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-ink/5"
            >
              My boards
            </Link>
            {!user && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openAuth();
                }}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-plum px-4 py-3 text-xs font-semibold text-cream"
              >
                <GoogleMark className="h-4 w-4" />
                Sign in with Google
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
