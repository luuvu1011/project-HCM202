/**
 * Lightweight pub/sub for immersive pin state.
 * VoyagePortSequence and WatershedMoment call these when GSAP pins/unpins.
 * SiteHeader listens to fade out during full-screen pinned scenes.
 */

export function signalImmersiveEnter(id: string) {
  window.dispatchEvent(
    new CustomEvent("voyage:immersive", { detail: { id, enter: true } }),
  );
}

export function signalImmersiveLeave(id: string) {
  window.dispatchEvent(
    new CustomEvent("voyage:immersive", { detail: { id, enter: false } }),
  );
}
