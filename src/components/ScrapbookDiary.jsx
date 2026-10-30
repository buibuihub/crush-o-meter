import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';

const TAPE_STYLES = ['', 'washi-tape-rose', 'washi-tape-gold', 'washi-tape-sage'];
const TILT_ANGLES = [-3, 2, -2, 3, -1, 4];
const PINS_PER_SPREAD = 3;
const PAGE_TEXTURES = ['bg-notebook-lines', 'bg-notebook-grid', 'bg-notebook-dots'];

function createSpreads(pins) {
  if (!pins || pins.length === 0) return [];
  const spreads = [];
  for (let i = 0; i < pins.length; i += PINS_PER_SPREAD) {
    spreads.push(pins.slice(i, i + PINS_PER_SPREAD));
  }
  return spreads;
}

function formatDate(pin) {
  const ts = pin.savedAt?.seconds
    ? pin.savedAt.seconds * 1000
    : pin.savedAt
    ? new Date(pin.savedAt).getTime()
    : null;
  if (!ts || Number.isNaN(ts)) return null;
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function Polaroid({ pin, index, animDelay = 0 }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const tilt = TILT_ANGLES[index % TILT_ANGLES.length];
  const tape = TAPE_STYLES[index % TAPE_STYLES.length];
  const date = formatDate(pin);

  return (
    <div
      className="group relative cursor-pointer animate-polaroid-drop"
      style={{
        '--tw-rotate': `${tilt}deg`,
        transform: `rotate(${tilt}deg)`,
        animationDelay: `${animDelay}ms`,
      }}
    >
      <div className="polaroid-frame rounded-md p-2.5 sm:p-3 relative">
        <div
          className={`washi-tape ${tape} -top-2.5 left-1/2 -translate-x-1/2 animate-tape-stick`}
          style={{
            '--tw-rotate': `${(index % 2 === 0 ? 1 : -1) * (1 + (index % 3))}deg`,
            animationDelay: `${animDelay + 150}ms`,
          }}
        />

        {index % 4 === 2 && (
          <div className="paper-clip -right-2 top-4 rotate-6" />
        )}

        <div className="relative aspect-[4/3] overflow-hidden rounded bg-blush/30">
          {!imgError && !imgLoaded && (
            <span className="absolute inset-0 overflow-hidden bg-blush/40">
              <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </span>
          )}
          {!imgError ? (
            <img
              src={pin.imageUrl}
              alt={pin.title || 'Scrapbook memory'}
              className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-mauve/30">
              <Heart className="h-6 w-6" />
            </div>
          )}
          <div className="absolute inset-0 bg-plum/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="rounded-full bg-paper/90 px-3 py-1.5 text-[10px] font-bold text-ink shadow-sm backdrop-blur">
              View Memory
            </span>
          </div>
        </div>

        <div className="mt-2.5 text-center px-1">
          <p className="font-hand text-lg sm:text-xl font-bold leading-snug text-ink line-clamp-2">
            {pin.title || 'Special moment'}
          </p>
          {date && (
            <p className="mt-0.5 font-hand text-sm text-mauve/70">{date}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex h-full items-center justify-center animate-skeleton-page">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-rose/40" />
        <p className="font-hand text-lg text-mauve/50">
          Pasting in your memories...
        </p>
      </div>
    </div>
  );
}

function SpreadPage({
  spreadPins,
  spreadIndex,
  pageLabel,
  texture,
  boardName,
  isLeft,
  onPinClick,
}) {
  if (!spreadPins || spreadPins.length === 0) {
    return (
      <div className={`relative flex h-full flex-col justify-between p-5 sm:p-7 ${texture} ${isLeft ? 'page-edge-left' : 'page-edge-right'}`}>
        <div className={`absolute top-3 ${isLeft ? 'left-4' : 'right-4'} font-hand text-sm text-mauve/40`}>
          {pageLabel}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="py-10 text-center">
            {isLeft ? (
              <Heart className="mx-auto h-8 w-8 text-rose/25" />
            ) : (
              <Sparkles className="mx-auto h-8 w-8 text-gold/30" />
            )}
            <p className="mt-3 font-hand text-xl text-mauve/60">
              {isLeft
                ? 'This page is waiting for your next crush vibe...'
                : 'End of this chapter'}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-ink/8 pt-3">
          <span className="font-hand text-base text-rose/70 flex items-center gap-1">
            <Heart className="h-3 w-3 fill-rose/20" /> {boardName}
          </span>
          <span className="font-hand text-sm text-mauve/50">crush-o-meter</span>
        </div>
      </div>
    );
  }

  const gridCols =
    spreadPins.length === 1
      ? 'grid-cols-1 max-w-[240px] mx-auto'
      : spreadPins.length === 2
      ? 'grid-cols-2'
      : 'grid-cols-2 sm:grid-cols-3';

  return (
    <div className={`relative flex h-full flex-col justify-between p-5 sm:p-7 ${texture} ${isLeft ? 'page-edge-left' : 'page-edge-right'}`}>
      <div className={`absolute top-3 ${isLeft ? 'left-4' : 'right-4'} font-hand text-sm text-mauve/40`}>
        {pageLabel}
      </div>

      <div className="flex flex-1 items-center pt-4">
        <div className={`grid ${gridCols} gap-4 sm:gap-5 w-full`}>
          {spreadPins.map((pin, i) => (
            <div key={pin.id || i} onClick={() => onPinClick?.(pin)}>
              <Polaroid
                pin={pin}
                index={spreadIndex * PINS_PER_SPREAD + i}
                animDelay={i * 120}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink/8 pt-3">
        <span className="font-hand text-base text-rose/70 flex items-center gap-1">
          <Heart className="h-3 w-3 fill-rose/20" /> {boardName}
        </span>
        <span className="font-hand text-sm text-mauve/50">
          {isLeft ? 'xoxo' : 'memory lane'}
        </span>
      </div>
    </div>
  );
}

function PinModal({ pin, onClose }) {
  if (!pin) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-plum/70 p-4 backdrop-blur-sm modal-backdrop"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-2xl bg-paper p-5 shadow-lift modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-cream/80 text-ink hover:bg-white z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="polaroid-frame p-4 rounded-xl">
          <div className="relative overflow-hidden rounded-lg bg-blush/20">
            <img
              src={pin.imageUrl}
              alt={pin.title || 'Pin preview'}
              className="w-full max-h-[60vh] object-contain mx-auto"
            />
          </div>
          <div className="mt-4 text-center">
            <h4 className="font-hand text-2xl font-bold text-ink">
              {pin.title || 'Untitled Memory'}
            </h4>
            {pin.sourceUrl && (
              <a
                href={pin.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-2 text-xs font-semibold text-cream hover:bg-[#c73e56] transition"
              >
                View Original Pin
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScrapbookDiary({
  boardName = 'My Scrapbook',
  pins = [],
  onClose,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}) {
  const [currentSpread, setCurrentSpread] = useState(-1);
  const [flipAnim, setFlipAnim] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchCurrentX, setTouchCurrentX] = useState(null);
  const diaryRef = useRef(null);
  const wheelLockRef = useRef(null);
  const isFlippingRef = useRef(false);

  const spreads = useMemo(() => createSpreads(pins), [pins]);
  const totalSpreads = spreads.length;
  const isCover = currentSpread === -1;
  const isLastSpread = currentSpread >= totalSpreads - 1;

  useEffect(() => {
    setCurrentSpread(-1);
  }, [pins.length === 0]);

  useEffect(() => {
    if (
      hasMore &&
      !loadingMore &&
      onLoadMore &&
      currentSpread >= totalSpreads - 2 &&
      totalSpreads > 0
    ) {
      onLoadMore();
    }
  }, [currentSpread, totalSpreads, hasMore, loadingMore, onLoadMore]);

  const flipTo = useCallback(
    (direction) => {
      if (isFlippingRef.current) return;

      if (direction === 'next') {
        if (isCover) {
          isFlippingRef.current = true;
          setFlipAnim('cover-open');
          setTimeout(() => {
            setCurrentSpread(0);
            setFlipAnim(null);
            isFlippingRef.current = false;
          }, 500);
          return;
        }
        if (isLastSpread && !hasMore) return;
        if (isLastSpread && hasMore) {
          onLoadMore?.();
          return;
        }
      }

      if (direction === 'prev') {
        if (isCover) return;
        if (currentSpread === 0) {
          isFlippingRef.current = true;
          setFlipAnim('close-to-cover');
          setTimeout(() => {
            setCurrentSpread(-1);
            setFlipAnim(null);
            isFlippingRef.current = false;
          }, 500);
          return;
        }
      }

      isFlippingRef.current = true;
      setFlipAnim(direction);
      setTimeout(() => {
        setCurrentSpread((p) =>
          direction === 'next'
            ? Math.min(p + 1, totalSpreads - 1)
            : Math.max(p - 1, 0),
        );
        setFlipAnim(null);
        isFlippingRef.current = false;
      }, 500);
    },
    [currentSpread, isCover, isLastSpread, totalSpreads, hasMore, onLoadMore],
  );

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        flipTo('next');
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        flipTo('prev');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flipTo]);

  const handleWheel = (e) => {
    if (wheelLockRef.current) return;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 30) return;
    e.preventDefault();
    flipTo(delta > 0 ? 'next' : 'prev');
    wheelLockRef.current = setTimeout(() => {
      wheelLockRef.current = null;
    }, 600);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX == null || touchCurrentX == null) return;
    const diff = touchStartX - touchCurrentX;
    if (Math.abs(diff) > 50) {
      flipTo(diff > 0 ? 'next' : 'prev');
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  const spreadAnimClass =
    flipAnim === 'next'
      ? 'animate-flip-next'
      : flipAnim === 'prev'
      ? 'animate-flip-prev'
      : flipAnim === 'cover-open'
      ? 'animate-cover-open'
      : '';

  const leftSpreadIndex = currentSpread * 2;
  const rightSpreadIndex = currentSpread * 2 + 1;
  const leftPins = spreads[leftSpreadIndex] || [];
  const rightPins = spreads[rightSpreadIndex] || [];

  const canPrev = !isCover;
  const canNext = !isLastSpread || hasMore;

  const spreadLabel = isCover
    ? 'Cover'
    : `${currentSpread + 1} / ${Math.ceil(totalSpreads / 2) || 1}`;

  return (
    <div className="relative my-6 w-full max-w-5xl mx-auto" ref={diaryRef}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-plum text-cream">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-ink leading-none">
              Scrapbook Diary
            </h3>
            <p className="font-hand text-sm text-mauve">
              Flip through your memory book
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-ink/10 bg-paper px-3 py-1 font-hand text-base text-ink">
            {spreadLabel}
          </span>
          {loadingMore && (
            <Loader2 className="h-4 w-4 animate-spin text-rose" />
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-ink/10 bg-paper p-1.5 text-mauve hover:text-ink hover:bg-cream transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="diary-3d-perspective relative min-h-[520px] sm:min-h-[600px] w-full rounded-[2.5rem] bg-plum p-3 sm:p-5 shadow-lift overflow-hidden select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,216,210,0.12),transparent_70%)] pointer-events-none" />

        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-gold/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-gold/40 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-gold/40 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-gold/40 rounded-br-sm pointer-events-none" />

        <div className="absolute top-0 right-16 w-5 h-28 bg-rose/70 shadow-md rounded-b-md z-30 pointer-events-none -rotate-2" />

        {canPrev && (
          <button
            type="button"
            onClick={() => flipTo('prev')}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-40 grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-paper/90 text-plum shadow-lg backdrop-blur transition duration-200 hover:bg-white hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {canNext && (
          <button
            type="button"
            onClick={() => flipTo('next')}
            disabled={loadingMore && isLastSpread}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-40 grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-paper/90 text-plum shadow-lg backdrop-blur transition duration-200 hover:bg-white hover:scale-110 disabled:opacity-40"
          >
            {loadingMore && isLastSpread ? (
              <Loader2 className="h-5 w-5 animate-spin text-rose" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        )}

        <div
          className={`relative h-full min-h-[480px] sm:min-h-[560px] w-full rounded-[1.8rem] bg-[#FAF6F0] shadow-2xl overflow-hidden border border-cream/20 diary-page-shadow ${spreadAnimClass}`}
          style={{ transformOrigin: 'left center' }}
        >
          {isCover ? (
            <div className="relative h-full min-h-[480px] sm:min-h-[560px] w-full bg-gradient-to-br from-[#392332] via-[#2A1824] to-[#1F111A] text-cream flex flex-col items-center justify-center text-center p-6 sm:p-12">
              <div className="max-w-md w-full rounded-2xl border-2 border-gold/30 p-7 sm:p-10 backdrop-blur-sm bg-plum/30 shadow-inner relative overflow-hidden">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-xl" />
                <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-rose/10 blur-xl" />

                <Sparkles className="mx-auto h-7 w-7 text-gold animate-pulse mb-3" />
                <p className="font-hand text-xl sm:text-2xl text-coral tracking-widest uppercase">
                  Personal Scrapbook
                </p>
                <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold tracking-tight text-cream">
                  {boardName}
                </h1>
                <p className="mt-4 font-hand text-lg sm:text-xl text-cream/60 leading-relaxed">
                  "{pins.length} memories collected with love & aesthetic
                  chemistry."
                </p>

                <div className="mt-7">
                  <button
                    type="button"
                    onClick={() => flipTo('next')}
                    className="inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 font-semibold text-cream shadow-md transition hover:bg-[#c73e56] hover:scale-105 animate-diary-pulse"
                  >
                    Open Scrapbook
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-6 font-hand text-base sm:text-lg text-cream/35 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-coral" />
                Scroll, swipe, or use arrow keys to flip
              </p>
            </div>
          ) : (
            <div className="relative h-full min-h-[480px] sm:min-h-[560px] w-full grid grid-cols-1 md:grid-cols-2">
              <div className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 scrapbook-spine z-20 pointer-events-none" />

              <div className="border-b md:border-b-0 md:border-r border-ink/8 overflow-hidden">
                {leftPins.length === 0 && loadingMore ? (
                  <PageSkeleton />
                ) : (
                  <SpreadPage
                    spreadPins={leftPins}
                    spreadIndex={leftSpreadIndex}
                    pageLabel={`Page ${leftSpreadIndex + 1}`}
                    texture={PAGE_TEXTURES[leftSpreadIndex % PAGE_TEXTURES.length]}
                    boardName={boardName}
                    isLeft
                    onPinClick={setSelectedPin}
                  />
                )}
              </div>

              <div className="overflow-hidden">
                {rightPins.length === 0 && leftPins.length > 0 && loadingMore ? (
                  <PageSkeleton />
                ) : (
                  <SpreadPage
                    spreadPins={rightPins}
                    spreadIndex={rightSpreadIndex}
                    pageLabel={`Page ${rightSpreadIndex + 1}`}
                    texture={PAGE_TEXTURES[rightSpreadIndex % PAGE_TEXTURES.length]}
                    boardName={boardName}
                    isLeft={false}
                    onPinClick={setSelectedPin}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setCurrentSpread(-1)}
          className={`rounded-full px-3 py-1 font-hand text-base transition ${
            isCover
              ? 'bg-plum text-cream font-bold'
              : 'bg-paper text-ink hover:bg-cream'
          }`}
        >
          Cover
        </button>
        {Array.from({ length: Math.ceil(totalSpreads / 2) }).map((_, idx) => {
          const active = currentSpread >= idx * 2 && currentSpread < idx * 2 + 2;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSpread(idx * 2)}
              className={`rounded-full px-3 py-1 font-hand text-base transition ${
                active
                  ? 'bg-plum text-cream font-bold'
                  : 'bg-paper text-ink hover:bg-cream'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
        {hasMore && (
          <span className="rounded-full bg-rose/10 px-3 py-1 font-hand text-base text-rose">
            ...
          </span>
        )}
      </div>

      <PinModal pin={selectedPin} onClose={() => setSelectedPin(null)} />
    </div>
  );
}
