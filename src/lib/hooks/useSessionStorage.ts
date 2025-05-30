import { useState, useEffect } from 'react';
import { sessionStorage, isStorageAvailable } from '@/lib/utils/safeStorage';

export function useSessionStorage<T>(key: string, initialValue: T) {
  // Check if sessionStorage is available
  const storageAvailable = isStorageAvailable('sessionStorage');
  
  // Initialize state
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!storageAvailable) return initialValue;
    
    return sessionStorage.get<T>(key, initialValue);
  });

  // Update sessionStorage when state changes
  useEffect(() => {
    if (!storageAvailable) return;
    
    sessionStorage.set(key, storedValue);
  }, [key, storedValue, storageAvailable]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to sessionStorage
      if (storageAvailable) {
        sessionStorage.set(key, valueToStore);
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}