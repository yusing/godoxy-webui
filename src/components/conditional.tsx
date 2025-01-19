import React from "react";

export default function Conditional<
  TTrue extends React.ElementType,
  TFalse extends React.ElementType,
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
  trueProps?: React.ComponentProps<TTrue>;
  whenFalse: TFalse;
  falseProps?: React.ComponentProps<TFalse>;
  common?: React.ComponentProps<TTrue> & React.ComponentProps<TFalse>;
  children?: React.ReactNode;
}) {
  return condition
    ? React.createElement(whenTrue, { ...trueProps, ...common }, children)
    : React.createElement(whenFalse, { ...falseProps, ...common }, children);
}
