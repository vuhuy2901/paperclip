import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
const code = transformSync(readFileSync(new URL('../src/workflow-graph.ts', import.meta.url), 'utf8'), { loader:'ts', format:'esm' }).code;
const { compileTaskPlan } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const node = (id, kind='task') => ({id,data:{kind}});
const edge = (source,target) => ({source,target});
test('parallel and join controls compile to all native predecessor tasks, independent of canvas order', () => {
  const nodes = [node('qa'),node('join','join'),node('fe'),node('be'),node('ui'),node('parallel','parallel'),node('architect'),node('start','start')];
  const edges = [edge('start','architect'),edge('architect','parallel'),edge('parallel','be'),edge('parallel','ui'),edge('ui','fe'),edge('be','fe'),edge('be','join'),edge('fe','join'),edge('join','qa')];
  const plan = compileTaskPlan(nodes,edges);
  const byId = Object.fromEntries(plan.map(step=>[step.node.id,step.blockedByStepIds]));
  assert.deepEqual(byId.qa,['be','fe']);
  assert.deepEqual(byId.fe,['ui','be']);
  assert.deepEqual(byId.be,['architect']);
  assert.deepEqual(byId.architect,[]);
  assert.equal(plan.length,5);
  for (const step of plan) for (const parent of step.blockedByStepIds) assert.ok(plan.findIndex(item=>item.node.id===parent)<plan.indexOf(step));
});
test('approval is a native task; start and end are visual structure',()=>{
  const plan=compileTaskPlan([node('start','start'),node('be'),node('approval','approval'),node('end','end')],[edge('start','be'),edge('be','approval'),edge('approval','end')]);
  assert.deepEqual(plan.map(item=>item.node.id),['be','approval']);
  assert.deepEqual(plan[1].blockedByStepIds,['be']);
});
test('invalid and cyclic graphs are rejected before provisioning',()=>{
  assert.throws(()=>compileTaskPlan([node('a'),node('b')],[edge('a','b'),edge('b','a')]),/cycle/);
  assert.throws(()=>compileTaskPlan([node('a')],[edge('a','missing')]),/missing/);
  assert.throws(()=>compileTaskPlan([node('a'),node('a')],[]),/unique/);
});
test('SDLC gates two coding agents on their required handoffs and joins them before review',()=>{
  const nodes=['po','pm','architect','backend','frontend','join','review','qa','deploy','accept','end'].map(id=>node(id,['join','end'].includes(id)?id:id==='accept'?'approval':'task'));
  const edges=[edge('po','pm'),edge('pm','architect'),edge('architect','backend'),edge('architect','frontend'),edge('backend','join'),edge('frontend','join'),edge('join','review'),edge('review','qa'),edge('qa','deploy'),edge('deploy','accept'),edge('accept','end')];
  const plan=compileTaskPlan(nodes,edges); const dependencies=Object.fromEntries(plan.map(item=>[item.node.id,item.blockedByStepIds]));
  assert.deepEqual(dependencies.backend,['architect']);
  assert.deepEqual(dependencies.frontend,['architect']);
  assert.deepEqual(dependencies.review,['backend','frontend']);
  assert.deepEqual(dependencies.qa,['review']);
  assert.deepEqual(dependencies.deploy,['qa']);
  assert.deepEqual(dependencies.accept,['deploy']);
});
