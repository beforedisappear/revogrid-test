import { PIVOT_CONFIG, PIVOT_PLUGINS, COLUMN_TYPES } from "./config";
import { RevoGrid } from "@revolist/react-datagrid";
import { useState, useMemo } from "react";

import type { ColumnRegular } from "@revolist/revogrid";
import type { DataType, GroupingOptions } from "@revolist/react-datagrid";
import type { PivotConfig } from "@revolist/rv-pro-trial";

import "./Pivot.css";

type Props = { rows: DataType[]; columns: ColumnRegular[] };

export const PivotShowcase = ({ rows, columns }: Props) => {
  // Pivot configuration state
  const [pivot] = useState<PivotConfig | null>({ ...PIVOT_CONFIG });

  // Additional data for the grid, derived from pivot config
  const additionalData = useMemo(
    () => ({ pivot: pivot ?? undefined }),
    [pivot]
  );

  // Row grouping based on pivot rows: group by all row dimensions except the last (measure level)
  const grouping = useMemo<GroupingOptions | undefined>(() => {
    const rowProps = pivot?.rows ?? [];
    if (rowProps.length < 2) return undefined;
    const props = rowProps.slice(0, rowProps.length - 1);
    return { props };
  }, [pivot]);

  // Initialize plugins (includes SameValueMergePlugin for merged cells)
  const plugins = useMemo(() => PIVOT_PLUGINS, []);

  // Enable sorting on all columns
  const displayColumns = useMemo<ColumnRegular[]>(
    () => columns.map((c) => ({ ...c, sortable: true })),
    [columns]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      <div>
        <RevoGrid
          columns={displayColumns} //столбцы с сортировкой
          hide-attribution //скрыть attribution
          source={rows} //строки
          theme="material" //тема
          resize={true} //можно изменять размер столбцов
          range={true} //можно выделять диапазоны
          plugins={plugins} //плагины
          additionalData={additionalData} //дополнительные данные
          grouping={grouping}
          stretch={true} //растягивать столбцы
          colSize={200} //размер столбцов по умолчанию
          columnTypes={COLUMN_TYPES} //типы столбцов
          style={{
            height: "100vh",
            width: "100vw",
            maxWidth: "calc(100vw - 300px)",
            maxHeight: "600px",
          }}
        />
      </div>
    </div>
  );
};
