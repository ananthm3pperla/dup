
interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  auth: {
    sessionTimeout: number;
    refreshThreshold: number;
  };
  features: {
    enableAnalytics: boolean;
    enablePushNotifications: boolean;
    enableFileUpload: boolean;
    maxFileSize: number;
  };
  ui: {
    itemsPerPage: number;
    animationDuration: number;
    debounceDelay: number;
  };
  performance: {
    enableMonitoring: boolean;
    maxMetrics: number;
    slowThreshold: number;
  };
}

/**
 * Centralized configuration management
 */
class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AppConfig {
    const defaultConfig: AppConfig = {
      api: {
        baseUrl: '/api',
        timeout: 30000,
        retryAttempts: 3,
      },
      auth: {
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        refreshThreshold: 5 * 60 * 1000, // 5 minutes
      },
      features: {
        enableAnalytics: import.meta.env.PROD,
        enablePushNotifications: 'Notification' in window,
        enableFileUpload: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
      },
      ui: {
        itemsPerPage: 10,
        animationDuration: 200,
        debounceDelay: 300,
      },
      performance: {
        enableMonitoring: import.meta.env.DEV,
        maxMetrics: 500,
        slowThreshold: 1000,
      },
    };

    // Override with environment variables if available
    return {
      ...defaultConfig,
      api: {
        ...defaultConfig.api,
        baseUrl: import.meta.env.VITE_API_BASE_URL || defaultConfig.api.baseUrl,
        timeout: Number(import.meta.env.VITE_API_TIMEOUT) || defaultConfig.api.timeout,
      },
      features: {
        ...defaultConfig.features,
        enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || defaultConfig.features.enableAnalytics,
        maxFileSize: Number(import.meta.env.VITE_MAX_FILE_SIZE) || defaultConfig.features.maxFileSize,
      },
    };
  }

  get<K extends keyof AppConfig>(section: K): AppConfig[K] {
    return this.config[section];
  }

  getValue<K extends keyof AppConfig, T extends keyof AppConfig[K]>(
    section: K,
    key: T
  ): AppConfig[K][T] {
    return this.config[section][key];
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  isProduction(): boolean {
    return import.meta.env.PROD;
  }

  getEnvironment(): string {
    return import.meta.env.MODE;
  }
}

export const config = ConfigManager.getInstance();

// Convenience exports
export const apiConfig = config.get('api');
export const authConfig = config.get('auth');
export const featureFlags = config.get('features');
export const uiConfig = config.get('ui');
export const performanceConfig = config.get('performance');
