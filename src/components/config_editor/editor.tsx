"use client";

import { yaml } from "@codemirror/lang-yaml";
import { Diagnostic, linter, lintGutter } from "@codemirror/lint";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { coolGlow, noctisLilac } from "thememirror";
import * as yamlParser from "yaml";

import { useConfigFileContext, useConfigSchemaContext } from "@/types/file";
import { bodyHeight, bodyWidth } from "@/types/styles";
import { ErrorObject } from "ajv";
import log from "loglevel";

export default function ConfigEditor() {
  const { curFile, content, setContent } = useConfigFileContext();
  const { schema } = useConfigSchemaContext();
  const { theme } = useTheme();

  // YAML linting function with schema validation
  const yamlLinter = useMemo(
    () =>
      linter(
        (view) => {
          const diagnostics: Diagnostic[] = [];
          try {
            const doc = yamlParser.parse(view.state.doc.toString());
            const valid = schema.validate?.(doc);
            if (valid) {
              return diagnostics;
            }
            if (schema.validate === undefined) {
              log.error("validator is not set");
            }
            const errs = schema.validate?.errors;
            if (errs === null || errs === undefined) {
              return diagnostics;
            }
            if (errs.length > 0) {
              errs.forEach((error: ErrorObject) => {
                log.debug(error);
                const path = error.instancePath.split("/").slice(1);
                let position = 0;
                let target = path[path.length - 1];
                let length = target!.length || 1;
                let content = view.state.doc.toString();

                for (const element of path) {
                  const searchStr = element + ":";
                  const pos = content.indexOf(searchStr, position);
                  if (pos !== -1) {
                    position = pos;
                  }
                }

                let msg = error.instancePath + ": " + (error.message ?? "");
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
        },
      ),
    [curFile.filename, schema],
  );

  let cmTheme = theme === "light" ? noctisLilac : coolGlow;
  let panelTheme = EditorView.theme({
    ".cm-diagnostic": {
      backgroundColor: "inherit !important",
    },
  });

  return (
    <CodeMirror
      extensions={[panelTheme, yaml(), yamlLinter, lintGutter()]}
      theme={cmTheme}
      value={content}
      onChange={(value, _) => setContent(value)}
      height={bodyHeight}
      width={bodyWidth}
      basicSetup={true}
      style={{
        fontSize: "14px",
        overflow: "auto",
      }}
    />
  );
}
