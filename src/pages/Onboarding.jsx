import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { Logo } from "../components/Logo";
import ProfileForm from "../components/ProfileForm";
import { palette } from "../theme/theme";

export default function Onboarding() {
  const nav = useNavigate();
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: palette.canvas }}>
      <Box sx={{ bgcolor: palette.ink, px: { xs: 2, sm: 5 }, py: 2.5 }}><Logo /></Box>
      <Box sx={{ maxWidth: 640, mx: "auto", px: 2, py: { xs: 5, sm: 8 } }}>
        <Typography variant="h2" component="h1" sx={{ mb: 1 }}>Tell us where you are</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          This helps your mentor give feedback at the right level. You can change it any time from your profile.
        </Typography>
        <Box sx={{ bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5, p: { xs: 2.5, sm: 4 } }}>
          <ProfileForm showName={false} submitLabel="Continue" onSaved={() => nav("/", { replace: true })} />
        </Box>
      </Box>
    </Box>
  );
}
