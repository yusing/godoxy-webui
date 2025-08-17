import {
  type ComponentProps,
  type ElementType,
  type ReactNode,
  createElement,
  memo,
  useMemo,
} from "react";

interface ConditionalProps<
  TTrue extends ElementType,
  TFalse extends ElementType,
> {
  condition: boolean;
  whenTrue: TTrue;
  trueProps?: ComponentProps<TTrue>;
  whenFalse: TFalse;
  falseProps?: ComponentProps<TFalse>;
  common?: ComponentProps<TTrue> & ComponentProps<TFalse>;
  children?: ReactNode;
}

const ConditionalImpl = <
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
}: ConditionalProps<TTrue, TFalse>) => {
  const truePropsWithCommon = useMemo(
    () => ({ ...common, ...trueProps }),
    [common, trueProps],
  );

  const falsePropsWithCommon = useMemo(
    () => ({ ...common, ...falseProps }),
    [common, falseProps],
  );

  return condition
    ? createElement(whenTrue, truePropsWithCommon, children)
    : createElement(whenFalse, falsePropsWithCommon, children);
};

const Conditional = memo(ConditionalImpl) as typeof ConditionalImpl;
export default Conditional;
