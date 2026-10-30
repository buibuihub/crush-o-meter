import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { TRAIT_SUGGESTIONS } from '../constants';

export default function TraitPicker({ value, onChange, max = 8, hasError = false }) {
  const [customTrait, setCustomTrait] = useState('');
  const selected = Array.isArray(value) ? value : [];
  const availableSuggestions = TRAIT_SUGGESTIONS.filter(
    (trait) => !selected.some((item) => item.toLowerCase() === trait.toLowerCase()),
  ).slice(0, 8);

  const addTrait = (trait) => {
    const clean = trait.trim().replace(/\s+/g, ' ').slice(0, 48);
    if (!clean || selected.length >= max) return;
    if (selected.some((item) => item.toLowerCase() === clean.toLowerCase())) return;
    onChange([...selected, clean]);
    setCustomTrait('');
  };

  const removeTrait = (trait) => {
    onChange(selected.filter((item) => item !== trait));
  };

  const handleCustomKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTrait(customTrait);
    }
  };

  return (
    <div>
      <div
        className={`min-h-[52px] rounded-2xl border bg-white/70 p-2 transition focus-within:border-rose/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose/[0.07] ${
          hasError ? 'border-rose/50' : 'border-ink/10'
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {selected.map((trait) => (
            <span
              key={trait}
              className="inline-flex items-center gap-1 rounded-full bg-plum py-1 pl-2.5 pr-1 text-[11px] font-semibold text-cream"
            >
              {trait}
              <button
                type="button"
                onClick={() => removeTrait(trait)}
                className="grid h-4 w-4 place-items-center rounded-full text-cream/55 transition hover:bg-cream/15 hover:text-cream"
                aria-label={`Remove ${trait}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          {selected.length < max && (
            <span className="flex min-w-[130px] flex-1 items-center gap-1">
              <input
                value={customTrait}
                onChange={(event) => setCustomTrait(event.target.value)}
                onKeyDown={handleCustomKeyDown}
                maxLength={48}
                placeholder={selected.length ? 'Add another…' : 'Type a trait…'}
                className="min-w-0 flex-1 bg-transparent px-1.5 py-1 text-sm text-ink outline-none placeholder:text-mauve/45"
                aria-label="Add a custom personality trait"
              />
              {customTrait.trim() && (
                <button
                  type="button"
                  onClick={() => addTrait(customTrait)}
                  className="grid h-6 w-6 place-items-center rounded-full bg-rose/10 text-rose transition hover:bg-rose hover:text-white"
                  aria-label="Add trait"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          )}
        </div>
      </div>

      {availableSuggestions.length > 0 && selected.length < max && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {availableSuggestions.map((trait) => (
            <button
              key={trait}
              type="button"
              onClick={() => addTrait(trait)}
              className="inline-flex items-center gap-1 rounded-full border border-ink/[0.08] bg-transparent px-2.5 py-1 text-[10px] font-medium text-mauve transition hover:border-rose/25 hover:bg-rose/5 hover:text-rose"
            >
              <Plus className="h-2.5 w-2.5" />
              {trait}
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-[10px] text-mauve/70">
        Pick up to {max} — the specific ones make a better read.
      </p>
    </div>
  );
}
