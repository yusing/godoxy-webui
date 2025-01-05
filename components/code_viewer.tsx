import CodeMirror, { Extension } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { dracula, noctisLilac } from "thememirror";

export function CodeViewer({
  value,
  extensions,
}: {
  readonly value: string;
  readonly extensions?: Extension[];
}) {
  const { theme } = useTheme();

  return (
    <CodeMirror
      readOnly
      basicSetup={{
        lineNumbers: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
      }}
      editable={false}
      extensions={extensions}
      theme={theme === "light" ? noctisLilac : dracula}
      value={value}
    />
  );
}
