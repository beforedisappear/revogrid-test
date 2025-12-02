import type { DataType } from "@revolist/react-datagrid";

// Имитация API: загружаем порциями строки с сервера
export async function fetchRows(
  skip: number,
  limit: number
): Promise<DataType[]> {
  // эмулируем задержку сети
  await new Promise((r) => setTimeout(r, 200));

  // генерируем тестовые данные
  const rows: DataType[] = [];
  for (let i = 0; i < limit; i++) {
    const idx = skip + i;
    rows.push({
      ID: idx + 1,
      Year: `202${idx % 4}`,
      "Half Year": idx % 2 === 0 ? "H1" : "H2",
      Quarter: `Q${(idx % 4) + 1}`,
      Month: `2024-${String((idx % 12) + 1).padStart(2, "0")}`,
      Group: `Group ${(idx % 5) + 1}`,
      Product: `Product ${idx + 1}`,
      Продано: Math.floor(Math.random() * 1000) + 100,
      "Средняя цена": Math.floor(Math.random() * 100) + 10,
      Червивость: Math.random() * 100,
      Выручка: Math.floor(Math.random() * 100000) + 10000,
      Версия: `v${(idx % 3) + 1}.0`,
    } as DataType);
  }

  return rows;
}

export const MAX_ROWS = 10000; // лимит общего числа строк
export const ROWS_PAGE_SIZE = 100; // размер страницы загрузки
