import { useEffect, useId, useState } from 'react';
import {
  ArrowUpRight,
  BookOpenText,
  Compass,
  Heart,
  Lightbulb,
  PencilLine,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';

function getVerdict(score) {
  if (score >= 85) {
    return {
      title: 'Rare-air chemistry',
      note: 'The kind people write entire albums about.',
      short: 'exceptionally aligned',
    };
  }
  if (score >= 70) {
    return {
      title: 'Magnetic potential',
      note: 'There is a real pull here — and enough mystery to keep it alive.',
      short: 'strong chemistry',
    };
  }
  if (score >= 55) {
    return {
      title: 'A promising slow burn',
      note: 'Not a fireworks-on-the-first-night match. More of a lovely unravelling.',
      short: 'promising energy',
    };
  }
  if (score >= 40) {
    return {
      title: 'Sparks, with friction',
      note: 'Interesting, complicated, and very capable of surprising you.',
      short: 'mixed chemistry',
    };
  }
  return {
    title: 'A plot twist, not a match',
    note: 'A compelling chapter, even if it is not the whole story.',
    short: 'a different kind of energy',
  };
}

function AnimatedScore({ score }) {
  const [displayScore, setDisplayScore] = useState(0);
  const gradientId = useId().replace(/:/g, '');
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      setDisplayScore(score);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const duration = 1350;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div
      className="relative mx-auto h-[178px] w-[178px]"
      role="img"
      aria-label={`Compatibility score: ${score} out of 100`}
    >
      <svg viewBox="0 0 170 170" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4B58B" />
            <stop offset="55%" stopColor="#F16D68" />
            <stop offset="100%" stopColor="#D84A62" />
          </linearGradient>
        </defs>
        <circle
          cx="85"
          cy="85"
          r={radius}
          fill="none"
          stroke="rgba(252,248,242,0.11)"
          strokeWidth="9"
        />
        <circle
          cx="85"
          cy="85"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[3.35rem] font-medium leading-none tracking-[-0.06em] text-cream">
          {displayScore}
        </span>
        <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-cream/40">
          out of 100
        </span>
      </div>
      <span className="absolute right-[3px] top-[28px] grid h-8 w-8 place-items-center rounded-full border border-cream/10 bg-plum/80 text-coral">
        <Heart className="h-3.5 w-3.5" fill="currentColor" />
      </span>
    </div>
  );
}

function ListBlock({ title, items, type }) {
  const positive = type === 'strength';
  const Icon = positive ? Sparkles : TriangleAlert;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`grid h-7 w-7 place-items-center rounded-full ${
            positive ? 'bg-sage text-[#596b4b]' : 'bg-gold/15 text-[#a5742d]'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-ink">
          {title}
        </h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-xs leading-relaxed text-mauve">
            <span
              className={`mt-[7px] h-1 w-1 shrink-0 rounded-full ${
                positive ? 'bg-rose' : 'bg-gold'
              }`}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CompatibilityReport({ result, self, onEdit }) {
  const { compatibility, profile, isCelebrity } = result;
  const verdict = getVerdict(compatibility.compatibilityScore);
  const selfName = self?.name?.split(' ')[0] || 'You';
  const crushName = profile?.name?.split(' ')[0] || (isCelebrity ? 'Your crush' : 'Them');

  return (
    <section id="results" className="mx-auto mt-16 max-w-7xl scroll-mt-24 px-5 sm:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-rose" />
            Report ready
          </p>
          <h2 className="mt-3 font-display text-[2.6rem] leading-[1.02] tracking-[-0.04em] text-ink sm:text-5xl">
            The chemistry report.
          </h2>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-mauve transition hover:text-ink sm:self-auto"
        >
          <PencilLine className="h-3.5 w-3.5" />
          Revise the details
        </button>
      </div>

      <div className="animate-fade-up overflow-hidden rounded-[2.3rem] border border-ink/[0.09] bg-paper shadow-lift">
        <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative overflow-hidden bg-plum px-6 py-9 text-cream sm:px-9">
            <div className="absolute -right-24 -top-36 h-72 w-72 rounded-full border border-cream/[0.08]" />
            <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full border border-cream/[0.08]" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-rose/20 blur-3xl" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between gap-4 border-b border-cream/10 pb-5">
                <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-cream/40">
                  <Heart className="h-3 w-3 text-coral" fill="currentColor" />
                  Crush-O-Meter / Chemistry
                </span>
                <span className="text-[9px] uppercase tracking-[0.15em] text-cream/30">
                  {isCelebrity ? 'Public persona' : 'Real-life read'}
                </span>
              </div>

              <div className="mt-7 flex items-center gap-2.5 font-display text-[1.65rem] tracking-[-0.035em]">
                <span className="max-w-[120px] truncate">{selfName}</span>
                <span className="text-coral">
                  <Heart className="h-4 w-4" fill="currentColor" />
                </span>
                <span className="max-w-[130px] truncate">{crushName}</span>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-cream/35">
                A {verdict.short} reading
              </p>

              <div className="py-7">
                <AnimatedScore score={compatibility.compatibilityScore} />
              </div>

              <div className="text-center">
                <p className="font-display text-2xl tracking-[-0.025em] text-cream">
                  {verdict.title}
                </p>
                <p className="mx-auto mt-2 max-w-[270px] text-xs leading-relaxed text-cream/50">
                  {verdict.note}
                </p>
              </div>

              <div className="mt-7 border-t border-cream/10 pt-5">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((segment) => (
                    <span
                      key={segment}
                      className={`h-1 flex-1 rounded-full ${
                        compatibility.compatibilityScore >= segment * 20
                          ? segment >= 4
                            ? 'bg-coral'
                            : 'bg-blush/80'
                          : 'bg-cream/10'
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[8px] font-medium uppercase tracking-[0.12em] text-cream/30">
                  <span>Plot twist</span>
                  <span>Slow burn</span>
                  <span>Magnetic</span>
                </div>
              </div>

              <div className="mt-auto pt-10">
                <div className="flex items-start gap-3 border-t border-cream/10 pt-5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-cream/10 bg-cream/[0.04] text-coral">
                    <Heart className="h-3.5 w-3.5" fill="currentColor" />
                  </span>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-cream/30">
                      A note on scores
                    </p>
                    <p className="mt-1.5 max-w-[280px] font-display text-sm italic leading-relaxed text-cream/50">
                      The best connections are not scored. They are felt, then chosen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col px-6 py-9 sm:px-9 lg:px-10">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-rose">
                <BookOpenText className="h-3.5 w-3.5" />
                The read
              </p>
              <p className="mt-4 font-display text-[1.55rem] leading-[1.35] tracking-[-0.02em] text-ink sm:text-[1.7rem]">
                {compatibility.dynamicSummary}
              </p>
            </div>

            <div className="mt-8 grid gap-7 border-t border-ink/[0.07] pt-7 sm:grid-cols-2">
              <ListBlock title="Where it hums" items={compatibility.strengths} type="strength" />
              <ListBlock title="Where it snags" items={compatibility.challenges} type="friction" />
            </div>

            <div className="mt-auto pt-8">
              <div className="relative overflow-hidden rounded-2xl border border-rose/[0.12] bg-rose/[0.055] p-5">
                <div className="absolute -right-7 -top-8 h-24 w-24 rounded-full border border-rose/10" />
                <div className="relative flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose text-cream">
                    <Lightbulb className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-rose">
                      The next move
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink/80">
                      {compatibility.advice}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-ink/[0.07] bg-cream/35 px-6 py-7 sm:px-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-mauve">
                  {isCelebrity ? 'The public persona' : 'Their profile'}
                </h3>
                <span className="rounded-full bg-plum px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-cream">
                  {profile.mbti}
                </span>
              </div>
              {profile.summary && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mauve">
                  {profile.summary}
                </p>
              )}
              {!profile.summary && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mauve">
                  {profile.communicationStyle
                    ? `${crushName} communicates in a ${profile.communicationStyle.toLowerCase()} way. ${profile.hobbies ? `Their world includes ${profile.hobbies.toLowerCase()}.` : ''}`
                    : 'A real-life connection means the next chapter is yours to write.'}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {profile.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full border border-ink/10 bg-paper px-2.5 py-1 text-[10px] font-medium text-mauve"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-ink/[0.07] bg-paper/60 px-4 py-3">
              {profile.hobbies && (
                <>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-sage/60 text-[#5d7050]">
                    <Compass className="h-4 w-4" />
                  </span>
                  <p className="max-w-[210px] text-[10px] leading-snug text-mauve">
                    <span className="block font-semibold uppercase tracking-[0.08em] text-ink/70">
                      Into
                    </span>
                    {profile.hobbies}
                  </p>
                </>
              )}
              {!profile.hobbies && (
                <p className="max-w-[210px] text-[10px] leading-relaxed text-mauve/70">
                  An AI-authored read of widely known public persona. For the plot, not
                  as fact.
                </p>
              )}
            </div>
          </div>

          <p className="mt-5 border-t border-ink/[0.06] pt-4 text-[9px] leading-relaxed text-mauve/50">
            Personality compatibility is subjective and for entertainment. No score can
            decide a real relationship — or anyone else&apos;s feelings.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onEdit}
          className="group inline-flex items-center gap-2 text-xs font-semibold text-ink transition hover:text-rose"
        >
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          Try a different read
        </button>
        {isCelebrity && (
          <p className="flex items-center gap-1.5 text-[10px] text-mauve/60">
            <Heart className="h-3 w-3 text-rose" />
            Their moodboard is waiting below
          </p>
        )}
      </div>
    </section>
  );
}
