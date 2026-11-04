// Run inside Paperclip. Rebuilds the canonical SDLC template using current agents.
// Existing native issues and historical workflow snapshots are untouched.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/usr/local/lib/node_modules/paperclipai/package.json');
const postgres = require('postgres');
const instance = '/home/node/.paperclip/instances/default';
const config = JSON.parse(fs.readFileSync(`${instance}/config.json`, 'utf8'));
const sql = postgres({ host:'127.0.0.1', port:config.database.embeddedPostgresPort, username:'paperclip', password:'paperclip', database:'paperclip' });
const templateName = 'AI Software Development Lifecycle';
const now = new Date().toISOString();
const apply = process.argv.includes('--apply');
const task = (id, x, y, agent, title, description, acceptanceCriteria, expectedOutputs, priority='medium', kind='task') => ({
  id, type:'workflowNode', position:{x,y}, data:{kind,title,description,agentId:agent.id,agentName:agent.name,agentRole:agent.title ?? agent.role,acceptanceCriteria,expectedOutputs,priority},
});
const control = (id, x, y, kind, title, description) => ({
  id, type:'workflowNode', position:{x,y}, data:{kind,title,description,agentId:null,agentName:null,agentRole:null,acceptanceCriteria:'',expectedOutputs:'',priority:'medium'},
});
try {
  const [state] = await sql`select id, plugin_id, scope_id, value_json from plugin_state where namespace='native-workflow-designer' and state_key='templates' and scope_kind='company'`;
  if (!state) throw new Error('Native workflow template state was not found.');
  const agents = await sql`select id, name, role, title, status from agents where company_id=${state.scope_id}`;
  const byName = new Map(agents.map(agent => [agent.name, agent]));
  const required = ['PO','Project Manager','Solution Architect','Backend Engineer','Frontend Engineer','Code Reviewer','QA Tester','DevOps Engineer'];
  for (const name of required) if (!byName.has(name)) throw new Error(`Required agent not found: ${name}`);
  const templates = state.value_json;
  const index = templates.findIndex(template => template.name === templateName && !template.archivedAt);
  if (index < 0) throw new Error(`Template not found: ${templateName}`);
  const previous = templates[index];
  const nodes = [
    task('po-requirements',0,240,byName.get('PO'),'PO confirms requirements','Clarify the CEO request, define product scope, priorities and measurable acceptance criteria.','Scope, priorities and acceptance criteria are explicit and approved for planning.','Product requirements and acceptance criteria.','high'),
    task('pm-plan',280,240,byName.get('Project Manager'),'PM creates delivery plan','Break the accepted requirement into architecture and design, implementation, review, test and release work.','Plan names owners, dependencies, risks and delivery checkpoints.','Delivery plan and task breakdown.','high'),
    task('architecture',560,240,byName.get('Solution Architect'),'Architecture and product design','Define system boundaries, data flow, API contracts, security constraints, user flows, responsive screens, interaction states, visual system and implementation-ready handoffs.','Backend and frontend contracts are implementable; UI states and acceptance criteria are complete; key risks are resolved.','Architecture decision record, API contract, data design, user flows, wireframes, states and visual specification.','high'),
    task('backend',1100,100,byName.get('Backend Engineer'),'Backend implementation','Implement services, APIs, persistence and migrations against the approved architecture.','Backend meets the API contract, handles errors and includes implementation evidence.','Backend code, migrations and API verification evidence.','high'),
    task('frontend',1100,380,byName.get('Frontend Engineer'),'Frontend implementation','Implement the Solution Architect design specification against the architecture and API contracts.','UI matches the approved specification, covers required states and integrates with the real API.','Frontend code and UI integration evidence.','high'),
    control('implementation-join',1400,240,'join','Implementation complete','Wait for both Backend and Frontend implementation before review.'),
    task('code-review',1650,240,byName.get('Code Reviewer'),'Code review','Review the combined implementation for correctness, security, maintainability and regression risk.','Blocking findings are resolved and approval evidence is recorded.','Review findings and approval evidence.','high'),
    task('qa',1910,240,byName.get('QA Tester'),'QA verification','Run functional, integration and regression verification against the PO acceptance criteria.','Acceptance criteria pass and defects are resolved or explicitly accepted.','Test report, defect evidence and acceptance result.','high'),
    task('deploy',2170,240,byName.get('DevOps Engineer'),'Deployment','Prepare and execute deployment with health checks and rollback evidence.','Deployment is healthy and rollback instructions are verified.','Deployment record, health checks and rollback evidence.','high'),
    task('po-acceptance',2430,240,byName.get('PO'),'PO acceptance','Validate the delivered result against the original product requirements and acceptance criteria.','PO records acceptance or returns concrete gaps for a new workflow revision.','Product acceptance decision.','high','approval'),
    control('complete',2700,240,'end','Workflow complete','The accepted delivery is complete.'),
  ];
  const pairs = [
    ['po-requirements','pm-plan'],['pm-plan','architecture'],
    ['architecture','backend'],['architecture','frontend'],['backend','implementation-join'],['frontend','implementation-join'],
    ['implementation-join','code-review'],['code-review','qa'],['qa','deploy'],['deploy','po-acceptance'],['po-acceptance','complete'],
  ];
  const edges = pairs.map(([source,target]) => ({id:`${source}->${target}`,source,target,type:'smoothstep'}));
  const redesigned = {...previous,status:'published',version:(previous.version??0)+1,updatedAt:now,publishedAt:now,description:'PO-led native delivery workflow where Solution Architect owns architecture and all product/UI design, followed by parallel Backend and Frontend implementation, joined review, QA, deployment and PO acceptance.',nodes,edges,redesignedAt:now};
  const summary = {mode:apply?'apply':'dry-run',templateId:previous.id,version:`${previous.version} -> ${redesigned.version}`,nodes:nodes.length,edges:edges.length,taskDependencies:Object.fromEntries(nodes.filter(node=>['task','approval'].includes(node.data.kind)).map(node=>[node.id,pairs.filter(([,target])=>target===node.id).map(([source])=>source)]))};
  console.log(JSON.stringify(summary,null,2));
  if (!apply) process.exit(0);
  const recoveryDir = `${instance}/data/recovery`;
  fs.mkdirSync(recoveryDir,{recursive:true});
  const snapshot = `${recoveryDir}/sdlc-before-redesign-${Date.now()}.json`;
  fs.writeFileSync(snapshot,JSON.stringify(previous,null,2),{flag:'wx'});
  await sql.begin(async tx => {
    const [locked] = await tx`select value_json from plugin_state where id=${state.id} for update`;
    const current = locked.value_json;
    const currentIndex = current.findIndex(template=>template.id===previous.id);
    if (currentIndex < 0) throw new Error('Template changed during redesign.');
    const next = [...current]; next[currentIndex] = redesigned;
    await tx`update plugin_state set value_json=${tx.json(next)}, updated_at=now() where id=${state.id}`;
    await tx`insert into plugin_state (plugin_id,scope_kind,scope_id,namespace,state_key,value_json) values (${state.plugin_id},'company',${state.scope_id},'native-workflow-designer',${`recovery:sdlc:${previous.id}:${Date.now()}`},${tx.json(previous)}) on conflict do nothing`;
  });
  console.log('Applied SDLC redesign. Previous template saved at',snapshot);
} finally { await sql.end(); }
