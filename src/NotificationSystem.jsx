import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const NotificationContext = createContext(null);

function NotificationIcon({ type }) {
  const common = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    success: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16.5 9" /></>,
    error: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
    warning: <><path d="M10.3 4.8 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 16.5h.01" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7.5h.01" /></>,
  };
  return <svg {...common}>{paths[type] || paths.info}</svg>;
}

function Toast({ item, onDismiss }) {
  return <article className={`global-toast toast-${item.type}`} role={item.type === "error" ? "alert" : "status"} data-testid={`toast-${item.id}`}>
    <span className="global-toast-icon"><NotificationIcon type={item.type} /></span>
    <span className="global-toast-message">{item.message}</span>
    <button className="global-toast-close" type="button" onClick={() => onDismiss(item.id)} aria-label="Dismiss notification" data-testid={`button-dismiss-toast-${item.id}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
    </button>
  </article>;
}

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setItems(previous => previous.filter(item => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const notify = useCallback((message, type = "info", duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems(previous => [...previous.slice(-3), { id, message, type }]);
    const timer = window.setTimeout(() => dismiss(id), duration);
    timers.current.set(id, timer);
    return id;
  }, [dismiss]);

  useEffect(() => () => {
    timers.current.forEach(timer => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  return <NotificationContext.Provider value={{ notify, dismiss }}>
    {children}
    <div className="global-toast-region" aria-live="polite" aria-label="Notifications">
      {items.map(item => <Toast key={item.id} item={item} onDismiss={dismiss} />)}
    </div>
  </NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationProvider");
  return context;
}