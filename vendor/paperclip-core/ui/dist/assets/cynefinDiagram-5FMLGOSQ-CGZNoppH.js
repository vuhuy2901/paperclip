var xt=Object.defineProperty;var M=(t,e)=>xt(t,"name",{value:e,configurable:!0});import{n as ht}from"./mermaid-parser.core-CHJSk6z0.js";import{n as i}from"./chunk-Y2CYZVJY-OvsAdhaO.js";import{m as X}from"./src-Bssc388C.js";import{D as at,H as gt,K as $t,U as bt,a as wt,b as K,c as Ct,f as Dt,v as vt,w as kt,y as Tt}from"./chunk-DU6HZSFF-mLZ_DAj9.js";import{i as Q}from"./chunk-75Z2AOVW-CTyOxDW3.js";import{t as At}from"./chunk-JWPE2WC7--HEGjv3t.js";import{f as Bt}from"./mermaid.core-Be3XJK9z.js";var rt=i(()=>({domains:new Map,transitions:[]}),"createDefaultData"),G=rt(),V={getDomains:i(()=>G.domains,"getDomains"),getTransitions:i(()=>G.transitions,"getTransitions"),setDomains:i(t=>{if(t)for(const e of t){const n=e.domain,o=(e.items??[]).map(c=>({label:c.label}));G.domains.set(n,{name:n,items:o})}},"setDomains"),setTransitions:i(t=>{t&&(G.transitions=t.filter(e=>e.from===e.to?(X.warn(`Cynefin: self-loop transition on domain "${e.from}" is not meaningful and will be skipped.`),!1):!0).map(e=>({from:e.from,to:e.to,label:e.label||void 0})))},"setTransitions"),getConfig:i(()=>Q({...Dt.cynefin,...K().cynefin}),"getConfig"),clear:i(()=>{wt(),G=rt()},"clear"),setAccTitle:bt,getAccTitle:Tt,setDiagramTitle:$t,getDiagramTitle:kt,getAccDescription:vt,setAccDescription:gt},St=i(t=>{At(t,V),V.setDomains(t.domains),V.setTransitions(t.transitions)},"populate"),Mt={parse:i(async t=>{const e=await ht("cynefin",t);X.debug(e),St(e)},"parse")};function Y(t){let e=t+1831565813|0;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}M(Y,"seededRandom");i(Y,"seededRandom");function it(t){let e=0;for(let n=0;n<t.length;n++){const o=t.charCodeAt(n);e=(e<<5)-e+o,e|=0}return e}M(it,"hashString");i(it,"hashString");function st(t,e){return typeof t=="number"&&Number.isFinite(t)&&t!==0?t:it(e)}M(st,"resolveSeed");i(st,"resolveSeed");function ct(t,e,n,o){const c=t/2,m=o??t*.015,D=7,P=e/D,d=[];for(let a=0;a<=D;a++){const p=Y(n+a*17)*m*2-m;d.push({x:c+p,y:a*P})}let v=`M${d[0].x},${d[0].y}`;for(let a=0;a<d.length-1;a++){const p=d[a],s=d[a+1],f=(p.y+s.y)/2,b=a%2===0?1:-1,x=m*1.5*b*Y(n+a*31+7),W=p.x+x,R=f,F=s.x-x;v+=` C${W},${R} ${F},${f} ${s.x},${s.y}`}return v}M(ct,"generateFoldPath");i(ct,"generateFoldPath");function lt(t,e,n,o){const c=e/2,m=o??e*.015,D=7,P=t/D,d=[];for(let a=0;a<=D;a++){const p=Y(n+a*23)*m*2-m;d.push({x:a*P,y:c+p})}let v=`M${d[0].x},${d[0].y}`;for(let a=0;a<d.length-1;a++){const p=d[a],s=d[a+1],f=(p.x+s.x)/2,b=a%2===0?1:-1,x=m*1.5*b*Y(n+a*37+11),W=f,R=p.y+x,F=f,H=s.y-x;v+=` C${W},${R} ${F},${H} ${s.x},${s.y}`}return v}M(lt,"generateHorizontalBoundary");i(lt,"generateHorizontalBoundary");function dt(t,e){const n=t/2,o=e*.5,c=e,m=t*.03;return[`M${n},${o}`,`C${n+m},${o+(c-o)*.2}`,`${n-m*1.5},${o+(c-o)*.55}`,`${n+m*.5},${o+(c-o)*.75}`,`C${n-m},${o+(c-o)*.85}`,`${n+m*.3},${o+(c-o)*.95}`,`${n},${c}`].join(" ")}M(dt,"generateCliffPath");i(dt,"generateCliffPath");function ft(t,e,n,o){return[`M${t-n},${e}`,`A${n},${o} 0 1,1 ${t+n},${e}`,`A${n},${o} 0 1,1 ${t-n},${e}`,"Z"].join(" ")}M(ft,"generateConfusionPath");i(ft,"generateConfusionPath");var ot={complex:{model:"Probe → Sense → Respond",practice:"Emergent Practices"},complicated:{model:"Sense → Analyse → Respond",practice:"Good Practices"},clear:{model:"Sense → Categorise → Respond",practice:"Best Practices"},chaotic:{model:"Act → Sense → Respond",practice:"Novel Practices"},confusion:{model:"",practice:"Disorder"}},zt=i((t,e)=>{const n=t/2,o=e/2;return{complex:{cx:n/2,cy:o/2,x:0,y:0,w:n,h:o},complicated:{cx:n+n/2,cy:o/2,x:n,y:0,w:n,h:o},chaotic:{cx:n/2,cy:o+o/2,x:0,y:o,w:n,h:o},clear:{cx:n+n/2,cy:o+o/2,x:n,y:o,w:n,h:o},confusion:{cx:n,cy:o,x:n*.7,y:o*.7,w:n*.6,h:o*.6}}},"getDomainLayouts"),Lt=i(()=>{const t=at(),e=K();return Q(t,e.themeVariables).cynefin},"getCynefinDomainColors"),q=3,Nt={draw:i((t,e,n,o)=>{const c=o.db,m=c.getDomains(),D=c.getTransitions(),P=c.getDiagramTitle(),d=c.getAccTitle(),v=c.getAccDescription(),a=c.getConfig(),p=Lt();X.debug("Rendering Cynefin diagram");const s=a.width,f=a.height,b=a.padding,x=a.showDomainDescriptions,W=a.boundaryAmplitude,R=s+b*2,F=f+b*2,H={complex:p.complexBg,complicated:p.complicatedBg,clear:p.clearBg,chaotic:p.chaoticBg,confusion:p.confusionBg},k=Bt(e);Ct(k,F,R,a.useMaxWidth??!0),k.attr("viewBox",`0 0 ${R} ${F}`),d&&k.append("title").text(d),v&&k.append("desc").text(v);const T=k.append("g").attr("transform",`translate(${b}, ${b})`),E=zt(s,f),Z=st(a.seed,e),mt=T.append("g").attr("class","cynefin-backgrounds"),j=["complex","complicated","chaotic","clear"];for(const l of j){const r=E[l];mt.append("rect").attr("class","cynefinDomain").attr("x",r.x).attr("y",r.y).attr("width",r.w).attr("height",r.h).attr("fill",H[l]).attr("fill-opacity",.4).attr("stroke","none")}const U=T.append("g").attr("class","cynefin-boundaries");U.append("path").attr("class","cynefinBoundary").attr("d",ct(s,f,Z,W)).attr("fill","none"),U.append("path").attr("class","cynefinBoundary").attr("d",lt(s,f,Z+100,W)).attr("fill","none"),U.append("path").attr("class","cynefinCliff").attr("d",dt(s,f)).attr("fill","none");const pt=s*.15,yt=f*.15;T.append("path").attr("class","cynefinConfusion").attr("d",ft(s/2,f/2,pt,yt)).attr("fill",H.confusion).attr("fill-opacity",.5);const J=T.append("g").attr("class","cynefin-labels");for(const l of j){const r=E[l];J.append("text").attr("class","cynefinDomainLabel").attr("x",r.cx).attr("y",x?r.cy-30:r.cy).attr("text-anchor","middle").attr("dominant-baseline","middle").text(l.charAt(0).toUpperCase()+l.slice(1))}if(J.append("text").attr("class","cynefinDomainLabel").attr("x",s/2).attr("y",x?f/2-10:f/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text("Confusion"),x){const l=T.append("g").attr("class","cynefin-subtitles");for(const r of j){const u=E[r],y=ot[r];l.append("text").attr("class","cynefinSubtitle").attr("x",u.cx).attr("y",u.cy-10).attr("text-anchor","middle").attr("dominant-baseline","middle").text(y.model),l.append("text").attr("class","cynefinSubtitle").attr("x",u.cx).attr("y",u.cy+5).attr("text-anchor","middle").attr("dominant-baseline","middle").text(y.practice)}l.append("text").attr("class","cynefinSubtitle").attr("x",s/2).attr("y",f/2+8).attr("text-anchor","middle").attr("dominant-baseline","middle").text(ot.confusion.practice)}const tt=T.append("g").attr("class","cynefin-items"),_=26;for(const l of["complex","complicated","chaotic","clear","confusion"]){const r=m.get(l);if(!r||r.items.length===0)continue;const u=E[l],y=l==="confusion";let z=r.items,L=0;y&&r.items.length>q&&(L=r.items.length-q,z=r.items.slice(0,q));let A;if(y){const g=x?22:14;A=u.cy+g}else A=u.cy+(x?25:15);if([...z].forEach((g,B)=>{const w=A+B*30,S=tt.append("g"),N=S.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",_/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(g.label);let $=g.label.length*7;const h=N.node();if(h&&typeof h.getBBox=="function"){const O=h.getBBox();O.width>0&&($=O.width)}const C=$+20,I=u.cx-C/2;S.attr("transform",`translate(${I}, ${w})`),S.insert("rect","text").attr("class","cynefinItem").attr("x",0).attr("y",0).attr("width",C).attr("height",_).attr("rx",4).attr("ry",4).attr("fill",H[l]).attr("fill-opacity",.95),N.attr("x",C/2).attr("y",_/2)}),L>0){const g=A+z.length*30,B=`+${L} more`,w=tt.append("g"),S=w.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",_/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(B);let N=B.length*7;const $=S.node();if($&&typeof $.getBBox=="function"){const I=$.getBBox();I.width>0&&(N=I.width)}const h=N+20,C=u.cx-h/2;w.attr("transform",`translate(${C}, ${g})`),w.insert("rect","text").attr("class","cynefinItemOverflow").attr("x",0).attr("y",0).attr("width",h).attr("height",_).attr("rx",4).attr("ry",4).attr("fill",H[l]).attr("fill-opacity",.6),S.attr("x",h/2).attr("y",_/2)}}if(D.length>0){const l=k.select("defs").empty()?k.append("defs"):k.select("defs"),r=`cynefin-arrow-${e}`;l.append("marker").attr("id",r).attr("viewBox","0 0 10 10").attr("refX",9).attr("refY",5).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto-start-reverse").append("path").attr("d","M 0 0 L 10 5 L 0 10 z").attr("class","cynefinArrowHead");const u=T.append("g").attr("class","cynefin-arrows");D.forEach(y=>{const z=E[y.from],L=E[y.to];if(!z||!L)return;if(y.from===y.to){X.warn(`Cynefin renderer: skipping self-loop on domain "${y.from}"`);return}const A=z.cx,g=z.cy,B=L.cx,w=L.cy,S=(A+B)/2,N=(g+w)/2,$=B-A,h=w-g,C=Math.sqrt($*$+h*h),I=C*.15,O=-h/C,ut=$/C,et=S+O*I,nt=N+ut*I;u.append("path").attr("class","cynefinArrowLine").attr("d",`M${A},${g} Q${et},${nt} ${B},${w}`).attr("fill","none").attr("marker-end",`url(#${r})`),y.label&&u.append("text").attr("class","cynefinArrowLabel").attr("x",et).attr("y",nt-6).attr("text-anchor","middle").attr("dominant-baseline","auto").text(y.label)})}P&&T.append("text").attr("class","cynefinTitle").attr("x",s/2).attr("y",-b/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text(P)},"draw")},It=i(()=>{const t=at(),e=K();return Q(t,e.themeVariables).cynefin},"getCynefinTheme"),Yt={parser:Mt,db:V,renderer:Nt,styles:i(()=>{const t=It();return`
	.cynefinDomain {
		stroke: none;
	}
	.cynefinDomainLabel {
		font-size: ${t.domainFontSize}px;
		font-weight: bold;
		fill: ${t.labelColor};
	}
	.cynefinSubtitle {
		font-size: ${t.itemFontSize-1}px;
		fill: ${t.textColor};
		font-style: italic;
	}
	.cynefinItem {
		fill-opacity: 0.95;
		stroke: ${t.boundaryColor};
		stroke-width: 1;
	}
	.cynefinItemText {
		font-size: ${t.itemFontSize}px;
		fill: ${t.textColor};
	}
	.cynefinItemOverflow {
		fill-opacity: 0.6;
		stroke: ${t.boundaryColor};
		stroke-width: 1;
		stroke-dasharray: 3 2;
	}
	.cynefinBoundary {
		stroke: ${t.boundaryColor};
		stroke-width: ${t.boundaryWidth};
		stroke-dasharray: 6 3;
	}
	.cynefinCliff {
		stroke: ${t.cliffColor};
		stroke-width: ${t.cliffWidth};
	}
	.cynefinConfusion {
		stroke: ${t.boundaryColor};
		stroke-width: 1.5;
		stroke-dasharray: 4 2;
	}
	.cynefinArrowLine {
		stroke: ${t.arrowColor};
		stroke-width: ${t.arrowWidth};
		fill: none;
	}
	.cynefinArrowHead {
		fill: ${t.arrowColor};
		stroke: none;
	}
	.cynefinArrowLabel {
		font-size: ${t.itemFontSize-1}px;
		fill: ${t.textColor};
	}
	.cynefinTitle {
		font-size: ${t.domainFontSize+2}px;
		font-weight: bold;
		fill: ${t.labelColor};
	}
	`},"styles")};export{Yt as diagram};
