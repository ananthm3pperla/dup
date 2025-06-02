
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
    config: { variables: {} },
    versions: { 
      node: '18.0.0',
      modules: '108',
      uv: '1.44.2'
    },
    nextTick: (fn: () => void) => setTimeout(fn, 0),
    execPath: '/usr/bin/node',
  };
  
  window.global = window.global || window;
}

// Prevent bcrypt and other Node.js modules from being imported in browser
if (typeof window !== 'undefined') {
  const preventServerModules = (moduleName: string) => {
    throw new Error(`Module "${moduleName}" is not available in browser environment. Use server-side API calls instead.`);
  };

  // Override require for browser environment
  if (typeof window.require === 'undefined') {
    window.require = (moduleName: string) => {
      if (['bcrypt', 'fs', 'path', 'os', 'crypto', 'node-gyp-build'].includes(moduleName)) {
        preventServerModules(moduleName);
      }
      throw new Error(`Module "${moduleName}" not found in browser environment`);
    };
  }
}

export {};
