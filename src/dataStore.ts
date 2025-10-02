import * as XLSX from "xlsx";
import type { DataType } from "@revolist/react-datagrid";
import type { ColumnRegular } from "@revolist/revogrid";
import { myConsole } from "./logger";
import dataUrl from "./data.xlsx?url";

type DataState = {
  rows: DataType[];
  columns: ColumnRegular[];
  loaded: boolean;
  error: string | null;
};

let state: DataState = {
  rows: [],
  columns: [
    { prop: "Year", name: "Год", size: 100 },
    { prop: "Half Year", name: "Полугодие", size: 120 },
    { prop: "Quarter", name: "Квартал", size: 100 },
    { prop: "Month", name: "Месяц", size: 100 },
    { prop: "Group", name: "Группа продукции", size: 200 },
    { prop: "Product", name: "Название продукта", size: 200 },
    { prop: "Продано", name: "Продано", size: 100 },
    { prop: "Средняя цена", name: "Средняя цена", size: 200 },
    { prop: "Червивость", name: "Червивость", size: 200 },
    { prop: "Выручка", name: "Выручка", size: 200 },
    { prop: "Версия", name: "Версия", size: 100 },
  ],
  loaded: false,
  error: null,
};

const listeners = new Set<() => void>();
let started = false;

function setState(partial: Partial<DataState>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  // лениво запускаем загрузку при первой подписке
  if (!started) {
    started = true;
    void fetchData();
  }
  return () => listeners.delete(listener);
}

export function getSnapshot(): DataState {
  return state;
}

async function fetchData() {
  try {
    const resp = await fetch(dataUrl, { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const buf = await resp.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheetName = wb.SheetNames.find((n) => n === "Raw Data");
    if (!sheetName) throw new Error("Sheet 'Raw Data' not found");
    const ws = wb.Sheets[sheetName];
    const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: null,
      raw: true,
    });

    const cleaned = (parsed as Record<string, unknown>[]).map((r) => {
      const rest: Record<string, unknown> = { ...r };

      // Нормализация месяца: YYYY-MM
      const monthValue = rest["Month"] as unknown;
      let ym: string | null = null;
      if (typeof monthValue === "number") {
        const parsedDate = (
          XLSX as unknown as {
            SSF?: {
              parse_date_code?: (v: number) => { y?: number; m?: number };
            };
          }
        ).SSF?.parse_date_code?.(monthValue);
        if (parsedDate && parsedDate.y && parsedDate.m) {
          ym = `${parsedDate.y}-${String(parsedDate.m).padStart(2, "0")}`;
        }
      } else if (typeof monthValue === "string" && monthValue) {
        const m = monthValue.match(/^(\d{4})[-/.](\d{1,2})/);
        if (m) {
          ym = `${m[1]}-${String(Number(m[2])).padStart(2, "0")}`;
        } else {
          const d = new Date(monthValue);
          if (!Number.isNaN(d.getTime())) {
            ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
              2,
              "0"
            )}`;
          }
        }
      } else if (monthValue instanceof Date) {
        ym = `${monthValue.getUTCFullYear()}-${String(
          monthValue.getUTCMonth() + 1
        ).padStart(2, "0")}`;
      }
      if (ym) {
        rest["Month"] = ym;
        if (rest["Year"] == null || rest["Year"] === "") {
          rest["Year"] = ym.slice(0, 4);
        }
      }

      delete (rest as Record<string, unknown>).Date;
      delete (rest as Record<string, unknown>).Column2;
      delete (rest as Record<string, unknown>)["__EMPTY"];
      delete (rest as Record<string, unknown>)["__EMPTY_1"];
      delete (rest as Record<string, unknown>).Day;
      delete (rest as Record<string, unknown>)["Year_1"];
      delete (rest as Record<string, unknown>)["Half Year_1"];
      delete (rest as Record<string, unknown>)["Quarter_1"];
      delete (rest as Record<string, unknown>)["Month_1"];
      return rest;
    }) as unknown as DataType[];

    setState({ rows: cleaned, loaded: true, error: null });
    // myConsole.log("data loaded", cleaned.slice(0, 5));
  } catch (e) {
    myConsole.error("data load failed", e);
    setState({
      loaded: true,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
