import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("unsubscribe", "routes/unsubscribe.tsx"),
  route("api/sync-user", "routes/api.sync-user.ts"),
  route("api/user", "routes/api.user.ts"),
  route("api/admin/users", "routes/api.admin.users.ts"),
  route("api/admin/set-admin", "routes/api.admin.set-admin.ts"),
  route("api/admin/openrouter-logs", "routes/api.admin.openrouter-logs.ts"),
  route("api/admin/openrouter-usage", "routes/api.admin.openrouter-usage.ts"),
  route("api/admin/queues", "routes/api.admin.queues.ts"),
  route("admin", "routes/admin.tsx", [
    index("routes/admin.admins.tsx"),
    route("openrouter-logs", "routes/admin.openrouter-logs.tsx"),
    route("openrouter-usage", "routes/admin.openrouter-usage.tsx"),
    route("queues", "routes/admin.queues.tsx"),
  ]),
] satisfies RouteConfig;
