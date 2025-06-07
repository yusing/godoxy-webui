import {
  parseLabels,
  processStringKVs,
  toLabels,
} from "@/lib/docker-compose/labels";
import { type Routes } from "@/types/godoxy";
import { createListCollection } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import split from "split-string"; // split with quoted strings support
import { z } from "zod";
import { imageSchema, parseDockerImage, toDockerImage } from "./image";
import {
  parseDockerComposePort,
  portSchema,
  toDockerComposePort,
} from "./port";

const restartPolicyMap: Record<string, string> = {
  no: "No",
  always: "Always",
  "on-failure": "On Failure",
  "unless-stopped": "Unless Stopped",
} as const;

export const restartPolicyCollection = createListCollection({
  items: Object.entries(restartPolicyMap).map(([key, value]) => ({
    value: key,
    label: value,
  })),
});

export type RestartPolicy = DockerComposeServiceGoDoxy["restart"];

// export type DockerComposeServiceGoDoxy = {
//   cap_add?: string[];
//   cap_drop?: string[];
//   command?: string[];
//   container_name?: string;
//   image?: DockerImage;
//   ports?: DockerComposePort[];
//   expose?: string[];
//   environment?: Record<string, string>;
//   env_file?: string[];
//   volumes?: string[];
//   network_mode?: string;
//   networks?: string[];
//   labels?: Record<string, string>;
//   shm_size?: string;
//   restart?: RestartPolicy;
//   routes?: Record<string, Routes.Route>;
//   errors?: LabelError[];
// };
export type DockerComposeServiceGoDoxy = z.infer<typeof serviceGoDoxySchema>;

export type DockerComposeService = {
  cap_add?: string[];
  cap_drop?: string[];
  command?: string[] | string;
  container_name?: string;
  depends_on?: string[];
  image?: string;
  ports?: string[];
  expose?: string[];
  environment?: Record<string, string> | string[];
  env_file?: string[] | string;
  volumes?: string[];
  network_mode?: string;
  networks?: string[];
  labels?: Record<string, string> | string[];
  shm_size?: string;
  restart?: string;
};

export const serviceGoDoxySchema = z.object({
  cap_add: z.array(z.string()).optional(),
  cap_drop: z.array(z.string()).optional(),
  command: z.array(z.string()).optional(),
  container_name: z.string().optional(),
  depends_on: z.array(z.string()).optional(),
  image: imageSchema.optional(),
  ports: z.array(portSchema).optional(),
  expose: z.array(z.string()).optional(),
  environment: z.record(z.string(), z.string()).optional(),
  env_file: z.array(z.string()).optional(),
  volumes: z.array(z.string()).optional(),
  network_mode: z.string().optional(),
  networks: z.array(z.string()).optional(),
  labels: z.record(z.string(), z.string()).optional(),
  shm_size: z.string().optional(),
  restart: z.enum(["no", "always", "on-failure", "unless-stopped"]).optional(),
  routes: z.record(z.string(), z.any()).optional(), // TODO: add routes schema
  errors: z.array(z.string()).optional(),
});

export const serviceGoDoxySchemaResolver = zodResolver(serviceGoDoxySchema);

export function preprocessService(
  service: DockerComposeService,
): DockerComposeServiceGoDoxy {
  const [routes, labels, errors] = parseLabels(
    processStringKVs(service.labels ?? {}),
  );
  return {
    cap_add: service.cap_add,
    cap_drop: service.cap_drop,
    command: service.command
      ? Array.isArray(service.command)
        ? service.command
        : split(service.command)
      : undefined,
    container_name: service.container_name,
    depends_on: service.depends_on,
    image: service.image ? parseDockerImage(service.image) : undefined,
    ports: service.ports
      ? service.ports.map(parseDockerComposePort)
      : undefined,
    expose: service.expose,
    environment: processStringKVs(service.environment ?? {}),
    env_file: service.env_file
      ? Array.isArray(service.env_file)
        ? service.env_file
        : [service.env_file]
      : undefined,
    volumes: service.volumes,
    network_mode: service.network_mode,
    networks: service.networks,
    labels: labels,
    shm_size: service.shm_size,
    restart:
      service.restart && restartPolicyMap[service.restart]
        ? (service.restart as RestartPolicy)
        : undefined,
    routes: routes as Record<string, Routes.Route>,
    errors: errors.map((e) => e.message),
  };
}

export function toDockerComposeService(
  service: DockerComposeServiceGoDoxy,
): DockerComposeService {
  return {
    cap_add: service.cap_add,
    cap_drop: service.cap_drop,
    command: service.command,
    container_name: service.container_name,
    depends_on: service.depends_on,
    image: service.image ? toDockerImage(service.image) : undefined,
    ports: service.ports ? service.ports.map(toDockerComposePort) : undefined,
    expose: service.expose,
    environment: service.environment,
    env_file: service.env_file,
    volumes: service.volumes,
    network_mode: service.network_mode,
    networks: service.networks,
    labels: { ...service.labels, ...toLabels(service.routes ?? {}) },
    shm_size: service.shm_size,
    restart:
      service.restart && restartPolicyMap[service.restart]
        ? service.restart
        : undefined,
  };
}
