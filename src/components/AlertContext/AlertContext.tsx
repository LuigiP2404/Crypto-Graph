import React, { createContext, useContext, useState } from "react";
import './AlertContext.css';

type AlertType = {
  message: string;
  severity: "error" | "warning" | "info" | "success" | null;
};

type AlertContextType = {
  alert: AlertType;
  showAlert: (message: string, severity: AlertType["severity"]) => void;
  hideAlert: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertType>({ message: "", severity: null });

  const showAlert = (message: string, severity: AlertType["severity"]) => {
    setAlert({ message, severity });
  };

  const hideAlert = () => {
    setAlert({ message: "", severity: null });
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used inside AlertProvider");
  }
  return context;
};