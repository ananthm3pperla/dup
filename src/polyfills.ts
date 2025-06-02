
// Browser polyfills for Node.js globals
declare global {
  interface Window {
    process: any;
    global: any;
  }
}

// Polyfill for process
if (typeof window !== 'undefined') {
  window.process = window.process || {
    env: {},
    browser: true,
    version: 'v18.0.0',
    platform: 'browser',
    nextTick: (fn: () => void) => setTimeout(fn, 0),
  };
  
  window.global = window.global || window;
}

export {};
