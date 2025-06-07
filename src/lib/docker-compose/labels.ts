export function processStringKVs(
  kvs: string[] | Record<string, string>,
): Record<string, string> {
  if (Array.isArray(kvs)) {
    return kvs.reduce(
      (acc, kv) => {
        const [k, v] = kv.split("=");
        acc[k!.trim()] = v?.trim() ?? "";
        return acc;
      },
      {} as Record<string, string>,
    );
  }
  if (typeof kvs === "object") {
    return kvs;
  }
  return {};
}

/** ported from backend go code */

const NSProxy = "proxy";

export type LabelMap = Record<string, unknown>;

export class LabelError extends Error {
  subject?: string;

  constructor(message: string, subject?: string) {
    super(message);
    this.name = "LabelError";
    this.subject = subject;
  }
}

export function parseLabels(
  labels: Record<string, string>,
): [LabelMap, Record<string, string>, LabelError[]] {
  const nestedMap: LabelMap = {};
  const errors: LabelError[] = [];
  const extraLabels: Record<string, string> = {};

  for (const lbl in labels) {
    if (Object.prototype.hasOwnProperty.call(labels, lbl)) {
      const value = labels[lbl]!;
      const parts = lbl.split(".");

      if (parts[0] !== NSProxy) {
        extraLabels[lbl] = value;
        continue;
      }

      if (parts.length === 1) {
        errors.push(new LabelError("invalid label", lbl));
        continue;
      }

      const keys = parts.slice(1);
      let currentMap = nestedMap;

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i]!;
        if (i === keys.length - 1) {
          // Last element, set the value
          currentMap[k] = value;
        } else {
          // If the key doesn't exist or is not an object, create a new map
          if (
            typeof currentMap[k] !== "object" ||
            currentMap[k] === null ||
            Array.isArray(currentMap[k])
          ) {
            if (currentMap[k] !== undefined && currentMap[k] !== "") {
              errors.push(
                new LabelError(
                  `expect mapping, got ${typeof currentMap[k]}`,
                  lbl,
                ),
              );
              // Skip processing this label further due to inconsistent structure
              break;
            }
            currentMap[k] = {};
          }
          currentMap = currentMap[k] as LabelMap;
        }
      }
    }
  }

  return [nestedMap, extraLabels, errors];
}

export function toLabels(labelMap: LabelMap): Record<string, string> {
  const labels: Record<string, string> = {};
  let currentKey = "";
  for (const [k, v] of Object.entries(labelMap)) {
    if (typeof v === "object") {
      currentKey = k;
    } else {
      labels[`${currentKey}.${k}`] = v as string;
    }
  }
  return labels;
}
