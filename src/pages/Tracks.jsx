import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Chip, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";
import Stack from "../components/Stack";
import SearchIcon from "@mui/icons-material/Search";
import { PageHeader, Loading, ErrorState, EmptyState, StatusChip, Meta } from "../components/ui";
import { useEnrollments, useTracks } from "../lib/queries";
import { useAuth } from "../auth/AuthContext";
import { LEVELS, label, weeks } from "../lib/format";
import { palette } from "../theme/theme";

export default function Tracks() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const query = { q: q.trim() || undefined, skillLevel: level || undefined };
  const tracks = useTracks(query);
  const enrollments = useEnrollments(user.role === "learner");
  const enrolled = new Map((enrollments.data || []).map((e) => [e.track, e]));

  return (
    <>
      <PageHeader
        title="Tracks"
        subtitle={user.role === "learner" ? "Each track is a sequence of practical tasks. Pick one and work through it in order." : "Everything learners can see, plus drafts for admins."}
      />
      <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search tracks"
          value={q}
          onChange={(e) => setQ(e.target.value)} slotProps={{ htmlInput: { "aria-label": "Search tracks" }, input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }} />
        <TextField select value={level} onChange={(e) => setLevel(e.target.value)} sx={{ minWidth: 200 }} slotProps={{ htmlInput: { "aria-label": "Filter by level" }, select: { displayEmpty: true } }}>
          <MenuItem value="">All levels</MenuItem>
          {LEVELS.map((l) => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
        </TextField>
      </Stack>

      {tracks.isLoading ? <Loading /> : tracks.isError ? <ErrorState error={tracks.error} onRetry={tracks.refetch} /> : tracks.data.items.length === 0 ? (
        <EmptyState title="No tracks match" body={q || level ? "Try a different search or level." : "Tracks will show up here once an admin publishes them."} />
      ) : (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, borderTop: `1px solid ${palette.line}` }}>
          {tracks.data.items.map((t) => {
            const e = enrolled.get(t.id);
            return (
              <Box component="li" key={t.id} sx={{ borderBottom: `1px solid ${palette.line}` }}>
                <Box
                  component={RouterLink}
                  to={`/tracks/${t.id}`}
                  sx={{
                    display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr auto" }, gap: 1, py: 3, px: 1,
                    color: "inherit", textDecoration: "none", borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(20,33,43,0.04)" },
                    "&:hover h3": { textDecoration: "underline", textUnderlineOffset: 4 },
                  }}
                >
                  <Box>
                    <Typography variant="h3" sx={{ mb: 0.75 }}>{t.title}</Typography>
                    <Typography color="text.secondary" sx={{ maxWidth: "62ch", mb: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {t.description}
                    </Typography>
                    <Meta items={[t.programmingLanguage, label(t.skillLevel), weeks(t.estimatedDurationWeeks)]} />
                  </Box>
                  <Stack direction="row" gap={1} alignItems="flex-start">
                    {e && <Chip size="small" label="Enrolled" color="primary" variant="outlined" />}
                    {user.role !== "learner" && <StatusChip status={t.status} />}
                  </Stack>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </>
  );
}
