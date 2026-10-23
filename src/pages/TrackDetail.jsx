import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Breadcrumbs, Button, Link, Typography } from "@mui/material";
import Stack from "../components/Stack";
import { contentApi, learnerApi } from "../api/endpoints";
import { Difficulty, ErrorState, Loading, Meta, PageHeader, StatusChip, EmptyState } from "../components/ui";
import { useEnrollments } from "../lib/queries";
import { useAuth } from "../auth/AuthContext";
import { label, weeks } from "../lib/format";
import { palette } from "../theme/theme";
import { useState } from "react";

export default function TrackDetail() {
  const { trackId } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [enrollError, setEnrollError] = useState(null);

  const track = useQuery({ queryKey: ["track", trackId], queryFn: () => contentApi.track(trackId) });
  const syllabus = useQuery({ queryKey: ["syllabus", trackId], queryFn: () => contentApi.syllabus(trackId) });
  const enrollments = useEnrollments(user.role === "learner");
  const existing = (enrollments.data || []).find((e) => e.track === trackId);

  const enroll = useMutation({
    mutationFn: () => learnerApi.enroll(trackId),
    onSuccess: (e) => {
      qc.invalidateQueries({ queryKey: ["enrollments"] });
      nav(`/learn/${e.id}`);
    },
    onError: setEnrollError,
  });

  if (track.isLoading || syllabus.isLoading) return <Loading />;
  if (track.isError) return <ErrorState error={track.error} onRetry={track.refetch} />;
  const t = track.data;
  const modules = syllabus.data || [];
  const taskCount = modules.reduce((n, m) => n + m.tasks.length, 0);

  let action = null;
  if (user.role === "learner") {
    action = existing ? (
      <Button component={RouterLink} to={`/learn/${existing.id}`} variant="contained" size="large">Continue track</Button>
    ) : (
      <Button variant="contained" size="large" onClick={() => enroll.mutate()} disabled={enroll.isPending}>
        {enroll.isPending ? "Enrolling…" : "Enroll in this track"}
      </Button>
    );
  } else if (user.role === "admin") {
    action = <Button component={RouterLink} to={`/admin/content/${t.id}`} variant="outlined">Edit content</Button>;
  }

  return (
    <>
      <PageHeader
        back={
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/tracks" underline="hover" color="text.secondary">Tracks</Link>
            <Typography color="text.primary">{t.title}</Typography>
          </Breadcrumbs>
        }
        title={t.title}
        subtitle={t.description}
        actions={action}
      />
      {enrollError && <ErrorState error={enrollError} />}
      <Box sx={{ mb: 5 }}>
        <Meta items={[t.programmingLanguage, label(t.skillLevel), weeks(t.estimatedDurationWeeks), `${modules.length} ${modules.length === 1 ? "module" : "modules"}`, `${taskCount} ${taskCount === 1 ? "task" : "tasks"}`]} />
      </Box>

      <Typography variant="h3" sx={{ mb: 2 }}>Syllabus</Typography>
      {modules.length === 0 ? (
        <EmptyState title="No modules yet" body="This track doesn’t have any published modules." />
      ) : (
        <Stack gap={4}>
          {modules.map((m, mi) => (
            <Box key={m.id} component="section" aria-labelledby={`m-${m.id}`}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                <Typography variant="h4" id={`m-${m.id}`}>Module {mi + 1}: {m.title}</Typography>
                {user.role !== "learner" && <StatusChip status={m.status} />}
              </Box>
              {m.description && <Typography color="text.secondary" sx={{ mb: 1.5, maxWidth: "65ch" }}>{m.description}</Typography>}
              <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5 }}>
                {m.tasks.map((task, i) => (
                  <Box
                    component="li"
                    key={task.id}
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, px: 2.5, py: 1.75, borderTop: i ? `1px solid ${palette.line}` : 0 }}
                  >
                    <Typography sx={{ fontWeight: 550 }}>{task.title}</Typography>
                    <Stack direction="row" gap={2} alignItems="center" flexShrink={0}>
                      {user.role !== "learner" && <StatusChip status={task.status} />}
                      <Difficulty value={task.estimatedDifficulty} />
                      {user.role !== "learner" && (
                        <Link component={RouterLink} to={`/tasks/${task.id}`} variant="body2" fontWeight={600}>View</Link>
                      )}
                    </Stack>
                  </Box>
                ))}
                {m.tasks.length === 0 && <Typography color="text.secondary" sx={{ p: 2.5 }}>No tasks in this module yet.</Typography>}
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </>
  );
}
