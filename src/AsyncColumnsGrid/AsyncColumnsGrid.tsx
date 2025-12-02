import { RevoGrid, type DataType } from "@revolist/react-datagrid";
import type { ColumnRegular, ViewPortScrollEvent } from "@revolist/revogrid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchColumns, MAX_COLUMNS, PAGE_SIZE } from "./columnsApi";

type Props = { rows: DataType[] };

export const AsyncColumnsGrid = ({ rows }: Props) => {
  const [columns, setColumns] = useState<ColumnRegular[]>([]);
  const [loaded, setLoaded] = useState(0); // сколько колонок загружено
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gridRef = useRef<HTMLElement | null>(null);

  const canLoadMore = loaded < MAX_COLUMNS;

  const loadMore = useCallback(async () => {
    if (loading || !canLoadMore) return;
    setLoading(true);
    setError(null);
    try {
      const next = await fetchColumns(
        loaded,
        Math.min(PAGE_SIZE, MAX_COLUMNS - loaded)
      );
      setColumns((prev) => [...prev, ...next]);
      setLoaded((v) => v + next.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить колонки");
    } finally {
      setLoading(false);
    }
  }, [loading, canLoadMore, loaded]);

  // начальная порция
  useEffect(() => {
    if (loaded === 0) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // оценка ширины колонок для триггера догрузки
  const totalWidth = useMemo(() => {
    const defaultColSize = 140;
    return columns.reduce(
      (acc, c) => acc + (typeof c.size === "number" ? c.size : defaultColSize),
      0
    );
  }, [columns]);

  const handleViewportScroll = (e: CustomEvent<ViewPortScrollEvent>) => {
    const { dimension, coordinate } = e.detail || ({} as ViewPortScrollEvent);
    if (dimension !== "rgCol") return;
    const host = gridRef.current;
    if (!host) return;
    const viewportWidth = host.clientWidth;
    const threshold = 200;
    if (coordinate + viewportWidth >= totalWidth - threshold) {
      void loadMore();
    }
  };

  const displayColumns = columns;
  const displaySource = rows;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {!columns.length && loading && <div>Загрузка колонок…</div>}
      {error && <div style={{ color: "red" }}>Ошибка: {error}</div>}
      <RevoGrid
        ref={gridRef as unknown as never}
        columns={displayColumns}
        source={displaySource}
        theme="material"
        resize={true}
        range={true}
        hide-attribution
        stretch={false}
        colSize={140}
        onViewportscroll={handleViewportScroll}
        style={{ height: "100vh", width: "100vw", maxHeight: "600px" }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          disabled={loading || !canLoadMore}
          onClick={() => void loadMore()}
        >
          {loading
            ? "Загрузка…"
            : canLoadMore
            ? "Загрузить ещё"
            : "Все колонки загружены"}
        </button>
        <span>
          Загружено колонок: {loaded}/{MAX_COLUMNS}
        </span>
      </div>
    </div>
  );
};
