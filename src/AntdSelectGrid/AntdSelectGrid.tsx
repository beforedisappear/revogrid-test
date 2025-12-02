import { useMemo, useState } from "react";
import { RevoGrid } from "@revolist/react-datagrid";
import type { ColumnRegular, DataType, Editors } from "@revolist/revogrid";
import { antdSelectEditor } from "./AntdSelectEditor";

type StatusValue = "Новый" | "В обработке" | "Завершён";

type Row = DataType & {
  id: number;
  product: string;
  status: StatusValue;
};

const initialRows: Row[] = [
  { id: 1, product: "Яблоки", status: "Новый" },
  { id: 2, product: "Груши", status: "В обработке" },
  { id: 3, product: "Апельсины", status: "Завершён" },
];

export const AntdSelectGrid = () => {
  const [rows] = useState<Row[]>(initialRows);

  const editors = useMemo<Editors>(
    () => ({
      antdSelect: antdSelectEditor,
    }),
    []
  );

  const columns = useMemo<ColumnRegular[]>(() => {
    return [
      { prop: "id", name: "ID", size: 80, readonly: true },
      { prop: "product", name: "Товар", size: 200 },
      {
        prop: "status",
        name: "Статус (AntD Select editor)",
        size: 220,
        // имя редактора из пропа editors
        editor: "antdSelect" as ColumnRegular["editor"],
      } as ColumnRegular,
    ];
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p>
        RevoGrid с кастомным редактором ячейки на Ant Design Select (открывается
        по двойному клику/Enter).
      </p>
      <RevoGrid
        source={rows}
        columns={columns}
        editors={editors}
        resize
        range
        hide-attribution
        style={{ height: "60vh", width: "100%" }}
      />
    </div>
  );
};

export default AntdSelectGrid;
