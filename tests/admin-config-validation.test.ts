import test from "node:test";
import assert from "node:assert/strict";
import {
  getAdminConfigPolicyError,
  resolveAdminConfigPolicyState,
  validateAdminConfigInput,
  validateAdminConfigUpdateInput,
} from "../src/lib/admin-config-validation.ts";
import { sanitizeAdminNextPath } from "../src/lib/admin-login-redirect.ts";
import { maskEmail } from "../src/lib/email.ts";

test("validates and normalizes a config payload", () => {
  const result = validateAdminConfigInput({
    configType: "plugin_connector",
    name: "  SAP Connector  ",
    category: " enterprise  integration ",
    description: "  Requires approved credentials and review. ",
    enabled: false,
    riskLevel: "high",
    approvalStatus: "requires_credentials",
    requiresCredentials: true,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.name, "SAP Connector");
    assert.equal(result.data.category, "enterprise integration");
  }
});

test("rejects invalid config payload fields", () => {
  const result = validateAdminConfigInput({
    configType: "unknown",
    name: "",
    category: "",
    description: "",
    enabled: "yes",
    riskLevel: "critical",
    approvalStatus: "instant",
    requiresCredentials: "maybe",
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.length >= 4);
  }
});

test("accepts high-risk confirmation when provided on create payload", () => {
  const result = validateAdminConfigInput({
    configType: "plugin_connector",
    name: "SAP Connector",
    category: "enterprise integration",
    description: "Requires approved credentials and review.",
    enabled: true,
    riskLevel: "high",
    approvalStatus: "approved",
    requiresCredentials: true,
    confirmHighRisk: true,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.confirmHighRisk, true);
  }
});

test("requires at least one updatable field", () => {
  const result = validateAdminConfigUpdateInput({});

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors[0], "No valid fields were provided.");
  }
});

test("rejects enabling a non-approved configuration", () => {
  const error = getAdminConfigPolicyError({
    enabled: true,
    riskLevel: "low",
    approvalStatus: "pending",
    requiresCredentials: false,
  });

  assert.equal(error, "Approval is required before enabling this configuration.");
});

test("rejects enabling a credentialed configuration without approval", () => {
  const error = getAdminConfigPolicyError({
    enabled: true,
    riskLevel: "medium",
    approvalStatus: "requires_credentials",
    requiresCredentials: true,
  });

  assert.equal(
    error,
    "Approval is required before enabling configurations that require credentials.",
  );
});

test("rejects enabled high-risk configurations without explicit confirmation", () => {
  const error = getAdminConfigPolicyError({
    enabled: true,
    riskLevel: "high",
    approvalStatus: "approved",
    requiresCredentials: false,
  });

  assert.equal(
    error,
    "High-risk configurations require explicit confirmation before enabling.",
  );
});

test("merges existing config state before evaluating patch policy", () => {
  const finalState = resolveAdminConfigPolicyState(
    {
      enabled: true,
      riskLevel: "medium",
      approvalStatus: "approved",
      requiresCredentials: false,
    },
    {
      riskLevel: "high",
    },
  );

  assert.deepEqual(finalState, {
    enabled: true,
    riskLevel: "high",
    approvalStatus: "approved",
    requiresCredentials: false,
  });
  assert.equal(
    getAdminConfigPolicyError(finalState),
    "High-risk configurations require explicit confirmation before enabling.",
  );
});

test("sanitizes external or malformed admin next paths", () => {
  assert.equal(sanitizeAdminNextPath("/admin/settings"), "/admin/settings");
  assert.equal(sanitizeAdminNextPath("/"), "/");
  assert.equal(sanitizeAdminNextPath(""), "/admin");
  assert.equal(sanitizeAdminNextPath("https://evil.example"), "/admin");
  assert.equal(sanitizeAdminNextPath("//evil.example"), "/admin");
  assert.equal(sanitizeAdminNextPath("/\\evil"), "/admin");
});

test("masks email without exposing full address", () => {
  const masked = maskEmail("admin@example.com");
  assert.match(masked, /^a\*+n@e\*\*\*.com$/);
});
