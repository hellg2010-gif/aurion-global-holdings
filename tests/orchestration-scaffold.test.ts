import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repositoryRoot = process.cwd();

test("orchestration scaffold files exist", () => {
  const expectedFiles = [
    ".agent/orchestrator.agent.md",
    ".agent/architect-grok.agent.md",
    ".agent/coder-deepseek.agent.md",
    ".agent/reviewer.agent.md",
    ".agent/ROUTING.md",
    ".agent/scripts/plan.mjs",
    ".github/workflows/agentic-feature.yml",
    "MEMORY.md",
  ];

  for (const file of expectedFiles) {
    assert.equal(fs.existsSync(path.join(repositoryRoot, file)), true, `${file} should exist`);
  }
});

test("ci workflow validates required branches and commands", () => {
  const workflow = fs.readFileSync(
    path.join(repositoryRoot, ".github/workflows/webpack.yml"),
    "utf8",
  );

  for (const expectedSnippet of [
    "node-version: 22",
    "- main",
    "- feature/**",
    "- copilot/**",
    "npm ci",
    "npm test",
    "npm run build",
    "npm run lint",
  ]) {
    assert.match(workflow, new RegExp(expectedSnippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
