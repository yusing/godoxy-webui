"use server";

import { JSONSchema } from "@/types/schema";

const dockerComposeSchemaURL =
  "https://raw.githubusercontent.com/compose-spec/compose-spec/refs/heads/main/schema/compose-spec.json";

export async function getDockerComposeSchema() {
  const response = await fetch(dockerComposeSchemaURL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch schema: ${response.statusText}: ${await response.text()}`,
    );
  }
  return (await response.json()) as JSONSchema;
}
