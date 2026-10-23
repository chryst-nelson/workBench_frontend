import { Box, Typography } from "@mui/material";
import { palette } from "../theme/theme";

export function Mark({ size = 28 }) {
  return (
    <Box component="svg" viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      <rect width="32" height="32" rx="7" fill={palette.signal} />
      <path d="M9 23V9h7a4.5 4.5 0 0 1 0 9H9" fill="none" stroke={palette.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Box>
  );
}

export function Logo({ color = "#fff" }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Mark />
      <Typography variant="h5" component="span" sx={{ color, fontSize: "1.15rem", letterSpacing: "-0.01em" }}>
        Workbench
      </Typography>
    </Box>
  );
}
