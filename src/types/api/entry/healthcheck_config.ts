export interface HealthCheckConfig {
  disable: boolean | undefined;
  path: string | undefined;
  use_get: boolean | undefined;
  interval: number;
  timeout: number;
}
