import { Image } from "@nextui-org/image";
import { useState } from "react";

import log from "@/types/log";

type FavicoProps = {
  base: string;
  url: string;
  alt: string;
};

const _fallbacks = [
  "/favicon.ico",
  "/favicon.png",
  "/icon.svg",
  "/images/favicon.ico",
  "/static/favicon.png",
  "/static/dist/assets/icons/icon.png",
  "/assets/img/favicon-default.png",
];

export default function FavIcon({ base, url, alt }: FavicoProps) {
  const [fallbackIndex, setFallbackIndex] = useState(url === "" ? 0 : -1);

  alt = alt.toLowerCase().replaceAll(" ", "-");
  const cacheKey = `favico-${alt}`;
  const cached = localStorage.getItem(cacheKey);
  const iconPath = url.startsWith("icon:") ? url.slice(5) : `png/${alt}.png`;
  const dashboardIcon = `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/${iconPath}`;
  const fallbacks = [dashboardIcon, ..._fallbacks];

  const src = cached
    ? cached
    : fallbackIndex >= 0
      ? fallbackIndex == 0
        ? dashboardIcon
        : base + fallbacks[fallbackIndex]
      : url.startsWith("/")
        ? base + url
        : url;

  let href: string;

  const fallback = () => {
    log.debug(`${alt} fallback: ${fallbacks[fallbackIndex]}`);
    if (cached) {
      localStorage.removeItem(cacheKey);
    }
    if (fallbackIndex >= fallbacks.length - 1) {
      setFallbackIndex(-1);
    }
    if (fallbackIndex < fallbacks.length - 2) {
      setFallbackIndex(fallbackIndex + 1);

      return;
    }
    try {
      href = new URL(src).href;
    } catch {
      href = "";
    }
    if (fallbacks[fallbackIndex + 1] == href) {
      setFallbackIndex(fallbackIndex + 2);
    } else {
      setFallbackIndex(fallbackIndex + 1);
    }
  };

  const saveSrc = () => {
    localStorage.setItem(cacheKey, src);
  };

  return fallbackIndex >= 0 && fallbackIndex < fallbacks.length ? (
    <Image
      alt={alt}
      height={24}
      src={src}
      width={24}
      onError={fallback}
      onLoad={saveSrc}
    />
  ) : (
    <span className="text-default-400 text-lg">⚠️</span>
  );
}
