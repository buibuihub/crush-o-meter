import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  Heart,
  Instagram,
  Loader2,
  Sparkles,
  Star,
  TriangleAlert,
  WandSparkles,
} from 'lucide-react';
import { DEMO_CRUSH, DEMO_SELF } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import CelebritySearch from './CelebritySearch';
import ProfileFields from './ProfileFields';

const emptyProfile = () => ({
  name: '',
  mbti: '',
  traits: [],
  hobbies: '',
  communicationStyle: '',
});

function validateProfile(profile, prefix) {
  const errors = {};
  if (!profile.mbti) errors[`${prefix}.mbti`] = 'Pick an MBTI type.';
  if (!profile.traits?.length) errors[`${prefix}.traits`] = 'Add at least one trait.';
  if (!profile.hobbies?.trim()) errors[`${prefix}.hobbies`] = 'Share a few interests.';
  if (!profile.communicationStyle) {
    errors[`${prefix}.communicationStyle`] = 'Choose the closest style.';
  }
  return errors;
}

export default function AssessmentForm({ onAnalyze, loading, externalError, onDismissError }) {
  const { user } = useAuth();
  const [self, setSelf] = useState(emptyProfile);
  const [crush, setCrush] = useState(emptyProfile);
  const [isCelebrity, setIsCelebrity] = useState(true);
  const [celebrityName, setCelebrityName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const displayName =
      user?.displayName?.trim() || user?.email?.split('@')[0]?.trim();
    if (!displayName) return;
    setSelf((current) =>
      current.name ? current : { ...current, name: displayName.split(' ')[0] },
    );
  }, [user]);

  const updateSelf = (field, value) => {
    setSelf((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [`self.${field}`]: undefined }));
    setLocalError('');
  };

  const updateCrush = (field, value) => {
    setCrush((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [`crush.${field}`]: undefined }));
    setLocalError('');
  };

  const updateCelebrityName = (name) => {
    setCelebrityName(name);
    setFieldErrors((current) => ({ ...current, celebrityName: undefined }));
    setLocalError('');
    onDismissError?.();
  };

  const toggleCelebrity = () => {
    setIsCelebrity((current) => !current);
    setFieldErrors({});
    setLocalError('');
  };

  const fillSample = () => {
    setSelf({ ...DEMO_SELF, name: self.name || DEMO_SELF.name });
    setCrush(DEMO_CRUSH);
    if (isCelebrity) setCelebrityName('Zendaya');
    setFieldErrors({});
    setLocalError('');
    onDismissError?.();
  };

  const errorsFor = (prefix) => ({
    name: fieldErrors[`${prefix}.name`],
    mbti: fieldErrors[`${prefix}.mbti`],
    traits: fieldErrors[`${prefix}.traits`],
    hobbies: fieldErrors[`${prefix}.hobbies`],
    communicationStyle: fieldErrors[`${prefix}.communicationStyle`],
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    onDismissError?.();

    const nextErrors = {
      ...validateProfile(self, 'self'),
      ...(!isCelebrity ? validateProfile(crush, 'crush') : {}),
    };
    if (isCelebrity && !celebrityName.trim()) {
      nextErrors.celebrityName = 'Enter their full name.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setLocalError('A few details are missing. Fill the highlighted fields and try again.');
      document.getElementById('meter')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setFieldErrors({});
    setLocalError('');
    onAnalyze({
      self: { ...self, name: self.name.trim() || user?.name?.split(' ')[0] || 'You' },
      isCelebrity,
      celebrityName: isCelebrity ? celebrityName.trim() : undefined,
      crush: isCelebrity ? undefined : { ...crush, name: crush.name.trim() || 'Your crush' },
    });
  };

  return (
    <section id="meter" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">
              <Sparkles className="h-3 w-3" />
              The compatibility lab
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-[2.6rem] leading-[1.03] tracking-[-0.04em] text-ink sm:text-5xl">
              Let&apos;s read the room.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-mauve">
              No quizzes with obvious answers. Just the honest details about how you both
              move through the world.
            </p>
          </div>
          <button
            type="button"
            onClick={fillSample}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-ink/10 bg-paper/70 px-3.5 py-2 text-[11px] font-semibold text-mauve transition hover:border-rose/25 hover:bg-rose/5 hover:text-rose md:self-auto"
          >
            <WandSparkles className="h-3.5 w-3.5" />
            Fill with a sample
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2.1rem] border border-ink/[0.09] bg-paper p-2.5 shadow-soft sm:p-3.5"
          noValidate
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] bg-ink/[0.025] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 items-center gap-1.5 rounded-full bg-paper px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-rose shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-rose" />
                2 profiles
              </span>
              <div className="hidden items-center gap-1 sm:flex">
                <span className="text-[11px] text-mauve/65">Your energy</span>
                <span className="px-0.5 text-rose">
                  <Heart className="h-3 w-3" fill="currentColor" />
                </span>
                <span className="text-[11px] text-mauve/65">their energy</span>
              </div>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-mauve/60">
              Takes about 15 seconds
            </span>
          </div>

          <div className="mt-2.5 grid gap-2.5 lg:grid-cols-2">
            <div className="rounded-[1.55rem] border border-ink/[0.07] bg-[#FBF6EE] p-5 sm:p-6">
              <div className="mb-6 flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-plum text-cream">
                  <Heart className="h-[18px] w-[18px]" fill="currentColor" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose">
                    01 — You
                  </p>
                  <h3 className="mt-1 font-display text-[1.45rem] tracking-[-0.03em] text-ink">
                    Your inner weather
                  </h3>
                </div>
              </div>
              <ProfileFields
                profile={self}
                onChange={updateSelf}
                errors={errorsFor('self')}
                namePlaceholder="Your first name"
              />
            </div>

            <div className="rounded-[1.55rem] border border-ink/[0.07] bg-[#F8EDE9] p-5 sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose text-cream">
                    <Star className="h-[18px] w-[18px]" fill="currentColor" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose">
                      02 — The crush
                    </p>
                    <h3 className="mt-1 font-display text-[1.45rem] tracking-[-0.03em] text-ink">
                      Your current obsession
                    </h3>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleCelebrity}
                role="switch"
                aria-checked={isCelebrity}
                className="mb-5 flex w-full items-center justify-between gap-3 rounded-2xl border border-ink/[0.08] bg-white/55 px-4 py-3 text-left transition hover:bg-white/80"
              >
                <span className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-rose/10 text-rose">
                    <Instagram className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-ink">
                      Is this a celebrity crush?
                    </span>
                    <span className="mt-0.5 block text-[10px] text-mauve/75">
                      {isCelebrity ? 'AI builds their public persona' : 'Tell us their real traits'}
                    </span>
                  </span>
                </span>
                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
                    isCelebrity ? 'bg-rose' : 'bg-ink/15'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      isCelebrity ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
              </button>

              {isCelebrity ? (
                <div className="animate-fade-up">
                  <div className="block">
                    <label
                      htmlFor="celebrity-search"
                      className="mb-2 flex items-center justify-between text-xs font-semibold text-ink"
                    >
                      <span>Celebrity full name</span>
                      <span className="text-[10px] font-normal uppercase tracking-[0.08em] text-mauve/55">
                        required
                      </span>
                    </label>
                    <CelebritySearch
                      id="celebrity-search"
                      value={celebrityName}
                      onChange={updateCelebrityName}
                      maxLength={80}
                      placeholder="Start typing a name, e.g. Zendaya"
                      hasError={Boolean(fieldErrors.celebrityName)}
                    />
                    {fieldErrors.celebrityName && (
                      <p className="mt-1.5 text-[11px] font-medium text-rose">
                        {fieldErrors.celebrityName}
                      </p>
                    )}
                    <p className="mt-1.5 text-[10px] leading-relaxed text-mauve/60">
                      Live profiles, thumbnails, and spelling fixes as you type.
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl border border-rose/10 bg-paper/55 p-4">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-rose">
                      <Sparkles className="h-3 w-3" />
                      The public persona treatment
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-mauve">
                      We&apos;ll read their widely known public traits and estimated MBTI,
                      then pair the result with a live Pinterest moodboard. No private
                      details, no parasocial delusions.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {['Public traits', 'MBTI estimate', 'Pinterest edit'].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-ink/[0.07] bg-white/65 px-2.5 py-1 text-[9px] font-semibold text-mauve"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-rose/10 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-mauve">
                        Inside the report
                      </p>
                      <Sparkles className="h-3.5 w-3.5 text-gold" />
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                      {[
                        { icon: Heart, label: 'Persona read' },
                        { icon: Sparkles, label: 'Chemistry score' },
                        { icon: Bookmark, label: 'Pinterest edit' },
                      ].map(({ icon: Icon, label }) => (
                        <div
                          key={label}
                          className="rounded-xl border border-ink/[0.05] bg-paper/60 px-2.5 py-2.5"
                        >
                          <Icon className="h-3.5 w-3.5 text-rose/70" />
                          <p className="mt-2 text-[9px] font-semibold leading-tight text-mauve">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] leading-relaxed text-mauve/65">
                      One honest read, the friction included, and a visual moodboard to
                      make it make sense.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-up">
                  <ProfileFields
                    profile={crush}
                    onChange={updateCrush}
                    errors={errorsFor('crush')}
                    namePlaceholder="Their first name"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-2.5 flex flex-col gap-4 rounded-[1.5rem] border border-ink/[0.06] bg-paper px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div id="analysis-feedback" className="flex-1">
              {(localError || externalError) && (
                <p className="flex items-start gap-2 text-xs leading-relaxed text-rose">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {localError || externalError}
                </p>
              )}
              {!localError && !externalError && (
                <p className="text-[11px] leading-relaxed text-mauve/70">
                  Your answers stay between us. The reading is for entertainment, not a
                  verdict on anyone&apos;s feelings.
                </p>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-primary group shrink-0 px-6">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className="h-4 w-4" fill="currentColor" />
              )}
              {loading ? 'Reading the chemistry…' : 'Read our chemistry'}
              {!loading && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
