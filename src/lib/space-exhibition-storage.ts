"use client";

import { DEFAULT_SPACE_ROOMS, SpaceRoom, SpaceTopic } from "@/data/space-exhibition";

const STORAGE_KEY_EXHIBITION = "solar_museum_space_exhibition_v3";

export function getStoredSpaceRooms(): SpaceRoom[] {
  if (typeof window === "undefined") return DEFAULT_SPACE_ROOMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXHIBITION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to load space exhibition from localStorage:", err);
  }
  return DEFAULT_SPACE_ROOMS;
}

export function saveStoredSpaceRooms(rooms: SpaceRoom[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_EXHIBITION, JSON.stringify(rooms));
  } catch (err) {
    console.error("Failed to save space exhibition to localStorage:", err);
  }
}

export function resetStoredSpaceRooms(): SpaceRoom[] {
  if (typeof window === "undefined") return DEFAULT_SPACE_ROOMS;
  try {
    localStorage.removeItem(STORAGE_KEY_EXHIBITION);
  } catch (err) {
    console.error("Failed to reset space exhibition storage:", err);
  }
  return DEFAULT_SPACE_ROOMS;
}
