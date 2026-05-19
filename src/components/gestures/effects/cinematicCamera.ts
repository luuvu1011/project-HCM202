"use client";

import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { heartbeat } from "@/components/gestures/effects/sharedEnergyCore";

/* ─────────────────────────────────────────────────────────────────────────────
 * Cinematic camera choreographer for the 4 gesture effects.
 *
 * Each "script" is a directed GSAP timeline that mutates target position,
 * lookAt point and FOV over time. useFrame layers continuous parallax drift
 * and shake on top, then applies a final lookAt() each frame.
 *
 * Personalities:
 *   heart-reveal — dolly-in then punch-in then pull-back (heart → flag reveal)
 *   nova-impact  — collapse, recoil shake + FOV punch, slow widen
 *   anthem-hero  — close on star → crane low-hero → upward orbit (national flag)
 *   energy-rise  — low base → crane up the pillar → settle high looking down
 *
 * All scripts ease slow & dignified (sine/power2) — patriotic, not snappy.
 * ────────────────────────────────────────────────────────────────────────── */

export type CameraScript =
  | "heart-reveal"
  | "nova-impact"
  | "anthem-hero"
  | "energy-rise";

interface Pose {
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}

interface ShakeState {
  x: number;
  y: number;
  z: number;
  rotZ: number;
}

interface FovState {
  fov: number;
}

interface ScriptConfig {
  start: Pose;
  idle: Pose;
  build: (
    tl: gsap.core.Timeline,
    targetPos: THREE.Vector3,
    targetLook: THREE.Vector3,
    fovState: FovState,
    shake: ShakeState,
  ) => void;
}

/* ─── Impact punch (camera kicks, then settles via elastic) ──────────────── */
function punchShake(
  tl: gsap.core.Timeline,
  shake: ShakeState,
  at: number,
  strength = 0.06,
) {
  // Deterministic per-call random so each script feels slightly different
  const rx = (Math.random() - 0.5) * 2;
  const ry = (Math.random() - 0.5) * 2;
  const rr = (Math.random() - 0.5) * 2;
  tl.to(
    shake,
    {
      x: rx * strength,
      y: ry * strength,
      z: -strength * 0.55,
      rotZ: rr * strength * 0.35,
      duration: 0.07,
      ease: "power2.out",
    },
    at,
  ).to(shake, {
    x: 0,
    y: 0,
    z: 0,
    rotZ: 0,
    duration: 0.5,
    ease: "elastic.out(1, 0.45)",
  });
}

/* ─── FOV vertigo punch (snap-in, snap-back) ─────────────────────────────── */
function fovPunch(
  tl: gsap.core.Timeline,
  fovState: FovState,
  at: number,
  delta = -4,
) {
  const base = fovState.fov;
  tl.to(
    fovState,
    {
      fov: base + delta,
      duration: 0.18,
      ease: "power3.out",
    },
    at,
  ).to(fovState, {
    fov: base,
    duration: 0.65,
    ease: "power2.inOut",
  });
}

const SCRIPTS: Record<CameraScript, ScriptConfig> = {
  /* HEART → FLAG: convergence reveal, impact punch at heart-formed, slow orbit */
  "heart-reveal": {
    start: { pos: [0, 0.3, 6.4], look: [0, 0, 0], fov: 48 },
    idle: { pos: [0, 0, 4.6], look: [0, 0, 0], fov: 45 },
    build: (tl, pos, look, fovState, shake) => {
      tl.to(
        pos,
        { x: 0, y: 0.05, z: 4.4, duration: 0.78, ease: "power3.out" },
        0,
      )
        .to(
          fovState,
          { fov: 45, duration: 0.78, ease: "power3.out" },
          0,
        )
        .to(
          pos,
          { z: 3.95, duration: 0.22, ease: "power2.in" },
          0.78,
        )
        .to(
          pos,
          { x: 0.35, y: 0.0, z: 4.5, duration: 0.7, ease: "sine.inOut" },
          1.0,
        )
        .to(
          pos,
          { x: -0.25, y: 0.12, z: 4.6, duration: 1.4, ease: "sine.inOut" },
          1.7,
        )
        .to(
          look,
          { x: 0, y: 0.05, z: 0, duration: 2.0, ease: "sine.inOut" },
          0.78,
        );
      // Heart-formed punch at ~0.78s
      punchShake(tl, shake, 0.82, 0.07);
      fovPunch(tl, fovState, 0.82, -5);
    },
  },

  /* NOVA: vortex collapse → ignition recoil + FOV punch → widen */
  "nova-impact": {
    start: { pos: [0, 0, 5.4], look: [0, 0, 0], fov: 54 },
    idle: { pos: [0, 0, 4.7], look: [0, 0, 0], fov: 50 },
    build: (tl, pos, look, fovState, shake) => {
      tl.to(
        pos,
        { z: 4.0, duration: 0.55, ease: "power3.in" },
        0,
      )
        .to(
          fovState,
          { fov: 48, duration: 0.55, ease: "power3.in" },
          0,
        )
        .to(
          pos,
          { z: 4.95, x: 0.18, y: 0.05, duration: 0.3, ease: "power2.out" },
          0.55,
        )
        .to(
          pos,
          { x: -0.4, y: 0.18, z: 5.15, duration: 1.4, ease: "sine.inOut" },
          0.9,
        )
        .to(
          pos,
          { x: 0.3, y: -0.05, z: 4.95, duration: 1.2, ease: "sine.inOut" },
          2.3,
        )
        .to(
          fovState,
          { fov: 51, duration: 2.0, ease: "sine.inOut" },
          0.85,
        );
      // Ignition impact at the vortex collapse point (~0.55s)
      punchShake(tl, shake, 0.55, 0.11);
      fovPunch(tl, fovState, 0.55, -7);
      // Secondary subtle aftershock
      punchShake(tl, shake, 0.95, 0.04);
    },
  },

  /* FLAG ANTHEM: tight on star → crane back to low-hero angle → upward orbit */
  "anthem-hero": {
    start: { pos: [0.55, 0.15, 3.0], look: [0.55, 0.15, 0], fov: 42 },
    idle: { pos: [0.2, -0.15, 4.6], look: [0.15, 0.05, 0], fov: 50 },
    build: (tl, pos, look, fovState, _shake) => {
      tl.to(
        pos,
        { x: 0.6, y: 0.15, z: 3.0, duration: 0.6, ease: "power2.out" },
        0,
      )
        .to(
          fovState,
          { fov: 44, duration: 0.6, ease: "power2.out" },
          0,
        )
        // Crane back and down — flag fully revealed from below (hero shot)
        .to(
          pos,
          { x: -0.4, y: -0.32, z: 4.9, duration: 1.15, ease: "power2.inOut" },
          0.65,
        )
        .to(
          look,
          { x: 0.1, y: 0.18, z: 0, duration: 1.15, ease: "sine.inOut" },
          0.65,
        )
        .to(
          fovState,
          { fov: 52, duration: 1.15, ease: "power2.inOut" },
          0.65,
        )
        // Slow dignified rightward arc, gaze drifts to star
        .to(
          pos,
          { x: 0.55, y: -0.12, z: 4.7, duration: 1.4, ease: "sine.inOut" },
          1.8,
        )
        .to(
          look,
          { x: 0.25, y: 0.06, z: 0, duration: 1.4, ease: "sine.inOut" },
          1.8,
        );
    },
  },

  /* ENERGY RISE: low looking up → crane up the pillar → settle high */
  "energy-rise": {
    start: { pos: [0, -1.45, 3.5], look: [0, -1.0, 0], fov: 52 },
    idle: { pos: [0, 0.3, 4.7], look: [0, 0, 0], fov: 48 },
    build: (tl, pos, look, fovState, shake) => {
      tl.to(
        pos,
        { x: 0, y: -0.4, z: 4.2, duration: 0.7, ease: "power2.out" },
        0,
      )
        .to(
          look,
          { x: 0, y: -0.18, z: 0, duration: 0.7, ease: "sine.inOut" },
          0,
        )
        .to(
          fovState,
          { fov: 50, duration: 0.7, ease: "power2.out" },
          0,
        )
        // Crane up — camera rises with the pillar
        .to(
          pos,
          { y: 0.5, z: 4.85, duration: 1.05, ease: "power2.inOut" },
          0.72,
        )
        .to(
          look,
          { y: 0.08, duration: 1.05, ease: "sine.inOut" },
          0.72,
        )
        .to(
          fovState,
          { fov: 47, duration: 1.05, ease: "power2.inOut" },
          0.72,
        )
        // Settle: drift right + tilt for victory framing
        .to(
          pos,
          { x: 0.45, y: 0.28, z: 4.9, duration: 1.4, ease: "sine.inOut" },
          1.8,
        )
        .to(
          look,
          { x: 0.05, y: 0.02, z: 0, duration: 1.4, ease: "sine.inOut" },
          1.8,
        );
      // Punch when pillar ignites (~0.72s)
      punchShake(tl, shake, 0.72, 0.05);
      fovPunch(tl, fovState, 0.72, -3);
    },
  },
};

/* ─── Hook: apply a script to the active R3F camera ──────────────────────── */
function useCinematicCamera(script: CameraScript, reduced: boolean) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const fovState = useRef<FovState>({ fov: 50 });
  const shakeRef = useRef<ShakeState>({ x: 0, y: 0, z: 0, rotZ: 0 });

  useEffect(() => {
    const cfg = SCRIPTS[script];
    const seed = reduced ? cfg.idle : cfg.start;
    targetPos.current.set(seed.pos[0], seed.pos[1], seed.pos[2]);
    targetLook.current.set(seed.look[0], seed.look[1], seed.look[2]);
    fovState.current.fov = seed.fov;
    shakeRef.current.x = 0;
    shakeRef.current.y = 0;
    shakeRef.current.z = 0;
    shakeRef.current.rotZ = 0;

    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.position.copy(targetPos.current);
    camera.fov = seed.fov;
    camera.updateProjectionMatrix();
    camera.lookAt(targetLook.current);

    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      SCRIPTS[script].build(
        tl,
        targetPos.current,
        targetLook.current,
        fovState.current,
        shakeRef.current,
      );
    });
    return () => ctx.revert();
  }, [script, reduced, camera]);

  useFrame((state) => {
    const cam = state.camera;
    if (!(cam instanceof THREE.PerspectiveCamera)) return;
    const t = state.clock.elapsedTime;

    // Subtle continuous parallax drift on top of choreographed pose
    const driftX = reduced ? 0 : Math.sin(t * 0.22) * 0.055;
    const driftY = reduced ? 0 : Math.cos(t * 0.17) * 0.04;

    // Camera "breathes" with the heartbeat — pushes in slightly on each beat
    const beat = reduced ? 0 : heartbeat(t, 78);
    const beatPush = beat * -0.05;

    cam.position.x = targetPos.current.x + driftX + shakeRef.current.x;
    cam.position.y = targetPos.current.y + driftY + shakeRef.current.y;
    cam.position.z = targetPos.current.z + shakeRef.current.z + beatPush;
    cam.lookAt(targetLook.current);
    cam.rotation.z += shakeRef.current.rotZ;

    // Add micro-FOV pulse from heartbeat (1° on each beat)
    const beatFov = beat * -0.9;
    const targetFov = fovState.current.fov + beatFov;
    if (Math.abs(cam.fov - targetFov) > 0.01) {
      cam.fov = targetFov;
      cam.updateProjectionMatrix();
    }
  });
}

/* ─── Component wrapper (drop-in replacement for old CameraDrift) ────────── */
export function CinematicCamera({
  script,
  reduced,
}: {
  script: CameraScript;
  reduced: boolean;
}) {
  useCinematicCamera(script, reduced);
  return null;
}
