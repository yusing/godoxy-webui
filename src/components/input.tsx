import {
  Box,
  createListCollection,
  Fieldset,
  For,
  Group,
  IconButton,
  Input,
  InputProps,
  ListCollection,
  Stack,
} from "@chakra-ui/react";
import { Plus, Trash } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Field } from "./ui/field";
import { Label } from "./ui/label";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "./ui/select";

type NamedList = { [key: string]: string }[];

interface ListInputProps extends Omit<InputProps, "onChange" | "value"> {
  label: React.ReactNode;
  placeholder?: string;
  value: string[];
  required?: boolean;
  description?: string;
  onChange: (v: string[]) => void;
}

export const ListInput: React.FC<ListInputProps> = ({
  label,
  placeholder,
  value,
  required = false,
  description,
  onChange,
  ...rest
}) => {
  return (
    <Field label={label} required={required} title={description}>
      <Stack gap="3" w="full">
        {value.map((item, index) => (
          <Group attached key={`${label}_${index}`}>
            <Input
              value={item}
              placeholder={placeholder}
              onChange={(e) => {
                value[index] = e.target.value;
                onChange(value);
              }}
              {...rest}
            />
            <IconButton
              variant={"ghost"}
              onClick={() => {
                value.splice(index, 1);
                onChange(value);
              }}
            >
              <Trash />
            </IconButton>
          </Group>
        ))}
        <Button
          size={"xs"}
          w={"full"}
          variant={"ghost"}
          onClick={() => {
            value.push("");
            onChange(value);
          }}
        >
          <Plus />
          {label}
        </Button>
      </Stack>
    </Field>
  );
};

interface NamedListInputProps extends Omit<InputProps, "onChange" | "value"> {
  label: React.ReactNode;
  placeholder?: { key?: string; value?: string };
  nameField?: string;
  allowedNames?: ReadonlyArray<string>;
  allowedKeys?: { [key: string]: ReadonlyArray<string> };
  allowedValues?: { [key: string]: { [key: string]: ReadonlyArray<string> } };
  description?: { [key: string]: { [key: string]: string } };
  value: NamedList;
  onChange: (v: NamedList) => void;
}

export const NamedListInput: React.FC<NamedListInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  nameField = "name",
  allowedNames,
  allowedKeys,
  allowedValues,
  description,
  ...rest
}) => {
  if (!(value instanceof Array)) value = [];
  if (value.length === 0) value.push({ [nameField]: "" });
  return (
    <Fieldset.Root>
      <Fieldset.Legend>{label}</Fieldset.Legend>
      <Fieldset.Content>
        {value.map((item, index) => (
          <Stack gap="3" key={`${label}_${item[nameField] ?? index}_map`}>
            <MapInput
              label={item[nameField]}
              placeholder={placeholder}
              nameField={nameField}
              allowedNames={allowedNames}
              allowedKeys={allowedKeys?.[item[nameField]!]}
              allowedValues={allowedValues?.[item[nameField]!]}
              description={description?.[item[nameField]!]}
              onChange={(v) => {
                value[index] = {
                  ...v,
                  [nameField]: item[nameField]!,
                };
                onChange(value);
              }}
              value={item}
              {...rest}
            />
            <Button
              size={"xs"}
              bg={"red.500"}
              color={"whiteAlpha.900"}
              onClick={() => {
                value.splice(index, 1);
                onChange(value);
              }}
            >
              {`Delete ${item[nameField]?.length ? item[nameField] : `Item ${index + 1}`}`}
            </Button>
          </Stack>
        ))}
        <Button
          size={"xs"}
          onClick={() => {
            value.push({ [nameField]: "" });
            onChange(value);
          }}
        >
          New item
        </Button>
      </Fieldset.Content>
    </Fieldset.Root>
  );
};

interface MapInputProps
  extends Omit<InputProps, "onChange" | "value" | "placeholder"> {
  label: React.ReactNode;
  placeholder?: { key?: string; value?: string };
  value: Record<string, string>;
  allowAdd?: boolean;
  allowDelete?: boolean;
  nameField?: string;
  allowedNames?: ReadonlyArray<string>;
  allowedKeys?: ReadonlyArray<string>;
  allowedValues?: { [key: string]: ReadonlyArray<string> };
  description?: { [key: string]: string };
  onChange: (v: Record<string, string>) => void;
}

export const MapInput: React.FC<MapInputProps> = ({
  label,
  placeholder,
  value,
  allowAdd = true,
  allowDelete = true,
  nameField,
  allowedNames,
  allowedKeys,
  allowedValues,
  description,
  onChange,
  ...rest
}) => {
  if (allowedKeys) {
    if (nameField) {
      allowedKeys = [...allowedKeys, nameField];
    }
    for (const k of allowedKeys) {
      if (!allowedKeys.includes(k)) {
        delete value[k];
      }
    }
  }

  if (!allowedValues) {
    allowedValues = {};
  }

  if (allowedNames && nameField) {
    allowedValues[nameField] = allowedNames;
  }

  if (nameField && Object.keys(value).length === 0) value[nameField] = "";

  const valuesCollection = Object.entries(allowedValues ?? {}).reduce(
    (acc, [k, v]) => {
      acc[k] = createListCollection({ items: v });
      return acc;
    },
    {} as Record<string, ListCollection<string>>,
  );

  const allowedKeysCollection = React.useMemo(
    () =>
      createListCollection({
        items: (allowedKeys ?? []).filter((k) => value[k] === undefined),
      }),
    [allowedKeys, value],
  );

  if (allowedKeysCollection.size == 1) {
    value[allowedKeysCollection.at(0)!] = "";
  }

  return (
    <Box>
      <Label>{label}</Label>
      <Stack pt="3" gap="3" w="full">
        <For
          each={Object.entries(value).sort((a, b) => {
            if (a[0] === nameField) return -1;
            return 0;
          })}
        >
          {([k, v], index) =>
            Array.isArray(v) ? (
              <ListInput
                key={`${label}_${index}_list`}
                label={`${label}.${k}`}
                value={v}
                description={description?.[k]}
                onChange={(e) => {
                  value[k] = e;
                  onChange(value);
                }}
              />
            ) : (
              <Group
                attached
                key={`${label}_${index}_map`}
                title={description?.[k]}
                color={
                  allowedKeys && !allowedKeys.includes(k)
                    ? "red.500"
                    : undefined
                }
              >
                {allowedKeysCollection.size > 0 && k == "" ? (
                  <SelectRoot
                    collection={allowedKeysCollection}
                    value={[k]}
                    onValueChange={(e) => {
                      value[e.value[0]!] = v;
                      delete value[k];
                      onChange(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValueText
                        placeholder={placeholder?.key ?? "Key"}
                      />
                    </SelectTrigger>
                    <SelectContent w="full">
                      {allowedKeysCollection.items.map((name) => (
                        <SelectItem item={name} key={`${label}_${k}_${name}`}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                ) : (
                  <Input
                    maxW={"1/3"}
                    value={k}
                    readOnly={allowedKeys !== undefined || k === nameField}
                    placeholder={placeholder?.key ?? "Key"}
                    onChange={(e) => {
                      value[e.target.value] = v;
                      delete value[k];
                      onChange(value);
                    }}
                    {...rest}
                  ></Input>
                )}
                {valuesCollection[k] ? (
                  <SelectRoot
                    collection={valuesCollection[k]}
                    value={[v]}
                    onValueChange={(e) => {
                      value[k] = e.value[0]!;
                      onChange(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValueText
                        placeholder={placeholder?.value ?? "Value"}
                      />
                    </SelectTrigger>
                    <SelectContent w="full">
                      {valuesCollection[k].items.map((name) => (
                        <SelectItem item={name} key={`${label}_${k}_${name}`}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                ) : typeof v === "string" || typeof v === "number" ? (
                  <Input
                    maxW={"2/3"}
                    value={v}
                    placeholder={placeholder?.value ?? "Value"}
                    onChange={(e) => {
                      value[k] = e.target.value;
                      onChange(value as Record<string, string>);
                    }}
                    {...rest}
                  />
                ) : typeof v === "boolean" ? (
                  <Checkbox
                    w={"full"}
                    checked={v}
                    onCheckedChange={({ checked }) => {
                      value[k] = checked;
                      onChange(value);
                    }}
                    {...rest}
                  />
                ) : null}
                <IconButton
                  visibility={
                    !allowDelete || k === nameField ? "hidden" : "visible"
                  }
                  variant={"ghost"}
                  onClick={() => {
                    delete value[k];
                    onChange(value);
                  }}
                >
                  <Trash />
                </IconButton>
              </Group>
            )
          }
        </For>
        {allowAdd && (!allowedKeys || allowedKeysCollection.size > 0) && (
          <Button
            size={"xs"}
            w={"full"}
            variant={"ghost"}
            onClick={() => {
              value = { ...value, [""]: "" };
              onChange(value);
            }}
          >
            <Plus />
            {label}
          </Button>
        )}
      </Stack>
    </Box>
  );
};
