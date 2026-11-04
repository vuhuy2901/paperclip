import React, { useEffect, useRef, useState } from 'react';
import { Background, BackgroundVariant, Controls, Handle, MiniMap, Position, ReactFlow, ReactFlowProvider, addEdge, useEdgesState, useNodesState, useReactFlow, type Connection, type Edge, type Node, type NodeProps } from '@xyflow/react';
import { ArrowLeft, Bot, Check, GitBranch, GitMerge, PanelLeftClose, PanelLeftOpen, Save, Trash2, Workflow } from 'lucide-react';
import { useHostLocation, useHostNavigation, usePluginAction, usePluginData, usePluginToast, type PluginPageProps } from '@paperclipai/plugin-sdk/ui';
import { WorkflowListPage } from './workflow-list';
import { studioStyles } from './studio-styles';

declare const __REACT_FLOW_STYLES__: string;
type Agent = { id: string; name: string; role: string; title?: string | null; status: string };
type StepKind = 'task' | 'start' | 'end' | 'parallel' | 'join' | 'approval';
type StepData = { kind: StepKind; title: string; description: string; agentId: string | null; agentName: string | null; agentRole: string | null; acceptanceCriteria: string; expectedOutputs: string; priority: string; [key: string]: unknown };
type FlowNode = Node<StepData>;
type Template = { id: string; companyId: string; name: string; description: string; version: number; status: 'draft' | 'published'; nodes: FlowNode[]; edges: Edge[]; createdAt: string; updatedAt: string; recoveredFrom?: { backupFile: string; originalId: string }; [key: string]: unknown };

const presentation = `
.wfs-native{font-family:inherit;color:var(--foreground);--wfs-accent:#2f6fed;--wfs-accent-soft:color-mix(in srgb,#2f6fed 10%,transparent)}
.wfs-native.wfs-root button,.wfs-native.wfs-root input,.wfs-native.wfs-root select,.wfs-native.wfs-root textarea{font-family:inherit;font-size:12px}.wfs-native .wfs-library-name,.wfs-native .wfs-library-meta{display:block}.wfs-native .wfs-library-copy{min-width:0;flex:1}.wfs-native .wfs-library-icon{flex-shrink:0}
.wfs-native.wfs-root{height:calc(100dvh - 154px);min-height:620px;box-shadow:none;border-radius:10px;grid-template-rows:auto minmax(0,1fr)}
.wfs-native.wfs-list-root{display:block;height:auto;min-height:calc(100dvh - 160px);overflow:visible;border:0;border-radius:0}
.wfs-native .wfs-toolbar{flex-wrap:wrap;gap:8px;padding:10px 12px}.wfs-native .wfs-brand{min-width:0;flex:1}.wfs-native .wfs-title{font-size:14px}.wfs-native .wfs-subtitle{font-size:11px}
.wfs-native .wfs-body{grid-template-columns:238px minmax(0,1fr) 292px;position:relative;min-height:0;overflow:hidden}.wfs-native .wfs-body.library-collapsed{grid-template-columns:48px minmax(0,1fr) 292px}
.wfs-native .wfs-canvas{position:relative;min-width:0;min-height:0;background:var(--background)}.wfs-native .wfs-sidebar{padding:0}.wfs-native .wfs-inspector{position:static;width:auto;box-shadow:none}
.wfs-native .wfs-library-item{width:100%;text-align:left;cursor:grab;color:inherit}.wfs-native .wfs-library-item:active{cursor:grabbing}.wfs-native .wfs-library-meta{font-size:10px}.wfs-native .wfs-library-name{font-size:12px}
.wfs-native .wfs-node{width:216px}.wfs-native .wfs-node-title{font-size:12px}.wfs-native .wfs-node-agent strong{font-size:11px}.wfs-native .wfs-node-agent span{font-size:9px}.wfs-native .wfs-node-foot{font-size:10px}.wfs-native .wfs-node.control{width:172px;border-style:dashed}.wfs-native .wfs-node.control .wfs-node-head{border-bottom:0;background:var(--muted)}
.wfs-native .wfs-node-description{font-size:10px;line-height:1.5;color:var(--muted-foreground);margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.wfs-native .wfs-node-kind{font-size:8px}.wfs-native .wfs-node-avatar{flex-shrink:0}
.wfs-native .wfs-field input,.wfs-native .wfs-field select,.wfs-native .wfs-field textarea{font-size:12px;padding:8px;min-width:0}.wfs-native .wfs-field textarea{min-height:84px;resize:vertical}.wfs-native .wfs-inspector-content{display:grid;gap:14px;padding:14px}.wfs-native .wfs-inspector-head{padding:13px 14px;border-bottom:1px solid var(--border);font-size:12px;font-weight:650}
.wfs-native .wfs-field-note{font-size:11px;line-height:1.6}.wfs-native .wfs-note{padding:10px 12px;border:1px solid var(--border);background:var(--muted);border-radius:8px;font-size:11px;line-height:1.6}.wfs-native .wfs-warning{color:#9a5b00;background:color-mix(in srgb,#f59e0b 10%,var(--background));border-color:color-mix(in srgb,#f59e0b 30%,var(--border))}.wfs-native .wfs-canvas-hint{position:absolute;z-index:3;top:14px;left:14px;max-width:80%;padding:7px 10px;background:var(--background);border:1px solid var(--border);border-radius:7px;font-size:10px;color:var(--muted-foreground);pointer-events:none}
.wfs-native .wfs-inspector-tabs{display:flex;gap:4px;padding:8px;border-bottom:1px solid var(--border)}.wfs-native .wfs-inspector-tabs button{flex:1}.wfs-native .wfs-steps{display:grid;gap:4px}.wfs-native .wfs-step-row{display:flex;gap:8px;align-items:center;padding:8px;border:1px solid transparent;border-radius:7px;background:transparent;color:inherit;text-align:left;font-size:11px;cursor:pointer;width:100%}.wfs-native .wfs-step-row:hover,.wfs-native .wfs-step-row[aria-current=true]{background:var(--background);border-color:var(--border)}.wfs-native .wfs-step-number{display:grid;place-items:center;width:20px;height:20px;border-radius:5px;background:var(--muted);font:10px ui-monospace,monospace;flex-shrink:0}.wfs-native .wfs-step-copy{min-width:0}.wfs-native .wfs-step-copy strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:550}.wfs-native .wfs-step-copy small{font-size:9px;color:var(--muted-foreground)}
.wfs-native .wfs-issue{display:block;padding:9px 0;border-bottom:1px solid var(--border);font-size:11px;color:inherit;text-decoration:none}.wfs-native .wfs-issue:hover{color:var(--wfs-accent)}.wfs-native .wfs-issue-meta{display:flex;justify-content:space-between;margin-bottom:4px;color:var(--muted-foreground);font-size:10px}.wfs-native .wfs-controls-row{display:grid;grid-template-columns:1fr 1fr;gap:6px}
@media(max-width:1200px){.wfs-native .wfs-body{grid-template-columns:200px minmax(0,1fr) 260px}.wfs-native .wfs-body.library-collapsed{grid-template-columns:48px minmax(0,1fr) 260px}}
@media(max-width:900px){.wfs-native .wfs-body,.wfs-native .wfs-body.library-collapsed{grid-template-columns:48px minmax(0,1fr) 240px}.wfs-native .wfs-sidebar .wfs-section{display:none}.wfs-native .wfs-sidebar-head strong{display:none}}
@media(max-width:640px){.wfs-native.wfs-root{height:auto;min-height:900px;overflow:visible}.wfs-native .wfs-body,.wfs-native .wfs-body.library-collapsed{display:flex;flex-direction:column}.wfs-native .wfs-sidebar{display:block;max-height:160px}.wfs-native .wfs-sidebar .wfs-section{display:block}.wfs-native .wfs-sidebar-head{display:none}.wfs-native .wfs-canvas{height:500px;flex:none}.wfs-native .wfs-inspector{min-height:260px;border-top:1px solid var(--border)}.wfs-native .wfs-toolbar{overflow:visible}.wfs-native .wfs-brand .wfs-title-wrap{display:block}}
`;
const allStyles = __REACT_FLOW_STYLES__ + studioStyles + presentation;
const controlItems: { kind: StepKind; title: string }[] = [{ kind:'start',title:'Start' },{ kind:'parallel',title:'Parallel' },{ kind:'join',title:'Join' },{ kind:'approval',title:'Approval' },{ kind:'end',title:'End' }];
const isTask = (kind: StepKind) => kind === 'task' || kind === 'approval';
function kindIcon(kind: StepKind) { return kind==='parallel'?<GitBranch size={14}/>:kind==='join'?<GitMerge size={14}/>:kind==='approval'?<Check size={14}/>:kind==='task'?<Bot size={14}/>:<Workflow size={14}/>; }
function normalizeNodes(nodes: FlowNode[]): FlowNode[] { return nodes.map(node=>({...node,type:'workflowNode',data:{...node.data,acceptanceCriteria:node.data.acceptanceCriteria??'',expectedOutputs:node.data.expectedOutputs??'',priority:node.data.priority??'medium'}})); }
function WorkflowCardNode({data,selected}:NodeProps<FlowNode>) {
  const task=isTask(data.kind);
  return <div className={`wfs-node ${task?'':'control'} ${selected?'selected':''}`}>
    {data.kind!=='start'&&<Handle className="wfs-handle target" type="target" position={Position.Left}/>}
    <div className="wfs-node-head"><span className="wfs-node-avatar">{kindIcon(data.kind)}</span><div className="wfs-node-agent"><strong>{task?data.agentName||'Choose agent':data.title}</strong><span>{task?data.agentRole||'Unassigned':data.kind}</span></div><span className="wfs-node-kind">{data.kind}</span></div>
    {task&&<div className="wfs-node-body"><div className="wfs-node-title">{data.title}</div><div className="wfs-node-description">{data.description}</div><div className="wfs-node-foot"><span className="wfs-status"><span className="wfs-status-dot"/>Template step</span><span className="wfs-node-model">{data.priority}</span></div></div>}
    {data.kind!=='end'&&<Handle className="wfs-handle source" type="source" position={Position.Right}/>}
  </div>;
}
const nodeTypes={workflowNode:WorkflowCardNode,task:WorkflowCardNode};

function Canvas({nodes,edges,onNodesChange,onEdgesChange,onConnect,onSelect,addNode,workflowId,selectedId}:any) {
  const flow=useReactFlow<FlowNode,Edge>();
  const fitted=useRef<string|null>(null);
  const measured=nodes.length>0&&nodes.every((node:FlowNode)=>node.measured?.width);
  useEffect(()=>{
    if(!measured||fitted.current===workflowId)return;
    fitted.current=workflowId;
    void flow.fitView({padding:.16,maxZoom:1}).then(()=>{
      if(flow.getZoom()<.65){const first=nodes[0];void flow.setViewport({x:40-first.position.x*.85,y:120-first.position.y*.85,zoom:.85});}
    });
  },[measured,workflowId,flow,nodes]);
  useEffect(()=>{if(!selectedId)return;const node=flow.getNode(selectedId);if(node)void flow.setCenter(node.position.x+(node.measured?.width??216)/2,node.position.y+(node.measured?.height??120)/2,{zoom:1,duration:200});},[selectedId,flow]);
  const onDrop=(event:React.DragEvent)=>{event.preventDefault();try{const payload=JSON.parse(event.dataTransfer.getData('application/x-native-workflow-agent'));addNode(payload.agent,payload.kind,flow.screenToFlowPosition({x:event.clientX,y:event.clientY}));}catch{/* Ignore unrelated drops. */}};
  return <main className="wfs-canvas" onDrop={onDrop} onDragOver={event=>{event.preventDefault();event.dataTransfer.dropEffect='copy';}}>
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_event,node)=>onSelect(node.id)} onPaneClick={()=>onSelect(null)} deleteKeyCode={['Backspace','Delete']} minZoom={.15} maxZoom={1.8} defaultEdgeOptions={{type:'smoothstep',style:{strokeWidth:1.5}}}>
      <Background variant={BackgroundVariant.Dots} gap={20} size={1}/><Controls/><MiniMap pannable zoomable/>
    </ReactFlow>
    <div className="wfs-canvas-hint">{nodes.length} steps · {edges.length} connections · Drag agents to add steps</div>
    {nodes.length===0&&<div style={{position:'absolute',inset:0,display:'grid',placeContent:'center',textAlign:'center',pointerEvents:'none',color:'var(--muted-foreground)'}}><Workflow size={30} style={{margin:'0 auto 14px'}}/><strong>Build your workflow</strong><p style={{fontSize:12,marginTop:8}}>Drag an agent from the library to add the first step.</p></div>}
  </main>;
}

function NativeProjectView({companyId,projectId,navigation}:any) {
  const {data,loading,error}=usePluginData<any>('workflow-designer-live',{companyId,projectId});
  if(loading)return <p className="wfs-field-note">Loading native tasks…</p>;
  if(error)return <p className="wfs-field-note">Could not load tasks: {error.message}</p>;
  return <>{(data?.issues??[]).map((issue:any)=><a className="wfs-issue" key={issue.id} {...navigation.linkProps(`/issues/${issue.id}`)}><div className="wfs-issue-meta"><span>{issue.identifier}</span><span>{issue.status.replaceAll('_',' ')}</span></div>{issue.title}</a>)}{data?.issues?.length===0&&<p className="wfs-field-note">This project has no native tasks.</p>}</>;
}

function Designer({context, initialProjectId}:PluginPageProps & { initialProjectId?: string }) {
  const companyId=context.companyId;
  const {data:bootstrap,loading,error,refresh}=usePluginData<any>('workflow-designer-bootstrap',{companyId});
  const navigation=useHostNavigation();
  const location=useHostLocation();
  const workflowId=new URLSearchParams(location.search).get('workflow');
  const basePath=location.pathname;
  const toast=usePluginToast();
  const save=usePluginAction('save-template'),create=usePluginAction('create-template'),duplicate=usePluginAction('duplicate-template'),rename=usePluginAction('rename-template'),archive=usePluginAction('archive-template'),apply=usePluginAction('apply-template');
  const [template,setTemplate]=useState<Template|null>(null);
  const [nodes,setNodes,onNodesChange]=useNodesState<FlowNode>([]);
  const [edges,setEdges,onEdgesChange]=useEdgesState<Edge>([]);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [busy,setBusy]=useState(false),[dirty,setDirty]=useState(false),[search,setSearch]=useState(''),[collapsed,setCollapsed]=useState(false);
  const [tab,setTab]=useState<'step'|'project'>(initialProjectId ? 'project' : 'step');
  const [projectId,setProjectId]=useState(initialProjectId || ''),[requirement,setRequirement]=useState(''),[applyResult,setApplyResult]=useState<string|null>(null);
  const templates:Template[]=bootstrap?.templates??[],agents:Agent[]=bootstrap?.agents??[],projects:any[]=bootstrap?.projects??[];
  const activeAgents=agents.filter(agent=>agent.status!=='terminated');
  const selected=nodes.find(node=>node.id===selectedId)??null;
  const savedTemplate=templates.find(item=>item.id===workflowId);
  const openWorkflow=(id:string)=>navigation.navigate(`${basePath}?workflow=${encodeURIComponent(id)}`);
  const openList=()=>navigation.navigate(basePath);

  useEffect(()=>{
    if(!workflowId){setTemplate(null);setSelectedId(null);return;}
    if(!savedTemplate||template?.id===workflowId)return;
    setTemplate(savedTemplate);setNodes(normalizeNodes(savedTemplate.nodes));setEdges(savedTemplate.edges);setSelectedId(null);setDirty(false);setApplyResult(null);
  },[workflowId,savedTemplate,template?.id,setNodes,setEdges]);
  const mutate=async(action:()=>Promise<any>,success:string)=>{setBusy(true);try{const result=await action();await refresh();toast({title:success,tone:'success'});return result;}catch(cause){toast({title:'Workflow action failed',body:String(cause),tone:'error'});return null;}finally{setBusy(false);}};
  const createWorkflow=async(name?:string)=>{const result=await mutate(()=>create({companyId,name:name||'New Workflow'}),'Workflow created');if(result?.template)openWorkflow(result.template.id);};
  const saveCurrent=async(status:'draft'|'published')=>{if(!template)return;const result=await mutate(()=>save({companyId,template:{...template,nodes,edges,status}}),status==='published'?'Workflow published':'Workflow saved');if(result?.template){setTemplate(result.template);setDirty(false);}};
  const onConnect=(connection:Connection)=>{if(!connection.source||!connection.target||connection.source===connection.target)return;setEdges(current=>addEdge({...connection,id:`${connection.source}->${connection.target}`,type:'smoothstep'},current));setDirty(true);};
  const addNode=(agent?:Agent,kind:StepKind='task',position?:{x:number;y:number})=>{
    const id=crypto.randomUUID();const data:StepData={kind,title:agent?agent.name:controlItems.find(item=>item.kind===kind)?.title||'New step',description:'',agentId:agent?.id??null,agentName:agent?.name??null,agentRole:agent?.title??agent?.role??null,acceptanceCriteria:'',expectedOutputs:'',priority:'medium'};
    setNodes(current=>[...current,{id,type:'workflowNode',position:position??{x:50+(current.length%3)*260,y:80+Math.floor(current.length/3)*180},data}]);setSelectedId(id);setTab('step');setDirty(true);
  };
  const updateSelected=(patch:Partial<StepData>)=>{setNodes(current=>current.map(node=>node.id===selectedId?{...node,data:{...node.data,...patch}}:node));setDirty(true);};
  const removeSelected=()=>{setNodes(current=>current.filter(node=>node.id!==selectedId));setEdges(current=>current.filter(edge=>edge.source!==selectedId&&edge.target!==selectedId));setSelectedId(null);setDirty(true);};
  const drag=(event:React.DragEvent,agent?:Agent,kind:StepKind='task')=>{event.dataTransfer.setData('application/x-native-workflow-agent',JSON.stringify({agent,kind}));event.dataTransfer.effectAllowed='copy';};
  const applyCurrent=async()=>{if(!template)return;const result=await mutate(()=>apply({companyId,projectId,templateId:template.id,requirement}),'Native tasks ready');if(result)setApplyResult(`${result.issues?.length??0} native tasks ${result.idempotent?'already exist':'created'}.`);};
  const invalidAgents=nodes.filter(node=>isTask(node.data.kind)&&(!node.data.agentId||!activeAgents.some(agent=>agent.id===node.data.agentId)));
  if(loading)return <><style>{allStyles}</style><div className="wfs-loading">Loading workflows…</div></>;
  if(error)return <><style>{allStyles}</style><div className="wfs-error"><div className="wfs-error-card"><strong>Could not load workflows</strong><p>{String(error.message)}</p><button className="wfs-button" onClick={()=>refresh()}>Retry</button></div></div></>;
  if(!workflowId)return <><style>{allStyles}</style><div className="wfs-root wfs-list-root wfs-native"><WorkflowListPage workflows={templates} busy={busy} createWorkflow={createWorkflow} openWorkflow={openWorkflow} duplicateWorkflow={id=>{void mutate(()=>duplicate({companyId,templateId:id}),'Workflow duplicated');}} renameWorkflow={(item,name)=>{void mutate(()=>rename({companyId,templateId:item.id,name}),'Workflow renamed');}} deleteWorkflow={item=>{void mutate(()=>archive({companyId,templateId:item.id}),'Workflow archived');}}/></div></>;
  if(!savedTemplate)return <><style>{allStyles}</style><div className="wfs-error"><div className="wfs-error-card"><strong>Workflow not found</strong><p>This workflow is not available in the selected company.</p><button className="wfs-button" onClick={openList}><ArrowLeft size={14}/>All workflows</button></div></div></>;
  if(!template||template.id!==workflowId)return <><style>{allStyles}</style><div className="wfs-loading">Opening workflow…</div></>;
  return <><style>{allStyles}</style><div className="wfs-root wfs-native">
    <header className="wfs-toolbar"><button className="wfs-button wfs-icon-button" title="All workflows" aria-label="All workflows" onClick={openList}><ArrowLeft size={15}/></button><div className="wfs-brand"><div className="wfs-brand-icon"><Workflow size={17}/></div><div className="wfs-title-wrap"><div className="wfs-title">{template.name}</div><div className="wfs-subtitle">{nodes.length} steps · {edges.length} connections · {dirty?'Unsaved changes':`v${template.version}`}</div></div></div><span className={`wfs-badge ${template.status==='published'?'wfs-badge-published':'wfs-badge-draft'}`}>{template.status}</span><button className="wfs-button" disabled={busy} onClick={()=>saveCurrent('draft')}><Save size={14}/>Save draft</button><button className="wfs-button wfs-button-primary" disabled={busy||nodes.length===0||invalidAgents.length>0} onClick={()=>saveCurrent('published')}><Check size={14}/>Publish</button></header>
    <div className={`wfs-body ${collapsed?'library-collapsed':''}`}>
      <aside className="wfs-sidebar"><div className="wfs-sidebar-head"><strong>Library</strong><button className="wfs-button wfs-icon-button" title={collapsed?'Expand library':'Collapse library'} onClick={()=>setCollapsed(!collapsed)}>{collapsed?<PanelLeftOpen size={14}/>:<PanelLeftClose size={14}/>}</button></div>{collapsed?<div className="wfs-collapsed-tools">{activeAgents.map(agent=><button key={agent.id} className="wfs-button wfs-icon-button" draggable onDragStart={event=>drag(event,agent)} onClick={()=>addNode(agent)} title={agent.name}><Bot size={15}/></button>)}</div>:<>
        <section className="wfs-section"><h3 className="wfs-section-title">Agent library</h3><input className="wfs-search" aria-label="Search agents" placeholder="Search agents…" value={search} onChange={event=>setSearch(event.target.value)}/><div className="wfs-library" style={{marginTop:10}}>{activeAgents.filter(agent=>`${agent.name} ${agent.title??''} ${agent.role}`.toLowerCase().includes(search.toLowerCase())).map(agent=><button className="wfs-library-item" key={agent.id} draggable onDragStart={event=>drag(event,agent)} onClick={()=>addNode(agent)}><span className="wfs-library-icon"><Bot size={15}/></span><span className="wfs-library-copy"><span className="wfs-library-name">{agent.name}</span><span className="wfs-library-meta">{agent.title??agent.role}</span></span></button>)}</div></section>
        <section className="wfs-section"><h3 className="wfs-section-title">Flow controls</h3><div className="wfs-controls-row">{controlItems.map(item=><button className="wfs-button" key={item.kind} draggable onDragStart={event=>drag(event,undefined,item.kind)} onClick={()=>addNode(undefined,item.kind)}>{kindIcon(item.kind)}{item.title}</button>)}</div><p className="wfs-field-note" style={{marginTop:10}}>Connections define dependencies. A join waits for all incoming branches.</p></section>
        <section className="wfs-section"><h3 className="wfs-section-title">Workflow steps <span>{nodes.length}</span></h3><div className="wfs-steps">{nodes.map((node,index)=><button className="wfs-step-row" key={node.id} aria-current={selectedId===node.id} onClick={()=>{setSelectedId(node.id);setTab('step');}}><span className="wfs-step-number">{index+1}</span><span className="wfs-step-copy"><strong>{node.data.title}</strong><small>{node.data.agentName||node.data.kind}</small></span></button>)}</div></section>
      </>}</aside>
      <ReactFlowProvider key={workflowId}><Canvas nodes={nodes} edges={edges} workflowId={workflowId} selectedId={selectedId} onNodesChange={(changes:any)=>{onNodesChange(changes);if(changes.some((change:any)=>change.type==='position'||change.type==='remove'))setDirty(true);}} onEdgesChange={(changes:any)=>{onEdgesChange(changes);if(changes.some((change:any)=>change.type==='remove'))setDirty(true);}} onConnect={onConnect} onSelect={(id:string|null)=>{setSelectedId(id);setTab('step');}} addNode={addNode}/></ReactFlowProvider>
      <aside className="wfs-inspector"><div className="wfs-inspector-tabs"><button className="wfs-tab" aria-selected={tab==='step'} onClick={()=>setTab('step')}>Step details</button><button className="wfs-tab" aria-selected={tab==='project'} onClick={()=>setTab('project')}>Project</button></div>
        {tab==='step'?<><div className="wfs-inspector-head">{selected?selected.data.title:'Workflow settings'}</div><div className="wfs-inspector-content">{selected?<>
          <label className="wfs-field"><span>Step title</span><input value={selected.data.title} onChange={event=>updateSelected({title:event.target.value})}/></label>
          <label className="wfs-field"><span>Step type</span><select value={selected.data.kind} onChange={event=>updateSelected({kind:event.target.value as StepKind})}>{['task','start','parallel','join','approval','end'].map(kind=><option key={kind}>{kind}</option>)}</select></label>
          {isTask(selected.data.kind)&&<><label className="wfs-field"><span>Responsible agent</span><select value={selected.data.agentId??''} onChange={event=>{const agent=activeAgents.find(item=>item.id===event.target.value);updateSelected({agentId:agent?.id??null,agentName:agent?.name??null,agentRole:agent?.title??agent?.role??null});}}><option value="">Select an agent…</option>{selected.data.agentId&&!activeAgents.some(agent=>agent.id===selected.data.agentId)&&<option value={selected.data.agentId}>{selected.data.agentName} (unavailable)</option>}{activeAgents.map(agent=><option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>{invalidAgents.some(node=>node.id===selected.id)&&<div className="wfs-note wfs-warning">Select a current native agent before publishing this workflow.</div>}</>}
          <label className="wfs-field"><span>Description</span><textarea value={selected.data.description} onChange={event=>updateSelected({description:event.target.value})}/></label>
          {isTask(selected.data.kind)&&<><label className="wfs-field"><span>Acceptance criteria</span><textarea value={selected.data.acceptanceCriteria} onChange={event=>updateSelected({acceptanceCriteria:event.target.value})}/></label><label className="wfs-field"><span>Expected outputs</span><textarea value={selected.data.expectedOutputs} onChange={event=>updateSelected({expectedOutputs:event.target.value})}/></label><label className="wfs-field"><span>Priority</span><select value={selected.data.priority} onChange={event=>updateSelected({priority:event.target.value})}>{['low','medium','high','urgent'].map(priority=><option key={priority}>{priority}</option>)}</select></label></>}
          <div className="wfs-field-note">Predecessors: {edges.filter(edge=>edge.target===selected.id).map(edge=>nodes.find(node=>node.id===edge.source)?.data.title).join(', ')||'None'}<br/>Successors: {edges.filter(edge=>edge.source===selected.id).map(edge=>nodes.find(node=>node.id===edge.target)?.data.title).join(', ')||'None'}</div><button className="wfs-button wfs-button-danger" onClick={removeSelected}><Trash2 size={14}/>Remove step</button>
        </>:<>
          <label className="wfs-field"><span>Workflow name</span><input value={template.name} onChange={event=>{setTemplate({...template,name:event.target.value});setDirty(true);}}/></label><label className="wfs-field"><span>Description</span><textarea value={template.description} onChange={event=>{setTemplate({...template,description:event.target.value});setDirty(true);}}/></label>
          <div className="wfs-note">Select a step on the canvas or in the steps list to edit its agent, deliverables and acceptance criteria.</div>
          {template.recoveredFrom&&<div className="wfs-note">Recovered workflow<br/>{template.recoveredFrom.backupFile}<br/>Review agent assignments before publishing.</div>}
          {invalidAgents.length>0&&<div className="wfs-note wfs-warning">{invalidAgents.length} task {invalidAgents.length===1?'step needs':'steps need'} a current agent assignment.</div>}
        </>}</div></>:<><div className="wfs-inspector-head">Apply workflow to a project</div><div className="wfs-inspector-content"><label className="wfs-field"><span>Project</span><select value={projectId} onChange={event=>setProjectId(event.target.value)}><option value="">Choose a project…</option>{projects.map(project=><option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="wfs-field"><span>Product requirement</span><textarea value={requirement} onChange={event=>setRequirement(event.target.value)} placeholder="Describe the work to deliver…"/></label>{template.status!=='published'&&<div className="wfs-note">Publish this workflow before applying it to a project.</div>}{dirty&&<div className="wfs-note wfs-warning">Save and publish your changes before creating tasks.</div>}<button className="wfs-button wfs-button-primary" disabled={busy||dirty||template.status!=='published'||!projectId||!requirement.trim()} onClick={applyCurrent}>Create native tasks</button>{applyResult&&<div className="wfs-note">{applyResult}</div>}{projectId&&<NativeProjectView companyId={companyId} projectId={projectId} navigation={navigation}/>}</div></>}
      </aside>
    </div>
  </div></>;
}

export function WorkflowDesignerPage({context}:PluginPageProps){return <Designer context={context}/>;}
export function ProjectWorkflowTab({context}:PluginPageProps){
  const ctx = context as any;
  const projId = ctx?.projectId || ctx?.entityId || '';
  return <Designer context={context} initialProjectId={projId}/>;
}
export default WorkflowDesignerPage;
