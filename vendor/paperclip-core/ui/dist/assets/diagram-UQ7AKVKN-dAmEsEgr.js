var R=Object.defineProperty;var h=(a,t)=>R(a,"name",{value:t,configurable:!0});import{n as I}from"./mermaid-parser.core-CHJSk6z0.js";import{n as c}from"./chunk-Y2CYZVJY-OvsAdhaO.js";import{m as b}from"./src-Bssc388C.js";import{D as _,H as D,K as E,U as F,a as P,b as A,c as z,f as G,v as B,w as W,y as H}from"./chunk-DU6HZSFF-mLZ_DAj9.js";import{i as w}from"./chunk-75Z2AOVW-CTyOxDW3.js";import{t as U}from"./chunk-JWPE2WC7--HEGjv3t.js";import{f as V}from"./mermaid.core-Be3XJK9z.js";var x={showLegend:!0,ticks:5,max:null,min:0,graticule:"circle"},y=32,M={axes:[],curves:[],options:x},p=structuredClone(M),j=G.radar,K=c(()=>w({...j,...A().radar}),"getConfig"),L=c(()=>p.axes,"getAxes"),X=c(()=>p.curves,"getCurves"),N=c(()=>p.options,"getOptions"),Y=c(a=>{p.axes=a.map(t=>({name:t.name,label:t.label??t.name}))},"setAxes"),Z=c(a=>{p.curves=a.map(t=>({name:t.name,label:t.label??t.name,entries:q(t.entries)}))},"setCurves"),q=c(a=>{if(a[0].axis==null)return a.map(e=>e.value);const t=L();if(t.length===0)throw new Error("Axes must be populated before curves for reference entries");return t.map(e=>{const r=a.find(s=>s.axis?.$refText===e.name);if(r===void 0)throw new Error("Missing entry for axis "+e.label);return r.value})},"computeCurveEntries"),v={getAxes:L,getCurves:X,getOptions:N,setAxes:Y,setCurves:Z,setOptions:c(a=>{const t=a.reduce((e,r)=>(e[r.name]=r,e),{});p.options={showLegend:t.showLegend?.value??x.showLegend,ticks:t.ticks?.value??x.ticks,max:t.max?.value??x.max,min:t.min?.value??x.min,graticule:t.graticule?.value??x.graticule},p.options.ticks>y&&(b.warn(`Radar diagram ticks (${p.options.ticks}) exceeds maximum allowed (${y}). Using ${y} instead.`),p.options.ticks=y)},"setOptions"),getConfig:K,clear:c(()=>{P(),p=structuredClone(M)},"clear"),setAccTitle:F,getAccTitle:H,setDiagramTitle:E,getDiagramTitle:W,getAccDescription:B,setAccDescription:D},J=c(a=>{U(a,v);const{axes:t,curves:e,options:r}=a;v.setAxes(t),v.setCurves(e),v.setOptions(r)},"populate"),Q={parse:c(async a=>{const t=await I("radar",a);b.debug(t),J(t)},"parse")},tt=c((a,t,e,r)=>{const s=r.db,i=s.getAxes(),l=s.getCurves(),n=s.getOptions(),o=s.getConfig(),d=s.getDiagramTitle(),u=et(V(t),o),m=n.max??Math.max(...l.map(f=>Math.max(...f.entries))),g=n.min,$=Math.min(o.width,o.height)/2;at(u,i,$,n.ticks,n.graticule),rt(u,i,$,o),T(u,i,l,g,m,n.graticule,o),O(u,l,n.showLegend,o),u.append("text").attr("class","radarTitle").text(d).attr("x",0).attr("y",-o.height/2-o.marginTop)},"draw"),et=c((a,t)=>{const e=t.width+t.marginLeft+t.marginRight,r=t.height+t.marginTop+t.marginBottom,s={x:t.marginLeft+t.width/2,y:t.marginTop+t.height/2};return z(a,r,e,t.useMaxWidth??!0),a.attr("viewBox",`0 0 ${e} ${r}`).attr("overflow","visible"),a.append("g").attr("transform",`translate(${s.x}, ${s.y})`)},"drawFrame"),at=c((a,t,e,r,s)=>{if(s==="circle")for(let i=0;i<r;i++){const l=e*(i+1)/r;a.append("circle").attr("r",l).attr("class","radarGraticule")}else if(s==="polygon"){const i=t.length;for(let l=0;l<r;l++){const n=e*(l+1)/r,o=t.map((d,u)=>{const m=2*u*Math.PI/i-Math.PI/2;return`${n*Math.cos(m)},${n*Math.sin(m)}`}).join(" ");a.append("polygon").attr("points",o).attr("class","radarGraticule")}}},"drawGraticule"),rt=c((a,t,e,r)=>{const s=t.length;for(let i=0;i<s;i++){const l=t[i].label,n=2*i*Math.PI/s-Math.PI/2,o=Math.cos(n),d=Math.sin(n);a.append("line").attr("x1",0).attr("y1",0).attr("x2",e*r.axisScaleFactor*o).attr("y2",e*r.axisScaleFactor*d).attr("class","radarAxisLine");const u=o>.01?"start":o<-.01?"end":"middle",m=d>.01?"hanging":d<-.01?"auto":"central",g=4;a.append("text").text(l).attr("x",e*r.axisLabelFactor*o+g*o).attr("y",e*r.axisLabelFactor*d+g*d).attr("text-anchor",u).attr("dominant-baseline",m).attr("class","radarAxisLabel")}},"drawAxes");function T(a,t,e,r,s,i,l){const n=t.length,o=Math.min(l.width,l.height)/2;e.forEach((d,u)=>{if(d.entries.length!==n)return;const m=d.entries.map((g,$)=>{const f=2*Math.PI*$/n-Math.PI/2,C=S(g,r,s,o);return{x:C*Math.cos(f),y:C*Math.sin(f)}});i==="circle"?a.append("path").attr("d",k(m,l.curveTension)).attr("class",`radarCurve-${u}`):i==="polygon"&&a.append("polygon").attr("points",m.map(g=>`${g.x},${g.y}`).join(" ")).attr("class",`radarCurve-${u}`)})}h(T,"drawCurves");c(T,"drawCurves");function S(a,t,e,r){return r*(Math.min(Math.max(a,t),e)-t)/(e-t)}h(S,"relativeRadius");c(S,"relativeRadius");function k(a,t){const e=a.length;let r=`M${a[0].x},${a[0].y}`;for(let s=0;s<e;s++){const i=a[(s-1+e)%e],l=a[s],n=a[(s+1)%e],o=a[(s+2)%e],d={x:l.x+(n.x-i.x)*t,y:l.y+(n.y-i.y)*t},u={x:n.x-(o.x-l.x)*t,y:n.y-(o.y-l.y)*t};r+=` C${d.x},${d.y} ${u.x},${u.y} ${n.x},${n.y}`}return`${r} Z`}h(k,"closedRoundCurve");c(k,"closedRoundCurve");function O(a,t,e,r){if(!e)return;const s=(r.width/2+r.marginRight)*3/4,i=-(r.height/2+r.marginTop)*3/4,l=20;t.forEach((n,o)=>{const d=a.append("g").attr("transform",`translate(${s}, ${i+o*l})`);d.append("rect").attr("width",12).attr("height",12).attr("class",`radarLegendBox-${o}`),d.append("text").attr("x",16).attr("y",0).attr("class","radarLegendText").text(n.label)})}h(O,"drawLegend");c(O,"drawLegend");var st={draw:tt},nt=c((a,t)=>{let e="";for(let r=0;r<a.THEME_COLOR_LIMIT;r++){const s=a[`cScale${r}`];e+=`
		.radarCurve-${r} {
			color: ${s};
			fill: ${s};
			fill-opacity: ${t.curveOpacity};
			stroke: ${s};
			stroke-width: ${t.curveStrokeWidth};
		}
		.radarLegendBox-${r} {
			fill: ${s};
			fill-opacity: ${t.curveOpacity};
			stroke: ${s};
		}
		`}return e},"genIndexStyles"),ot=c(a=>{const t=_(),e=A(),r=w(t,e.themeVariables);return{themeVariables:r,radarOptions:w(r.radar,a)}},"buildRadarStyleOptions"),xt={parser:Q,db:v,renderer:st,styles:c(({radar:a}={})=>{const{themeVariables:t,radarOptions:e}=ot(a);return`
	.radarTitle {
		font-size: ${t.fontSize};
		color: ${t.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${e.axisColor};
		stroke-width: ${e.axisStrokeWidth};
	}
	.radarAxisLabel {
		font-size: ${e.axisLabelFontSize}px;
		color: ${e.axisColor};
	}
	.radarGraticule {
		fill: ${e.graticuleColor};
		fill-opacity: ${e.graticuleOpacity};
		stroke: ${e.graticuleColor};
		stroke-width: ${e.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${e.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${nt(t,e)}
	`},"styles")};export{xt as diagram};
