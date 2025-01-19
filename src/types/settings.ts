import { useLocalStorage } from "@uidotdev/usehooks";

export function useSetting<T>(key: string, initialValue: T): SettingsItem<T> {
  const [val, set] = useLocalStorage<T>(key, initialValue);
  return {
    key: key,
    val: val,
    set: set,
  };
}

export interface SettingsItem<T> {
  key: string;
  val: T;
  set: React.Dispatch<React.SetStateAction<T>>;
}

