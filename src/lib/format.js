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

export const timeAgo = (v) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(v).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? "day" : "days"} ago`;
};
