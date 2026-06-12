import { useEffect } from 'react';
import { useAnimation, useMotionValue, useTransform } from 'motion/react';

export function useFadeInAnimation(delay = 0) {
  const controls = useAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [controls, delay]);

  return {
    initial: { opacity: 0, y: 20 },
    animate: controls,
  };
}

export function useProgressAnimation(targetProgress: number) {
  const progressMotion = useMotionValue(0);
  const displayValue = useTransform(progressMotion, (value) =>
    Math.round(value)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      progressMotion.set(targetProgress);
    }, 100);

    return () => clearTimeout(timer);
  }, [targetProgress, progressMotion]);

  return { progressMotion, displayValue };
}
