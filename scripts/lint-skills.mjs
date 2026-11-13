#!/usr/bin/env node
// Lints every skills/<name>/SKILL.md against the Agent Skills spec and this repo's writing rules.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const skillsDir = join(root, "skills");
const allowedKeys = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
const namePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const banned = [
  [/—/, "em dash"],
  [/self-host/i, "self-hosting mention"],
  [/ayinboxctl/, "operator CLI mention"],
];

const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

function parseFrontmatter(text, file) {
  if (!text.startsWith("---\n")) {
    fail(file, "missing YAML frontmatter at the top of the file");
    return null;
  }
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) {
    fail(file, "frontmatter is not closed with ---");
    return null;
  }
  const fields = {};
  let current = null;
  for (const line of text.slice(4, end).split("\n")) {
    if (!line.trim()) continue;
    const nested = /^\s+([\w-]+):\s*(.*)$/.exec(line);
    if (nested && current) {
      fields[current][nested[1]] = unquote(nested[2]);
      continue;
    }
    const m = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!m) {
      fail(file, `cannot read frontmatter line: ${line}`);
      continue;
    }
    current = m[1];
    fields[current] = m[2] === "" ? {} : unquote(m[2]);
  }
  return { fields, body: text.slice(end + 5) };
}

function unquote(v) {
  v = v.trim();
  if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v);
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replaceAll("''", "'");
  return v;
}

if (!existsSync(skillsDir)) {
  console.error(`no skills/ directory under ${root}`);
  process.exit(1);
}

const dirs = readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory()).sort();
const names = new Set();
for (const dir of dirs) {
  const file = join("skills", dir, "SKILL.md");
  const path = join(root, file);
  if (!existsSync(path)) {
    fail(file, "missing");
    continue;
  }
  const text = readFileSync(path, "utf8");
  const parsed = parseFrontmatter(text, file);
  if (!parsed) continue;
  const { fields, body } = parsed;

  for (const key of Object.keys(fields)) {
    if (!allowedKeys.has(key)) fail(file, `frontmatter key "${key}" is not in the Agent Skills spec`);
  }
  const { name, description } = fields;
  if (typeof name !== "string" || !name) fail(file, "name is required");
  else {
    if (name.length > 64) fail(file, "name is longer than 64 characters");
    if (!namePattern.test(name)) fail(file, "name must be lowercase letters, digits and single hyphens");
    if (name !== dir) fail(file, `name "${name}" does not match its folder "${dir}"`);
    if (names.has(name)) fail(file, `duplicate name "${name}"`);
    names.add(name);
  }
  if (typeof description !== "string" || !description.trim()) fail(file, "description is required");
  else if (description.length > 1024) fail(file, `description is ${description.length} characters, over 1024`);
  if (fields.compatibility !== undefined && String(fields.compatibility).length > 500) {
    fail(file, "compatibility is over 500 characters");
  }
  if (fields.metadata !== undefined && typeof fields.metadata !== "object") fail(file, "metadata must be a map");

  const lines = text.split("\n").length;
  if (lines > 500) fail(file, `${lines} lines; the spec recommends under 500`);

  text.split("\n").forEach((line, i) => {
    for (const [re, label] of banned) if (re.test(line)) fail(`${file}:${i + 1}`, label);
  });

  const withoutCode = body.replace(/```[\s\S]*?```/g, "");
  for (const m of withoutCode.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const local = target.split("#")[0];
    if (!existsSync(join(dirname(path), local))) fail(file, `broken relative link: ${target}`);
  }
}

if (dirs.length === 0) fail("skills/", "no skills found");

if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\n${errors.length} problem(s) in ${dirs.length} skill(s)`);
  process.exit(1);
}
console.log(`ok: ${dirs.length} skills pass`);
