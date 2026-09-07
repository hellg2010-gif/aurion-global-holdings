"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  adminConfigOptions,
  type AdminConfigInput,
} from "@/lib/admin-config-validation";

type ConfigRecord = {
  id: string;
  config_type: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  risk_level: string;
  approval_status: string;
  requires_credentials: boolean;
  updated_at: string;
};

type Props = {
  initialRecords: ConfigRecord[];
  maskedEmail: string | null;
};

const DEFAULT_FORM: AdminConfigInput = {
  configType: "ai_command",
  name: "",
  category: "",
  description: "",
  enabled: false,
  riskLevel: "low",
  approvalStatus: "pending",
  requiresCredentials: false,
};

export default function AdminConsole({ initialRecords, maskedEmail }: Props) {
  const [records, setRecords] = useState(initialRecords);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [records],
  );

  async function reload() {
    const response = await fetch("/api/admin/config", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to refresh records.");
    }
    const payload = (await response.json()) as { records: ConfigRecord[] };
    setRecords(payload.records);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(payload?.error || "Unable to save record.");
        return;
      }

      setStatus("Configuration saved.");
      setForm(DEFAULT_FORM);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function toggleEnabled(record: ConfigRecord) {
    setBusy(true);
    setStatus(null);
    setError(null);

    try {
      let confirmHighRisk = false;
      if (record.risk_level === "high") {
        confirmHighRisk = window.confirm(
          "This is a high-risk connector. Confirm enable/disable change.",
        );
        if (!confirmHighRisk) {
          return;
        }
      }

      const response = await fetch(`/api/admin/config/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: !record.enabled,
          confirmHighRisk,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(payload?.error || "Unable to change status.");
        return;
      }

      setStatus("Status updated.");
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function deleteRecord(recordId: string) {
    if (!window.confirm("Delete this configuration record?")) {
      return;
    }

    setBusy(true);
    setStatus(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/config/${recordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Unable to delete record.");
        return;
      }

      setStatus("Record deleted.");
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(record: ConfigRecord) {
    setBusy(true);
    setStatus(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/config/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: record.name,
          category: record.category,
          description: record.description,
          riskLevel: record.risk_level,
          approvalStatus: record.approval_status,
          requiresCredentials: record.requires_credentials,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(payload?.error || "Unable to update record.");
        return;
      }

      setEditingId(null);
      setStatus("Record updated.");
      await reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-[#f4f1ea] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h1 className="text-2xl font-semibold">Admin configuration console</h1>
          <p className="mt-1 text-sm text-white/60">
            Manage AI command metadata, approved plugin/connectors, and skins/themes.
          </p>
          {maskedEmail && <p className="mt-2 text-xs text-white/50">Signed in as {maskedEmail}</p>}
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-medium">Add configuration record</h2>
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div>
              <label className="block text-sm mb-1" htmlFor="configType">Type</label>
              <select
                id="configType"
                className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
                value={form.configType}
                onChange={(event) => setForm((prev) => ({ ...prev, configType: event.target.value as AdminConfigInput["configType"] }))}
              >
                {adminConfigOptions.configTypes.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="name">Name</label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="category">Category</label>
              <input
                id="category"
                required
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="risk">Risk level</label>
              <select
                id="risk"
                value={form.riskLevel}
                onChange={(event) => setForm((prev) => ({ ...prev, riskLevel: event.target.value as AdminConfigInput["riskLevel"] }))}
                className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
              >
                {adminConfigOptions.riskLevels.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-1" htmlFor="description">Description</label>
              <textarea
                id="description"
                required
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="approval">Approval status</label>
              <select
                id="approval"
                value={form.approvalStatus}
                onChange={(event) => setForm((prev) => ({ ...prev, approvalStatus: event.target.value as AdminConfigInput["approvalStatus"] }))}
                className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
              >
                {adminConfigOptions.approvalStatuses.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-center gap-2 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) => setForm((prev) => ({ ...prev, enabled: event.target.checked }))}
                />
                Enabled
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.requiresCredentials}
                  onChange={(event) => setForm((prev) => ({ ...prev, requiresCredentials: event.target.checked }))}
                />
                Requires credentials
              </label>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="btn-gold rounded-lg px-5 py-2 text-sm disabled:opacity-60"
              >
                {busy ? "Saving..." : "Save record"}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          {sortedRecords.map((record) => {
            const needsApproval = record.approval_status !== "approved";
            const showWarning = record.requires_credentials || needsApproval;
            const isEditing = editingId === record.id;

            return (
              <article
                key={record.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-medium">{record.name}</h3>
                    <p className="text-sm text-white/60">{record.category} • {record.config_type}</p>
                    <p className="mt-1 text-sm text-white/80">{record.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs">
                      {record.risk_level} risk
                    </span>
                    <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs">
                      {record.approval_status}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleEnabled(record)}
                      className="rounded-full border border-[#c9a227]/40 px-2.5 py-1 text-xs"
                    >
                      {record.enabled ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? null : record.id)}
                      className="rounded-full border border-white/20 px-2.5 py-1 text-xs"
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRecord(record.id)}
                      className="rounded-full border border-rose-400/40 px-2.5 py-1 text-xs text-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {showWarning && (
                  <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                    Warning: {record.requires_credentials ? "requires credentials" : ""}
                    {record.requires_credentials && needsApproval ? " and " : ""}
                    {needsApproval ? "approval is not yet complete" : ""}.
                  </p>
                )}

                {isEditing && (
                  <form
                    className="mt-4 grid gap-3 md:grid-cols-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void saveEdit(record);
                    }}
                  >
                    <div>
                      <label className="block text-sm mb-1">Name</label>
                      <input
                        value={record.name}
                        onChange={(event) =>
                          setRecords((prev) =>
                            prev.map((item) =>
                              item.id === record.id ? { ...item, name: event.target.value } : item,
                            ),
                          )
                        }
                        className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Category</label>
                      <input
                        value={record.category}
                        onChange={(event) =>
                          setRecords((prev) =>
                            prev.map((item) =>
                              item.id === record.id ? { ...item, category: event.target.value } : item,
                            ),
                          )
                        }
                        className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-1">Description</label>
                      <textarea
                        value={record.description}
                        onChange={(event) =>
                          setRecords((prev) =>
                            prev.map((item) =>
                              item.id === record.id
                                ? { ...item, description: event.target.value }
                                : item,
                            ),
                          )
                        }
                        className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Risk level</label>
                      <select
                        value={record.risk_level}
                        onChange={(event) =>
                          setRecords((prev) =>
                            prev.map((item) =>
                              item.id === record.id ? { ...item, risk_level: event.target.value } : item,
                            ),
                          )
                        }
                        className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
                      >
                        {adminConfigOptions.riskLevels.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Approval status</label>
                      <select
                        value={record.approval_status}
                        onChange={(event) =>
                          setRecords((prev) =>
                            prev.map((item) =>
                              item.id === record.id
                                ? { ...item, approval_status: event.target.value }
                                : item,
                            ),
                          )
                        }
                        className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
                      >
                        {adminConfigOptions.approvalStatuses.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
                      <input
                        type="checkbox"
                        checked={record.requires_credentials}
                        onChange={(event) =>
                          setRecords((prev) =>
                            prev.map((item) =>
                              item.id === record.id
                                ? { ...item, requires_credentials: event.target.checked }
                                : item,
                            ),
                          )
                        }
                      />
                      Requires credentials
                    </label>
                    <div className="md:col-span-2">
                      <button type="submit" className="btn-gold rounded-lg px-4 py-2 text-sm">
                        Save changes
                      </button>
                    </div>
                  </form>
                )}
              </article>
            );
          })}
        </section>

        {status && (
          <p className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {status}
          </p>
        )}

        {error && (
          <p className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
