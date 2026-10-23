export const date = (v) =>
  v ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(v)) : "—";

export const dateTime = (v) =>
  v ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v)) : "—";

export const weeks = (n) => `${n} ${n === 1 ? "week" : "weeks"}`;

export const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const label = (v) => (v ? v.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) : "");

export const SUBMISSION_TYPES = {
  github: "GitHub repository",
  deployed_url: "Deployed URL",
  written: "Written explanation",
};

export const STATUS_LABEL = {
  pending_review: "Waiting for review",
  approved: "Approved",
  revision_requested: "Changes requested",
};
