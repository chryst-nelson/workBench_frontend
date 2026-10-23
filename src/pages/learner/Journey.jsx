import { Link as RouterLink, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Breadcrumbs, Button, Link, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import { contentApi, learnerApi } from "../../api/endpoints";
import { Difficulty, ErrorState, Loading, PageHeader, StatusChip } from "../../components/ui";
import { Trail, TrailLegend } from "../../components/Trail";
import { progressKey } from "../../lib/queries";
import { palette } from "../../theme/theme";

export default function Journey() {
  const { enrollmentId } = useParams();
  const progress = useQuery({ queryKey: progressKey(enrollmentId), queryFn: () => learnerApi.progress(enrollmentId) });
  const trackId = progress.data?.track.id;
  const syllabus = useQuery({ queryKey: ["syllabus", trackId], queryFn: () => contentApi.syllabus(trackId), enabled: !!trackId });

  if (progress.isLoading || syllabus.isLoading || (!syllabus.data && !syllabus.isError && trackId)) return <Loading />;
  if (progress.isError) return <ErrorState error={progress.error} onRetry={progress.refetch} />;

  const { track, summary, tasks } = progress.data;
  const byTask = new Map(tasks.map((t) => [t.id, t]));
  const modules = syllabus.data || [];

  return (
    <>
      <PageHeader
        back={
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="text.secondary">My learning</Link>
            <Typography color="text.primary">{track.title}</Typography>
          </Breadcrumbs>
        }
        title={track.title}
        subtitle={
          summary.isComplete
            ? "Every task is approved. Nice work."
            : `${summary.completedTasks} of ${summary.totalTasks} tasks approved (${summary.percentComplete}%).`
        }
        actions={
          summary.currentTaskId && (
            <Button component={RouterLink} to={`/tasks/${summary.currentTaskId}`} variant="contained" size="large">
              Go to current task
            </Button>
          )
        }
      />
      <Box sx={{ mb: 4 }}><TrailLegend /></Box>

      <Stack gap={5}>
        {modules.map((m, mi) => {
          const items = m.tasks.map((t) => ({ key: t.id, ...byTask.get(t.id), title: t.title, state: byTask.get(t.id)?.state || "locked", estimatedDifficulty: t.estimatedDifficulty, id: t.id }));
          return (
            <Box key={m.id} component="section" aria-labelledby={`m-${m.id}`}>
              <Typography variant="h4" id={`m-${m.id}`} sx={{ mb: 0.5 }}>Module {mi + 1}: {m.title}</Typography>
              {m.description && <Typography color="text.secondary" sx={{ mb: 2.5, maxWidth: "65ch" }}>{m.description}</Typography>}
              <Box sx={{ mt: 2.5 }}>
                <Trail
                  items={items}
                  renderItem={(it) => {
                    const locked = it.state === "locked";
                    const sub = it.latestSubmission;
                    return (
                      <Box
                        sx={{
                          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap",
                          p: 2, borderRadius: 1.5,
                          bgcolor: it.state === "current" ? palette.paper : "transparent",
                          border: it.state === "current" ? `2px solid ${palette.ink}` : "2px solid transparent",
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          {locked ? (
                            <Typography sx={{ color: "text.secondary", fontWeight: 550 }}>{it.title}</Typography>
                          ) : (
                            <Link component={RouterLink} to={`/tasks/${it.id}`} underline="hover" color="inherit" sx={{ fontWeight: 650 }}>
                              {it.title}
                            </Link>
                          )}
                          <Box sx={{ mt: 0.5 }}><Difficulty value={it.estimatedDifficulty} /></Box>
                        </Box>
                        <Stack direction="row" gap={1.5} alignItems="center">
                          {locked && <Typography variant="body2" color="text.secondary">Opens after the previous task is approved</Typography>}
                          {it.state === "completed" && <StatusChip status="approved" />}
                          {it.state === "current" && sub && <StatusChip status={sub.status} />}
                          {it.state === "current" && !sub && <Typography variant="body2" fontWeight={650}>Ready to start</Typography>}
                        </Stack>
                      </Box>
                    );
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </>
  );
}
