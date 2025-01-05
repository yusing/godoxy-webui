"use client";

import { faFile, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@nextui-org/button";
import { Tab, Tabs } from "@nextui-org/tabs";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import ConfigEditor from "@/components/config_editor";
import ErrorPopup from "@/components/error_popup";
import { NewFileButton } from "@/components/new_file_button";
import { NextToastContainer } from "@/components/toast_container";
import ConfigFile from "@/types/config_file";
import Endpoints, { checkResponse, fetchEndpoint, FetchError } from "@/types/endpoints";

export default function ConfigEditorPage() {
  const [fileList, setFileList] = useState<ConfigFile[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const [error, setError] = useState<FetchError | null>(null);
  const [isErrOpen, setIsErrOpen] = useState(false);

  const loadFiles = async () => {
    const response = await fetchEndpoint(Endpoints.LIST_CONFIG_FILES);
    await checkResponse(response).catch((e) => {
      setError(e);
      setIsErrOpen(true);
    });

    setFileList(
      ((await response.json()) as string[]).map(
        (fname: string) => new ConfigFile(fname),
      ),
    );
  };

  const loadFilesCallback = useCallback(async () => {
    return await loadFiles()
      .catch(toast)
      .then(() => {
        if (fileList.length > 0) setSelectedKey(fileList[0].getFilename());
        return fileList;
      });
  }, []);

  useEffect(() => {
    loadFilesCallback();
  }, [loadFilesCallback]);

  const createNewFile = (filename: string) => {
    setFileList([...fileList, ConfigFile.Create(filename)]);
    setSelectedKey(filename);
  };

  const filenameValidators = [
    (name: string) => (name.length > 0 ? null : "File name cannot be empty"),
    (name: string) =>
      name.endsWith(".yml") || name.endsWith(".yaml")
        ? null
        : "File name must end with .yml or .yaml",
  ];

  const onSelectTab = (key: React.Key) => {
    // skip if filelist not yet loaded
    if (fileList.length === 0) return;
    if (key.toString() === selectedKey) return;
    setSelectedKey(key.toString());
  };

  const saveFile = () => {
    const fileIndex = fileList.findIndex(
      (f) => f.getFilename() === selectedKey,
    );

    fileList[fileIndex]
      .updateRemote()
      .then(() => toast.success("Saved"))
      .catch((e) => {
        setError(e);
        setIsErrOpen(true);
      });
  };

  return (
    <div>
      <NextToastContainer />
      <div className="flex flex-row justify-between pb-4 px-4">
        <p className="text-2xl font-medium align-middle">Config Editor</p>

        <div className="flex justify-end gap-4">
          <NewFileButton
            validators={filenameValidators}
            onValid={createNewFile}
          />
          <Button variant="ghost" onPress={saveFile}>
            <FontAwesomeIcon icon={faSave} />
          </Button>
        </div>
      </div>
      <ErrorPopup error={error} isOpen={isErrOpen} setIsOpen={setIsErrOpen} />
      <Tabs
        isVertical
        aria-label="Config Files"
        classNames={{
          tab: ["justify-start", "items-center"],
        }}
        items={fileList}
        selectedKey={selectedKey}
        variant="light"
        onSelectionChange={onSelectTab}
      >
        {(file) => (
          <Tab
            key={file.getFilename()}
            title={
              <div className="flex space-x-2 justify-center items-center">
                <FontAwesomeIcon icon={faFile} size="lg" />
                <span>{file.getFilename()}</span>
              </div>
            }
          >
            <ConfigEditor file={file} />
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
