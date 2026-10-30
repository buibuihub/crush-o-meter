import { ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-7xl place-items-center px-5 py-16 sm:px-8">
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-rose text-cream shadow-soft">
          <Heart className="h-7 w-7" fill="currentColor" />
        </span>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-rose">
          404 — wrong turn
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-[-0.05em] text-ink">
          This page ghosted us.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mauve">
          The link is broken, but the chemistry isn&apos;t. Head back and find your way.
        </p>
        <Link to="/" className="btn-primary mt-7">
          <ArrowLeft className="h-4 w-4" />
          Back to the meter
        </Link>
      </div>
    </div>
  );
}
