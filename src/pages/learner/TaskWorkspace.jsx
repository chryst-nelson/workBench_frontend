import { Link as RouterLink, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, Divider, Link, Typography } from "@mui/material";
import Stack from "../../components/Stack";
import { contentApi, learnerApi } from "../../api/endpoints";
import { Difficulty, ErrorState, Loading, StatusChip } from "../../components/ui";
import Markdown from "../../components/Markdown";
import SubmitForm from "./SubmitForm";
import { useAuth } from "../../auth/AuthContext";
import { SUBMISSION_TYPES, dateTime } from "../../lib/format";
import { palette } from "../../theme/theme";

const List = ({ items }) => (
  <Box component="ul" sx={{ m: 0, pl: 2.5, "& li": { mb: 0.75, lineHeight: 1.6 } }}>
    {items.map((i, idx) => <li key={idx}>{i}</li>)}
  </Box>
);

const Section = ({ title, children }) => (
  <Box component="section" sx={{ mb: 4 }}>
    <Typography variant="h4" sx={{ mb: 1.5 }}>{title}</Typography>
    {children}
  </Box>
);

function SubmissionLink({ s }) {
  if (s.type === "written") return <Typography variant="body2" color="text.secondary">Written explanation</Typography>;
  return <Link href={s.url} target="_blank" rel="noopener noreferrer" variant="body2" sx={{ wordBreak: "break-all" }}>{s.url}</Link>;
}

function Feedback({ review }) {
  if (!review?.feedback) return null;
  return (
    <Box sx={{ mt: 1.5, pl: 1.5, borderLeft: `3px solid ${palette.line}` }}>
      <Typography variant="body2" color="text.secondary">Mentor feedback</Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{review.feedback}</Typography>
    </Box>
  );
}

function SubmissionPanel({ task }) {
  const subs = useQuery({
    queryKey: ["submissions", { taskId: task.id }],
    queryFn: () => learnerApi.submissions({ taskId: task.id, limit: 100 }),
  });
  if (subs.isLoading) return <Loading minHeight={120} />;
  if (subs.isError) return <ErrorState error={subs.error} onRetry={subs.refetch} />;

  const attempts = [...subs.data.items].sort((a, b) => b.attempt - a.attempt);
  const latest = attempts[0];

  let body;
  if (!latest) {
    body = (
      <>
        <Typography variant="h4" sx={{ mb: 0.5 }}>Submit your work</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>A mentor reviews it before the next task opens.</Typography>
        <SubmitForm task={task} />
      </>
    );
  } else if (latest.status === "pending_review") {
    body = (
      <>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h4">Attempt {latest.attempt}</Typography>
          <StatusChip status="pending_review" />
        </Stack>
        <Typography color="text.secondary">Submitted {dateTime(latest.submittedAt)}. You can’t edit it while it’s waiting for review.</Typography>
        <Box sx={{ mt: 2 }}><SubmissionLink s={latest} /></Box>
      </>
    );
  } else if (latest.status === "revision_requested") {
    body = (
      <>
        <Alert severity="warning" sx={{ mb: 3, "& .MuiAlert-message": { width: "100%" } }}>
          Your mentor asked for changes. Update your work and resubmit it as attempt {latest.attempt + 1}.
          {latest.review?.feedback && (
            <Typography sx={{ mt: 1.5, whiteSpace: "pre-wrap", color: "text.primary" }}>{latest.review.feedback}</Typography>
          )}
        </Alert>
        <SubmitForm task={task} resubmitId={latest.id} defaults={latest} />
      </>
    );
  } else {
    body = (
      <>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h4">Approved</Typography>
          <StatusChip status="approved" />
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 2 }}>This task is done. The next one in your track is open.</Typography>
        {latest.review?.feedback && <Box sx={{ mb: 2.5 }}><Feedback review={latest.review} /></Box>}
        <Button component={RouterLink} to="/" variant="contained">Back to my learning</Button>
      </>
    );
  }

  return (
    <>
      {body}
      {attempts.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" sx={{ mb: 1.5 }}>Your attempts</Typography>
          <Stack gap={1.5} component="ol" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {attempts.map((a) => (
              <Box component="li" key={a.id} sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, alignItems: "flex-start" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={650}>Attempt {a.attempt}</Typography>
                  <Typography variant="body2" color="text.secondary">{dateTime(a.submittedAt)}</Typography>
                  <SubmissionLink s={a} />
                  {a.id !== latest.id && <Feedback review={a.review} />}
                </Box>
                <StatusChip status={a.status} />
              </Box>
            ))}
          </Stack>
        </>
      )}
    </>
  );
}

export default function TaskWorkspace() {
  const { taskId } = useParams();
  const { user } = useAuth();
  const task = useQuery({ queryKey: ["task", taskId], queryFn: () => contentApi.task(taskId), retry: false });

  if (task.isLoading) return <Loading />;
  if (task.isError) {
    const code = task.error.code;
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h3" sx={{ mb: 1 }}>
          {code === "TASK_LOCKED" ? "This task is still locked" : code === "NOT_ENROLLED" ? "Enroll to see this task" : "Task not found"}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {code === "TASK_LOCKED"
            ? "Get the previous task approved to open it."
            : code === "NOT_ENROLLED"
              ? "Tasks are only available once you’ve enrolled in the track."
              : task.error.message}
        </Typography>
        <Button component={RouterLink} to="/" variant="outlined">Back to my learning</Button>
      </Box>
    );
  }

  const t = task.data;
  const learner = user.role === "learner";

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: learner ? "minmax(0, 1fr) 380px" : "minmax(0, 1fr)" }, gap: { xs: 4, lg: 6 }, alignItems: "start" }}>
      <Box>
        <Stack direction="row" gap={2} alignItems="center" sx={{ mb: 1.5 }}>
          <Difficulty value={t.estimatedDifficulty} />
          {!learner && <StatusChip status={t.status} />}
        </Stack>
        <Typography variant="h2" component="h1" sx={{ mb: 4 }}>{t.title}</Typography>

        <Section title="The problem"><Markdown>{t.problemDescription}</Markdown></Section>
        <Section title="What you’ll learn"><List items={t.learningObjectives} /></Section>
        <Section title="Requirements"><List items={t.requirements} /></Section>
        <Section title="Instructions"><Markdown>{t.instructions}</Markdown></Section>
        <Section title="What to hand in"><List items={t.expectedDeliverables} /></Section>
        <Section title="How to submit">
          <Markdown>{t.submissionGuidelines}</Markdown>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Accepted: {t.allowedSubmissionTypes.map((x) => SUBMISSION_TYPES[x]).join(", ")}
          </Typography>
        </Section>
      </Box>

      {learner && (
        <Box
          component="aside"
          aria-label="Submission"
          sx={{ position: { lg: "sticky" }, top: { lg: 32 }, bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5, p: 3 }}
        >
          <SubmissionPanel task={t} />
        </Box>
      )}
    </Box>
  );
}
