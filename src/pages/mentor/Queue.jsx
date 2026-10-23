import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Pagination, Stack as MuiStack, Tab, Tabs, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import { reviewApi } from "../../api/endpoints";
import { EmptyState, ErrorState, Loading, PageHeader, StatusChip } from "../../components/ui";
import { SUBMISSION_TYPES, timeAgo } from "../../lib/format";
import { useAuth } from "../../auth/AuthContext";
import { palette } from "../../theme/theme";

const TABS = [
  { value: "pending_review", label: "Waiting for review" },
  { value: "revision_requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
];

export default function Queue() {
  const { user } = useAuth();
  const [status, setStatus] = useState("pending_review");
  const [page, setPage] = useState(1);
  const q = useQuery({
    queryKey: ["review-queue", { status, page }],
    queryFn: () => reviewApi.queue({ status, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });

  return (
    <>
      <PageHeader
        title="Review queue"
        subtitle={user.role === "admin" ? "Every learner’s submissions, oldest first." : "Submissions from learners assigned to you, oldest first."}
      />
      <Tabs value={status} onChange={(_, v) => { setStatus(v); setPage(1); }} sx={{ mb: 3, borderBottom: `1px solid ${palette.line}` }}>
        {TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} sx={{ fontWeight: 600 }} />)}
      </Tabs>

      {q.isLoading ? <Loading /> : q.isError ? <ErrorState error={q.error} onRetry={q.refetch} /> : q.data.items.length === 0 ? (
        <EmptyState
          title={status === "pending_review" ? "Nothing waiting for review" : "Nothing here yet"}
          body={status === "pending_review" ? (user.role === "mentor" ? "New submissions from your learners will show up here. If this stays empty, ask an admin to assign learners to you." : "New submissions will show up here.") : undefined}
        />
      ) : (
        <>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, borderTop: `1px solid ${palette.line}` }}>
            {q.data.items.map(({ submission: s, learner, task, track }) => (
              <Box component="li" key={s.id} sx={{ borderBottom: `1px solid ${palette.line}` }}>
                <MuiStack
                  component={RouterLink} to={`/review/${s.id}`}
                  sx={{ py: 2.25, px: 1, flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { sm: "center" }, gap: 1.5, color: "inherit", textDecoration: "none", borderRadius: 1, "&:hover": { bgcolor: "rgba(20,33,43,0.04)" } }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5" sx={{ mb: 0.25 }}>{task?.title || "Task"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {learner?.fullName || "Learner"} in {track?.title || "track"}
                    </Typography>
                  </Box>
                  <Stack direction="row" gap={2} alignItems="center" flexShrink={0}>
                    <Typography variant="body2" color="text.secondary">Attempt {s.attempt}, {SUBMISSION_TYPES[s.type]?.toLowerCase()}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 84, textAlign: "right" }}>{timeAgo(s.submittedAt)}</Typography>
                    <StatusChip status={s.status} />
                  </Stack>
                </MuiStack>
              </Box>
            ))}
          </Box>
          {q.data.meta?.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}><Pagination count={q.data.meta.totalPages} page={page} onChange={(_, p) => setPage(p)} /></Stack>
          )}
        </>
      )}
    </>
  );
}
