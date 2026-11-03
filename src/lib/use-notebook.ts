import { useEffect, useState } from "react";
import {
  emptyNotebook,
  loadNotebook,
  writeNotebook,
  type Notebook,
} from "./notebook";
let memory: Notebook | null = null;
let memoryPersistent = true;
const event = "bni-notebook-change";
function read() {
  try {
    return {
      value: memory ?? loadNotebook(localStorage),
      persistent: memoryPersistent,
    };
  } catch {
    return { value: memory ?? emptyNotebook(), persistent: false };
  }
}
export function useNotebook() {
  const [state, setState] = useState(read);
  useEffect(() => {
    const sync = () =>
      setState(
        memory ? { value: memory, persistent: read().persistent } : read(),
      );
    const external = (e: StorageEvent) => {
      if (e.key === null || e.key === "betternegrosisland:notebook:v1") {
        memory = null;
        memoryPersistent = true;
        setState(read());
      }
    };
    window.addEventListener(event, sync);
    window.addEventListener("storage", external);
    return () => {
      window.removeEventListener(event, sync);
      window.removeEventListener("storage", external);
    };
  }, []);
  const update = (value: Notebook) => {
    memory = value;
    let persistent = true;
    try {
      writeNotebook(localStorage, value);
    } catch {
      persistent = false;
    }
    memoryPersistent = persistent;
    setState({ value, persistent });
    window.dispatchEvent(new CustomEvent(event, { detail: { persistent } }));
    return persistent;
  };
  return { ...state, update };
}
