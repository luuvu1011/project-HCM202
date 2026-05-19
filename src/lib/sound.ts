/**
 * Sound-ready architecture: central place to enqueue ambient/UI sounds later.
 * No audio files shipped yet — safe no-ops in SSR and before user gesture unlock.
 */

type SoundId =
  | "ambient_ocean"
  | "ui_soft_click"
  | "ui_success"
  | "ui_error";

const noop = () => {};

let unlocked = false;

export const sound = {
  unlock: () => {
    unlocked = true;
  },
  isUnlocked: () => unlocked,
  play: (id: SoundId, options?: { volume?: number }) => {
    void id;
    void options;
    if (!unlocked) return;
    // Future: AudioContext + buffers
    noop();
  },
  stop: (id: SoundId) => {
    void id;
    noop();
  },
};
