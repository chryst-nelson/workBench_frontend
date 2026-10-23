import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Breadcrumbs, Button, IconButton, Link, Tooltip, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { contentApi } from "../../api/endpoints";
import { Difficulty, EmptyState, ErrorState, Loading, Meta, PageHeader, StatusChip } from "../../components/ui";
import { ConfirmDialog, useToast } from "../../components/Feedback";
import { label, weeks } from "../../lib/format";
import { palette } from "../../theme/theme";
import TrackDialog from "./TrackDialog";
import ModuleDialog from "./ModuleDialog";
import TaskDialog from "./TaskDialog";

const move = (arr, i, d) => {
  const next = [...arr];
  const [x] = next.splice(i, 1);
  next.splice(i + d, 0, x);
  return next;
};

function Reorder({ index, count, onMove, name }) {
  return (
    <>
      <Tooltip title="Move up"><span><IconButton size="small" aria-label={`Move ${name} up`} disabled={index === 0} onClick={() => onMove(-1)}><ArrowUpwardIcon fontSize="small" /></IconButton></span></Tooltip>
      <Tooltip title="Move down"><span><IconButton size="small" aria-label={`Move ${name} down`} disabled={index === count - 1} onClick={() => onMove(1)}><ArrowDownwardIcon fontSize="small" /></IconButton></span></Tooltip>
    </>
  );
}

export default function TrackEditor() {
  const { trackId } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [dialog, setDialog] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const track = useQuery({ queryKey: ["track", trackId], queryFn: () => contentApi.track(trackId) });
  const syllabus = useQuery({ queryKey: ["syllabus", trackId], queryFn: () => contentApi.syllabus(trackId) });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["syllabus", trackId] });
    qc.invalidateQueries({ queryKey: ["track", trackId] });
    qc.invalidateQueries({ queryKey: ["tracks"] });
  };
  const run = useMutation({
    mutationFn: ({ fn }) => fn(),
    onSuccess: (_, v) => { refresh(); if (v.ok) toast(v.ok); setConfirm(null); },
    onError: (e) => { toast(e.message, "error"); setConfirm(null); },
  });
  const act = (fn, ok) => run.mutate({ fn, ok });
  const toggle = (kind, item, update) => {
    const next = item.status === "published" ? "draft" : "published";
    act(() => update(item.id, { status: next }), next === "published" ? "Published" : "Moved back to draft");
  };

  if (track.isLoading || syllabus.isLoading) return <Loading />;
  if (track.isError) return <ErrorState error={track.error} onRetry={track.refetch} />;
  if (syllabus.isError) return <ErrorState error={syllabus.error} onRetry={syllabus.refetch} />;

  const t = track.data;
  const modules = syllabus.data;
  const done = () => { setDialog(null); refresh(); };

  return (
    <>
      <PageHeader
        back={
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/admin/content" underline="hover" color="text.secondary">Content</Link>
            <Typography color="text.primary">{t.title}</Typography>
          </Breadcrumbs>
        }
        title={t.title}
        subtitle={t.description}
        actions={
          <>
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setDialog({ kind: "track" })}>Edit</Button>
            <Button variant="contained" onClick={() => toggle("track", t, contentApi.updateTrack)} disabled={run.isPending}>
              {t.status === "published" ? "Unpublish" : "Publish"}
            </Button>
            <Button color="error" variant="outlined" onClick={() => setConfirm({ title: "Delete this track?", body: "This also deletes its modules and tasks. Tracks with enrollments can’t be deleted.", fn: () => contentApi.deleteTrack(t.id), ok: "Track deleted", after: () => nav("/admin/content") })}>Delete</Button>
          </>
        }
      />
      <Stack direction="row" gap={3} alignItems="center" flexWrap="wrap" sx={{ mb: 5 }}>
        <StatusChip status={t.status} />
        <Meta items={[t.programmingLanguage, label(t.skillLevel), weeks(t.estimatedDurationWeeks)]} />
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h3">Modules</Typography>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setDialog({ kind: "module" })}>Add module</Button>
      </Stack>

      {modules.length === 0 ? (
        <EmptyState title="No modules yet" body="Add a module, then add tasks to it. A module needs a published task before it can be published." />
      ) : (
        <Stack gap={3}>
          {modules.map((m, mi) => (
            <Box key={m.id} sx={{ bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5 }}>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ p: 2, pl: 2.5 }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="h4">{m.title}</Typography>
                  {m.description && <Typography variant="body2" color="text.secondary" noWrap>{m.description}</Typography>}
                </Box>
                <StatusChip status={m.status} />
                <Reorder index={mi} count={modules.length} name={m.title} onMove={(d) => act(() => contentApi.reorderModules(t.id, move(modules, mi, d).map((x) => x.id)))} />
                <Button size="small" onClick={() => toggle("module", m, contentApi.updateModule)}>{m.status === "published" ? "Unpublish" : "Publish"}</Button>
                <IconButton size="small" aria-label={`Edit ${m.title}`} onClick={() => setDialog({ kind: "module", module: m })}><EditOutlinedIcon fontSize="small" /></IconButton>
                <IconButton size="small" aria-label={`Delete ${m.title}`} onClick={() => setConfirm({ title: "Delete this module?", body: "Its tasks are deleted too. Modules with learner submissions can’t be deleted.", fn: () => contentApi.deleteModule(m.id), ok: "Module deleted" })}><DeleteOutlinedIcon fontSize="small" /></IconButton>
              </Stack>
              <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, borderTop: `1px solid ${palette.line}` }}>
                {m.tasks.map((task, ti) => (
                  <Stack component="li" key={task.id} direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ px: 2.5, py: 1.25, borderTop: ti ? `1px solid ${palette.line}` : 0 }}>
                    <Typography sx={{ flex: 1, minWidth: 180, fontWeight: 550 }}>{task.title}</Typography>
                    <Difficulty value={task.estimatedDifficulty} />
                    <StatusChip status={task.status} />
                    <Reorder index={ti} count={m.tasks.length} name={task.title} onMove={(d) => act(() => contentApi.reorderTasks(m.id, move(m.tasks, ti, d).map((x) => x.id)))} />
                    <Button size="small" onClick={() => toggle("task", task, contentApi.updateTask)}>{task.status === "published" ? "Unpublish" : "Publish"}</Button>
                    <IconButton size="small" aria-label={`Edit ${task.title}`} onClick={() => setDialog({ kind: "task", moduleId: m.id, taskId: task.id })}><EditOutlinedIcon fontSize="small" /></IconButton>
                    <IconButton size="small" aria-label={`Delete ${task.title}`} onClick={() => setConfirm({ title: "Delete this task?", body: "Tasks with learner submissions can’t be deleted.", fn: () => contentApi.deleteTask(task.id), ok: "Task deleted" })}><DeleteOutlinedIcon fontSize="small" /></IconButton>
                  </Stack>
                ))}
                <Box sx={{ px: 2, py: 1.25, borderTop: m.tasks.length ? `1px solid ${palette.line}` : 0 }}>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setDialog({ kind: "task", moduleId: m.id })}>Add task</Button>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      )}

      {dialog?.kind === "track" && <TrackDialog open track={t} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); toast("Track updated"); }} />}
      {dialog?.kind === "module" && <ModuleDialog trackId={t.id} module={dialog.module} onClose={() => setDialog(null)} onSaved={() => { done(); toast(dialog.module ? "Module updated" : "Module added"); }} />}
      {dialog?.kind === "task" && <TaskDialog moduleId={dialog.moduleId} taskId={dialog.taskId} onClose={() => setDialog(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["task"] }); done(); toast(dialog.taskId ? "Task updated" : "Task added"); }} />}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        body={confirm?.body}
        confirmLabel="Delete"
        danger
        busy={run.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => run.mutate({ fn: confirm.fn, ok: confirm.ok }, { onSuccess: () => confirm.after?.() })}
      />
    </>
  );
}
