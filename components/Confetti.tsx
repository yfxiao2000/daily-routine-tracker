"use client";

import { useMemo } from "react";

const COLORS = [
  "#f97316", "#3b82f6", "#22c55e", "#eab308",
  "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444",
];

interface ConfettiProps {
  show: boolean;
}

export default function Confetti({ show }: ConfettiProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 8,
        drift: (Math.random() - 0.5) * 120, // 左右漂移
      })),
    []
  );

  if (!show) return null;

  return (
    <div className="confetti-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            // @ts-expect-error CSS custom property
            "--drift": `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
