// import { PivotShowcase } from "./Pivot/Pivot";
import { PivotShowcase } from "./Pivot/Pivot";
import { DataGrid } from "./DataGrid/DataGrid";
import { useData } from "./useData";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import { DataGridLikePivot } from "./DataGridLikePivot/DataGridLikePivot";
import { AsyncColumnsGrid } from "./AsyncColumnsGrid/AsyncColumnsGrid";
import { GroupedColumnsGrid } from "./GroupedColumnsGrid/GroupedColumnsGrid";
import { MultiRowHeadersGrid } from "./MultiRowHeadersGrid/MultiRowHeadersGrid";
import ValidationGrid from "./ValidationGrid/ValidationGrid";
import AntdSelectGrid from "./AntdSelectGrid/AntdSelectGrid";

function App() {
  const { rows, columns, loaded, error } = useData();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/grid">Data Grid</Link>
        <Link to="/pivot">Pivot Table</Link>
        <Link to="/grid-like-pivot">Data Grid Like Pivot</Link>
        <Link to="/async-columns">Async Columns Grid</Link>
        <Link to="/grouped-columns">Grouped Columns Grid</Link>
        <Link to="/multi-row-headers">Multi Row Headers Grid</Link>
        <Link to="/validation">Validation Grid</Link>
        <Link to="/antd-select-grid">RevoGrid + AntD Select</Link>
      </nav>
      {!loaded && <div>Загрузка...</div>}
      {error && <div style={{ color: "red" }}>Ошибка: {error}</div>}
      {loaded && !error && (
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route
            path="/pivot"
            element={<PivotShowcase rows={rows} columns={columns} />}
          />
          <Route
            path="/grid"
            element={<DataGrid source={rows} columns={columns} />}
          />
          <Route
            path="/async-columns"
            element={<AsyncColumnsGrid rows={rows} />}
          />
          <Route
            path="/grid-like-pivot"
            element={
              <DataGridLikePivot
                rows={rows}
                columns={columns}
                config={{
                  rowFields: ["Group", "Product"],
                  columnFields: ["Year", "Month"],
                  value: "Продано",
                }}
              />
            }
          />
          <Route path="/grouped-columns" element={<GroupedColumnsGrid />} />
          <Route path="/multi-row-headers" element={<MultiRowHeadersGrid />} />
          <Route path="/validation" element={<ValidationGrid />} />
          <Route path="/antd-select-grid" element={<AntdSelectGrid />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
