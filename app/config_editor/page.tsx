"use client"

import Endpoints, { fetchEndpoint, FetchError, formatError } from '@/types/endpoints';
import React, { useEffect, useState } from 'react';

import ConfigEditor from '@/components/config_editor';
import { NewFileButton } from '@/components/new_file_button';
import { NextToastContainer } from '@/components/toast_container';
import ConfigFile from '@/types/config_file';
import { faFile, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@nextui-org/button';
import { Tab, Tabs } from "@nextui-org/tabs";
import { toast } from 'react-toastify';

export default function ConfigEditorPage() {
    const [fileList, setFileList] = useState<ConfigFile[]>([]);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    useEffect(() => {
        const loadFiles = async () => {
            const response = await fetchEndpoint(Endpoints.LIST_CONFIG_FILES);
            setFileList((await response.json() as string[])
                .map((fname: string) => new ConfigFile(fname)));
        };
        loadFiles().catch(toast).then(() => {
            if (fileList.length > 0)
                setSelectedKey(fileList[0].getFilename());
        });
    }, []);

    const createNewFile = (filename: string) => {
        setFileList([...fileList, ConfigFile.Create(filename)]);
        setSelectedKey(filename);
    };

    const filenameValidators = [
        (name: string) => name.length > 0 ? null : 'File name cannot be empty',
        (name: string) => name.endsWith('.yml') || name.endsWith('.yaml') ? null : 'File name must end with .yml or .yaml',
    ]

    const onSelectTab = (key: React.Key) => {
        // skip if filelist not yet loaded
        if (fileList.length === 0) return;
        setSelectedKey(key.toString());
    };

    const saveFile = () => {
        const fileIndex = fileList.findIndex((f) => f.getFilename() === selectedKey);
        fileList[fileIndex]
            .updateRemote()
            .then(() => toast.success('Saved'))
            .catch((e: FetchError) => toast.error(formatError(e)));
    }

    return (
        <div>
            <NextToastContainer />
            <div className='flex flex-row justify-between pb-4 px-4'>
                <p className='text-2xl font-medium align-middle'>Config Editor</p>

                <div className='flex justify-end gap-4'>
                    <NewFileButton onValid={createNewFile} validators={filenameValidators} />
                    <Button variant='ghost' onPress={saveFile}>
                        <FontAwesomeIcon icon={faSave} />
                    </Button>
                </div>
            </div>
            <Tabs
                aria-label="Config Files"
                selectedKey={selectedKey}
                onSelectionChange={onSelectTab}
                variant="light"
                items={fileList}
                isVertical
                classNames={{
                    "tab": [
                        "justify-start",
                        "items-center",
                    ],
                }}
            >
                {(file) => (
                    <Tab
                        key={file.getFilename()}
                        title={
                            <div className="flex space-x-2 justify-center items-center">
                                <FontAwesomeIcon icon={faFile} size='lg' />
                                <span>{file.getFilename()}</span>
                            </div>
                        }
                        children={<ConfigEditor file={file} />}>
                    </Tab>
                )}
            </Tabs>
        </div>
    );
};