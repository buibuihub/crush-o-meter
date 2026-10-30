import { Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-cream/10 bg-plum text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_0.6fr_0.6fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/55">
            A more thoughtful compatibility read for the people who live rent-free in your
            head. Made with AI, Pinterest moodboards, and a healthy amount of overthinking.
          </p>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.13em] text-cream/35">
            <Sparkles className="h-3 w-3 text-coral" />
            OpenRouter + Serper powered
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/35">
            Explore
          </p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-cream/65">
            <a href="/#meter" className="transition hover:text-cream">The meter</a>
            <a href="/#how-it-works" className="transition hover:text-cream">How it works</a>
            <Link to="/boards" className="transition hover:text-cream">My boards</Link>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/35">
            The fine print
          </p>
          <p className="mt-4 text-xs leading-relaxed text-cream/45">
            Personality reads are for entertainment, not verdicts. Real chemistry requires
            real conversation.
          </p>
        </div>
      </div>

      <div className="border-t border-cream/[0.08]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-[11px] text-cream/30 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Crush-O-Meter. All hearts reserved.</p>
          <p className="flex items-center gap-1.5">
            Made for the butterflies <Heart className="h-3 w-3 text-coral" fill="currentColor" />
          </p>
        </div>
      </div>
    </footer>
  );
}
