import { useEffect, useState } from "react";

type UrlFragmentCallback = (fragment: string) => void;

type UrlFragmentActions = {
  addCallback: (callback: UrlFragmentCallback) => void;
  removeCallback: (callback: UrlFragmentCallback) => void;
};

export function useUrlFragment(): [UrlFragmentActions] {
  const [callbacks, setCallbacks] = useState<UrlFragmentCallback[]>([]);

  useEffect(() => {
    const handleFragmentChange = () => {
      const fragment = window.location.hash.slice(1);
      callbacks.forEach((callback) => callback(fragment));
    };
    handleFragmentChange();
    window.addEventListener("hashchange", handleFragmentChange);
    return () => {
      window.removeEventListener("hashchange", handleFragmentChange);
    };
  }, []);

  return [
    {
      addCallback: (callback) => setCallbacks([...callbacks, callback]),
      removeCallback: (callback) =>
        setCallbacks(callbacks.filter((c) => c !== callback)),
    },
  ];
}

export function setUrlFragment(fragment: string) {
  window.location.hash = fragment;
}
