import fs from "node:fs";
import path from "node:path";

const apiBase = "http://127.0.0.1:3101/api";
const roleRoot = "/opt/role-assets";
const roleToAgent = {
  architect: "Solution Architect",
  "project-manager": "Project Manager",
  "backend-developer": "Backend Engineer",
  "frontend-developer": "Frontend Engineer",
  tester: "QA Tester",
  "code-reviewer": "Code Reviewer",
  devops: "DevOps Engineer",
};

async function request(route, options = {}) {
  const response = await fetch(`${apiBase}${route}`, options);
  const body = await response.text();
  if (!response.ok) throw new Error(`${options.method ?? "GET"} ${route} returned ${response.status}: ${body.slice(0, 300)}`);
  return body ? JSON.parse(body) : null;
}

function skillRows() {
  const rows = new Map();
  for (const role of Object.keys(roleToAgent)) {
    const file = path.join(roleRoot, role, "skills.md");
    const markdown = fs.readFileSync(file, "utf8");
    for (const line of markdown.split(/\r?\n/)) {
      const match = line.match(/^\s*-\s*`?([^`]+?)`?\s*$/);
      if (!match) continue;
      const name = match[1].trim();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (!rows.has(slug)) rows.set(slug, { name, slug, roles: [] });
      rows.get(slug).roles.push(role);
    }
  }
  return [...rows.values()];
}

async function waitForApi() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const health = await request("/health");
      if (health?.status === "ok") return;
    } catch { /* server is still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Paperclip API did not become ready within 60 seconds");
}

await waitForApi();
const companies = await request("/companies");
const company = Array.isArray(companies) ? companies[0] : companies;
if (!company?.id) throw new Error("No Paperclip company is available for role-skill sync");

const existing = await request(`/companies/${company.id}/skills`);
const skillIds = new Map(existing.filter((skill) => skill.sourceType !== "local_path" || skill.key.startsWith(`company/${company.id}/`)).map((skill) => [skill.slug, skill.key]));
for (const skill of skillRows()) {
  if (!skillIds.has(skill.slug)) {
    const created = await request(`/companies/${company.id}/skills`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: skill.name,
        slug: skill.slug,
        description: `Company skill: ${skill.name}`,
        markdown: `# ${skill.name}\n\nUse this capability within the assigned AI Software Company role.\n\n## Role mapping\n${skill.roles.map((role) => `- ${role}`).join("\n")}`,
      }),
    });
    skillIds.set(skill.slug, created.key);
  }
}

const agents = await request(`/companies/${company.id}/agents`);
for (const [role, agentName] of Object.entries(roleToAgent)) {
  const agent = agents.find((candidate) => candidate.name === agentName);
  if (!agent) continue;
  const desiredSkills = skillRows().filter((skill) => skill.roles.includes(role)).map((skill) => skillIds.get(skill.slug));
  await request(`/agents/${agent.id}/skills/sync`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ desiredSkills, mode: "replace" }),
  });
  console.log(`role-skill sync: ${agentName} <- ${desiredSkills.length} skills`);
}
