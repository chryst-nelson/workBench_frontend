import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import Stack from "../../components/Stack";
import { learnerApi } from "../../api/endpoints";
import { FormError } from "../../components/ui";
import { SUBMISSION_TYPES } from "../../lib/format";

const GITHUB = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
const MIN_WRITTEN = 50;

const buildSchema = () =>
  z
    .object({
      type: z.enum(["github", "deployed_url", "written"]),
      url: z.string().trim().optional(),
      explanation: z.string().trim().optional(),
      notes: z.string().trim().max(2000, "Keep notes under 2000 characters").optional(),
    })
    .superRefine((v, ctx) => {
      if (v.type === "github" && !GITHUB.test(v.url || "")) {
        ctx.addIssue({ code: "custom", path: ["url"], message: "Use a repository link like https://github.com/you/project" });
      }
      if (v.type === "deployed_url") {
        let ok = false;
        try {
          ok = ["http:", "https:"].includes(new URL(v.url || "").protocol);
        } catch { /* invalid */ }
        if (!ok) ctx.addIssue({ code: "custom", path: ["url"], message: "Enter a full link starting with http:// or https://" });
      }
      if (v.type === "written" && (v.explanation || "").length < MIN_WRITTEN) {
        ctx.addIssue({ code: "custom", path: ["explanation"], message: `Write at least ${MIN_WRITTEN} characters explaining your work` });
      }
    });

export default function SubmitForm({ task, resubmitId, defaults, onDone }) {
  const qc = useQueryClient();
  const [error, setError] = useState(null);
  const schema = useMemo(buildSchema, []);
  const types = task.allowedSubmissionTypes;
  const { register, control, watch, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: defaults?.type && types.includes(defaults.type) ? defaults.type : types[0], url: "", explanation: "", notes: "" },
  });
  const { errors } = formState;
  const type = watch("type");

  const m = useMutation({
    mutationFn: (v) => {
      const body = { type: v.type, notes: v.notes || undefined };
      if (v.type === "written") body.explanation = v.explanation;
      else body.url = v.url;
      return resubmitId ? learnerApi.resubmit(resubmitId, body) : learnerApi.submit({ taskId: task.id, ...body });
    },
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["enrollments"] });
      onDone?.(s);
    },
    onError: setError,
  });

  return (
    <Box component="form" onSubmit={handleSubmit((v) => { setError(null); m.mutate(v); })} noValidate>
      <FormError error={error} />
      <Stack gap={2.5}>
        {types.length > 1 && (
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <TextField select label="What are you submitting?" {...field}>
                {types.map((t) => <MenuItem key={t} value={t}>{SUBMISSION_TYPES[t]}</MenuItem>)}
              </TextField>
            )}
          />
        )}
        {type === "written" ? (
          <TextField
            label="Your explanation"
            multiline minRows={6}
            {...register("explanation")}
            error={!!errors.explanation}
            helperText={errors.explanation?.message || `Describe what you built and how it meets each requirement. At least ${MIN_WRITTEN} characters.`}
          />
        ) : (
          <TextField
            label={type === "github" ? "Repository link" : "Live link"}
            placeholder={type === "github" ? "https://github.com/you/project" : "https://your-app.example.com"}
            {...register("url")}
            error={!!errors.url}
            helperText={errors.url?.message}
          />
        )}
        <TextField
          label="Notes for your mentor (optional)"
          multiline minRows={2}
          {...register("notes")}
          error={!!errors.notes}
          helperText={errors.notes?.message || "Anything they should know before reviewing."}
        />
        <Box>
          <Button type="submit" variant="contained" size="large" disabled={m.isPending}>
            {m.isPending ? "Submitting…" : resubmitId ? "Resubmit for review" : "Submit for review"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
