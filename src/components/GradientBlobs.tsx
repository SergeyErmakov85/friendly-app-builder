export function GradientBlobs({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className="absolute -top-24 -left-16 h-72 w-72 rounded-full opacity-70 blur-3xl animate-float-slow"
        style={{
          background: "radial-gradient(closest-side, oklch(0.62 0.22 264 / 0.55), transparent)",
        }}
      />
      <div
        className="absolute -top-10 right-[-4rem] h-80 w-80 rounded-full opacity-60 blur-3xl animate-float-slower"
        style={{
          background: "radial-gradient(closest-side, oklch(0.5 0.27 305 / 0.55), transparent)",
        }}
      />
      <div
        className="absolute top-24 left-1/3 h-56 w-56 rounded-full opacity-50 blur-3xl animate-float-slow"
        style={{
          background: "radial-gradient(closest-side, oklch(0.45 0.25 285 / 0.5), transparent)",
        }}
      />
      {/* floating sphere */}
      <div
        className="absolute top-8 right-8 h-16 w-16 rounded-full shadow-glow animate-float-slower"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, white, oklch(0.62 0.22 264) 60%, oklch(0.45 0.25 285))",
        }}
      />
      <div
        className="absolute top-32 left-10 h-8 w-8 rounded-full opacity-90 animate-float-slow"
        style={{
          background: "radial-gradient(circle at 30% 30%, white, oklch(0.5 0.27 305))",
        }}
      />
    </div>
  );
}
