import "@/styles/logs.css";
import {
  Collapsible,
  For,
  HStack,
  Icon,
  Span,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";

export type GoDoxyError =
  | string
  | Record<string, unknown>
  | WithSubject
  | NestedError;
type WithSubject = { subjects: string[]; err: GoDoxyError };
type NestedError = { err: string | WithSubject | null; extras: GoDoxyError[] };

function SubjectText({
  subjects,
  level,
}: {
  subjects: string[] | undefined;
  level: number;
}) {
  if (!subjects || subjects.length === 0) {
    return null;
  }
  if (subjects.length > 1) {
    return (
      <>
        <GoDoxyErrorText err={subjects.slice(0, -1).join("/")} />
        <SubjectText subjects={subjects.slice(-1)} level={level} />
      </>
    );
  }
  return (
    <Text pl={level ? 5 : 0} color="fg.warning" whiteSpace={"preserve"}>
      {subjects.slice(-1)}:{" "}
    </Text>
  );
}

function MultiErrors({
  errors,
  level,
}: {
  errors: GoDoxyError[];
  level: number;
}) {
  return (
    <Stack gap="1">
      <For each={errors}>
        {(error, index) => (
          <GoDoxyErrorText key={index} err={error} level={level} />
        )}
      </For>
    </Stack>
  );
}

export const GoDoxyErrorText: React.FC<{
  err: GoDoxyError;
  level?: number;
}> = ({ err, level }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  if (!err) return null;
  const pl = level ? 5 : 0;
  if (typeof err === "string") {
    return <Text pl={pl}>{err}</Text>;
  }
  if ("subjects" in err && Array.isArray(err.subjects)) {
    if (!err.err)
      return <SubjectText subjects={err.subjects} level={level ?? 0} />;
    return (
      <HStack pl={pl} gap="0">
        <SubjectText subjects={err.subjects} level={level ?? 0} />
        <GoDoxyErrorText err={err.err} />
      </HStack>
    );
  }
  if ("extras" in err && Array.isArray(err.extras)) {
    if (!err.err) return <MultiErrors errors={err.extras} level={level ?? 0} />;
    if (err.extras.length === 0 || !err.extras[0])
      return <GoDoxyErrorText err={err.err} />;
    if (err.extras.length === 1) {
      return (
        <Stack gap="1">
          <GoDoxyErrorText err={err.err} level={level ?? 0} />
          <For each={err.extras}>
            {(extra, index) => (
              <GoDoxyErrorText
                key={index}
                err={extra}
                level={(level ?? 0) + 1}
              />
            )}
          </For>
        </Stack>
      );
    }
    return (
      <Collapsible.Root
        pl={pl}
        open={isOpen}
        onOpenChange={({ open }) => setIsOpen(open)}
      >
        <Collapsible.Trigger cursor={"pointer"}>
          <HStack gap="1">
            <Icon size="sm">
              {isOpen ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
            </Icon>
            <GoDoxyErrorText err={err.err} />
          </HStack>
        </Collapsible.Trigger>
        <Collapsible.Content asChild animationDuration={"150ms"}>
          <Stack gap="0" pl={pl}>
            <For each={err.extras}>
              {(extra, index) => (
                <GoDoxyErrorText
                  key={index}
                  err={extra}
                  level={(level ?? 0) + 1}
                />
              )}
            </For>
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>
    );
  }

  return (
    <Stack gap="0">
      <For each={Object.entries(err)}>
        {([k, v], index) => {
          if (!v) return null;
          if (typeof v === "string")
            return (
              <Text key={`${index}_${k}`}>
                <Span color="fg.warning">{k}:</Span> {`${v}`}
              </Text>
            );
          if (typeof v === "object")
            return (
              <For each={Object.entries(v)}>
                {([k2, v2], index2) => (
                  <GoDoxyErrorText
                    key={`${index}_${index2}_${k}`}
                    err={{ [k2]: v2 }}
                    level={(level ?? 0) + 1}
                  />
                )}
              </For>
            );
          if (Array.isArray(v))
            return (
              <For each={v}>
                {(v2, index2) => (
                  <GoDoxyErrorText
                    key={`${index}_${index2}`}
                    err={v2}
                    level={(level ?? 0) + 1}
                  />
                )}
              </For>
            );
          return null;
        }}
      </For>
    </Stack>
  );
};
