export type DockerComposeVolume = {
  name: string;
  driver: string;
  driver_opts: Record<string, string>;
  external: boolean;
  labels: Record<string, string>;
  options: Record<string, string>;
  scope: string;
};
