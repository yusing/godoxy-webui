import { Tooltip as ChakraTooltip, IconButton, Portal } from "@chakra-ui/react";
import * as React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi2";

export interface TooltipProps extends ChakraTooltip.RootProps {
  showArrow?: boolean;
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
  content: React.ReactNode;
  contentProps?: ChakraTooltip.ContentProps;
  disabled?: boolean;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      portalled,
      content,
      contentProps,
      portalRef,
      ...rest
    } = props;

    if (disabled) return children;

    return (
      <ChakraTooltip.Root {...rest} openDelay={100}>
        <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraTooltip.Positioner>
            <ChakraTooltip.Content
              bg="gray.700"
              color="gray.300"
              ref={ref}
              {...contentProps}
            >
              {showArrow && (
                <ChakraTooltip.Arrow>
                  <ChakraTooltip.ArrowTip />
                </ChakraTooltip.Arrow>
              )}
              {content}
            </ChakraTooltip.Content>
          </ChakraTooltip.Positioner>
        </Portal>
      </ChakraTooltip.Root>
    );
  },
);

export const InfoTip = React.forwardRef<HTMLDivElement, Partial<TooltipProps>>(
  function InfoTip(props, ref) {
    const { children, ...rest } = props;
    return (
      <Tooltip content={children} {...rest} ref={ref}>
        <IconButton
          variant="ghost"
          aria-label="info"
          size="2xs"
          colorPalette="gray"
        >
          <HiOutlineInformationCircle />
        </IconButton>
      </Tooltip>
    );
  },
);
