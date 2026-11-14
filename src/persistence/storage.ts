
import type { StateStorage } from "zustand/middleware";

const memory = new Map<string, string>();

export const memoryStorage: StateStorage = {
  getItem: (key) => memory.get(key) ?? null,

  setItem: (key, value) => {
    memory.set(key, value);
  },

  removeItem: (key) => {
    memory.delete(key);
  }
};

export const browserStorage: StateStorage = {
  getItem: (key) => {
    if (typeof window === "undefined") {
      return memoryStorage.getItem(key);
    }

    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStorage.getItem(key);
    }
  },

  setItem: (key, value) => {
    if (typeof window === "undefined") {
      memoryStorage.setItem(key, value);
      return;
    }

    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryStorage.setItem(key, value);
    }
  },

  removeItem: (key) => {
    if (typeof window === "undefined") {
      memoryStorage.removeItem(key);
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch {
      memoryStorage.removeItem(key);
    }
  }
};
