import {
  type ColumnDataSchemaModel,
  type EditorBase,
  type EditorCtrCallable,
  type EditCell,
  h,
} from "@revolist/revogrid";
import { Select } from "antd";
import { createRoot, type Root } from "react-dom/client";

type StatusValue = "Новый" | "В обработке" | "Завершён";

export const antdSelectEditor: EditorCtrCallable = (
  _column: ColumnDataSchemaModel,
  save,
  close
): EditorBase => {
  let root: Root | null = null;
  let editCell: EditCell | undefined;

  const editor: EditorBase = {
    element: null,
    editCell,

    // RevoGrid вызывает это после рендера контейнера редактора
    componentDidRender() {
      if (!editor.element) return;
      if (!root) {
        root = createRoot(editor.element as HTMLElement);
      }

      const cell = editor.editCell as EditCell | undefined;
      const rawVal =
        cell?.val ??
        (cell?.model && cell.prop
          ? (cell.model as Record<string, unknown>)[cell.prop]
          : undefined);
      const value = (rawVal as StatusValue | undefined) ?? "Новый";

      const handleChange = (next: StatusValue) => {
        save(next, false);
        close(true);
      };

      root.render(
        <div
          style={{
            background: "transparent",
            padding: 0,
            margin: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <Select<StatusValue>
            size="small"
            style={{
              width: "100%",
              height: "100%",
            }}
            value={value}
            onChange={handleChange}
            bordered={false}
            open
            options={[
              { label: "Новый", value: "Новый" },
              { label: "В обработке", value: "В обработке" },
              { label: "Завершён", value: "Завершён" },
            ]}
          />
        </div>
      );
    },

    beforeDisconnect() {
      if (root) {
        root.unmount();
        root = null;
      }
    },

    // контейнер, в который RevoGrid вставит editor.element
    render(createElement = h) {
      return createElement("div", {
        style: {
          background: "transparent",
          padding: "0",
          margin: "0",
          width: "100%",
          height: "100%",
        },
      });
    },
  };

  return editor;
};
