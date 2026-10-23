import { Alert, Box, Button, Chip, CircularProgress, Typography } from "@mui/material";
import Stack from "../components/Stack";
import { palette } from "../theme/theme";
import { STATUS_LABEL, label } from "../lib/format";

export function PageHeader({ title, subtitle, actions, back }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "flex-end" }}
      gap={2}
      sx={{ mb: 4 }}
    >
      <Box sx={{ minWidth: 0 }}>
        {back}
        <Typography variant="h2" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 640 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Stack direction="row" gap={1} flexWrap="wrap">{actions}</Stack>}
    </Stack>
  );
}

export function Loading({ minHeight = 240 }) {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight }} role="status" aria-label="Loading">
      <CircularProgress size={28} />
    </Box>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <Alert
      severity="error"
      action={onRetry && <Button color="inherit" size="small" onClick={onRetry}>Try again</Button>}
      sx={{ alignItems: "center" }}
    >
      {error?.message || "Something went wrong."}
    </Alert>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <Box sx={{ py: 8, px: 2, textAlign: "center", border: `1px dashed ${palette.line}`, borderRadius: 1.5 }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>{title}</Typography>
      {body && <Typography color="text.secondary" sx={{ maxWidth: 440, mx: "auto" }}>{body}</Typography>}
      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    </Box>
  );
}

const STATUS_STYLE = {
  approved: { bg: "#e3f3ea", fg: palette.approved },
  revision_requested: { bg: "#fbeadf", fg: palette.revise },
  pending_review: { bg: "#e8e9f7", fg: palette.pending },
  published: { bg: "#e3f3ea", fg: palette.approved },
  draft: { bg: "#eceff1", fg: palette.inkSoft },
  active: { bg: "#e3f3ea", fg: palette.approved },
  suspended: { bg: "#fbeadf", fg: palette.revise },
  disabled: { bg: "#f6dedc", fg: palette.danger },
};

export function StatusChip({ status, size = "small" }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.draft;
  return (
    <Chip
      size={size}
      label={STATUS_LABEL[status] || label(status)}
      sx={{ bgcolor: s.bg, color: s.fg, fontWeight: 650 }}
    />
  );
}

export function Difficulty({ value }) {
  const n = { easy: 1, medium: 2, hard: 3 }[value] || 1;
  return (
    <Stack direction="row" alignItems="center" gap={0.75} component="span" sx={{ display: "inline-flex" }}>
      <Stack direction="row" gap="3px" aria-hidden>
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{ width: 6, height: 14, borderRadius: "2px", bgcolor: i <= n ? palette.ink : palette.line }}
          />
        ))}
      </Stack>
      <Typography variant="body2" component="span" color="text.secondary">{label(value)}</Typography>
    </Stack>
  );
}

export function FormError({ error }) {
  if (!error) return null;
  return (
    <Alert severity="error" sx={{ mb: 2 }} role="alert">
      {error.message || "Something went wrong."}
    </Alert>
  );
}

export function Meta({ items }) {
  return (
    <Stack direction="row" flexWrap="wrap" columnGap={2.5} rowGap={0.5}>
      {items.filter(Boolean).map((t, i) => (
        <Typography key={i} variant="body2" color="text.secondary">{t}</Typography>
      ))}
    </Stack>
  );
}
