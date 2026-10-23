import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import AppShell from "./layouts/AppShell";
import { Loading } from "./components/ui";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

const Onboarding = lazy(() => import("./pages/Onboarding"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/learner/Dashboard"));
const Tracks = lazy(() => import("./pages/Tracks"));
const TrackDetail = lazy(() => import("./pages/TrackDetail"));
const Journey = lazy(() => import("./pages/learner/Journey"));
const TaskWorkspace = lazy(() => import("./pages/learner/TaskWorkspace"));
const Submissions = lazy(() => import("./pages/learner/Submissions"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminContent = lazy(() => import("./pages/admin/Content"));
const AdminTrack = lazy(() => import("./pages/admin/TrackEditor"));

function Protected({ roles, children }) {
  const { user, booting } = useAuth();
  const loc = useLocation();
  if (booting) return <Loading minHeight="100vh" />;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <Loading minHeight="100vh" />;
  return user ? <Navigate to="/" replace /> : children;
}

function Home() {
  const { user } = useAuth();
  if (user.role === "admin") return <Navigate to="/admin/content" replace />;
  if (user.role === "mentor") return <Navigate to="/tracks" replace />;
  if (!user.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <Dashboard />;
}

export default function App() {
  return (
    <Suspense fallback={<Loading minHeight="100vh" />}>
      <Routes>
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
        <Route path="/reset-password" element={<GuestOnly><ResetPassword /></GuestOnly>} />

        <Route path="/onboarding" element={<Protected roles={["learner"]}><Onboarding /></Protected>} />

        <Route element={<Protected><AppShell /></Protected>}>
          <Route index element={<Home />} />
          <Route path="tracks" element={<Tracks />} />
          <Route path="tracks/:trackId" element={<TrackDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="learn/:enrollmentId" element={<Protected roles={["learner"]}><Journey /></Protected>} />
          <Route path="tasks/:taskId" element={<TaskWorkspace />} />
          <Route path="submissions" element={<Protected roles={["learner"]}><Submissions /></Protected>} />
          <Route path="admin/users" element={<Protected roles={["admin"]}><AdminUsers /></Protected>} />
          <Route path="admin/content" element={<Protected roles={["admin"]}><AdminContent /></Protected>} />
          <Route path="admin/content/:trackId" element={<Protected roles={["admin"]}><AdminTrack /></Protected>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
