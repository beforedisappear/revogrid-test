// import { PivotShowcase } from "./Pivot/Pivot";
import { PivotShowcase } from "./Pivot/Pivot";
import { DataGrid } from "./DataGrid/DataGrid";
import { useData } from "./useData";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import { DataGridLikePivot } from "./DataGridLikePivot/DataGridLikePivot";

function App() {
  const { rows, columns, loaded, error } = useData();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/grid">Data Grid</Link>
        <Link to="/pivot">Pivot Table</Link>
        <Link to="/grid-like-pivot">Data Grid Like Pivot</Link>
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
