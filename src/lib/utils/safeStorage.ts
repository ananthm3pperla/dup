/**
 * Safe Storage Utility
 * 
 * This utility provides a safer way to interact with browser storage (localStorage and sessionStorage)
 * with proper error handling and type safety.
 */

// Type-safe storage operations
export function getItemSafe<T>(
  storage: Storage, 
  key: string, 
  defaultValue: T
): T {
  try {
    const item = storage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error retrieving ${key} from storage:`, error);
    return defaultValue;
  }
}

export function setItemSafe(
  storage: Storage, 
  key: string, 
  value: unknown
): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
    return false;
  }
}

export function removeItemSafe(
  storage: Storage, 
  key: string
): boolean {
  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
    return false;
  }
}

// LocalStorage wrappers
export const localStorage = {
  get: <T>(key: string, defaultValue: T): T => 
    getItemSafe<T>(window.localStorage, key, defaultValue),
  
  set: (key: string, value: unknown): boolean =>
    setItemSafe(window.localStorage, key, value),
  
  remove: (key: string): boolean =>
    removeItemSafe(window.localStorage, key),
    
  clear: (): boolean => {
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// SessionStorage wrappers
export const sessionStorage = {
  get: <T>(key: string, defaultValue: T): T =>
    getItemSafe<T>(window.sessionStorage, key, defaultValue),
  
  set: (key: string, value: unknown): boolean =>
    setItemSafe(window.sessionStorage, key, value),
  
  remove: (key: string): boolean =>
    removeItemSafe(window.sessionStorage, key),
    
  clear: (): boolean => {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  }
};

// Check if storage is available
export function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}