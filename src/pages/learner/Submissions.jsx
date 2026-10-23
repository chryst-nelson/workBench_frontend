import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Link, MenuItem, Pagination, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material";
import Stack from "../../components/Stack";
import { learnerApi } from "../../api/endpoints";
import { EmptyState, ErrorState, Loading, PageHeader, StatusChip } from "../../components/ui";
import { useAllProgress, useEnrollments } from "../../lib/queries";
import { STATUS_LABEL, SUBMISSION_TYPES, dateTime } from "../../lib/format";
import { palette } from "../../theme/theme";

export default function Submissions() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const subs = useQuery({
    queryKey: ["submissions", { status, page }],
    queryFn: () => learnerApi.submissions({ status: status || undefined, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });
  const enrollments = useEnrollments();
  const progress = useAllProgress(enrollments.data);
  const titles = new Map(progress.data.flatMap((p) => p.tasks.map((t) => [t.id, t.title])));

  return (
    <>
      <PageHeader title="Submissions" subtitle="Every attempt you’ve sent in, newest first." />
      <TextField
        select value={status}
        onChange={(e) => { setStatus(e.target.value); setPage(1); }} sx={{ width: 240, mb: 3 }} slotProps={{ htmlInput: { "aria-label": "Filter by status" }, select: { displayEmpty: true } }}>
        <MenuItem value="">All statuses</MenuItem>
        {Object.entries(STATUS_LABEL).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
      </TextField>

      {subs.isLoading ? <Loading /> : subs.isError ? <ErrorState error={subs.error} onRetry={subs.refetch} /> : subs.data.items.length === 0 ? (
        <EmptyState
          title={status ? "Nothing with that status" : "No submissions yet"}
          body={status ? "Try another status." : "Work on your current task, then submit it here for review."}
          action={!status && <Button component={RouterLink} to="/" variant="contained">Go to my learning</Button>}
        />
      ) : (
        <>
          <Box sx={{ bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5, overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Attempt</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Sent</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subs.data.items.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Link component={RouterLink} to={`/tasks/${s.task}`} underline="hover" color="inherit">
                        {titles.get(s.task) || "Open task"}
                      </Link>
                    </TableCell>
                    <TableCell>{s.attempt}</TableCell>
                    <TableCell>{SUBMISSION_TYPES[s.type]}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{dateTime(s.submittedAt)}</TableCell>
                    <TableCell><StatusChip status={s.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          {subs.data.meta?.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination count={subs.data.meta.totalPages} page={page} onChange={(_, p) => setPage(p)} />
            </Stack>
          )}
        </>
      )}
    </>
  );
}
