import { RouteResponse } from "@/types/api/route/route";
import {
  HStack,
  IconButton,
  Menu,
  Portal,
  Text,
  useDialog,
} from "@chakra-ui/react";
import { MoreHorizontal } from "lucide-react";
import { EyeFilledIcon } from "../icons";
import { FullDetailDialog } from "./full_detail_dialog";

export function Actions({ route }: { route: RouteResponse }) {
  const detailDialog = useDialog();

  return (
    <>
      <Menu.Root
        positioning={{ hideWhenDetached: true }}
        lazyMount
        unmountOnExit
      >
        <Menu.Trigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            _hover={{ bg: "gray.100", _dark: { bg: "gray.700" } }}
            transition="all 0.2s"
          >
            <MoreHorizontal />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              bg="white"
              _dark={{ bg: "gray.800", borderColor: "gray.600" }}
              shadow="lg"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            >
              <Menu.Item
                value="full-detail"
                onClick={(e) => {
                  e.preventDefault();
                  detailDialog.setOpen(true);
                }}
                _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}
                transition="all 0.2s"
              >
                <HStack>
                  <EyeFilledIcon />
                  <Text>View Full Detail</Text>
                </HStack>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <FullDetailDialog route={route} dialog={detailDialog} />
    </>
  );
}
