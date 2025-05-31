import { yamlSchemaHover } from "codemirror-json-schema/yaml";

import { yaml } from "@codemirror/lang-yaml";
import { linter } from "@codemirror/lint";
import ReactCodeMirror, { hoverTooltip } from "@uiw/react-codemirror";
import { stateExtensions } from "codemirror-json-schema";
import { yamlSchemaLinter } from "codemirror-json-schema/yaml";
import { coolGlow } from "node_modules/thememirror/dist/themes/cool-glow";
import { noctisLilac } from "node_modules/thememirror/dist/themes/noctis-lilac";
import { useMemo } from "react";
import { useColorMode } from "./ui/color-mode";

import "@/styles/yaml_editor.css";

export type YAMLEditorProps = {
  value: string | undefined;
  onChange: (value: string) => void;
};

export default function YAMLEditor({
  value,
  onChange,
  schema,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  schema: unknown;
}) {
  const { colorMode } = useColorMode();
  const theme = useMemo(() => {
    if (colorMode === "light") {
      return noctisLilac;
    }
    return coolGlow;
  }, [colorMode]);

  return (
    <ReactCodeMirror
      extensions={[yaml(), ...yamlSchemaExtensions(schema)]}
      theme={theme}
      value={value}
      autoFocus
      onChange={(value, _) => onChange(value)}
      basicSetup
      style={{
        fontSize: "14px",
        overflow: "auto",
      }}
    />
  );
}

function yamlSchemaExtensions(schema: unknown) {
  return [
    linter(yamlSchemaLinter(), {
      delay: 200,
    }),
    hoverTooltip(yamlSchemaHover()),
    stateExtensions(schema as Parameters<typeof stateExtensions>[0]),
  ];
}
