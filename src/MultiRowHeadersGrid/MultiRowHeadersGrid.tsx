import { RevoGrid, type DataType } from "@revolist/react-datagrid";
import type { ColumnRegular, RowHeaders } from "@revolist/revogrid";
import { useMemo } from "react";

export function MultiRowHeadersGrid() {
  const rows = useMemo<DataType[]>(() => {
    const data: Record<string, unknown>[] = [];
    const groups = [
      { name: "Фрукты", products: ["Яблоко", "Груша", "Слива"] },
      { name: "Овощи", products: ["Морковь", "Свёкла", "Картофель"] },
    ];

    for (const { name: group, products } of groups) {
      for (const product of products) {
        for (let month = 1; month <= 6; month += 1) {
          const year = 2024;
          const ym = `${year}-${String(month).padStart(2, "0")}`;
          const sold = Math.round(50 + Math.random() * 250);
          const avgPrice = Math.round((10 + Math.random() * 80) * 100) / 100;
          const defects = Math.round(Math.random() * 5 * 10) / 10;
          const revenue = Math.round(sold * avgPrice * 100) / 100;

          data.push({
            Year: year,
            Month: ym,
            Group: group,
            Product: product,
            Продано: sold,
            "Средняя цена": avgPrice,
            "Дефекты %": defects,
            Выручка: revenue,
          });
        }
      }
    }

    return data as unknown as DataType[];
  }, []);

  const columns = useMemo<ColumnRegular[]>(() => {
    return [
      { prop: "Year", name: "Год", size: 90 },
      { prop: "Month", name: "Месяц", size: 110 },
      { prop: "Продано", name: "Продано", size: 120 },
      { prop: "Средняя цена", name: "Средняя цена", size: 140 },
      { prop: "Дефекты %", name: "Дефекты %", size: 120 },
      { prop: "Выручка", name: "Выручка", size: 140 },
    ];
  }, []);

  const rowHeaders = useMemo<(RowHeaders | string)[]>(() => {
    return [
      "rowDrag",
      {
        name: "#",
        prop: "__index",
        size: 60,
        pin: "colPinStart",
        cellTemplate: (_h, props) => String(props.rowIndex + 1),
      },
      {
        name: "Группа",
        prop: "Group",
        size: 160,
        pin: "colPinStart",
        columnTemplate: (_h, props) =>
          String((props.model as Record<string, unknown>)?.Group ?? ""),
        cellTemplate: (_h, props) =>
          String((props.model as Record<string, unknown>)?.Group ?? ""),
      },
      {
        name: "Продукт",
        prop: "Product",
        size: 180,
        pin: "colPinStart",
        columnTemplate: (_h, props) =>
          String((props.model as Record<string, unknown>)?.Product ?? ""),
        cellTemplate: (_h, props) =>
          String((props.model as Record<string, unknown>)?.Product ?? ""),
      },
    ];
  }, []);

  return (
    <RevoGrid
      columns={columns}
      source={rows}
      rowHeaders={rowHeaders as unknown as RowHeaders}
      theme="default"
      resize={true}
      range={true}
      hide-attribution
      stretch={true}
      canMoveColumns={true}
      style={{ height: "100vh", width: "100vw", maxHeight: "600px" }}
    />
  );
}

export default MultiRowHeadersGrid;
