import { useConfigFileContext } from "@/types/file";
import { Box } from "@chakra-ui/react";

// TODO: implement UI editor
export default function UIEditor() {
  const { content, setContent } = useConfigFileContext();
  // const { schema } = useConfigSchemaContext();
  if (content === undefined) return null;

  return <Box maxH={"60vh"} overflowY={"auto"}></Box>;
}
