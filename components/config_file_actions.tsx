import { FileType } from "@/types/endpoints";
import { faAdd, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListboxItem, ListboxSection } from "@nextui-org/listbox";
import path from "path";
import { NewFileButton } from "./new_file_button";

function validate(input: string) {
  if (input.length === 0) {
    return "File name cannot be empty";
  }
  if (path.basename(input) !== input) {
    return "File name cannot contain path separators";
  }
  return null;
}

export default function ConfigFileActions({
  checkExists,
  createFile,
  saveFile,
}: Readonly<{
  checkExists: (fileType: FileType, filename: string) => boolean;
  createFile: (fileType: FileType, filename: string) => void;
  saveFile: () => void;
}>) {
  return (
    <ListboxSection title="Actions">
      <ListboxItem
        aria-label="New File"
        startContent={<FontAwesomeIcon icon={faAdd} />}
      >
        <NewFileButton
          fileExtension=".yml"
          validate={(t, name) => {
            const err = validate(name);
            if (err) return err;
            return checkExists(t, name) ? "File already exists" : null;
          }}
          onSubmit={(t, name) => createFile(t, name + ".yml")}
        />
      </ListboxItem>
      <ListboxItem
        aria-label="Save File"
        startContent={<FontAwesomeIcon icon={faSave} />}
        onPress={saveFile}
      >
        Save
      </ListboxItem>
    </ListboxSection>
  );
}
