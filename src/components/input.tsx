import {
  getAllowedValues,
  getDefaultValue,
  getInputType,
  getPropertySchema,
  getRequired,
  getTitle,
  isInputType,
  isToggleType,
  JSONSchema,
} from "@/types/schema";
import {
  Box,
  Code,
  Field,
  Fieldset,
  For,
  Group,
  HStack,
  IconButton,
  Input,
  Stack,
} from "@chakra-ui/react";
import { Plus, Trash } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "./ui/select";

type ListInputProps<T extends string> = {
  label?: React.ReactNode;
  placeholder?: string;
  value: T[];
  required?: boolean;
  description?: string;
  onChange: (v: T[]) => void;
};

function ListInput_<T extends string>({
  label,
  placeholder,
  value,
  required = false,
  description,
  onChange,
}: ListInputProps<T>) {
  const handleItemChange = useCallback(
    (index: number, newValue: T) => {
      const newValues = [...value];
      newValues[index] = newValue;
      onChange(newValues);
    },
    [value, onChange],
  );

  const handleItemDelete = useCallback(
    (index: number) => {
      const newValues = [...value];
      newValues.splice(index, 1);
      onChange(newValues);
    },
    [value, onChange],
  );

  const handleAddItem = useCallback(() => {
    onChange([...value, "" as T]);
  }, [value, onChange]);

  const AddButton = useCallback(
    (props: { showLabel: boolean }) => {
      return (
        <Button
          size={"xs"}
          w={"full"}
          variant={"ghost"}
          onClick={handleAddItem}
          justifyContent={"flex-start"}
        >
          <Plus />
          {props.showLabel ? label : ""}
        </Button>
      );
    },
    [label, handleAddItem],
  );

  return (
    <Field.Root required={required} title={description}>
      <Field.Label>
        <Label minW="min-content">{label}</Label>
        <AddButton showLabel={false} />
      </Field.Label>
      <Stack gap="3" w="full">
        {value.map((item, index) => (
          <Group attached key={`${label}_${index}`}>
            <Input
              value={item}
              placeholder={placeholder}
              onChange={(e) => handleItemChange(index, e.target.value as T)}
            />
            <IconButton
              variant={"ghost"}
              onClick={() => handleItemDelete(index)}
            >
              <Trash />
            </IconButton>
          </Group>
        ))}
        {value.length > 5 && <AddButton showLabel />}
      </Stack>
    </Field.Root>
  );
}

export const ListInput = React.memo(ListInput_) as typeof ListInput_;

type NamedListInputProps<T extends Record<string, unknown>> = {
  label: React.ReactNode;
  placeholder?: { key?: string; value?: string };
  schema?: JSONSchema;
  keyField?: keyof T;
  nameField?: keyof T;
  value: T[];
  onChange: (v: T[]) => void;
};

function NamedListInput_<T extends Record<string, unknown>>({
  label,
  placeholder,
  value,
  onChange,
  keyField = "name",
  nameField = "name",
  schema,
}: Readonly<NamedListInputProps<T>>) {
  if (!(value instanceof Array)) value = [];

  const defaultValue = useMemo(
    () => getDefaultValue(schema?.properties?.[keyField as string]),
    [schema, keyField],
  );

  const handleItemChange = useCallback(
    (index: number, newValue: T) => {
      const newValues = [...value];
      newValues[index] = newValue;
      onChange(newValues);
    },
    [value, onChange],
  );

  const handleDeleteItem = useCallback(
    (index: number) => {
      const newValues = [...value];
      newValues.splice(index, 1);
      onChange(newValues);
    },
    [value, onChange],
  );

  const handleAddItem = useCallback(() => {
    onChange([
      ...value,
      {
        [keyField]: defaultValue,
        [nameField]: "",
      } as T,
    ]);
  }, [value, onChange, keyField, nameField, defaultValue]);

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      {value.map((item, index) => {
        //@ts-ignore
        const name = item[nameField] as string;
        const key = item[keyField] as string;
        return (
          <Stack gap="3" key={`${index}_map`} w="full">
            <MapInput
              label={name}
              placeholder={placeholder}
              keyField={keyField}
              nameField={nameField}
              schema={
                schema && {
                  ...schema,
                  properties: getPropertySchema(schema, {
                    keyField: keyField as string,
                    key: key,
                  }),
                }
              }
              value={item}
              onChange={(e) => handleItemChange(index, e)}
            />
            <Button
              size={"xs"}
              bg={"red.500"}
              color={"whiteAlpha.900"}
              onClick={() => handleDeleteItem(index)}
            >
              {`Delete ${name?.length ? name : `Item ${index + 1}`}`}
            </Button>
          </Stack>
        );
      })}
      <Button size={"xs"} onClick={handleAddItem} w="full">
        New item
      </Button>
    </Field.Root>
  );
}

export const NamedListInput = React.memo(
  NamedListInput_,
) as typeof NamedListInput_;

type MapInputProps<T extends Record<string, unknown>> = {
  label?: React.ReactNode;
  placeholder?: { key?: string; value?: string };
  value: T;
  allowDelete?: boolean;
  keyField?: keyof T;
  nameField?: keyof T;
  schema?: JSONSchema;
  onChange: (v: T) => void;
};

function MapInput_<T extends Record<string, unknown>>({
  label,
  placeholder,
  value,
  allowDelete = true,
  keyField,
  nameField,
  schema,
  onChange,
}: Readonly<MapInputProps<T>>) {
  if (!schema) {
    return (
      <PureMapInput
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (keyField && Object.keys(value).length === 0) {
    value = {
      ...value,
      [keyField]: getDefaultValue(schema?.properties?.[keyField as string]),
    };
  }

  if (schema.required) {
    for (const k of schema.required) {
      if (value[k] === undefined) {
        value = {
          ...value,
          [k]: getDefaultValue(schema?.properties?.[k]),
        };
      }
    }
  }

  const defaultValues = useMemo(() => {
    if (!schema.properties) return {};
    return Object.keys(schema.properties)
      .filter((k) => value[k] === undefined)
      .reduce(
        (acc, k) => {
          if (k in value && value[k] !== undefined) return acc;
          acc[k] = getDefaultValue(schema?.properties?.[k]);
          return acc;
        },
        {} as Record<string, unknown>,
      );
  }, [schema, value]);

  return (
    <Fieldset.Root>
      <Fieldset.Legend>{label}</Fieldset.Legend>
      <Fieldset.Content>
        <Stack gap="3" w="full">
          <For
            each={Object.entries({ ...value, ...defaultValues }).sort(
              ([key1], [key2]) => {
                if (key1 === keyField || key1 === nameField) return -1;
                if (key2 === keyField || key2 === nameField) return 1;
                return key1.localeCompare(key2);
              },
            )}
          >
            {([k, v], index) => {
              const vSchema = schema.properties?.[k];
              return vSchema?.type === "array" || Array.isArray(v) ? (
                <ListInput
                  key={`${index}_list`}
                  label={`${label}.${k}`}
                  value={(v as string[] | undefined) ?? []}
                  description={vSchema?.description}
                  onChange={(e) => {
                    onChange({ ...value, [k]: e });
                  }}
                />
              ) : vSchema?.type === "object" || typeof v === "object" ? (
                <MapInput
                  key={`${index}_map`}
                  label={`${label}.${k}`}
                  value={(v as Record<string, unknown> | undefined) ?? {}}
                  schema={vSchema?.properties}
                  onChange={(e) => {
                    if (e === undefined || e === null) {
                      delete value[k];
                      onChange({ ...value });
                      return;
                    }
                    onChange({ ...value, [k]: e });
                  }}
                />
              ) : (
                <FieldInput
                  key={`${index}_field`}
                  fieldKey={k}
                  fieldValue={(v as Record<string, unknown> | undefined) ?? {}}
                  schema={schema}
                  placeholder={placeholder}
                  allowDelete={allowDelete}
                  onKeyChange={(e) => {
                    delete value[k];
                    onChange({
                      ...value,
                      [e]: v ? v : getDefaultValue(schema?.properties?.[e]),
                    });
                  }}
                  onChange={(e) => {
                    if (e === undefined || e === null) {
                      delete value[k];
                      onChange({ ...value });
                      return;
                    }
                    onChange({ ...value, [k]: e });
                  }}
                />
              );
            }}
          </For>
        </Stack>
      </Fieldset.Content>
    </Fieldset.Root>
  );
}

function PureMapInput<T extends Record<string, unknown>>({
  label,
  placeholder,
  value,
  onChange,
}: Readonly<MapInputProps<T>>) {
  const keys = useMemo(() => Object.keys(value), [value]);
  const AddButton = useCallback(
    (props: { showLabel: boolean }) => {
      return (
        <Button
          size={"sm"}
          onClick={() => {
            onChange({ ...value, [""]: "" });
          }}
          variant={"ghost"}
          justifyContent={"flex-start"}
        >
          <Plus />
          {props.showLabel ? label : ""}
        </Button>
      );
    },
    [label, onChange, value],
  );
  return (
    <Fieldset.Root>
      <Fieldset.Legend>
        {label}
        <AddButton showLabel={false} />
      </Fieldset.Legend>
      <Fieldset.Content>
        <Stack gap="3" w="full">
          <For each={keys}>
            {(k, index) => {
              return (
                <FieldInput
                  key={`${label}_${index}_field`}
                  fieldKey={k}
                  fieldValue={value[k] as T}
                  schema={undefined}
                  placeholder={placeholder}
                  onKeyChange={(newK, newV) => {
                    delete value[k];
                    onChange({ ...value, [newK]: newV });
                  }}
                  onChange={(e) => {
                    if (e === undefined || e === null) {
                      delete value[k];
                      onChange({ ...value });
                      return;
                    }
                    onChange({ ...value, [k]: e });
                  }}
                  allowDelete={true}
                />
              );
            }}
          </For>
          {keys.length > 5 && <AddButton showLabel />}
        </Stack>
      </Fieldset.Content>
    </Fieldset.Root>
  );
}

export const MapInput = React.memo(MapInput_) as typeof MapInput_;

type FieldInputProps<T> = {
  fieldKey: string;
  fieldValue: T;
  schema: JSONSchema | undefined;
  placeholder: { key?: string; value?: string } | undefined;
  onKeyChange: (key: string, value: unknown) => void;
  onChange: (v: unknown) => void;
  allowDelete: boolean;
};

const FieldInput = React.memo(
  <T extends unknown>({
    fieldKey,
    fieldValue,
    schema,
    placeholder,
    onKeyChange,
    onChange,
    allowDelete = true,
  }: Readonly<FieldInputProps<T>>) => {
    const allowedValues = useMemo(
      () => getAllowedValues(schema, fieldKey),
      [schema, fieldKey],
    );
    const required = useMemo(
      () => getRequired(schema).includes(fieldKey),
      [schema, fieldKey],
    );

    const vSchema = schema?.properties?.[fieldKey];
    const title = useMemo(() => getTitle(schema, fieldKey), [schema, fieldKey]);

    return (
      <HStack
        color={
          schema?.properties && !(fieldKey in schema.properties)
            ? "red.500"
            : undefined
        }
      >
        {!schema ? (
          <Input
            value={fieldKey}
            placeholder={placeholder?.key ?? "Key"}
            onChange={({ target: { value } }) => onKeyChange(value, fieldValue)}
          />
        ) : title ? (
          <Stack gap={0} userSelect={"none"} minW="150px">
            <Group>
              <Label>{title}</Label>
              {required && (
                <Label color="red.500" fontSize="xs">
                  *
                </Label>
              )}
            </Group>
            <Code p={0}>{fieldKey}</Code>
          </Stack>
        ) : (
          <Box minW="150px">
            <Group attached>
              <Label>{fieldKey}</Label>
              {required && (
                <Label color="red.500" fontSize="xs">
                  *
                </Label>
              )}
            </Group>
          </Box>
        )}
        {allowedValues && allowedValues.size > 0 ? (
          <SelectRoot
            collection={allowedValues}
            value={[fieldValue as string]}
            onValueChange={({ value }) => {
              if (value[0] === "") {
                delete value[0];
              }
              onChange(value[0]);
            }}
          >
            <SelectTrigger>
              <SelectValueText placeholder={placeholder?.value ?? "Value"} />
            </SelectTrigger>
            <SelectContent w="full">
              {allowedValues.items.map((item) => (
                <SelectItem item={item} key={item}>
                  {item === "" ? "Use default" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        ) : isInputType(vSchema) ? (
          <Input
            value={fieldValue as string | number}
            type={getInputType(vSchema?.type)}
            placeholder={placeholder?.value ?? "Value"}
            onChange={({ target: { value } }) => onChange(value)}
          />
        ) : isToggleType(vSchema) ? (
          <Checkbox
            w="full"
            checked={fieldValue as boolean}
            onCheckedChange={({ checked }) => onChange(checked)}
          />
        ) : null}
        {allowDelete && !required && (
          <IconButton variant={"ghost"} onClick={() => onChange(undefined)}>
            <Trash />
          </IconButton>
        )}
      </HStack>
    );
  },
);
