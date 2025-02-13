import { ComponentProps, ElementType, ReactNode, createElement } from "react";

export default function Conditional<
  TTrue extends ElementType,
  TFalse extends ElementType,
>({
  condition,
  whenTrue,
  trueProps,
  whenFalse,
  falseProps,
  common,
  children,
}: {
  condition: boolean;
  whenTrue: TTrue;
  trueProps?: ComponentProps<TTrue>;
  whenFalse: TFalse;
  falseProps?: ComponentProps<TFalse>;
  common?: ComponentProps<TTrue> & ComponentProps<TFalse>;
  children?: ReactNode;
}) {
  return condition
    ? createElement(whenTrue, { ...trueProps, ...common }, children)
    : createElement(whenFalse, { ...falseProps, ...common }, children);
}
