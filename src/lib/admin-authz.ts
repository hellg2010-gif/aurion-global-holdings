const ADMIN_PATH_PATTERN = /^\/admin(?:[/?#]|$)/;

export function hasAdminRole(role: unknown): role is "admin" {
  return role === "admin";
}

export function getSafeAdminNextPath(nextPath: string | null | undefined) {
  if (!nextPath || nextPath.startsWith("//") || !ADMIN_PATH_PATTERN.test(nextPath)) {
    return "/admin";
  }

  return nextPath;
}
