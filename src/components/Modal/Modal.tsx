import { useEffect, type ReactNode } from "react";
export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => { const close = (event: KeyboardEvent) => event.key === "Escape" && onClose(); document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [onClose]);
  return <div className="modalOverlay" onMouseDown={onClose}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><button className="modalClose" onClick={onClose} aria-label="Закрыть">×</button>{children}</div></div>;
}
