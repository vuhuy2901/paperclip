// Run inside the Paperclip container. Default: read-only; --apply appends missing drafts.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { readLegacyWorkflows } from './legacy-workflow-backups.mjs';
const require = createRequire('/usr/local/lib/node_modules/paperclipai/package.json');
const postgres = require('postgres');
const instance = '/home/node/.paperclip/instances/default';
const config = JSON.parse(fs.readFileSync(`${instance}/config.json`, 'utf8'));
const sql = postgres({ host: '127.0.0.1', port: config.database.embeddedPostgresPort, username: 'paperclip', password: 'paperclip', database: 'paperclip' });
const apply = process.argv.includes('--apply');
try {
  const recovered = readLegacyWorkflows(`${instance}/data/backups`);
  const destinations = await sql`select plugin_id, scope_id, value_json from plugin_state where namespace = 'native-workflow-designer' and state_key = 'templates' and scope_kind = 'company'`;
  for (const destination of destinations) {
    const source = recovered.filter(item => item.workflow.companyId === destination.scope_id);
    const existing = Array.isArray(destination.value_json) ? destination.value_json : [];
    const additions = source.filter(item => !existing.some(template => template.id === item.workflow.id));
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', companyId: destination.scope_id, currentTemplates: existing.length, recovering: additions.map(item => ({ id:item.workflow.id, name:item.workflow.name, nodes:item.workflow.nodes.length, edges:item.workflow.edges.length, backup:item.backupFile })) }, null, 2));
    if (!apply || additions.length === 0) continue;
    const recoveryDir = path.join(instance, 'data', 'recovery');
    fs.mkdirSync(recoveryDir, { recursive: true });
    const archivePath = path.join(recoveryDir, `workflows-${Date.now()}.json`);
    fs.writeFileSync(archivePath, JSON.stringify({ destination, recovered: source }, null, 2), { flag: 'wx' });
    await sql.begin(async tx => {
      const [locked] = await tx`select value_json from plugin_state where plugin_id = ${destination.plugin_id} and scope_kind = 'company' and scope_id = ${destination.scope_id} and namespace = 'native-workflow-designer' and state_key = 'templates' for update`;
      const current = locked.value_json;
      const missing = additions.filter(item => !current.some(template => template.id === item.workflow.id));
      const templates = missing.map(({workflow,backupFile}) => ({
        id:workflow.id, companyId:workflow.companyId, name:workflow.name, description:workflow.description ?? '', status:'draft', version:workflow.version ?? 1,
        createdAt:workflow.createdAt, updatedAt:workflow.updatedAt,
        recoveredFrom:{ backupFile, originalId:workflow.id, originalStatus:workflow.status },
        nodes:workflow.nodes.map(node => ({ id:node.id, type:'workflowNode', position:node.position, data:{ kind:node.data.kind, title:node.data.title, description:node.data.description ?? '', agentId:node.data.agentId ?? null, agentName:node.data.agentName ?? null, agentRole:node.data.agentRole ?? null, acceptanceCriteria:node.data.acceptanceCriteria ?? '', expectedOutputs:node.data.expectedOutputs ?? '', priority:node.data.priority ?? 'medium' } })),
        edges:workflow.edges.map(edge => ({ id:edge.id, source:edge.source, target:edge.target, type:'smoothstep' })),
      }));
      for (const item of missing) {
        await tx`insert into plugin_state (plugin_id, scope_kind, scope_id, namespace, state_key, value_json) values (${destination.plugin_id}, 'company', ${destination.scope_id}, 'native-workflow-designer', ${`recovery:workflow:${item.workflow.id}`}, ${tx.json(item)}) on conflict do nothing`;
      }
      await tx`update plugin_state set value_json = ${tx.json([...current, ...templates])}, updated_at = now() where plugin_id = ${destination.plugin_id} and scope_kind = 'company' and scope_id = ${destination.scope_id} and namespace = 'native-workflow-designer' and state_key = 'templates'`;
      console.log('Recovered', templates.length, 'drafts. Full snapshots preserved at', archivePath);
    });
  }
} finally { await sql.end(); }
