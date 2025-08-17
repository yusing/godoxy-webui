import { type DockerComposeNetwork } from "./network";
import { type DockerComposeService } from "./service";
import { type DockerComposeVolume } from "./volume";

export type DockerCompose = {
  services: Record<string, DockerComposeService>;
  networks: Record<string, DockerComposeNetwork>;
  volumes: Record<string, DockerComposeVolume>;
  [key: string]: unknown;
};
