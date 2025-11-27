import { supabase } from '@/integrations/supabase/client';

export interface EdgeFunctionHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

const EDGE_FUNCTIONS = [
  'ai-chat',
  'verify-admin-access',
  'send-push-notification',
  'challenge-validation',
  'bulk-translate',
];

class EdgeFunctionMonitor {
  private healthStatus: Map<string, EdgeFunctionHealth> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  async checkFunctionHealth(functionName: string): Promise<EdgeFunctionHealth> {
    const startTime = Date.now();
    
    try {
      // Make a lightweight health check call
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { healthCheck: true },
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          name: functionName,
          status: 'down',
          responseTime,
          lastChecked: new Date(),
          error: error.message,
        };
      }

      // Determine status based on response time
      const status = responseTime > 5000 ? 'degraded' : 'healthy';

      return {
        name: functionName,
        status,
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: functionName,
        status: 'down',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkAllFunctions(): Promise<EdgeFunctionHealth[]> {
    const results = await Promise.all(
      EDGE_FUNCTIONS.map(fn => this.checkFunctionHealth(fn))
    );

    // Update internal status
    results.forEach(result => {
      this.healthStatus.set(result.name, result);
    });

    return results;
  }

  getHealthStatus(functionName: string): EdgeFunctionHealth | undefined {
    return this.healthStatus.get(functionName);
  }

  getAllHealthStatus(): EdgeFunctionHealth[] {
    return Array.from(this.healthStatus.values());
  }

  startMonitoring(intervalMinutes: number = 5) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Initial check
    this.checkAllFunctions();

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAllFunctions();
    }, intervalMinutes * 60 * 1000);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const edgeFunctionMonitor = new EdgeFunctionMonitor();
