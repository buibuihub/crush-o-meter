import { useEffect, useId, useRef, useState } from 'react';
import { Loader2, Search, UserRound, X } from 'lucide-react';
import { api } from '../api';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 320;

function SuggestionThumb({ suggestion }) {
  const [failed, setFailed] = useState(false);
  const initials = suggestion.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  if (suggestion.photo && !failed) {
    return (
      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-blush/60 ring-1 ring-ink/[0.06]">
        <img
          src={suggestion.photo}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blush to-sage text-[10px] font-bold text-plum ring-1 ring-ink/[0.06]">
      {initials || <UserRound className="h-3.5 w-3.5" />}
    </span>
  );
}

export default function CelebritySearch({
  id,
  value,
  onChange,
  onSelect,
  placeholder,
  maxLength = 80,
  hasError = false,
}) {
  const generatedId = useId();
  const baseId = (id || generatedId).replace(/[^a-zA-Z0-9_-]/g, '');
  const listboxId = `${baseId}-listbox`;
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const resultQueryRef = useRef('');
  const skipQueryRef = useRef('');
  const abortRef = useRef(null);

  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [correctedQuery, setCorrectedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!focused) {
      setLoading(false);
      return undefined;
    }

    const query = value.trim();
    const normalizedQuery = query.toLowerCase();

    if (skipQueryRef.current && skipQueryRef.current === normalizedQuery) {
      skipQueryRef.current = '';
      setOpen(false);
      setLoading(false);
      return undefined;
    }

    if (query.length < MIN_QUERY_LENGTH) {
      setOpen(false);
      setSuggestions([]);
      setCorrectedQuery('');
      setError('');
      setLoading(false);
      setActiveIndex(-1);
      return undefined;
    }

    if (resultQueryRef.current === normalizedQuery && suggestions.length > 0) {
      setOpen(true);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setOpen(true);
    setLoading(true);
    setError('');
    setSuggestions([]);
    setCorrectedQuery('');
    setActiveIndex(-1);

    const timer = window.setTimeout(async () => {
      try {
        const data = await api.searchCeleb(query, { signal: controller.signal });
        if (controller.signal.aborted) return;

        const nextSuggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
        const nextCorrected =
          typeof data?.correctedQuery === 'string' ? data.correctedQuery.trim() : '';

        resultQueryRef.current = normalizedQuery;
        setSuggestions(nextSuggestions);
        setCorrectedQuery(
          nextCorrected && nextCorrected.toLowerCase() !== normalizedQuery ? nextCorrected : '',
        );
        setActiveIndex(nextSuggestions.length > 0 ? 0 : -1);
        setOpen(true);
      } catch (requestError) {
        if (requestError?.name === 'AbortError' || controller.signal.aborted) return;
        resultQueryRef.current = '';
        setSuggestions([]);
        setCorrectedQuery('');
        setActiveIndex(-1);
        setError(requestError?.message || 'Could not load suggestions.');
        setOpen(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
      if (abortRef.current === controller) abortRef.current = null;
    };
  }, [value, focused]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const option = rootRef.current?.querySelector(`[data-option-index="${activeIndex}"]`);
    option?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      setOpen(false);
      setFocused(false);
      setLoading(false);
      abortRef.current?.abort();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const chooseSuggestion = (suggestion) => {
    if (!suggestion) return;
    skipQueryRef.current = suggestion.name.trim().toLowerCase();
    onChange(suggestion.name);
    onSelect?.(suggestion);
    setOpen(false);
    setSuggestions([]);
    setCorrectedQuery('');
    setError('');
    setActiveIndex(-1);
    setLoading(false);
    abortRef.current?.abort();
    inputRef.current?.focus();
  };

  const applyCorrection = () => {
    if (!correctedQuery) return;
    skipQueryRef.current = correctedQuery.toLowerCase();
    onChange(correctedQuery);
    setOpen(false);
    setSuggestions([]);
    setCorrectedQuery('');
    setError('');
    setActiveIndex(-1);
    setLoading(false);
    abortRef.current?.abort();
    inputRef.current?.focus();
  };

  const handleClear = () => {
    skipQueryRef.current = '';
    onChange('');
    setOpen(false);
    setSuggestions([]);
    setCorrectedQuery('');
    setError('');
    setActiveIndex(-1);
    setLoading(false);
    abortRef.current?.abort();
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setLoading(false);
        abortRef.current?.abort();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open && value.trim().length >= MIN_QUERY_LENGTH) setOpen(true);
      if (suggestions.length > 0) {
        setActiveIndex((current) => (current + 1) % suggestions.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (suggestions.length > 0) {
        setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      }
      return;
    }

    if (event.key === 'Enter' && open) {
      if (suggestions.length > 0) {
        event.preventDefault();
        chooseSuggestion(suggestions[activeIndex] || suggestions[0]);
      } else if (loading) {
        event.preventDefault();
      }
    }
  };

  const showDropdown = open && value.trim().length >= MIN_QUERY_LENGTH;
  const showLoading = loading && suggestions.length === 0;
  const showEmpty = !loading && !error && suggestions.length === 0;

  return (
    <div ref={rootRef} className="relative">
      <span className="relative block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose/60" />
        <input
          ref={inputRef}
          id={id || `${baseId}-input`}
          type="text"
          role="combobox"
          value={value}
          onChange={(event) => {
            skipQueryRef.current = '';
            onChange(event.target.value);
          }}
          onFocus={() => {
            setFocused(true);
            if (value.trim().length >= MIN_QUERY_LENGTH && suggestions.length > 0) {
              setOpen(true);
            }
          }}
          onBlur={(event) => {
            if (rootRef.current?.contains(event.relatedTarget)) return;
            setOpen(false);
            setFocused(false);
            setLoading(false);
            abortRef.current?.abort();
          }}
          onClick={() => {
            if (value.trim().length >= MIN_QUERY_LENGTH && suggestions.length > 0) {
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck={false}
          className={`field-input pl-10 pr-11 ${hasError ? 'border-rose/50' : ''}`}
          aria-invalid={hasError}
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showDropdown && activeIndex >= 0 ? `${baseId}-option-${activeIndex}` : undefined
          }
        />
        {loading ? (
          <Loader2 className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-rose/70" />
        ) : (
          value && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-mauve/60 transition hover:bg-ink/[0.05] hover:text-ink"
              aria-label="Clear celebrity name"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )
        )}
      </span>

      <span className="sr-only" role="status" aria-live="polite">
        {loading
          ? 'Searching for celebrity profiles.'
          : correctedQuery
            ? `Showing results for ${correctedQuery}.`
            : suggestions.length > 0
              ? `${suggestions.length} celebrity suggestions available.`
              : ''}
      </span>

      {showDropdown && (
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-lift animate-fade-up">
          {correctedQuery && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={applyCorrection}
              className="flex w-full items-center gap-2.5 border-b border-ink/[0.06] bg-rose/[0.035] px-3.5 py-2.5 text-left transition hover:bg-rose/[0.07]"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-rose" />
              <span className="min-w-0 flex-1 truncate text-[12px] text-mauve">
                Showing results for{' '}
                <span className="font-semibold text-ink">{correctedQuery}</span>
              </span>
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.1em] text-rose">
                Use
              </span>
            </button>
          )}

          {showLoading && (
            <div className="space-y-1 p-2">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-ink/[0.06]" />
                  <span className="flex-1 space-y-1.5">
                    <span className="block h-2.5 w-28 animate-pulse rounded-full bg-ink/[0.08]" />
                    <span className="block h-2 w-44 max-w-full animate-pulse rounded-full bg-ink/[0.05]" />
                  </span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="px-4 py-3.5 text-[11px] leading-relaxed text-rose">{error}</p>
          )}

          {showEmpty && (
            <p className="px-4 py-3.5 text-[11px] leading-relaxed text-mauve">
              No matching profiles yet. Try their full name.
            </p>
          )}

          {suggestions.length > 0 && (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Celebrity suggestions"
              className="max-h-80 overflow-y-auto py-1"
            >
              {suggestions.map((suggestion, index) => {
                const active = index === activeIndex;
                return (
                  <li
                    key={`${suggestion.name}-${index}`}
                    id={`${baseId}-option-${index}`}
                    role="option"
                    aria-selected={active}
                    data-option-index={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => chooseSuggestion(suggestion)}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition ${
                      active ? 'bg-rose/[0.06]' : 'hover:bg-ink/[0.03]'
                    }`}
                  >
                    <SuggestionThumb suggestion={suggestion} />
                    <span className="min-w-0 flex-1">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold text-ink">
                          {suggestion.name}
                        </span>
                        {index === 0 && correctedQuery && (
                          <span className="shrink-0 rounded-full bg-rose/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-rose">
                            corrected
                          </span>
                        )}
                      </span>
                      {suggestion.description && (
                        <span className="mt-0.5 block truncate text-[11px] text-mauve/80">
                          {suggestion.description}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-ink/[0.06] bg-ink/[0.015] px-3.5 py-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.11em] text-mauve/50">
              Live profile search
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-medium text-mauve/50">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7F9B6D]" />
              Auto-correct on
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
