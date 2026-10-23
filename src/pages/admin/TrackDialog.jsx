import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import Stack from "../../components/Stack";
import { contentApi } from "../../api/endpoints";
import { FormError } from "../../components/ui";
import { LEVELS } from "../../lib/format";

const schema = z.object({
  title: z.string().trim().min(3, "Use at least 3 characters").max(120),
  description: z.string().trim().min(1, "Add a short description").max(2000),
  programmingLanguage: z.string().trim().min(1, "Enter a language").max(50),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedDurationWeeks: z.coerce.number({ message: "Enter a number" }).int("Whole weeks only").min(1, "At least 1 week").max(260),
});

export default function TrackDialog({ open, track, onClose, onSaved }) {
  const qc = useQueryClient();
  const [error, setError] = useState(null);
  const { register, control, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: track?.title || "",
      description: track?.description || "",
      programmingLanguage: track?.programmingLanguage || "",
      skillLevel: track?.skillLevel || "beginner",
      estimatedDurationWeeks: track?.estimatedDurationWeeks ?? 4,
    },
  });
  const { errors } = formState;

  const m = useMutation({
    mutationFn: (v) => (track ? contentApi.updateTrack(track.id, v) : contentApi.createTrack(v)),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["tracks"] });
      qc.invalidateQueries({ queryKey: ["track", t.id] });
      onSaved?.(t);
    },
    onError: setError,
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" component="form" onSubmit={handleSubmit((v) => { setError(null); m.mutate(v); })} noValidate>
      <DialogTitle>{track ? "Edit track" : "New track"}</DialogTitle>
      <DialogContent>
        <FormError error={error} />
        <Stack gap={2.5} sx={{ pt: 1 }}>
          <TextField label="Title" autoFocus {...register("title")} error={!!errors.title} helperText={errors.title?.message} />
          <TextField label="Description" multiline minRows={3} {...register("description")} error={!!errors.description} helperText={errors.description?.message} />
          <Stack direction={{ xs: "column", sm: "row" }} gap={2.5}>
            <TextField label="Language" {...register("programmingLanguage")} error={!!errors.programmingLanguage} helperText={errors.programmingLanguage?.message} />
            <Controller name="skillLevel" control={control} render={({ field }) => (
              <TextField select label="Level" {...field}>{LEVELS.map((l) => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}</TextField>
            )} />
          </Stack>
          <TextField label="Duration (weeks)" type="number" {...register("estimatedDurationWeeks")} error={!!errors.estimatedDurationWeeks} helperText={errors.estimatedDurationWeeks?.message} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={m.isPending}>{m.isPending ? "Saving…" : track ? "Save changes" : "Create track"}</Button>
      </DialogActions>
    </Dialog>
  );
}
