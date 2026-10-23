import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, FormHelperText, MenuItem, TextField, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import { contentApi } from "../../api/endpoints";
import { ErrorState, FormError, Loading } from "../../components/ui";
import { SUBMISSION_TYPES } from "../../lib/format";

const lines = (v) => v.split("\n").map((s) => s.trim()).filter(Boolean);
const lineList = (name, max) =>
  z.string().refine((v) => lines(v).length >= 1, `Add at least one ${name}`)
    .refine((v) => lines(v).length <= max, `Use ${max} or fewer`)
    .refine((v) => lines(v).every((l) => l.length <= 500), "Keep each line under 500 characters");

const schema = z.object({
  title: z.string().trim().min(3, "Use at least 3 characters").max(150),
  problemDescription: z.string().trim().min(1, "Describe the problem").max(10000),
  learningObjectives: lineList("objective", 20),
  requirements: lineList("requirement", 30),
  instructions: z.string().trim().min(1, "Add instructions").max(10000),
  expectedDeliverables: lineList("deliverable", 20),
  submissionGuidelines: z.string().trim().min(1, "Add submission guidelines").max(5000),
  allowedSubmissionTypes: z.array(z.string()).min(1, "Allow at least one submission type"),
  estimatedDifficulty: z.enum(["easy", "medium", "hard"]),
});

function Form({ moduleId, task, onClose, onSaved }) {
  const [error, setError] = useState(null);
  const { register, control, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title || "",
      problemDescription: task?.problemDescription || "",
      learningObjectives: (task?.learningObjectives || []).join("\n"),
      requirements: (task?.requirements || []).join("\n"),
      instructions: task?.instructions || "",
      expectedDeliverables: (task?.expectedDeliverables || []).join("\n"),
      submissionGuidelines: task?.submissionGuidelines || "",
      allowedSubmissionTypes: task?.allowedSubmissionTypes || ["github"],
      estimatedDifficulty: task?.estimatedDifficulty || "medium",
    },
  });
  const { errors } = formState;

  const m = useMutation({
    mutationFn: (v) => {
      const body = {
        ...v,
        learningObjectives: lines(v.learningObjectives),
        requirements: lines(v.requirements),
        expectedDeliverables: lines(v.expectedDeliverables),
      };
      return task ? contentApi.updateTask(task.id, body) : contentApi.createTask(moduleId, body);
    },
    onSuccess: onSaved,
    onError: setError,
  });

  const list = (name, label, help) => (
    <TextField label={label} multiline minRows={3} {...register(name)} error={!!errors[name]} helperText={errors[name]?.message || help} />
  );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" component="form" onSubmit={handleSubmit((v) => { setError(null); m.mutate(v); })} noValidate>
      <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
      <DialogContent>
        <FormError error={error} />
        <Stack gap={2.5} sx={{ pt: 1 }}>
          <TextField label="Title" autoFocus {...register("title")} error={!!errors.title} helperText={errors.title?.message} />
          <TextField label="Problem" multiline minRows={4} {...register("problemDescription")} error={!!errors.problemDescription} helperText={errors.problemDescription?.message || "Markdown is supported."} />
          {list("learningObjectives", "Learning objectives", "One per line.")}
          {list("requirements", "Requirements", "One per line.")}
          <TextField label="Instructions" multiline minRows={4} {...register("instructions")} error={!!errors.instructions} helperText={errors.instructions?.message || "Markdown is supported."} />
          {list("expectedDeliverables", "Expected deliverables", "One per line.")}
          <TextField label="Submission guidelines" multiline minRows={3} {...register("submissionGuidelines")} error={!!errors.submissionGuidelines} helperText={errors.submissionGuidelines?.message || "Markdown is supported."} />
          <Stack direction={{ xs: "column", sm: "row" }} gap={3} alignItems="flex-start">
            <Controller name="estimatedDifficulty" control={control} render={({ field }) => (
              <TextField select label="Difficulty" {...field} sx={{ maxWidth: 220 }}>
                {["easy", "medium", "hard"].map((d) => <MenuItem key={d} value={d} sx={{ textTransform: "capitalize" }}>{d}</MenuItem>)}
              </TextField>
            )} />
            <Controller name="allowedSubmissionTypes" control={control} render={({ field }) => (
              <div>
                <Typography variant="body2" color="text.secondary">Learners can submit</Typography>
                <FormGroup row>
                  {Object.entries(SUBMISSION_TYPES).map(([k, v]) => (
                    <FormControlLabel
                      key={k}
                      label={v}
                      control={<Checkbox checked={field.value.includes(k)} onChange={(e) => field.onChange(e.target.checked ? [...field.value, k] : field.value.filter((x) => x !== k))} />}
                    />
                  ))}
                </FormGroup>
                {errors.allowedSubmissionTypes && <FormHelperText error>{errors.allowedSubmissionTypes.message}</FormHelperText>}
              </div>
            )} />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={m.isPending}>{m.isPending ? "Saving…" : task ? "Save changes" : "Add task"}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function TaskDialog({ moduleId, taskId, onClose, onSaved }) {
  const task = useQuery({ queryKey: ["task", taskId], queryFn: () => contentApi.task(taskId), enabled: !!taskId, staleTime: 0 });
  if (taskId && task.isLoading)
    return <Dialog open onClose={onClose}><DialogContent sx={{ minWidth: 240 }}><Loading minHeight={120} /></DialogContent></Dialog>;
  if (taskId && task.isError)
    return <Dialog open onClose={onClose}><DialogContent><ErrorState error={task.error} /></DialogContent></Dialog>;
  return <Form moduleId={moduleId} task={task.data} onClose={onClose} onSaved={onSaved} />;
}
