import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, InputAdornment, MenuItem, Pagination, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import SearchIcon from "@mui/icons-material/Search";
import { userApi } from "../../api/endpoints";
import { EmptyState, ErrorState, Loading, PageHeader, StatusChip } from "../../components/ui";
import { ConfirmDialog, useToast } from "../../components/Feedback";
import { useAuth } from "../../auth/AuthContext";
import { date } from "../../lib/format";
import { palette } from "../../theme/theme";
import { useDebounced } from "../../lib/hooks";

const ROLES = ["learner", "mentor", "admin"];
const STATUSES = ["active", "suspended", "disabled"];

export default function Users() {
  const { user: me } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null);
  const dq = useDebounced(q.trim());

  const list = useQuery({
    queryKey: ["users", { dq, role, status, page }],
    queryFn: () => userApi.list({ q: dq || undefined, role: role || undefined, status: status || undefined, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });

  const change = useMutation({
    mutationFn: ({ user, field, value }) => (field === "role" ? userApi.setRole(user.id, value) : userApi.setStatus(user.id, value)),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast(`${u.fullName} updated`);
      setPending(null);
    },
    onError: (e) => {
      toast(e.message, "error");
      setPending(null);
    },
  });

  const ask = (user, field, value) => {
    if (user[field] === value) return;
    setPending({ user, field, value });
  };

  const reset = (fn) => (e) => { fn(e.target.value); setPage(1); };

  return (
    <>
      <PageHeader title="Users" subtitle="Change roles and suspend or disable accounts. Suspending signs the person out everywhere." />
      <Stack direction={{ xs: "column", md: "row" }} gap={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by name or email" value={q} onChange={reset(setQ)} slotProps={{ htmlInput: { "aria-label": "Search users" }, input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }} />
        <TextField select value={role} onChange={reset(setRole)} sx={{ minWidth: 170 }} slotProps={{ htmlInput: { "aria-label": "Filter by role" }, select: { displayEmpty: true } }}>
          <MenuItem value="">All roles</MenuItem>
          {ROLES.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: "capitalize" }}>{r}</MenuItem>)}
        </TextField>
        <TextField select value={status} onChange={reset(setStatus)} sx={{ minWidth: 170 }} slotProps={{ htmlInput: { "aria-label": "Filter by status" }, select: { displayEmpty: true } }}>
          <MenuItem value="">All statuses</MenuItem>
          {STATUSES.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: "capitalize" }}>{r}</MenuItem>)}
        </TextField>
      </Stack>

      {list.isLoading ? <Loading /> : list.isError ? <ErrorState error={list.error} onRetry={list.refetch} /> : list.data.items.length === 0 ? (
        <EmptyState title="No users found" body="Try a different search or clear the filters." />
      ) : (
        <>
          <Box sx={{ bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5, overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.data.items.map((u) => {
                  const self = u.id === me.id;
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{u.fullName}{self && " (you)"}</Typography>
                        <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Select size="small" value={u.role} disabled={self} onChange={(e) => ask(u, "role", e.target.value)} inputProps={{ "aria-label": `Role for ${u.fullName}` }} sx={{ minWidth: 120, textTransform: "capitalize" }}>
                          {ROLES.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: "capitalize" }}>{r}</MenuItem>)}
                        </Select>
                      </TableCell>
                      <TableCell>
                        {self ? <StatusChip status={u.status} /> : (
                          <Select size="small" value={u.status} onChange={(e) => ask(u, "status", e.target.value)} inputProps={{ "aria-label": `Status for ${u.fullName}` }} sx={{ minWidth: 130, textTransform: "capitalize" }}>
                            {STATUSES.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: "capitalize" }}>{r}</MenuItem>)}
                          </Select>
                        )}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{date(u.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
          {list.data.meta?.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination count={list.data.meta.totalPages} page={page} onChange={(_, p) => setPage(p)} />
            </Stack>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!pending}
        title={pending?.field === "role" ? "Change role?" : "Change account status?"}
        body={pending && (pending.field === "role"
          ? `${pending.user.fullName} will become a ${pending.value}. Their access changes immediately.`
          : pending.value === "active"
            ? `${pending.user.fullName} will be able to sign in again.`
            : `${pending.user.fullName} will be signed out and blocked from signing in.`)}
        confirmLabel={pending?.field === "role" ? "Change role" : "Update status"}
        danger={pending?.field === "status" && pending?.value !== "active"}
        busy={change.isPending}
        onConfirm={() => change.mutate(pending)}
        onClose={() => setPending(null)}
      />
    </>
  );
}
