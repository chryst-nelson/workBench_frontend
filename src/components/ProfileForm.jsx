import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import Stack from "../components/Stack";
import { contentApi, userApi } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";
import { FormError } from "./ui";
import { LEVELS } from "../lib/format";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  programmingLanguage: z.string().trim().min(1, "Enter the language you want to focus on").max(50),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"], { message: "Choose your level" }),
  learningGoals: z.string().trim().min(1, "Tell us what you want to build or get better at").max(1000),
  weeklyAvailabilityHours: z.coerce.number({ message: "Enter a number" }).min(1, "At least 1 hour").max(168, "A week has 168 hours"),
  preferredTrack: z.string().optional(),
});

export default function ProfileForm({ submitLabel = "Save changes", onSaved, showName = true }) {
  const { user, setUser } = useAuth();
  const p = user.profile || {};
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const tracks = useQuery({ queryKey: ["tracks", "select"], queryFn: () => contentApi.tracks({ limit: 100, status: "published" }) });

  const { register, control, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user.fullName,
      programmingLanguage: p.programmingLanguage || "",
      skillLevel: p.skillLevel || "",
      learningGoals: p.learningGoals || "",
      weeklyAvailabilityHours: p.weeklyAvailabilityHours ?? "",
      preferredTrack: p.preferredTrack || "",
    },
  });
  const { errors, isSubmitting } = formState;

  const onSubmit = async (v) => {
    setError(null);
    setSaved(false);
    const body = { ...v };
    if (!body.preferredTrack) delete body.preferredTrack;
    if (!showName) delete body.fullName;
    try {
      const next = await userApi.updateMe(body);
      setUser(next);
      setSaved(true);
      onSaved?.(next);
    } catch (e) {
      setError(e);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormError error={error} />
      <Stack gap={2.5}>
        {showName && <TextField label="Full name" {...register("fullName")} error={!!errors.fullName} helperText={errors.fullName?.message} />}
        <Stack direction={{ xs: "column", sm: "row" }} gap={2.5}>
          <TextField label="Main language" placeholder="e.g. Python" {...register("programmingLanguage")} error={!!errors.programmingLanguage} helperText={errors.programmingLanguage?.message} />
          <Controller
            name="skillLevel"
            control={control}
            render={({ field }) => (
              <TextField select label="Current level" {...field} error={!!errors.skillLevel} helperText={errors.skillLevel?.message}>
                {LEVELS.map((l) => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
              </TextField>
            )}
          />
        </Stack>
        <TextField
          label="What do you want to get out of this?"
          multiline minRows={3}
          {...register("learningGoals")}
          error={!!errors.learningGoals}
          helperText={errors.learningGoals?.message || "Mentors read this before reviewing your work."}
        />
        <Stack direction={{ xs: "column", sm: "row" }} gap={2.5}>
          <TextField
            label="Hours per week"
            type="number" {...register("weeklyAvailabilityHours")}
            error={!!errors.weeklyAvailabilityHours}
            helperText={errors.weeklyAvailabilityHours?.message}
          slotProps={{ htmlInput: { min: 1, max: 168, step: 1 } }} />
          <Controller
            name="preferredTrack"
            control={control}
            render={({ field }) => (
              <TextField select label="Track you’re most interested in" {...field} helperText="Optional. You can enroll in any track later.">
                <MenuItem value=""><em>No preference</em></MenuItem>
                {(tracks.data?.items || []).map((t) => <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>)}
              </TextField>
            )}
          />
        </Stack>
        <Stack direction="row" alignItems="center" gap={2}>
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
          {saved && <Box role="status" sx={{ color: "success.main", fontWeight: 600 }}>Saved</Box>}
        </Stack>
      </Stack>
    </Box>
  );
}
