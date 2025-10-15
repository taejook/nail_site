import { createContext, useContext, useMemo, useState } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [authModal, setAuthModal] = useState({ open: false, mode: "login" }); // mode: "login" | "register"

  const openAuthModal = (mode = "login") => setAuthModal({ open: true, mode });
  const closeAuthModal = () => setAuthModal((p) => ({ ...p, open: false }));

  const value = useMemo(() => ({ authModal, openAuthModal, closeAuthModal }), [authModal]);

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}
