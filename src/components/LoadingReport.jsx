import { useEffect, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { LOADING_LINES } from '../constants';

export default function LoadingReport() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % LOADING_LINES.length);
    }, 2700);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      id="loading-report"
      className="mx-auto mt-14 max-w-7xl scroll-mt-24 px-5 sm:px-8"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="overflow-hidden rounded-[2.2rem] border border-ink/[0.09] bg-paper shadow-soft">
        <div className="grid min-h-[390px] md:grid-cols-[0.78fr_1.22fr]">
          <div className="relative flex flex-col items-center justify-center overflow-hidden bg-plum px-8 py-12 text-center text-cream">
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cream/[0.08]" />
            <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cream/[0.1]" />
            <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose/25 blur-3xl" />

            <div className="relative">
              <div className="relative mx-auto grid h-28 w-28 place-items-center">
                <span className="absolute inset-0 animate-pulse-ring rounded-full border border-coral/40" />
                <span
                  className="absolute inset-2 animate-pulse-ring rounded-full border border-coral/25"
                  style={{ animationDelay: '0.5s' }}
                />
                <span className="grid h-20 w-20 animate-heartbeat place-items-center rounded-[1.6rem] bg-coral text-plum shadow-[0_16px_40px_-16px_rgba(241,109,104,0.8)]">
                  <Heart className="h-9 w-9" fill="currentColor" />
                </span>
              </div>
              <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40">
                Compatibility in progress
              </p>
              <p className="mt-3 font-display text-2xl leading-snug tracking-[-0.025em] text-cream">
                {LOADING_LINES[lineIndex]}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center px-6 py-10 sm:px-10">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose">
                Building your report
                {LOADING_LINES[lineIndex] ? '' : ''}
              </p>
            </div>
            <h2 className="mt-4 max-w-md font-display text-4xl leading-[1.04] tracking-[-0.04em] text-ink">
              Every spark has a
              <em className="font-normal text-rose"> story.</em>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-mauve">
              We&apos;re comparing the little things — how you communicate, what you need,
              and where the delicious friction lives.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ['The dynamic', 'w-[86%]'],
                ['The strengths', 'w-[94%]'],
                ['The friction', 'w-[72%]'],
                ['The next move', 'w-[88%]'],
              ].map(([label, width], index) => (
                <div
                  key={label}
                  className="rounded-2xl border border-ink/[0.07] bg-cream/55 p-3.5"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold text-mauve">{label}</span>
                    <Sparkles className="h-3 w-3 text-gold/70" />
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
                    <div className={`relative h-full ${width} overflow-hidden rounded-full bg-blush`}>
                      <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[10px] text-mauve/55">
              Free models can take a moment. Good chemistry is worth the wait.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
