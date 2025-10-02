import type { PivotConfig } from "@revolist/rv-pro-trial";
import {
  FilterHeaderPlugin,
  RowSelectPlugin,
  SameValueMergePlugin,
  PivotPlugin,
  AdvanceFilterPlugin,
  RowOddPlugin,
} from "@revolist/rv-pro-trial";
import type { ColumnType } from "@revolist/react-datagrid";
import type { GridPlugin } from "@revolist/revogrid";

export const PIVOT_PLUGINS: GridPlugin[] = [
  FilterHeaderPlugin,
  RowSelectPlugin,
  SameValueMergePlugin,
  PivotPlugin,
  AdvanceFilterPlugin,
  RowOddPlugin,
];

export const PIVOT_CONFIG: PivotConfig = {
  hasConfigurator: true, //показывать конфигуратор
  dimensions: [
    { prop: "Year", name: "Год", filter: true, sortable: true, order: "asc" },
    { prop: "Half Year", name: "Полугодие", filter: true },
    { prop: "Quarter", name: "Квартал", filter: true, sortable: true },
    {
      prop: "Month",
      name: "Месяц",
      filter: true,
      sortable: true,
      order: "asc",
    },
    {
      prop: "Group",
      name: "Группа продукции",
      filter: true,
      sortable: true,
      merge: true,
    },
    {
      prop: "Product",
      name: "Название продукта",
      filter: true,
      sortable: true,
      merge: true,
    },
    { prop: "Версия", name: "Версия", filter: true, sortable: true },
    {
      prop: "Продано",
      name: "Продано",
      filter: true,
      size: 100,
      columnType: "integer",
      sortable: true,
    },
    {
      prop: "Средняя цена",
      name: "Средняя цена",
      filter: true,
      size: 200,
      columnType: "currency",
      sortable: true,
    },
    {
      prop: "Червивость",
      name: "Червивость",
      filter: true,
      size: 200,
      columnType: "percent",
      sortable: true,
    },
    {
      prop: "Выручка",
      name: "Выручка",
      filter: true,
      sortable: true,
      columnType: "currency",
    },
  ],
  i18n: {
    rows: "Строки",
    columns: "Столбцы",
    values: "Меры",
    dragHereRows: "Перетащите сюда строки",
    dragHereColumns: "Перетащите сюда столбцы",
    dragHereValues: "Перетащите сюда меры",
    remove: "Удалить",
  },
  rows: ["Group", "Product"],
  columns: ["Year", "Month"],
  values: [
    { prop: "Выручка", aggregator: "sum" },
    { prop: "Червивость", aggregator: "sum" },
  ],
};

// Определения типов колонок (минимальные, можно расширить при необходимости)
export const COLUMN_TYPES: { [name: string]: ColumnType } = {
  //обработка чисел
  integer: { cellProperties: () => ({ class: { "align-right": true } }) },
  //обработка валюты
  currency: {
    cellParser: (model, column) => {
      const v = Number(model[column.prop]);
      return Number.isFinite(v) ? `${v.toFixed(2)} ₽` : model[column.prop];
    },
    cellProperties: () => ({ class: { "align-right": true } }),
  },
  //обработка процентов
  percent: {
    cellParser: (model, column) => {
      const v = Number(model[column.prop]);
      return Number.isFinite(v) ? `${v.toFixed(1)}%` : model[column.prop];
    },
    cellProperties: () => ({ class: { "align-right": true } }),
  },
  //обработка времени
  time: {},
};
