// Recovered from 953d6d5d4b921c5cca4bfa9db23a84436c5bfe90.
export const studioStyles = `
.wfs-root{--wfs-accent:#2f6fed;--wfs-accent-soft:color-mix(in srgb,var(--wfs-accent) 12%,transparent);--wfs-panel:color-mix(in srgb,var(--card,var(--background)) 94%,var(--muted) 6%);--wfs-line:var(--border);height:calc(100dvh - 108px);min-height:680px;display:grid;grid-template-rows:auto 1fr;overflow:hidden;border:1px solid var(--wfs-line);border-radius:14px;background:var(--background);color:var(--foreground);box-shadow:0 16px 48px color-mix(in srgb,var(--foreground) 7%,transparent);font-family:inherit}
.wfs-root *{box-sizing:border-box}.wfs-root button,.wfs-root input,.wfs-root select,.wfs-root textarea{font:inherit;color:inherit}.wfs-toolbar{min-height:58px;display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--wfs-line);background:var(--wfs-panel)}
.wfs-brand{display:flex;align-items:center;gap:9px;min-width:230px}.wfs-brand-icon{display:grid;place-items:center;width:32px;height:32px;border:1px solid color-mix(in srgb,var(--wfs-accent) 38%,var(--border));border-radius:9px;background:var(--wfs-accent-soft);color:var(--wfs-accent)}.wfs-title-wrap{min-width:0}.wfs-title{font-size:14px;font-weight:690;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wfs-subtitle{font-size:11px;color:var(--muted-foreground);margin-top:1px}
.wfs-tabs{display:flex;align-items:center;padding:3px;border-radius:9px;background:color-mix(in srgb,var(--muted) 70%,transparent)}.wfs-tab{height:30px;padding:0 11px;border:0;border-radius:7px;background:transparent;color:var(--muted-foreground);font-size:12px;font-weight:600;cursor:pointer}.wfs-tab[aria-selected=true]{background:var(--background);color:var(--foreground);box-shadow:0 1px 3px color-mix(in srgb,var(--foreground) 12%,transparent)}
.wfs-toolbar-spacer{flex:1}.wfs-button{height:34px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:var(--background);font-size:12px;font-weight:620;white-space:nowrap;cursor:pointer;transition:background .15s ease,border-color .15s ease,transform .1s ease}.wfs-button:hover:not(:disabled){background:var(--accent);border-color:color-mix(in srgb,var(--foreground) 18%,var(--border))}.wfs-button:active:not(:disabled){transform:translateY(1px)}.wfs-button:disabled{opacity:.45;cursor:not-allowed}.wfs-button-primary{background:var(--foreground);color:var(--background);border-color:var(--foreground)}.wfs-button-primary:hover:not(:disabled){background:color-mix(in srgb,var(--foreground) 88%,var(--background));border-color:var(--foreground)}.wfs-button-danger{color:var(--destructive,#dc2626)}.wfs-icon-button{width:34px;padding:0}.wfs-divider{width:1px;height:24px;background:var(--border)}
.wfs-body{min-height:0;display:grid;grid-template-columns:252px minmax(0,1fr) 306px}.wfs-body.inspector-closed{grid-template-columns:252px minmax(0,1fr) 0}.wfs-sidebar,.wfs-inspector{min-height:0;background:var(--wfs-panel);overflow:auto}.wfs-sidebar{border-right:1px solid var(--wfs-line)}.wfs-inspector{border-left:1px solid var(--wfs-line);transition:width .16s ease}.wfs-section{padding:14px;border-bottom:1px solid var(--wfs-line)}.wfs-section-title{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 10px;font-size:11px;font-weight:720;color:var(--muted-foreground);letter-spacing:.045em;text-transform:uppercase}.wfs-section-title button{border:0;background:none;cursor:pointer;color:inherit}
.wfs-search,.wfs-field input,.wfs-field select,.wfs-field textarea,.wfs-name-input{width:100%;border:1px solid var(--border);border-radius:8px;background:var(--background);outline:none}.wfs-search,.wfs-field input,.wfs-field select,.wfs-name-input{height:34px;padding:0 10px;font-size:12px}.wfs-field textarea{min-height:86px;padding:8px 10px;resize:vertical;font-size:12px;line-height:1.45}.wfs-search:focus,.wfs-field input:focus,.wfs-field select:focus,.wfs-field textarea:focus,.wfs-name-input:focus{border-color:var(--wfs-accent);box-shadow:0 0 0 3px var(--wfs-accent-soft)}
.wfs-library{display:grid;gap:7px}.wfs-library-item{display:flex;align-items:center;gap:9px;padding:9px;border:1px solid var(--border);border-radius:10px;background:var(--background);cursor:grab;user-select:none;transition:border-color .15s ease,transform .15s ease}.wfs-library-item:hover{border-color:color-mix(in srgb,var(--wfs-accent) 55%,var(--border));transform:translateY(-1px)}.wfs-library-item:active{cursor:grabbing}.wfs-library-icon{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:var(--wfs-accent-soft);color:var(--wfs-accent)}.wfs-library-copy{min-width:0}.wfs-library-name{font-size:12px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wfs-library-meta{font-size:10px;color:var(--muted-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.wfs-workflows{display:grid;gap:4px}.wfs-workflow-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;padding:8px;border:0;border-radius:8px;background:transparent;text-align:left;cursor:pointer}.wfs-workflow-row:hover{background:var(--accent)}.wfs-workflow-row.active{background:var(--wfs-accent-soft);color:var(--foreground)}.wfs-workflow-row strong{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wfs-workflow-row span{display:block;margin-top:2px;font-size:10px;color:var(--muted-foreground)}
.wfs-badge{display:inline-flex;align-items:center;gap:5px;padding:2px 7px;border:1px solid var(--border);border-radius:999px;font-size:10px;font-weight:650;line-height:18px;white-space:nowrap}.wfs-badge-draft{color:#a16207;background:color-mix(in srgb,#eab308 12%,transparent)}.wfs-badge-published{color:#15803d;background:color-mix(in srgb,#22c55e 12%,transparent)}
.wfs-canvas{position:relative;min-width:0;min-height:0;background:var(--background)}.wfs-canvas .react-flow__background{background:var(--background)}.wfs-canvas .react-flow__controls{border:1px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:none}.wfs-canvas .react-flow__controls-button{background:var(--background);color:var(--foreground);border-bottom-color:var(--border)}.wfs-canvas .react-flow__minimap{border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--background)}.wfs-canvas .react-flow__edge-path{stroke:color-mix(in srgb,var(--muted-foreground) 65%,transparent);stroke-width:1.6}.wfs-canvas .react-flow__edge.selected .react-flow__edge-path{stroke:var(--wfs-accent);stroke-width:2.2}.wfs-canvas .react-flow__connection-path{stroke:var(--wfs-accent);stroke-width:2}.wfs-canvas .react-flow__selection{background:var(--wfs-accent-soft);border:1px solid var(--wfs-accent)}
.wfs-node{width:244px;border:1px solid var(--border);border-radius:12px;background:var(--card,var(--background));box-shadow:0 8px 24px color-mix(in srgb,var(--foreground) 8%,transparent);overflow:hidden;transition:border-color .15s ease,box-shadow .15s ease}.wfs-node.selected{border-color:var(--wfs-accent);box-shadow:0 0 0 3px var(--wfs-accent-soft),0 10px 28px color-mix(in srgb,var(--foreground) 10%,transparent)}.wfs-node.running{border-color:#3b82f6}.wfs-node.error{border-color:#dc2626}.wfs-node-head{display:flex;align-items:center;gap:9px;padding:10px 11px;border-bottom:1px solid var(--border);background:color-mix(in srgb,var(--muted) 38%,transparent)}.wfs-node-avatar{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--wfs-accent-soft);color:var(--wfs-accent);font-size:11px;font-weight:750;overflow:hidden}.wfs-node-avatar img{width:100%;height:100%;object-fit:cover}.wfs-node-agent{min-width:0;flex:1}.wfs-node-agent strong{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wfs-node-agent span{display:block;margin-top:2px;font-size:9px;color:var(--muted-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wfs-node-kind{font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted-foreground)}.wfs-node-body{padding:11px}.wfs-node-title{font-size:13px;font-weight:690;line-height:1.3}.wfs-node-id{margin-top:5px;font:10px/1.3 ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--muted-foreground)}.wfs-node-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px}.wfs-status{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:650;text-transform:capitalize}.wfs-status-dot{width:7px;height:7px;border-radius:999px;background:#94a3b8}.wfs-status-todo .wfs-status-dot,.wfs-status-ready .wfs-status-dot{background:#3b82f6}.wfs-status-in_progress .wfs-status-dot,.wfs-status-running .wfs-status-dot{background:#2563eb}.wfs-status-blocked .wfs-status-dot{background:#f59e0b}.wfs-status-in_review .wfs-status-dot{background:#8b5cf6}.wfs-status-done .wfs-status-dot,.wfs-status-published .wfs-status-dot{background:#22c55e}.wfs-status-cancelled{opacity:.58}.wfs-status-error .wfs-status-dot,.wfs-status-failed .wfs-status-dot{background:#ef4444}.wfs-node-model{max-width:108px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:9px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--muted-foreground)}
@media (prefers-reduced-motion:no-preference){.wfs-node.running .wfs-status-dot{animation:wfs-pulse 1.5s ease-in-out infinite}@keyframes wfs-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.78)}}}.wfs-handle{width:9px!important;height:9px!important;border:2px solid var(--background)!important;background:var(--wfs-accent)!important}.wfs-handle.source{right:-5px!important}.wfs-handle.target{left:-5px!important}
.wfs-inspector-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--border);background:color-mix(in srgb,var(--wfs-panel) 92%,transparent);backdrop-filter:blur(12px)}.wfs-inspector-head strong{font-size:13px}.wfs-inspector-content{display:grid;gap:14px;padding:14px}.wfs-field{display:grid;gap:6px}.wfs-field>span{font-size:11px;font-weight:650;color:var(--muted-foreground)}.wfs-field-note{font-size:10px;line-height:1.4;color:var(--muted-foreground)}.wfs-inspector-empty{display:grid;place-items:center;height:100%;padding:32px;text-align:center;color:var(--muted-foreground);font-size:12px;line-height:1.5}.wfs-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.wfs-meta{padding:9px;border:1px solid var(--border);border-radius:9px;background:var(--background)}.wfs-meta span{display:block;font-size:9px;text-transform:uppercase;color:var(--muted-foreground)}.wfs-meta strong{display:block;margin-top:4px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wfs-empty,.wfs-loading,.wfs-error{height:100%;display:grid;place-items:center;padding:32px}.wfs-empty-card{max-width:520px;text-align:center}.wfs-empty-icon{display:grid;place-items:center;width:52px;height:52px;margin:0 auto 16px;border-radius:14px;background:var(--wfs-accent-soft);color:var(--wfs-accent)}.wfs-empty h2{margin:0;font-size:20px}.wfs-empty p{margin:8px auto 18px;max-width:46ch;color:var(--muted-foreground);font-size:13px;line-height:1.55}.wfs-loading-lines{width:380px;display:grid;gap:10px}.wfs-skeleton{height:14px;border-radius:6px;background:color-mix(in srgb,var(--muted) 75%,transparent)}.wfs-skeleton:nth-child(2){width:72%}.wfs-skeleton:nth-child(3){width:88%}.wfs-error-card{max-width:520px;padding:18px;border:1px solid color-mix(in srgb,#dc2626 45%,var(--border));border-radius:12px;background:color-mix(in srgb,#dc2626 8%,var(--background));font-size:12px;line-height:1.5}
.wfs-template-page,.wfs-monitor-summary{height:100%;overflow:auto;padding:24px}.wfs-page-heading{max-width:720px}.wfs-page-heading h2{margin:0;font-size:24px;letter-spacing:-.025em}.wfs-page-heading p{margin:8px 0 0;color:var(--muted-foreground);font-size:13px;line-height:1.55}.wfs-template-card{max-width:760px;margin-top:22px;border:1px solid var(--border);border-radius:14px;background:var(--card,var(--background));overflow:hidden}.wfs-template-top{display:grid;grid-template-columns:1fr auto;gap:18px;padding:20px}.wfs-template-top h3{margin:0;font-size:16px}.wfs-template-top p{margin:7px 0 0;color:var(--muted-foreground);font-size:12px;line-height:1.55}.wfs-template-flow{display:flex;align-items:center;gap:6px;padding:14px 20px;border-top:1px solid var(--border);overflow:auto;background:var(--wfs-panel)}.wfs-template-step{padding:5px 8px;border:1px solid var(--border);border-radius:7px;background:var(--background);font-size:10px;white-space:nowrap}.wfs-template-arrow{color:var(--muted-foreground)}
.wfs-monitor-bar{position:absolute;left:16px;right:16px;top:16px;z-index:4;display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--border);border-radius:11px;background:color-mix(in srgb,var(--background) 92%,transparent);backdrop-filter:blur(14px);box-shadow:0 8px 24px color-mix(in srgb,var(--foreground) 8%,transparent)}.wfs-monitor-stat{display:grid;gap:2px}.wfs-monitor-stat span{font-size:9px;text-transform:uppercase;color:var(--muted-foreground)}.wfs-monitor-stat strong{font-size:12px}.wfs-progress{width:160px;height:5px;border-radius:999px;background:var(--muted);overflow:hidden}.wfs-progress span{display:block;height:100%;background:#22c55e;transition:width .3s ease}.wfs-live{display:flex;align-items:center;gap:6px;margin-left:auto;font-size:10px;color:var(--muted-foreground)}.wfs-live-dot{width:7px;height:7px;border-radius:999px;background:#22c55e}
.wfs-validation{position:absolute;right:16px;top:16px;z-index:8;width:min(390px,calc(100% - 32px));max-height:55%;overflow:auto;border:1px solid var(--border);border-radius:12px;background:var(--background);box-shadow:0 18px 50px color-mix(in srgb,var(--foreground) 18%,transparent)}.wfs-validation-head{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;padding:11px 12px;border-bottom:1px solid var(--border);background:var(--background)}.wfs-validation-head strong{font-size:12px}.wfs-validation-list{display:grid;gap:7px;padding:10px}.wfs-validation-item{display:grid;grid-template-columns:auto 1fr;gap:8px;padding:8px;border-radius:8px;background:var(--wfs-panel);font-size:11px;line-height:1.4}.wfs-validation-item.error{color:#dc2626}.wfs-validation-item.warning{color:#a16207}
.wfs-modal-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:color-mix(in srgb,var(--foreground) 28%,transparent);backdrop-filter:blur(3px)}.wfs-modal{width:min(560px,100%);border:1px solid var(--border);border-radius:14px;background:var(--background);box-shadow:0 24px 80px color-mix(in srgb,var(--foreground) 24%,transparent);overflow:hidden}.wfs-modal-head{padding:18px 20px;border-bottom:1px solid var(--border)}.wfs-modal-head h3{margin:0;font-size:17px}.wfs-modal-head p{margin:6px 0 0;color:var(--muted-foreground);font-size:12px;line-height:1.5}.wfs-modal-body{display:grid;gap:10px;padding:16px 20px}.wfs-publish-line{display:flex;justify-content:space-between;gap:16px;font-size:12px}.wfs-publish-line span{color:var(--muted-foreground)}.wfs-modal-actions{display:flex;justify-content:flex-end;gap:8px;padding:14px 20px;border-top:1px solid var(--border);background:var(--wfs-panel)}
.wfs-root{height:min(720px,calc(100dvh - 170px));min-height:520px;border-radius:10px;box-shadow:none}.wfs-toolbar{min-height:46px;gap:6px;padding:6px 8px}.wfs-brand{min-width:170px;gap:7px}.wfs-brand-icon{width:28px;height:28px;border-radius:7px}.wfs-title{font-size:12px}.wfs-subtitle{font-size:9px}.wfs-tabs{padding:2px;border-radius:7px}.wfs-tab{height:26px;padding:0 8px;border-radius:6px;font-size:10px}.wfs-button{height:30px;gap:5px;padding:0 8px;border-radius:7px;font-size:11px}.wfs-icon-button{width:30px}.wfs-button-primary{background:#2459c4!important;color:#f8fafc!important;border-color:#2459c4!important}.wfs-button-primary *{color:#f8fafc!important}.wfs-button-primary:hover:not(:disabled){background:#1e4da9!important;border-color:#1e4da9!important}.wfs-button-primary:focus-visible{outline:2px solid #2459c4;outline-offset:2px}.wfs-name-input{height:30px!important;font-size:11px!important}.wfs-body{grid-template-columns:204px minmax(0,1fr) 274px}.wfs-body.inspector-closed{grid-template-columns:204px minmax(0,1fr) 0}.wfs-section{padding:10px}.wfs-section-title{margin-bottom:7px;font-size:9px}.wfs-library{gap:5px}.wfs-library-item{gap:7px;padding:6px;border-radius:8px}.wfs-library-icon{width:24px;height:24px;border-radius:6px}.wfs-library-name{font-size:10px}.wfs-library-meta{font-size:8px}.wfs-workflow-row{padding:6px}.wfs-workflow-row strong{font-size:10px}.wfs-workflow-row span{font-size:8px}.wfs-search,.wfs-field input,.wfs-field select{height:30px;font-size:11px}.wfs-node{width:196px;border-radius:9px;box-shadow:0 5px 16px color-mix(in srgb,var(--foreground) 7%,transparent)}.wfs-node-head{gap:7px;padding:7px 8px}.wfs-node-avatar{width:25px;height:25px;border-radius:7px;font-size:9px}.wfs-node-agent strong{font-size:10px}.wfs-node-agent span,.wfs-node-kind{font-size:8px}.wfs-node-body{padding:8px}.wfs-node-title{font-size:11px}.wfs-node-id{margin-top:3px;font-size:8px}.wfs-node-foot{margin-top:7px}.wfs-status{font-size:8px}.wfs-status-dot{width:6px;height:6px}.wfs-node-model{max-width:82px;font-size:8px}.wfs-inspector-head{padding:8px 10px}.wfs-inspector-content{gap:10px;padding:10px}.wfs-template-page,.wfs-monitor-summary{padding:14px}.wfs-page-heading h2{font-size:18px}.wfs-page-heading p{margin-top:4px;font-size:11px}.wfs-template-card{max-width:700px;margin-top:12px;border-radius:10px}.wfs-template-top{gap:12px;padding:12px 14px}.wfs-template-top h3{font-size:13px}.wfs-template-top p{margin-top:4px;max-width:62ch;font-size:10px;line-height:1.4}.wfs-template-flow{gap:4px;padding:8px 14px}.wfs-template-step{padding:3px 6px;border-radius:6px;font-size:9px}
.wfs-project-shell{--wfs-accent:#2f6fed;--wfs-accent-soft:color-mix(in srgb,var(--wfs-accent) 12%,transparent);display:grid;gap:12px;max-width:980px;min-height:360px;padding:4px;color:var(--foreground);font-family:inherit}.wfs-project-shell *{box-sizing:border-box}.wfs-project-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:10px;border-bottom:1px solid var(--border)}.wfs-project-head h2{margin:0;font-size:18px}.wfs-project-head p{margin:4px 0 0;color:var(--muted-foreground);font-size:11px}.wfs-project-picker{display:grid;grid-template-columns:minmax(240px,520px) auto;align-items:end;gap:8px;padding:12px;border:1px solid var(--border);border-radius:10px;background:color-mix(in srgb,var(--card,var(--background)) 94%,var(--muted) 6%)}.wfs-project-current{display:grid;gap:12px;padding:14px;border:1px solid var(--border);border-radius:10px;background:var(--card,var(--background))}.wfs-project-current-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.wfs-project-current-head h3{margin:6px 0 0;font-size:15px}.wfs-project-current-head p{margin:3px 0 0;color:var(--muted-foreground);font-size:10px}.wfs-project-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.wfs-project-stats>div{padding:9px;border:1px solid var(--border);border-radius:8px;background:var(--background)}.wfs-project-stats span{display:block;color:var(--muted-foreground);font-size:9px;text-transform:uppercase}.wfs-project-stats strong{display:block;margin-top:3px;font-size:14px}.wfs-project-agents{display:flex;flex-wrap:wrap;gap:5px}.wfs-project-agents span{display:inline-flex;align-items:center;gap:4px;padding:4px 7px;border-radius:6px;background:var(--muted);font-size:9px}.wfs-project-flow{display:flex;align-items:center;gap:4px;overflow:auto;padding:8px;border:1px solid var(--border);border-radius:8px}.wfs-project-flow span{padding:3px 6px;border-radius:5px;background:var(--muted);font-size:9px;white-space:nowrap}.wfs-project-flow svg{flex:none;color:var(--muted-foreground)}.wfs-project-note{display:flex;align-items:center;gap:7px;padding:8px 10px;border-radius:8px;background:color-mix(in srgb,#22c55e 10%,var(--background));color:#15803d;font-size:10px}.wfs-project-empty{display:flex;align-items:center;gap:12px;padding:16px;border:1px dashed var(--border);border-radius:10px;color:var(--muted-foreground)}.wfs-project-empty strong{color:var(--foreground);font-size:12px}.wfs-project-empty p{margin:3px 0 0;font-size:10px}.wfs-project-empty .wfs-button{margin-left:auto}

/* Responsive full-screen designer */
.wfs-root{width:100%;max-width:none;height:calc(100dvh - 104px);min-height:560px;border-radius:10px}.wfs-designer{position:relative;min-width:0;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);overflow:hidden}.wfs-designer-toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:8px;overflow:visible}.wfs-toolbar-left,.wfs-toolbar-actions{min-width:0;display:flex;align-items:center;gap:5px}.wfs-toolbar-actions{justify-content:flex-end}.wfs-toolbar-left .wfs-brand{min-width:148px}.wfs-toolbar-left .wfs-name-input{width:min(210px,18vw);min-width:110px}.wfs-menu-anchor{position:relative;display:flex}.wfs-popover{z-index:40;display:grid;min-width:176px;padding:5px;border:1px solid var(--border);border-radius:9px;background:var(--background);box-shadow:0 14px 36px color-mix(in srgb,var(--foreground) 18%,transparent)}.wfs-popover button,.wfs-context-menu button{display:flex;align-items:center;gap:8px;width:100%;min-height:30px;padding:5px 8px;border:0;border-radius:6px;background:transparent;text-align:left;font-size:11px;cursor:pointer}.wfs-popover button:hover,.wfs-context-menu button:hover{background:var(--accent)}.wfs-popover button.danger,.wfs-context-menu button.danger{color:var(--destructive,#dc2626)}.wfs-toolbar-popover{position:absolute;top:36px;right:0}.wfs-menu-separator{height:1px;margin:4px;background:var(--border)}
.wfs-body{position:relative;grid-template-columns:var(--wfs-sidebar-width,244px) minmax(0,1fr) var(--wfs-inspector-width,300px);overflow:hidden}.wfs-body.inspector-closed{grid-template-columns:var(--wfs-sidebar-width,244px) minmax(0,1fr) 0}.wfs-sidebar,.wfs-inspector{position:relative;overflow:auto;overscroll-behavior:contain}.wfs-sidebar-head{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;min-height:42px;padding:6px 8px;border-bottom:1px solid var(--border);background:var(--wfs-panel)}.wfs-sidebar-head strong{font-size:11px}.wfs-sidebar.collapsed{overflow:hidden}.wfs-collapsed-tools{display:grid;justify-items:center;gap:8px;padding:10px 0;overflow:auto}.wfs-collapsed-tools .wfs-library-icon{cursor:grab}.wfs-collapse-divider{width:28px;height:1px;background:var(--border)}.wfs-resize-handle{position:absolute;top:0;bottom:0;z-index:12;width:7px;cursor:col-resize;touch-action:none}.wfs-resize-handle.left{right:-4px}.wfs-resize-handle.right{left:-4px}.wfs-resize-handle:hover,.wfs-resize-handle:active{background:color-mix(in srgb,var(--wfs-accent) 35%,transparent)}
.wfs-list-tools{display:grid;grid-template-columns:minmax(0,1fr) 68px;gap:5px;margin-bottom:6px}.wfs-list-tools select{min-width:0;border:1px solid var(--border);border-radius:7px;background:var(--background);font-size:10px}.wfs-workflow-row{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 26px;gap:2px;padding:3px}.wfs-workflow-row>button:first-child{min-width:0;padding:5px;border:0;background:transparent;text-align:left;cursor:pointer}.wfs-row-menu{display:grid;place-items:center;border:0;border-radius:6px;background:transparent;cursor:pointer}.wfs-row-menu:hover{background:var(--background)}.wfs-row-popover{position:absolute;right:2px;top:31px}.wfs-inspector-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding-top:4px}.wfs-inspector-actions .wfs-button-danger{grid-column:1/-1}.wfs-confirm-modal{width:min(480px,calc(100vw - 32px))}
.wfs-canvas{overflow:hidden}.wfs-context-menu{position:fixed;z-index:1002;min-width:174px;padding:5px;border:1px solid var(--border);border-radius:9px;background:var(--background);box-shadow:0 16px 42px color-mix(in srgb,var(--foreground) 22%,transparent)}.wfs-zoom-bar{position:absolute;left:12px;bottom:12px;z-index:6;display:flex;overflow:hidden;border:1px solid var(--border);border-radius:8px;background:var(--background)}.wfs-zoom-bar button{display:grid;place-items:center;width:30px;height:30px;border:0;border-right:1px solid var(--border);background:transparent;cursor:pointer}.wfs-zoom-bar button:last-child{border-right:0}.wfs-zoom-bar button:hover{background:var(--accent)}
.wfs-node:hover{border-color:color-mix(in srgb,var(--wfs-accent) 52%,var(--border));box-shadow:0 8px 22px color-mix(in srgb,var(--foreground) 10%,transparent)}
.wfs-list-root{display:block;height:auto;min-height:calc(100dvh - 120px);overflow:visible;background:transparent;border:0}
.wfs-list-page{width:min(1240px,100%);margin:0 auto;padding:22px 16px 48px;display:flex;flex-direction:column;gap:18px}
.wfs-list-header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;padding-bottom:18px;border-bottom:1px solid var(--border);flex-wrap:wrap}
.wfs-list-eyebrow{margin-bottom:4px;color:var(--wfs-accent);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
.wfs-list-header h1{margin:0;font-size:26px;font-weight:700;letter-spacing:-.025em;color:var(--foreground)}
.wfs-list-header p{margin:6px 0 0;color:var(--muted-foreground);font-size:13px;line-height:1.5}
.wfs-list-header-actions{display:flex;align-items:center;gap:10px}

/* Controls & Filter Pills */
.wfs-list-controls{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.wfs-pill-group{display:inline-flex;align-items:center;gap:3px;padding:3px;border-radius:9px;background:color-mix(in srgb,var(--muted) 65%,transparent);border:1px solid var(--border)}
.wfs-pill-btn{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:var(--muted-foreground);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s ease}
.wfs-pill-btn:hover{color:var(--foreground)}
.wfs-pill-btn[aria-selected=true]{background:var(--background);color:var(--foreground);box-shadow:0 1px 3px color-mix(in srgb,var(--foreground) 10%,transparent)}
.wfs-pill-count{display:inline-block;padding:1px 6px;border-radius:999px;font-size:10px;font-weight:700;background:color-mix(in srgb,var(--muted) 80%,transparent);color:var(--muted-foreground)}
.wfs-pill-btn[aria-selected=true] .wfs-pill-count{background:var(--wfs-accent-soft);color:var(--wfs-accent)}

.wfs-controls-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.wfs-search-box{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:var(--background);color:var(--muted-foreground);min-width:260px;transition:border-color .15s ease,box-shadow .15s ease}
.wfs-search-box:focus-within{border-color:var(--wfs-accent);box-shadow:0 0 0 3px var(--wfs-accent-soft)}
.wfs-search-box input{min-width:0;flex:1;border:0;outline:0;background:transparent;font-size:12px;color:var(--foreground)}
.wfs-search-box input::placeholder{color:var(--muted-foreground)}
.wfs-search-clear{border:0;background:transparent;padding:2px;cursor:pointer;color:var(--muted-foreground);display:grid;place-items:center;border-radius:4px}
.wfs-search-clear:hover{color:var(--foreground);background:var(--muted)}
.wfs-view-toggle{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--background)}
.wfs-view-btn{display:grid;place-items:center;width:34px;height:34px;border:0;background:transparent;color:var(--muted-foreground);cursor:pointer;transition:all .15s ease}
.wfs-view-btn:hover{color:var(--foreground)}
.wfs-view-btn[aria-selected=true]{background:var(--muted);color:var(--foreground)}

/* Cards Grid */
.wfs-cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px}
.wfs-card{border:1px solid var(--border);border-radius:12px;background:var(--card,var(--background));padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:14px;position:relative;transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease}
.wfs-card:hover{border-color:color-mix(in srgb,var(--wfs-accent) 55%,var(--border));box-shadow:0 8px 24px color-mix(in srgb,var(--foreground) 7%,transparent);transform:translateY(-2px)}
.wfs-card-head{display:flex;flex-direction:column;gap:10px}
.wfs-card-top-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.wfs-card-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:9px;background:var(--wfs-accent-soft);color:var(--wfs-accent);flex:none}
.wfs-card-badges{display:flex;align-items:center;gap:6px;margin-left:auto}
.wfs-badge-version{display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;font-size:10px;font-weight:700;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;background:var(--muted);color:var(--muted-foreground);border:1px solid var(--border)}
.wfs-card-menu-anchor{position:relative;display:flex}
.wfs-icon-btn{display:grid;place-items:center;width:30px;height:30px;border:0;border-radius:6px;background:transparent;color:var(--muted-foreground);cursor:pointer;transition:background .15s ease,color .15s ease}
.wfs-icon-btn:hover{background:var(--muted);color:var(--foreground)}
.wfs-card-popover{position:absolute;right:0;top:34px;z-index:50}
.wfs-card-title{margin:0;font-size:15px;font-weight:700;line-height:1.35;color:var(--foreground);cursor:pointer;transition:color .15s ease}
.wfs-card-title:hover{color:var(--wfs-accent)}
.wfs-card-desc{margin:0;font-size:12px;line-height:1.5;color:var(--muted-foreground);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;min-height:36px}
.wfs-card-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:14px;border-top:1px solid var(--border)}
.wfs-card-updated{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--muted-foreground)}
.wfs-open-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;font-size:12px;font-weight:600}

/* Compact Table */
.wfs-compact-table{border:1px solid var(--border);border-radius:12px;background:var(--card,var(--background));overflow:visible}
.wfs-compact-head,.wfs-compact-row{display:grid;grid-template-columns:minmax(280px,1fr) 110px 80px 180px 180px;align-items:center;gap:12px;padding:0 16px}
.wfs-compact-head{height:40px;border-bottom:1px solid var(--border);background:var(--wfs-panel);font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted-foreground)}
.wfs-compact-row{min-height:64px;padding-top:10px;padding-bottom:10px;border-bottom:1px solid var(--border);font-size:12px;transition:background .15s ease}
.wfs-compact-row:last-child{border-bottom:0}
.wfs-compact-row:hover{background:color-mix(in srgb,var(--accent) 50%,transparent)}
.wfs-compact-main{display:flex;align-items:center;gap:12px;min-width:0;cursor:pointer;background:transparent;border:0;padding:0;text-align:left}
.wfs-compact-mark{display:grid;place-items:center;width:32px;height:32px;border-radius:8px;background:var(--wfs-accent-soft);color:var(--wfs-accent);flex:none}
.wfs-compact-text{min-width:0}
.wfs-compact-text strong{display:block;font-size:13px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--foreground)}
.wfs-compact-text small{display:block;font-size:11px;color:var(--muted-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.wfs-compact-time{font-size:11px;color:var(--muted-foreground)}
.wfs-compact-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px}

/* Empty State */
.wfs-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:56px 20px;border:1px dashed var(--border);border-radius:14px;background:color-mix(in srgb,var(--card,var(--background)) 50%,transparent);gap:14px}
.wfs-empty-state-icon{display:grid;place-items:center;width:52px;height:52px;border-radius:14px;background:var(--wfs-accent-soft);color:var(--wfs-accent)}
.wfs-empty-state h3{margin:0;font-size:16px;font-weight:650}
.wfs-empty-state p{margin:0;color:var(--muted-foreground);font-size:12px;max-width:44ch;line-height:1.5}

/* Designer Toolbar Badges & Single Back Navigation */
.wfs-badge-dirty{display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;font-size:10px;font-weight:650;background:color-mix(in srgb,#f59e0b 14%,transparent);color:#b45309;border:1px solid color-mix(in srgb,#f59e0b 35%,transparent)}
.wfs-back-btn{display:inline-flex;align-items:center;gap:6px;font-weight:600}
@media(max-width:1100px){.wfs-body{grid-template-columns:190px minmax(0,1fr)}.wfs-inspector{position:absolute;right:0;top:47px;bottom:0;z-index:10;width:min(290px,90vw);box-shadow:-16px 0 40px color-mix(in srgb,var(--foreground) 12%,transparent)}.wfs-body.inspector-closed{grid-template-columns:190px minmax(0,1fr)}.wfs-toolbar .wfs-button span{display:none}.wfs-brand{min-width:150px}}@media(max-width:760px){.wfs-root{height:min(680px,calc(100dvh - 120px));min-height:500px;border-radius:8px}.wfs-body,.wfs-body.inspector-closed{grid-template-columns:1fr}.wfs-sidebar{display:none}.wfs-brand{min-width:0}.wfs-brand .wfs-title-wrap{display:none}.wfs-tabs{margin-right:auto}.wfs-toolbar{overflow:auto}.wfs-template-top{grid-template-columns:1fr}.wfs-template-page{padding:10px}.wfs-project-head,.wfs-project-current-head{align-items:stretch;flex-direction:column}.wfs-project-picker{grid-template-columns:1fr}.wfs-project-stats{grid-template-columns:1fr 1fr}.wfs-project-empty{align-items:flex-start;flex-wrap:wrap}.wfs-project-empty .wfs-button{margin-left:0}}
@media(max-width:760px){.wfs-designer-toolbar{display:flex;align-items:center;overflow-x:auto;overflow-y:hidden}.wfs-designer-toolbar .wfs-toolbar-left{flex:none}.wfs-designer-toolbar .wfs-toolbar-left .wfs-brand,.wfs-designer-toolbar .wfs-toolbar-left .wfs-name-input,.wfs-designer-toolbar .wfs-toolbar-left .wfs-badge{display:none}.wfs-designer-toolbar .wfs-tabs{flex:none}.wfs-designer-toolbar .wfs-toolbar-actions{flex:none}.wfs-designer-toolbar .wfs-toolbar-actions .wfs-button span{display:none}.wfs-designer-toolbar .wfs-toolbar-actions .wfs-button{width:30px;padding:0}.wfs-context-menu{max-width:calc(100vw - 16px)}.wfs-root{height:calc(100dvh - 92px)}}
@media(max-width:980px){.wfs-list-page{padding-inline:14px}.wfs-compact-head{display:none}.wfs-compact-row{grid-template-columns:1fr;gap:8px}.wfs-compact-actions{justify-content:flex-start;padding-top:8px;border-top:1px solid var(--border)}}
@media(max-width:640px){.wfs-list-header{align-items:stretch;flex-direction:column}.wfs-list-header-actions{width:100%}.wfs-list-header-actions .wfs-button{flex:1}.wfs-list-controls{flex-direction:column;align-items:stretch}.wfs-search-box{width:100%;min-width:0}.wfs-cards-grid{grid-template-columns:1fr}.wfs-detail-toolbar .wfs-brand .wfs-title-wrap{display:none}.wfs-detail-toolbar{overflow-x:auto}}
@media(prefers-reduced-motion:reduce){.wfs-root *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}

/* ONE-CLICK RUN WORKFLOW & AGENT CONTROL CENTER */
.wfs-button-run{background:linear-gradient(135deg,#10b981 0%,#059669 100%)!important;color:#ffffff!important;border:1px solid #047857!important;font-weight:700!important;box-shadow:0 2px 10px rgba(16,185,129,0.35);transition:all .18s ease}
.wfs-button-run:hover:not(:disabled){background:linear-gradient(135deg,#059669 0%,#047857 100%)!important;box-shadow:0 4px 16px rgba(16,185,129,0.48);transform:translateY(-1px)}
.wfs-button-run *{color:#ffffff!important}
.wfs-run-dialog{width:min(660px,calc(100vw - 32px));max-height:calc(100vh - 64px);display:flex;flex-direction:column}
.wfs-run-dialog .wfs-modal-body{overflow-y:auto;max-height:calc(100vh - 210px);display:grid;gap:14px;padding:18px 22px}
.wfs-dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.wfs-preflight-card{border:1px solid var(--border);border-radius:10px;background:var(--wfs-panel);padding:12px;display:grid;gap:8px}
.wfs-preflight-item{display:flex;align-items:flex-start;gap:8px;font-size:11px;padding:4px 0}
.wfs-preflight-item.pass{color:#15803d}
.wfs-preflight-item.warn{color:#a16207}
.wfs-preflight-item.fail{color:#dc2626}
.wfs-preflight-icon{flex:none;margin-top:2px}
.wfs-preflight-text{display:grid;gap:1px}
.wfs-preflight-text strong{font-size:11px}
.wfs-preflight-text small{font-size:9.5px;color:var(--muted-foreground)}

/* AGENT CONTROL CENTER */
.wfs-control-center{width:min(1240px,100%);margin:0 auto;padding:18px 8px 36px;display:grid;gap:20px}
.wfs-control-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:var(--card,var(--background));box-shadow:0 4px 16px color-mix(in srgb,var(--foreground) 4%,transparent)}
.wfs-control-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.wfs-agents-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px}
.wfs-agent-card{border:1px solid var(--border);border-radius:12px;background:var(--card,var(--background));padding:14px;display:grid;gap:10px;transition:border-color .15s ease,box-shadow .15s ease}
.wfs-agent-card:hover{border-color:color-mix(in srgb,var(--wfs-accent) 45%,var(--border));box-shadow:0 6px 20px color-mix(in srgb,var(--foreground) 6%,transparent)}
.wfs-agent-head{display:flex;align-items:center;gap:10px}
.wfs-agent-avatar{width:36px;height:36px;border-radius:9px;background:var(--wfs-accent-soft);color:var(--wfs-accent);display:grid;place-items:center;font-weight:700;font-size:12px;flex:none}
.wfs-agent-info{min-width:0;flex:1}
.wfs-agent-info strong{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wfs-agent-info span{display:block;font-size:10px;color:var(--muted-foreground);margin-top:2px}
.wfs-agent-task{padding:8px 10px;border-radius:8px;background:var(--wfs-panel);border:1px solid var(--border);font-size:10.5px;display:grid;gap:3px}
.wfs-agent-task span{font-size:9px;text-transform:uppercase;color:var(--muted-foreground);font-weight:700}
.wfs-agent-task a{color:var(--wfs-accent);text-decoration:none;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wfs-agent-actions{display:flex;align-items:center;gap:6px;justify-content:flex-end;margin-top:2px}

/* WORKFLOW MONITOR CONTROLS & APPROVALS */
.wfs-approval-banner{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 16px;border-radius:10px;background:color-mix(in srgb,#8b5cf6 14%,var(--background));border:1px solid color-mix(in srgb,#8b5cf6 45%,var(--border));color:var(--foreground)}
.wfs-approval-actions{display:flex;gap:8px;flex:none}
.wfs-run-controls{display:flex;align-items:center;gap:6px}
.wfs-logs-drawer{position:fixed;right:0;top:0;bottom:0;width:min(520px,94vw);z-index:1050;background:var(--background);border-left:1px solid var(--border);box-shadow:-12px 0 36px color-mix(in srgb,var(--foreground) 16%,transparent);display:grid;grid-template-rows:auto 1fr;overflow:hidden}
.wfs-logs-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border);background:var(--wfs-panel)}
.wfs-logs-list{overflow-y:auto;padding:12px;display:grid;gap:8px}
.wfs-log-entry{padding:8px 10px;border-radius:8px;background:var(--wfs-panel);border:1px solid var(--border);font-size:10.5px;display:grid;gap:3px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.wfs-log-time{font-size:9px;color:var(--muted-foreground)}
.wfs-runs-table{border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--card,var(--background))}

/* REALTIME NODE VISUALIZATION STATES & GLOW */
.wfs-node{position:relative;border:1.5px solid var(--border);transition:all .2s cubic-bezier(0.4, 0, 0.2, 1)}
.wfs-node.wfs-node-pending{border-color:color-mix(in srgb,var(--border) 80%,transparent);opacity:.85}
.wfs-node.wfs-node-ready{border-color:#3b82f6;box-shadow:0 0 0 2px color-mix(in srgb,#3b82f6 30%,transparent),0 4px 16px color-mix(in srgb,#3b82f6 20%,transparent)}
.wfs-node.wfs-node-queued{border-color:#60a5fa;border-style:dashed;box-shadow:0 0 0 1px color-mix(in srgb,#60a5fa 30%,transparent)}
.wfs-node.wfs-node-running,.wfs-node.running{border-color:#2563eb;box-shadow:0 0 0 2px rgba(37,99,235,0.4),0 0 22px rgba(37,99,235,0.35);animation:wfs-node-glow 2.4s ease-in-out infinite}
.wfs-node.wfs-node-blocked,.wfs-node.blocked{border-color:#f59e0b;box-shadow:0 0 0 2px color-mix(in srgb,#f59e0b 35%,transparent),0 4px 18px color-mix(in srgb,#f59e0b 22%,transparent)}
.wfs-node.wfs-node-waiting_approval,.wfs-node.waiting_approval{border-color:#8b5cf6;box-shadow:0 0 0 2px color-mix(in srgb,#8b5cf6 40%,transparent),0 6px 20px color-mix(in srgb,#8b5cf6 25%,transparent)}
.wfs-node.wfs-node-completed,.wfs-node.completed{border-color:#10b981;box-shadow:0 0 0 1.5px color-mix(in srgb,#10b981 30%,transparent),0 3px 12px color-mix(in srgb,#10b981 18%,transparent)}
.wfs-node.wfs-node-failed,.wfs-node.error{border-color:#ef4444;box-shadow:0 0 0 2px color-mix(in srgb,#ef4444 40%,transparent),0 4px 18px color-mix(in srgb,#ef4444 30%,transparent)}
.wfs-node.wfs-node-cancelled{border-color:#64748b;opacity:.6}

@keyframes wfs-node-glow{
  0%,100%{box-shadow:0 0 0 2px rgba(37,99,235,0.45),0 0 18px rgba(37,99,235,0.3)}
  50%{box-shadow:0 0 0 3px rgba(37,99,235,0.7),0 0 32px rgba(6,182,212,0.45)}
}

.wfs-node-timer{display:inline-flex;align-items:center;gap:3px;font-size:9.5px;color:#2563eb;font-weight:700;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;background:color-mix(in srgb,#2563eb 10%,transparent);padding:2px 5px;border-radius:4px}
.wfs-node-multi-badge{display:inline-flex;align-items:center;gap:3px;font-size:9px;color:var(--muted-foreground);background:var(--muted);padding:1px 5px;border-radius:4px;margin-top:3px}

/* ANIMATED EXECUTION EDGES */
.react-flow__edge.active-handoff .react-flow__edge-path{stroke:#3b82f6!important;stroke-width:2.6px!important;stroke-dasharray:7 4!important;animation:wfs-edge-dash 0.9s linear infinite!important;filter:drop-shadow(0 0 4px rgba(59,130,246,0.65))}
.react-flow__edge.completed-edge .react-flow__edge-path{stroke:#10b981!important;stroke-width:2px!important;filter:drop-shadow(0 0 2px rgba(16,185,129,0.35))}
.react-flow__edge.blocked-edge .react-flow__edge-path{stroke:#f59e0b!important;stroke-dasharray:4 4!important;stroke-width:1.8px!important}
.react-flow__edge.failed-edge .react-flow__edge-path{stroke:#ef4444!important;stroke-dasharray:5 4!important;stroke-width:2px!important}

@keyframes wfs-edge-dash{
  from{stroke-dashoffset:22}
  to{stroke-dashoffset:0}
}

/* TERMINAL LOG VIEWER (XTERM STYLE) */
.wfs-terminal{display:flex;flex-direction:column;height:100%;min-height:280px;background:#0d1117;color:#e6edf3;font-family:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;border-radius:8px;overflow:hidden;border:1px solid #30363d}
.wfs-terminal-head{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#161b22;border-bottom:1px solid #30363d;font-size:11px}
.wfs-terminal-title{display:flex;align-items:center;gap:8px;font-weight:600;color:#c9d1d9}
.wfs-terminal-pulse{width:7px;height:7px;border-radius:50%;background:#3fb950;box-shadow:0 0 8px #3fb950}
.wfs-terminal-pulse.paused{background:#d29922;box-shadow:none}
.wfs-terminal-actions{display:flex;align-items:center;gap:6px}
.wfs-terminal-btn{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 7px;background:#21262d;border:1px solid #30363d;border-radius:5px;color:#c9d1d9;font-size:10px;cursor:pointer;transition:all .15s ease}
.wfs-terminal-btn:hover{background:#30363d;color:#ffffff}
.wfs-terminal-btn.active{background:#1f6feb;border-color:#388bfd;color:#ffffff}
.wfs-terminal-search{height:24px;padding:0 8px;background:#0d1117;border:1px solid #30363d;border-radius:5px;color:#c9d1d9;font-size:10.5px;width:130px;outline:none}
.wfs-terminal-search:focus{border-color:#58a6ff}
.wfs-terminal-body{flex:1;overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:3px;font-size:11px;line-height:1.45}
.wfs-terminal-line{display:flex;align-items:flex-start;gap:8px;word-break:break-word}
.wfs-terminal-time{color:#7d8590;font-size:10px;flex:none;user-select:none}
.wfs-terminal-tag{display:inline-block;padding:0 4px;border-radius:3px;font-size:9.5px;font-weight:700;flex:none}
.wfs-tag-info{background:rgba(56,139,253,0.15);color:#58a6ff}
.wfs-tag-action{background:rgba(63,185,80,0.15);color:#3fb950}
.wfs-tag-tool{background:rgba(187,128,255,0.15);color:#d2a8ff}
.wfs-tag-warn{background:rgba(210,153,34,0.15);color:#d29922}
.wfs-tag-error{background:rgba(248,81,73,0.15);color:#f85149}
.wfs-tag-approval{background:rgba(163,113,247,0.15);color:#bc8cff}
.wfs-terminal-msg{flex:1}
.wfs-terminal-msg.stderr{color:#f85149}
.wfs-terminal-msg.tool-result{color:#7ee787}
.wfs-terminal-empty{padding:28px;text-align:center;color:#7d8590;font-size:11px}

/* EXECUTION TIMELINE */
.wfs-timeline{display:flex;flex-direction:column;padding:12px;gap:12px;position:relative}
.wfs-timeline::before{content:"";position:absolute;left:21px;top:20px;bottom:20px;width:2px;background:var(--border)}
.wfs-timeline-item{display:flex;align-items:flex-start;gap:12px;position:relative}
.wfs-timeline-dot{width:18px;height:18px;border-radius:50%;background:var(--card,var(--background));border:2px solid #3b82f6;display:grid;place-items:center;font-size:9px;flex:none;z-index:2}
.wfs-timeline-dot.done{border-color:#10b981;background:#10b981;color:#ffffff}
.wfs-timeline-dot.error{border-color:#ef4444;background:#ef4444;color:#ffffff}
.wfs-timeline-dot.approval{border-color:#8b5cf6;background:#8b5cf6;color:#ffffff}
.wfs-timeline-card{flex:1;background:var(--wfs-panel);border:1px solid var(--border);border-radius:8px;padding:8px 10px;font-size:11px;display:grid;gap:3px}
.wfs-timeline-head{display:flex;align-items:center;justify-content:space-between;gap:6px}
.wfs-timeline-time{font-size:9.5px;color:var(--muted-foreground)}

/* ARTIFACTS TAB */
.wfs-artifacts-list{display:grid;gap:8px;padding:12px}
.wfs-artifact-card{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--wfs-panel);transition:border-color .15s ease}
.wfs-artifact-card:hover{border-color:var(--wfs-accent)}
.wfs-artifact-icon{width:32px;height:32px;border-radius:7px;background:var(--wfs-accent-soft);color:var(--wfs-accent);display:grid;place-items:center;flex:none}
.wfs-artifact-info{flex:1;min-width:0}
.wfs-artifact-info strong{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wfs-artifact-info small{display:block;font-size:10px;color:var(--muted-foreground);margin-top:2px}

/* TASK TREE VIEW */
.wfs-task-tree{display:grid;gap:6px;padding:12px}
.wfs-tree-item{border:1px solid var(--border);border-radius:8px;background:var(--card,var(--background));overflow:hidden}
.wfs-tree-head{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--wfs-panel);cursor:pointer;font-size:11.5px}
.wfs-tree-children{padding:6px 8px 8px 24px;display:grid;gap:5px;border-top:1px solid var(--border)}
.wfs-subtask-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 8px;border:1px solid var(--border);border-radius:6px;background:var(--background);font-size:11px}

/* REPLAY CONTROLS BAR */
.wfs-replay-bar{position:absolute;left:16px;right:16px;bottom:16px;z-index:5;display:flex;align-items:center;gap:12px;padding:8px 14px;border:1px solid var(--border);border-radius:10px;background:color-mix(in srgb,var(--background) 95%,transparent);backdrop-filter:blur(14px);box-shadow:0 6px 24px color-mix(in srgb,var(--foreground) 10%,transparent)}
.wfs-replay-scrubber{flex:1;cursor:pointer}
.wfs-replay-time{font-size:10px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--muted-foreground)}

/* FULLSCREEN OVERRIDE */
.wfs-root.wfs-fullscreen{position:fixed!important;inset:0!important;z-index:9999!important;width:100vw!important;height:100vh!important;max-width:none!important;border-radius:0!important;margin:0!important}

/* PORTFOLIO DASHBOARD */
.wfs-portfolio-page{display:grid;gap:16px;padding:20px 24px 36px;color:var(--foreground);width:100%;max-width:1240px;margin:0 auto}
.wfs-portfolio-header{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding-bottom:16px;border-bottom:1px solid var(--border);flex-wrap:wrap}
.wfs-portfolio-header h1{margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em}
.wfs-portfolio-header p{margin:4px 0 0;font-size:11px;color:var(--muted-foreground);max-width:64ch;line-height:1.5}
.wfs-portfolio-controls{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.wfs-portfolio-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wfs-portfolio-filters select{height:32px;padding:0 10px;border-radius:7px;border:1px solid var(--border);background:var(--background);font-size:11px;color:var(--foreground)}
.wfs-portfolio-search{display:flex;align-items:center;gap:8px;height:32px;padding:0 10px;border-radius:7px;border:1px solid var(--border);background:var(--background);min-width:240px;color:var(--muted-foreground)}
.wfs-portfolio-search:focus-within{border-color:var(--wfs-accent);box-shadow:0 0 0 3px var(--wfs-accent-soft)}
.wfs-portfolio-search input{border:none;outline:none;background:transparent;font-size:11px;width:100%;color:var(--foreground)}
.wfs-portfolio-view-toggle{display:inline-flex;border:1px solid var(--border);border-radius:7px;overflow:hidden;background:var(--background)}
.wfs-portfolio-view-toggle button{border:none;background:transparent;padding:6px 10px;cursor:pointer;color:var(--muted-foreground);display:flex;align-items:center;gap:4px;font-size:11px}
.wfs-portfolio-view-toggle button[aria-selected="true"]{background:var(--muted);color:var(--foreground);font-weight:600}

.wfs-portfolio-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px}
.wfs-portfolio-card{display:flex;flex-direction:column;justify-content:space-between;border:1px solid var(--border);border-radius:10px;padding:14px;background:var(--card,var(--background));box-shadow:0 2px 8px color-mix(in srgb,var(--foreground) 3%,transparent);transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}
.wfs-portfolio-card:hover{border-color:var(--wfs-accent);box-shadow:0 6px 20px color-mix(in srgb,var(--foreground) 7%,transparent)}
.wfs-portfolio-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}
.wfs-portfolio-card-title{font-size:14px;font-weight:600;text-decoration:none;color:inherit;display:flex;align-items:center;gap:6px;cursor:pointer}
.wfs-portfolio-card-title:hover{color:var(--wfs-accent)}
.wfs-portfolio-card-wf{font-size:10.5px;color:var(--muted-foreground);margin-top:2px}
.wfs-portfolio-card-body{display:grid;gap:10px;margin-bottom:12px}
.wfs-portfolio-progress-wrap{display:grid;gap:4px}
.wfs-portfolio-progress-bar{height:6px;width:100%;background:var(--muted);border-radius:999px;overflow:hidden}
.wfs-portfolio-progress-bar span{display:block;height:100%;border-radius:999px;background:#10b981;transition:width .3s ease}
.wfs-portfolio-progress-meta{display:flex;justify-content:space-between;font-size:10px;color:var(--muted-foreground)}
.wfs-stage-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:6px;background:color-mix(in srgb,#3b82f6 12%,transparent);color:#2563eb;font-size:10px;font-weight:500}
.wfs-stage-pulse{width:6px;height:6px;border-radius:50%;background:currentColor;animation:wfs-pulse 1.8s infinite}
@keyframes wfs-pulse{0%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}100%{opacity:.3;transform:scale(.8)}}
.wfs-agent-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:4px;background:var(--muted);font-size:9.5px;color:var(--foreground)}
.wfs-reason-box{font-size:10px;padding:6px 9px;border-radius:6px;background:color-mix(in srgb,#f59e0b 10%,transparent);border:1px solid color-mix(in srgb,#f59e0b 30%,transparent);color:#d97706;display:flex;align-items:center;gap:6px}
.wfs-reason-box.failed{background:color-mix(in srgb,#ef4444 10%,transparent);border-color:color-mix(in srgb,#ef4444 30%,transparent);color:#dc2626}
.wfs-portfolio-card-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:10px;border-top:1px solid var(--border);font-size:10px;color:var(--muted-foreground)}

.wfs-compat-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:color-mix(in srgb,var(--wfs-accent) 10%,var(--card));border:1px solid color-mix(in srgb,var(--wfs-accent) 30%,transparent);border-radius:8px;margin-bottom:12px}
.wfs-compat-banner p{margin:0;font-size:11px}

@keyframes wfs-slide-in{from{transform:translateX(100%)}to{transform:translateX(0)}}
.wfs-task-drawer{box-shadow:-12px 0 36px rgba(0,0,0,.35)}
`;
