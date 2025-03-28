import { bodyHeight, bodyWidth } from "@/styles";
import { Box } from "@chakra-ui/react";
import type { FC, PropsWithChildren } from "react";

const DefaultLayout: FC<PropsWithChildren> = ({ children }) => (
  <Box w={bodyWidth} h={bodyHeight}>
    {children}
  </Box>
);

export default DefaultLayout;
