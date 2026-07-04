/**
 * Drives one walking animation: calls `onFrame` with progress 0..1 on every
 * animation frame for the given duration, then `onArrived` exactly once.
 * Returns a cancel function — after cancelling, neither callback fires
 * again (used when a screen is torn down mid-walk).
 */
export function runTravelAnimationLoop(
  durationMilliseconds: number,
  onFrame: (progress: number) => void,
  onArrived: () => void,
): () => void {
  let isCancelled = false;
  const startTimestamp = performance.now();
  const advanceFrame = (timestamp: number): void => {
    if (isCancelled) {
      return;
    }
    const progress = Math.min((timestamp - startTimestamp) / durationMilliseconds, 1);
    onFrame(progress);
    if (progress < 1) {
      window.requestAnimationFrame(advanceFrame);
      return;
    }
    onArrived();
  };
  window.requestAnimationFrame(advanceFrame);
  return () => {
    isCancelled = true;
  };
}
