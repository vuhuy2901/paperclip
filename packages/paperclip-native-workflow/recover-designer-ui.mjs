// Recover presentation only; the legacy worker and execution engine are excluded.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const revision = '953d6d5d4b921c5cca4bfa9db23a84436c5bfe90';
const source = execFileSync('git', ['show', `${revision}:packages/paperclip-workflow-studio/src/ui/index.tsx`], { encoding: 'utf8' });
const start = source.indexOf('function WorkflowListPage(');
const end = source.indexOf('function WorkflowWorkspace(', start);
const list = source.slice(start, end).replace('function WorkflowListPage', 'export function WorkflowListPage')
  .replaceAll('Delete', 'Archive')
  .replace('Are you sure you want to delete this workflow?', 'Archive this workflow?')
  .replace('Only “{deleteTarget.name}” will be removed. Paperclip issues, agents, projects, and task dependencies will not be deleted.', '“{deleteTarget.name}” will be hidden from the active list. The workflow and its history will be retained.');
const icons = [...new Set([...list.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)].map(match => match[1]))].filter(name => name !== 'WorkflowIndexEntry');
const header = `// Recovered from ${revision}; the same list exists in 8666133.
import React, { useEffect, useState } from 'react';
import { ${icons.join(', ')} } from 'lucide-react';
export type WorkflowIndexEntry = { id: string; name: string; description: string; status: string; version: number; updatedAt: string };
function formatRelativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60000));
  return minutes < 1 ? 'just now' : minutes < 60 ? minutes + 'm ago' : minutes < 1440 ? Math.floor(minutes / 60) + 'h ago' : Math.floor(minutes / 1440) + 'd ago';
}
`;
fs.writeFileSync(new URL('./src/ui/workflow-list.tsx', import.meta.url), header + list);
fs.writeFileSync(new URL('./src/ui/studio-styles.ts', import.meta.url), `// Recovered from ${revision}.\n` + execFileSync('git', ['show', `${revision}:packages/paperclip-workflow-studio/src/ui/styles.ts`], { encoding: 'utf8' }));
console.log('Recovered workflow list and designer styles from', revision);
