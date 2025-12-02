import { useCallback, useMemo, useState } from "react";
import { RevoGrid } from "@revolist/react-datagrid";
import type {
  BeforeSaveDataDetails,
  BeforeRangeSaveDataDetails,
  ColumnRegular,
  DataType,
} from "@revolist/revogrid";
import { CellValidatePlugin, validationRenderer } from "@revolist/rv-pro-trial";
import { myConsole } from "../logger";

type ValidationRow = DataType & {
  id: number;
  product: string;
  quantity: number | string;
  price: number | string;
};

const initialRows: ValidationRow[] = [
  { id: 1, product: "Яблоки", quantity: 10, price: 120 },
  { id: 2, product: "Груши", quantity: 5, price: 95 },
  { id: 3, product: "Апельсины", quantity: 15, price: 150 },
];

const INVALID_HINT = "Разрешены только числа, 0-9999";

const numericValidation = (value?: unknown) => {
  if (value == null || value === "") return false;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 && num <= 9999;
};

export const ValidationGrid = () => {
  const [rows] = useState(initialRows);

  const columns = useMemo<ColumnRegular[]>(() => {
    return [
      { prop: "id", name: "ID", size: 80, readonly: true },
      { prop: "product", name: "Товар", size: 200 },
      {
        prop: "quantity",
        name: "Количество",
        size: 160,
        validate: numericValidation,
        validationTooltip: () => INVALID_HINT,
        ...validationRenderer(),
      },
      {
        prop: "price",
        name: "Цена",
        size: 160,
        validate: numericValidation,
        validationTooltip: () => INVALID_HINT,
        ...validationRenderer(),
      },
    ];
  }, []);

  const handleBeforeEdit = useCallback(
    (event: CustomEvent<BeforeSaveDataDetails>) => {
      const { prop, val } = event.detail;
      const column = columns.find((col) => col.prop === prop);
      const validator = column?.validate;
      if (validator && !validator(val)) {
        event.preventDefault();
        myConsole.log("blocked invalid edit", {
          prop,
          val,
        });
      }
    },
    [columns]
  );

  const handleBeforeRangeEdit = useCallback(
    (event: CustomEvent<BeforeRangeSaveDataDetails>) => {
      const { data } = event.detail;
      const hasInvalidValue = Object.values(data).some((rowValues) =>
        Object.entries(rowValues).some(([prop, value]) => {
          const column = columns.find((col) => col.prop === prop);
          const validator = column?.validate;
          return validator ? !validator(value) : false;
        })
      );
      if (hasInvalidValue) {
        event.preventDefault();
        myConsole.log("blocked invalid range edit", data);
      }
    },
    [columns]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p>
        Здесь подключен плагин `CellValidatePlugin` + встроенные
        `validate/validationRenderer`. Поля с числами подсвечиваются и блокируют
        сохранение, если ввод невалидный.
      </p>
      <RevoGrid
        source={rows}
        columns={columns}
        plugins={[CellValidatePlugin]}
        hide-attribution
        onBeforeedit={handleBeforeEdit}
        onBeforerangeedit={handleBeforeRangeEdit}
        onAfteredit={(e) => {
          myConsole.log("afteredit", e.detail);
        }}
        resize
        range
        style={{ height: "70vh", width: "100%" }}
      />
    </div>
  );
};

export default ValidationGrid;
