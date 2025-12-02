import type { ColumnRegular } from "@revolist/revogrid";

// Имитация API: загружаем порциями столбцы с сервера
export async function fetchColumns(
  offset: number,
  limit: number
): Promise<ColumnRegular[]> {
  // эмулируем задержку сети
  await new Promise((r) => setTimeout(r, 300));

  const next: ColumnRegular[] = [];
  for (let i = 0; i < limit; i++) {
    const idx = offset + i + 1;
    next.push({
      prop: `col_${idx}`,
      name: `Column ${idx}`,
      size: 140,
      sortable: true,
    });
  }

  return next;
}

export const MAX_COLUMNS = 200; // лимит общего числа колонок
export const PAGE_SIZE = 20; // размер страницы загрузки
