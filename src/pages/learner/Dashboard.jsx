import { Link as RouterLink } from "react-router-dom";
import { Box, Button, LinearProgress, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import { PageHeader, Loading, ErrorState, EmptyState, StatusChip } from "../../components/ui";
import { useAllProgress, useEnrollments } from "../../lib/queries";
import { useAuth } from "../../auth/AuthContext";
import { palette } from "../../theme/theme";

function EnrollmentRow({ progress }) {
  const { enrollment, track, summary, tasks } = progress;
  const current = tasks.find((t) => t.id === summary.currentTaskId);
  const sub = current?.latestSubmission;
  return (
    <Box sx={{ bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5, p: { xs: 2.5, sm: 3.5 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h3">{track.title}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {summary.completedTasks} of {summary.totalTasks} tasks approved
          </Typography>
        </Box>
        <Typography variant="h2" component="p" sx={{ fontVariantNumeric: "tabular-nums" }} aria-label={`${summary.percentComplete} percent complete`}>
          {summary.percentComplete}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={summary.percentComplete}
        aria-label="Track progress"
        sx={{ height: 8, borderRadius: 4, bgcolor: "#dfe5e9", "& .MuiLinearProgress-bar": { bgcolor: palette.approved, borderRadius: 4 } }}
      />
      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        {summary.isComplete ? (
          <Typography fontWeight={600}>You’ve finished this track.</Typography>
        ) : current ? (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">Up next</Typography>
            <Stack direction="row" gap={1.5} alignItems="center" flexWrap="wrap">
              <Typography fontWeight={650}>{current.title}</Typography>
              {sub && <StatusChip status={sub.status} />}
            </Stack>
          </Box>
        ) : <span />}
        <Stack direction="row" gap={1}>
          {current && !summary.isComplete && (
            <Button component={RouterLink} to={`/tasks/${current.id}`} variant="contained">
              {sub?.status === "revision_requested" ? "Revise and resubmit" : sub ? "View task" : "Start task"}
            </Button>
          )}
          <Button component={RouterLink} to={`/learn/${enrollment.id}`} variant="outlined">See your path</Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const enrollments = useEnrollments();
  const progress = useAllProgress(enrollments.data);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.fullName.split(" ")[0]}`}
        subtitle="Finish the task in front of you. The next one opens once it’s approved."
      />
      {enrollments.isLoading || (enrollments.data?.length > 0 && progress.isLoading) ? <Loading /> : enrollments.isError ? (
        <ErrorState error={enrollments.error} onRetry={enrollments.refetch} />
      ) : enrollments.data.length === 0 ? (
        <EmptyState
          title="You haven’t enrolled in a track yet"
          body="Pick a track to get your first practical task."
          action={<Button component={RouterLink} to="/tracks" variant="contained">Browse tracks</Button>}
        />
      ) : (
        <Stack gap={3}>{progress.data.map((p) => <EnrollmentRow key={p.enrollment.id} progress={p} />)}</Stack>
      )}
    </>
  );
}
