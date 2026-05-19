import { useMemo } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────────────────────
 * Shared procedural textures for cinematic R3F effects.
 * Each returns a memoized THREE.CanvasTexture — safe to use as sprite map.
 * ────────────────────────────────────────────────────────────────────────── */

export type GradientStop = readonly [number, string];

/** Radial gradient (used for soft glow billboards, particle sprites). */
export function useRadialTexture(stops: ReadonlyArray<GradientStop>, size = 128) {
  const key = stops.map(([s, c]) => `${s}:${c}`).join("|");
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const half = size / 2;
    const g = ctx.createRadialGradient(half, half, 0, half, half, half);
    for (const [stop, color] of stops) g.addColorStop(stop, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, size]);
}

/** Annular ring with sharp inner highlight — for shockwaves/halos. */
export function useRingTexture(color: string, innerColor = "rgba(0,0,0,0)") {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 76, 128, 128, 128);
    g.addColorStop(0, innerColor);
    g.addColorStop(0.42, innerColor);
    g.addColorStop(0.55, color);
    g.addColorStop(0.78, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    // Inner sharp ring highlight
    const g2 = ctx.createRadialGradient(128, 128, 92, 128, 128, 108);
    g2.addColorStop(0, "rgba(0,0,0,0)");
    g2.addColorStop(0.5, "rgba(255,255,255,0.75)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [color, innerColor]);
}

/** Horizontal anamorphic streak — classic JJ-Abrams lens flare. */
export function useStreakTexture(color = "rgba(255,235,180,0.95)") {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 32, 512, 32);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.48, color);
    g.addColorStop(0.52, color);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 64);
    // Vertical falloff so it's not a rectangle
    const v = ctx.createLinearGradient(0, 0, 0, 64);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(0.5, "rgba(0,0,0,0.85)");
    v.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, 512, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [color]);
}

/** Vertical light pillar — for energy column effects. */
export function usePillarTexture(color = "rgba(255,215,0,0.95)") {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    // Vertical gradient with bright middle
    const v = ctx.createLinearGradient(0, 0, 0, 512);
    v.addColorStop(0, "rgba(255,255,255,0)");
    v.addColorStop(0.45, color);
    v.addColorStop(0.55, color);
    v.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, 128, 512);
    // Horizontal soft fade
    const h = ctx.createLinearGradient(0, 0, 128, 0);
    h.addColorStop(0, "rgba(0,0,0,0)");
    h.addColorStop(0.5, "rgba(0,0,0,1)");
    h.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = h;
    ctx.fillRect(0, 0, 128, 512);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [color]);
}

/** Star sparkle (4-point) for tiny dust accents. */
export function useStarSparkleTexture(color = "rgba(255,235,180,1)") {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    // Horizontal streak
    const gh = ctx.createLinearGradient(0, 64, 128, 64);
    gh.addColorStop(0, "rgba(255,255,255,0)");
    gh.addColorStop(0.5, color);
    gh.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gh;
    ctx.fillRect(0, 60, 128, 8);
    // Vertical streak
    const gv = ctx.createLinearGradient(64, 0, 64, 128);
    gv.addColorStop(0, "rgba(255,255,255,0)");
    gv.addColorStop(0.5, color);
    gv.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gv;
    ctx.fillRect(60, 0, 8, 128);
    // Bright core
    const gc = ctx.createRadialGradient(64, 64, 0, 64, 64, 18);
    gc.addColorStop(0, "rgba(255,255,255,1)");
    gc.addColorStop(0.4, color);
    gc.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gc;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [color]);
}
