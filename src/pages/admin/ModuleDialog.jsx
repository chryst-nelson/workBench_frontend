import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Stack from "../../components/Stack";
import { contentApi } from "../../api/endpoints";
import { FormError } from "../../components/ui";

const schema = z.object({
  title: z.string().trim().min(3, "Use at least 3 characters").max(120),
  description: z.string().trim().max(2000).optional(),
});

export default function ModuleDialog({ trackId, module, onClose, onSaved }) {
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: module?.title || "", description: module?.description || "" },
  });
  const { errors } = formState;
  const m = useMutation({
    mutationFn: (v) => (module ? contentApi.updateModule(module.id, v) : contentApi.createModule(trackId, v)),
    onSuccess: onSaved,
    onError: setError,
  });

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" component="form" onSubmit={handleSubmit((v) => { setError(null); m.mutate(v); })} noValidate>
      <DialogTitle>{module ? "Edit module" : "New module"}</DialogTitle>
      <DialogContent>
        <FormError error={error} />
        <Stack gap={2.5} sx={{ pt: 1 }}>
          <TextField label="Title" autoFocus {...register("title")} error={!!errors.title} helperText={errors.title?.message} />
          <TextField label="Description (optional)" multiline minRows={3} {...register("description")} error={!!errors.description} helperText={errors.description?.message} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={m.isPending}>{m.isPending ? "Saving…" : module ? "Save changes" : "Add module"}</Button>
      </DialogActions>
    </Dialog>
  );
}
