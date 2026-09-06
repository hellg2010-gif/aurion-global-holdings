export function sanitizeAdminNextPath(nextPath: string | null | undefined) {
  if (typeof nextPath !== "string") {
    return "/admin";
  }

  const candidate = nextPath.trim();
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/admin";
  }

  if (candidate.includes("\\")) {
    return "/admin";
  }

  return candidate;
}
