var nt=Object.defineProperty;var M=(t,r)=>nt(t,"name",{value:r,configurable:!0});import{n as it}from"./mermaid-parser.core-CHJSk6z0.js";import{n as u}from"./chunk-Y2CYZVJY-OvsAdhaO.js";import{m as U}from"./src-Bssc388C.js";import{H as ot,K as st,U as lt,a as ct,c as ut,f as dt,v as ft,w as gt,x as pt,y as ht}from"./chunk-DU6HZSFF-mLZ_DAj9.js";import{t as mt}from"./ordinal-BJyFM1v8.js";import{n as C}from"./path-D6mommQw.js";import{m as I}from"./dist-Cj4C2HPs.js";import{t as q}from"./arc-BQ55EiX2.js";import{t as vt}from"./array-CL5Tisss.js";import{i as xt,p as yt}from"./chunk-75Z2AOVW-CTyOxDW3.js";import{t as St}from"./chunk-JWPE2WC7--HEGjv3t.js";import{f as wt}from"./mermaid.core-Be3XJK9z.js";function At(t,r){return r<t?-1:r>t?1:r>=t?0:NaN}M(At,"descending_default");function Ct(t){return t}M(Ct,"identity_default");function $t(){var t=Ct,r=At,h=null,l=C(0),c=C(I),$=C(0);function n(e){var o,m=(e=vt(e)).length,v,D,w=0,f=new Array(m),i=new Array(m),A=+l.apply(this,arguments),k=Math.min(I,Math.max(-I,c.apply(this,arguments)-A)),T,z=Math.min(Math.abs(k)/m,$.apply(this,arguments)),g=z*(k<0?-1:1),x;for(o=0;o<m;++o)(x=i[f[o]=o]=+t(e[o],o,e))>0&&(w+=x);for(r!=null?f.sort(function(_,p){return r(i[_],i[p])}):h!=null&&f.sort(function(_,p){return h(e[_],e[p])}),o=0,D=w?(k-m*g)/w:0;o<m;++o,A=T)v=f[o],x=i[v],T=A+(x>0?x*D:0)+g,i[v]={data:e[v],index:o,value:x,startAngle:A,endAngle:T,padAngle:z};return i}return M(n,"pie"),n.value=function(e){return arguments.length?(t=typeof e=="function"?e:C(+e),n):t},n.sortValues=function(e){return arguments.length?(r=e,h=null,n):r},n.sort=function(e){return arguments.length?(h=e,r=null,n):h},n.startAngle=function(e){return arguments.length?(l=typeof e=="function"?e:C(+e),n):l},n.endAngle=function(e){return arguments.length?(c=typeof e=="function"?e:C(+e),n):c},n.padAngle=function(e){return arguments.length?($=typeof e=="function"?e:C(+e),n):$},n}M($t,"pie_default");var J=dt.pie,V={sections:new Map,showData:!1,config:J},W=V.sections,B=V.showData,Dt=structuredClone(J),Q={getConfig:u(()=>structuredClone(Dt),"getConfig"),clear:u(()=>{W=new Map,B=V.showData,ct()},"clear"),setDiagramTitle:st,getDiagramTitle:gt,setAccTitle:lt,getAccTitle:ht,setAccDescription:ot,getAccDescription:ft,addSection:u(({label:t,value:r})=>{if(r<0)throw new Error(`"${t}" has invalid value: ${r}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);W.has(t)||(W.set(t,r),U.debug(`added new section: ${t}, with value: ${r}`))},"addSection"),getSections:u(()=>W,"getSections"),setShowData:u(t=>{B=t},"setShowData"),getShowData:u(()=>B,"getShowData")},Tt=u((t,r)=>{St(t,r),r.setShowData(t.showData),t.sections.map(r.addSection)},"populateDb"),bt={parse:u(async t=>{const r=await it("pie",t);U.debug(r),Tt(r,Q)},"parse")},kt=u(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),_t=u(t=>{const r=[...t.values()].reduce((l,c)=>l+c,0),h=[...t.entries()].map(([l,c])=>({label:l,value:c})).filter(l=>l.value/r*100>=1);return $t().value(l=>l.value).sort(null)(h)},"createPieArcs"),Bt={parser:bt,db:Q,renderer:{draw:u((t,r,h,l)=>{U.debug(`rendering pie chart
`+t);const c=l.db,$=pt(),n=xt(c.getConfig(),$.pie),e=40,o=18,m=4,v=450,D=v,w=wt(r),f=w.append("g");f.attr("transform","translate(225,225)");const{themeVariables:i}=$;let[A]=yt(i.pieOuterStrokeWidth);A??=2;const k=n.legendPosition,T=n.textPosition,z=n.donutHole>0&&n.donutHole<=.9?n.donutHole:0,g=Math.min(D,v)/2-e,x=q().innerRadius(z*g).outerRadius(g),_=q().innerRadius(g*T).outerRadius(g*T),p=f.append("g");p.append("circle").attr("cx",0).attr("cy",0).attr("r",g+A/2).attr("class","pieOuterCircle");const H=c.getSections(),Y=_t(H),tt=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let F=0;H.forEach(a=>{F+=a});const j=Y.filter(a=>(a.data.value/F*100).toFixed(0)!=="0"),N=mt(tt).domain([...H.keys()]);p.selectAll("mySlices").data(j).enter().append("path").attr("d",x).attr("fill",a=>N(a.data.label)).attr("class",a=>{let s="pieCircle";return n.highlightSlice==="hover"?s+=" highlightedOnHover":n.highlightSlice===a.data.label&&(s+=" highlighted"),s}),p.selectAll("mySlices").data(j).enter().append("text").text(a=>(a.data.value/F*100).toFixed(0)+"%").attr("transform",a=>"translate("+_.centroid(a)+")").style("text-anchor","middle").attr("class","slice");const et=f.append("text").text(c.getDiagramTitle()).attr("x",0).attr("y",-200).attr("class","pieTitleText"),E=[...H.entries()].map(([a,s])=>({label:a,value:s})),y=f.selectAll(".legend").data(E).enter().append("g").attr("class","legend");y.append("rect").attr("width",o).attr("height",o).style("fill",a=>N(a.label)).style("stroke",a=>N(a.label)),y.append("text").attr("x",22).attr("y",14).text(a=>c.getShowData()?`${a.label} [${a.value}]`:a.label);const b=Math.max(...y.selectAll("text").nodes().map(a=>a?.getBoundingClientRect().width??0));let L=v,O=490;const d=22,P=E.length*d;switch(k){case"center":y.attr("transform",(a,s)=>{const S=d*E.length/2,R=-b/2-22,G=s*d-S;return"translate("+R+","+G+")"});break;case"top":L+=P,y.attr("transform",(a,s)=>{const S=g;return`translate(${-b/2-22}, ${s*d-S})`}),p.attr("transform",()=>`translate(0, ${P+d})`);break;case"bottom":L+=P,y.attr("transform",(a,s)=>{const R=-b/2-22,G=s*d- -207;return"translate("+R+","+G+")"});break;case"left":O+=22+b,y.attr("transform",(a,s)=>{const S=d*E.length/2;return"translate(-207,"+(s*d-S)+")"}),p.attr("transform",()=>`translate(${b+o+m}, 0)`);break;default:O+=22+b,y.attr("transform",(a,s)=>{const S=d*E.length/2;return"translate(216,"+(s*d-S)+")"})}const K=et.node()?.getBoundingClientRect().width??0,at=D/2-K/2,rt=D/2+K/2,X=Math.min(0,at),Z=Math.max(O,rt)-X;w.attr("viewBox",`${X} 0 ${Z} ${L}`),ut(w,L,Z,n.useMaxWidth)},"draw")},styles:kt};export{Bt as diagram};
