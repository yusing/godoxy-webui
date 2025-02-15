import { Prose } from "@/components/ui/prose";
import Convert from "ansi-to-html";

const convertANSI = new Convert();
export const LogLine: React.FC<{ line: string }> = ({ line }) => {
  return (
    <Prose
      as="pre"
      fontSize={"md"}
      w="full"
      lineHeight="1.3rem"
      dangerouslySetInnerHTML={{
        __html: convertANSI.toHtml(
          line.replaceAll(" ", "&nbsp;").replaceAll("\t", "&emsp;"),
        ),
      }}
    />
  );
};
