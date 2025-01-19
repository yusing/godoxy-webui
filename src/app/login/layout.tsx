import { Flex } from "@chakra-ui/react";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Flex
      w="100vw"
      h="90vh"
      justifyContent="center"
      alignItems="center"
      overflow="clip"
    >
      {children}
    </Flex>
  );
}
