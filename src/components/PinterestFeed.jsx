import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  ExternalLink,
  Heart,
  ImageOff,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SaveToBoard from './SaveToBoard';

const SKELETON_RATIOS = [0.78, 1.12, 0.9, 0.68, 1.25, 0.84, 1.05, 0.72, 0.94, 1.18, 0.8, 1];

function PinterestMark() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/95 py-1 pl-1 pr-2.5 text-[9px] font-bold text-ink shadow-sm backdrop-blur">
      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#E60023] font-serif text-[10px] font-bold italic leading-none text-white">
        P
      </span>
      Pinterest
    </span>
  );
}

function PinCard({ image, index }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ratio =
    image.width && image.height
      ? Math.min(1.45, Math.max(0.68, image.width / image.height))
      : 0.82;

  return (
    <article
      className="group relative mb-3 break-inside-avoid overflow-hidden rounded-[1.35rem] bg-blush sm:mb-4"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <div
        className="relative overflow-hidden bg-gradient-to-br from-blush via-[#E9C7C2] to-[#D9B0B2]"
        style={{ aspectRatio: ratio }}
      >
        {!failed && !loaded && (
          <span className="absolute inset-0 overflow-hidden bg-gradient-to-br from-blush via-[#E9C7C2] to-[#D9B0B2]">
            <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </span>
        )}
        {!failed ? (
          <img
            src={image.imageUrl}
            alt={image.title || 'Pinterest moodboard inspiration'}
            loading="lazy"
            className={`h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035] ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 px-5 text-center">
            <ImageOff className="h-6 w-6 text-plum/30" />
            <p className="text-[10px] font-medium text-plum/45">
              This pin didn&apos;t load
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-plum/30 to-transparent p-3">
          <PinterestMark />
          <span className="grid h-6 w-6 place-items-center rounded-full bg-paper/15 text-cream/60 backdrop-blur-sm">
            <Heart className="h-3 w-3" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum via-plum/50 to-transparent px-3.5 pb-3.5 pt-12 text-cream">
          <p className="line-clamp-2 text-[11px] font-medium leading-snug text-cream/90">
            {image.title || 'Pinterest inspiration'}
          </p>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            {image.sourceUrl ? (
              <a
                href={image.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[9px] font-medium text-cream/55 transition hover:text-cream"
              >
                <ExternalLink className="h-2.5 w-2.5" />
                {image.domain && !image.domain.includes('pinterest') ? image.domain : 'View pin'}
              </a>
            ) : (
              <span className="text-[9px] text-cream/35">Saved from Serper</span>
            )}
            <SaveToBoard
              pin={image}
              className="h-7 shrink-0 bg-paper/95 px-2.5 text-ink shadow-sm backdrop-blur transition hover:bg-white hover:text-rose"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function FeedSkeleton() {
  return (
    <div className="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3 xl:columns-4">
      {SKELETON_RATIOS.map((ratio, index) => (
        <div
          key={`${ratio}-${index}`}
          className="mb-3 break-inside-avoid overflow-hidden rounded-[1.35rem] border border-ink/[0.05] bg-paper sm:mb-4"
        >
          <div
            className="relative overflow-hidden bg-blush/65"
            style={{ aspectRatio: ratio }}
          >
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            <div className="absolute inset-x-3 bottom-3 space-y-2">
              <div className="h-2 w-3/4 rounded-full bg-paper/60" />
              <div className="h-2 w-1/2 rounded-full bg-paper/45" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PinterestFeed({
  celebrityName,
  images,
  loading,
  loadingMore,
  error,
  moreError,
  hasMore = true,
  onRetry,
  onLoadMore,
}) {
  const firstName = celebrityName?.split(' ')[0] || 'Your crush';
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || loading || loadingMore || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore?.();
      },
      { rootMargin: '360px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, onLoadMore, images.length]);

  return (
    <section id="moodboard" className="mx-auto mt-20 max-w-7xl scroll-mt-24 px-5 sm:px-8">
      <div className="mb-7 flex flex-col gap-4 border-t border-ink/[0.08] pt-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">
            <Sparkles className="h-3 w-3" />
            The visual edit
          </p>
          <h2 className="mt-3 font-display text-[2.6rem] leading-[1.02] tracking-[-0.04em] text-ink sm:text-5xl">
            {firstName}&apos;s world.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mauve">
            A live Pinterest moodboard to go with the read. Save the images that feel like
            the whole vibe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper/60 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-mauve">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E60023]" />
            Live via Serper
          </span>
          {!loading && images.length > 0 && (
            <span className="rounded-full bg-ink/[0.045] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-mauve/70">
              {images.length} pins
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div>
          <div className="mb-4 flex items-center gap-2 text-[10px] font-medium text-mauve/65">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-rose" />
            Pulling the visual lore from Pinterest…
          </div>
          <FeedSkeleton />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[1.8rem] border border-ink/[0.08] bg-paper/75 px-6 py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose/10 text-rose">
            <ImageOff className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-display text-2xl tracking-[-0.03em] text-ink">
            The moodboard slipped away.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-mauve">
            {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper px-4 py-2 text-[11px] font-semibold text-ink transition hover:border-rose/25 hover:text-rose"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try the image search again
          </button>
        </div>
      )}

      {!loading && !error && images.length === 0 && (
        <div className="rounded-[1.8rem] border border-ink/[0.08] bg-paper/75 px-6 py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-blush/60 text-rose">
            <Heart className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-display text-2xl tracking-[-0.03em] text-ink">
            No pins found — yet.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-mauve">
            Try a different spelling or a more familiar name for your celebrity crush.
          </p>
        </div>
      )}

      {!loading && !error && images.length > 0 && (
        <>
          <div className="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3 xl:columns-4">
            {images.map((image, index) => (
              <PinCard key={image.id || image.imageUrl} image={image} index={index} />
            ))}
          </div>

          <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-2xl border border-ink/[0.07] bg-paper/50 px-5 py-4 sm:flex-row sm:items-center">
            <p className="max-w-lg text-[10px] leading-relaxed text-mauve/65">
              Images are surfaced through Serper&apos;s image search and linked to their
              original Pinterest pages. Save the ones you love to a private board.
            </p>
            <Link
              to="/boards"
              className="group inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-ink transition hover:text-rose"
            >
              Open my boards
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div ref={loadMoreRef} className="mt-9 flex flex-col items-center gap-3 pb-2">
            {hasMore ? (
              <button
                type="button"
                onClick={() => onLoadMore?.()}
                disabled={loadingMore}
                className="group flex flex-col items-center gap-3 text-center disabled:cursor-wait"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full border border-ink/10 bg-paper text-ink shadow-soft transition duration-300 group-hover:-translate-y-0.5 group-hover:border-rose/30 group-hover:text-rose group-disabled:translate-y-0">
                  {loadingMore ? (
                    <Loader2 className="h-5 w-5 animate-spin text-rose" />
                  ) : (
                    <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
                  )}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-mauve/70 transition group-hover:text-rose">
                  {loadingMore ? 'Loading more pins…' : 'Show more pins'}
                </span>
              </button>
            ) : (
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mauve/55">
                You&apos;ve reached the end of the moodboard
              </p>
            )}

            {moreError && (
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="max-w-sm text-[10px] leading-relaxed text-rose/80">{moreError}</p>
                <button
                  type="button"
                  onClick={() => onLoadMore?.()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper px-3.5 py-1.5 text-[10px] font-semibold text-ink transition hover:border-rose/25 hover:text-rose"
                >
                  <RefreshCw className="h-3 w-3" />
                  Try again
                </button>
              </div>
            )}

            {hasMore && (
              <p className="text-[10px] text-mauve/45">
                Keep scrolling or tap the arrow to reveal more pins.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
