import ReactMarkdown from "react-markdown";
import { Box } from "@mui/material";
import { mono, palette } from "../theme/theme";

export default function Markdown({ children }) {
  return (
    <Box
      sx={{
        maxWidth: "70ch",
        "& > :first-of-type": { mt: 0 },
        "& p, & li": { lineHeight: 1.7 },
        "& p": { my: 1.5 },
        "& ul, & ol": { pl: 3 },
        "& h1, & h2, & h3": { fontFamily: "inherit", fontWeight: 650, mt: 3, mb: 1, fontSize: "1.1rem" },
        "& a": { color: palette.blue },
        "& code": { fontFamily: mono, fontSize: "0.85em", bgcolor: "#e4e9ed", px: 0.6, py: 0.1, borderRadius: "3px" },
        "& pre": { bgcolor: palette.ink, color: "#e8eef2", p: 2, borderRadius: 1, overflow: "auto" },
        "& pre code": { bgcolor: "transparent", p: 0, color: "inherit" },
      }}
    >
      <ReactMarkdown skipHtml>{children || ""}</ReactMarkdown>
    </Box>
  );
}
