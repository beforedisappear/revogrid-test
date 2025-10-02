import { RevoGrid, type DataType } from "@revolist/react-datagrid";
import type { ColumnRegular, ColumnGrouping } from "@revolist/revogrid";
import { useMemo } from "react";
import { myConsole } from "../logger";
import { unpivotDataGridLikePivotRows } from "./unpivot";
import {
  FilterHeaderPlugin,
  AdvanceFilterPlugin,
  SameValueMergePlugin,
} from "@revolist/rv-pro-trial";
import { COLUMN_TYPES } from "../Pivot/config";
import "./styles.css";

export type PivotLikeConfig = {
  rowFields: string[]; // например ["Group", "Product"]
  columnFields: string[]; // например ["Year", "Month"]
  value: string; // например "Выручка"
};

type Props = {
  rows: DataType[];
  columns: ColumnRegular[];
  config?: Partial<PivotLikeConfig>;
};

const DEFAULT_CFG: PivotLikeConfig = {
  rowFields: ["Group", "Product"],
  columnFields: ["Year", "Month"],
  value: "Выручка",
};

function toNumberSafe(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function DataGridLikePivot({ rows, config }: Props) {
  const cfg = useMemo<PivotLikeConfig>(
    () => ({ ...DEFAULT_CFG, ...(config ?? {}) }),
    [config]
  );
  const [rowField1, rowField2] = cfg.rowFields;
  const [colFieldYear, colFieldMonth] = cfg.columnFields;

  // Собираем уникальные колонки по (Year, Month) и готовим список годов
  const { gridColumns, gridRows } = useMemo(() => {
    // Уникальные (year -> months[])
    const yearToMonths = new Map<string, string[]>();

    for (const r of rows as Record<string, unknown>[]) {
      const y = String(r[colFieldYear] ?? "");
      const m = String(r[colFieldMonth] ?? "");
      if (!y || !m) continue;
      const arr = yearToMonths.get(y) ?? [];
      if (!arr.includes(m)) arr.push(m);
      yearToMonths.set(y, arr);
    }

    // Сортируем месяцы по возрастанию (если формат YYYY-MM, достаточно сортировки по строке)
    for (const [y, arr] of Array.from(yearToMonths.entries())) {
      arr.sort();
      yearToMonths.set(y, arr);
    }

    // Билдим список колонок: левые измерения + месяцы + годовые итоги
    const dimColumns: ColumnRegular[] = [];

    if (rowField1)
      dimColumns.push({
        prop: rowField1,
        name: rowField1,
        size: 200,
        merge: true,
      });
    if (rowField2)
      dimColumns.push({
        prop: rowField2,
        name: rowField2,
        size: 220,
        merge: true,
      });

    const valueCols: ColumnRegular[] = [];
    const monthPropList: {
      year: string;
      month: string;
      prop: string;
      name: string;
    }[] = [];

    for (const [year, months] of yearToMonths) {
      for (const m of months) {
        const monthName = `${year}-${m}`;
        const prop = `v_${year}_${m}`;
        monthPropList.push({ year, month: m, prop, name: monthName });
        valueCols.push({
          prop,
          name: monthName,
          size: 140,
          columnType: "currency",
        });
      }
      const totalProp = `v_${year}_TOTAL`;
      valueCols.push({
        prop: totalProp,
        name: `${year} Итог`,
        size: 160,
        columnType: "currency",
      });
    }

    // Группируем месяцы под заголовком года, как в Pivot
    const grouped: (ColumnRegular | ColumnGrouping<unknown>)[] = [
      ...dimColumns.map((c) => ({ ...c, sortable: true })),
    ];

    for (const [year, months] of yearToMonths) {
      const children: ColumnRegular[] = [];
      for (const m of months) {
        const prop = `v_${year}_${m}`;
        children.push({
          prop,
          name: m,
          size: 140,
          columnType: "currency",
          // Подсветка итоговых строк (row __total)
          cellProperties: (props) => ({
            class: {
              "total-row-cell": Boolean(
                (props as unknown as { model?: { __total?: boolean } }).model
                  ?.__total
              ),
            },
          }),
        });
      }
      const totalProp = `v_${year}_TOTAL`;
      children.push({
        prop: totalProp,
        name: "Итог",
        size: 160,
        columnType: "currency",
        // Подсветка колонки Итог и итоговых строк
        cellProperties: (props) => ({
          class: {
            "total-col-cell": true,
            "total-row-cell": Boolean(
              (props as unknown as { model?: { __total?: boolean } }).model
                ?.__total
            ),
          },
        }),
      });
      grouped.push({
        name: String(year),
        children,
      } as unknown as ColumnGrouping<unknown>);
    }

    // Индексы для быстрых выборок
    const byKey = new Map<string, Record<string, unknown>[]>();
    for (const r of rows as Record<string, unknown>[]) {
      const k1 = String(r[rowField1] ?? "");
      const k2 = String(r[rowField2] ?? "");
      const key = `${k1}|${k2}`;
      const arr = byKey.get(key) ?? [];
      arr.push(r);
      byKey.set(key, arr);
    }

    // Список уникальных групп и продуктов в порядке появления
    const orderGroups: string[] = [];
    const orderByGroup = new Map<string, string[]>();
    for (const r of rows as Record<string, unknown>[]) {
      const g = String(r[rowField1] ?? "");
      const p = String(r[rowField2] ?? "");
      if (!orderGroups.includes(g)) orderGroups.push(g);
      const ap = orderByGroup.get(g) ?? [];
      if (!ap.includes(p)) ap.push(p);
      orderByGroup.set(g, ap);
    }

    const gridRowsAll: Record<string, unknown>[] = [];

    // Функция суммирования значений по фильтру
    const sumFor = (
      items: Record<string, unknown>[],
      filter: (r: Record<string, unknown>) => boolean
    ) =>
      items.reduce(
        (acc, r) => (filter(r) ? acc + toNumberSafe(r[cfg.value]) : acc),
        0
      );

    // Генерируем строки продуктов
    for (const g of orderGroups) {
      const products = orderByGroup.get(g) ?? [];
      for (const p of products) {
        const key = `${g}|${p}`;
        const items = byKey.get(key) ?? [];
        const row: Record<string, unknown> = { [rowField1]: g, [rowField2]: p };
        // месяцы
        for (const { year, month, prop } of monthPropList) {
          row[prop] = sumFor(
            items,
            (r) =>
              String(r[colFieldYear] ?? "") === year &&
              String(r[colFieldMonth] ?? "") === month
          );
        }
        // годовые итоги
        for (const year of Array.from(yearToMonths.keys())) {
          const prop = `v_${year}_TOTAL`;
          const months = yearToMonths.get(year) ?? [];
          let s = 0;
          for (const m of months) {
            s += sumFor(
              items,
              (r) =>
                String(r[colFieldYear] ?? "") === year &&
                String(r[colFieldMonth] ?? "") === m
            );
          }
          row[prop] = s;
        }
        gridRowsAll.push(row);
      }

      // Строка подытога по группе
      const totalRow: Record<string, unknown> = {
        [rowField1]: g,
        [rowField2]: `${g} Итог`,
        __total: true,
      };
      for (const { year, month, prop } of monthPropList) {
        let s = 0;
        for (const p of products) {
          const items = byKey.get(`${g}|${p}`) ?? [];
          s += sumFor(
            items,
            (r) =>
              String(r[colFieldYear] ?? "") === year &&
              String(r[colFieldMonth] ?? "") === month
          );
        }
        totalRow[prop] = s;
      }
      for (const year of Array.from(yearToMonths.keys())) {
        const prop = `v_${year}_TOTAL`;
        const months = yearToMonths.get(year) ?? [];
        let s = 0;
        for (const m of months) {
          let acc = 0;
          for (const p of products) {
            const items = byKey.get(`${g}|${p}`) ?? [];
            acc += sumFor(
              items,
              (r) =>
                String(r[colFieldYear] ?? "") === year &&
                String(r[colFieldMonth] ?? "") === m
            );
          }
          s += acc;
        }
        totalRow[prop] = s;
      }
      gridRowsAll.push(totalRow);
    }

    return {
      gridColumns: grouped as unknown as ColumnRegular[],
      gridRows: gridRowsAll as unknown as DataType[],
    };
  }, [rows, cfg, rowField1, rowField2, colFieldYear, colFieldMonth]);

  const plugins = useMemo(
    () => [FilterHeaderPlugin, AdvanceFilterPlugin, SameValueMergePlugin],
    []
  );

  return (
    <RevoGrid
      columns={gridColumns}
      source={gridRows}
      theme="material"
      resize={true}
      range={true}
      hide-attribution
      canMoveColumns={true}
      stretch={true}
      colSize={180}
      plugins={plugins}
      columnTypes={COLUMN_TYPES}
      onAfteredit={(e) => {
        myConsole.log("pivot-like afteredit", (e as CustomEvent).detail);
        const flat = unpivotDataGridLikePivotRows(gridRows, config);
        myConsole.log("pivot-like unpivoted", flat.slice(0, 20));
      }}
      onAftersourceset={() => {
        const flat = unpivotDataGridLikePivotRows(gridRows, config);
        myConsole.log(
          "pivot-like unpivoted (aftersourceset)",
          flat.slice(0, 20)
        );
      }}
      style={{ height: "100vh", width: "100vw", maxHeight: "600px" }}
    />
  );
}

export default DataGridLikePivot;
