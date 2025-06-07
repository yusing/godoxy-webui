import z from "zod";

export type DockerComposeNetwork = z.infer<typeof networkSchema>;

export const networkSchema = z.object({
  name: z.string().optional(),
  driver: z.string().optional(),
  external: z.boolean().optional(),
  labels: z.record(z.string(), z.string()).optional(),
});
