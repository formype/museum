"use client";

import { SPACES_DATA, SpaceData } from "@/data/spaces";
import { MUSEUM_ROOMS, MuseumRoom } from "@/data/museum-spaces";
import { INITIAL_MUSEUMS, MuseumSite } from "@/data/museums-directory";

const STORAGE_KEY_SPACES = "solar_tour_spaces_v2";
const STORAGE_KEY_MUSEUMS_DIR = "solar_tour_museums_dir_v2";

export function getStoredSpaces(): Record<string, SpaceData> {
  if (typeof window === "undefined") return SPACES_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPACES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Object.keys(parsed).length > 0) return parsed;
    }
  } catch (err) {
    console.error("Failed to load spaces from localStorage:", err);
  }
  return SPACES_DATA;
}

export function saveStoredSpaces(data: Record<string, SpaceData>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save spaces to localStorage:", err);
  }
}

export function getStoredMuseumSites(): Record<string, MuseumSite> {
  if (typeof window === "undefined") return INITIAL_MUSEUMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MUSEUMS_DIR);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Object.keys(parsed).length > 0) return parsed;
    }
  } catch (err) {
    console.error("Failed to load museums directory from localStorage:", err);
  }
  return INITIAL_MUSEUMS;
}

export function saveStoredMuseumSites(data: Record<string, MuseumSite>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_MUSEUMS_DIR, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save museums directory to localStorage:", err);
  }
}

export function resetAllStorageDefaults() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_SPACES);
  localStorage.removeItem(STORAGE_KEY_MUSEUMS_DIR);
}
