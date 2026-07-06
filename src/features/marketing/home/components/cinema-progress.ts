"use client";

export type CinemaSceneName = "hero" | "anatomy" | "how" | "faq" | "cta";

export interface CinemaProgressDetail {
  activeScene: CinemaSceneName;
  globalProgress: number;
  progressByScene: Record<CinemaSceneName, number>;
  reducedMotion: boolean;
}

export interface SceneProgressProps {
  cinematic?: boolean;
  interactive?: boolean;
  sceneName?: CinemaSceneName;
  progress?: number;
  globalProgress?: number;
  reducedMotion?: boolean;
  hoveredAgent?: string | null;
}

export const CINEMA_PROGRESS_EVENT = "marketing-cinema-progress";
export const MARKETING_INTERACTION_EVENT = "marketing-interaction-update";

export interface MarketingInteractionDetail {
  pointerX: number;
  pointerY: number;
  velocity: number;
  activeScene: CinemaSceneName;
  hoveredAgent: string | null;
  focusedControl: string | null;
  typingIntensity: number;
  interactionIntensity: number;
  reducedMotion: boolean;
}

export const CINEMA_SCENES: CinemaSceneName[] = ["hero", "anatomy", "how", "faq", "cta"];

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function getSceneProgress(globalProgress: number, sceneIndex: number, sceneCount = CINEMA_SCENES.length) {
  return clamp01(globalProgress * sceneCount - sceneIndex);
}
