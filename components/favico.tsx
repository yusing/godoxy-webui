import { Image } from "@nextui-org/image";
import { useState } from "react";

import log from "@/types/log";

type FavicoProps = {
  base: string;
  href: string;
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

function isURL(str: string) {
  try {
    new URL(str);

    return true;
  } catch {
    return false;
  }
}

function targetHref(str: string) {
  if (str.startsWith("@target")) {
    return str.slice(8);
  }

  return str;
}

export default function FavIcon({ base, href, alt }: FavicoProps) {
  const [fallbackIndex, setFallbackIndex] = useState(0);

  alt = alt.toLowerCase().replaceAll(" ", "-");
  href = targetHref(href);

  const cacheKey = `favico-${alt}`;
  const cached = localStorage.getItem(cacheKey);

  const dashboardIcon = isURL(href)
    ? href
    : href
      ? `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/${href}`
      : `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${alt}.png`;
  const fallbacks = [dashboardIcon, ..._fallbacks];

  let src: string;

  if (cached) {
    src = cached;
  } else if (fallbackIndex == 0) {
    src = dashboardIcon;
  } else {
    src = base + fallbacks[fallbackIndex];
  }

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
      if (fallbacks[fallbackIndex + 1] == new URL(src).href) {
        setFallbackIndex(fallbackIndex + 2);
      }
    } catch {}

    setFallbackIndex(fallbackIndex + 1);
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
