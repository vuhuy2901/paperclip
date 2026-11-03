var se=Object.defineProperty;var _=(t,e)=>se(t,"name",{value:e,configurable:!0});import{n as u}from"./chunk-Y2CYZVJY-OvsAdhaO.js";import{m as b,p as kt}from"./src-Bssc388C.js";import{$ as ie,H as re,K as ae,U as ne,a as oe,s as j,v as le,w as ce,x as P,y as he}from"./chunk-DU6HZSFF-mLZ_DAj9.js";import{g as ue,s as de}from"./chunk-75Z2AOVW-CTyOxDW3.js";import{t as fe}from"./chunk-F27PBJKO-BI6MjXNA.js";import{t as pe}from"./chunk-XXDRQBXY-BhrH-9FX.js";import{t as Se}from"./chunk-POPQ4Y6H-B0MtQqlF.js";import{d as ye}from"./mermaid.core-Be3XJK9z.js";var At=(function(){var t=u(function(a,f,l,p){for(l=l||{},p=a.length;p--;l[a[p]]=f);return l},"o"),e=[1,2],r=[1,3],s=[1,4],h=[2,4],c=[1,9],y=[1,11],T=[1,16],n=[1,17],g=[1,18],C=[1,19],A=[1,33],x=[1,20],$=[1,21],d=[1,22],D=[1,23],N=[1,24],w=[1,26],Y=[1,27],v=[1,28],B=[1,29],st=[1,30],it=[1,31],rt=[1,32],at=[1,35],nt=[1,36],ot=[1,37],lt=[1,38],H=[1,34],S=[1,4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],ct=[1,4,5,14,15,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,39,40,41,45,48,51,52,53,54,57],It=[4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],Tt={trace:u(_(function(){},"trace"),"trace"),yy:{},symbols_:{error:2,start:3,SPACE:4,NL:5,SD:6,document:7,line:8,statement:9,classDefStatement:10,styleStatement:11,cssClassStatement:12,idStatement:13,DESCR:14,"-->":15,HIDE_EMPTY:16,scale:17,WIDTH:18,COMPOSIT_STATE:19,STRUCT_START:20,STRUCT_STOP:21,STATE_DESCR:22,AS:23,ID:24,FORK:25,JOIN:26,CHOICE:27,CONCURRENT:28,note:29,notePosition:30,NOTE_TEXT:31,direction:32,acc_title:33,acc_title_value:34,acc_descr:35,acc_descr_value:36,acc_descr_multiline_value:37,CLICK:38,STRING:39,HREF:40,classDef:41,CLASSDEF_ID:42,CLASSDEF_STYLEOPTS:43,DEFAULT:44,style:45,STYLE_IDS:46,STYLEDEF_STYLEOPTS:47,class:48,CLASSENTITY_IDS:49,STYLECLASS:50,direction_tb:51,direction_bt:52,direction_rl:53,direction_lr:54,eol:55,";":56,EDGE_STATE:57,STYLE_SEPARATOR:58,left_of:59,right_of:60,$accept:0,$end:1},terminals_:{2:"error",4:"SPACE",5:"NL",6:"SD",14:"DESCR",15:"-->",16:"HIDE_EMPTY",17:"scale",18:"WIDTH",19:"COMPOSIT_STATE",20:"STRUCT_START",21:"STRUCT_STOP",22:"STATE_DESCR",23:"AS",24:"ID",25:"FORK",26:"JOIN",27:"CHOICE",28:"CONCURRENT",29:"note",31:"NOTE_TEXT",33:"acc_title",34:"acc_title_value",35:"acc_descr",36:"acc_descr_value",37:"acc_descr_multiline_value",38:"CLICK",39:"STRING",40:"HREF",41:"classDef",42:"CLASSDEF_ID",43:"CLASSDEF_STYLEOPTS",44:"DEFAULT",45:"style",46:"STYLE_IDS",47:"STYLEDEF_STYLEOPTS",48:"class",49:"CLASSENTITY_IDS",50:"STYLECLASS",51:"direction_tb",52:"direction_bt",53:"direction_rl",54:"direction_lr",56:";",57:"EDGE_STATE",58:"STYLE_SEPARATOR",59:"left_of",60:"right_of"},productions_:[0,[3,2],[3,2],[3,2],[7,0],[7,2],[8,2],[8,1],[8,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,3],[9,4],[9,1],[9,2],[9,1],[9,4],[9,3],[9,6],[9,1],[9,1],[9,1],[9,1],[9,4],[9,4],[9,1],[9,2],[9,2],[9,1],[9,5],[9,5],[10,3],[10,3],[11,3],[12,3],[32,1],[32,1],[32,1],[32,1],[55,1],[55,1],[13,1],[13,1],[13,3],[13,3],[30,1],[30,1]],performAction:u(_(function(f,l,p,m,E,i,V){var o=i.length-1;switch(E){case 3:return m.setRootDoc(i[o]),i[o];case 4:this.$=[];break;case 5:i[o]!="nl"&&(i[o-1].push(i[o]),this.$=i[o-1]);break;case 6:case 7:this.$=i[o];break;case 8:this.$="nl";break;case 12:this.$=i[o];break;case 13:const ut=i[o-1];ut.description=m.trimColon(i[o]),this.$=ut;break;case 14:this.$={stmt:"relation",state1:i[o-2],state2:i[o]};break;case 15:const dt=m.trimColon(i[o]);this.$={stmt:"relation",state1:i[o-3],state2:i[o-1],description:dt};break;case 19:this.$={stmt:"state",id:i[o-3],type:"default",description:"",doc:i[o-1]};break;case 20:var M=i[o],z=i[o-2].trim();if(i[o].match(":")){var q=i[o].split(":");M=q[0],z=[z,q[1]]}this.$={stmt:"state",id:M,type:"default",description:z};break;case 21:this.$={stmt:"state",id:i[o-3],type:"default",description:i[o-5],doc:i[o-1]};break;case 22:this.$={stmt:"state",id:i[o],type:"fork"};break;case 23:this.$={stmt:"state",id:i[o],type:"join"};break;case 24:this.$={stmt:"state",id:i[o],type:"choice"};break;case 25:this.$={stmt:"state",id:m.getDividerId(),type:"divider"};break;case 26:this.$={stmt:"state",id:i[o-1].trim(),note:{position:i[o-2].trim(),text:i[o].trim()}};break;case 29:this.$=i[o].trim(),m.setAccTitle(this.$);break;case 30:case 31:this.$=i[o].trim(),m.setAccDescription(this.$);break;case 32:this.$={stmt:"click",id:i[o-3],url:i[o-2],tooltip:i[o-1]};break;case 33:this.$={stmt:"click",id:i[o-3],url:i[o-1],tooltip:""};break;case 34:case 35:this.$={stmt:"classDef",id:i[o-1].trim(),classes:i[o].trim()};break;case 36:this.$={stmt:"style",id:i[o-1].trim(),styleClass:i[o].trim()};break;case 37:this.$={stmt:"applyClass",id:i[o-1].trim(),styleClass:i[o].trim()};break;case 38:m.setDirection("TB"),this.$={stmt:"dir",value:"TB"};break;case 39:m.setDirection("BT"),this.$={stmt:"dir",value:"BT"};break;case 40:m.setDirection("RL"),this.$={stmt:"dir",value:"RL"};break;case 41:m.setDirection("LR"),this.$={stmt:"dir",value:"LR"};break;case 44:case 45:this.$={stmt:"state",id:i[o].trim(),type:"default",description:""};break;case 46:this.$={stmt:"state",id:i[o-2].trim(),classes:[i[o].trim()],type:"default",description:""};break;case 47:this.$={stmt:"state",id:i[o-2].trim(),classes:[i[o].trim()],type:"default",description:""}}},"anonymous"),"anonymous"),table:[{3:1,4:e,5:r,6:s},{1:[3]},{3:5,4:e,5:r,6:s},{3:6,4:e,5:r,6:s},t([1,4,5,16,17,19,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],h,{7:7}),{1:[2,1]},{1:[2,2]},{1:[2,3],4:c,5:y,8:8,9:10,10:12,11:13,12:14,13:15,16:T,17:n,19:g,22:C,24:A,25:x,26:$,27:d,28:D,29:N,32:25,33:w,35:Y,37:v,38:B,41:st,45:it,48:rt,51:at,52:nt,53:ot,54:lt,57:H},t(S,[2,5]),{9:39,10:12,11:13,12:14,13:15,16:T,17:n,19:g,22:C,24:A,25:x,26:$,27:d,28:D,29:N,32:25,33:w,35:Y,37:v,38:B,41:st,45:it,48:rt,51:at,52:nt,53:ot,54:lt,57:H},t(S,[2,7]),t(S,[2,8]),t(S,[2,9]),t(S,[2,10]),t(S,[2,11]),t(S,[2,12],{14:[1,40],15:[1,41]}),t(S,[2,16]),{18:[1,42]},t(S,[2,18],{20:[1,43]}),{23:[1,44]},t(S,[2,22]),t(S,[2,23]),t(S,[2,24]),t(S,[2,25]),{30:45,31:[1,46],59:[1,47],60:[1,48]},t(S,[2,28]),{34:[1,49]},{36:[1,50]},t(S,[2,31]),{13:51,24:A,57:H},{42:[1,52],44:[1,53]},{46:[1,54]},{49:[1,55]},t(ct,[2,44],{58:[1,56]}),t(ct,[2,45],{58:[1,57]}),t(S,[2,38]),t(S,[2,39]),t(S,[2,40]),t(S,[2,41]),t(S,[2,6]),t(S,[2,13]),{13:58,24:A,57:H},t(S,[2,17]),t(It,h,{7:59}),{24:[1,60]},{24:[1,61]},{23:[1,62]},{24:[2,48]},{24:[2,49]},t(S,[2,29]),t(S,[2,30]),{39:[1,63],40:[1,64]},{43:[1,65]},{43:[1,66]},{47:[1,67]},{50:[1,68]},{24:[1,69]},{24:[1,70]},t(S,[2,14],{14:[1,71]}),{4:c,5:y,8:8,9:10,10:12,11:13,12:14,13:15,16:T,17:n,19:g,21:[1,72],22:C,24:A,25:x,26:$,27:d,28:D,29:N,32:25,33:w,35:Y,37:v,38:B,41:st,45:it,48:rt,51:at,52:nt,53:ot,54:lt,57:H},t(S,[2,20],{20:[1,73]}),{31:[1,74]},{24:[1,75]},{39:[1,76]},{39:[1,77]},t(S,[2,34]),t(S,[2,35]),t(S,[2,36]),t(S,[2,37]),t(ct,[2,46]),t(ct,[2,47]),t(S,[2,15]),t(S,[2,19]),t(It,h,{7:78}),t(S,[2,26]),t(S,[2,27]),{5:[1,79]},{5:[1,80]},{4:c,5:y,8:8,9:10,10:12,11:13,12:14,13:15,16:T,17:n,19:g,21:[1,81],22:C,24:A,25:x,26:$,27:d,28:D,29:N,32:25,33:w,35:Y,37:v,38:B,41:st,45:it,48:rt,51:at,52:nt,53:ot,54:lt,57:H},t(S,[2,32]),t(S,[2,33]),t(S,[2,21])],defaultActions:{5:[2,1],6:[2,2],47:[2,48],48:[2,49]},parseError:u(_(function(f,l){if(l.recoverable)this.trace(f);else{var p=new Error(f);throw p.hash=l,p}},"parseError"),"parseError"),parse:u(_(function(f){var l=this,p=[0],m=[],E=[null],i=[],V=this.table,o="",M=0,z=0,q=0,ut=2,dt=1,Zt=i.slice.call(arguments,1),k=Object.create(this.lexer),W={yy:{}};for(var mt in this.yy)Object.prototype.hasOwnProperty.call(this.yy,mt)&&(W.yy[mt]=this.yy[mt]);k.setInput(f,W.yy),W.yy.lexer=k,W.yy.parser=this,typeof k.yylloc>"u"&&(k.yylloc={});var Et=k.yylloc;i.push(Et);var te=k.options&&k.options.ranges;typeof W.yy.parseError=="function"?this.parseError=W.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function ee(R){p.length=p.length-2*R,E.length=E.length-R,i.length=i.length-R}_(ee,"popStack"),u(ee,"popStack");function wt(){var R=m.pop()||k.lex()||dt;return typeof R!="number"&&(R instanceof Array&&(m=R,R=m.pop()),R=l.symbols_[R]||R),R}_(wt,"lex"),u(wt,"lex");for(var L,_t,U,O,bt,K={},ft,F,Nt,pt;;){if(U=p[p.length-1],this.defaultActions[U]?O=this.defaultActions[U]:((L===null||typeof L>"u")&&(L=wt()),O=V[U]&&V[U][L]),typeof O>"u"||!O.length||!O[0]){var Dt="";pt=[];for(ft in V[U])this.terminals_[ft]&&ft>ut&&pt.push("'"+this.terminals_[ft]+"'");k.showPosition?Dt="Parse error on line "+(M+1)+`:
`+k.showPosition()+`
Expecting `+pt.join(", ")+", got '"+(this.terminals_[L]||L)+"'":Dt="Parse error on line "+(M+1)+": Unexpected "+(L==dt?"end of input":"'"+(this.terminals_[L]||L)+"'"),this.parseError(Dt,{text:k.match,token:this.terminals_[L]||L,line:k.yylineno,loc:Et,expected:pt})}if(O[0]instanceof Array&&O.length>1)throw new Error("Parse Error: multiple actions possible at state: "+U+", token: "+L);switch(O[0]){case 1:p.push(L),E.push(k.yytext),i.push(k.yylloc),p.push(O[1]),L=null,_t?(L=_t,_t=null):(z=k.yyleng,o=k.yytext,M=k.yylineno,Et=k.yylloc,q>0&&q--);break;case 2:if(F=this.productions_[O[1]][1],K.$=E[E.length-F],K._$={first_line:i[i.length-(F||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(F||1)].first_column,last_column:i[i.length-1].last_column},te&&(K._$.range=[i[i.length-(F||1)].range[0],i[i.length-1].range[1]]),bt=this.performAction.apply(K,[o,z,M,W.yy,O[1],E,i].concat(Zt)),typeof bt<"u")return bt;F&&(p=p.slice(0,-1*F*2),E=E.slice(0,-1*F),i=i.slice(0,-1*F)),p.push(this.productions_[O[1]][0]),E.push(K.$),i.push(K._$),Nt=V[p[p.length-2]][p[p.length-1]],p.push(Nt);break;case 3:return!0}}return!0},"parse"),"parse")};Tt.lexer=(function(){return{EOF:1,parseError:u(_(function(f,l){if(this.yy.parser)this.yy.parser.parseError(f,l);else throw new Error(f)},"parseError"),"parseError"),setInput:u(function(a,f){return this.yy=f||this.yy||{},this._input=a,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:u(function(){var a=this._input[0];return this.yytext+=a,this.yyleng++,this.offset++,this.match+=a,this.matched+=a,a.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),a},"input"),unput:u(function(a){var f=a.length,l=a.split(/(?:\r\n?|\n)/g);this._input=a+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-f),this.offset-=f;var p=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),l.length-1&&(this.yylineno-=l.length-1);var m=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:l?(l.length===p.length?this.yylloc.first_column:0)+p[p.length-l.length].length-l[0].length:this.yylloc.first_column-f},this.options.ranges&&(this.yylloc.range=[m[0],m[0]+this.yyleng-f]),this.yyleng=this.yytext.length,this},"unput"),more:u(function(){return this._more=!0,this},"more"),reject:u(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:u(function(a){this.unput(this.match.slice(a))},"less"),pastInput:u(function(){var a=this.matched.substr(0,this.matched.length-this.match.length);return(a.length>20?"...":"")+a.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:u(function(){var a=this.match;return a.length<20&&(a+=this._input.substr(0,20-a.length)),(a.substr(0,20)+(a.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:u(function(){var a=this.pastInput(),f=new Array(a.length+1).join("-");return a+this.upcomingInput()+`
`+f+"^"},"showPosition"),test_match:u(function(a,f){var l,p,m;if(this.options.backtrack_lexer&&(m={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(m.yylloc.range=this.yylloc.range.slice(0))),p=a[0].match(/(?:\r\n?|\n).*/g),p&&(this.yylineno+=p.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:p?p[p.length-1].length-p[p.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+a[0].length},this.yytext+=a[0],this.match+=a[0],this.matches=a,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(a[0].length),this.matched+=a[0],l=this.performAction.call(this,this.yy,this,f,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),l)return l;if(this._backtrack){for(var E in m)this[E]=m[E];return!1}return!1},"test_match"),next:u(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var a,f,l,p;this._more||(this.yytext="",this.match="");for(var m=this._currentRules(),E=0;E<m.length;E++)if(l=this._input.match(this.rules[m[E]]),l&&(!f||l[0].length>f[0].length)){if(f=l,p=E,this.options.backtrack_lexer){if(a=this.test_match(l,m[E]),a!==!1)return a;if(this._backtrack){f=!1;continue}else return!1}else if(!this.options.flex)break}return f?(a=this.test_match(f,m[p]),a!==!1?a:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:u(_(function(){var f=this.next();return f||this.lex()},"lex"),"lex"),begin:u(_(function(f){this.conditionStack.push(f)},"begin"),"begin"),popState:u(_(function(){return this.conditionStack.length-1>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),"popState"),_currentRules:u(_(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),"_currentRules"),topState:u(_(function(f){return f=this.conditionStack.length-1-Math.abs(f||0),f>=0?this.conditionStack[f]:"INITIAL"},"topState"),"topState"),pushState:u(_(function(f){this.begin(f)},"pushState"),"pushState"),stateStackSize:u(_(function(){return this.conditionStack.length},"stateStackSize"),"stateStackSize"),options:{"case-insensitive":!0},performAction:u(_(function(f,l,p,m){function E(){const i=l.yytext.indexOf("%%");if(i===0)return!1;if(i>0){const V=l.yytext.slice(0,i),o=l.yytext.slice(i);o&&f.lexer.unput(o),l.yytext=V}return!0}switch(_(E,"processId"),u(E,"processId"),p){case 0:return 38;case 1:return 40;case 2:return 39;case 3:return 44;case 4:return 51;case 5:return 52;case 6:return 53;case 7:return 54;case 8:return 5;case 9:break;case 10:break;case 11:break;case 12:break;case 13:return this.pushState("SCALE"),17;case 14:return 18;case 15:this.popState();break;case 16:return this.begin("acc_title"),33;case 17:return this.popState(),"acc_title_value";case 18:return this.begin("acc_descr"),35;case 19:return this.popState(),"acc_descr_value";case 20:this.begin("acc_descr_multiline");break;case 21:this.popState();break;case 22:return"acc_descr_multiline_value";case 23:return this.pushState("CLASSDEF"),41;case 24:return this.popState(),this.pushState("CLASSDEFID"),"DEFAULT_CLASSDEF_ID";case 25:return this.popState(),this.pushState("CLASSDEFID"),42;case 26:return this.popState(),43;case 27:return this.pushState("CLASS"),48;case 28:return this.popState(),this.pushState("CLASS_STYLE"),49;case 29:return this.popState(),50;case 30:return this.pushState("STYLE"),45;case 31:return this.popState(),this.pushState("STYLEDEF_STYLES"),46;case 32:return this.popState(),47;case 33:return this.pushState("SCALE"),17;case 34:return 18;case 35:this.popState();break;case 36:this.pushState("STATE");break;case 37:return this.popState(),l.yytext=l.yytext.slice(0,-8).trim(),25;case 38:return this.popState(),l.yytext=l.yytext.slice(0,-8).trim(),26;case 39:return this.popState(),l.yytext=l.yytext.slice(0,-10).trim(),27;case 40:return this.popState(),l.yytext=l.yytext.slice(0,-8).trim(),25;case 41:return this.popState(),l.yytext=l.yytext.slice(0,-8).trim(),26;case 42:return this.popState(),l.yytext=l.yytext.slice(0,-10).trim(),27;case 43:return 51;case 44:return 52;case 45:return 53;case 46:return 54;case 47:this.pushState("STATE_STRING");break;case 48:return this.pushState("STATE_ID"),"AS";case 49:return E()?(this.popState(),"ID"):void 0;case 50:this.popState();break;case 51:return"STATE_DESCR";case 52:throw new Error('Error: State name must be a single word. Found: "'+l.yytext.trim()+'"');case 53:return 19;case 54:this.popState();break;case 55:return this.popState(),this.pushState("struct"),20;case 56:return this.popState(),21;case 57:break;case 58:return this.begin("NOTE"),29;case 59:return this.popState(),this.pushState("NOTE_ID"),59;case 60:return this.popState(),this.pushState("NOTE_ID"),60;case 61:this.popState(),this.pushState("FLOATING_NOTE");break;case 62:return this.popState(),this.pushState("FLOATING_NOTE_ID"),"AS";case 63:break;case 64:return"NOTE_TEXT";case 65:return E()?(this.popState(),"ID"):void 0;case 66:return E()?(this.popState(),this.pushState("NOTE_TEXT"),24):void 0;case 67:return this.popState(),l.yytext=l.yytext.substr(2).trim(),31;case 68:return this.popState(),l.yytext=l.yytext.slice(0,-8).trim(),31;case 69:return 6;case 70:return 6;case 71:return 16;case 72:return 57;case 73:return E()?24:void 0;case 74:return l.yytext=l.yytext.trim(),14;case 75:return 15;case 76:return 28;case 77:return 58;case 78:return 5;case 79:return"INVALID"}},"anonymous"),"anonymous"),rules:[/^(?:click\b)/i,/^(?:href\b)/i,/^(?:"[^"]*")/i,/^(?:default\b)/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:[\n]+)/i,/^(?:[\s]+)/i,/^(?:((?!\n)\s)+)/i,/^(?:#[^\n]*)/i,/^(?:%%(?!\{)[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:classDef\s+)/i,/^(?:DEFAULT\s+)/i,/^(?:\w+\s+)/i,/^(?:[^\n]*)/i,/^(?:class\s+)/i,/^(?:(\w+)+((,\s*\w+)*))/i,/^(?:[^\n]*)/i,/^(?:style\s+)/i,/^(?:[\w,]+\s+)/i,/^(?:[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:state\s+)/i,/^(?:.*<<fork>>)/i,/^(?:.*<<join>>)/i,/^(?:.*<<choice>>)/i,/^(?:.*\[\[fork\]\])/i,/^(?:.*\[\[join\]\])/i,/^(?:.*\[\[choice\]\])/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:["])/i,/^(?:\s*as\s+)/i,/^(?:[^\n\{]*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:\w+\s+\w+.*?\{)/i,/^(?:[^\n\s\{]+)/i,/^(?:\n)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:[\n])/i,/^(?:note\s+)/i,/^(?:left of\b)/i,/^(?:right of\b)/i,/^(?:")/i,/^(?:\s*as\s*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:[^\n]*)/i,/^(?:\s*[^:\n\s\-]+)/i,/^(?:\s*:[^:\n;]+)/i,/^(?:[\s\S]*?\n\s*end note\b)/i,/^(?:stateDiagram\s+)/i,/^(?:stateDiagram-v2\s+)/i,/^(?:hide empty description\b)/i,/^(?:\[\*\])/i,/^(?:[^:\n\s\-\{]+)/i,/^(?:\s*:(?:[^:\n;]|:[^:\n;])+)/i,/^(?:-->)/i,/^(?:--)/i,/^(?::::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{LINE:{rules:[10,11,12],inclusive:!1},struct:{rules:[10,11,12,23,27,30,36,43,44,45,46,56,57,58,72,73,74,75,76,77],inclusive:!1},FLOATING_NOTE_ID:{rules:[65],inclusive:!1},FLOATING_NOTE:{rules:[62,63,64],inclusive:!1},NOTE_TEXT:{rules:[67,68],inclusive:!1},NOTE_ID:{rules:[66],inclusive:!1},NOTE:{rules:[59,60,61],inclusive:!1},STYLEDEF_STYLEOPTS:{rules:[],inclusive:!1},STYLEDEF_STYLES:{rules:[32],inclusive:!1},STYLE_IDS:{rules:[],inclusive:!1},STYLE:{rules:[31],inclusive:!1},CLASS_STYLE:{rules:[29],inclusive:!1},CLASS:{rules:[28],inclusive:!1},CLASSDEFID:{rules:[26],inclusive:!1},CLASSDEF:{rules:[24,25],inclusive:!1},acc_descr_multiline:{rules:[21,22],inclusive:!1},acc_descr:{rules:[19],inclusive:!1},acc_title:{rules:[17],inclusive:!1},SCALE:{rules:[14,15,34,35],inclusive:!1},ALIAS:{rules:[],inclusive:!1},STATE_ID:{rules:[49],inclusive:!1},STATE_STRING:{rules:[50,51],inclusive:!1},FORK_STATE:{rules:[],inclusive:!1},STATE:{rules:[10,11,12,37,38,39,40,41,42,47,48,52,53,54,55],inclusive:!1},ID:{rules:[10,11,12],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,11,12,13,16,18,20,23,27,30,33,36,55,58,69,70,71,72,73,74,75,77,78,79],inclusive:!0}}}})();function ht(){this.yy={}}return _(ht,"Parser"),u(ht,"Parser"),ht.prototype=Tt,Tt.Parser=ht,new ht})();At.parser=At;var Ue=At,ge="TB",Gt="TB",Ot="dir",J="state",X="root",xt="relation",Te="classDef",me="style",Ee="applyClass",tt="default",Vt="divider",Mt="fill:none",Wt="fill: #333",Ut="c",jt="markdown",Ht="normal",vt="rect",Ct="rectWithTitle",_e="stateStart",be="stateEnd",Rt="divider",$t="roundedWithTitle",De="note",ke="noteGroup",et="statediagram",ve=`${et}-state`,zt="transition",Ce="note",Ae=`${zt} note-edge`,xe=`${et}-${Ce}`,Le=`${et}-cluster`,Ie=`${et}-cluster-alt`,Kt="parent",Xt="note",we="state",Lt="----",Ne=`${Lt}${Xt}`,Pt=`${Lt}${Kt}`,Jt=u((t,e=Gt)=>{if(!t.doc)return e;let r=e;for(const s of t.doc)s.stmt==="dir"&&(r=s.value);return r},"getDir"),je={getClasses:u(function(t,e){return e.db.getClasses()},"getClasses"),draw:u(async function(t,e,r,s){b.info("REF0:"),b.info("Drawing state diagram (v2)",e);const{securityLevel:h,state:c,layout:y}=P();s.db.extract(s.db.getRootDocV2());const T=s.db.getData(),n=pe(e,h);T.type=s.type,T.layoutAlgorithm=y,T.nodeSpacing=c?.nodeSpacing||50,T.rankSpacing=c?.rankSpacing||50,P().look==="neo"?T.markers=["barbNeo"]:T.markers=["barb"],T.diagramId=e,await ye(T,n);const g=8;try{(typeof s.db.getLinks=="function"?s.db.getLinks():new Map).forEach((C,A)=>{const x=typeof A=="string"?A:typeof A?.id=="string"?A.id:"",$=T.nodes.find(v=>v.id===x);if(!x){b.warn("⚠️ Invalid or missing stateId from key:",JSON.stringify(A));return}const d=n.node()?.querySelectorAll("g.node, g.rough-node");let D;if(d?.forEach(v=>{const B=v.textContent?.trim();(v.id===$?.domId||B===x)&&(D=v)}),!D){b.warn("⚠️ Could not find node matching text:",x);return}const N=D.parentNode;if(!N){b.warn("⚠️ Node has no parent, cannot wrap:",x);return}const w=document.createElementNS("http://www.w3.org/2000/svg","a"),Y=C.url.replace(/^"+|"+$/g,"");if(w.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",Y),w.setAttribute("target","_blank"),C.tooltip){const v=C.tooltip.replace(/^"+|"+$/g,"");w.setAttribute("title",v),D.setAttribute("title",v)}N.replaceChild(w,D),w.appendChild(D),b.info("🔗 Wrapped node in <a> tag for:",x,C.url)})}catch(C){b.error("❌ Error injecting clickable links:",C)}ue.insertTitle(n,"statediagramTitleText",c?.titleTopMargin??25,s.db.getDiagramTitle()),Se(n,g,et,c?.useMaxWidth??!0)},"draw"),getDir:Jt},yt=new Map,G=0;function gt(t="",e=0,r="",s=Lt){return`${we}-${t}${r!==null&&r.length>0?`${s}${r}`:""}-${e}`}_(gt,"stateDomId");u(gt,"stateDomId");var Oe=u((t,e,r,s,h,c,y,T)=>{b.trace("items",e),e.forEach(n=>{switch(n.stmt){case J:Z(t,n,r,s,h,c,y,T);break;case tt:Z(t,n,r,s,h,c,y,T);break;case xt:{Z(t,n.state1,r,s,h,c,y,T),Z(t,n.state2,r,s,h,c,y,T);const g=y==="neo",C={id:"edge"+G,start:n.state1.id,end:n.state2.id,arrowhead:"normal",arrowTypeEnd:g?"arrow_barb_neo":"arrow_barb",style:Mt,labelStyle:"",label:j.sanitizeText(n.description??"",P()),arrowheadStyle:Wt,labelpos:Ut,labelType:jt,thickness:Ht,classes:zt,look:y};h.push(C),G++}}})},"setupDoc"),Bt=u((t,e=Gt)=>{let r=e;if(t.doc)for(const s of t.doc)s.stmt==="dir"&&(r=s.value);return r},"getDir");function Q(t,e,r){if(!e.id||e.id==="</join></fork>"||e.id==="</choice>")return;e.cssClasses&&(Array.isArray(e.cssCompiledStyles)||(e.cssCompiledStyles=[]),e.cssClasses.split(" ").forEach(h=>{const c=r.get(h);c&&(e.cssCompiledStyles=[...e.cssCompiledStyles??[],...c.styles])}));const s=t.find(h=>h.id===e.id);s?Object.assign(s,e):t.push(e)}_(Q,"insertOrUpdateNode");u(Q,"insertOrUpdateNode");function qt(t){return t?.classes?.join(" ")??""}_(qt,"getClassesFromDbInfo");u(qt,"getClassesFromDbInfo");function Qt(t){return t?.styles??[]}_(Qt,"getStylesFromDbInfo");u(Qt,"getStylesFromDbInfo");var Z=u((t,e,r,s,h,c,y,T)=>{const n=e.id,g=r.get(n),C=qt(g),A=Qt(g),x=P();if(b.info("dataFetcher parsedItem",e,g,A),n!=="root"){let $=vt;e.start===!0?$=_e:e.start===!1&&($=be),e.type!==tt&&($=e.type),yt.get(n)||yt.set(n,{id:n,shape:$,description:j.sanitizeText(n,x),cssClasses:`${C} ${ve}`,cssStyles:A});const d=yt.get(n);e.description&&(Array.isArray(d.description)?(d.shape=Ct,d.description.push(e.description)):d.description?.length&&d.description.length>0?(d.shape=Ct,d.description===n?d.description=[e.description]:d.description=[d.description,e.description]):(d.shape=vt,d.description=e.description),d.description=j.sanitizeTextOrArray(d.description,x)),d.description?.length===1&&d.shape===Ct&&(d.type==="group"?d.shape=$t:d.shape=vt),!d.type&&e.doc&&(b.info("Setting cluster for XCX",n,Bt(e)),d.type="group",d.isGroup=!0,d.dir=Bt(e),d.shape=e.type===Vt?Rt:$t,d.cssClasses=`${d.cssClasses} ${Le} ${c?Ie:""}`);const D={labelStyle:"",shape:d.shape,label:d.description,cssClasses:d.cssClasses,cssCompiledStyles:[],cssStyles:d.cssStyles,id:n,dir:d.dir,domId:gt(n,G),type:d.type,isGroup:d.type==="group",padding:8,rx:10,ry:10,look:y,labelType:"markdown"};if(D.shape===Rt&&(D.label=""),t&&t.id!=="root"&&(b.trace("Setting node ",n," to be child of its parent ",t.id),D.parentId=t.id),D.centerLabel=!0,e.note){const N={labelStyle:"",shape:De,label:e.note.text,labelType:"markdown",cssClasses:xe,cssStyles:[],cssCompiledStyles:[],id:n+Ne+"-"+G,domId:gt(n,G,Xt),type:d.type,isGroup:d.type==="group",padding:x.flowchart?.padding,look:y,position:e.note.position},w=n+Pt,Y={labelStyle:"",shape:ke,label:e.note.text,cssClasses:d.cssClasses,cssStyles:[],id:n+Pt,domId:gt(n,G,Kt),type:"group",isGroup:!0,padding:16,look:y,position:e.note.position};G++,Y.id=w,N.parentId=w,Q(s,Y,T),Q(s,N,T),Q(s,D,T);let v=n,B=N.id;e.note.position==="left of"&&(v=N.id,B=n),h.push({id:v+"-"+B,start:v,end:B,arrowhead:"none",arrowTypeEnd:"",style:Mt,labelStyle:"",classes:Ae,arrowheadStyle:Wt,labelpos:Ut,labelType:jt,thickness:Ht,look:y})}else Q(s,D,T)}e.doc&&(b.trace("Adding nodes children "),Oe(e,e.doc,r,s,h,!c,y,T))},"dataFetcher"),Re=u(()=>{yt.clear(),G=0},"reset"),I={START_NODE:"[*]",START_TYPE:"start",END_NODE:"[*]",END_TYPE:"end",COLOR_KEYWORD:"color",FILL_KEYWORD:"fill",BG_FILL:"bgFill",STYLECLASS_SEP:","},Yt=u(()=>new Map,"newClassesList"),Ft=u(()=>({relations:[],states:new Map,documents:{}}),"newDoc"),St=u(t=>JSON.parse(JSON.stringify(t)),"clone"),He=class{static{_(this,"StateDB")}constructor(t){this.version=t,this.nodes=[],this.edges=[],this.rootDoc=[],this.classes=Yt(),this.documents={root:Ft()},this.currentDocument=this.documents.root,this.startEndCount=0,this.dividerCnt=0,this.links=new Map,this.funs=[],this.getAccTitle=he,this.setAccTitle=ne,this.getAccDescription=le,this.setAccDescription=re,this.setDiagramTitle=ae,this.getDiagramTitle=ce,this.clear(),this.setRootDoc=this.setRootDoc.bind(this),this.getDividerId=this.getDividerId.bind(this),this.setDirection=this.setDirection.bind(this),this.trimColon=this.trimColon.bind(this),this.bindFunctions=this.bindFunctions.bind(this)}static{u(this,"StateDB")}static{this.relationType={AGGREGATION:0,EXTENSION:1,COMPOSITION:2,DEPENDENCY:3}}extract(t){this.clear(!0);for(const s of Array.isArray(t)?t:t.doc)switch(s.stmt){case J:this.addState(s.id.trim(),s.type,s.doc,s.description,s.note);break;case xt:this.addRelation(s.state1,s.state2,s.description);break;case Te:this.addStyleClass(s.id.trim(),s.classes);break;case me:this.handleStyleDef(s);break;case Ee:this.setCssClass(s.id.trim(),s.styleClass);break;case"click":this.addLink(s.id,s.url,s.tooltip)}const e=this.getStates(),r=P();Re(),Z(void 0,this.getRootDocV2(),e,this.nodes,this.edges,!0,r.look,this.classes);for(const s of this.nodes)if(Array.isArray(s.label)){if(s.description=s.label.slice(1),s.isGroup&&s.description.length>0)throw new Error(`Group nodes can only have label. Remove the additional description for node [${s.id}]`);s.label=s.label[0]}}handleStyleDef(t){const e=t.id.trim().split(","),r=t.styleClass.split(",");for(const s of e){let h=this.getState(s);if(!h){const c=s.trim();this.addState(c),h=this.getState(c)}h&&(h.styles=r.map(c=>c.replace(/;/g,"")?.trim()))}}setRootDoc(t){b.info("Setting root doc",t),this.rootDoc=t,this.version===1?this.extract(t):this.extract(this.getRootDocV2())}docTranslator(t,e,r){if(e.stmt===xt){this.docTranslator(t,e.state1,!0),this.docTranslator(t,e.state2,!1);return}if(e.stmt===J&&(e.id===I.START_NODE?(e.id=t.id+(r?"_start":"_end"),e.start=r):e.id=e.id.trim()),e.stmt!==X&&e.stmt!==J||!e.doc)return;const s=[];let h=[];for(const c of e.doc)if(c.type===Vt){const y=St(c);y.doc=St(h),s.push(y),h=[]}else h.push(c);if(s.length>0&&h.length>0){const c={stmt:J,id:de(),type:"divider",doc:St(h)};s.push(St(c)),e.doc=s}e.doc.forEach(c=>this.docTranslator(e,c,!0))}getRootDocV2(){return this.docTranslator({id:X,stmt:X},{id:X,stmt:X,doc:this.rootDoc},!0),{id:X,doc:this.rootDoc}}addState(t,e=tt,r=void 0,s=void 0,h=void 0,c=void 0,y=void 0,T=void 0){const n=t?.trim();if(!this.currentDocument.states.has(n))b.info("Adding state ",n,s),this.currentDocument.states.set(n,{stmt:J,id:n,descriptions:[],type:e,doc:r,note:h,classes:[],styles:[],textStyles:[]});else{const g=this.currentDocument.states.get(n);if(!g)throw new Error(`State not found: ${n}`);g.doc||(g.doc=r),g.type||(g.type=e)}if(s&&(b.info("Setting state description",n,s),(Array.isArray(s)?s:[s]).forEach(g=>this.addDescription(n,g.trim()))),h){const g=this.currentDocument.states.get(n);if(!g)throw new Error(`State not found: ${n}`);g.note=h,g.note.text=j.sanitizeText(g.note.text,P())}c&&(b.info("Setting state classes",n,c),(Array.isArray(c)?c:[c]).forEach(g=>this.setCssClass(n,g.trim()))),y&&(b.info("Setting state styles",n,y),(Array.isArray(y)?y:[y]).forEach(g=>this.setStyle(n,g.trim()))),T&&(b.info("Setting state styles",n,y),(Array.isArray(T)?T:[T]).forEach(g=>this.setTextStyle(n,g.trim())))}clear(t){this.nodes=[],this.edges=[],this.funs=[this.setupToolTips.bind(this)],this.documents={root:Ft()},this.currentDocument=this.documents.root,this.startEndCount=0,this.classes=Yt(),t||(this.links=new Map,oe())}getState(t){return this.currentDocument.states.get(t)}getStates(){return this.currentDocument.states}logDocuments(){b.info("Documents = ",this.documents)}getRelations(){return this.currentDocument.relations}addLink(t,e,r){this.links.set(t,{url:e,tooltip:r}),b.warn("Adding link",t,e,r)}getLinks(){return this.links}startIdIfNeeded(t=""){return t===I.START_NODE?(this.startEndCount++,`${I.START_TYPE}${this.startEndCount}`):t}startTypeIfNeeded(t="",e=tt){return t===I.START_NODE?I.START_TYPE:e}endIdIfNeeded(t=""){return t===I.END_NODE?(this.startEndCount++,`${I.END_TYPE}${this.startEndCount}`):t}endTypeIfNeeded(t="",e=tt){return t===I.END_NODE?I.END_TYPE:e}addRelationObjs(t,e,r=""){const s=this.startIdIfNeeded(t.id.trim()),h=this.startTypeIfNeeded(t.id.trim(),t.type),c=this.startIdIfNeeded(e.id.trim()),y=this.startTypeIfNeeded(e.id.trim(),e.type);this.addState(s,h,t.doc,t.description,t.note,t.classes,t.styles,t.textStyles),this.addState(c,y,e.doc,e.description,e.note,e.classes,e.styles,e.textStyles),this.currentDocument.relations.push({id1:s,id2:c,relationTitle:j.sanitizeText(r,P())})}addRelation(t,e,r){if(typeof t=="object"&&typeof e=="object")this.addRelationObjs(t,e,r);else if(typeof t=="string"&&typeof e=="string"){const s=this.startIdIfNeeded(t.trim()),h=this.startTypeIfNeeded(t),c=this.endIdIfNeeded(e.trim()),y=this.endTypeIfNeeded(e);this.addState(s,h),this.addState(c,y),this.currentDocument.relations.push({id1:s,id2:c,relationTitle:r?j.sanitizeText(r,P()):void 0})}}addDescription(t,e){const r=this.currentDocument.states.get(t),s=e.startsWith(":")?e.replace(":","").trim():e;r?.descriptions?.push(j.sanitizeText(s,P()))}cleanupLabel(t){return t.startsWith(":")?t.slice(2).trim():t.trim()}getDividerId(){return this.dividerCnt++,`divider-id-${this.dividerCnt}`}addStyleClass(t,e=""){this.classes.has(t)||this.classes.set(t,{id:t,styles:[],textStyles:[]});const r=this.classes.get(t);e&&r&&e.split(I.STYLECLASS_SEP).forEach(s=>{const h=s.replace(/([^;]*);/,"$1").trim();if(RegExp(I.COLOR_KEYWORD).exec(s)){const c=h.replace(I.FILL_KEYWORD,I.BG_FILL).replace(I.COLOR_KEYWORD,I.FILL_KEYWORD);r.textStyles.push(c)}r.styles.push(h)})}getClasses(){return this.classes}setupToolTips(t){const e=fe();kt(t).select("svg").selectAll("g.node, g.rough-node").on("mouseover",r=>{const s=kt(r.currentTarget),h=s.attr("title");if(h===null)return;const c=r.currentTarget?.getBoundingClientRect();e.transition().duration(200).style("opacity",".9"),e.style("left",window.scrollX+c.left+(c.right-c.left)/2+"px").style("top",window.scrollY+c.bottom+"px"),e.html(ie.sanitize(h)),s.classed("hover",!0)}).on("mouseout",r=>{e.transition().duration(500).style("opacity",0),kt(r.currentTarget).classed("hover",!1)})}setCssClass(t,e){t.split(",").forEach(r=>{let s=this.getState(r);if(!s){const h=r.trim();this.addState(h),s=this.getState(h)}s?.classes?.push(e)})}setStyle(t,e){this.getState(t)?.styles?.push(e)}setTextStyle(t,e){this.getState(t)?.textStyles?.push(e)}bindFunctions(t){this.funs.forEach(e=>{e(t)})}getDirectionStatement(){return this.rootDoc.find(t=>t.stmt===Ot)}getDirection(){return this.getDirectionStatement()?.value??ge}setDirection(t){const e=this.getDirectionStatement();e?e.value=t:this.rootDoc.unshift({stmt:Ot,value:t})}trimColon(t){return t.startsWith(":")?t.slice(1).trim():t.trim()}getData(){const t=P();return{nodes:this.nodes,edges:this.edges,other:{},config:t,direction:Jt(this.getRootDocV2())}}getConfig(){return P().state}},ze=u(t=>`
defs [id$="-barbEnd"] {
    fill: ${t.transitionColor};
    stroke: ${t.transitionColor};
  }
g.stateGroup text {
  fill: ${t.nodeBorder};
  stroke: none;
  font-size: 10px;
}
g.stateGroup text {
  fill: ${t.textColor};
  stroke: none;
  font-size: 10px;

}
g.stateGroup .state-title {
  font-weight: bolder;
  fill: ${t.stateLabelColor};
}

g.stateGroup rect {
  fill: ${t.mainBkg};
  stroke: ${t.nodeBorder};
}

g.stateGroup line {
  stroke: ${t.lineColor};
  stroke-width: ${t.strokeWidth||1};
}

.transition {
  stroke: ${t.transitionColor};
  stroke-width: ${t.strokeWidth||1};
  fill: none;
}

.stateGroup .composit {
  fill: ${t.background};
  border-bottom: 1px
}

.stateGroup .alt-composit {
  fill: #e0e0e0;
  border-bottom: 1px
}

.state-note {
  stroke: ${t.noteBorderColor};
  fill: ${t.noteBkgColor};

  text {
    fill: ${t.noteTextColor};
    stroke: none;
    font-size: 10px;
  }
}

.stateLabel .box {
  stroke: none;
  stroke-width: 0;
  fill: ${t.mainBkg};
  opacity: 0.5;
}

.edgeLabel .label rect {
  fill: ${t.labelBackgroundColor};
  opacity: 0.5;
}
.edgeLabel {
  background-color: ${t.edgeLabelBackground};
  p {
    background-color: ${t.edgeLabelBackground};
  }
  rect {
    opacity: 0.5;
    background-color: ${t.edgeLabelBackground};
    fill: ${t.edgeLabelBackground};
  }
  text-align: center;
}
.edgeLabel .label text {
  fill: ${t.transitionLabelColor||t.tertiaryTextColor};
}
.label div .edgeLabel {
  color: ${t.transitionLabelColor||t.tertiaryTextColor};
}

.stateLabel text {
  fill: ${t.stateLabelColor};
  font-size: 10px;
  font-weight: bold;
}

.node circle.state-start {
  fill: ${t.specialStateColor};
  stroke: ${t.specialStateColor};
}

.node .fork-join {
  fill: ${t.specialStateColor};
  stroke: ${t.specialStateColor};
}

.node circle.state-end {
  fill: ${t.innerEndBackground};
  stroke: ${t.background};
  stroke-width: 1.5
}
.end-state-inner {
  fill: ${t.compositeBackground||t.background};
  // stroke: ${t.background};
  stroke-width: 1.5
}

.node rect {
  fill: ${t.stateBkg||t.mainBkg};
  stroke: ${t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth||1}px;
}
.node polygon {
  fill: ${t.mainBkg};
  stroke: ${t.stateBorder||t.nodeBorder};;
  stroke-width: ${t.strokeWidth||1}px;
}
[id$="-barbEnd"] {
  fill: ${t.lineColor};
}

.statediagram-cluster rect {
  fill: ${t.compositeTitleBackground};
  stroke: ${t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth||1}px;
}

.cluster-label, .nodeLabel {
  color: ${t.stateLabelColor};
  // line-height: 1;
}

.statediagram-cluster rect.outer {
  rx: 5px;
  ry: 5px;
}
.statediagram-state .divider {
  stroke: ${t.stateBorder||t.nodeBorder};
}

.statediagram-state .title-state {
  rx: 5px;
  ry: 5px;
}
.statediagram-cluster.statediagram-cluster .inner {
  fill: ${t.compositeBackground||t.background};
}
.statediagram-cluster.statediagram-cluster-alt .inner {
  fill: ${t.altBackground?t.altBackground:"#efefef"};
}

.statediagram-cluster .inner {
  rx:0;
  ry:0;
}

.statediagram-state rect.basic {
  rx: 5px;
  ry: 5px;
}
.statediagram-state rect.divider {
  stroke-dasharray: 10,10;
  fill: ${t.altBackground?t.altBackground:"#efefef"};
}

.note-edge {
  stroke-dasharray: 5;
}

.statediagram-note rect {
  fill: ${t.noteBkgColor};
  stroke: ${t.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}
.statediagram-note rect {
  fill: ${t.noteBkgColor};
  stroke: ${t.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}

.statediagram-note text {
  fill: ${t.noteTextColor};
}

.statediagram-note .nodeLabel {
  color: ${t.noteTextColor};
}
.statediagram .edgeLabel {
  color: red; // ${t.noteTextColor};
}

[id$="-dependencyStart"], [id$="-dependencyEnd"] {
  fill: ${t.lineColor};
  stroke: ${t.lineColor};
  stroke-width: ${t.strokeWidth||1};
}

.statediagramTitleText {
  text-anchor: middle;
  font-size: 18px;
  fill: ${t.textColor};
}

[data-look="neo"].statediagram-cluster rect {
  fill: ${t.mainBkg};
  stroke: ${t.useGradient?"url("+t.svgId+"-gradient)":t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth??1};
}
[data-look="neo"].statediagram-cluster rect.outer {
  rx: ${t.radius}px;
  ry: ${t.radius}px;
  filter: ${t.dropShadow?t.dropShadow.replace("url(#drop-shadow)",`url(${t.svgId}-drop-shadow)`):"none"}
}
`,"getStyles");export{ze as i,Ue as n,je as r,He as t};
