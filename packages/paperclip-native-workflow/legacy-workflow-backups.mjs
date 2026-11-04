import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';

export function readLegacyWorkflows(directory) {
  const recovered = new Map();
  for (const backupFile of fs.readdirSync(directory).filter(file => file.endsWith('.sql.gz')).sort()) {
    const dump = gunzipSync(fs.readFileSync(`${directory}/${backupFile}`)).toString('utf8');
    const statements = [...dump.matchAll(/INSERT INTO "public"\."plugin_state" \(([^\n]+?)\) VALUES \(([\s\S]*?)\);/g)];
    for (const match of statements) {
      const keys = match[1].split(', ').map(key => key.replaceAll('"', ''));
      const values = [...match[2].matchAll(/\$paperclip\$([\s\S]*?)\$paperclip\$/g)].map(value => value[1]);
      const row = Object.fromEntries(keys.map((key, index) => [key, values[index]]));
      if (row.namespace !== 'workflow-studio' || !row.state_key?.startsWith('workflow:')) continue;
      const workflow = JSON.parse(row.value_json);
      if (!workflow.id || !Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges)) continue;
      recovered.set(`${workflow.companyId}:${workflow.id}`, { backupFile, workflow });
    }
  }
  return [...recovered.values()];
}
