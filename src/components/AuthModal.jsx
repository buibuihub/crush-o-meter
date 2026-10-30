import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Loader2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import GoogleMark from './GoogleMark';

export default function AuthModal() {
  const { authOpen, closeAuth, signInWithGoogle } = useAuth();
  const { notify } = useToast();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authOpen) return;
    setError('');
    setSubmitting(false);
  }, [authOpen]);

  useEffect(() => {
    if (!authOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeAuth();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [authOpen, closeAuth]);

  if (!authOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setSubmitting(true);

    try {
      const user = await signInWithGoogle();
      const name = user.displayName || user.email?.split('@')[0] || 'there';
      notify(`Welcome, ${name.split(' ')[0]}.`, 'love');
      closeAuth();
    } catch (signInError) {
      setError(signInError.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[110] flex items-center justify-center bg-plum/55 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeAuth();
      }}
      role="presentation"
    >
      <div
        className="modal-card relative grid max-h-[calc(100vh-2rem)] w-full max-w-[900px] overflow-y-auto rounded-[2rem] bg-paper shadow-lift md:grid-cols-[0.92fr_1.08fr]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          type="button"
          onClick={closeAuth}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-mauve transition hover:bg-ink/10 hover:text-ink"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative hidden overflow-hidden bg-plum p-9 text-cream md:flex md:flex-col md:justify-between">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-cream/10" />
          <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border border-cream/10" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-rose/20 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/80">
              <Sparkles className="h-3 w-3 text-coral" />
              Your softest corner
            </span>
            <h2 className="mt-8 font-display text-[2.45rem] leading-[1.04] tracking-[-0.03em]">
              Keep the good
              <br />
              <em className="font-normal text-coral">ones close.</em>
            </h2>
            <p className="mt-5 max-w-[260px] text-sm leading-relaxed text-cream/65">
              Build moodboards for every version of your taste — crushes, aesthetics,
              eras, and all.
            </p>
          </div>

          <div className="relative mt-12 space-y-3">
            {[
              'Private boards, just for you',
              'Save pins in one tap',
              'Only your Google account can open them',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-xs text-cream/70">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-cream/10">
                  <Heart className="h-2.5 w-2.5 text-coral" fill="currentColor" />
                </span>
                {item}
              </div>
            ))}
          </div>

          <p className="relative mt-10 font-display text-sm italic text-cream/40">
            “A crush is just a mood with a pulse.”
          </p>
        </div>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12">
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose md:hidden">
            <Heart className="h-3 w-3" fill="currentColor" />
            Crush-O-Meter
          </p>
          <h2
            id="auth-title"
            className="font-display text-3xl tracking-[-0.03em] text-ink sm:text-[2.1rem]"
          >
            Your boards missed you.
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-mauve">
            Sign in with Google to keep every board, pin, and mood exactly where you left
            them.
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            autoFocus
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-white px-5 py-3.5 text-sm font-semibold text-ink shadow-sm transition hover:border-ink/25 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin text-mauve" />
            ) : (
              <GoogleMark className="h-5 w-5" />
            )}
            {submitting ? 'Opening Google…' : 'Continue with Google'}
          </button>

          {error && (
            <p className="mt-4 rounded-xl border border-rose/20 bg-rose/5 px-3.5 py-2.5 text-xs leading-relaxed text-rose">
              {error}
            </p>
          )}

          <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-mauve/80">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5d7050]" />
            Google handles your password. We only use your name, email, and photo to keep
            your boards yours.
          </p>

          <p className="mt-8 border-t border-ink/[0.07] pt-5 text-[11px] leading-relaxed text-mauve/65">
            No newsletters, no matchmaking spam. Just you and your boards.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
