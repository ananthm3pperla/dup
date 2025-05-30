import { useState, useEffect } from 'react';
import { localStorage, isStorageAvailable } from '@/lib/utils/safeStorage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Check if localStorage is available
  const storageAvailable = isStorageAvailable('localStorage');
  
  // Initialize state
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!storageAvailable) return initialValue;
    
    return localStorage.get<T>(key, initialValue);
  });

  // Update localStorage when state changes
  useEffect(() => {
    if (!storageAvailable) return;
    
    localStorage.set(key, storedValue);
  }, [key, storedValue, storageAvailable]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (storageAvailable) {
        localStorage.set(key, valueToStore);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}