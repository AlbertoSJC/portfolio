/** Soft radial darkening toward the edges, shared by every full-bleed map canvas. */
const VIGNETTE_ALPHA = 0.35;

export function drawMapVignette(context: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.35,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75,
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, `rgba(0, 0, 0, ${VIGNETTE_ALPHA})`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}
