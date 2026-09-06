import test from "node:test";
import assert from "node:assert/strict";
import {
  validateAdminConfigInput,
  validateAdminConfigUpdateInput,
} from "../src/lib/admin-config-validation.ts";
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

test("requires at least one updatable field", () => {
  const result = validateAdminConfigUpdateInput({});

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors[0], "No valid fields were provided.");
  }
});

test("masks email without exposing full address", () => {
  const masked = maskEmail("admin@example.com");
  assert.match(masked, /^a\*+n@e\*\*\*.com$/);
});
