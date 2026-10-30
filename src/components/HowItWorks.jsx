import { Bookmark, Heart, Sparkles, UserRound } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: UserRound,
    title: 'Tell us the truth.',
    body: 'Your MBTI, the traits that actually feel like you, your hobbies, and the way you like to be spoken to. Then the same for your crush — or just a celebrity name.',
    accent: 'bg-sage/65 text-[#5a6b4d]',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Let AI read it.',
    body: 'OpenRouter’s free models compare the two profiles and return a specific chemistry read: the spark, the friction, and one truly useful next move.',
    accent: 'bg-blush text-rose',
  },
  {
    number: '03',
    icon: Bookmark,
    title: 'Keep the aesthetic.',
    body: 'Celebrity crush? We pull a live Pinterest moodboard. Save your favorite pins into private boards built for every era of your taste.',
    accent: 'bg-gold/15 text-[#9a6c26]',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto mt-24 max-w-7xl scroll-mt-24 px-5 sm:px-8"
    >
      <div className="max-w-2xl">
        <p className="eyebrow">
          <Heart className="h-3 w-3" />
          The whole ritual
        </p>
        <h2 className="mt-3 font-display text-[2.7rem] leading-[1.02] tracking-[-0.045em] text-ink sm:text-5xl">
          Less guessing.
          <em className="font-normal text-rose"> More knowing.</em>
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-mauve">
          Crush-O-Meter is part diary entry, part second opinion, part moodboard. Here is
          what happens when you press the button.
        </p>
      </div>

      <div className="mt-10 grid gap-3 md:grid-cols-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <article
              key={step.number}
              className="group relative overflow-hidden rounded-[1.75rem] border border-ink/[0.08] bg-paper/70 p-6 transition duration-500 hover:-translate-y-1 hover:border-ink/[0.14] hover:bg-paper hover:shadow-soft"
            >
              <span className="absolute right-5 top-5 font-display text-5xl italic text-ink/[0.045]">
                {step.number}
              </span>
              <span
                className={`grid h-11 w-11 place-items-center rounded-2xl transition-transform duration-500 group-hover:rotate-6 ${step.accent}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 font-display text-2xl tracking-[-0.03em] text-ink">
                {step.title}
              </h3>
              <p className="mt-2.5 text-xs leading-relaxed text-mauve">{step.body}</p>
            </article>
          );
        })}
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[1.85rem] bg-ink px-6 py-8 text-cream sm:px-9 sm:py-9">
        <div className="absolute -right-20 -top-32 h-64 w-64 rounded-full border border-cream/[0.07]" />
        <div className="absolute -right-6 -top-20 h-40 w-40 rounded-full border border-cream/[0.07]" />
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-coral">
              The only rule
            </p>
            <p className="mt-2 max-w-2xl font-display text-[1.75rem] leading-[1.25] tracking-[-0.03em] sm:text-[2.1rem]">
              An algorithm can read compatibility.
              <em className="font-normal text-cream/45"> It can&apos;t do the eye contact.</em>
            </p>
          </div>
          <a
            href="#meter"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-coral px-5 py-3 text-[11px] font-bold text-plum transition hover:bg-[#f58b83]"
          >
            Read my chemistry
            <Heart className="h-3.5 w-3.5" fill="currentColor" />
          </a>
        </div>
      </div>
    </section>
  );
}
