import { createContext, useCallback, useContext, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from "@mui/material";

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const show = useCallback((message, severity = "success") => setT({ message, severity, key: Date.now() }), []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <Snackbar
        key={t?.key}
        open={!!t}
        autoHideDuration={t?.severity === "error" ? 7000 : 3500}
        onClose={(_, r) => r !== "clickaway" && setT(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {t ? <Alert severity={t.severity} variant="filled" onClose={() => setT(null)}>{t.message}</Alert> : undefined}
      </Snackbar>
    </ToastCtx.Provider>
  );
}

export function ConfirmDialog({ open, title, body, confirmLabel = "Confirm", danger, busy, onConfirm, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent><DialogContentText>{body}</DialogContentText></DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color={danger ? "error" : "primary"} onClick={onConfirm} disabled={busy}>
          {busy ? "Working…" : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
