import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, Box, Button, Link, TextField, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import AuthLayout from "../../layouts/AuthLayout";
import { FormError } from "../../components/ui";
import { useAuth } from "../../auth/AuthContext";

const schema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });
  const { errors, isSubmitting } = formState;

  const onSubmit = async (values) => {
    setError(null);
    try {
      await login(values);
      nav(loc.state?.from || "/", { replace: true });
    } catch (e) {
      setError(e);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Pick up where you left off."
      footer={
        <Typography color="text.secondary">
          New here?{" "}
          <Link component={RouterLink} to="/register" fontWeight={600}>Create an account</Link>
        </Typography>
      }
    >
      {loc.state?.reset && <Alert severity="success" sx={{ mb: 2 }}>Password updated. Sign in with your new password.</Alert>}
      <FormError error={error} />
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap={2.5}>
          <TextField label="Email" type="email" autoComplete="email" autoFocus {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Password" type="password" autoComplete="current-password" {...register("password")} error={!!errors.password} helperText={errors.password?.message} />
          <Box sx={{ textAlign: "right", mt: -1 }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">Forgot your password?</Link>
          </Box>
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
