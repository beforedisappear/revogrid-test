import { RevoGrid, type DataType } from "@revolist/react-datagrid";
import type { ColumnRegular, ColumnGrouping } from "@revolist/revogrid";
import { useMemo } from "react";

export function GroupedColumnsGrid() {
  const rows = useMemo<DataType[]>(() => {
    const records: Record<string, unknown>[] = [];

    const groups = [
      { group: "Фрукты", products: ["Яблоко", "Груша"] },
      { group: "Овощи", products: ["Морковь", "Свёкла"] },
    ];
    const months = [
      "2024-01",
      "2024-02",
      "2024-03",
      "2024-04",
      "2024-05",
      "2024-06",
      "2024-07",
      "2024-08",
      "2024-09",
      "2024-10",
      "2024-11",
      "2024-12",
    ];

    const toQuarter = (ym: string) => {
      const m = Number(ym.slice(5, 7));
      if (m <= 3) return "Q1";
      if (m <= 6) return "Q2";
      if (m <= 9) return "Q3";
      return "Q4";
    };
    const toHalf = (ym: string) => {
      const m = Number(ym.slice(5, 7));
      return m <= 6 ? "H1" : "H2";
    };

    type TotalAcc = {
      year: string;
      group: string;
      product?: string;
      sold: number;
      revenue: number;
      wormSum: number;
      count: number;
    };

    const totalsByProduct = new Map<string, TotalAcc>();
    const totalsByGroup = new Map<string, TotalAcc>();
    const overall: TotalAcc = {
      year: "2024",
      group: "Все группы",
      sold: 0,
      revenue: 0,
      wormSum: 0,
      count: 0,
    };

    for (const { group, products } of groups) {
      for (const product of products) {
        for (const ym of months) {
          const year = ym.slice(0, 4);
          const sold = Math.floor(50 + Math.random() * 200);
          const avgPrice = Math.round((10 + Math.random() * 90) * 100) / 100;
          const revenue = Math.round(sold * avgPrice * 100) / 100;
          const wormRate = Math.round(Math.random() * 5 * 10) / 10;

          const productKey = `${year}|${group}|${product}`;
          const productTotal = totalsByProduct.get(productKey) ?? {
            year,
            group,
            product,
            sold: 0,
            revenue: 0,
            wormSum: 0,
            count: 0,
          };
          productTotal.sold += sold;
          productTotal.revenue += revenue;
          productTotal.wormSum += wormRate;
          productTotal.count += 1;
          totalsByProduct.set(productKey, productTotal);

          const groupKey = `${year}|${group}`;
          const groupTotal = totalsByGroup.get(groupKey) ?? {
            year,
            group,
            sold: 0,
            revenue: 0,
            wormSum: 0,
            count: 0,
          };
          groupTotal.sold += sold;
          groupTotal.revenue += revenue;
          groupTotal.wormSum += wormRate;
          groupTotal.count += 1;
          totalsByGroup.set(groupKey, groupTotal);

          overall.sold += sold;
          overall.revenue += revenue;
          overall.wormSum += wormRate;
          overall.count += 1;

          records.push({
            Year: year,
            "Half Year": toHalf(ym),
            Quarter: toQuarter(ym),
            Month: ym,
            Group: group,
            Product: product,
            Продано: sold,
            "Средняя цена": avgPrice,
            Червивость: wormRate,
            Выручка: revenue,
            Версия: "v1",
          });
        }
      }
    }

    const formatSummary = (
      total: TotalAcc,
      label: string,
      product?: string
    ) => {
      const avgPrice =
        total.sold > 0
          ? Math.round((total.revenue / total.sold) * 100) / 100
          : 0;
      const wormRate =
        total.count > 0
          ? Math.round((total.wormSum / total.count) * 10) / 10
          : 0;

      records.push({
        Year: total.year,
        "Half Year": label,
        Quarter: label,
        Month: label,
        Group: total.group,
        Product: product ?? label,
        Продано: total.sold,
        "Средняя цена": avgPrice,
        Червивость: wormRate,
        Выручка: Math.round(total.revenue * 100) / 100,
        Версия: "v1",
      });
    };

    for (const total of totalsByProduct.values()) {
      formatSummary(
        total,
        "Итог продукта",
        `${total.product ?? "Продукт"} — итог`
      );
    }

    for (const total of totalsByGroup.values()) {
      formatSummary(total, "Итог группы", `${total.group} — итог`);
    }

    formatSummary(overall, "Общий итог", "Все товары");

    return records as unknown as DataType[];
  }, []);

  const columns = useMemo<(ColumnRegular | ColumnGrouping<unknown>)[]>(() => {
    const makeGroup = (
      name: string,
      prop: string,
      children: (ColumnRegular | ColumnGrouping<unknown>)[]
    ): ColumnGrouping<unknown> =>
      ({
        name,
        prop,
        children,
      } as unknown as ColumnGrouping<unknown>);

    // Уровень 3 (листья) - фактические колонки
    const level3_1_1_1: ColumnRegular[] = [
      { prop: "Year", name: "Год", size: 100 },
      { prop: "Half Year", name: "Полугодие", size: 120 },
    ];
    const level3_1_1_2: ColumnRegular[] = [
      { prop: "Quarter", name: "Квартал", size: 100 },
      { prop: "Month", name: "Месяц", size: 120 },
    ];
    const level3_1_2_1: ColumnRegular[] = [
      { prop: "Group", name: "Группа продукции", size: 200 },
    ];
    const level3_1_2_2: ColumnRegular[] = [
      { prop: "Product", name: "Название продукта", size: 220 },
    ];
    const level3_2_1_1: ColumnRegular[] = [
      { prop: "Продано", name: "Продано", size: 120 },
      { prop: "Средняя цена", name: "Средняя цена", size: 160 },
    ];
    const level3_2_1_2: ColumnRegular[] = [
      { prop: "Червивость", name: "Червивость", size: 150 },
    ];
    const level3_2_2_1: ColumnRegular[] = [
      { prop: "Выручка", name: "Выручка", size: 160 },
    ];
    const level3_2_2_2: ColumnRegular[] = [
      { prop: "Версия", name: "Версия", size: 100 },
    ];

    // Уровень 3 (группы)
    const group3_1_1_1 = makeGroup("Период 1", "Period1", level3_1_1_1);
    const group3_1_1_2 = makeGroup("Период 2", "Period2", level3_1_1_2);
    const group3_1_2_1 = makeGroup("Товар 1", "Product1", level3_1_2_1);
    const group3_1_2_2 = makeGroup("Товар 2", "Product2", level3_1_2_2);
    const group3_2_1_1 = makeGroup("Метрики 1", "Metrics1", level3_2_1_1);
    const group3_2_1_2 = makeGroup("Метрики 2", "Metrics2", level3_2_1_2);
    const group3_2_2_1 = makeGroup("Метрики 3", "Metrics3", level3_2_2_1);
    const group3_2_2_2 = makeGroup("Метрики 4", "Metrics4", level3_2_2_2);

    // Уровень 2
    const group2_1_1 = makeGroup("Время", "Time", [group3_1_1_1, group3_1_1_2]);
    const group2_1_2 = makeGroup("Товар", "Product", [
      group3_1_2_1,
      group3_1_2_2,
    ]);
    const group2_2_1 = makeGroup("Показатели 1", "MetricsGroup1", [
      group3_2_1_1,
      group3_2_1_2,
    ]);
    const group2_2_2 = makeGroup("Показатели 2", "MetricsGroup2", [
      group3_2_2_1,
      group3_2_2_2,
    ]);

    // Уровень 1
    const group1_1 = makeGroup("Группа A", "GroupA", [group2_1_1, group2_1_2]);
    const group1_2 = makeGroup("Группа B", "GroupB", [group2_2_1, group2_2_2]);

    // Простая колонка без групп
    const simpleColumn: ColumnRegular = {
      prop: "Версия",
      name: "Версия (простая)",
      size: 120,
    };

    return [group1_1, group1_2, simpleColumn];
  }, []);

  return (
    <RevoGrid
      columns={columns as unknown as ColumnRegular[]}
      source={rows}
      theme="default"
      resize={true}
      range={true}
      hide-attribution
      canMoveColumns={true}
      stretch={true}
      colSize={140}
      style={{ height: "100vh", width: "100vw", maxHeight: "600px" }}
    />
  );
}
