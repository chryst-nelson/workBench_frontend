import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, FormControlLabel, MenuItem, Pagination, Select, Switch, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import { reviewApi, userApi } from "../../api/endpoints";
import { EmptyState, ErrorState, Loading, PageHeader } from "../../components/ui";
import { useToast } from "../../components/Feedback";
import { date } from "../../lib/format";
import { palette } from "../../theme/theme";

const NONE = "none";

export default function Enrollments() {
  const qc = useQueryClient();
  const toast = useToast();
  const [unassigned, setUnassigned] = useState(false);
  const [page, setPage] = useState(1);

  const list = useQuery({
    queryKey: ["admin-enrollments", { unassigned, page }],
    queryFn: () => reviewApi.enrollments({ unassigned: unassigned ? "true" : undefined, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });
  const mentors = useQuery({ queryKey: ["mentors"], queryFn: () => userApi.list({ role: "mentor", status: "active", limit: 100 }) });

  const assign = useMutation({
    mutationFn: ({ id, mentorId }) => reviewApi.assignMentor(id, mentorId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-enrollments"] }); toast("Mentor updated"); },
    onError: (e) => toast(e.message, "error"),
  });

  const options = mentors.data?.items || [];

  return (
    <>
      <PageHeader title="Mentor assignment" subtitle="Each learner’s submissions go to the mentor assigned to their enrollment." />
      <FormControlLabel
        sx={{ mb: 2 }}
        control={<Switch checked={unassigned} onChange={(e) => { setUnassigned(e.target.checked); setPage(1); }} />}
        label="Only learners without a mentor"
      />
      {list.isLoading ? <Loading /> : list.isError ? <ErrorState error={list.error} onRetry={list.refetch} /> : list.data.items.length === 0 ? (
        <EmptyState title={unassigned ? "Every learner has a mentor" : "No enrollments yet"} body={unassigned ? undefined : "Enrollments appear here once learners join a track."} />
      ) : (
        <>
          <Box sx={{ bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5, overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Learner</TableCell>
                  <TableCell>Track</TableCell>
                  <TableCell>Enrolled</TableCell>
                  <TableCell>Mentor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.data.items.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{e.learnerDetails?.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">{e.learnerDetails?.email}</Typography>
                    </TableCell>
                    <TableCell>{e.trackDetails?.title}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{date(e.enrolledAt)}</TableCell>
                    <TableCell>
                      <Select
                        size="small" displayEmpty
                        value={e.mentor || NONE}
                        disabled={assign.isPending}
                        onChange={(ev) => assign.mutate({ id: e.id, mentorId: ev.target.value === NONE ? null : ev.target.value })}
                        inputProps={{ "aria-label": `Mentor for ${e.learnerDetails?.fullName}` }}
                        sx={{ minWidth: 200 }}
                      >
                        <MenuItem value={NONE}><em>Not assigned</em></MenuItem>
                        {options.map((m) => <MenuItem key={m.id} value={m.id}>{m.fullName}</MenuItem>)}
                        {e.mentor && !options.some((m) => m.id === e.mentor) && (
                          <MenuItem value={e.mentor} disabled>{e.mentorDetails?.fullName || "Former mentor"}</MenuItem>
                        )}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          {list.data.meta?.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}><Pagination count={list.data.meta.totalPages} page={page} onChange={(_, p) => setPage(p)} /></Stack>
          )}
        </>
      )}
      {mentors.isSuccess && options.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>No active mentors yet. Give someone the mentor role from the Users page.</Typography>
      )}
    </>
  );
}
