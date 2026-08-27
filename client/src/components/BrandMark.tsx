/**
 * Care Canvas reminder: the Nightingale signal mark is a confident, visible
 * orientation anchor in the sky-blue rail, not a decorative tiny favicon.
 */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-signal ${className}`} aria-label="Nightingale">
      <span className="brand-signal-fallback" aria-hidden="true">
        <i /><b /><em />
      </span>
    </span>
  );
}
