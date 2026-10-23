import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, Link, TextField, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import AuthLayout from "../../layouts/AuthLayout";
import { FormError } from "../../components/ui";
import { useAuth } from "../../auth/AuthContext";
import { passwordRule } from "../../lib/validation";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
  password: passwordRule,
});

export default function Register() {
  const { register: signUp } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });
  const { errors, isSubmitting } = formState;

  const onSubmit = async (values) => {
    setError(null);
    try {
      await signUp(values);
      nav("/onboarding", { replace: true });
    } catch (e) {
      setError(e);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="You’ll choose a track and set your goals next."
      footer={
        <Typography color="text.secondary">
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" fontWeight={600}>Sign in</Link>
        </Typography>
      }
    >
      <FormError error={error} />
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap={2.5}>
          <TextField label="Full name" autoComplete="name" autoFocus {...register("fullName")} error={!!errors.fullName} helperText={errors.fullName?.message} />
          <TextField label="Email" type="email" autoComplete="email" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message || "At least 8 characters, with a letter and a number."}
          />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
