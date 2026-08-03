import React, { createContext, useCallback, useContext, useState } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import './AlertContext.scss';

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

  const showAlert = useCallback((message: string, severity: AlertType["severity"]) => {
    setAlert({ message, severity });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert({ message: "", severity: null });
  }, []);

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
      <Snackbar
        className="appToast"
        open={Boolean(alert.severity)}
        autoHideDuration={6000}
        onClose={hideAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        slots={{ transition: Slide }}
        slotProps={{ transition: { direction: "left" } as any }}
      >
        <Alert
          severity={alert.severity ?? "info"}
          variant="outlined"
          onClose={hideAlert}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
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
