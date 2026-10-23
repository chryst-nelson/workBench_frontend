import { Box, Typography } from "@mui/material";
import { Logo } from "../components/Logo";
import { Trail } from "../components/Trail";
import { palette } from "../theme/theme";

const SAMPLE = [
  { key: 1, state: "completed", title: "Build a REST endpoint with validation" },
  { key: 2, state: "completed", title: "Add authentication to it" },
  { key: 3, state: "current", title: "Deploy it and write up what broke" },
  { key: 4, state: "locked", title: "Review feedback and revise" },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(360px, 5fr) 6fr" } }}>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          bgcolor: palette.ink,
          color: "#fff",
          p: { md: 6, lg: 8 },
        }}
      >
        <Logo />
        <Box>
          <Typography variant="h1" sx={{ color: "#fff", maxWidth: 440, mb: 2 }}>
            Ship something real, get a mentor’s eyes on it.
          </Typography>
          <Typography sx={{ color: "#aebcc6", maxWidth: 420, mb: 5 }}>
            Every task is a small project. Submit your work, get reviewed, and the next task opens only when this one is approved.
          </Typography>
          <Box sx={{ maxWidth: 420, "& .MuiTypography-root": { color: "#e8eef2" } }}>
            <Trail
              items={SAMPLE}
              renderItem={(it) => (
                <Typography sx={{ opacity: it.state === "locked" ? 0.55 : 1, fontWeight: it.state === "current" ? 650 : 400 }}>
                  {it.title}
                </Typography>
              )}
            />
          </Box>
        </Box>
        <span />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, sm: 6 }, bgcolor: palette.paper }}>
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 5 }}>
            <Logo color={palette.ink} />
          </Box>
          <Typography variant="h2" component="h1" sx={{ mb: 1 }}>{title}</Typography>
          {subtitle && <Typography color="text.secondary" sx={{ mb: 4 }}>{subtitle}</Typography>}
          {children}
          {footer && <Box sx={{ mt: 4 }}>{footer}</Box>}
        </Box>
      </Box>
    </Box>
  );
}
