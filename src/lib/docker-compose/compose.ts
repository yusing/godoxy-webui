import { DockerComposeNetwork } from "./network";
import { DockerComposeService } from "./service";
import { DockerComposeVolume } from "./volume";

export type DockerCompose = {
  services: Record<string, DockerComposeService>;
  networks: Record<string, DockerComposeNetwork>;
  volumes: Record<string, DockerComposeVolume>;
  [key: string]: unknown;
};
