import { get, post, patch, put, del } from "./client";

const d = (p) => p.then((r) => r.data);
const pick = (key) => (p) => p.then((r) => r.data[key]);
const withMeta = (p) => p.then((r) => ({ items: r.data, meta: r.meta }));

export const authApi = {
  register: (b) => d(post("/auth/register", b, { noRefresh: true })),
  login: (b) => d(post("/auth/login", b, { noRefresh: true })),
  logout: () => post("/auth/logout", undefined, { noRefresh: true }),
  me: () => pick("user")(get("/auth/me")),
  forgot: (b) => post("/auth/forgot-password", b, { noRefresh: true }),
  reset: (b) => post("/auth/reset-password", b, { noRefresh: true }),
};

export const userApi = {
  updateMe: (b) => pick("user")(patch("/users/me", b)),
  changePassword: (b) => patch("/users/me/password", b),
  list: (q) => withMeta(get("/users", q)),
  setStatus: (id, status) => pick("user")(patch(`/users/${id}/status`, { status })),
  setRole: (id, role) => pick("user")(patch(`/users/${id}/role`, { role })),
};

export const contentApi = {
  tracks: (q) => withMeta(get("/tracks", q)),
  track: (id) => pick("track")(get(`/tracks/${id}`)),
  createTrack: (b) => pick("track")(post("/tracks", b)),
  updateTrack: (id, b) => pick("track")(patch(`/tracks/${id}`, b)),
  deleteTrack: (id) => del(`/tracks/${id}`),
  syllabus: (id) => d(get(`/tracks/${id}/modules`)),
  createModule: (trackId, b) => pick("module")(post(`/tracks/${trackId}/modules`, b)),
  reorderModules: (trackId, ids) => put(`/tracks/${trackId}/modules/order`, { ids }),
  updateModule: (id, b) => pick("module")(patch(`/modules/${id}`, b)),
  deleteModule: (id) => del(`/modules/${id}`),
  createTask: (moduleId, b) => pick("task")(post(`/modules/${moduleId}/tasks`, b)),
  reorderTasks: (moduleId, ids) => put(`/modules/${moduleId}/tasks/order`, { ids }),
  task: (id) => pick("task")(get(`/tasks/${id}`)),
  updateTask: (id, b) => pick("task")(patch(`/tasks/${id}`, b)),
  deleteTask: (id) => del(`/tasks/${id}`),
};

export const learnerApi = {
  enroll: (trackId) => pick("enrollment")(post("/enrollments", { trackId })),
  enrollments: () => d(get("/enrollments/me", { limit: 100 })),
  progress: (id) => d(get(`/enrollments/${id}/progress`)),
  submit: (b) => pick("submission")(post("/submissions", b)),
  resubmit: (id, b) => pick("submission")(post(`/submissions/${id}/resubmit`, b)),
  submissions: (q) => withMeta(get("/submissions/me", q)),
  submission: (id) => d(get(`/submissions/${id}`)),
};

export const reviewApi = {
  queue: (q) => withMeta(get("/reviews/queue", q)),
  review: (id, b) => pick("submission")(post(`/submissions/${id}/review`, b)),
  assigned: () => withMeta(get("/enrollments/assigned", { limit: 100 })),
  enrollments: (q) => withMeta(get("/enrollments", q)),
  assignMentor: (id, mentorId) => pick("enrollment")(patch(`/enrollments/${id}/mentor`, { mentorId })),
};
