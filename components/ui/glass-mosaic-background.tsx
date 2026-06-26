export function GlassMosaicBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="glass-mosaic">
        {Array.from({ length: 24 }).map((_, index) => (
          <div key={index} className="glass-mosaic-tile" />
        ))}
      </div>
    </div>
  );
}
