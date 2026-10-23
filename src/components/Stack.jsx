import MuiStack from "@mui/material/Stack";

const toGap = (g) => (typeof g === "number" ? (t) => t.spacing(g) : g);

// MUI v9 Stack dropped these layout props; map them onto sx so call sites stay readable.
export default function Stack({ alignItems, justifyContent, flexWrap, flexShrink, columnGap, rowGap, gap, sx, ...rest }) {
  const base = {
    alignItems,
    justifyContent,
    flexWrap,
    flexShrink,
    gap: toGap(gap),
    columnGap: toGap(columnGap),
    rowGap: toGap(rowGap),
  };
  return <MuiStack sx={[base, ...(Array.isArray(sx) ? sx : [sx])]} {...rest} />;
}
