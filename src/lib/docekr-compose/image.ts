import { z } from "zod";

export type DockerImage = z.infer<typeof imageSchema>;

export const imageSchema = z.object({
  name: z.string(),
  tag: z.string().optional().default("latest"),
  digest: z.string().optional(),
});

export function parseDockerImage(image: string): DockerImage {
  const [name, tag, digest] = image.split(":");
  return {
    name: name!,
    tag: tag ?? "latest",
    digest,
  };
}

export function toDockerImage(image: DockerImage): string {
  let result = image.name;
  if (image.tag) {
    result += ":" + image.tag;
  }
  if (image.digest) {
    result += "@" + image.digest;
  }
  return result;
}
