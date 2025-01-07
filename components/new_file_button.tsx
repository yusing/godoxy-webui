import { FileType } from "@/types/endpoints";
import { Input } from "@nextui-org/input";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { Radio, RadioGroup } from "@nextui-org/radio";
import { useState } from "react";

export type FormProps = {
  fileExtension: string;
  onSubmit: (fileType: FileType, filename: string) => void;
  validate: (fileType: FileType, filename: string) => string | null;
};

export const NewFileButton = (props: FormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [fileType, setFileType] = useState<FileType>("provider");
  const [isOpen, setIsOpen] = useState(false);

  const validate = (t: FileType, v: string) => {
    setFilename(v);
    const err = props.validate(t, v + props.fileExtension);
    if (err) {
      setError(err);
    } else if (v.indexOf(".") !== -1) {
      setError("File name cannot contain '.'");
    } else {
      setError(null);
    }
  };

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
          <div className="px-1 py-2 w-full gap-2 flex flex-col">
            <RadioGroup
              label="File Type"
              value={fileType}
              orientation="horizontal"
              onValueChange={(t) => {
                setFileType(t as FileType);
                validate(t as FileType, filename);
              }}
            >
              <Radio value="provider">Provider</Radio>
              <Radio value="middleware">Middleware</Radio>
            </RadioGroup>
            <Input
              isRequired
              errorMessage={error}
              isInvalid={error !== null}
              label="File Name"
              size="sm"
              value={filename}
              endContent={props.fileExtension}
              variant="bordered"
              onKeyDown={(e) => {
                if (e.key === "Enter" && error === null) {
                  props.onSubmit(fileType, filename + props.fileExtension);
                  setIsOpen(false);
                }
                if (e.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              onValueChange={(v) => validate(fileType, v)}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
