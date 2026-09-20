'use client';

import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#10B981', '#06B6D4', '#8B5CF6'],
  });

  fire(0.2, {
    spread: 60,
    colors: ['#3B82F6', '#F59E0B', '#10B981'],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#10B981', '#22D3EE', '#F43F5E', '#A855F7'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#E2E8F0', '#38BDF8', '#34D399'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#10B981', '#6366F1', '#EC4899'],
  });
}

export function fireMicroSparkle(x = 0.5, y = 0.5) {
  confetti({
    particleCount: 25,
    spread: 45,
    startVelocity: 25,
    origin: { x, y },
    colors: ['#10B981', '#06B6D4', '#F59E0B'],
    disableForReducedMotion: true,
    zIndex: 9999,
  });
}
