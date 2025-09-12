import { InteractionManager, Platform } from 'react-native';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface MemoryInfo {
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = __DEV__; // Only enable in development by default

  constructor() {
    this.setupGlobalErrorHandler();
  }

  private setupGlobalErrorHandler() {
    if (!this.isEnabled) return;

    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.logError('Console Error', args.join(' '));
      originalConsoleError.apply(console, args);
    };
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  startTiming(name: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata,
    };

    this.metrics.set(name, metric);
  }

  endTiming(name: string, additionalMetadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    this.logMetric(metric);
    return duration;
  }

  measureAsync<T>(name: string, asyncFn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    if (!this.isEnabled) return asyncFn();

    this.startTiming(name, metadata);
    
    return asyncFn()
      .then((result) => {
        this.endTiming(name, { success: true });
        return result;
      })
      .catch((error) => {
        this.endTiming(name, { success: false, error: error.message });
        throw error;
      });
  }

  measureSync<T>(name: string, syncFn: () => T, metadata?: Record<string, any>): T {
    if (!this.isEnabled) return syncFn();

    this.startTiming(name, metadata);
    
    try {
      const result = syncFn();
      this.endTiming(name, { success: true });
      return result;
    } catch (error) {
      this.endTiming(name, { success: false, error: (error as Error).message });
      throw error;
    }
  }

  measureComponentRender(componentName: string, renderFn: () => React.ReactElement) {
    return this.measureSync(`${componentName}_render`, renderFn, {
      type: 'component_render',
      component: componentName,
    });
  }

  measureNavigation(screenName: string, navigationFn: () => void) {
    this.measureSync(`navigation_to_${screenName}`, navigationFn, {
      type: 'navigation',
      screen: screenName,
    });
  }

  measureAPICall(endpoint: string, method: string, apiCall: () => Promise<any>) {
    return this.measureAsync(`api_${method}_${endpoint}`, apiCall, {
      type: 'api_call',
      endpoint,
      method,
    });
  }

  measureImageLoad(imageUrl: string, loadFn: () => Promise<any>) {
    return this.measureAsync(`image_load`, loadFn, {
      type: 'image_load',
      url: imageUrl,
    });
  }

  logError(context: string, error: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    console.error(`[Performance Error] ${context}:`, error, metadata);
  }

  logWarning(context: string, message: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    console.warn(`[Performance Warning] ${context}:`, message, metadata);
  }

  private logMetric(metric: PerformanceMetric) {
    const { name, duration, metadata } = metric;
    
    let logLevel = 'log';
    let message = `[Performance] ${name}: ${duration}ms`;

    // Determine log level based on duration
    if (duration! > 1000) {
      logLevel = 'error';
      message = `🔴 ${message} (SLOW!)`;
    } else if (duration! > 500) {
      logLevel = 'warn';
      message = `🟡 ${message} (Slow)`;
    } else if (duration! > 100) {
      message = `🟠 ${message}`;
    } else {
      message = `🟢 ${message}`;
    }

    (console as any)[logLevel](message, metadata);
  }

  getMemoryInfo(): MemoryInfo {
    if (Platform.OS === 'web' && (performance as any).memory) {
      return (performance as any).memory;
    }
    
    // For React Native, we can't get detailed memory info
    // but we can provide some basic information
    return {
      jsHeapSizeLimit: undefined,
      totalJSHeapSize: undefined,
      usedJSHeapSize: undefined,
    };
  }

  logMemoryUsage(context: string) {
    if (!this.isEnabled) return;

    const memInfo = this.getMemoryInfo();
    console.log(`[Memory] ${context}:`, memInfo);
  }

  measureInteractionComplete(name: string, interactionFn: () => void) {
    if (!this.isEnabled) {
      interactionFn();
      return;
    }

    this.startTiming(`interaction_${name}`);
    
    const handle = InteractionManager.createInteractionHandle();
    
    try {
      interactionFn();
    } finally {
      InteractionManager.clearInteractionHandle(handle);
      this.endTiming(`interaction_${name}`, {
        type: 'interaction',
        name,
      });
    }
  }

  runAfterInteractions(name: string, callback: () => void) {
    if (!this.isEnabled) {
      InteractionManager.runAfterInteractions(callback);
      return;
    }

    this.startTiming(`after_interactions_${name}`);
    
    InteractionManager.runAfterInteractions(() => {
      try {
        callback();
      } finally {
        this.endTiming(`after_interactions_${name}`, {
          type: 'after_interactions',
          name,
        });
      }
    });
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(metric => metric.duration !== undefined);
  }

  getMetricsByType(type: string): PerformanceMetric[] {
    return this.getAllMetrics().filter(metric => metric.metadata?.type === type);
  }

  clearMetrics() {
    this.metrics.clear();
  }

  generateReport(): string {
    const metrics = this.getAllMetrics();
    
    if (metrics.length === 0) {
      return 'No performance metrics recorded.';
    }

    const report = ['Performance Report', '='.repeat(50)];
    
    // Group by type
    const metricsByType = metrics.reduce((acc, metric) => {
      const type = metric.metadata?.type || 'general';
      if (!acc[type]) acc[type] = [];
      acc[type].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    Object.entries(metricsByType).forEach(([type, typeMetrics]) => {
      report.push(`\n${type.toUpperCase()}:`);
      
      typeMetrics
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .forEach(metric => {
          report.push(`  ${metric.name}: ${metric.duration}ms`);
        });
    });

    return report.join('\n');
  }
}

export default new PerformanceMonitor();
