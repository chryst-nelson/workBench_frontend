import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Button, Divider, FormControlLabel, Link, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Stack from "../../components/Stack";
import { contentApi, learnerApi, reviewApi } from "../../api/endpoints";
import { FormError, Loading, StatusChip } from "../../components/ui";
import { useToast } from "../../components/Feedback";
import { SUBMISSION_TYPES, dateTime, label } from "../../lib/format";
import { palette } from "../../theme/theme";

const MIN_FEEDBACK = 10;

function Evidence({ s }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{SUBMISSION_TYPES[s.type]}</Typography>
      {s.type === "written" ? (
        <Typography sx={{ whiteSpace: "pre-wrap", maxWidth: "70ch" }}>{s.explanation}</Typography>
      ) : (
        <Link href={s.url} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: "break-all", fontWeight: 600 }}>{s.url}</Link>
      )}
      {s.notes && (
        <Box sx={{ mt: 2, pl: 2, borderLeft: `3px solid ${palette.line}` }}>
          <Typography variant="body2" color="text.secondary">Learner’s note</Typography>
          <Typography sx={{ whiteSpace: "pre-wrap" }}>{s.notes}</Typography>
        </Box>
      )}
    </Box>
  );
}

function DecisionPanel({ submission }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [decision, setDecision] = useState("approved");
  const [feedback, setFeedback] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);
  const needsFeedback = decision === "revision_requested";
  const tooShort = needsFeedback && feedback.trim().length < MIN_FEEDBACK;

  const m = useMutation({
    mutationFn: () => reviewApi.review(submission.id, { decision, ...(feedback.trim() ? { feedback: feedback.trim() } : {}) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-queue"] });
      qc.invalidateQueries({ queryKey: ["assigned"] });
      qc.invalidateQueries({ queryKey: ["submission", submission.id] });
      toast(decision === "approved" ? "Approved" : "Changes requested");
      nav("/review");
    },
    onError: setError,
  });

  return (
    <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); setTouched(true); setError(null); if (!tooShort) m.mutate(); }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Your review</Typography>
      <FormError error={error} />
      <RadioGroup value={decision} onChange={(e) => setDecision(e.target.value)} aria-label="Decision" sx={{ mb: 2 }}>
        <FormControlLabel value="approved" control={<Radio />} label="Approve. The learner’s next task opens." />
        <FormControlLabel value="revision_requested" control={<Radio />} label="Request changes. The learner can resubmit." />
      </RadioGroup>
      <TextField
        label={needsFeedback ? "What needs to change?" : "Feedback (optional)"}
        multiline minRows={5}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        error={touched && tooShort}
        helperText={touched && tooShort ? `Write at least ${MIN_FEEDBACK} characters so the learner knows what to fix.` : needsFeedback ? "Be specific. The learner sees this exactly as written." : "Say what worked well, if you like."}
        sx={{ mb: 2.5 }}
      />
      <Button type="submit" variant="contained" size="large" fullWidth disabled={m.isPending} color={needsFeedback ? "warning" : "primary"}>
        {m.isPending ? "Saving…" : needsFeedback ? "Send back for changes" : "Approve submission"}
      </Button>
    </Box>
  );
}

export default function ReviewDetail() {
  const { submissionId } = useParams();
  const detail = useQuery({ queryKey: ["submission", submissionId], queryFn: () => learnerApi.submission(submissionId), retry: false });
  const taskId = detail.data?.submission.task;
  const task = useQuery({ queryKey: ["task", taskId], queryFn: () => contentApi.task(taskId), enabled: !!taskId });

  if (detail.isLoading) return <Loading />;
  if (detail.isError)
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Submission not found</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>It doesn’t exist, or it belongs to a learner who isn’t assigned to you.</Typography>
        <Button component={RouterLink} to="/review" variant="outlined">Back to the queue</Button>
      </Box>
    );

  const { submission: s, history, learner } = detail.data;
  const p = learner?.profile || {};
  const pending = s.status === "pending_review";
  const previous = [...history].filter((h) => h.id !== s.id).sort((a, b) => b.attempt - a.attempt);

  return (
    <>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/review" underline="hover" color="text.secondary">Review queue</Link>
        <Typography color="text.primary">{task.data?.title || "Submission"}</Typography>
      </Breadcrumbs>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 380px" }, gap: { xs: 4, lg: 6 }, alignItems: "start" }}>
        <Box>
          <Stack direction="row" gap={2} alignItems="center" sx={{ mb: 1 }}>
            <Typography color="text.secondary">Attempt {s.attempt}, sent {dateTime(s.submittedAt)}</Typography>
            <StatusChip status={s.status} />
          </Stack>
          <Typography variant="h2" component="h1" sx={{ mb: 4 }}>{task.data?.title || "Submission"}</Typography>

          <Box component="section" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 1.5 }}>Submitted work</Typography>
            <Box sx={{ bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5, p: 3 }}><Evidence s={s} /></Box>
          </Box>

          {learner && (
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 1.5 }}>{learner.fullName}</Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {[p.skillLevel && label(p.skillLevel), p.programmingLanguage].filter(Boolean).join(", ") || "No profile details yet"}
              </Typography>
              {p.learningGoals && <Typography sx={{ maxWidth: "65ch" }}>“{p.learningGoals}”</Typography>}
            </Box>
          )}

          {task.data && (
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 1.5 }}>What the task asked for</Typography>
              <Accordion disableGutters elevation={0} defaultExpanded sx={{ border: `1px solid ${palette.line}`, borderRadius: 1.5, "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={600}>Requirements</Typography></AccordionSummary>
                <AccordionDetails><Box component="ul" sx={{ m: 0, pl: 2.5 }}>{task.data.requirements.map((r, i) => <li key={i}>{r}</li>)}</Box></AccordionDetails>
              </Accordion>
              <Accordion disableGutters elevation={0} sx={{ border: `1px solid ${palette.line}`, borderRadius: 1.5, mt: 1, "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={600}>Expected deliverables</Typography></AccordionSummary>
                <AccordionDetails><Box component="ul" sx={{ m: 0, pl: 2.5 }}>{task.data.expectedDeliverables.map((r, i) => <li key={i}>{r}</li>)}</Box></AccordionDetails>
              </Accordion>
              <Link component={RouterLink} to={`/tasks/${task.data.id}`} variant="body2" sx={{ display: "inline-block", mt: 1.5 }}>Open the full task</Link>
            </Box>
          )}

          {previous.length > 0 && (
            <Box component="section">
              <Typography variant="h4" sx={{ mb: 1.5 }}>Earlier attempts</Typography>
              <Stack gap={2}>
                {previous.map((h) => (
                  <Box key={h.id} sx={{ border: `1px solid ${palette.line}`, borderRadius: 1.5, p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography fontWeight={650}>Attempt {h.attempt}</Typography>
                      <StatusChip status={h.status} />
                    </Stack>
                    <Evidence s={h} />
                    {h.review?.feedback && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="text.secondary">Feedback given</Typography>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>{h.review.feedback}</Typography>
                      </>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Box>

        <Box component="aside" aria-label="Review" sx={{ position: { lg: "sticky" }, top: { lg: 32 }, bgcolor: palette.paper, border: `1px solid ${palette.line}`, borderRadius: 1.5, p: 3 }}>
          {pending ? <DecisionPanel submission={s} /> : (
            <>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="h4">Reviewed</Typography>
                <StatusChip status={s.status} />
              </Stack>
              {s.review?.reviewedAt && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{dateTime(s.review.reviewedAt)}</Typography>}
              {s.review?.feedback ? <Typography sx={{ whiteSpace: "pre-wrap" }}>{s.review.feedback}</Typography> : <Typography color="text.secondary">No written feedback.</Typography>}
              {s.status === "revision_requested" && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Waiting for the learner to resubmit.</Typography>}
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
