import { bodyHeight, bodyWidth } from "@/types/styles";
import { Box } from "@chakra-ui/react";

export default function DefaultLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Box w={bodyWidth} h={bodyHeight}>
      {children}
    </Box>
  );
}
