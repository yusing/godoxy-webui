import { Select, SelectRootProps } from "@chakra-ui/react";

import { Fieldset } from "@chakra-ui/react";

import { restartPolicyCollection } from "@/lib/docker-compose/service";

export default function RestartPolicyField({
  ...props
}: Omit<SelectRootProps, "collection" | "defaultValue">) {
  return (
    <Fieldset.Root>
      <Fieldset.Legend>Restart Policy</Fieldset.Legend>
      <Fieldset.Content>
        <Select.Root
          collection={restartPolicyCollection}
          defaultValue={["no"]}
          {...props}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Select.Content>
            {restartPolicyCollection.items.map((item) => (
              <Select.Item key={item.value} item={item}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Fieldset.Content>
    </Fieldset.Root>
  );
}
