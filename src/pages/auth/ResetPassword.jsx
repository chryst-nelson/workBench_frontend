import { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, Box, Button, Link, TextField } from "@mui/material";
import Stack from "../../components/Stack";
import AuthLayout from "../../layouts/AuthLayout";
import { FormError } from "../../components/ui";
import { authApi } from "../../api/endpoints";
import { passwordRule } from "../../lib/validation";

const schema = z
  .object({ newPassword: passwordRule, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Passwords don’t match" });

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const nav = useNavigate();
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });
  const { errors, isSubmitting } = formState;

  const onSubmit = async ({ newPassword }) => {
    setError(null);
    try {
      await authApi.reset({ token, newPassword });
      nav("/login", { replace: true, state: { reset: true } });
    } catch (e) {
      setError(e);
    }
  };

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="You’ll be signed out everywhere else."
      footer={<Link component={RouterLink} to="/forgot-password" fontWeight={600}>Request a new link</Link>}
    >
      {!token ? (
        <Alert severity="error">This reset link is missing its token. Request a new link.</Alert>
      ) : (
        <>
          <FormError error={error} />
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap={2.5}>
              <TextField label="New password" type="password" autoComplete="new-password" autoFocus {...register("newPassword")} error={!!errors.newPassword} helperText={errors.newPassword?.message || "At least 8 characters, with a letter and a number."} />
              <TextField label="Confirm new password" type="password" autoComplete="new-password" {...register("confirm")} error={!!errors.confirm} helperText={errors.confirm?.message} />
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save new password"}
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </AuthLayout>
  );
}
