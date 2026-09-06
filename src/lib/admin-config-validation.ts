const CONFIG_TYPES = ["ai_command", "plugin_connector", "skin_theme"] as const;
const RISK_LEVELS = ["low", "medium", "high"] as const;
const APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "requires_credentials",
] as const;

export type ConfigType = (typeof CONFIG_TYPES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export type AdminConfigInput = {
  configType: ConfigType;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  riskLevel: RiskLevel;
  approvalStatus: ApprovalStatus;
  requiresCredentials: boolean;
};

export type AdminConfigUpdateInput = Partial<AdminConfigInput> & {
  confirmHighRisk?: boolean;
};

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: string[] };

function validateEnum<T extends readonly string[]>(
  value: unknown,
  options: T,
  field: string,
  errors: string[],
): value is T[number] {
  if (typeof value !== "string" || !options.includes(value)) {
    errors.push(`${field} is invalid.`);
    return false;
  }
  return true;
}

function validateText(value: unknown, field: string, maxLen: number, errors: string[]) {
  if (typeof value !== "string") {
    errors.push(`${field} must be text.`);
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    errors.push(`${field} is required.`);
    return false;
  }

  if (trimmed.length > maxLen) {
    errors.push(`${field} must be ${maxLen} characters or fewer.`);
    return false;
  }

  return true;
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function validateAdminConfigInput(input: unknown): ValidationResult<AdminConfigInput> {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, errors: ["Request body is invalid."] };
  }

  const record = input as Record<string, unknown>;

  const validType = validateEnum(record.configType, CONFIG_TYPES, "Config type", errors);
  const validRisk = validateEnum(record.riskLevel, RISK_LEVELS, "Risk level", errors);
  const validApproval = validateEnum(
    record.approvalStatus,
    APPROVAL_STATUSES,
    "Approval status",
    errors,
  );

  const validName = validateText(record.name, "Name", 120, errors);
  const validCategory = validateText(record.category, "Category", 80, errors);
  const validDescription = validateText(record.description, "Description", 600, errors);

  if (typeof record.enabled !== "boolean") {
    errors.push("Enabled must be true or false.");
  }
  if (typeof record.requiresCredentials !== "boolean") {
    errors.push("Requires credentials must be true or false.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      configType: (validType ? record.configType : "ai_command") as ConfigType,
      name: validName ? normalizeText(record.name as string) : "",
      category: validCategory ? normalizeText(record.category as string) : "",
      description: validDescription ? normalizeText(record.description as string) : "",
      enabled: record.enabled as boolean,
      riskLevel: (validRisk ? record.riskLevel : "low") as RiskLevel,
      approvalStatus: (validApproval
        ? record.approvalStatus
        : "pending") as ApprovalStatus,
      requiresCredentials: record.requiresCredentials as boolean,
    },
  };
}

export function validateAdminConfigUpdateInput(
  input: unknown,
): ValidationResult<AdminConfigUpdateInput> {
  if (!input || typeof input !== "object") {
    return { ok: false, errors: ["Request body is invalid."] };
  }

  const record = input as Record<string, unknown>;
  const errors: string[] = [];
  const output: AdminConfigUpdateInput = {};

  if ("configType" in record) {
    if (validateEnum(record.configType, CONFIG_TYPES, "Config type", errors)) {
      output.configType = record.configType as ConfigType;
    }
  }

  if ("name" in record) {
    if (validateText(record.name, "Name", 120, errors)) {
      output.name = normalizeText(record.name as string);
    }
  }

  if ("category" in record) {
    if (validateText(record.category, "Category", 80, errors)) {
      output.category = normalizeText(record.category as string);
    }
  }

  if ("description" in record) {
    if (validateText(record.description, "Description", 600, errors)) {
      output.description = normalizeText(record.description as string);
    }
  }

  if ("enabled" in record) {
    if (typeof record.enabled !== "boolean") {
      errors.push("Enabled must be true or false.");
    } else {
      output.enabled = record.enabled;
    }
  }

  if ("riskLevel" in record) {
    if (validateEnum(record.riskLevel, RISK_LEVELS, "Risk level", errors)) {
      output.riskLevel = record.riskLevel as RiskLevel;
    }
  }

  if ("approvalStatus" in record) {
    if (
      validateEnum(
        record.approvalStatus,
        APPROVAL_STATUSES,
        "Approval status",
        errors,
      )
    ) {
      output.approvalStatus = record.approvalStatus as ApprovalStatus;
    }
  }

  if ("requiresCredentials" in record) {
    if (typeof record.requiresCredentials !== "boolean") {
      errors.push("Requires credentials must be true or false.");
    } else {
      output.requiresCredentials = record.requiresCredentials;
    }
  }

  if ("confirmHighRisk" in record) {
    if (typeof record.confirmHighRisk !== "boolean") {
      errors.push("High-risk confirmation is invalid.");
    } else {
      output.confirmHighRisk = record.confirmHighRisk;
    }
  }

  if (Object.keys(output).length === 0 && errors.length === 0) {
    errors.push("No valid fields were provided.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: output };
}

export const adminConfigOptions = {
  configTypes: CONFIG_TYPES,
  riskLevels: RISK_LEVELS,
  approvalStatuses: APPROVAL_STATUSES,
};
