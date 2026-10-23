import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { reviewApi } from "../../api/endpoints";
import { EmptyState, ErrorState, Loading, PageHeader } from "../../components/ui";
import { date } from "../../lib/format";
import { palette } from "../../theme/theme";

export default function Learners() {
  const q = useQuery({ queryKey: ["assigned"], queryFn: reviewApi.assigned });
  return (
    <>
      <PageHeader title="My learners" subtitle="Learners an admin has assigned to you." />
      {q.isLoading ? <Loading /> : q.isError ? <ErrorState error={q.error} onRetry={q.refetch} /> : q.data.items.length === 0 ? (
        <EmptyState title="No learners assigned yet" body="An admin assigns learners to mentors. Once you have some, they’ll be listed here." />
      ) : (
        <Box sx={{ bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5, overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Learner</TableCell>
                <TableCell>Track</TableCell>
                <TableCell>Enrolled</TableCell>
                <TableCell>Waiting for review</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {q.data.items.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{e.learnerDetails?.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">{e.learnerDetails?.email}</Typography>
                  </TableCell>
                  <TableCell>{e.trackDetails?.title}{e.status === "completed" && <Chip size="small" label="Finished" sx={{ ml: 1 }} />}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{date(e.enrolledAt)}</TableCell>
                  <TableCell>
                    {e.pendingReviews > 0
                      ? <Button component={RouterLink} to="/review" size="small">{e.pendingReviews} to review</Button>
                      : <Typography color="text.secondary">None</Typography>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </>
  );
}
