import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  AppBar, Avatar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { Logo } from "../components/Logo";
import { useAuth } from "../auth/AuthContext";
import { palette } from "../theme/theme";

const WIDTH = 248;

const NAV = {
  learner: [
    { to: "/", label: "My learning", icon: <RouteOutlinedIcon />, end: true },
    { to: "/tracks", label: "Tracks", icon: <LibraryBooksOutlinedIcon /> },
    { to: "/submissions", label: "Submissions", icon: <FactCheckOutlinedIcon /> },
  ],
  mentor: [{ to: "/tracks", label: "Tracks", icon: <LibraryBooksOutlinedIcon /> }],
  admin: [
    { to: "/admin/content", label: "Content", icon: <EditNoteOutlinedIcon /> },
    { to: "/admin/users", label: "Users", icon: <PeopleOutlinedIcon /> },
    { to: "/tracks", label: "Track catalog", icon: <LibraryBooksOutlinedIcon /> },
  ],
};

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const items = [...(NAV[user.role] || []), { to: "/profile", label: "Profile", icon: <PersonOutlinedIcon /> }];

  return (
    <Box sx={{ height: "100%", bgcolor: palette.ink, color: "#d5dee4", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2.5, py: 2.5 }}><Logo /></Box>
      <List component="nav" aria-label="Main" sx={{ px: 1.5, flex: 1 }}>
        {items.map((i) => (
          <ListItemButton
            key={i.to}
            component={NavLink}
            to={i.to}
            end={i.end}
            onClick={onNavigate}
            sx={{
              borderRadius: 1, mb: 0.5, color: "inherit", py: 1,
              "& .MuiListItemIcon-root": { color: "inherit", minWidth: 38 },
              "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
              "&.active": { bgcolor: "rgba(255,255,255,0.12)", color: "#fff", boxShadow: `inset 3px 0 0 ${palette.signal}` },
              "&:focus-visible": { outlineColor: palette.signal },
            }}
          >
            <ListItemIcon>{i.icon}</ListItemIcon>
            <ListItemText primary={i.label} slotProps={{ primary: { fontWeight: 600, fontSize: "0.925rem" } }} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: palette.signal, color: palette.ink, fontWeight: 700, fontSize: "0.9rem" }}>
          {user.fullName.slice(0, 1).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>{user.fullName}</Typography>
          <Typography noWrap variant="body2" sx={{ color: "#93a3af", textTransform: "capitalize" }}>{user.role}</Typography>
        </Box>
        <IconButton
          aria-label="Sign out"
          onClick={async () => { await logout(); nav("/login"); }}
          sx={{ color: "#d5dee4", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default function AppShell() {
  const wide = useMediaQuery((t) => t.breakpoints.up("md"));
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {wide ? (
        <Drawer variant="permanent" sx={{ width: WIDTH, flexShrink: 0 }} slotProps={{ paper: { sx: { width: WIDTH, border: 0 } } }}>
          <Sidebar />
        </Drawer>
      ) : (
        <>
          <AppBar position="fixed" elevation={0} sx={{ bgcolor: palette.ink }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="Open menu" onClick={() => setOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Logo />
            </Toolbar>
          </AppBar>
          <Drawer open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: WIDTH, border: 0 } } }}>
            <Sidebar onNavigate={() => setOpen(false)} />
          </Drawer>
        </>
      )}
      <Box component="main" sx={{ flex: 1, minWidth: 0, pt: { xs: 10, md: 6 }, pb: 8, px: { xs: 2, sm: 4, lg: 7 } }}>
        <Box sx={{ maxWidth: 1040, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
