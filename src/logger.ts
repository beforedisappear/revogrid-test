// src/logger.ts
function domLogger() {
  let container = document.getElementById("debug-log");
  let toggleButton = document.getElementById(
    "debug-log-toggle"
  ) as HTMLButtonElement | null;
  if (!container) {
    container = document.createElement("pre");
    container.id = "debug-log";
    container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      max-height: 40%;
      width: 100%;
      overflow-y: auto;
      background: rgba(0,0,0,0.85);
      color: #0f0;
      font-size: 12px;
      padding: 6px;
      margin: 0;
      z-index: 99999;
      white-space: pre-wrap;     /* ✅ перенос длинных строк */
      word-wrap: break-word;     /* ✅ разрывать слова при необходимости */
    `;
    document.body.appendChild(container);
  }

  if (!toggleButton) {
    toggleButton = document.createElement("button");
    toggleButton.id = "debug-log-toggle";
    toggleButton.type = "button";
    toggleButton.textContent = "Скрыть лог";
    toggleButton.setAttribute("aria-controls", "debug-log");
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 8px;
      transform: translateY(-100%);
      padding: 4px 8px;
      background: #222;
      color: #0f0;
      border: 1px solid #444;
      border-bottom: none;
      border-radius: 6px 6px 0 0;
      font-size: 12px;
      cursor: pointer;
      z-index: 100000;
      opacity: 0.8;
    `;
    document.body.appendChild(toggleButton);
  }

  const hiddenKey = "debug-log-hidden";
  const applyHiddenState = (hidden: boolean) => {
    (container as HTMLElement).style.display = hidden ? "none" : "block";
    (toggleButton as HTMLButtonElement).textContent = hidden
      ? "Показать лог"
      : "Скрыть лог";
    (toggleButton as HTMLButtonElement).style.transform = hidden
      ? "translateY(0)"
      : "translateY(-100%)";
  };

  const savedHidden = localStorage.getItem(hiddenKey);
  if (savedHidden === "1") {
    applyHiddenState(true);
  } else {
    applyHiddenState(false);
  }

  toggleButton.addEventListener("click", () => {
    const isHidden = (container as HTMLElement).style.display === "none";
    applyHiddenState(!isHidden);
    localStorage.setItem(hiddenKey, !isHidden ? "1" : "0");
  });

  container.addEventListener("dblclick", () => {
    applyHiddenState(true);
    localStorage.setItem(hiddenKey, "1");
  });

  function serialize(value: unknown): string {
    if (value instanceof Error) {
      return `${value.name}: ${value.message}\n${value.stack ?? ""}`;
    }
    if (typeof value === "object" && value !== null) {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return Object.prototype.toString.call(value);
      }
    }
    return String(value);
  }

  function write(prefix: string, ...args: unknown[]) {
    const line = `[${prefix}] ` + args.map(serialize).join(" ");
    container!.textContent += line + "\n";
  }

  return {
    log: (...args: unknown[]) => write("LOG", ...args),
    warn: (...args: unknown[]) => write("WARN", ...args),
    error: (...args: unknown[]) => write("ERR", ...args),
  };
}

export const myConsole = domLogger();
