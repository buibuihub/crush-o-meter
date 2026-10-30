import { Link } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';

export default function Logo({ light = false, linked = true }) {
  const content = (
    <>
      <span
        className={`relative grid h-10 w-10 -rotate-3 place-items-center rounded-[14px] shadow-[0_8px_20px_-10px_rgba(216,74,98,0.8)] transition-transform duration-300 group-hover:rotate-3 ${
          light ? 'bg-coral text-plum' : 'bg-rose text-cream'
        }`}
      >
        <Heart className="h-[21px] w-[21px]" fill="currentColor" strokeWidth={0} />
        <Sparkles className="absolute -right-1.5 -top-1.5 h-4 w-4 text-gold" strokeWidth={2.3} />
      </span>
      <span
        className={`font-display text-[1.3rem] font-semibold tracking-[-0.045em] ${
          light ? 'text-cream' : 'text-ink'
        }`}
      >
        Crush<span className={light ? 'text-coral' : 'text-rose'}>-O-</span>Meter
      </span>
    </>
  );

  if (!linked) {
    return <span className="group inline-flex items-center gap-2.5">{content}</span>;
  }

  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Crush-O-Meter home">
      {content}
    </Link>
  );
}
