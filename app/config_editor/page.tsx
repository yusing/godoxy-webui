"use client";

import { faAdd, faFile, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import ConfigEditor from "@/components/config_editor";
import ErrorPopup from "@/components/error_popup";
import { NewFileButton } from "@/components/new_file_button";
import { NextToastContainer } from "@/components/toast_container";
import ConfigFile, { getConfigFiles } from "@/types/config_file";
import { FetchError } from "@/types/endpoints";
import { Listbox, ListboxItem, ListboxSection } from "@nextui-org/listbox";

const filenameValidators = [
  (name: string) => (name.length > 0 ? null : "File name cannot be empty"),
  (name: string) =>
    name.endsWith(".yml") || name.endsWith(".yaml")
      ? null
      : "File name must end with .yml or .yaml",
];

export default function ConfigEditorPage() {
  const [fileList, setFileList] = useState<Record<string, ConfigFile>>({});
  const [curFile, setCurFile] = useState<ConfigFile>();

  const [error, setError] = useState<FetchError | null>(null);
  const [isErrOpen, setIsErrOpen] = useState(false);

  const onError = useCallback((e: FetchError) => {
    setError(e);
    setIsErrOpen(true);
  }, []);

  const loadFilesCallback = useCallback(() => {
    getConfigFiles(onError)
      .then((files) => {
        setFileList(files);
        for (const file of Object.values(files)) {
          setCurFile(file);
          break;
        }
      })
      .catch(onError);
  }, []);

  useEffect(loadFilesCallback, [loadFilesCallback]);

  const createNewFile = useCallback(
    (filename: string) => {
      const newFile = ConfigFile.Create(filename);
      fileList[filename] = newFile;
      setCurFile(newFile);
    },
    [fileList]
  );

  const saveFile = useCallback(() => {
    if (!curFile) return;

    curFile
      .updateRemote()
      .then(() => toast.success("Saved"))
      .catch(onError);
  }, [curFile]);

  return (
    <>
      <NextToastContainer />
      <ErrorPopup error={error} isOpen={isErrOpen} setIsOpen={setIsErrOpen} />
      <div className="flex flex-row gap-4">
        <Listbox
          classNames={{ base: "w-1/4 max-w-[250px]" }}
          aria-label="Config Files"
          variant="faded"
          selectionMode="none"
        >
          <ListboxSection title="Files" items={Object.entries(fileList)}>
            {([filename, f]) => (
              <ListboxItem
                key={filename}
                startContent={<FontAwesomeIcon icon={faFile} />}
                onPress={() => setCurFile(f)}
                style={{
                  color: f === curFile ? "#ffcc00" : "",
                  background: f === curFile ? "#444444" : "",
                }}
              >
                {filename}
              </ListboxItem>
            )}
          </ListboxSection>
          <ListboxSection title="Actions">
            <ListboxItem startContent={<FontAwesomeIcon icon={faAdd} />}>
              <NewFileButton
                validators={filenameValidators}
                onValid={createNewFile}
              />
            </ListboxItem>
            <ListboxItem
              startContent={<FontAwesomeIcon icon={faSave} />}
              onPress={saveFile}
            >
              Save
            </ListboxItem>
          </ListboxSection>
        </Listbox>
        {curFile && <ConfigEditor file={curFile} onError={onError} />}
      </div>
    </>
  );
}
