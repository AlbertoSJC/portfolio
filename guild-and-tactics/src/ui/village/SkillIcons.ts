import type { SkillDefinition } from '@/sim/battle/SkillDefinition';

/**
 * Procedural canvas icons for skill rows — one icon per effect category.
 * PRD swap-point: real art replaces only this module.
 */

export type SkillIconKind =
  | 'physicalAttack'
  | 'fire'
  | 'water'
  | 'earth'
  | 'wind'
  | 'sacred'
  | 'dark'
  | 'lightning'
  | 'magicGeneric'
  | 'healing'
  | 'buff'
  | 'statusEffect';

const S = 32;
const C = S / 2;

export function iconKindForSkill(skill: SkillDefinition): SkillIconKind {
  const { effect } = skill;
  switch (effect.kind) {
    case 'damage':
      if (effect.damageSource === 'physical') return 'physicalAttack';
      switch (effect.element) {
        case 'fire':      return 'fire';
        case 'water':     return 'water';
        case 'earth':     return 'earth';
        case 'wind':      return 'wind';
        case 'sacred':    return 'sacred';
        case 'dark':      return 'dark';
        case 'lightning': return 'lightning';
        default:          return 'magicGeneric';
      }
    case 'heal':         return 'healing';
    case 'statModifier': return 'buff';
    case 'statusEffect': return 'statusEffect';
  }
}

export function createSkillIconCanvas(kind: SkillIconKind): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  canvas.className = 'skill-icon';
  const ctx = canvas.getContext('2d');
  if (ctx !== null) {
    ICON_DRAWERS[kind](ctx);
  }
  return canvas;
}

type Drawer = (ctx: CanvasRenderingContext2D) => void;

// ── shared helpers ───────────────────────────────────────────────────────────

function roundedBackground(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.beginPath();
  ctx.roundRect(2, 2, S - 4, S - 4, 5);
  ctx.fillStyle = color;
  ctx.fill();
}

function cross(ctx: CanvasRenderingContext2D, color: string, arm: number, thick: number): void {
  ctx.fillStyle = color;
  ctx.fillRect(C - thick, C - arm, thick * 2, arm * 2);
  ctx.fillRect(C - arm, C - thick, arm * 2, thick * 2);
}

// ── icon drawers ─────────────────────────────────────────────────────────────

const ICON_DRAWERS: Record<SkillIconKind, Drawer> = {

  physicalAttack: (ctx) => {
    roundedBackground(ctx, '#1e2530');
    ctx.strokeStyle = '#ccd3da';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // Diagonal slash
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(24, 24);
    ctx.stroke();
    // Two impact sparks
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22, 8);
    ctx.lineTo(18, 12);
    ctx.moveTo(8, 22);
    ctx.lineTo(12, 18);
    ctx.stroke();
    ctx.lineWidth = 1;
  },

  fire: (ctx) => {
    roundedBackground(ctx, '#2a1608');
    // Outer flame — orange
    ctx.fillStyle = '#e86020';
    ctx.beginPath();
    ctx.moveTo(C, 6);
    ctx.bezierCurveTo(C + 8, 12, C + 10, 18, C + 6, 24);
    ctx.bezierCurveTo(C + 10, 22, C + 8, 16, C, 22);
    ctx.bezierCurveTo(C - 8, 16, C - 10, 22, C - 6, 24);
    ctx.bezierCurveTo(C - 10, 18, C - 8, 12, C, 6);
    ctx.fill();
    // Inner glow — yellow
    ctx.fillStyle = '#ffc030';
    ctx.beginPath();
    ctx.moveTo(C, 13);
    ctx.bezierCurveTo(C + 4, 17, C + 4, 20, C, 24);
    ctx.bezierCurveTo(C - 4, 20, C - 4, 17, C, 13);
    ctx.fill();
  },

  water: (ctx) => {
    roundedBackground(ctx, '#081828');
    // Teardrop — wider at bottom
    ctx.fillStyle = '#4a9ede';
    ctx.beginPath();
    ctx.moveTo(C, 6);
    ctx.bezierCurveTo(C + 9, 15, C + 9, 22, C, 26);
    ctx.bezierCurveTo(C - 9, 22, C - 9, 15, C, 6);
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(C - 2, 14, 2.5, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
  },

  earth: (ctx) => {
    roundedBackground(ctx, '#1a130a');
    // Mountain silhouette
    ctx.fillStyle = '#7a6040';
    ctx.beginPath();
    ctx.moveTo(4, 26);
    ctx.lineTo(C, 8);
    ctx.lineTo(28, 26);
    ctx.closePath();
    ctx.fill();
    // Snow cap
    ctx.fillStyle = '#c8cccc';
    ctx.beginPath();
    ctx.moveTo(C, 8);
    ctx.lineTo(C + 6, 16);
    ctx.lineTo(C - 6, 16);
    ctx.closePath();
    ctx.fill();
  },

  wind: (ctx) => {
    roundedBackground(ctx, '#081e1c');
    ctx.strokeStyle = '#60d0b8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    // Three swoosh arcs
    for (const [y, xEnd] of [[10, 22], [16, 26], [22, 20]] as [number, number][]) {
      ctx.beginPath();
      ctx.moveTo(6, y);
      ctx.quadraticCurveTo(C, y - 4, xEnd, y);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
  },

  sacred: (ctx) => {
    roundedBackground(ctx, '#1e1800');
    // Glow aura
    const glow = ctx.createRadialGradient(C, C, 2, C, C, 13);
    glow.addColorStop(0, 'rgba(255,230,80,0.5)');
    glow.addColorStop(1, 'rgba(255,180,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, S, S);
    // Bold cross
    cross(ctx, '#ffd56b', 11, 3);
    // Bright center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(C - 2, C - 2, 4, 4);
  },

  dark: (ctx) => {
    roundedBackground(ctx, '#100818');
    // Outer ring
    ctx.beginPath();
    ctx.arc(C, C, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#6b3db8';
    ctx.fill();
    // Void center
    ctx.beginPath();
    ctx.arc(C, C, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#06040c';
    ctx.fill();
    // Crack lines radiating from void
    ctx.strokeStyle = '#9060d8';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(C + Math.cos(angle) * 7, C + Math.sin(angle) * 7);
      ctx.lineTo(C + Math.cos(angle) * 11, C + Math.sin(angle) * 11);
      ctx.stroke();
    }
  },

  lightning: (ctx) => {
    roundedBackground(ctx, '#1a1800');
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(C + 4, 6);
    ctx.lineTo(C - 3, 16);
    ctx.lineTo(C + 3, 16);
    ctx.lineTo(C - 4, 26);
    ctx.lineTo(C + 6, 15);
    ctx.lineTo(C, 15);
    ctx.closePath();
    ctx.fill();
    // Inner glow
    ctx.fillStyle = '#fff8c0';
    ctx.beginPath();
    ctx.moveTo(C + 2, 10);
    ctx.lineTo(C - 1, 16);
    ctx.lineTo(C + 2, 16);
    ctx.lineTo(C - 1, 22);
    ctx.lineTo(C + 4, 16);
    ctx.lineTo(C + 1, 16);
    ctx.closePath();
    ctx.fill();
  },

  magicGeneric: (ctx) => {
    roundedBackground(ctx, '#081820');
    // Outer ring
    ctx.beginPath();
    ctx.arc(C, C, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#1a6080';
    ctx.fill();
    // Orb
    const orb = ctx.createRadialGradient(C - 3, C - 3, 1, C, C, 9);
    orb.addColorStop(0, '#a0f0ff');
    orb.addColorStop(1, '#1090c0');
    ctx.beginPath();
    ctx.arc(C, C, 9, 0, Math.PI * 2);
    ctx.fillStyle = orb;
    ctx.fill();
  },

  healing: (ctx) => {
    roundedBackground(ctx, '#081408');
    // Green cross with rounded arms
    ctx.fillStyle = '#4cca50';
    ctx.beginPath();
    ctx.roundRect(C - 3, 7, 6, 18, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(7, C - 3, 18, 6, 2);
    ctx.fill();
    // Bright center
    ctx.fillStyle = '#a0f0a0';
    ctx.fillRect(C - 2, C - 2, 4, 4);
  },

  buff: (ctx) => {
    roundedBackground(ctx, '#1a1400');
    // Upward arrow
    ctx.fillStyle = '#d9b13b';
    ctx.beginPath();
    // Arrowhead
    ctx.moveTo(C, 7);
    ctx.lineTo(C + 8, 18);
    ctx.lineTo(C + 3, 18);
    ctx.lineTo(C + 3, 26);
    ctx.lineTo(C - 3, 26);
    ctx.lineTo(C - 3, 18);
    ctx.lineTo(C - 8, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff0a0';
    ctx.fillRect(C - 2, 18, 4, 4);
  },

  statusEffect: (ctx) => {
    roundedBackground(ctx, '#180820');
    ctx.strokeStyle = '#c040b8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    // Asterisk — 4 spokes
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(C + Math.cos(angle) * 3, C + Math.sin(angle) * 3);
      ctx.lineTo(C + Math.cos(angle) * 11, C + Math.sin(angle) * 11);
      ctx.stroke();
    }
    // Swirl arc
    ctx.strokeStyle = '#e070d8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(C, C, 6, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.lineWidth = 1;
  },
};
