import { useSyncExternalStore } from "react";
import { subscribe, getSnapshot } from "./dataStore";

export function useData() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
