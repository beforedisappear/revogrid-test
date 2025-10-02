import type { DataType } from "@revolist/react-datagrid";
import type { PivotLikeConfig } from "./DataGridLikePivot";

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

export function unpivotDataGridLikePivotRows(
  gridRows: DataType[],
  config?: Partial<PivotLikeConfig>
): DataType[] {
  const cfg: PivotLikeConfig = { ...DEFAULT_CFG, ...(config ?? {}) };
  const [rowField1, rowField2] = cfg.rowFields;
  const valueProp = cfg.value;

  const result: DataType[] = [];
  // Поддерживаем 2 формата ключа: v_YYYY_MM и v_YYYY_YYYY-MM
  const reMonth = /^v_(\d{4})_((\d{1,2})|(\d{4}-\d{1,2}))$/;

  for (const r of gridRows as unknown as Record<string, unknown>[]) {
    if ((r as Record<string, unknown>).__total === true) continue;

    const leftA = rowField1 ? String(r[rowField1] ?? "") : undefined;
    const leftB = rowField2 ? String(r[rowField2] ?? "") : undefined;

    for (const key of Object.keys(r)) {
      const m = key.match(reMonth);
      if (!m) continue;
      const year = m[1];
      // m[2] может быть 'MM' или 'YYYY-MM' — достаём последний сегмент
      const raw = m[2];
      const monthToken = raw.includes("-") ? raw.split("-").pop() || raw : raw;
      const month = monthToken.padStart(2, "0");
      const value = toNumberSafe(r[key]);

      const rec: Record<string, unknown> = {
        [cfg.columnFields[0]]: year,
        [cfg.columnFields[1]]: month,
        [valueProp]: value,
      };
      if (rowField1) rec[rowField1] = leftA;
      if (rowField2) rec[rowField2] = leftB;
      result.push(rec as unknown as DataType);
    }
  }

  return result;
}
