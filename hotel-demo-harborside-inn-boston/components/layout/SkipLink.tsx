export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-[100] rounded-full bg-dark px-5 py-3 text-sm font-semibold text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Skip to main content
    </a>
  );
}