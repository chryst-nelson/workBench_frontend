import { Box, Typography } from "@mui/material";
import { palette } from "../theme/theme";

const NODE = 22;

/**
 * The learner's path through a track: a single vertical line, a node per task.
 * done = filled, current = ringed in signal yellow, locked = hollow and dashed.
 */
export function TrailNode({ state }) {
  const base = { width: NODE, height: NODE, borderRadius: "50%", boxSizing: "border-box", display: "grid", placeItems: "center", flexShrink: 0 };
  if (state === "completed")
    return (
      <Box sx={{ ...base, bgcolor: palette.approved }} aria-hidden>
        <Box component="svg" viewBox="0 0 12 12" width={12} height={12}>
          <path d="M2.5 6.2l2.4 2.4 4.6-5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </Box>
      </Box>
    );
  if (state === "current")
    return (
      <Box sx={{ ...base, bgcolor: palette.signal, border: `3px solid ${palette.ink}` }} aria-hidden />
    );
  return <Box sx={{ ...base, border: `2px dashed #9aa8b2`, bgcolor: palette.canvas }} aria-hidden />;
}

export function Trail({ items, renderItem }) {
  return (
    <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        const solid = it.state === "completed";
        return (
          <Box component="li" key={it.key} sx={{ display: "flex", gap: 2, position: "relative" }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 0.25 }}>
              <TrailNode state={it.state} />
              {!last && (
                <Box
                  sx={{
                    flex: 1,
                    width: 0,
                    my: 0.5,
                    borderLeft: solid ? `3px solid ${palette.approved}` : `3px dotted #9aa8b2`,
                  }}
                />
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, pb: last ? 0 : 2.5 }}>{renderItem(it)}</Box>
          </Box>
        );
      })}
    </Box>
  );
}

export function TrailLegend() {
  return (
    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
      {[
        ["completed", "Approved"],
        ["current", "Up next"],
        ["locked", "Locked"],
      ].map(([s, t]) => (
        <Box key={s} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TrailNode state={s} />
          <Typography variant="body2" color="text.secondary">{t}</Typography>
        </Box>
      ))}
    </Box>
  );
}
