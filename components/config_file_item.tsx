import File from "@/types/file";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListboxItem } from "@nextui-org/listbox";

export default function ConfigFileItem({
  file,
  isCurFile,
  setCurFile,
}: Readonly<{
  file: File;
  isCurFile: boolean;
  setCurFile: (f: File) => void;
}>) {
  return (
    <ListboxItem
      key={file.getFilename()}
      aria-label={file.getFilename()}
      startContent={<FontAwesomeIcon icon={faFile} />}
      onPress={() => setCurFile(file)}
      style={{
        color: isCurFile ? "#ffcc00" : "",
        background: isCurFile ? "#444444" : "",
      }}
    >
      {file.getFilename()}
    </ListboxItem>
  );
}
