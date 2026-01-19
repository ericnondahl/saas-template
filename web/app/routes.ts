import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("unsubscribe", "routes/unsubscribe.tsx"),
  route("api/sync-user", "routes/api.sync-user.ts"),
  route("api/user", "routes/api.user.ts"),
  route("api/admin/users", "routes/api.admin.users.ts"),
  route("api/admin/set-admin", "routes/api.admin.set-admin.ts"),
  route("admin", "routes/admin.tsx", [
    index("routes/admin.admins.tsx"),
  ]),
] satisfies RouteConfig;
