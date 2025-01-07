"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import ConfigEditor from "@/components/config_editor";
import ConfigFileActions from "@/components/config_file_actions";
import ErrorPopup from "@/components/error_popup";
import { NextToastContainer } from "@/components/toast_container";
import { FetchError, FileType } from "@/types/endpoints";
import File, {
  configFile,
  getConfigFiles,
  placeholderFiles,
} from "@/types/file";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Listbox, ListboxItem, ListboxSection } from "@nextui-org/listbox";
import log from "loglevel";
import "./styles.css";

export default function ConfigEditorPage() {
  const [files, setFiles] = useState(placeholderFiles);
  const [curFile, setCurFile] = useState(configFile);

  const [error, setError] = useState<FetchError | null>(null);
  const [isErrOpen, setIsErrOpen] = useState(false);

  const onError = useCallback((e: FetchError) => {
    setError(e);
    setIsErrOpen(true);
  }, []);

  const loadFilesCallback = useCallback(() => {
    getConfigFiles()
      .then((files) => {
        log.debug("Files", files);
        setFiles(files);
      })
      .catch(onError);
  }, []);

  useEffect(loadFilesCallback, [loadFilesCallback]);

  const createFile = useCallback(
    (type: FileType, filename: string) => {
      const newFile = File.Create(type, filename);
      files[type].reverse();
      files[type].push(newFile);
      files[type].reverse();
      setCurFile(newFile);
    },
    [files]
  );

  const saveFile = useCallback(() => {
    curFile
      .updateRemote()
      .then(() => toast.success("Saved"))
      .catch(onError);
  }, [curFile]);

  return (
    <>
      <NextToastContainer />
      <ErrorPopup error={error} isOpen={isErrOpen} setIsOpen={setIsErrOpen} />

      <div className="flex flex-row gap-4 max-h-[80vh]">
        <div className="flex flex-col max-w-1/4 max-w-[250px]">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <Listbox
              className="py-0 mt-0"
              aria-label="Files"
              variant="faded"
              selectionMode="single"
              selectedKeys={[`${curFile.getType()}:${curFile.getFilename()}`]}
              disableAnimation
              hideSelectedIcon
              items={Object.entries(files)}
            >
              {([fileType, filenames]) =>
                filenames.length == 0 ? null : (
                  <ListboxSection
                    key={fileType}
                    title={`${fileType[0].toUpperCase()}${fileType.slice(1)} files`}
                    items={filenames}
                  >
                    {(f) => (
                      <ListboxItem
                        key={`${fileType}:${f.getFilename()}`}
                        aria-label={f.getFilename()}
                        startContent={<FontAwesomeIcon icon={faFile} />}
                        onPress={() => setCurFile(f)}
                      >
                        {f.getFilename()}
                      </ListboxItem>
                    )}
                  </ListboxSection>
                )
              }
            </Listbox>
          </div>
          <Listbox
            className="py-0 mb-0 mt-1"
            aria-label="File Actions"
            variant="faded"
            selectionMode="none"
            items={Object.entries(files)}
          >
            {ConfigFileActions({
              checkExists: (t, name) =>
                files[t].some((f) => f.getFilename() === name),
              createFile,
              saveFile,
            })}
          </Listbox>
        </div>
        <ConfigEditor file={curFile} onError={onError} />
      </div>
    </>
  );
}
