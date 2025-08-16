"use client";

import ServiceCard from "@/components/compose_editor/service_card";
import ComposeEditor, {
  demoCompose,
} from "@/components/compose_editor/yaml_editor";
import type { DockerCompose } from "@/lib/docker-compose/compose";
import { Box, Heading, HStack, Stack } from "@chakra-ui/react";
import { parse as parseYAML } from "yaml";

export default function ComposeEditorPage() {
  const compose = parseYAML(demoCompose) as DockerCompose;
  return (
    <HStack alignItems={"flex-start"}>
      {compose.services && (
        <Stack w="40%">
          <Heading>Services</Heading>
          <Stack>
            {Object.entries(compose.services).map(([serviceName, service]) => (
              <ServiceCard
                key={serviceName}
                services={compose.services}
                serviceName={serviceName}
                service={service}
                setService={() => {}}
                setServicePreview={() => {}}
                onDelete={() => {}}
              />
            ))}
          </Stack>
        </Stack>
      )}
      <Box w="60%">
        <ComposeEditor />
      </Box>
    </HStack>
  );
}
