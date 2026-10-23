import { createTheme } from "@mui/material/styles";

export const palette = {
  ink: "#14212b",
  inkSoft: "#4a5a67",
  canvas: "#eef1f3",
  paper: "#ffffff",
  line: "#d6dde2",
  signal: "#f2b84b",
  signalDeep: "#8a5a00",
  blue: "#1f5f8b",
  blueDark: "#174a6c",
  approved: "#1d7a52",
  revise: "#a8480b",
  pending: "#5b5fa8",
  danger: "#b3261e",
};

const heading = '"Bricolage Grotesque Variable", "Public Sans Variable", system-ui, sans-serif';
const body = '"Public Sans Variable", system-ui, sans-serif';
export const mono = '"JetBrains Mono", ui-monospace, Menlo, monospace';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: palette.blue, dark: palette.blueDark, contrastText: "#fff" },
    secondary: { main: palette.signal, contrastText: palette.ink },
    success: { main: palette.approved },
    warning: { main: palette.revise },
    error: { main: palette.danger },
    text: { primary: palette.ink, secondary: palette.inkSoft },
    divider: palette.line,
    background: { default: palette.canvas, paper: palette.paper },
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: body,
    fontSize: 15,
    h1: { fontFamily: heading, fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.1, letterSpacing: "-0.02em" },
    h2: { fontFamily: heading, fontWeight: 700, fontSize: "1.9rem", lineHeight: 1.15, letterSpacing: "-0.015em" },
    h3: { fontFamily: heading, fontWeight: 650, fontSize: "1.4rem", lineHeight: 1.25, letterSpacing: "-0.01em" },
    h4: { fontFamily: heading, fontWeight: 650, fontSize: "1.15rem", lineHeight: 1.3 },
    h5: { fontFamily: heading, fontWeight: 650, fontSize: "1rem", lineHeight: 1.35 },
    h6: { fontFamily: heading, fontWeight: 650, fontSize: "0.95rem" },
    body1: { lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.55 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: palette.canvas },
        "*:focus-visible": { outline: `2px solid ${palette.blue}`, outlineOffset: 2 },
        "@media (prefers-reduced-motion: reduce)": {
          "*": { animationDuration: "0.001ms !important", transitionDuration: "0.001ms !important" },
        },
        "code, pre": { fontFamily: mono },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 6, paddingInline: 16 } },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiTextField: { defaultProps: { size: "medium", fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: palette.paper, "& fieldset": { borderColor: "#b9c4cc" } },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 4, fontWeight: 600 } } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: palette.inkSoft, borderBottomColor: palette.line },
        root: { borderBottomColor: palette.line },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 8 } } },
  },
});

export default theme;
