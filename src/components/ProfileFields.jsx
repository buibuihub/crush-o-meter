import { ChevronDown, Compass, MessageCircleMore, UserRound } from 'lucide-react';
import { COMMUNICATION_STYLES, MBTI_TYPES } from '../constants';
import TraitPicker from './TraitPicker';

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[11px] font-medium text-rose">{children}</p>;
}

function FieldLabel({ children, optional = false }) {
  return (
    <span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-ink">
      <span>{children}</span>
      {optional && (
        <span className="text-[10px] font-normal uppercase tracking-[0.08em] text-mauve/55">
          optional
        </span>
      )}
    </span>
  );
}

export default function ProfileFields({ profile, onChange, errors = {}, namePlaceholder }) {
  const update = (field, value) => onChange(field, value);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <FieldLabel optional>Name</FieldLabel>
          <span className="relative block">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve/50" />
            <input
              type="text"
              value={profile.name || ''}
              onChange={(event) => update('name', event.target.value)}
              maxLength={60}
              placeholder={namePlaceholder || 'First name'}
              className="field-input pl-10"
            />
          </span>
          <FieldError>{errors.name}</FieldError>
        </label>

        <label className="block">
          <FieldLabel>MBTI</FieldLabel>
          <span className="relative block">
            <select
              value={profile.mbti || ''}
              onChange={(event) => update('mbti', event.target.value)}
              className={`field-input appearance-none pr-10 ${
                profile.mbti ? 'text-ink' : 'text-mauve/55'
              } ${errors.mbti ? 'border-rose/50' : ''}`}
            >
              <option value="">Select type</option>
              {MBTI_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve/60" />
          </span>
          <FieldError>{errors.mbti}</FieldError>
        </label>
      </div>

      <div>
        <FieldLabel>Key characteristics</FieldLabel>
        <TraitPicker
          value={profile.traits || []}
          onChange={(traits) => update('traits', traits)}
          hasError={Boolean(errors.traits)}
        />
        <FieldError>{errors.traits}</FieldError>
      </div>

      <label className="block">
        <FieldLabel>Hobbies & interests</FieldLabel>
        <span className="relative block">
          <Compass className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-mauve/50" />
          <textarea
            value={profile.hobbies || ''}
            onChange={(event) => update('hobbies', event.target.value)}
            maxLength={400}
            rows={2}
            placeholder="Films, trail running, tiny cafes, staring out of train windows…"
            className={`field-input min-h-[74px] resize-none pl-10 ${
              errors.hobbies ? 'border-rose/50' : ''
            }`}
          />
        </span>
        <FieldError>{errors.hobbies}</FieldError>
      </label>

      <div>
        <FieldLabel>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircleMore className="h-3.5 w-3.5 text-mauve/60" />
            Communication style
          </span>
        </FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {COMMUNICATION_STYLES.map((style) => {
            const selected = profile.communicationStyle === style.value;
            return (
              <button
                key={style.value}
                type="button"
                onClick={() => update('communicationStyle', style.value)}
                className={`rounded-xl border px-3 py-2.5 text-left text-[11px] font-semibold transition ${
                  selected
                    ? 'border-rose/25 bg-rose/[0.07] text-rose'
                    : 'border-ink/[0.08] bg-white/45 text-mauve hover:border-ink/15 hover:bg-white hover:text-ink'
                } ${errors.communicationStyle ? 'border-rose/30' : ''}`}
                aria-pressed={selected}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition ${
                      selected ? 'bg-rose' : 'bg-mauve/25'
                    }`}
                  />
                  {style.label}
                </span>
              </button>
            );
          })}
        </div>
        <FieldError>{errors.communicationStyle}</FieldError>
      </div>
    </div>
  );
}
