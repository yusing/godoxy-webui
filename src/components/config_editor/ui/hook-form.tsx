import { FieldValues, Path, RegisterOptions, useForm } from "react-hook-form";

type HookFormProps<T> = {
  value: T;
  onChange: (value: T) => void;
};
type RegisterProps = {
  required?: boolean;
  onChange?: (e: any) => void;
} & Omit<RegisterOptions, "required" | "onChange">;

export default function useHookForm<T extends FieldValues>(
  props: HookFormProps<T>,
) {
  const {
    control,
    register,
    formState: { errors },
  } = useForm<T>({
    values: props.value,
    mode: "onChange",
  });
  return {
    control,
    register: (value: Path<T>, reg?: RegisterProps) =>
      register(value, {
        required: reg?.required ?? `${value} is required`,
        onChange:
          reg?.onChange ??
          ((e) =>
            props.onChange({
              ...props.value,
              [value]: e.target.value,
            })),
      }),
    errors,
  };
}
