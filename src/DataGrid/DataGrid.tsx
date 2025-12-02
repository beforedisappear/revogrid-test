import { RevoGrid, type DataType } from "@revolist/react-datagrid";
import type { ColumnRegular } from "@revolist/revogrid";
import { useMemo, useState } from "react";
import DateColumnPlugin from "@revolist/revogrid-column-date";
import "./DataGrid.css";
import type { AfterEditEvent } from "@revolist/revogrid";
import { myConsole } from "../logger";

type RowType = DataType & { order: number; customDate?: string | null };

interface DataGridProps {
  columns: ColumnRegular[];
  source: DataType[];
}

export const DataGrid = ({ columns, source }: DataGridProps) => {
  // локальный стейт строк, чтобы отслеживать изменения из грида
  const [rows, setRows] = useState<RowType[]>(
    () =>
      source.map((r, i) => ({
        ...r,
        order: i + 1,
        customDate: (r as RowType).customDate ?? null,
      })) as RowType[]
  );

  const ruDateAdapter = {
    // строка → Date
    parse(value = "", createDate: (y: number, m: number, d: number) => Date) {
      // ожидаем формат DD.MM.YYYY
      const m = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      if (!m) return;
      const [, dd, mm, yyyy] = m;
      return createDate(Number(yyyy), Number(mm), Number(dd));
    },

    // Date → строка (то, что увидишь в инпуте)
    format(date: Date) {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    },
  };

  // сортировка по всем колонкам + добавляем колонку order, если её нет
  const enhancedColumns = useMemo<ColumnRegular[]>(() => {
    const hasOrder = columns.some((c) => c.prop === "order");
    const hasDate = columns.some((c) => c.prop === "customDate");
    const columnsWithOrder = hasOrder
      ? columns
      : ([
          { prop: "order", name: "order", size: 400 },
          ...columns,
        ] as ColumnRegular[]);
    const extended = hasDate
      ? columnsWithOrder
      : ([
          ...columnsWithOrder,
          {
            prop: "customDate",
            name: "Дата",
            size: 160,
            columnType: "date",
            valueAsDate: true,
            direction: "left",
            dateAdapter: ruDateAdapter,
            cellTemplate: (h, props) => {
              const raw = props.model[props.prop];
              if (!raw) return "";

              const date = new Date(raw);

              // пример: вывод "ДД.ММ.ГГГГ"
              const formatted = date.toLocaleDateString("ru-RU");
              return formatted;
            },
          },
        ] as ColumnRegular[]);
    return extended.map((c) => ({
      ...c,
      sortable: c.sortable ?? true,
    }));
  }, [columns]);

  const displayColumns = enhancedColumns;
  const displaySource = rows;

  const columnTypes = useMemo(() => ({ date: new DateColumnPlugin() }), []);

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
            } as RowType;
          }
        }
        myConsole.log("Rows updated (range edit)", next);
        return next as RowType[];
      }

      // одиночное редактирование ячейки
      if (
        detail &&
        typeof detail === "object" &&
        "model" in detail &&
        "prop" in detail
      ) {
        const { model, prop, val } = detail as {
          model: RowType;
          prop: string;
          val: unknown;
        };
        const idx = prev.findIndex((r) => r === model);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], [prop]: val } as RowType;
        myConsole.log("Rows updated (single edit)", next);
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
        resize={true}
        range={true}
        hide-attribution
        columnTypes={columnTypes}
        onAfteredit={handleAfterEdit}
        style={{ height: "100vh", width: "100vw", maxHeight: "600px" }}
      />
    </div>
  );
};
