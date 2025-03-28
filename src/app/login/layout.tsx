import { Flex } from "@chakra-ui/react";
import type { FC, PropsWithChildren } from "react";

const LoginLayout: FC<PropsWithChildren> = ({ children }) => (
  <Flex
    w="100%"
    h="100%"
    justifyContent="center"
    alignItems="center"
    overflow="clip"
  >
    {children}
  </Flex>
);

export default LoginLayout;
