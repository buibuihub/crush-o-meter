import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  Heart,
  Sparkles,
  Star,
} from 'lucide-react';
import { api } from '../api';
import { useToast } from '../contexts/ToastContext';
import AssessmentForm from '../components/AssessmentForm';
import CompatibilityReport from '../components/CompatibilityReport';
import HowItWorks from '../components/HowItWorks';
import LoadingReport from '../components/LoadingReport';
import PinterestFeed from '../components/PinterestFeed';

function MiniMeter() {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - 0.87 * circumference;

  return (
    <div className="relative h-[124px] w-[124px]">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(252,248,242,0.1)" strokeWidth="7" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#hero-score)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="hero-score" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4B58B" />
            <stop offset="100%" stopColor="#F16D68" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[2.5rem] leading-none tracking-[-0.06em] text-cream">87</span>
        <span className="mt-1 text-[7px] font-bold uppercase tracking-[0.18em] text-cream/35">
          chemistry
        </span>
      </div>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[470px] px-2 pb-10 pt-8 sm:px-6 lg:px-0 lg:pb-4 lg:pt-0">
      <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blush/50 blur-3xl" />

      <div className="absolute -left-2 top-0 z-20 animate-float rounded-2xl border border-ink/[0.07] bg-paper px-3.5 py-2.5 shadow-soft sm:left-0">
        <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-rose">
          <Star className="h-3 w-3" fill="currentColor" />
          The slow-burn kind
        </p>
      </div>

      <div className="relative z-10 rotate-[1.7deg] rounded-[1.9rem] border border-cream/10 bg-plum p-5 text-cream shadow-lift transition-transform duration-500 hover:rotate-0 sm:p-6">
        <div className="flex items-center justify-between border-b border-cream/10 pb-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-cream/35">
              Chemistry report
            </p>
            <p className="mt-1 font-display text-lg tracking-[-0.025em]">Sample No. 024</p>
          </div>
          <span className="rounded-full border border-coral/20 bg-coral/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-coral">
            sample read
          </span>
        </div>

        <div className="flex items-center gap-5 py-5">
          <MiniMeter />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-display text-lg tracking-[-0.025em]">
              <span>You</span>
              <Heart className="h-3 w-3 text-coral" fill="currentColor" />
              <span className="truncate">Your person</span>
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-cream/45">
              The kind of chemistry that starts with a look and turns into a language.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {['easy banter', 'soft friction', 'real pull'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-cream/[0.07] px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.06em] text-cream/55"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 border-t border-cream/10 pt-4">
          {[
            ['Where it hums', '88%'],
            ['Where it snags', '34%'],
          ].map(([label, width]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-[82px] text-[8px] uppercase tracking-[0.08em] text-cream/35">
                {label}
              </span>
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-cream/[0.08]">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-coral to-blush"
                  style={{ width }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-1 right-0 z-20 w-[190px] rotate-[4deg] rounded-2xl border border-ink/[0.07] bg-paper p-2.5 shadow-lift sm:-right-2 sm:w-[220px]">
        <div className="grid grid-cols-3 gap-1.5">
          <span className="h-14 rounded-lg bg-gradient-to-br from-[#D9B3AC] to-[#8F6B73]" />
          <span className="h-14 rounded-lg bg-gradient-to-br from-[#D9D7BE] to-[#8B907E]" />
          <span className="h-14 rounded-lg bg-gradient-to-br from-[#D5A580] to-[#7B5C65]" />
        </div>
        <div className="mt-2 flex items-center justify-between px-0.5">
          <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-mauve">
            The visual edit
          </span>
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[#E60023] font-serif text-[9px] font-bold italic text-white">
            P
          </span>
        </div>
      </div>

      <div className="absolute -right-1 top-[40%] z-20 hidden sm:block">
        <span className="grid h-10 w-10 rotate-12 place-items-center rounded-2xl border border-rose/10 bg-paper text-rose shadow-soft">
          <Heart className="h-4 w-4" fill="currentColor" />
        </span>
      </div>
    </div>
  );
}

const IMAGE_BATCH_SIZE = 9;

export default function HomePage() {
  const { notify } = useToast();
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesLoadingMore, setImagesLoadingMore] = useState(false);
  const [imagesError, setImagesError] = useState('');
  const [imagesMoreError, setImagesMoreError] = useState('');
  const [imagesHasMore, setImagesHasMore] = useState(true);
  const [lastRequest, setLastRequest] = useState(null);
  const requestIdRef = useRef(0);
  const imagePageRef = useRef(0);
  const imageUrlsRef = useRef(new Set());
  const emptyBatchesRef = useRef(0);
  const loadingMoreRef = useRef(false);

  const runImageSearch = async (celebrityName, requestId) => {
    setImagesLoading(true);
    setImagesLoadingMore(false);
    setImagesError('');
    setImagesMoreError('');
    setImagesHasMore(true);
    imagePageRef.current = 0;
    imageUrlsRef.current = new Set();
    emptyBatchesRef.current = 0;
    try {
      const payload = await api.images({ celebrityName, page: 1 });
      if (requestId !== requestIdRef.current) return;
      const batch = Array.isArray(payload.images) ? payload.images : [];
      imageUrlsRef.current = new Set(batch.map((image) => image.imageUrl));
      imagePageRef.current = payload.page || 1;
      setImages(batch);
      setImagesHasMore(payload.hasMore ?? batch.length === IMAGE_BATCH_SIZE);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setImagesError(error.message || 'The Pinterest moodboard could not be loaded.');
    } finally {
      if (requestId === requestIdRef.current) setImagesLoading(false);
    }
  };

  const handleLoadMoreImages = async () => {
    if (imagesLoading || loadingMoreRef.current || !imagesHasMore) return;
    const celebrityName = lastRequest?.celebrityName;
    if (!celebrityName) return;

    const requestId = requestIdRef.current;
    loadingMoreRef.current = true;
    setImagesLoadingMore(true);
    setImagesMoreError('');

    const added = [];
    let nextPage = imagePageRef.current + 1;
    let hasMore = true;

    try {
      for (let attempt = 0; attempt < 2 && added.length < IMAGE_BATCH_SIZE; attempt += 1) {
        const payload = await api.images({ celebrityName, page: nextPage });
        if (requestId !== requestIdRef.current) return;

        const batch = Array.isArray(payload.images) ? payload.images : [];
        nextPage += 1;
        hasMore = payload.hasMore ?? batch.length === IMAGE_BATCH_SIZE;

        for (const image of batch) {
          if (!image?.imageUrl || imageUrlsRef.current.has(image.imageUrl)) continue;
          imageUrlsRef.current.add(image.imageUrl);
          added.push(image);
        }

        if (!hasMore || batch.length === 0) break;
        if (added.length > 0) break;
      }

      if (requestId !== requestIdRef.current) return;

      if (added.length === 0) {
        emptyBatchesRef.current += 1;
        if (!hasMore || emptyBatchesRef.current >= 2) hasMore = false;
      } else {
        emptyBatchesRef.current = 0;
      }

      imagePageRef.current = Math.max(imagePageRef.current, nextPage - 1);
      if (added.length > 0) {
        setImages((current) => [...current, ...added]);
      }
      setImagesHasMore(hasMore);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      if (added.length > 0) {
        imagePageRef.current = Math.max(imagePageRef.current, nextPage - 1);
        setImages((current) => [...current, ...added]);
      }
      setImagesMoreError(error.message || 'The next pins could not be loaded.');
    } finally {
      loadingMoreRef.current = false;
      if (requestId === requestIdRef.current) setImagesLoadingMore(false);
    }
  };

  const handleAnalyze = async (payload) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setAnalysisError('');
    setResult(null);
    setImages([]);
    setImagesError('');
    setImagesMoreError('');
    setImagesLoadingMore(false);
    setImagesHasMore(true);
    loadingMoreRef.current = false;
    setLastRequest(payload);
    setAnalyzing(true);

    if (payload.isCelebrity) {
      setImagesLoading(true);
      runImageSearch(payload.celebrityName, requestId);
    } else {
      setImagesLoading(false);
    }

    window.setTimeout(() => {
      document.getElementById('loading-report')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);

    try {
      const analysis = await api.analyze(payload);
      if (requestId !== requestIdRef.current) return;
      setResult(analysis);
      window.setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message = error.message || 'The chemistry read failed. Try again.';
      setAnalysisError(message);
      notify(message, 'error');
      window.setTimeout(() => {
        document
          .getElementById('analysis-feedback')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    } finally {
      if (requestId === requestIdRef.current) setAnalyzing(false);
    }
  };

  const handleRetryImages = () => {
    if (!lastRequest?.isCelebrity) return;
    runImageSearch(lastRequest.celebrityName, requestIdRef.current);
  };

  useEffect(() => {
    if (!window.location.hash) return undefined;
    const timer = window.setTimeout(() => {
      document
        .getElementById(window.location.hash.slice(1))
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-20 h-[420px] w-[420px] rounded-full border border-ink/[0.04]" />
        <div className="pointer-events-none absolute -right-4 top-36 h-[290px] w-[290px] rounded-full border border-ink/[0.04]" />
        <div className="pointer-events-none absolute left-[44%] top-5 h-24 w-24 rounded-full bg-blush/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:min-h-[660px] lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-6 lg:pb-20 lg:pt-12">
          <div className="max-w-[645px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/[0.08] bg-paper/60 py-1.5 pl-1.5 pr-3.5">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-rose/10 text-rose">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mauve">
                Personality chemistry, minus the guesswork
              </span>
            </div>

            <h1 className="mt-6 font-display text-[4.1rem] leading-[0.9] tracking-[-0.045em] text-ink sm:text-[5.8rem] lg:text-[6.3rem]">
              The crush,
              <br />
              <span className="relative inline-block italic text-rose">
                decoded.
                <svg
                  viewBox="0 0 320 18"
                  fill="none"
                  className="absolute -bottom-2 left-1 h-3 w-[98%] text-rose/30 sm:h-4"
                  aria-hidden="true"
                >
                  <path
                    d="M3 12C74 3 140 3 203 8c38 3 70 4 114 1"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-[15px] leading-[1.8] text-mauve">
              A thoughtful compatibility read between your personality and your current
              obsession — complete with a live Pinterest moodboard for the celebrity
              crushes. Yes, really.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('meter')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="btn-primary group h-12 px-6"
              >
                Read my chemistry
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('how-it-works')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="group inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-ink/10 px-5 text-xs font-semibold text-ink transition hover:border-ink/20 hover:bg-paper/70"
              >
                See how it works
                <ArrowRight className="h-3.5 w-3.5 text-mauve transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              {[
                ['AI personality reads', Sparkles],
                ['Endless Pinterest pins', Bookmark],
                ['Private personal boards', Heart],
              ].map(([label, Icon]) => (
                <span key={label} className="flex items-center gap-1.5 text-[10px] font-medium text-mauve/70">
                  <Icon className="h-3 w-3 text-rose/70" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <HeroPreview />
        </div>
      </section>

      <AssessmentForm
        onAnalyze={handleAnalyze}
        loading={analyzing}
        externalError={analysisError}
        onDismissError={() => setAnalysisError('')}
      />

      {analyzing && <LoadingReport />}

      {!analyzing && result && (
        <>
          <CompatibilityReport
            result={result}
            self={lastRequest?.self}
            onEdit={() =>
              document.getElementById('meter')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          />
          {result.isCelebrity && (
            <PinterestFeed
              celebrityName={lastRequest?.celebrityName}
              images={images}
              loading={imagesLoading}
              loadingMore={imagesLoadingMore}
              error={imagesError}
              moreError={imagesMoreError}
              hasMore={imagesHasMore}
              onRetry={handleRetryImages}
              onLoadMore={handleLoadMoreImages}
            />
          )}
        </>
      )}

      <HowItWorks />
    </>
  );
}
