import "@/styles/logs.css";
import { Box, Collapsible, HStack, Icon, List, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";

export type GoDoxyError =
  | string
  | Record<string, unknown>
  | WithSubject
  | NestedError;
type WithSubject = { subjects: string[]; err: GoDoxyError };
type NestedError = { err: string | WithSubject | null; extras: GoDoxyError[] };

type FlatRow = {
  key: string;
  level: number;
  inner?: boolean;
  isHeader?: boolean;
  groupKey?: string;
  text?: string;
  subjects?: string[];
  message?: string;
};

function subjectsToLabel(subjects?: string[]): string {
  if (!subjects || subjects.length === 0) return "";
  return subjects.join(".") + ":";
}

export function flattenGoDoxyError(
  input: GoDoxyError,
  level = 0,
  rows: FlatRow[] = [],
  currentGroup?: string,
): FlatRow[] {
  // strings
  if (typeof input === "string") {
    rows.push({
      key: `line-${rows.length}`,
      level,
      inner: !!currentGroup,
      groupKey: currentGroup,
      text: input,
    });
    return rows;
  }

  // WithSubject
  if ("subjects" in input && Array.isArray(input.subjects)) {
    const subj = input as WithSubject;
    if (!input.err) {
      rows.push({
        key: `subj-${rows.length}`,
        level,
        inner: !!currentGroup,
        groupKey: currentGroup,
        subjects: subj.subjects,
        message: undefined,
      });
      return rows;
    }
    // If err is string → one-line; if it's nested → recurse
    if (typeof input.err === "string") {
      rows.push({
        key: `subj-msg-${rows.length}`,
        level,
        inner: !!currentGroup,
        groupKey: currentGroup,
        subjects: subj.subjects,
        message: input.err,
      });
      return rows;
    }
    // nested err under same level (label then further content)
    rows.push({
      key: `subj-only-${rows.length}`,
      level,
      inner: !!currentGroup,
      groupKey: currentGroup,
      subjects: subj.subjects,
      message: undefined,
    });
    return flattenGoDoxyError(subj.err, level, rows, currentGroup);
  }

  // NestedError
  if ("extras" in input && Array.isArray(input.extras)) {
    const nested = input as NestedError;
    // No header, just flatten extras at this level
    if (!nested.err) {
      nested.extras.forEach((e) =>
        flattenGoDoxyError(e as GoDoxyError, level, rows, currentGroup),
      );
      return rows;
    }

    // Prepare header label text for input.err (could be string or WithSubject)
    let headerText = "";
    if (typeof nested.err === "string") {
      headerText = nested.err;
    } else {
      const label = subjectsToLabel((nested.err as WithSubject).subjects);
      headerText = nested.err.err ? `${label} ${nested.err.err}` : label;
    }

    // No extras or one extra → inline expand, no collapsible
    if (input.extras.length <= 1) {
      if (typeof nested.err === "object" && "subjects" in nested.err) {
        rows.push({
          key: `hdr-inline-subj-${rows.length}`,
          level,
          inner: !!currentGroup,
          groupKey: currentGroup,
          subjects: nested.err.subjects,
          message:
            typeof nested.err.err === "string" ? nested.err.err : undefined,
        });
      } else {
        rows.push({
          key: `hdr-inline-${rows.length}`,
          level,
          inner: !!currentGroup,
          groupKey: currentGroup,
          text: headerText,
        });
      }
      if (input.extras.length === 1) {
        flattenGoDoxyError(
          input.extras[0] as GoDoxyError,
          level + 1,
          rows,
          currentGroup,
        );
      }
      return rows;
    }

    // Multiple extras → make collapsible header; all children marked inner with groupKey
    const groupKey = `grp-${rows.length}`;
    if (typeof nested.err === "object" && "subjects" in nested.err) {
      rows.push({
        key: `hdr-subj-${groupKey}`,
        level,
        isHeader: true,
        inner: !!currentGroup,
        groupKey,
        subjects: nested.err.subjects,
        message:
          typeof nested.err.err === "string" ? nested.err.err : undefined,
      });
    } else {
      rows.push({
        key: `hdr-${groupKey}`,
        level,
        isHeader: true,
        inner: !!currentGroup,
        groupKey,
        text: headerText,
      });
    }
    input.extras.forEach((e) => {
      flattenGoDoxyError(e as GoDoxyError, level + 1, rows, groupKey);
    });
    return rows;
  }

  // Plain objects and arrays: linearize fields/items
  if (Array.isArray(input)) {
    input.forEach((item) =>
      flattenGoDoxyError(item as GoDoxyError, level, rows, currentGroup),
    );
    return rows;
  }
  if (typeof input === "object" && input) {
    Object.entries(input).forEach(([k, v]) => {
      if (v == null) return;
      if (typeof v === "string") {
        rows.push({
          key: `obj-${k}-${rows.length}`,
          level,
          inner: !!currentGroup,
          groupKey: currentGroup,
          text: `${k}: ${v}`,
        });
      } else {
        rows.push({
          key: `obj-${k}-label-${rows.length}`,
          level,
          inner: !!currentGroup,
          groupKey: currentGroup,
          text: `${k}:`,
        });
        flattenGoDoxyError(v as GoDoxyError, level + 1, rows, currentGroup);
      }
    });
    return rows;
  }

  return rows;
}

export function GoDoxyErrorText({
  err,
  level,
}: {
  err: GoDoxyError;
  level?: number;
}) {
  if (!err) return null;
  const baseLevel = level ?? 0;
  const rows = useMemo(
    () => flattenGoDoxyError(err, baseLevel),
    [err, baseLevel],
  );
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <List.Root as="ul" listStyle="disc">
      {rows.map((r) => {
        const isInner = r.inner && r.groupKey;
        if (isInner && r.groupKey && open[r.groupKey] === false) return null;
        const pl = [0, 8, 12][r.level];
        if (r.isHeader && r.groupKey) {
          const o = open[r.groupKey] ?? true;
          return (
            <List.Item key={r.key} pl={pl}>
              <Collapsible.Root
                open={o}
                onOpenChange={({ open }) =>
                  setOpen((m) => ({ ...m, [r.groupKey as string]: open }))
                }
              >
                <Collapsible.Trigger cursor={"pointer"}>
                  <HStack gap="1">
                    <Icon size="sm">
                      {o ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
                    </Icon>
                    {r.subjects ? (
                      <SubjectText subjects={r.subjects} message={r.message} />
                    ) : (
                      r.text
                    )}
                  </HStack>
                </Collapsible.Trigger>
              </Collapsible.Root>
            </List.Item>
          );
        }
        return r.subjects ? (
          <Box key={r.key} pl={pl}>
            <List.Item>
              <SubjectText subjects={r.subjects} message={r.message} />
            </List.Item>
          </Box>
        ) : (
          <List.Item key={r.key} pl={pl}>
            {r.text}
          </List.Item>
        );
      })}
    </List.Root>
  );
}

function SubjectText({
  subjects,
  message,
}: {
  key?: string;
  subjects: string[];
  message?: string;
}) {
  return (
    <>
      <span>{subjects.slice(0, -1).join(".")}</span>
      {subjects.length > 1 ? "." : ""}
      <Text as="span" color="fg.warning">
        {subjects.slice(-1)}
      </Text>
      {message ? `: ${message}` : ""}
    </>
  );
}
