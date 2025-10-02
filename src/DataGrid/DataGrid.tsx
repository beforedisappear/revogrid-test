import { RevoGrid, type DataType } from "@revolist/react-datagrid";
import type { ColumnRegular } from "@revolist/revogrid";
import { useMemo, useState } from "react";
import {
  FilterHeaderPlugin,
  AdvanceFilterPlugin,
  RowHeaderPlugin,
} from "@revolist/rv-pro-trial";
import "./DataGrid.css";
import type { AfterEditEvent } from "@revolist/revogrid";
import { myConsole } from "../logger";

interface DataGridProps {
  columns: ColumnRegular[];
  source: DataType[];
}

export const DataGrid = ({ columns, source }: DataGridProps) => {
  // локальный стейт строк, чтобы отслеживать изменения из грида
  const [rows, setRows] = useState<DataType[]>(source);

  myConsole.log(rows);

  // сортировка по всем колонкам
  const enhancedColumns = useMemo<ColumnRegular[]>(
    () => columns.map((c, i) => ({ ...c, sortable: true, rowDrag: i === 0 })),
    [columns]
  );

  const displayColumns = enhancedColumns;
  const displaySource = rows;

  const plugins = useMemo(
    () => [FilterHeaderPlugin, AdvanceFilterPlugin, RowHeaderPlugin],
    []
  );

  const handleAfterEdit = (e: CustomEvent<AfterEditEvent>) => {
    const detail = e.detail;
    setRows((prev) => {
      // диапазонное редактирование (автозаливка и т.п.)
      if (detail && typeof detail === "object" && "data" in detail) {
        const updates = detail.data as Record<number, Record<string, unknown>>;
        const next = [...prev];
        for (const key of Object.keys(updates)) {
          const rowIndex = Number(key);
          if (Number.isFinite(rowIndex) && next[rowIndex]) {
            next[rowIndex] = {
              ...next[rowIndex],
              ...updates[rowIndex],
            } as DataType;
          }
        }
        return next;
      }

      // одиночное редактирование ячейки
      if (
        detail &&
        typeof detail === "object" &&
        "model" in detail &&
        "prop" in detail
      ) {
        const { model, prop, val } = detail as {
          model: DataType;
          prop: string;
          val: unknown;
        };
        const idx = prev.findIndex((r) => r === model);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], [prop]: val } as DataType;
        return next;
      }

      return prev;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <RevoGrid
        columns={displayColumns}
        source={displaySource}
        theme="material"
        resize={true}
        range={true}
        canMoveColumns={true}
        hide-attribution
        stretch={true}
        canDrag={true}
        rowHeaders={true}
        colSize={200}
        plugins={plugins}
        onAfteredit={handleAfterEdit}
        style={{ height: "100vh", width: "100vw", maxHeight: "600px" }}
      />
    </div>
  );
};
