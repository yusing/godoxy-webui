import { z } from "zod";

// export type DockerComposePort = {
//   ip?: string;
//   host: number;
//   // hostEnd?: number;
//   container?: number;
//   // containerEnd?: number;
//   protocol?: string;
// };

export type DockerComposePort = z.infer<typeof portSchema>;

export const portSchema = z.object({
  ip: z
    .string()
    .regex(/^(?:(?:\d+:){3}\d+)|(\[[0-9a-fA-F:]+\])$/)
    .optional(),
  host: z
    .number()
    .min(0)
    .max(65535)
    .or(z.string().regex(/^\d+-\d+$/)),
  container: z
    .number()
    .min(0)
    .max(65535)
    .or(z.string().regex(/^\d+-\d+$/))
    .optional(),
  protocol: z.enum(["tcp", "udp"]).optional(),
});

// FIXME: this won't work for ipv6
export function parseDockerComposePort(port: string): DockerComposePort {
  const [ip, host, containerAndProtocol] = port.split(":");
  const [container, protocol] =
    (ip && host ? containerAndProtocol : host)?.split("/") ?? []; // if ip is not provided, the second part must be container [range]
  return {
    ip,
    host: host ? parseInt(host) : 0,
    container: container ? parseInt(container) : undefined,
    protocol:
      protocol === "tcp" ? "tcp" : protocol === "udp" ? "udp" : undefined,
  };
}

// export function parseDockerComposePort(port: string): DockerComposePort {
//   const [ip, hostRange, containerRangeAndProtocol] = port.split(":");
//   const [containerRange, protocol] =
//     (ip && hostRange ? containerRangeAndProtocol : hostRange)?.split("/") ?? []; // if ip is not provided, the second part must be container [range]
//   const [containerStart, containerEnd] = containerRange?.split("-") ?? [];
//   const [hostStart, hostEnd] = (ip ? hostRange : ip)?.split("-") ?? []; // if ip is not provided, the first part must be host [range]
//   return {
//     ip: ip && hostRange && containerRangeAndProtocol ? ip : undefined,
//     host: hostStart ? parseInt(hostStart) : 0,
//     hostEnd: hostEnd ? parseInt(hostEnd) : undefined,
//     container: containerStart ? parseInt(containerStart) : undefined,
//     containerEnd: containerEnd ? parseInt(containerEnd) : undefined,
//     protocol,
//   };
// }

export function toDockerComposePort(port: DockerComposePort): string {
  let result = "";
  if (port.ip) {
    result += `${port.ip}:`;
  }
  result += `${port.host}`;
  // if (port.hostEnd) {
  //   result += `-${port.hostEnd}`;
  // }
  if (port.container) {
    result += `:${port.container}`;
    // if (port.containerEnd) {
    //   result += `-${port.containerEnd}`;
    // }
  }
  if (port.protocol) {
    result += `/${port.protocol}`;
  }
  return result;
}
