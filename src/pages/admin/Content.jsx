import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import AddIcon from "@mui/icons-material/Add";
import { EmptyState, ErrorState, Loading, Meta, PageHeader, StatusChip } from "../../components/ui";
import { useTracks } from "../../lib/queries";
import { label, weeks } from "../../lib/format";
import { palette } from "../../theme/theme";
import TrackDialog from "./TrackDialog";

export default function Content() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const tracks = useTracks();

  return (
    <>
      <PageHeader
        title="Content"
        subtitle="Tracks contain modules, and modules contain tasks. New content starts as a draft."
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>New track</Button>}
      />
      {tracks.isLoading ? <Loading /> : tracks.isError ? <ErrorState error={tracks.error} onRetry={tracks.refetch} /> : tracks.data.items.length === 0 ? (
        <EmptyState title="No tracks yet" body="Create a track, add modules and tasks, then publish it for learners." action={<Button variant="contained" onClick={() => setOpen(true)}>Create the first track</Button>} />
      ) : (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, borderTop: `1px solid ${palette.line}` }}>
          {tracks.data.items.map((t) => (
            <Box component="li" key={t.id} sx={{ borderBottom: `1px solid ${palette.line}` }}>
              <Stack
                component={RouterLink} to={`/admin/content/${t.id}`}
                direction="row" justifyContent="space-between" alignItems="center" gap={2}
                sx={{ py: 2.5, px: 1, color: "inherit", textDecoration: "none", borderRadius: 1, "&:hover": { bgcolor: "rgba(20,33,43,0.04)" } }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h4" sx={{ mb: 0.5 }}>{t.title}</Typography>
                  <Meta items={[t.programmingLanguage, label(t.skillLevel), weeks(t.estimatedDurationWeeks)]} />
                </Box>
                <StatusChip status={t.status} />
              </Stack>
            </Box>
          ))}
        </Box>
      )}
      {open && <TrackDialog open onClose={() => setOpen(false)} onSaved={(t) => nav(`/admin/content/${t.id}`)} />}
    </>
  );
}
