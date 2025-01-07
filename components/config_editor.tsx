"use client";

import { yaml } from "@codemirror/lang-yaml";
import { Diagnostic, linter, lintGutter } from "@codemirror/lint";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { dracula, noctisLilac } from "thememirror";
import * as yamlParser from "yaml";

import { FetchError } from "@/types/endpoints";
import File from "@/types/file";
import { loadSchema } from "@/types/schema";
import { ErrorObject } from "ajv";
import log from "loglevel";

export default function ConfigEditor({
  file,
  onError,
}: Readonly<{
  file: File;
  onError: (e: FetchError) => void;
}>) {
  log.debug("ConfigEditor", file.getFilename());
  const [initialValue, setInitialValue] = useState("");
  const deferedValue = useDeferredValue(initialValue);
  const { theme } = useTheme();

  useEffect(() => {
    file.getContent().then(setInitialValue).catch(onError);
  }, [file]);

  // YAML linting function with schema validation
  const yamlLinter = useMemo(
    () =>
      linter(
        async (view) => {
          const diagnostics: Diagnostic[] = [];
          if (file.getType() === "middleware") {
            return diagnostics;
          }
          try {
            const doc = yamlParser.parse(view.state.doc.toString());
            const validate = await loadSchema(file.getType());
            const valid = validate(doc);
            if (valid) {
              return diagnostics;
            }
            const errs = validate.errors;
            if (errs === null || errs === undefined) {
              return diagnostics;
            }
            if (errs.length > 0) {
              errs.forEach((error: ErrorObject) => {
                log.debug(error);
                const path = error.instancePath.split("/").slice(1);
                let position = 0;
                let target = path[path.length - 1];
                let length = target.length || 1;
                let content = view.state.doc.toString();

                for (const element of path) {
                  const searchStr = element + ":";
                  const pos = content.indexOf(searchStr, position);
                  if (pos !== -1) {
                    position = pos;
                  }
                }

                let msg = target + ": " + (error.message ?? "");
                if (error.params?.allowedValues) {
                  msg += `: ${error.params.allowedValues.join(", ")}`;
                }
                if (error.params?.additionalProperty) {
                  msg += ` "${error.params.additionalProperty}"`;
                }
                diagnostics.push({
                  from: position,
                  to: position + length,
                  severity: "error",
                  message: msg,
                });
              });
            }
          } catch (e: any) {
            if (e instanceof Error) {
              diagnostics.push({
                from: 0,
                to: view.state.doc.length,
                severity: "error",
                message: e.message,
              });
            } else {
              log.error("Unknown error:", e);
            }
          }
          return diagnostics;
        },
        {
          autoPanel: true,
          delay: 300,
          needsRefresh: (_) => {
            return false;
          },
        }
      ),
    [file]
  );

  let cmTheme = theme === "light" ? noctisLilac : dracula;
  let panelTheme = EditorView.theme({
    ".cm-diagnostic": {
      backgroundColor: "inherit !important",
    },
  });

  return (
    <CodeMirror
      extensions={[panelTheme, yaml(), yamlLinter, lintGutter()]}
      theme={cmTheme}
      value={deferedValue}
      onChange={(value, _) => {
        file.setContent(value);
      }}
      basicSetup={true}
      style={{
        width: "60vw",
        fontSize: "14px",
        overflow: "auto",
      }}
    />
  );
}
