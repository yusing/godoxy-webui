import { Flex } from "@chakra-ui/react";
import type { FC, PropsWithChildren } from "react";

const LoginLayout: FC<PropsWithChildren> = ({ children }) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    h="100%"
    w="100%"
    bgGradient="linear(to-br, black 0%, black 50%, white 50%, white 100%)"
  >
    {children}
  </Flex>
);

export default LoginLayout;
