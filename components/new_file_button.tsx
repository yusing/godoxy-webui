import { Input } from "@nextui-org/input";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { useState } from "react";

function _onChange(
  filename: string,
  validators: FormValidator[],
  setValue: (value: string) => void,
  setError: (error: string | null) => void
) {
  setValue(filename);
  for (const validator of validators) {
    const error = validator(filename);

    if (error) {
      setError(error);

      return;
    }
  }
  setError(null);
}

export type FormValidator = (input: string) => string | null;
export type FormProps = {
  onValid: (name: string) => void;
  validators?: FormValidator[];
};

export const NewFileButton = (props: FormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      isOpen={isOpen}
      placement="bottom"
      showArrow={true}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger>New File</PopoverTrigger>
      <PopoverContent className="w-[240px]">
        {(_) => (
          <div className="px-1 py-2 w-full">
            <Input
              isRequired
              errorMessage={error}
              isInvalid={error !== null}
              label="File Name"
              size="sm"
              value={value}
              variant="bordered"
              onKeyDown={(e) => {
                if (e.key === "Enter" && error === null) {
                  props.onValid(value);
                  setIsOpen(false);
                }
                if (e.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              onValueChange={(v) =>
                _onChange(v, props.validators ?? [], setValue, setError)
              }
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
