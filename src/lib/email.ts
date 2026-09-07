export function maskEmail(email: string) {
  const [local = "", domain = ""] = email.split("@");

  if (!local || !domain) {
    return "***";
  }

  const first = local.charAt(0);
  const last = local.length > 1 ? local.charAt(local.length - 1) : "";
  const localMask = `${first}${"*".repeat(Math.max(2, local.length - 2))}${last}`;
  const [domainName = "", tld = ""] = domain.split(".");
  const domainMask = `${domainName.slice(0, 1)}***`;

  return tld ? `${localMask}@${domainMask}.${tld}` : `${localMask}@${domainMask}`;
}
