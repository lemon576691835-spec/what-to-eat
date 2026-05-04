import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}

export function GlassCard({ children, className = "", strong }: GlassCardProps) {
  return (
    <div
      className={`${strong ? "glass-strong" : "glass"} rounded-glass shadow-lg shadow-black/5 ${className}`}
    >
      {children}
    </div>
  );
}
