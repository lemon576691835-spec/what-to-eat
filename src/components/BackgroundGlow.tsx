export function BackgroundGlow() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-40 -left-20 w-72 h-72 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(255,160,122,0.5) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -right-20 w-96 h-96 rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(135,206,235,0.4) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(200,160,255,0.4) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
