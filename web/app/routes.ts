import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/sync-user", "routes/api.sync-user.ts"),
  route("api/user", "routes/api.user.ts"),
] satisfies RouteConfig;
