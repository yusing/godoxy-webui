import { Switch as ChakraSwitch } from "@chakra-ui/react";
import * as React from "react";

export interface SwitchProps extends ChakraSwitch.RootProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  rootRef?: React.Ref<HTMLLabelElement>;
  trackLabel?: { on: React.ReactNode; off: React.ReactNode };
  thumbLabel?: { on: React.ReactNode; off: React.ReactNode };
  labelPlacement?: "start" | "end";
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch(props, ref) {
    const {
      inputProps,
      children,
      rootRef,
      trackLabel,
      thumbLabel,
      labelPlacement,
      ...rest
    } = props;

    const left = labelPlacement !== "end";

    return (
      <ChakraSwitch.Root ref={rootRef} {...rest}>
        <ChakraSwitch.HiddenInput ref={ref} {...inputProps} />
        {left && children != null && (
          <ChakraSwitch.Label>{children}</ChakraSwitch.Label>
        )}
        <ChakraSwitch.Control>
          <ChakraSwitch.Thumb>
            {thumbLabel && (
              <ChakraSwitch.ThumbIndicator fallback={thumbLabel?.off}>
                {thumbLabel?.on}
              </ChakraSwitch.ThumbIndicator>
            )}
          </ChakraSwitch.Thumb>
          {trackLabel && (
            <ChakraSwitch.Indicator fallback={trackLabel.off}>
              {trackLabel.on}
            </ChakraSwitch.Indicator>
          )}
        </ChakraSwitch.Control>
        {!left && children != null && (
          <ChakraSwitch.Label>{children}</ChakraSwitch.Label>
        )}
      </ChakraSwitch.Root>
    );
  },
);
