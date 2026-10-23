import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, Box, Button, Divider, TextField, Typography } from "@mui/material";
import Stack from "../components/Stack";
import { PageHeader, FormError } from "../components/ui";
import ProfileForm from "../components/ProfileForm";
import { userApi } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";
import { passwordRule } from "../lib/validation";
import { palette } from "../theme/theme";

const schema = z.object({ currentPassword: z.string().min(1, "Enter your current password"), newPassword: passwordRule });

function PasswordForm() {
  const { logout } = useAuth();
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm({ resolver: zodResolver(schema) });
  const { errors, isSubmitting } = formState;

  const onSubmit = async (v) => {
    setError(null);
    try {
      await userApi.changePassword(v);
      reset();
      setDone(true);
    } catch (e) {
      setError(e);
    }
  };

  if (done)
    return (
      <Alert severity="success" action={<Button color="inherit" size="small" onClick={logout}>Sign in again</Button>}>
        Password changed. All your sessions were signed out.
      </Alert>
    );

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormError error={error} />
      <Stack gap={2.5} sx={{ maxWidth: 420 }}>
        <TextField label="Current password" type="password" autoComplete="current-password" {...register("currentPassword")} error={!!errors.currentPassword} helperText={errors.currentPassword?.message} />
        <TextField label="New password" type="password" autoComplete="new-password" {...register("newPassword")} error={!!errors.newPassword} helperText={errors.newPassword?.message || "At least 8 characters, with a letter and a number."} />
        <Box><Button type="submit" variant="outlined" disabled={isSubmitting}>{isSubmitting ? "Updating…" : "Change password"}</Button></Box>
      </Stack>
    </Box>
  );
}

export default function Profile() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Profile" subtitle={user.email} />
      <Box sx={{ bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5, p: { xs: 2.5, sm: 4 } }}>
        <Typography variant="h3" sx={{ mb: 3 }}>Your details</Typography>
        <ProfileForm />
        <Divider sx={{ my: 4 }} />
        <Typography variant="h3" sx={{ mb: 3 }}>Password</Typography>
        <PasswordForm />
      </Box>
    </>
  );
}
