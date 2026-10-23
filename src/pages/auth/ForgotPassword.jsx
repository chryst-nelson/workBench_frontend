import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, Box, Button, Link, TextField } from "@mui/material";
import Stack from "../../components/Stack";
import AuthLayout from "../../layouts/AuthLayout";
import { FormError } from "../../components/ui";
import { authApi } from "../../api/endpoints";

const schema = z.object({ email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address") });

export default function ForgotPassword() {
  const [sent, setSent] = useState(null);
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });
  const { errors, isSubmitting } = formState;

  const onSubmit = async ({ email }) => {
    setError(null);
    try {
      await authApi.forgot({ email });
      setSent(email);
    } catch (e) {
      setError(e);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we’ll send a link to choose a new one."
      footer={<Link component={RouterLink} to="/login" fontWeight={600}>Back to sign in</Link>}
    >
      {sent ? (
        <Alert severity="success">
          If an account exists for {sent}, a reset link is on its way. The link expires soon, so use it today.
        </Alert>
      ) : (
        <>
          <FormError error={error} />
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap={2.5}>
              <TextField label="Email" type="email" autoComplete="email" autoFocus {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send reset link"}
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </AuthLayout>
  );
}
