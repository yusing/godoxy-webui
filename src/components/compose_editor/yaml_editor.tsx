"use client";

import { getDockerComposeSchema } from "@/lib/docker-compose/schema";
import { useState } from "react";
import { useAsync } from "react-use";
import YAMLEditor from "../yaml_editor";

export default function ComposeEditor() {
  const [content, setContent] = useState(demoCompose);
  const schema = useAsync(getDockerComposeSchema, []);

  return (
    <YAMLEditor schema={schema.value} value={content} onChange={setContent} />
  );
}

export const demoCompose = `
services:
  chromium:
    image: lscr.io/linuxserver/chromium:latest
    container_name: chromium
    environment:
      - PUID=1002
      - PGID=1002
      - TZ=Asia/Hong_Kong
      - CHROME_CLI=--no-sandbox
    volumes:
      - ./data/chrome:/config
    expose:
      - 3000
    labels:
      proxy.idle_timeout: 30s
      proxy.aliases: chromium.i.sh
      proxy.#1.port: 3000
      proxy.#1.homepage.name: Chromium
    shm_size: "1gb"
    restart: always
`;
