var Yo=Object.defineProperty;var h=(e,t)=>Yo(e,"name",{value:t,configurable:!0});import{a as Ko,i as Zo,n as Jo,o as $o,t as Vn}from"./model-DL5biheO.js";var hs=1e3,li=1001,us=1002,bt=1003,Qo=1004,jo=1005,Pt=1006,el=1007,Er=1008,Ii=1009,tl=1010,il=1011,Da=1012,nl=1013,Li=1014,Tr=1015,Ui=1016,Na=1017,Fa=1018,Oa=1020,rl=35902,sl=35899,al=1021,ol=1022,Pn=1023,In=1026,Ba=1027,ll=1028,za=1029,mr=1030,Va=1031,Ga=1033,cl=33776,hl=33777,ul=33778,fl=33779,dl=35840,pl=35841,ml=35842,gl=35843,vl=36196,_l=37492,Ml=37496,Sl=37488,yl=37489,xl=37490,El=37491,Tl=37808,bl=37809,Al=37810,wl=37811,Rl=37812,Cl=37813,Pl=37814,Il=37815,Ll=37816,Ul=37817,Dl=37818,Nl=37819,Fl=37820,Ol=37821,Bl=36492,zl=36494,Vl=36495,Gl=36283,Hl=36284,kl=36285,Wl=36286,gr=2300,fs=2301,Pr=2302,Fs=2303,Os=2400,Bs=2401,zs=2402,Xl=3200;var wt="srgb",ds="srgb-linear",vr="linear",_r="srgb",Ir=7680;var Ha=35044;var cn=2e3;function ql(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}h(ql,"arrayNeedsUint32");function Yl(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}h(Yl,"isTypedArray");function Mr(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}h(Mr,"createElementNS");function Kl(){const e=Mr("canvas");return e.style.display="block",e}h(Kl,"createCanvasElement");var Vs={},hn=null;function Sr(...e){const t="THREE."+e.shift();hn&&hn("log",t,...e)}h(Sr,"log");function ka(e){const t=e[0];if(typeof t=="string"&&t.startsWith("TSL:")){const i=e[1];i&&i.isStackTrace?e[0]+=" "+i.getLocation():e[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return e}h(ka,"enhanceLogMessage");function Ce(...e){e=ka(e);const t="THREE."+e.shift();if(hn)hn("warn",t,...e);else{const i=e[0];i&&i.isStackTrace}}h(Ce,"warn");function Re(...e){e=ka(e);const t="THREE."+e.shift();if(hn)hn("error",t,...e);else{const i=e[0];i&&i.isStackTrace}}h(Re,"error");function on(...e){const t=e.join(" ");t in Vs||(Vs[t]=!0,Ce(...e))}h(on,"warnOnce");function Zl(e,t,i){return new Promise(function(n,r){function s(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:r();break;case e.TIMEOUT_EXPIRED:setTimeout(s,i);break;default:n()}}h(s,"probe"),setTimeout(s,i)})}h(Zl,"probeAsync");var Jl={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},Di=class{static{h(this,"EventDispatcher")}addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const n=i[e];if(n!==void 0){const r=n.indexOf(t);r!==-1&&n.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const n=i.slice(0);for(let r=0,s=n.length;r<s;r++)n[r].call(this,e);e.target=null}}},St=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Lr=Math.PI/180,ps=180/Math.PI;function xi(){const e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(St[e&255]+St[e>>8&255]+St[e>>16&255]+St[e>>24&255]+"-"+St[t&255]+St[t>>8&255]+"-"+St[t>>16&15|64]+St[t>>24&255]+"-"+St[i&63|128]+St[i>>8&255]+"-"+St[i>>16&255]+St[i>>24&255]+St[n&255]+St[n>>8&255]+St[n>>16&255]+St[n>>24&255]).toLowerCase()}h(xi,"generateUUID");function ze(e,t,i){return Math.max(t,Math.min(i,e))}h(ze,"clamp");function $l(e,t){return(e%t+t)%t}h($l,"euclideanModulo");function Ur(e,t,i){return(1-i)*e+i*t}h(Ur,"lerp");function Qt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}h(Qt,"denormalize");function $e(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}h($e,"normalize");var Ue=class Wa{static{h(this,"Vector2")}static{Wa.prototype.isVector2=!0}constructor(t=0,i=0){this.x=t,this.y=i}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,i){return this.x=t,this.y=i,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const i=this.x,n=this.y,r=t.elements;return this.x=r[0]*i+r[3]*n+r[6],this.y=r[1]*i+r[4]*n+r[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,i){return this.x=ze(this.x,t.x,i.x),this.y=ze(this.y,t.y,i.y),this}clampScalar(t,i){return this.x=ze(this.x,t,i),this.y=ze(this.y,t,i),this}clampLength(t,i){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ze(n,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const i=Math.sqrt(this.lengthSq()*t.lengthSq());if(i===0)return Math.PI/2;const n=this.dot(t)/i;return Math.acos(ze(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const i=this.x-t.x,n=this.y-t.y;return i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this}lerpVectors(t,i,n){return this.x=t.x+(i.x-t.x)*n,this.y=t.y+(i.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this}rotateAround(t,i){const n=Math.cos(i),r=Math.sin(i),s=this.x-t.x,a=this.y-t.y;return this.x=s*n-a*r+t.x,this.y=s*r+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ni=class{static{h(this,"Quaternion")}constructor(e=0,t=0,i=0,n=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=n}static slerpFlat(e,t,i,n,r,s,a){let o=i[n+0],l=i[n+1],c=i[n+2],f=i[n+3],d=r[s+0],u=r[s+1],m=r[s+2],y=r[s+3];if(f!==y||o!==d||l!==u||c!==m){let S=o*d+l*u+c*m+f*y;S<0&&(d=-d,u=-u,m=-m,y=-y,S=-S);let g=1-a;if(S<.9995){const p=Math.acos(S),R=Math.sin(p);g=Math.sin(g*p)/R,a=Math.sin(a*p)/R,o=o*g+d*a,l=l*g+u*a,c=c*g+m*a,f=f*g+y*a}else{o=o*g+d*a,l=l*g+u*a,c=c*g+m*a,f=f*g+y*a;const p=1/Math.sqrt(o*o+l*l+c*c+f*f);o*=p,l*=p,c*=p,f*=p}}e[t]=o,e[t+1]=l,e[t+2]=c,e[t+3]=f}static multiplyQuaternionsFlat(e,t,i,n,r,s){const a=i[n],o=i[n+1],l=i[n+2],c=i[n+3],f=r[s],d=r[s+1],u=r[s+2],m=r[s+3];return e[t]=a*m+c*f+o*u-l*d,e[t+1]=o*m+c*d+l*f-a*u,e[t+2]=l*m+c*u+a*d-o*f,e[t+3]=c*m-a*f-o*d-l*u,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,n){return this._x=e,this._y=t,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,n=e._y,r=e._z,s=e._order,a=Math.cos,o=Math.sin,l=a(i/2),c=a(n/2),f=a(r/2),d=o(i/2),u=o(n/2),m=o(r/2);switch(s){case"XYZ":this._x=d*c*f+l*u*m,this._y=l*u*f-d*c*m,this._z=l*c*m+d*u*f,this._w=l*c*f-d*u*m;break;case"YXZ":this._x=d*c*f+l*u*m,this._y=l*u*f-d*c*m,this._z=l*c*m-d*u*f,this._w=l*c*f+d*u*m;break;case"ZXY":this._x=d*c*f-l*u*m,this._y=l*u*f+d*c*m,this._z=l*c*m+d*u*f,this._w=l*c*f-d*u*m;break;case"ZYX":this._x=d*c*f-l*u*m,this._y=l*u*f+d*c*m,this._z=l*c*m-d*u*f,this._w=l*c*f+d*u*m;break;case"YZX":this._x=d*c*f+l*u*m,this._y=l*u*f+d*c*m,this._z=l*c*m-d*u*f,this._w=l*c*f-d*u*m;break;case"XZY":this._x=d*c*f-l*u*m,this._y=l*u*f-d*c*m,this._z=l*c*m+d*u*f,this._w=l*c*f+d*u*m;break;default:Ce("Quaternion: .setFromEuler() encountered an unknown order: "+s)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,n=Math.sin(i);return this._x=e.x*n,this._y=e.y*n,this._z=e.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],n=t[4],r=t[8],s=t[1],a=t[5],o=t[9],l=t[2],c=t[6],f=t[10],d=i+a+f;if(d>0){const u=.5/Math.sqrt(d+1);this._w=.25/u,this._x=(c-o)*u,this._y=(r-l)*u,this._z=(s-n)*u}else if(i>a&&i>f){const u=2*Math.sqrt(1+i-a-f);this._w=(c-o)/u,this._x=.25*u,this._y=(n+s)/u,this._z=(r+l)/u}else if(a>f){const u=2*Math.sqrt(1+a-i-f);this._w=(r-l)/u,this._x=(n+s)/u,this._y=.25*u,this._z=(o+c)/u}else{const u=2*Math.sqrt(1+f-i-a);this._w=(s-n)/u,this._x=(r+l)/u,this._y=(o+c)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ze(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const n=Math.min(1,t/i);return this.slerp(e,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,n=e._y,r=e._z,s=e._w,a=t._x,o=t._y,l=t._z,c=t._w;return this._x=i*c+s*a+n*l-r*o,this._y=n*c+s*o+r*a-i*l,this._z=r*c+s*l+i*o-n*a,this._w=s*c-i*a-n*o-r*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,n=e._y,r=e._z,s=e._w,a=this.dot(e);a<0&&(i=-i,n=-n,r=-r,s=-s,a=-a);let o=1-t;if(a<.9995){const l=Math.acos(a),c=Math.sin(l);o=Math.sin(o*l)/c,t=Math.sin(t*l)/c,this._x=this._x*o+i*t,this._y=this._y*o+n*t,this._z=this._z*o+r*t,this._w=this._w*o+s*t,this._onChangeCallback()}else this._x=this._x*o+i*t,this._y=this._y*o+n*t,this._z=this._z*o+r*t,this._w=this._w*o+s*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(e),n*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},F=class Xa{static{h(this,"Vector3")}static{Xa.prototype.isVector3=!0}constructor(t=0,i=0,n=0){this.x=t,this.y=i,this.z=n}set(t,i,n){return n===void 0&&(n=this.z),this.x=t,this.y=i,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this.z=t.z+i.z,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this.z+=t.z*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this.z=t.z-i.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,i){return this.x=t.x*i.x,this.y=t.y*i.y,this.z=t.z*i.z,this}applyEuler(t){return this.applyQuaternion(Gs.setFromEuler(t))}applyAxisAngle(t,i){return this.applyQuaternion(Gs.setFromAxisAngle(t,i))}applyMatrix3(t){const i=this.x,n=this.y,r=this.z,s=t.elements;return this.x=s[0]*i+s[3]*n+s[6]*r,this.y=s[1]*i+s[4]*n+s[7]*r,this.z=s[2]*i+s[5]*n+s[8]*r,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const i=this.x,n=this.y,r=this.z,s=t.elements,a=1/(s[3]*i+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*i+s[4]*n+s[8]*r+s[12])*a,this.y=(s[1]*i+s[5]*n+s[9]*r+s[13])*a,this.z=(s[2]*i+s[6]*n+s[10]*r+s[14])*a,this}applyQuaternion(t){const i=this.x,n=this.y,r=this.z,s=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*r-o*n),f=2*(o*i-s*r),d=2*(s*n-a*i);return this.x=i+l*c+a*d-o*f,this.y=n+l*f+o*c-s*d,this.z=r+l*d+s*f-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const i=this.x,n=this.y,r=this.z,s=t.elements;return this.x=s[0]*i+s[4]*n+s[8]*r,this.y=s[1]*i+s[5]*n+s[9]*r,this.z=s[2]*i+s[6]*n+s[10]*r,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,i){return this.x=ze(this.x,t.x,i.x),this.y=ze(this.y,t.y,i.y),this.z=ze(this.z,t.z,i.z),this}clampScalar(t,i){return this.x=ze(this.x,t,i),this.y=ze(this.y,t,i),this.z=ze(this.z,t,i),this}clampLength(t,i){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ze(n,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this.z+=(t.z-this.z)*i,this}lerpVectors(t,i,n){return this.x=t.x+(i.x-t.x)*n,this.y=t.y+(i.y-t.y)*n,this.z=t.z+(i.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,i){const n=t.x,r=t.y,s=t.z,a=i.x,o=i.y,l=i.z;return this.x=r*l-s*o,this.y=s*a-n*l,this.z=n*o-r*a,this}projectOnVector(t){const i=t.lengthSq();if(i===0)return this.set(0,0,0);const n=t.dot(this)/i;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Dr.copy(this).projectOnVector(t),this.sub(Dr)}reflect(t){return this.sub(Dr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const i=Math.sqrt(this.lengthSq()*t.lengthSq());if(i===0)return Math.PI/2;const n=this.dot(t)/i;return Math.acos(ze(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const i=this.x-t.x,n=this.y-t.y,r=this.z-t.z;return i*i+n*n+r*r}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,i,n){const r=Math.sin(i)*t;return this.x=r*Math.sin(n),this.y=Math.cos(i)*t,this.z=r*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,i,n){return this.x=t*Math.sin(i),this.y=n,this.z=t*Math.cos(i),this}setFromMatrixPosition(t){const i=t.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this}setFromMatrixScale(t){const i=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),r=this.setFromMatrixColumn(t,2).length();return this.x=i,this.y=n,this.z=r,this}setFromMatrixColumn(t,i){return this.fromArray(t.elements,i*4)}setFromMatrix3Column(t,i){return this.fromArray(t.elements,i*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this.z=t[i+2],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t[i+2]=this.z,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this.z=t.getZ(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,i=Math.random()*2-1,n=Math.sqrt(1-i*i);return this.x=n*Math.cos(t),this.y=i,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Dr=new F,Gs=new Ni,Ne=class qa{static{h(this,"Matrix3")}static{qa.prototype.isMatrix3=!0}constructor(t,i,n,r,s,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,i,n,r,s,a,o,l,c)}set(t,i,n,r,s,a,o,l,c){const f=this.elements;return f[0]=t,f[1]=r,f[2]=o,f[3]=i,f[4]=s,f[5]=l,f[6]=n,f[7]=a,f[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const i=this.elements,n=t.elements;return i[0]=n[0],i[1]=n[1],i[2]=n[2],i[3]=n[3],i[4]=n[4],i[5]=n[5],i[6]=n[6],i[7]=n[7],i[8]=n[8],this}extractBasis(t,i,n){return t.setFromMatrix3Column(this,0),i.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const i=t.elements;return this.set(i[0],i[4],i[8],i[1],i[5],i[9],i[2],i[6],i[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,i){const n=t.elements,r=i.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],f=n[4],d=n[7],u=n[2],m=n[5],y=n[8],S=r[0],g=r[3],p=r[6],R=r[1],C=r[4],v=r[7],A=r[2],b=r[5],w=r[8];return s[0]=a*S+o*R+l*A,s[3]=a*g+o*C+l*b,s[6]=a*p+o*v+l*w,s[1]=c*S+f*R+d*A,s[4]=c*g+f*C+d*b,s[7]=c*p+f*v+d*w,s[2]=u*S+m*R+y*A,s[5]=u*g+m*C+y*b,s[8]=u*p+m*v+y*w,this}multiplyScalar(t){const i=this.elements;return i[0]*=t,i[3]*=t,i[6]*=t,i[1]*=t,i[4]*=t,i[7]*=t,i[2]*=t,i[5]*=t,i[8]*=t,this}determinant(){const t=this.elements,i=t[0],n=t[1],r=t[2],s=t[3],a=t[4],o=t[5],l=t[6],c=t[7],f=t[8];return i*a*f-i*o*c-n*s*f+n*o*l+r*s*c-r*a*l}invert(){const t=this.elements,i=t[0],n=t[1],r=t[2],s=t[3],a=t[4],o=t[5],l=t[6],c=t[7],f=t[8],d=f*a-o*c,u=o*l-f*s,m=c*s-a*l,y=i*d+n*u+r*m;if(y===0)return this.set(0,0,0,0,0,0,0,0,0);const S=1/y;return t[0]=d*S,t[1]=(r*c-f*n)*S,t[2]=(o*n-r*a)*S,t[3]=u*S,t[4]=(f*i-r*l)*S,t[5]=(r*s-o*i)*S,t[6]=m*S,t[7]=(n*l-c*i)*S,t[8]=(a*i-n*s)*S,this}transpose(){let t;const i=this.elements;return t=i[1],i[1]=i[3],i[3]=t,t=i[2],i[2]=i[6],i[6]=t,t=i[5],i[5]=i[7],i[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const i=this.elements;return t[0]=i[0],t[1]=i[3],t[2]=i[6],t[3]=i[1],t[4]=i[4],t[5]=i[7],t[6]=i[2],t[7]=i[5],t[8]=i[8],this}setUvTransform(t,i,n,r,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-r*c,r*l,-r*(-c*a+l*o)+o+i,0,0,1),this}scale(t,i){return on("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Nr.makeScale(t,i)),this}rotate(t){return on("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Nr.makeRotation(-t)),this}translate(t,i){return on("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Nr.makeTranslation(t,i)),this}makeTranslation(t,i){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,i,0,0,1),this}makeRotation(t){const i=Math.cos(t),n=Math.sin(t);return this.set(i,-n,0,n,i,0,0,0,1),this}makeScale(t,i){return this.set(t,0,0,0,i,0,0,0,1),this}equals(t){const i=this.elements,n=t.elements;for(let r=0;r<9;r++)if(i[r]!==n[r])return!1;return!0}fromArray(t,i=0){for(let n=0;n<9;n++)this.elements[n]=t[n+i];return this}toArray(t=[],i=0){const n=this.elements;return t[i]=n[0],t[i+1]=n[1],t[i+2]=n[2],t[i+3]=n[3],t[i+4]=n[4],t[i+5]=n[5],t[i+6]=n[6],t[i+7]=n[7],t[i+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Nr=new Ne,Hs=new Ne().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ks=new Ne().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ql(){const e={enabled:!0,workingColorSpace:ds,spaces:{},convert:h(function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer==="srgb"&&(r.r=ci(r.r),r.g=ci(r.g),r.b=ci(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer==="srgb"&&(r.r=ln(r.r),r.g=ln(r.g),r.b=ln(r.b))),r},"convert"),workingToColorSpace:h(function(r,s){return this.convert(r,this.workingColorSpace,s)},"workingToColorSpace"),colorSpaceToWorking:h(function(r,s){return this.convert(r,s,this.workingColorSpace)},"colorSpaceToWorking"),getPrimaries:h(function(r){return this.spaces[r].primaries},"getPrimaries"),getTransfer:h(function(r){return r===""?vr:this.spaces[r].transfer},"getTransfer"),getToneMappingMode:h(function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},"getToneMappingMode"),getLuminanceCoefficients:h(function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},"getLuminanceCoefficients"),define:h(function(r){Object.assign(this.spaces,r)},"define"),_getMatrix:h(function(r,s,a){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},"_getMatrix"),_getDrawingBufferColorSpace:h(function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},"_getDrawingBufferColorSpace"),_getUnpackColorSpace:h(function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},"_getUnpackColorSpace"),fromWorkingColorSpace:h(function(r,s){return on("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(r,s)},"fromWorkingColorSpace"),toWorkingColorSpace:h(function(r,s){return on("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(r,s)},"toWorkingColorSpace")},t=[.64,.33,.3,.6,.15,.06],i=[.2126,.7152,.0722],n=[.3127,.329];return e.define({[ds]:{primaries:t,whitePoint:n,transfer:vr,toXYZ:Hs,fromXYZ:ks,luminanceCoefficients:i,workingColorSpaceConfig:{unpackColorSpace:wt},outputColorSpaceConfig:{drawingBufferColorSpace:wt}},[wt]:{primaries:t,whitePoint:n,transfer:_r,toXYZ:Hs,fromXYZ:ks,luminanceCoefficients:i,outputColorSpaceConfig:{drawingBufferColorSpace:wt}}}),e}h(Ql,"createColorManagement");var Ge=Ql();function ci(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}h(ci,"SRGBToLinear");function ln(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}h(ln,"LinearToSRGB");var Bi,jl=class{static{h(this,"ImageUtils")}static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Bi===void 0&&(Bi=Mr("canvas")),Bi.width=e.width,Bi.height=e.height;const n=Bi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),i=Bi}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Mr("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const n=i.getImageData(0,0,e.width,e.height),r=n.data;for(let s=0;s<r.length;s++)r[s]=ci(r[s]/255)*255;return i.putImageData(n,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(ci(t[i]/255)*255):t[i]=ci(t[i]);return{data:t,width:e.width,height:e.height}}else return Ce("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},ec=0,Ss=class{static{h(this,"Source")}constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:ec++}),this.uuid=xi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let s=0,a=n.length;s<a;s++)n[s].isDataTexture?r.push(Fr(n[s].image)):r.push(Fr(n[s]))}else r=Fr(n);i.url=r}return t||(e.images[this.uuid]=i),i}};function Fr(e){return typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap?jl.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(Ce("Texture: Unable to serialize Texture."),{})}h(Fr,"serializeImage");var tc=0,Or=new F,zt=class fr extends Di{static{h(this,"Texture")}constructor(t=fr.DEFAULT_IMAGE,i=fr.DEFAULT_MAPPING,n=li,r=li,s=Pt,a=Er,o=Pn,l=Ii,c=fr.DEFAULT_ANISOTROPY,f=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:tc++}),this.uuid=xi(),this.name="",this.source=new Ss(t),this.mipmaps=[],this.mapping=i,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ue(0,0),this.repeat=new Ue(1,1),this.center=new Ue(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ne,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Or).x}get height(){return this.source.getSize(Or).y}get depth(){return this.source.getSize(Or).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,i){this.updateRanges.push({start:t,count:i})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const i in t){const n=t[i];if(n===void 0){Ce(`Texture.setValues(): parameter '${i}' has value of undefined.`);continue}const r=this[i];if(r===void 0){Ce(`Texture.setValues(): property '${i}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[i]=n}}toJSON(t){const i=t===void 0||typeof t=="string";if(!i&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),i||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==300)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case hs:t.x=t.x-Math.floor(t.x);break;case li:t.x=t.x<0?0:1;break;case us:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x)}if(t.y<0||t.y>1)switch(this.wrapT){case hs:t.y=t.y-Math.floor(t.y);break;case li:t.y=t.y<0?0:1;break;case us:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y)}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};zt.DEFAULT_IMAGE=null;zt.DEFAULT_MAPPING=300;zt.DEFAULT_ANISOTROPY=1;var ut=class Ya{static{h(this,"Vector4")}static{Ya.prototype.isVector4=!0}constructor(t=0,i=0,n=0,r=1){this.x=t,this.y=i,this.z=n,this.w=r}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,i,n,r){return this.x=t,this.y=i,this.z=n,this.w=r,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;case 3:this.w=i;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this.z=t.z+i.z,this.w=t.w+i.w,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this.z+=t.z*i,this.w+=t.w*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this.z=t.z-i.z,this.w=t.w-i.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const i=this.x,n=this.y,r=this.z,s=this.w,a=t.elements;return this.x=a[0]*i+a[4]*n+a[8]*r+a[12]*s,this.y=a[1]*i+a[5]*n+a[9]*r+a[13]*s,this.z=a[2]*i+a[6]*n+a[10]*r+a[14]*s,this.w=a[3]*i+a[7]*n+a[11]*r+a[15]*s,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const i=Math.sqrt(1-t.w*t.w);return i<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/i,this.y=t.y/i,this.z=t.z/i),this}setAxisAngleFromRotationMatrix(t){let i,n,r,s;const l=t.elements,c=l[0],f=l[4],d=l[8],u=l[1],m=l[5],y=l[9],S=l[2],g=l[6],p=l[10];if(Math.abs(f-u)<.01&&Math.abs(d-S)<.01&&Math.abs(y-g)<.01){if(Math.abs(f+u)<.1&&Math.abs(d+S)<.1&&Math.abs(y+g)<.1&&Math.abs(c+m+p-3)<.1)return this.set(1,0,0,0),this;i=Math.PI;const C=(c+1)/2,v=(m+1)/2,A=(p+1)/2,b=(f+u)/4,w=(d+S)/4,_=(y+g)/4;return C>v&&C>A?C<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(C),r=b/n,s=w/n):v>A?v<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(v),n=b/r,s=_/r):A<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(A),n=w/s,r=_/s),this.set(n,r,s,i),this}let R=Math.sqrt((g-y)*(g-y)+(d-S)*(d-S)+(u-f)*(u-f));return Math.abs(R)<.001&&(R=1),this.x=(g-y)/R,this.y=(d-S)/R,this.z=(u-f)/R,this.w=Math.acos((c+m+p-1)/2),this}setFromMatrixPosition(t){const i=t.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this.w=i[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,i){return this.x=ze(this.x,t.x,i.x),this.y=ze(this.y,t.y,i.y),this.z=ze(this.z,t.z,i.z),this.w=ze(this.w,t.w,i.w),this}clampScalar(t,i){return this.x=ze(this.x,t,i),this.y=ze(this.y,t,i),this.z=ze(this.z,t,i),this.w=ze(this.w,t,i),this}clampLength(t,i){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ze(n,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this.z+=(t.z-this.z)*i,this.w+=(t.w-this.w)*i,this}lerpVectors(t,i,n){return this.x=t.x+(i.x-t.x)*n,this.y=t.y+(i.y-t.y)*n,this.z=t.z+(i.z-t.z)*n,this.w=t.w+(i.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this.z=t[i+2],this.w=t[i+3],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t[i+2]=this.z,t[i+3]=this.w,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this.z=t.getZ(i),this.w=t.getW(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ic=class extends Di{static{h(this,"RenderTarget")}constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Pt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new ut(0,0,e,t),this.scissorTest=!1,this.viewport=new ut(0,0,e,t),this.textures=[];const n={width:e,height:t,depth:i.depth},r=new zt(n),s=i.count;for(let a=0;a<s;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Pt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=e,this.textures[n].image.height=t,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const n=Object.assign({},e.textures[t].image);this.textures[t].source=new Ss(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},jt=class extends ic{static{h(this,"WebGLRenderTarget")}constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Ka=class extends zt{static{h(this,"DataArrayTexture")}constructor(e=null,t=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=bt,this.minFilter=bt,this.wrapR=li,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},nc=class extends zt{static{h(this,"Data3DTexture")}constructor(e=null,t=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=bt,this.minFilter=bt,this.wrapR=li,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},lt=class ms{static{h(this,"Matrix4")}static{ms.prototype.isMatrix4=!0}constructor(t,i,n,r,s,a,o,l,c,f,d,u,m,y,S,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,i,n,r,s,a,o,l,c,f,d,u,m,y,S,g)}set(t,i,n,r,s,a,o,l,c,f,d,u,m,y,S,g){const p=this.elements;return p[0]=t,p[4]=i,p[8]=n,p[12]=r,p[1]=s,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=f,p[10]=d,p[14]=u,p[3]=m,p[7]=y,p[11]=S,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ms().fromArray(this.elements)}copy(t){const i=this.elements,n=t.elements;return i[0]=n[0],i[1]=n[1],i[2]=n[2],i[3]=n[3],i[4]=n[4],i[5]=n[5],i[6]=n[6],i[7]=n[7],i[8]=n[8],i[9]=n[9],i[10]=n[10],i[11]=n[11],i[12]=n[12],i[13]=n[13],i[14]=n[14],i[15]=n[15],this}copyPosition(t){const i=this.elements,n=t.elements;return i[12]=n[12],i[13]=n[13],i[14]=n[14],this}setFromMatrix3(t){const i=t.elements;return this.set(i[0],i[3],i[6],0,i[1],i[4],i[7],0,i[2],i[5],i[8],0,0,0,0,1),this}extractBasis(t,i,n){return this.determinantAffine()===0?(t.set(1,0,0),i.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),i.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,i,n){return this.set(t.x,i.x,n.x,0,t.y,i.y,n.y,0,t.z,i.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();const i=this.elements,n=t.elements,r=1/zi.setFromMatrixColumn(t,0).length(),s=1/zi.setFromMatrixColumn(t,1).length(),a=1/zi.setFromMatrixColumn(t,2).length();return i[0]=n[0]*r,i[1]=n[1]*r,i[2]=n[2]*r,i[3]=0,i[4]=n[4]*s,i[5]=n[5]*s,i[6]=n[6]*s,i[7]=0,i[8]=n[8]*a,i[9]=n[9]*a,i[10]=n[10]*a,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromEuler(t){const i=this.elements,n=t.x,r=t.y,s=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(r),c=Math.sin(r),f=Math.cos(s),d=Math.sin(s);if(t.order==="XYZ"){const u=a*f,m=a*d,y=o*f,S=o*d;i[0]=l*f,i[4]=-l*d,i[8]=c,i[1]=m+y*c,i[5]=u-S*c,i[9]=-o*l,i[2]=S-u*c,i[6]=y+m*c,i[10]=a*l}else if(t.order==="YXZ"){const u=l*f,m=l*d,y=c*f,S=c*d;i[0]=u+S*o,i[4]=y*o-m,i[8]=a*c,i[1]=a*d,i[5]=a*f,i[9]=-o,i[2]=m*o-y,i[6]=S+u*o,i[10]=a*l}else if(t.order==="ZXY"){const u=l*f,m=l*d,y=c*f,S=c*d;i[0]=u-S*o,i[4]=-a*d,i[8]=y+m*o,i[1]=m+y*o,i[5]=a*f,i[9]=S-u*o,i[2]=-a*c,i[6]=o,i[10]=a*l}else if(t.order==="ZYX"){const u=a*f,m=a*d,y=o*f,S=o*d;i[0]=l*f,i[4]=y*c-m,i[8]=u*c+S,i[1]=l*d,i[5]=S*c+u,i[9]=m*c-y,i[2]=-c,i[6]=o*l,i[10]=a*l}else if(t.order==="YZX"){const u=a*l,m=a*c,y=o*l,S=o*c;i[0]=l*f,i[4]=S-u*d,i[8]=y*d+m,i[1]=d,i[5]=a*f,i[9]=-o*f,i[2]=-c*f,i[6]=m*d+y,i[10]=u-S*d}else if(t.order==="XZY"){const u=a*l,m=a*c,y=o*l,S=o*c;i[0]=l*f,i[4]=-d,i[8]=c*f,i[1]=u*d+S,i[5]=a*f,i[9]=m*d-y,i[2]=y*d-m,i[6]=o*f,i[10]=S*d+u}return i[3]=0,i[7]=0,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromQuaternion(t){return this.compose(rc,t,sc)}lookAt(t,i,n){const r=this.elements;return Rt.subVectors(t,i),Rt.lengthSq()===0&&(Rt.z=1),Rt.normalize(),di.crossVectors(n,Rt),di.lengthSq()===0&&(Math.abs(n.z)===1?Rt.x+=1e-4:Rt.z+=1e-4,Rt.normalize(),di.crossVectors(n,Rt)),di.normalize(),Gn.crossVectors(Rt,di),r[0]=di.x,r[4]=Gn.x,r[8]=Rt.x,r[1]=di.y,r[5]=Gn.y,r[9]=Rt.y,r[2]=di.z,r[6]=Gn.z,r[10]=Rt.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,i){const n=t.elements,r=i.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],f=n[1],d=n[5],u=n[9],m=n[13],y=n[2],S=n[6],g=n[10],p=n[14],R=n[3],C=n[7],v=n[11],A=n[15],b=r[0],w=r[4],_=r[8],T=r[12],z=r[1],P=r[5],k=r[9],Y=r[13],V=r[2],H=r[6],q=r[10],O=r[14],ee=r[3],te=r[7],ie=r[11],de=r[15];return s[0]=a*b+o*z+l*V+c*ee,s[4]=a*w+o*P+l*H+c*te,s[8]=a*_+o*k+l*q+c*ie,s[12]=a*T+o*Y+l*O+c*de,s[1]=f*b+d*z+u*V+m*ee,s[5]=f*w+d*P+u*H+m*te,s[9]=f*_+d*k+u*q+m*ie,s[13]=f*T+d*Y+u*O+m*de,s[2]=y*b+S*z+g*V+p*ee,s[6]=y*w+S*P+g*H+p*te,s[10]=y*_+S*k+g*q+p*ie,s[14]=y*T+S*Y+g*O+p*de,s[3]=R*b+C*z+v*V+A*ee,s[7]=R*w+C*P+v*H+A*te,s[11]=R*_+C*k+v*q+A*ie,s[15]=R*T+C*Y+v*O+A*de,this}multiplyScalar(t){const i=this.elements;return i[0]*=t,i[4]*=t,i[8]*=t,i[12]*=t,i[1]*=t,i[5]*=t,i[9]*=t,i[13]*=t,i[2]*=t,i[6]*=t,i[10]*=t,i[14]*=t,i[3]*=t,i[7]*=t,i[11]*=t,i[15]*=t,this}determinant(){const t=this.elements,i=t[0],n=t[4],r=t[8],s=t[12],a=t[1],o=t[5],l=t[9],c=t[13],f=t[2],d=t[6],u=t[10],m=t[14],y=t[3],S=t[7],g=t[11],p=t[15],R=l*m-c*u,C=o*m-c*d,v=o*u-l*d,A=a*m-c*f,b=a*u-l*f,w=a*d-o*f;return i*(S*R-g*C+p*v)-n*(y*R-g*A+p*b)+r*(y*C-S*A+p*w)-s*(y*v-S*b+g*w)}determinantAffine(){const t=this.elements,i=t[0],n=t[4],r=t[8],s=t[1],a=t[5],o=t[9],l=t[2],c=t[6],f=t[10];return i*(a*f-o*c)-n*(s*f-o*l)+r*(s*c-a*l)}transpose(){const t=this.elements;let i;return i=t[1],t[1]=t[4],t[4]=i,i=t[2],t[2]=t[8],t[8]=i,i=t[6],t[6]=t[9],t[9]=i,i=t[3],t[3]=t[12],t[12]=i,i=t[7],t[7]=t[13],t[13]=i,i=t[11],t[11]=t[14],t[14]=i,this}setPosition(t,i,n){const r=this.elements;return t.isVector3?(r[12]=t.x,r[13]=t.y,r[14]=t.z):(r[12]=t,r[13]=i,r[14]=n),this}invert(){const t=this.elements,i=t[0],n=t[1],r=t[2],s=t[3],a=t[4],o=t[5],l=t[6],c=t[7],f=t[8],d=t[9],u=t[10],m=t[11],y=t[12],S=t[13],g=t[14],p=t[15],R=i*o-n*a,C=i*l-r*a,v=i*c-s*a,A=n*l-r*o,b=n*c-s*o,w=r*c-s*l,_=f*S-d*y,T=f*g-u*y,z=f*p-m*y,P=d*g-u*S,k=d*p-m*S,Y=u*p-m*g,V=R*Y-C*k+v*P+A*z-b*T+w*_;if(V===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const H=1/V;return t[0]=(o*Y-l*k+c*P)*H,t[1]=(r*k-n*Y-s*P)*H,t[2]=(S*w-g*b+p*A)*H,t[3]=(u*b-d*w-m*A)*H,t[4]=(l*z-a*Y-c*T)*H,t[5]=(i*Y-r*z+s*T)*H,t[6]=(g*v-y*w-p*C)*H,t[7]=(f*w-u*v+m*C)*H,t[8]=(a*k-o*z+c*_)*H,t[9]=(n*z-i*k-s*_)*H,t[10]=(y*b-S*v+p*R)*H,t[11]=(d*v-f*b-m*R)*H,t[12]=(o*T-a*P-l*_)*H,t[13]=(i*P-n*T+r*_)*H,t[14]=(S*C-y*A-g*R)*H,t[15]=(f*A-d*C+u*R)*H,this}scale(t){const i=this.elements,n=t.x,r=t.y,s=t.z;return i[0]*=n,i[4]*=r,i[8]*=s,i[1]*=n,i[5]*=r,i[9]*=s,i[2]*=n,i[6]*=r,i[10]*=s,i[3]*=n,i[7]*=r,i[11]*=s,this}getMaxScaleOnAxis(){const t=this.elements,i=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],r=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(i,n,r))}makeTranslation(t,i,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,i,0,0,1,n,0,0,0,1),this}makeRotationX(t){const i=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,i,-n,0,0,n,i,0,0,0,0,1),this}makeRotationY(t){const i=Math.cos(t),n=Math.sin(t);return this.set(i,0,n,0,0,1,0,0,-n,0,i,0,0,0,0,1),this}makeRotationZ(t){const i=Math.cos(t),n=Math.sin(t);return this.set(i,-n,0,0,n,i,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,i){const n=Math.cos(i),r=Math.sin(i),s=1-n,a=t.x,o=t.y,l=t.z,c=s*a,f=s*o;return this.set(c*a+n,c*o-r*l,c*l+r*o,0,c*o+r*l,f*o+n,f*l-r*a,0,c*l-r*o,f*l+r*a,s*l*l+n,0,0,0,0,1),this}makeScale(t,i,n){return this.set(t,0,0,0,0,i,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,i,n,r,s,a){return this.set(1,n,s,0,t,1,a,0,i,r,1,0,0,0,0,1),this}compose(t,i,n){const r=this.elements,s=i._x,a=i._y,o=i._z,l=i._w,c=s+s,f=a+a,d=o+o,u=s*c,m=s*f,y=s*d,S=a*f,g=a*d,p=o*d,R=l*c,C=l*f,v=l*d,A=n.x,b=n.y,w=n.z;return r[0]=(1-(S+p))*A,r[1]=(m+v)*A,r[2]=(y-C)*A,r[3]=0,r[4]=(m-v)*b,r[5]=(1-(u+p))*b,r[6]=(g+R)*b,r[7]=0,r[8]=(y+C)*w,r[9]=(g-R)*w,r[10]=(1-(u+S))*w,r[11]=0,r[12]=t.x,r[13]=t.y,r[14]=t.z,r[15]=1,this}decompose(t,i,n){const r=this.elements;t.x=r[12],t.y=r[13],t.z=r[14];const s=this.determinantAffine();if(s===0)return n.set(1,1,1),i.identity(),this;let a=zi.set(r[0],r[1],r[2]).length();const o=zi.set(r[4],r[5],r[6]).length(),l=zi.set(r[8],r[9],r[10]).length();s<0&&(a=-a),Ht.copy(this);const c=1/a,f=1/o,d=1/l;return Ht.elements[0]*=c,Ht.elements[1]*=c,Ht.elements[2]*=c,Ht.elements[4]*=f,Ht.elements[5]*=f,Ht.elements[6]*=f,Ht.elements[8]*=d,Ht.elements[9]*=d,Ht.elements[10]*=d,i.setFromRotationMatrix(Ht),n.x=a,n.y=o,n.z=l,this}makePerspective(t,i,n,r,s,a,o=cn,l=!1){const c=this.elements,f=2*s/(i-t),d=2*s/(n-r),u=(i+t)/(i-t),m=(n+r)/(n-r);let y,S;if(l)y=s/(a-s),S=a*s/(a-s);else if(o===2e3)y=-(a+s)/(a-s),S=-2*a*s/(a-s);else if(o===2001)y=-a/(a-s),S=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=m,c[13]=0,c[2]=0,c[6]=0,c[10]=y,c[14]=S,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,i,n,r,s,a,o=cn,l=!1){const c=this.elements,f=2/(i-t),d=2/(n-r),u=-(i+t)/(i-t),m=-(n+r)/(n-r);let y,S;if(l)y=1/(a-s),S=a/(a-s);else if(o===2e3)y=-2/(a-s),S=-(a+s)/(a-s);else if(o===2001)y=-1/(a-s),S=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=m,c[2]=0,c[6]=0,c[10]=y,c[14]=S,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){const i=this.elements,n=t.elements;for(let r=0;r<16;r++)if(i[r]!==n[r])return!1;return!0}fromArray(t,i=0){for(let n=0;n<16;n++)this.elements[n]=t[n+i];return this}toArray(t=[],i=0){const n=this.elements;return t[i]=n[0],t[i+1]=n[1],t[i+2]=n[2],t[i+3]=n[3],t[i+4]=n[4],t[i+5]=n[5],t[i+6]=n[6],t[i+7]=n[7],t[i+8]=n[8],t[i+9]=n[9],t[i+10]=n[10],t[i+11]=n[11],t[i+12]=n[12],t[i+13]=n[13],t[i+14]=n[14],t[i+15]=n[15],t}},zi=new F,Ht=new lt,rc=new F(0,0,0),sc=new F(1,1,1),di=new F,Gn=new F,Rt=new F,Ws=new lt,Xs=new Ni,Ln=class Za{static{h(this,"Euler")}constructor(t=0,i=0,n=0,r=Za.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=i,this._z=n,this._order=r}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,i,n,r=this._order){return this._x=t,this._y=i,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,i=this._order,n=!0){const r=t.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],f=r[9],d=r[2],u=r[6],m=r[10];switch(i){case"XYZ":this._y=Math.asin(ze(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-f,m),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ze(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(ze(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,m),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-ze(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,m),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(ze(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,c),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-ze(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-f,m),this._y=0);break;default:Ce("Euler: .setFromRotationMatrix() encountered an unknown order: "+i)}return this._order=i,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,i,n){return Ws.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Ws,i,n)}setFromVector3(t,i=this._order){return this.set(t.x,t.y,t.z,i)}reorder(t){return Xs.setFromEuler(this),this.setFromQuaternion(Xs,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],i=0){return t[i]=this._x,t[i+1]=this._y,t[i+2]=this._z,t[i+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ln.DEFAULT_ORDER="XYZ";var Ja=class{static{h(this,"Layers")}constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},ac=0,qs=new F,Vi=new Ni,ni=new lt,Hn=new F,mn=new F,oc=new F,lc=new Ni,Ys=new F(1,0,0),Ks=new F(0,1,0),Zs=new F(0,0,1),Js={type:"added"},cc={type:"removed"},Gi={type:"childadded",child:null},Br={type:"childremoved",child:null},ei=class dr extends Di{static{h(this,"Object3D")}constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ac++}),this.uuid=xi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=dr.DEFAULT_UP.clone();const t=new F,i=new Ln,n=new Ni,r=new F(1,1,1);function s(){n.setFromEuler(i,!1)}h(s,"onRotationChange");function a(){i.setFromQuaternion(n,void 0,!1)}h(a,"onQuaternionChange"),i._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:i},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new lt},normalMatrix:{value:new Ne}}),this.matrix=new lt,this.matrixWorld=new lt,this.matrixAutoUpdate=dr.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=dr.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ja,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,i){this.quaternion.setFromAxisAngle(t,i)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,i){return Vi.setFromAxisAngle(t,i),this.quaternion.multiply(Vi),this}rotateOnWorldAxis(t,i){return Vi.setFromAxisAngle(t,i),this.quaternion.premultiply(Vi),this}rotateX(t){return this.rotateOnAxis(Ys,t)}rotateY(t){return this.rotateOnAxis(Ks,t)}rotateZ(t){return this.rotateOnAxis(Zs,t)}translateOnAxis(t,i){return qs.copy(t).applyQuaternion(this.quaternion),this.position.add(qs.multiplyScalar(i)),this}translateX(t){return this.translateOnAxis(Ys,t)}translateY(t){return this.translateOnAxis(Ks,t)}translateZ(t){return this.translateOnAxis(Zs,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ni.copy(this.matrixWorld).invert())}lookAt(t,i,n){t.isVector3?Hn.copy(t):Hn.set(t,i,n);const r=this.parent;this.updateWorldMatrix(!0,!1),mn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ni.lookAt(mn,Hn,this.up):ni.lookAt(Hn,mn,this.up),this.quaternion.setFromRotationMatrix(ni),r&&(ni.extractRotation(r.matrixWorld),Vi.setFromRotationMatrix(ni),this.quaternion.premultiply(Vi.invert()))}add(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.add(arguments[i]);return this}return t===this?(Re("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Js),Gi.child=t,this.dispatchEvent(Gi),Gi.child=null):Re("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const i=this.children.indexOf(t);return i!==-1&&(t.parent=null,this.children.splice(i,1),t.dispatchEvent(cc),Br.child=t,this.dispatchEvent(Br),Br.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ni.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ni.multiply(t.parent.matrixWorld)),t.applyMatrix4(ni),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Js),Gi.child=t,this.dispatchEvent(Gi),Gi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,i){if(this[t]===i)return this;for(let n=0,r=this.children.length;n<r;n++){const s=this.children[n].getObjectByProperty(t,i);if(s!==void 0)return s}}getObjectsByProperty(t,i,n=[]){this[t]===i&&n.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(t,i,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(mn,t,oc),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(mn,lc,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const i=this.matrixWorld.elements;return t.set(i[8],i[9],i[10]).normalize()}raycast(){}traverse(t){t(this);const i=this.children;for(let n=0,r=i.length;n<r;n++)i[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const i=this.children;for(let n=0,r=i.length;n<r;n++)i[n].traverseVisible(t)}traverseAncestors(t){const i=this.parent;i!==null&&(t(i),i.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const i=t.x,n=t.y,r=t.z,s=this.matrix.elements;s[12]+=i-s[0]*i-s[4]*n-s[8]*r,s[13]+=n-s[1]*i-s[5]*n-s[9]*r,s[14]+=r-s[2]*i-s[6]*n-s[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const i=this.children;for(let n=0,r=i.length;n<r;n++)i[n].updateMatrixWorld(t)}updateWorldMatrix(t,i,n=!1){const r=this.parent;if(t===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),i===!0){const s=this.children;for(let a=0,o=s.length;a<o;a++)s[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){const i=t===void 0||typeof t=="string",n={};i&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),this.static!==!1&&(r.static=this.static),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(o=>({...o})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(t),r.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(h(s,"serialize"),this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,f=l.length;c<f;c++){const d=l[c];s(t.shapes,d)}else s(t.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(t.materials,this.material[l]));r.material=o}else r.material=s(t.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(t.animations,l))}}if(i){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),f=a(t.images),d=a(t.shapes),u=a(t.skeletons),m=a(t.animations),y=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),f.length>0&&(n.images=f),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),m.length>0&&(n.animations=m),y.length>0&&(n.nodes=y)}return n.object=r,n;function a(o){const l=[];for(const c in o){const f=o[c];delete f.metadata,l.push(f)}return l}h(a,"extractFromCache")}clone(t){return new this.constructor().copy(this,t)}copy(t,i=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),i===!0)for(let n=0;n<t.children.length;n++){const r=t.children[n];this.add(r.clone())}return this}};ei.DEFAULT_UP=new F(0,1,0);ei.DEFAULT_MATRIX_AUTO_UPDATE=!0;ei.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Tn=class extends ei{static{h(this,"Group")}constructor(){super(),this.isGroup=!0,this.type="Group"}},hc={type:"move"},zr=class{static{h(this,"WebXRController")}constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Tn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Tn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new F,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new F),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Tn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new F,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new F,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let n=null,r=null,s=null;const a=this._targetRay,o=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){s=!0;for(const u of e.hand.values()){const m=t.getJointPose(u,i),y=this._getHandJoint(l,u);m!==null&&(y.matrix.fromArray(m.transform.matrix),y.matrix.decompose(y.position,y.rotation,y.scale),y.matrixWorldNeedsUpdate=!0,y.jointRadius=m.radius),y.visible=m!==null}const c=l.joints["index-finger-tip"],f=l.joints["thumb-tip"],d=c.position.distanceTo(f.position);l.inputState.pinching&&d>.025?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=.015&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else o!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,o.eventsEnabled&&o.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(n=t.getPose(e.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(a.matrix.fromArray(n.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,n.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(n.linearVelocity)):a.hasLinearVelocity=!1,n.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(n.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(hc)))}return a!==null&&(a.visible=n!==null),o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Tn;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},$a={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},pi={h:0,s:0,l:0},kn={h:0,s:0,l:0};function Vr(e,t,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?e+(t-e)*6*i:i<1/2?t:i<2/3?e+(t-e)*6*(2/3-i):e}h(Vr,"hue2rgb");var ke=class{static{h(this,"Color")}constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const n=e;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=wt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ge.colorSpaceToWorking(this,t),this}setRGB(e,t,i,n=Ge.workingColorSpace){return this.r=e,this.g=t,this.b=i,Ge.colorSpaceToWorking(this,n),this}setHSL(e,t,i,n=Ge.workingColorSpace){if(e=$l(e,1),t=ze(t,0,1),i=ze(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,s=2*i-r;this.r=Vr(s,r,e+1/3),this.g=Vr(s,r,e),this.b=Vr(s,r,e-1/3)}return Ge.colorSpaceToWorking(this,n),this}setStyle(e,t=wt){function i(r){r!==void 0&&parseFloat(r)<1&&Ce("Color: Alpha component of "+e+" will be ignored.")}h(i,"handleAlpha");let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const s=n[1],a=n[2];switch(s){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ce("Color: Unknown color model "+e)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=n[1],s=r.length;if(s===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(s===6)return this.setHex(parseInt(r,16),t);Ce("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=wt){const i=$a[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ce("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ci(e.r),this.g=ci(e.g),this.b=ci(e.b),this}copyLinearToSRGB(e){return this.r=ln(e.r),this.g=ln(e.g),this.b=ln(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=wt){return Ge.workingToColorSpace(yt.copy(this),e),Math.round(ze(yt.r*255,0,255))*65536+Math.round(ze(yt.g*255,0,255))*256+Math.round(ze(yt.b*255,0,255))}getHexString(e=wt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ge.workingColorSpace){Ge.workingToColorSpace(yt.copy(this),t);const i=yt.r,n=yt.g,r=yt.b,s=Math.max(i,n,r),a=Math.min(i,n,r);let o,l;const c=(a+s)/2;if(a===s)o=0,l=0;else{const f=s-a;switch(l=c<=.5?f/(s+a):f/(2-s-a),s){case i:o=(n-r)/f+(n<r?6:0);break;case n:o=(r-i)/f+2;break;case r:o=(i-n)/f+4}o/=6}return e.h=o,e.s=l,e.l=c,e}getRGB(e,t=Ge.workingColorSpace){return Ge.workingToColorSpace(yt.copy(this),t),e.r=yt.r,e.g=yt.g,e.b=yt.b,e}getStyle(e=wt){Ge.workingToColorSpace(yt.copy(this),e);const t=yt.r,i=yt.g,n=yt.b;return e!=="srgb"?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(e,t,i){return this.getHSL(pi),this.setHSL(pi.h+e,pi.s+t,pi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(pi),e.getHSL(kn);const i=Ur(pi.h,kn.h,t),n=Ur(pi.s,kn.s,t),r=Ur(pi.l,kn.l,t);return this.setHSL(i,n,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,n=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*n,this.g=r[1]*t+r[4]*i+r[7]*n,this.b=r[2]*t+r[5]*i+r[8]*n,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},yt=new ke;ke.NAMES=$a;var $s=class extends ei{static{h(this,"Scene")}constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ln,this.environmentIntensity=1,this.environmentRotation=new Ln,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},kt=new F,ri=new F,Gr=new F,si=new F,Hi=new F,ki=new F,Qs=new F,Hr=new F,kr=new F,Wr=new F,Xr=new ut,qr=new ut,Yr=new ut,tn=class nn{static{h(this,"Triangle")}constructor(t=new F,i=new F,n=new F){this.a=t,this.b=i,this.c=n}static getNormal(t,i,n,r){r.subVectors(n,i),kt.subVectors(t,i),r.cross(kt);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(t,i,n,r,s){kt.subVectors(r,i),ri.subVectors(n,i),Gr.subVectors(t,i);const a=kt.dot(kt),o=kt.dot(ri),l=kt.dot(Gr),c=ri.dot(ri),f=ri.dot(Gr),d=a*c-o*o;if(d===0)return s.set(0,0,0),null;const u=1/d,m=(c*l-o*f)*u,y=(a*f-o*l)*u;return s.set(1-m-y,y,m)}static containsPoint(t,i,n,r){return this.getBarycoord(t,i,n,r,si)===null?!1:si.x>=0&&si.y>=0&&si.x+si.y<=1}static getInterpolation(t,i,n,r,s,a,o,l){return this.getBarycoord(t,i,n,r,si)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,si.x),l.addScaledVector(a,si.y),l.addScaledVector(o,si.z),l)}static getInterpolatedAttribute(t,i,n,r,s,a){return Xr.setScalar(0),qr.setScalar(0),Yr.setScalar(0),Xr.fromBufferAttribute(t,i),qr.fromBufferAttribute(t,n),Yr.fromBufferAttribute(t,r),a.setScalar(0),a.addScaledVector(Xr,s.x),a.addScaledVector(qr,s.y),a.addScaledVector(Yr,s.z),a}static isFrontFacing(t,i,n,r){return kt.subVectors(n,i),ri.subVectors(t,i),kt.cross(ri).dot(r)<0}set(t,i,n){return this.a.copy(t),this.b.copy(i),this.c.copy(n),this}setFromPointsAndIndices(t,i,n,r){return this.a.copy(t[i]),this.b.copy(t[n]),this.c.copy(t[r]),this}setFromAttributeAndIndices(t,i,n,r){return this.a.fromBufferAttribute(t,i),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,r),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return kt.subVectors(this.c,this.b),ri.subVectors(this.a,this.b),kt.cross(ri).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return nn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,i){return nn.getBarycoord(t,this.a,this.b,this.c,i)}getInterpolation(t,i,n,r,s){return nn.getInterpolation(t,this.a,this.b,this.c,i,n,r,s)}containsPoint(t){return nn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return nn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,i){const n=this.a,r=this.b,s=this.c;let a,o;Hi.subVectors(r,n),ki.subVectors(s,n),Hr.subVectors(t,n);const l=Hi.dot(Hr),c=ki.dot(Hr);if(l<=0&&c<=0)return i.copy(n);kr.subVectors(t,r);const f=Hi.dot(kr),d=ki.dot(kr);if(f>=0&&d<=f)return i.copy(r);const u=l*d-f*c;if(u<=0&&l>=0&&f<=0)return a=l/(l-f),i.copy(n).addScaledVector(Hi,a);Wr.subVectors(t,s);const m=Hi.dot(Wr),y=ki.dot(Wr);if(y>=0&&m<=y)return i.copy(s);const S=m*c-l*y;if(S<=0&&c>=0&&y<=0)return o=c/(c-y),i.copy(n).addScaledVector(ki,o);const g=f*y-m*d;if(g<=0&&d-f>=0&&m-y>=0)return Qs.subVectors(s,r),o=(d-f)/(d-f+(m-y)),i.copy(r).addScaledVector(Qs,o);const p=1/(g+S+u);return a=S*p,o=u*p,i.copy(n).addScaledVector(Hi,a).addScaledVector(ki,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Un=class{static{h(this,"Box3")}constructor(e=new F(1/0,1/0,1/0),t=new F(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Wt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Wt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Wt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let s=0,a=r.count;s<a;s++)e.isMesh===!0?e.getVertexPosition(s,Wt):Wt.fromBufferAttribute(r,s),Wt.applyMatrix4(e.matrixWorld),this.expandByPoint(Wt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wn.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Wn.copy(i.boundingBox)),Wn.applyMatrix4(e.matrixWorld),this.union(Wn)}const n=e.children;for(let r=0,s=n.length;r<s;r++)this.expandByObject(n[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Wt),Wt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(gn),Xn.subVectors(this.max,gn),Wi.subVectors(e.a,gn),Xi.subVectors(e.b,gn),qi.subVectors(e.c,gn),mi.subVectors(Xi,Wi),gi.subVectors(qi,Xi),Ti.subVectors(Wi,qi);let t=[0,-mi.z,mi.y,0,-gi.z,gi.y,0,-Ti.z,Ti.y,mi.z,0,-mi.x,gi.z,0,-gi.x,Ti.z,0,-Ti.x,-mi.y,mi.x,0,-gi.y,gi.x,0,-Ti.y,Ti.x,0];return!Kr(t,Wi,Xi,qi,Xn)||(t=[1,0,0,0,1,0,0,0,1],!Kr(t,Wi,Xi,qi,Xn))?!1:(qn.crossVectors(mi,gi),t=[qn.x,qn.y,qn.z],Kr(t,Wi,Xi,qi,Xn))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Wt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Wt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ai[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ai[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ai[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ai[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ai[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ai[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ai[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ai[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ai),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},ai=[new F,new F,new F,new F,new F,new F,new F,new F],Wt=new F,Wn=new Un,Wi=new F,Xi=new F,qi=new F,mi=new F,gi=new F,Ti=new F,gn=new F,Xn=new F,qn=new F,bi=new F;function Kr(e,t,i,n,r){for(let s=0,a=e.length-3;s<=a;s+=3){bi.fromArray(e,s);const o=r.x*Math.abs(bi.x)+r.y*Math.abs(bi.y)+r.z*Math.abs(bi.z),l=t.dot(bi),c=i.dot(bi),f=n.dot(bi);if(Math.max(-Math.max(l,c,f),Math.min(l,c,f))>o)return!1}return!0}h(Kr,"satForAxes");var ht=new F,Yn=new Ue,uc=0,Bt=class extends Di{static{h(this,"BufferAttribute")}constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:uc++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Ha,this.updateRanges=[],this.gpuType=Tr,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[e+n]=t.array[i+n];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Yn.fromBufferAttribute(this,t),Yn.applyMatrix3(e),this.setXY(t,Yn.x,Yn.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)ht.fromBufferAttribute(this,t),ht.applyMatrix3(e),this.setXYZ(t,ht.x,ht.y,ht.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)ht.fromBufferAttribute(this,t),ht.applyMatrix4(e),this.setXYZ(t,ht.x,ht.y,ht.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)ht.fromBufferAttribute(this,t),ht.applyNormalMatrix(e),this.setXYZ(t,ht.x,ht.y,ht.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)ht.fromBufferAttribute(this,t),ht.transformDirection(e),this.setXYZ(t,ht.x,ht.y,ht.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Qt(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=$e(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Qt(t,this.array)),t}setX(e,t){return this.normalized&&(t=$e(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Qt(t,this.array)),t}setY(e,t){return this.normalized&&(t=$e(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Qt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=$e(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Qt(t,this.array)),t}setW(e,t){return this.normalized&&(t=$e(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=$e(t,this.array),i=$e(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,n){return e*=this.itemSize,this.normalized&&(t=$e(t,this.array),i=$e(i,this.array),n=$e(n,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this}setXYZW(e,t,i,n,r){return e*=this.itemSize,this.normalized&&(t=$e(t,this.array),i=$e(i,this.array),n=$e(n,this.array),r=$e(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}},Qa=class extends Bt{static{h(this,"Uint16BufferAttribute")}constructor(e,t,i){super(new Uint16Array(e),t,i)}},ja=class extends Bt{static{h(this,"Uint32BufferAttribute")}constructor(e,t,i){super(new Uint32Array(e),t,i)}},ct=class extends Bt{static{h(this,"Float32BufferAttribute")}constructor(e,t,i){super(new Float32Array(e),t,i)}},fc=new Un,vn=new F,Zr=new F,ys=class{static{h(this,"Sphere")}constructor(e=new F,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):fc.setFromPoints(e).getCenter(i);let n=0;for(let r=0,s=e.length;r<s;r++)n=Math.max(n,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(n),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;vn.subVectors(e,this.center);const t=vn.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),n=(i-this.radius)*.5;this.center.addScaledVector(vn,n/i),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Zr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(vn.copy(e.center).add(Zr)),this.expandByPoint(vn.copy(e.center).sub(Zr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},dc=0,Ft=new lt,Jr=new ei,Yi=new F,Ct=new Un,_n=new Un,gt=new F,Vt=class eo extends Di{static{h(this,"BufferGeometry")}constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:dc++}),this.uuid=xi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(ql(t)?ja:Qa)(t,1):this.index=t,this}setIndirect(t,i=0){return this.indirect=t,this.indirectOffset=i,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,i){return this.attributes[t]=i,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,i,n=0){this.groups.push({start:t,count:i,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,i){this.drawRange.start=t,this.drawRange.count=i}applyMatrix4(t){const i=this.attributes.position;i!==void 0&&(i.applyMatrix4(t),i.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Ne().getNormalMatrix(t);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(t),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Ft.makeRotationFromQuaternion(t),this.applyMatrix4(Ft),this}rotateX(t){return Ft.makeRotationX(t),this.applyMatrix4(Ft),this}rotateY(t){return Ft.makeRotationY(t),this.applyMatrix4(Ft),this}rotateZ(t){return Ft.makeRotationZ(t),this.applyMatrix4(Ft),this}translate(t,i,n){return Ft.makeTranslation(t,i,n),this.applyMatrix4(Ft),this}scale(t,i,n){return Ft.makeScale(t,i,n),this.applyMatrix4(Ft),this}lookAt(t){return Jr.lookAt(t),Jr.updateMatrix(),this.applyMatrix4(Jr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Yi).negate(),this.translate(Yi.x,Yi.y,Yi.z),this}setFromPoints(t){const i=this.getAttribute("position");if(i===void 0){const n=[];for(let r=0,s=t.length;r<s;r++){const a=t[r];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ct(n,3))}else{const n=Math.min(t.length,i.count);for(let r=0;r<n;r++){const s=t[r];i.setXYZ(r,s.x,s.y,s.z||0)}t.length>i.count&&Ce("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),i.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Un);const t=this.attributes.position,i=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Re("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new F(-1/0,-1/0,-1/0),new F(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),i)for(let n=0,r=i.length;n<r;n++){const s=i[n];Ct.setFromBufferAttribute(s),this.morphTargetsRelative?(gt.addVectors(this.boundingBox.min,Ct.min),this.boundingBox.expandByPoint(gt),gt.addVectors(this.boundingBox.max,Ct.max),this.boundingBox.expandByPoint(gt)):(this.boundingBox.expandByPoint(Ct.min),this.boundingBox.expandByPoint(Ct.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Re('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ys);const t=this.attributes.position,i=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Re("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new F,1/0);return}if(t){const n=this.boundingSphere.center;if(Ct.setFromBufferAttribute(t),i)for(let s=0,a=i.length;s<a;s++){const o=i[s];_n.setFromBufferAttribute(o),this.morphTargetsRelative?(gt.addVectors(Ct.min,_n.min),Ct.expandByPoint(gt),gt.addVectors(Ct.max,_n.max),Ct.expandByPoint(gt)):(Ct.expandByPoint(_n.min),Ct.expandByPoint(_n.max))}Ct.getCenter(n);let r=0;for(let s=0,a=t.count;s<a;s++)gt.fromBufferAttribute(t,s),r=Math.max(r,n.distanceToSquared(gt));if(i)for(let s=0,a=i.length;s<a;s++){const o=i[s],l=this.morphTargetsRelative;for(let c=0,f=o.count;c<f;c++)gt.fromBufferAttribute(o,c),l&&(Yi.fromBufferAttribute(t,c),gt.add(Yi)),r=Math.max(r,n.distanceToSquared(gt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&Re('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,i=this.attributes;if(t===null||i.position===void 0||i.normal===void 0||i.uv===void 0){Re("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=i.position,r=i.normal,s=i.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Bt(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],l=[];for(let _=0;_<n.count;_++)o[_]=new F,l[_]=new F;const c=new F,f=new F,d=new F,u=new Ue,m=new Ue,y=new Ue,S=new F,g=new F;function p(_,T,z){c.fromBufferAttribute(n,_),f.fromBufferAttribute(n,T),d.fromBufferAttribute(n,z),u.fromBufferAttribute(s,_),m.fromBufferAttribute(s,T),y.fromBufferAttribute(s,z),f.sub(c),d.sub(c),m.sub(u),y.sub(u);const P=1/(m.x*y.y-y.x*m.y);isFinite(P)&&(S.copy(f).multiplyScalar(y.y).addScaledVector(d,-m.y).multiplyScalar(P),g.copy(d).multiplyScalar(m.x).addScaledVector(f,-y.x).multiplyScalar(P),o[_].add(S),o[T].add(S),o[z].add(S),l[_].add(g),l[T].add(g),l[z].add(g))}h(p,"handleTriangle");let R=this.groups;R.length===0&&(R=[{start:0,count:t.count}]);for(let _=0,T=R.length;_<T;++_){const z=R[_],P=z.start,k=z.count;for(let Y=P,V=P+k;Y<V;Y+=3)p(t.getX(Y+0),t.getX(Y+1),t.getX(Y+2))}const C=new F,v=new F,A=new F,b=new F;function w(_){A.fromBufferAttribute(r,_),b.copy(A);const T=o[_];C.copy(T),C.sub(A.multiplyScalar(A.dot(T))).normalize(),v.crossVectors(b,T);const z=v.dot(l[_])<0?-1:1;a.setXYZW(_,C.x,C.y,C.z,z)}h(w,"handleVertex");for(let _=0,T=R.length;_<T;++_){const z=R[_],P=z.start,k=z.count;for(let Y=P,V=P+k;Y<V;Y+=3)w(t.getX(Y+0)),w(t.getX(Y+1)),w(t.getX(Y+2))}this._transformed=!0}computeVertexNormals(){const t=this.index,i=this.getAttribute("position");if(i!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==i.count)n=new Bt(new Float32Array(i.count*3),3),this.setAttribute("normal",n);else for(let u=0,m=n.count;u<m;u++)n.setXYZ(u,0,0,0);const r=new F,s=new F,a=new F,o=new F,l=new F,c=new F,f=new F,d=new F;if(t)for(let u=0,m=t.count;u<m;u+=3){const y=t.getX(u+0),S=t.getX(u+1),g=t.getX(u+2);r.fromBufferAttribute(i,y),s.fromBufferAttribute(i,S),a.fromBufferAttribute(i,g),f.subVectors(a,s),d.subVectors(r,s),f.cross(d),o.fromBufferAttribute(n,y),l.fromBufferAttribute(n,S),c.fromBufferAttribute(n,g),o.add(f),l.add(f),c.add(f),n.setXYZ(y,o.x,o.y,o.z),n.setXYZ(S,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,m=i.count;u<m;u+=3)r.fromBufferAttribute(i,u+0),s.fromBufferAttribute(i,u+1),a.fromBufferAttribute(i,u+2),f.subVectors(a,s),d.subVectors(r,s),f.cross(d),n.setXYZ(u+0,f.x,f.y,f.z),n.setXYZ(u+1,f.x,f.y,f.z),n.setXYZ(u+2,f.x,f.y,f.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let i=0,n=t.count;i<n;i++)gt.fromBufferAttribute(t,i),gt.normalize(),t.setXYZ(i,gt.x,gt.y,gt.z)}toNonIndexed(){function t(o,l){const c=o.array,f=o.itemSize,d=o.normalized,u=new c.constructor(l.length*f);let m=0,y=0;for(let S=0,g=l.length;S<g;S++){o.isInterleavedBufferAttribute?m=l[S]*o.data.stride+o.offset:m=l[S]*f;for(let p=0;p<f;p++)u[y++]=c[m++]}return new Bt(u,f,d)}if(h(t,"convertBufferAttribute"),this.index===null)return Ce("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const i=new eo,n=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=t(l,n);i.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let f=0,d=c.length;f<d;f++){const u=c[f],m=t(u,n);l.push(m)}i.morphAttributes[o]=l}i.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];i.addGroup(c.start,c.count,c.materialIndex)}return i}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const i=this.index;i!==null&&(t.data.index={type:i.array.constructor.name,array:Array.prototype.slice.call(i.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],f=[];for(let d=0,u=c.length;d<u;d++){const m=c[d];f.push(m.toJSON(t.data))}f.length>0&&(r[l]=f,s=!0)}s&&(t.data.morphAttributes=r,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const i={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone());const r=t.attributes;for(const c in r){const f=r[c];this.setAttribute(c,f.clone(i))}const s=t.morphAttributes;for(const c in s){const f=[],d=s[c];for(let u=0,m=d.length;u<m;u++)f.push(d[u].clone(i));this.morphAttributes[c]=f}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,f=a.length;c<f;c++){const d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},pc=class{static{h(this,"InterleavedBuffer")}constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Ha,this.updateRanges=[],this.version=0,this.uuid=xi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let n=0,r=this.stride;n<r;n++)this.array[e+n]=t.array[i+n];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=xi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=xi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Et=new F,js=class to{static{h(this,"InterleavedBufferAttribute")}constructor(t,i,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=i,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let i=0,n=this.data.count;i<n;i++)Et.fromBufferAttribute(this,i),Et.applyMatrix4(t),this.setXYZ(i,Et.x,Et.y,Et.z);return this}applyNormalMatrix(t){for(let i=0,n=this.count;i<n;i++)Et.fromBufferAttribute(this,i),Et.applyNormalMatrix(t),this.setXYZ(i,Et.x,Et.y,Et.z);return this}transformDirection(t){for(let i=0,n=this.count;i<n;i++)Et.fromBufferAttribute(this,i),Et.transformDirection(t),this.setXYZ(i,Et.x,Et.y,Et.z);return this}getComponent(t,i){let n=this.array[t*this.data.stride+this.offset+i];return this.normalized&&(n=Qt(n,this.array)),n}setComponent(t,i,n){return this.normalized&&(n=$e(n,this.array)),this.data.array[t*this.data.stride+this.offset+i]=n,this}setX(t,i){return this.normalized&&(i=$e(i,this.array)),this.data.array[t*this.data.stride+this.offset]=i,this}setY(t,i){return this.normalized&&(i=$e(i,this.array)),this.data.array[t*this.data.stride+this.offset+1]=i,this}setZ(t,i){return this.normalized&&(i=$e(i,this.array)),this.data.array[t*this.data.stride+this.offset+2]=i,this}setW(t,i){return this.normalized&&(i=$e(i,this.array)),this.data.array[t*this.data.stride+this.offset+3]=i,this}getX(t){let i=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(i=Qt(i,this.array)),i}getY(t){let i=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(i=Qt(i,this.array)),i}getZ(t){let i=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(i=Qt(i,this.array)),i}getW(t){let i=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(i=Qt(i,this.array)),i}setXY(t,i,n){return t=t*this.data.stride+this.offset,this.normalized&&(i=$e(i,this.array),n=$e(n,this.array)),this.data.array[t+0]=i,this.data.array[t+1]=n,this}setXYZ(t,i,n,r){return t=t*this.data.stride+this.offset,this.normalized&&(i=$e(i,this.array),n=$e(n,this.array),r=$e(r,this.array)),this.data.array[t+0]=i,this.data.array[t+1]=n,this.data.array[t+2]=r,this}setXYZW(t,i,n,r,s){return t=t*this.data.stride+this.offset,this.normalized&&(i=$e(i,this.array),n=$e(n,this.array),r=$e(r,this.array),s=$e(s,this.array)),this.data.array[t+0]=i,this.data.array[t+1]=n,this.data.array[t+2]=r,this.data.array[t+3]=s,this}clone(t){if(t===void 0){Sr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const i=[];for(let n=0;n<this.count;n++){const r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)i.push(this.data.array[r+s])}return new Bt(new this.array.constructor(i),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new to(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){Sr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const i=[];for(let n=0;n<this.count;n++){const r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)i.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:i,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},mc=0,Dn=class extends Di{static{h(this,"Material")}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:mc++}),this.uuid=xi(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ke(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ir,this.stencilZFail=Ir,this.stencilZPass=Ir,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Ce(`Material: parameter '${t}' has value of undefined.`);continue}const n=this[t];if(n===void 0){Ce(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(i.blending=this.blending),this.side!==0&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==204&&(i.blendSrc=this.blendSrc),this.blendDst!==205&&(i.blendDst=this.blendDst),this.blendEquation!==100&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(i.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){const s=[];for(const a in r){const o=r[a];delete o.metadata,s.push(o)}return s}if(h(n,"extractFromCache"),t){const r=n(e.textures),s=n(e.images);r.length>0&&(i.textures=r),s.length>0&&(i.images=s)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new ke().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Ue().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ue().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const n=t.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},io=class extends Dn{static{h(this,"SpriteMaterial")}constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new ke(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Ki,Mn=new F,Zi=new F,Ji=new F,$i=new Ue,Sn=new Ue,no=new lt,Kn=new F,yn=new F,Zn=new F,ea=new Ue,$r=new Ue,ta=new Ue,gc=class extends ei{static{h(this,"Sprite")}constructor(e=new io){if(super(),this.isSprite=!0,this.type="Sprite",Ki===void 0){Ki=new Vt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new pc(t,5);Ki.setIndex([0,1,2,0,2,3]),Ki.setAttribute("position",new js(i,3,0,!1)),Ki.setAttribute("uv",new js(i,2,3,!1))}this.geometry=Ki,this.material=e,this.center=new Ue(.5,.5),this.count=1}raycast(e,t){e.camera===null&&Re('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Zi.setFromMatrixScale(this.matrixWorld),no.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ji.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Zi.multiplyScalar(-Ji.z);const i=this.material.rotation;let n,r;i!==0&&(r=Math.cos(i),n=Math.sin(i));const s=this.center;Jn(Kn.set(-.5,-.5,0),Ji,s,Zi,n,r),Jn(yn.set(.5,-.5,0),Ji,s,Zi,n,r),Jn(Zn.set(.5,.5,0),Ji,s,Zi,n,r),ea.set(0,0),$r.set(1,0),ta.set(1,1);let a=e.ray.intersectTriangle(Kn,yn,Zn,!1,Mn);if(a===null&&(Jn(yn.set(-.5,.5,0),Ji,s,Zi,n,r),$r.set(0,1),a=e.ray.intersectTriangle(Kn,Zn,yn,!1,Mn),a===null))return;const o=e.ray.origin.distanceTo(Mn);o<e.near||o>e.far||t.push({distance:o,point:Mn.clone(),uv:tn.getInterpolation(Mn,Kn,yn,Zn,ea,$r,ta,new Ue),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Jn(e,t,i,n,r,s){$i.subVectors(e,i).addScalar(.5).multiply(n),r!==void 0?(Sn.x=s*$i.x-r*$i.y,Sn.y=r*$i.x+s*$i.y):Sn.copy($i),e.copy(t),e.x+=Sn.x,e.y+=Sn.y,e.applyMatrix4(no)}h(Jn,"transformVertex");var oi=new F,Qr=new F,$n=new F,vi=new F,jr=new F,Qn=new F,es=new F,vc=class{static{h(this,"Ray")}constructor(e=new F,t=new F(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,oi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=oi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(oi.copy(this.origin).addScaledVector(this.direction,t),oi.distanceToSquared(e))}distanceSqToSegment(e,t,i,n){Qr.copy(e).add(t).multiplyScalar(.5),$n.copy(t).sub(e).normalize(),vi.copy(this.origin).sub(Qr);const r=e.distanceTo(t)*.5,s=-this.direction.dot($n),a=vi.dot(this.direction),o=-vi.dot($n),l=vi.lengthSq(),c=Math.abs(1-s*s);let f,d,u,m;if(c>0)if(f=s*o-a,d=s*a-o,m=r*c,f>=0)if(d>=-m)if(d<=m){const y=1/c;f*=y,d*=y,u=f*(f+s*d+2*a)+d*(s*f+d+2*o)+l}else d=r,f=Math.max(0,-(s*d+a)),u=-f*f+d*(d+2*o)+l;else d=-r,f=Math.max(0,-(s*d+a)),u=-f*f+d*(d+2*o)+l;else d<=-m?(f=Math.max(0,-(-s*r+a)),d=f>0?-r:Math.min(Math.max(-r,-o),r),u=-f*f+d*(d+2*o)+l):d<=m?(f=0,d=Math.min(Math.max(-r,-o),r),u=d*(d+2*o)+l):(f=Math.max(0,-(s*r+a)),d=f>0?r:Math.min(Math.max(-r,-o),r),u=-f*f+d*(d+2*o)+l);else d=s>0?-r:r,f=Math.max(0,-(s*d+a)),u=-f*f+d*(d+2*o)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,f),n&&n.copy(Qr).addScaledVector($n,d),u}intersectSphere(e,t){oi.subVectors(e.center,this.origin);const i=oi.dot(this.direction),n=oi.dot(oi)-i*i,r=e.radius*e.radius;if(n>r)return null;const s=Math.sqrt(r-n),a=i-s,o=i+s;return o<0?null:a<0?this.at(o,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,n,r,s,a,o;const l=1/this.direction.x,c=1/this.direction.y,f=1/this.direction.z,d=this.origin;return l>=0?(i=(e.min.x-d.x)*l,n=(e.max.x-d.x)*l):(i=(e.max.x-d.x)*l,n=(e.min.x-d.x)*l),c>=0?(r=(e.min.y-d.y)*c,s=(e.max.y-d.y)*c):(r=(e.max.y-d.y)*c,s=(e.min.y-d.y)*c),i>s||r>n||((r>i||isNaN(i))&&(i=r),(s<n||isNaN(n))&&(n=s),f>=0?(a=(e.min.z-d.z)*f,o=(e.max.z-d.z)*f):(a=(e.max.z-d.z)*f,o=(e.min.z-d.z)*f),i>o||a>n)||((a>i||i!==i)&&(i=a),(o<n||n!==n)&&(n=o),n<0)?null:this.at(i>=0?i:n,t)}intersectsBox(e){return this.intersectBox(e,oi)!==null}intersectTriangle(e,t,i,n,r){jr.subVectors(t,e),Qn.subVectors(i,e),es.crossVectors(jr,Qn);let s=this.direction.dot(es),a;if(s>0){if(n)return null;a=1}else if(s<0)a=-1,s=-s;else return null;vi.subVectors(this.origin,e);const o=a*this.direction.dot(Qn.crossVectors(vi,Qn));if(o<0)return null;const l=a*this.direction.dot(jr.cross(vi));if(l<0||o+l>s)return null;const c=-a*vi.dot(es);return c<0?null:this.at(c/s,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},yr=class extends Dn{static{h(this,"MeshBasicMaterial")}constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ln,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ia=new lt,Ai=new vc,jn=new ys,na=new F,er=new F,tr=new F,ir=new F,ts=new F,nr=new F,ra=new F,rr=new F,It=class extends ei{static{h(this,"Mesh")}constructor(e=new Vt,t=new yr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){const i=e[t[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let n=0,r=i.length;n<r;n++){const s=i[n].name||String(n);this.morphTargetInfluences.push(0),this.morphTargetDictionary[s]=n}}}}getVertexPosition(e,t){const i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,s=i.morphTargetsRelative;t.fromBufferAttribute(n,e);const a=this.morphTargetInfluences;if(r&&a){nr.set(0,0,0);for(let o=0,l=r.length;o<l;o++){const c=a[o],f=r[o];c!==0&&(ts.fromBufferAttribute(f,e),s?nr.addScaledVector(ts,c):nr.addScaledVector(ts.sub(t),c))}t.add(nr)}return t}raycast(e,t){const i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),jn.copy(i.boundingSphere),jn.applyMatrix4(r),Ai.copy(e.ray).recast(e.near),!(jn.containsPoint(Ai.origin)===!1&&(Ai.intersectSphere(jn,na)===null||Ai.origin.distanceToSquared(na)>(e.far-e.near)**2))&&(ia.copy(r).invert(),Ai.copy(e.ray).applyMatrix4(ia),!(i.boundingBox!==null&&Ai.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Ai)))}_computeIntersections(e,t,i){let n;const r=this.geometry,s=this.material,a=r.index,o=r.attributes.position,l=r.attributes.uv,c=r.attributes.uv1,f=r.attributes.normal,d=r.groups,u=r.drawRange;if(a!==null)if(Array.isArray(s))for(let m=0,y=d.length;m<y;m++){const S=d[m],g=s[S.materialIndex],p=Math.max(S.start,u.start),R=Math.min(a.count,Math.min(S.start+S.count,u.start+u.count));for(let C=p,v=R;C<v;C+=3){const A=a.getX(C),b=a.getX(C+1),w=a.getX(C+2);n=sr(this,g,e,i,l,c,f,A,b,w),n&&(n.faceIndex=Math.floor(C/3),n.face.materialIndex=S.materialIndex,t.push(n))}}else{const m=Math.max(0,u.start),y=Math.min(a.count,u.start+u.count);for(let S=m,g=y;S<g;S+=3){const p=a.getX(S),R=a.getX(S+1),C=a.getX(S+2);n=sr(this,s,e,i,l,c,f,p,R,C),n&&(n.faceIndex=Math.floor(S/3),t.push(n))}}else if(o!==void 0)if(Array.isArray(s))for(let m=0,y=d.length;m<y;m++){const S=d[m],g=s[S.materialIndex],p=Math.max(S.start,u.start),R=Math.min(o.count,Math.min(S.start+S.count,u.start+u.count));for(let C=p,v=R;C<v;C+=3){const A=C,b=C+1,w=C+2;n=sr(this,g,e,i,l,c,f,A,b,w),n&&(n.faceIndex=Math.floor(C/3),n.face.materialIndex=S.materialIndex,t.push(n))}}else{const m=Math.max(0,u.start),y=Math.min(o.count,u.start+u.count);for(let S=m,g=y;S<g;S+=3){const p=S,R=S+1,C=S+2;n=sr(this,s,e,i,l,c,f,p,R,C),n&&(n.faceIndex=Math.floor(S/3),t.push(n))}}}};function _c(e,t,i,n,r,s,a,o){let l;if(t.side===1?l=n.intersectTriangle(a,s,r,!0,o):l=n.intersectTriangle(r,s,a,t.side===0,o),l===null)return null;rr.copy(o),rr.applyMatrix4(e.matrixWorld);const c=i.ray.origin.distanceTo(rr);return c<i.near||c>i.far?null:{distance:c,point:rr.clone(),object:e}}h(_c,"checkIntersection$1");function sr(e,t,i,n,r,s,a,o,l,c){e.getVertexPosition(o,er),e.getVertexPosition(l,tr),e.getVertexPosition(c,ir);const f=_c(e,t,i,n,er,tr,ir,ra);if(f){const d=new F;tn.getBarycoord(ra,er,tr,ir,d),r&&(f.uv=tn.getInterpolatedAttribute(r,o,l,c,d,new Ue)),s&&(f.uv1=tn.getInterpolatedAttribute(s,o,l,c,d,new Ue)),a&&(f.normal=tn.getInterpolatedAttribute(a,o,l,c,d,new F),f.normal.dot(n.direction)>0&&f.normal.multiplyScalar(-1));const u={a:o,b:l,c,normal:new F,materialIndex:0};tn.getNormal(er,tr,ir,u.normal),f.face=u,f.barycoord=d}return f}h(sr,"checkGeometryIntersection");var Mc=class extends zt{static{h(this,"DataTexture")}constructor(e=null,t=1,i=1,n,r,s,a,o,l=bt,c=bt,f,d){super(null,s,a,o,l,c,n,r,f,d),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},is=new F,Sc=new F,yc=new Ne,Ri=class{static{h(this,"Plane")}constructor(e=new F(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,n){return this.normal.set(e,t,i),this.constant=n,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const n=is.subVectors(i,t).cross(Sc.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(n,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){const n=e.delta(is),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(s<0||s>1)?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||yc.getNormalMatrix(e),n=this.coplanarPoint(is).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},wi=new ys,xc=new Ue(.5,.5),ar=new F,ro=class{static{h(this,"Frustum")}constructor(e=new Ri,t=new Ri,i=new Ri,n=new Ri,r=new Ri,s=new Ri){this.planes=[e,t,i,n,r,s]}set(e,t,i,n,r,s){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(n),a[4].copy(r),a[5].copy(s),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=cn,i=!1){const n=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],l=r[3],c=r[4],f=r[5],d=r[6],u=r[7],m=r[8],y=r[9],S=r[10],g=r[11],p=r[12],R=r[13],C=r[14],v=r[15];if(n[0].setComponents(l-s,u-c,g-m,v-p).normalize(),n[1].setComponents(l+s,u+c,g+m,v+p).normalize(),n[2].setComponents(l+a,u+f,g+y,v+R).normalize(),n[3].setComponents(l-a,u-f,g-y,v-R).normalize(),i)n[4].setComponents(o,d,S,C).normalize(),n[5].setComponents(l-o,u-d,g-S,v-C).normalize();else if(n[4].setComponents(l-o,u-d,g-S,v-C).normalize(),t===2e3)n[5].setComponents(l+o,u+d,g+S,v+C).normalize();else if(t===2001)n[5].setComponents(o,d,S,C).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),wi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),wi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(wi)}intersectsSprite(e){wi.center.set(0,0,0);const t=xc.distanceTo(e.center);return wi.radius=.7071067811865476+t,wi.applyMatrix4(e.matrixWorld),this.intersectsSphere(wi)}intersectsSphere(e){const t=this.planes,i=e.center,n=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const n=t[i];if(ar.x=n.normal.x>0?e.max.x:e.min.x,ar.y=n.normal.y>0?e.max.y:e.min.y,ar.z=n.normal.z>0?e.max.z:e.min.z,n.distanceToPoint(ar)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},so=class extends zt{static{h(this,"CubeTexture")}constructor(e=[],t=301,i,n,r,s,a,o,l,c){super(e,t,i,n,r,s,a,o,l,c),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},sa=class extends zt{static{h(this,"CanvasTexture")}constructor(e,t,i,n,r,s,a,o,l){super(e,t,i,n,r,s,a,o,l),this.isCanvasTexture=!0,this.needsUpdate=!0}},un=class extends zt{static{h(this,"DepthTexture")}constructor(e,t,i=Li,n,r,s,a=bt,o=bt,l,c=In,f=1){if(c!==1026&&c!==1027)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");super({width:e,height:t,depth:f},n,r,s,a,o,c,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ss(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Ec=class extends un{static{h(this,"CubeDepthTexture")}constructor(e,t=Li,i=301,n,r,s=bt,a=bt,o,l=In){const c={width:e,height:e,depth:1},f=[c,c,c,c,c,c];super(e,e,t,i,n,r,s,a,o,l),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},ao=class extends zt{static{h(this,"ExternalTexture")}constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},xs=class oo extends Vt{static{h(this,"BoxGeometry")}constructor(t=1,i=1,n=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:i,depth:n,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],f=[],d=[];let u=0,m=0;y("z","y","x",-1,-1,n,i,t,a,s,0),y("z","y","x",1,-1,n,i,-t,a,s,1),y("x","z","y",1,1,t,n,i,r,a,2),y("x","z","y",1,-1,t,n,-i,r,a,3),y("x","y","z",1,-1,t,i,n,r,s,4),y("x","y","z",-1,-1,t,i,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new ct(c,3)),this.setAttribute("normal",new ct(f,3)),this.setAttribute("uv",new ct(d,2));function y(S,g,p,R,C,v,A,b,w,_,T){const z=v/w,P=A/_,k=v/2,Y=A/2,V=b/2,H=w+1,q=_+1;let O=0,ee=0;const te=new F;for(let ie=0;ie<q;ie++){const de=ie*P-Y;for(let fe=0;fe<H;fe++)te[S]=(fe*z-k)*R,te[g]=de*C,te[p]=V,c.push(te.x,te.y,te.z),te[S]=0,te[g]=0,te[p]=b>0?1:-1,f.push(te.x,te.y,te.z),d.push(fe/w),d.push(1-ie/_),O+=1}for(let ie=0;ie<_;ie++)for(let de=0;de<w;de++){const fe=u+de+H*ie,He=u+de+H*(ie+1),Ye=u+(de+1)+H*(ie+1),K=u+(de+1)+H*ie;l.push(fe,He,K),l.push(He,Ye,K),ee+=6}o.addGroup(m,ee,T),m+=ee,u+=O}h(y,"buildPlane")}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new oo(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},gs=class lo extends Vt{static{h(this,"CapsuleGeometry")}constructor(t=1,i=1,n=4,r=8,s=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:i,capSegments:n,radialSegments:r,heightSegments:s},i=Math.max(0,i),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),s=Math.max(1,Math.floor(s));const a=[],o=[],l=[],c=[],f=i/2,d=Math.PI/2*t,u=i,m=2*d+u,y=n*2+s,S=r+1,g=new F,p=new F;for(let R=0;R<=y;R++){let C=0,v=0,A=0,b=0;if(R<=n){const T=R/n,z=T*Math.PI/2;v=-f-t*Math.cos(z),A=t*Math.sin(z),b=-t*Math.cos(z),C=T*d}else if(R<=n+s){const T=(R-n)/s;v=-f+T*i,A=t,b=0,C=d+T*u}else{const T=(R-n-s)/n,z=T*Math.PI/2;v=f+t*Math.sin(z),A=t*Math.cos(z),b=t*Math.sin(z),C=d+u+T*d}const w=Math.max(0,Math.min(1,C/m));let _=0;R===0?_=.5/r:R===y&&(_=-.5/r);for(let T=0;T<=r;T++){const z=T/r,P=z*Math.PI*2,k=Math.sin(P),Y=Math.cos(P);p.x=-A*Y,p.y=v,p.z=A*k,o.push(p.x,p.y,p.z),g.set(-A*Y,b,A*k),g.normalize(),l.push(g.x,g.y,g.z),c.push(z+_,w)}if(R>0){const T=(R-1)*S;for(let z=0;z<r;z++){const P=T+z,k=T+z+1,Y=R*S+z,V=R*S+z+1;a.push(P,k,Y),a.push(k,V,Y)}}}this.setIndex(a),this.setAttribute("position",new ct(o,3)),this.setAttribute("normal",new ct(l,3)),this.setAttribute("uv",new ct(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new lo(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},Tc=class co extends Vt{static{h(this,"CircleGeometry")}constructor(t=1,i=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:i,thetaStart:n,thetaLength:r},i=Math.max(3,i);const s=[],a=[],o=[],l=[],c=new F,f=new Ue;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let d=0,u=3;d<=i;d++,u+=3){const m=n+d/i*r;c.x=t*Math.cos(m),c.y=t*Math.sin(m),a.push(c.x,c.y,c.z),o.push(0,0,1),f.x=(a[u]/t+1)/2,f.y=(a[u+1]/t+1)/2,l.push(f.x,f.y)}for(let d=1;d<=i;d++)s.push(d,d+1,0);this.setIndex(s),this.setAttribute("position",new ct(a,3)),this.setAttribute("normal",new ct(o,3)),this.setAttribute("uv",new ct(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new co(t.radius,t.segments,t.thetaStart,t.thetaLength)}},bc=class ho extends Vt{static{h(this,"LatheGeometry")}constructor(t=[new Ue(0,-.5),new Ue(.5,0),new Ue(0,.5)],i=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:i,phiStart:n,phiLength:r},i=Math.floor(i),r=ze(r,0,Math.PI*2);const s=[],a=[],o=[],l=[],c=[],f=1/i,d=new F,u=new Ue,m=new F,y=new F,S=new F;let g=0,p=0;for(let R=0;R<=t.length-1;R++)switch(R){case 0:g=t[R+1].x-t[R].x,p=t[R+1].y-t[R].y,m.x=p*1,m.y=-g,m.z=p*0,S.copy(m),m.normalize(),l.push(m.x,m.y,m.z);break;case t.length-1:l.push(S.x,S.y,S.z);break;default:g=t[R+1].x-t[R].x,p=t[R+1].y-t[R].y,m.x=p*1,m.y=-g,m.z=p*0,y.copy(m),m.x+=S.x,m.y+=S.y,m.z+=S.z,m.normalize(),l.push(m.x,m.y,m.z),S.copy(y)}for(let R=0;R<=i;R++){const C=n+R*f*r,v=Math.sin(C),A=Math.cos(C);for(let b=0;b<=t.length-1;b++){d.x=t[b].x*v,d.y=t[b].y,d.z=t[b].x*A,a.push(d.x,d.y,d.z),u.x=R/i,u.y=b/(t.length-1),o.push(u.x,u.y);const w=l[3*b+0]*v,_=l[3*b+1],T=l[3*b+0]*A;c.push(w,_,T)}}for(let R=0;R<i;R++)for(let C=0;C<t.length-1;C++){const v=C+R*t.length,A=v,b=v+t.length,w=v+t.length+1,_=v+1;s.push(A,b,_),s.push(w,_,b)}this.setIndex(s),this.setAttribute("position",new ct(a,3)),this.setAttribute("uv",new ct(o,2)),this.setAttribute("normal",new ct(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ho(t.points,t.segments,t.phiStart,t.phiLength)}},Es=class uo extends Vt{static{h(this,"PlaneGeometry")}constructor(t=1,i=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:i,widthSegments:n,heightSegments:r};const s=t/2,a=i/2,o=Math.floor(n),l=Math.floor(r),c=o+1,f=l+1,d=t/o,u=i/l,m=[],y=[],S=[],g=[];for(let p=0;p<f;p++){const R=p*u-a;for(let C=0;C<c;C++){const v=C*d-s;y.push(v,-R,0),S.push(0,0,1),g.push(C/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let R=0;R<o;R++){const C=R+c*p,v=R+c*(p+1),A=R+1+c*(p+1),b=R+1+c*p;m.push(C,v,b),m.push(v,A,b)}this.setIndex(m),this.setAttribute("position",new ct(y,3)),this.setAttribute("normal",new ct(S,3)),this.setAttribute("uv",new ct(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new uo(t.width,t.height,t.widthSegments,t.heightSegments)}},Ac=class fo extends Vt{static{h(this,"SphereGeometry")}constructor(t=1,i=32,n=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:i,heightSegments:n,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},i=Math.max(3,Math.floor(i)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const f=[],d=new F,u=new F,m=[],y=[],S=[],g=[];for(let p=0;p<=n;p++){const R=[],C=p/n,v=a+C*o,A=t*Math.cos(v),b=Math.sqrt(t*t-A*A);let w=0;p===0&&a===0?w=.5/i:p===n&&l===Math.PI&&(w=-.5/i);for(let _=0;_<=i;_++){const T=_/i,z=r+T*s;d.x=-b*Math.cos(z),d.y=A,d.z=b*Math.sin(z),y.push(d.x,d.y,d.z),u.copy(d).normalize(),S.push(u.x,u.y,u.z),g.push(T+w,1-C),R.push(c++)}f.push(R)}for(let p=0;p<n;p++)for(let R=0;R<i;R++){const C=f[p][R+1],v=f[p][R],A=f[p+1][R],b=f[p+1][R+1];(p!==0||a>0)&&m.push(C,v,b),(p!==n-1||l<Math.PI)&&m.push(v,A,b)}this.setIndex(m),this.setAttribute("position",new ct(y,3)),this.setAttribute("normal",new ct(S,3)),this.setAttribute("uv",new ct(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new fo(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function fn(e){const t={};for(const i in e){t[i]={};for(const n in e[i]){const r=e[i][n];if(aa(r))r.isRenderTargetTexture?(Ce("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[i][n]=null):t[i][n]=r.clone();else if(Array.isArray(r))if(aa(r[0])){const s=[];for(let a=0,o=r.length;a<o;a++)s[a]=r[a].clone();t[i][n]=s}else t[i][n]=r.slice();else t[i][n]=r}}return t}h(fn,"cloneUniforms");function Tt(e){const t={};for(let i=0;i<e.length;i++){const n=fn(e[i]);for(const r in n)t[r]=n[r]}return t}h(Tt,"mergeUniforms");function aa(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}h(aa,"isThreeObject");function wc(e){const t=[];for(let i=0;i<e.length;i++)t.push(e[i].clone());return t}h(wc,"cloneUniformsGroups");function po(e){const t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Ge.workingColorSpace}h(po,"getUnlitUniformColorSpace");var Rc={clone:fn,merge:Tt},Cc=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Pc=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,qt=class extends Dn{static{h(this,"ShaderMaterial")}constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Cc,this.fragmentShader=Pc,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=fn(e.uniforms),this.uniformsGroups=wc(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const n in this.uniforms){const r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:"t",value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:"c",value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:"v2",value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:"v3",value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:"m4",value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const i in e.uniforms){const n=e.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=t[n.value]||null;break;case"c":this.uniforms[i].value=new ke().setHex(n.value);break;case"v2":this.uniforms[i].value=new Ue().fromArray(n.value);break;case"v3":this.uniforms[i].value=new F().fromArray(n.value);break;case"v4":this.uniforms[i].value=new ut().fromArray(n.value);break;case"m3":this.uniforms[i].value=new Ne().fromArray(n.value);break;case"m4":this.uniforms[i].value=new lt().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Ic=class extends qt{static{h(this,"RawShaderMaterial")}constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Lc=class extends Dn{static{h(this,"MeshDepthMaterial")}constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Xl,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Uc=class extends Dn{static{h(this,"MeshDistanceMaterial")}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function or(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}h(or,"convertArray");var Nn=class{static{h(this,"Interpolant")}constructor(e,t,i,n){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let i=this._cachedIndex,n=t[i],r=t[i-1];i:{e:{let s;t:{n:if(!(e<n)){for(let a=i+2;;){if(n===void 0){if(e<r)break n;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=n,n=t[++i],e<n)break e}s=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(i=2,r=a);for(let o=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===o)break;if(n=r,r=t[--i-1],e>=r)break e}s=i,i=0;break t}break i}for(;i<s;){const a=i+s>>>1;e<t[a]?s=a:i=a+1}if(n=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,n)}return this.interpolate_(i,r,e,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,n=this.valueSize,r=e*n;for(let s=0;s!==n;++s)t[s]=i[r+s];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Dc=class extends Nn{static{h(this,"CubicInterpolant")}constructor(e,t,i,n){super(e,t,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Os,endingEnd:Os}}intervalChanged_(e,t,i){const n=this.parameterPositions;let r=e-2,s=e+1,a=n[r],o=n[s];if(a===void 0)switch(this.getSettings_().endingStart){case Bs:r=e,a=2*t-i;break;case zs:r=n.length-2,a=t+n[r]-n[r+1];break;default:r=e,a=i}if(o===void 0)switch(this.getSettings_().endingEnd){case Bs:s=e,o=2*i-t;break;case zs:s=1,o=i+n[1]-n[0];break;default:s=e-1,o=t}const l=(i-t)*.5,c=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(o-i),this._offsetPrev=r*c,this._offsetNext=s*c}interpolate_(e,t,i,n){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=e*a,l=o-a,c=this._offsetPrev,f=this._offsetNext,d=this._weightPrev,u=this._weightNext,m=(i-t)/(n-t),y=m*m,S=y*m,g=-d*S+2*d*y-d*m,p=(1+d)*S+(-1.5-2*d)*y+(-.5+d)*m+1,R=(-1-u)*S+(1.5+u)*y+.5*m,C=u*S-u*y;for(let v=0;v!==a;++v)r[v]=g*s[c+v]+p*s[l+v]+R*s[o+v]+C*s[f+v];return r}},Nc=class extends Nn{static{h(this,"LinearInterpolant")}constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=e*a,l=o-a,c=(i-t)/(n-t),f=1-c;for(let d=0;d!==a;++d)r[d]=s[l+d]*f+s[o+d]*c;return r}},Fc=class extends Nn{static{h(this,"DiscreteInterpolant")}constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e){return this.copySampleValue_(e-1)}},Oc=class extends Nn{static{h(this,"BezierInterpolant")}interpolate_(e,t,i,n){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=e*a,l=o-a,c=this.inTangents,f=this.outTangents;if(!c||!f){const m=(i-t)/(n-t),y=1-m;for(let S=0;S!==a;++S)r[S]=s[l+S]*y+s[o+S]*m;return r}const d=a*2,u=e-1;for(let m=0;m!==a;++m){const y=s[l+m],S=s[o+m],g=u*d+m*2,p=f[g],R=f[g+1],C=e*d+m*2,v=c[C],A=c[C+1];let b=(i-t)/(n-t),w,_,T,z,P;for(let k=0;k<8;k++){w=b*b,_=w*b,T=1-b,z=T*T,P=z*T;const Y=P*t+3*z*b*p+3*T*w*v+_*n-i;if(Math.abs(Y)<1e-10)break;const V=3*z*(p-t)+6*T*b*(v-p)+3*w*(n-v);if(Math.abs(V)<1e-10)break;b=b-Y/V,b=Math.max(0,Math.min(1,b))}r[m]=P*y+3*z*b*R+3*T*w*A+_*S}return r}},ti=class{static{h(this,"KeyframeTrack")}constructor(e,t,i,n){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=or(t,this.TimeBufferType),this.values=or(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:or(e.times,Array),values:or(e.values,Array)};const n=e.getInterpolation();n!==e.DefaultInterpolation&&(i.interpolation=n)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Fc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Nc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Dc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new Oc(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case gr:t=this.InterpolantFactoryMethodDiscrete;break;case fs:t=this.InterpolantFactoryMethodLinear;break;case Pr:t=this.InterpolantFactoryMethodSmooth;break;case Fs:t=this.InterpolantFactoryMethodBezier}if(t===void 0){const i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Ce("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return gr;case this.InterpolantFactoryMethodLinear:return fs;case this.InterpolantFactoryMethodSmooth:return Pr;case this.InterpolantFactoryMethodBezier:return Fs}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]*=e}return this}trim(e,t){const i=this.times,n=i.length;let r=0,s=n-1;for(;r!==n&&i[r]<e;)++r;for(;s!==-1&&i[s]>t;)--s;if(++s,r!==0||s!==n){r>=s&&(s=Math.max(s,1),r=s-1);const a=this.getValueSize();this.times=i.slice(r,s),this.values=this.values.slice(r*a,s*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(Re("KeyframeTrack: Invalid value size in track.",this),e=!1);const i=this.times,n=this.values,r=i.length;r===0&&(Re("KeyframeTrack: Track is empty.",this),e=!1);let s=null;for(let a=0;a!==r;a++){const o=i[a];if(typeof o=="number"&&isNaN(o)){Re("KeyframeTrack: Time is not a valid number.",this,a,o),e=!1;break}if(s!==null&&s>o){Re("KeyframeTrack: Out of order keys.",this,a,o,s),e=!1;break}s=o}if(n!==void 0&&Yl(n))for(let a=0,o=n.length;a!==o;++a){const l=n[a];if(isNaN(l)){Re("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===Pr,r=e.length-1;let s=1;for(let a=1;a<r;++a){let o=!1;const l=e[a];if(l!==e[a+1]&&(a!==1||l!==e[0]))if(n)o=!0;else{const c=a*i,f=c-i,d=c+i;for(let u=0;u!==i;++u){const m=t[c+u];if(m!==t[f+u]||m!==t[d+u]){o=!0;break}}}if(o){if(a!==s){e[s]=e[a];const c=a*i,f=s*i;for(let d=0;d!==i;++d)t[f+d]=t[c+d]}++s}}if(r>0){e[s]=e[r];for(let a=r*i,o=s*i,l=0;l!==i;++l)t[o+l]=t[a+l];++s}return s!==e.length?(this.times=e.slice(0,s),this.values=t.slice(0,s*i)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),i=this.constructor,n=new i(this.name,e,t);return n.createInterpolant=this.createInterpolant,n}};ti.prototype.ValueTypeName="";ti.prototype.TimeBufferType=Float32Array;ti.prototype.ValueBufferType=Float32Array;ti.prototype.DefaultInterpolation=fs;var Fn=class extends ti{static{h(this,"BooleanKeyframeTrack")}constructor(e,t,i){super(e,t,i)}};Fn.prototype.ValueTypeName="bool";Fn.prototype.ValueBufferType=Array;Fn.prototype.DefaultInterpolation=gr;Fn.prototype.InterpolantFactoryMethodLinear=void 0;Fn.prototype.InterpolantFactoryMethodSmooth=void 0;var Bc=class extends ti{static{h(this,"ColorKeyframeTrack")}constructor(e,t,i,n){super(e,t,i,n)}};Bc.prototype.ValueTypeName="color";var zc=class extends ti{static{h(this,"NumberKeyframeTrack")}constructor(e,t,i,n){super(e,t,i,n)}};zc.prototype.ValueTypeName="number";var Vc=class extends Nn{static{h(this,"QuaternionLinearInterpolant")}constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=(i-t)/(n-t);let l=e*a;for(let c=l+a;l!==c;l+=4)Ni.slerpFlat(r,0,s,l-a,s,l,o);return r}},mo=class extends ti{static{h(this,"QuaternionKeyframeTrack")}constructor(e,t,i,n){super(e,t,i,n)}InterpolantFactoryMethodLinear(e){return new Vc(this.times,this.values,this.getValueSize(),e)}};mo.prototype.ValueTypeName="quaternion";mo.prototype.InterpolantFactoryMethodSmooth=void 0;var On=class extends ti{static{h(this,"StringKeyframeTrack")}constructor(e,t,i){super(e,t,i)}};On.prototype.ValueTypeName="string";On.prototype.ValueBufferType=Array;On.prototype.DefaultInterpolation=gr;On.prototype.InterpolantFactoryMethodLinear=void 0;On.prototype.InterpolantFactoryMethodSmooth=void 0;var Gc=class extends ti{static{h(this,"VectorKeyframeTrack")}constructor(e,t,i,n){super(e,t,i,n)}};Gc.prototype.ValueTypeName="vector";var Hc=class{static{h(this,"LoadingManager")}constructor(e,t,i){const n=this;let r=!1,s=0,a=0,o;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(c){a++,r===!1&&n.onStart!==void 0&&n.onStart(c,s,a),r=!0},this.itemEnd=function(c){s++,n.onProgress!==void 0&&n.onProgress(c,s,a),s===a&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(c){n.onError!==void 0&&n.onError(c)},this.resolveURL=function(c){return c=c.normalize("NFC"),o?o(c):c},this.setURLModifier=function(c){return o=c,this},this.addHandler=function(c,f){return l.push(c,f),this},this.removeHandler=function(c){const f=l.indexOf(c);return f!==-1&&l.splice(f,2),this},this.getHandler=function(c){for(let f=0,d=l.length;f<d;f+=2){const u=l[f],m=l[f+1];if(u.global&&(u.lastIndex=0),u.test(c))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},kc=new Hc,Wc=class{static{h(this,"Loader")}constructor(e){this.manager=e!==void 0?e:kc,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const i=this;return new Promise(function(n,r){i.load(e,n,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Wc.DEFAULT_MATERIAL_NAME="__DEFAULT";var lr=new F,cr=new Ni,Zt=new F,go=class extends ei{static{h(this,"Camera")}constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new lt,this.projectionMatrix=new lt,this.projectionMatrixInverse=new lt,this.coordinateSystem=cn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(lr,cr,Zt),Zt.x===1&&Zt.y===1&&Zt.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(lr,cr,Zt.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(lr,cr,Zt),Zt.x===1&&Zt.y===1&&Zt.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(lr,cr,Zt.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},_i=new F,oa=new Ue,la=new Ue,Xt=class extends go{static{h(this,"PerspectiveCamera")}constructor(e=50,t=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ps*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Lr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ps*2*Math.atan(Math.tan(Lr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){_i.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(_i.x,_i.y).multiplyScalar(-e/_i.z),_i.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(_i.x,_i.y).multiplyScalar(-e/_i.z)}getViewSize(e,t){return this.getViewBounds(e,oa,la),t.subVectors(la,oa)}setViewOffset(e,t,i,n,r,s){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Lr*.5*this.fov)/this.zoom,i=2*t,n=this.aspect*i,r=-.5*n;const s=this.view;if(this.view!==null&&this.view.enabled){const o=s.fullWidth,l=s.fullHeight;r+=s.offsetX*n/o,t-=s.offsetY*i/l,n*=s.width/o,i*=s.height/l}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ts=class extends go{static{h(this,"OrthographicCamera")}constructor(e=-1,t=1,i=1,n=-1,r=.1,s=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=n,this.near=r,this.far=s,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,n,r,s){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2;let r=i-e,s=i+e,a=n+t,o=n-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,s=r+l*this.view.width,a-=c*this.view.offsetY,o=a-c*this.view.height}this.projectionMatrix.makeOrthographic(r,s,a,o,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Qi=-90,ji=1,Xc=class extends ei{static{h(this,"CubeCamera")}constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const n=new Xt(Qi,ji,e,t);n.layers=this.layers,this.add(n);const r=new Xt(Qi,ji,e,t);r.layers=this.layers,this.add(r);const s=new Xt(Qi,ji,e,t);s.layers=this.layers,this.add(s);const a=new Xt(Qi,ji,e,t);a.layers=this.layers,this.add(a);const o=new Xt(Qi,ji,e,t);o.layers=this.layers,this.add(o);const l=new Xt(Qi,ji,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,n,r,s,a,o]=t;for(const l of t)this.remove(l);if(e===2e3)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),s.up.set(0,0,1),s.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),o.up.set(0,1,0),o.lookAt(0,0,-1);else if(e===2001)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),s.up.set(0,0,-1),s.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),o.up.set(0,-1,0),o.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,s,a,o,l,c]=this.children,f=e.getRenderTarget(),d=e.getActiveCubeFace(),u=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let S=!1;e.isWebGLRenderer===!0?S=e.state.buffers.depth.getReversed():S=e.reversedDepthBuffer,e.setRenderTarget(i,0,n),S&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,n),S&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,2,n),S&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,3,n),S&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,4,n),S&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=y,e.setRenderTarget(i,5,n),S&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(f,d,u),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},qc=class extends Xt{static{h(this,"ArrayCamera")}constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Yc="\\[\\]\\.:\\/",Kc=new RegExp("[\\[\\]\\.:\\/]","g"),bs="[^\\[\\]\\.:\\/]",Zc="[^"+Yc.replace("\\.","")+"]",Jc=/((?:WC+[\/:])*)/.source.replace("WC",bs),$c=/(WCOD+)?/.source.replace("WCOD",Zc),Qc=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",bs),jc=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",bs),eh=new RegExp("^"+Jc+$c+Qc+jc+"$"),th=["material","materials","bones","map"],ih=class{static{h(this,"Composite")}constructor(e,t,i){const n=i||at.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,n)}getValue(e,t){this.bind();const i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(e,t)}setValue(e,t){const i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,r=i.length;n!==r;++n)i[n].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},at=class rn{static{h(this,"PropertyBinding")}constructor(t,i,n){this.path=i,this.parsedPath=n||rn.parseTrackName(i),this.node=rn.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,i,n){return t&&t.isAnimationObjectGroup?new rn.Composite(t,i,n):new rn(t,i,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Kc,"")}static parseTrackName(t){const i=eh.exec(t);if(i===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);const n={nodeName:i[2],objectName:i[3],objectIndex:i[4],propertyName:i[5],propertyIndex:i[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){const s=n.nodeName.substring(r+1);th.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,i){if(i===void 0||i===""||i==="."||i===-1||i===t.name||i===t.uuid)return t;if(t.skeleton){const n=t.skeleton.getBoneByName(i);if(n!==void 0)return n}if(t.children){const n=h(function(s){for(let a=0;a<s.length;a++){const o=s[a];if(o.name===i||o.uuid===i)return o;const l=n(o.children);if(l)return l}return null},"searchNodeSubtree"),r=n(t.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,i){t[i]=this.targetObject[this.propertyName]}_getValue_array(t,i){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)t[i++]=n[r]}_getValue_arrayElement(t,i){t[i]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,i){this.resolvedProperty.toArray(t,i)}_setValue_direct(t,i){this.targetObject[this.propertyName]=t[i]}_setValue_direct_setNeedsUpdate(t,i){this.targetObject[this.propertyName]=t[i],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,i){this.targetObject[this.propertyName]=t[i],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,i){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=t[i++]}_setValue_array_setNeedsUpdate(t,i){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=t[i++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,i){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=t[i++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,i){this.resolvedProperty[this.propertyIndex]=t[i]}_setValue_arrayElement_setNeedsUpdate(t,i){this.resolvedProperty[this.propertyIndex]=t[i],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,i){this.resolvedProperty[this.propertyIndex]=t[i],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,i){this.resolvedProperty.fromArray(t,i)}_setValue_fromArray_setNeedsUpdate(t,i){this.resolvedProperty.fromArray(t,i),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,i){this.resolvedProperty.fromArray(t,i),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,i){this.bind(),this.getValue(t,i)}_setValue_unbound(t,i){this.bind(),this.setValue(t,i)}bind(){let t=this.node;const i=this.parsedPath,n=i.objectName,r=i.propertyName;let s=i.propertyIndex;if(t||(t=rn.findNode(this.rootNode,i.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Ce("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=i.objectIndex;switch(n){case"materials":if(!t.material){Re("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Re("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Re("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let f=0;f<t.length;f++)if(t[f].name===c){c=f;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Re("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Re("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Re("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Re("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}const a=t[r];if(a===void 0){const c=i.nodeName;Re("PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!t.geometry){Re("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Re("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[s]!==void 0&&(s=t.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};at.Composite=ih;at.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};at.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};at.prototype.GetterByBindingType=[at.prototype._getValue_direct,at.prototype._getValue_array,at.prototype._getValue_arrayElement,at.prototype._getValue_toArray];at.prototype.SetterByBindingTypeAndVersioning=[[at.prototype._setValue_direct,at.prototype._setValue_direct_setNeedsUpdate,at.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[at.prototype._setValue_array,at.prototype._setValue_array_setNeedsUpdate,at.prototype._setValue_array_setMatrixWorldNeedsUpdate],[at.prototype._setValue_arrayElement,at.prototype._setValue_arrayElement_setNeedsUpdate,at.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[at.prototype._setValue_fromArray,at.prototype._setValue_fromArray_setNeedsUpdate,at.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var qf=class vo{static{h(this,"Matrix2")}static{vo.prototype.isMatrix2=!0}constructor(t,i,n,r){this.elements=[1,0,0,1],t!==void 0&&this.set(t,i,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(t,i=0){for(let n=0;n<4;n++)this.elements[n]=t[n+i];return this}set(t,i,n,r){const s=this.elements;return s[0]=t,s[2]=i,s[1]=n,s[3]=r,this}};function ca(e,t,i,n){const r=nh(n);switch(i){case al:return e*t;case ll:return e*t/r.components*r.byteLength;case za:return e*t/r.components*r.byteLength;case mr:return e*t*2/r.components*r.byteLength;case Va:return e*t*2/r.components*r.byteLength;case ol:return e*t*3/r.components*r.byteLength;case Pn:return e*t*4/r.components*r.byteLength;case Ga:return e*t*4/r.components*r.byteLength;case cl:case hl:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ul:case fl:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case pl:case gl:return Math.max(e,16)*Math.max(t,8)/4;case dl:case ml:return Math.max(e,8)*Math.max(t,8)/2;case vl:case _l:case Sl:case yl:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Ml:case xl:case El:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Tl:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case bl:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Al:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case wl:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Rl:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Cl:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Pl:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Il:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Ll:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Ul:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Dl:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Nl:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Fl:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Ol:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Bl:case zl:case Vl:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Gl:case Hl:return Math.ceil(e/4)*Math.ceil(t/4)*8;case kl:case Wl:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${i} format.`)}h(ca,"getByteLength");function nh(e){switch(e){case Ii:case tl:return{byteLength:1,components:1};case Da:case il:case Ui:return{byteLength:2,components:1};case Na:case Fa:return{byteLength:2,components:4};case Li:case nl:case Tr:return{byteLength:4,components:1};case rl:case sl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}h(nh,"getTextureTypeByteLength");typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?Ce("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function _o(){let e=null,t=!1,i=null,n=null;function r(s,a){i(s,a),n=e.requestAnimationFrame(r)}return h(r,"onAnimationFrame"),{start:h(function(){t!==!0&&i!==null&&e!==null&&(n=e.requestAnimationFrame(r),t=!0)},"start"),stop:h(function(){e!==null&&e.cancelAnimationFrame(n),t=!1},"stop"),setAnimationLoop:h(function(s){i=s},"setAnimationLoop"),setContext:h(function(s){e=s},"setContext")}}h(_o,"WebGLAnimation");function rh(e){const t=new WeakMap;function i(o,l){const c=o.array,f=o.usage,d=c.byteLength,u=e.createBuffer();e.bindBuffer(l,u),e.bufferData(l,c,f),o.onUploadCallback();let m;if(c instanceof Float32Array)m=e.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)m=e.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?m=e.HALF_FLOAT:m=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=e.SHORT;else if(c instanceof Uint32Array)m=e.UNSIGNED_INT;else if(c instanceof Int32Array)m=e.INT;else if(c instanceof Int8Array)m=e.BYTE;else if(c instanceof Uint8Array)m=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}h(i,"createBuffer");function n(o,l,c){const f=l.array,d=l.updateRanges;if(e.bindBuffer(c,o),d.length===0)e.bufferSubData(c,0,f);else{d.sort((m,y)=>m.start-y.start);let u=0;for(let m=1;m<d.length;m++){const y=d[u],S=d[m];S.start<=y.start+y.count+1?y.count=Math.max(y.count,S.start+S.count-y.start):(++u,d[u]=S)}d.length=u+1;for(let m=0,y=d.length;m<y;m++){const S=d[m];e.bufferSubData(c,S.start*f.BYTES_PER_ELEMENT,f,S.start,S.count)}l.clearUpdateRanges()}l.onUploadCallback()}h(n,"updateBuffer");function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}h(r,"get");function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(e.deleteBuffer(l.buffer),t.delete(o))}h(s,"remove");function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const f=t.get(o);(!f||f.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,i(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return h(a,"update"),{get:r,remove:s,update:a}}h(rh,"WebGLAttributes");var Fe={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:"gl_FragColor = linearToOutputTexel( gl_FragColor );",colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},ce={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ne}},envmap:{envMap:{value:null},envMapRotation:{value:new Ne},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ne}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ne}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ne},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ne},normalScale:{value:new Ue(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ne},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ne}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ne}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ne}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new F},probesMax:{value:new F},probesResolution:{value:new F}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0},uvTransform:{value:new Ne}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new Ue(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}}},$t={basic:{uniforms:Tt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.fog]),vertexShader:Fe.meshbasic_vert,fragmentShader:Fe.meshbasic_frag},lambert:{uniforms:Tt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new ke(0)},envMapIntensity:{value:1}}]),vertexShader:Fe.meshlambert_vert,fragmentShader:Fe.meshlambert_frag},phong:{uniforms:Tt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Fe.meshphong_vert,fragmentShader:Fe.meshphong_frag},standard:{uniforms:Tt([ce.common,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.roughnessmap,ce.metalnessmap,ce.fog,ce.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag},toon:{uniforms:Tt([ce.common,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.gradientmap,ce.fog,ce.lights,{emissive:{value:new ke(0)}}]),vertexShader:Fe.meshtoon_vert,fragmentShader:Fe.meshtoon_frag},matcap:{uniforms:Tt([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,{matcap:{value:null}}]),vertexShader:Fe.meshmatcap_vert,fragmentShader:Fe.meshmatcap_frag},points:{uniforms:Tt([ce.points,ce.fog]),vertexShader:Fe.points_vert,fragmentShader:Fe.points_frag},dashed:{uniforms:Tt([ce.common,ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Fe.linedashed_vert,fragmentShader:Fe.linedashed_frag},depth:{uniforms:Tt([ce.common,ce.displacementmap]),vertexShader:Fe.depth_vert,fragmentShader:Fe.depth_frag},normal:{uniforms:Tt([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,{opacity:{value:1}}]),vertexShader:Fe.meshnormal_vert,fragmentShader:Fe.meshnormal_frag},sprite:{uniforms:Tt([ce.sprite,ce.fog]),vertexShader:Fe.sprite_vert,fragmentShader:Fe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ne},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Fe.background_vert,fragmentShader:Fe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ne}},vertexShader:Fe.backgroundCube_vert,fragmentShader:Fe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Fe.cube_vert,fragmentShader:Fe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Fe.equirect_vert,fragmentShader:Fe.equirect_frag},distance:{uniforms:Tt([ce.common,ce.displacementmap,{referencePosition:{value:new F},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Fe.distance_vert,fragmentShader:Fe.distance_frag},shadow:{uniforms:Tt([ce.lights,ce.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:Fe.shadow_vert,fragmentShader:Fe.shadow_frag}};$t.physical={uniforms:Tt([$t.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ne},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ne},clearcoatNormalScale:{value:new Ue(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ne},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ne},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ne},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ne},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ne},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ne},transmissionSamplerSize:{value:new Ue},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ne},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ne},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ne},anisotropyVector:{value:new Ue},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ne}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag};var hr={r:0,b:0,g:0},sh=new lt,Mo=new Ne;Mo.set(-1,0,0,0,1,0,0,0,1);function ah(e,t,i,n,r,s){const a=new ke(0);let o=r===!0?0:1,l,c,f=null,d=0,u=null;function m(R){let C=R.isScene===!0?R.background:null;if(C&&C.isTexture){const v=R.backgroundBlurriness>0;C=t.get(C,v)}return C}h(m,"getBackground");function y(R){let C=!1;const v=m(R);v===null?g(a,o):v&&v.isColor&&(g(v,1),C=!0);const A=e.xr.getEnvironmentBlendMode();A==="additive"?i.buffers.color.setClear(0,0,0,1,s):A==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,s),(e.autoClear||C)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}h(y,"render");function S(R,C){const v=m(C);v&&(v.isCubeTexture||v.mapping===306)?(c===void 0&&(c=new It(new xs(1,1,1),new qt({name:"BackgroundCubeMaterial",uniforms:fn($t.backgroundCube.uniforms),vertexShader:$t.backgroundCube.vertexShader,fragmentShader:$t.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(A,b,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:h(function(){return this.uniforms.envMap.value},"get")}),n.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=C.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=C.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(sh.makeRotationFromEuler(C.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Mo),c.material.toneMapped=Ge.getTransfer(v.colorSpace)!==_r,(f!==v||d!==v.version||u!==e.toneMapping)&&(c.material.needsUpdate=!0,f=v,d=v.version,u=e.toneMapping),c.layers.enableAll(),R.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new It(new Es(2,2),new qt({name:"BackgroundMaterial",uniforms:fn($t.background.uniforms),vertexShader:$t.background.vertexShader,fragmentShader:$t.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:h(function(){return this.uniforms.t2D.value},"get")}),n.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=C.backgroundIntensity,l.material.toneMapped=Ge.getTransfer(v.colorSpace)!==_r,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(f!==v||d!==v.version||u!==e.toneMapping)&&(l.material.needsUpdate=!0,f=v,d=v.version,u=e.toneMapping),l.layers.enableAll(),R.unshift(l,l.geometry,l.material,0,0,null))}h(S,"addToRenderList");function g(R,C){R.getRGB(hr,po(e)),i.buffers.color.setClear(hr.r,hr.g,hr.b,C,s)}h(g,"setClear");function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return h(p,"dispose"),{getClearColor:h(function(){return a},"getClearColor"),setClearColor:h(function(R,C=1){a.set(R),o=C,g(a,o)},"setClearColor"),getClearAlpha:h(function(){return o},"getClearAlpha"),setClearAlpha:h(function(R){o=R,g(a,o)},"setClearAlpha"),render:y,addToRenderList:S,dispose:p}}h(ah,"WebGLBackground");function oh(e,t){const i=e.getParameter(e.MAX_VERTEX_ATTRIBS),n={},r=u(null);let s=r,a=!1;function o(P,k,Y,V,H){let q=!1;const O=d(P,V,Y,k);s!==O&&(s=O,c(s.object)),q=m(P,V,Y,H),q&&y(P,V,Y,H),H!==null&&t.update(H,e.ELEMENT_ARRAY_BUFFER),(q||a)&&(a=!1,v(P,k,Y,V),H!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(H).buffer))}h(o,"setup");function l(){return e.createVertexArray()}h(l,"createVertexArrayObject");function c(P){return e.bindVertexArray(P)}h(c,"bindVertexArrayObject");function f(P){return e.deleteVertexArray(P)}h(f,"deleteVertexArrayObject");function d(P,k,Y,V){const H=V.wireframe===!0;let q=n[k.id];q===void 0&&(q={},n[k.id]=q);const O=P.isInstancedMesh===!0?P.id:0;let ee=q[O];ee===void 0&&(ee={},q[O]=ee);let te=ee[Y.id];te===void 0&&(te={},ee[Y.id]=te);let ie=te[H];return ie===void 0&&(ie=u(l()),te[H]=ie),ie}h(d,"getBindingState");function u(P){const k=[],Y=[],V=[];for(let H=0;H<i;H++)k[H]=0,Y[H]=0,V[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:k,enabledAttributes:Y,attributeDivisors:V,object:P,attributes:{},index:null}}h(u,"createBindingState");function m(P,k,Y,V){const H=s.attributes,q=k.attributes;let O=0;const ee=Y.getAttributes();for(const te in ee)if(ee[te].location>=0){const ie=H[te];let de=q[te];if(de===void 0&&(te==="instanceMatrix"&&P.instanceMatrix&&(de=P.instanceMatrix),te==="instanceColor"&&P.instanceColor&&(de=P.instanceColor)),ie===void 0||ie.attribute!==de||de&&ie.data!==de.data)return!0;O++}return s.attributesNum!==O||s.index!==V}h(m,"needsUpdate");function y(P,k,Y,V){const H={},q=k.attributes;let O=0;const ee=Y.getAttributes();for(const te in ee)if(ee[te].location>=0){let ie=q[te];ie===void 0&&(te==="instanceMatrix"&&P.instanceMatrix&&(ie=P.instanceMatrix),te==="instanceColor"&&P.instanceColor&&(ie=P.instanceColor));const de={};de.attribute=ie,ie&&ie.data&&(de.data=ie.data),H[te]=de,O++}s.attributes=H,s.attributesNum=O,s.index=V}h(y,"saveCache");function S(){const P=s.newAttributes;for(let k=0,Y=P.length;k<Y;k++)P[k]=0}h(S,"initAttributes");function g(P){p(P,0)}h(g,"enableAttribute");function p(P,k){const Y=s.newAttributes,V=s.enabledAttributes,H=s.attributeDivisors;Y[P]=1,V[P]===0&&(e.enableVertexAttribArray(P),V[P]=1),H[P]!==k&&(e.vertexAttribDivisor(P,k),H[P]=k)}h(p,"enableAttributeAndDivisor");function R(){const P=s.newAttributes,k=s.enabledAttributes;for(let Y=0,V=k.length;Y<V;Y++)k[Y]!==P[Y]&&(e.disableVertexAttribArray(Y),k[Y]=0)}h(R,"disableUnusedAttributes");function C(P,k,Y,V,H,q,O){O===!0?e.vertexAttribIPointer(P,k,Y,H,q):e.vertexAttribPointer(P,k,Y,V,H,q)}h(C,"vertexAttribPointer");function v(P,k,Y,V){S();const H=V.attributes,q=Y.getAttributes(),O=k.defaultAttributeValues;for(const ee in q){const te=q[ee];if(te.location>=0){let ie=H[ee];if(ie===void 0&&(ee==="instanceMatrix"&&P.instanceMatrix&&(ie=P.instanceMatrix),ee==="instanceColor"&&P.instanceColor&&(ie=P.instanceColor)),ie!==void 0){const de=ie.normalized,fe=ie.itemSize,He=t.get(ie);if(He===void 0)continue;const Ye=He.buffer,K=He.type,se=He.bytesPerElement,ve=K===e.INT||K===e.UNSIGNED_INT||ie.gpuType===1013;if(ie.isInterleavedBufferAttribute){const pe=ie.data,Ae=pe.stride,Pe=ie.offset;if(pe.isInstancedInterleavedBuffer){for(let Le=0;Le<te.locationSize;Le++)p(te.location+Le,pe.meshPerAttribute);P.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=pe.meshPerAttribute*pe.count)}else for(let Le=0;Le<te.locationSize;Le++)g(te.location+Le);e.bindBuffer(e.ARRAY_BUFFER,Ye);for(let Le=0;Le<te.locationSize;Le++)C(te.location+Le,fe/te.locationSize,K,de,Ae*se,(Pe+fe/te.locationSize*Le)*se,ve)}else{if(ie.isInstancedBufferAttribute){for(let pe=0;pe<te.locationSize;pe++)p(te.location+pe,ie.meshPerAttribute);P.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let pe=0;pe<te.locationSize;pe++)g(te.location+pe);e.bindBuffer(e.ARRAY_BUFFER,Ye);for(let pe=0;pe<te.locationSize;pe++)C(te.location+pe,fe/te.locationSize,K,de,fe*se,fe/te.locationSize*pe*se,ve)}}else if(O!==void 0){const de=O[ee];if(de!==void 0)switch(de.length){case 2:e.vertexAttrib2fv(te.location,de);break;case 3:e.vertexAttrib3fv(te.location,de);break;case 4:e.vertexAttrib4fv(te.location,de);break;default:e.vertexAttrib1fv(te.location,de)}}}}R()}h(v,"setupVertexAttributes");function A(){T();for(const P in n){const k=n[P];for(const Y in k){const V=k[Y];for(const H in V){const q=V[H];for(const O in q)f(q[O].object),delete q[O];delete V[H]}}delete n[P]}}h(A,"dispose");function b(P){if(n[P.id]===void 0)return;const k=n[P.id];for(const Y in k){const V=k[Y];for(const H in V){const q=V[H];for(const O in q)f(q[O].object),delete q[O];delete V[H]}}delete n[P.id]}h(b,"releaseStatesOfGeometry");function w(P){for(const k in n){const Y=n[k];for(const V in Y){const H=Y[V];if(H[P.id]===void 0)continue;const q=H[P.id];for(const O in q)f(q[O].object),delete q[O];delete H[P.id]}}}h(w,"releaseStatesOfProgram");function _(P){for(const k in n){const Y=n[k],V=P.isInstancedMesh===!0?P.id:0,H=Y[V];if(H!==void 0){for(const q in H){const O=H[q];for(const ee in O)f(O[ee].object),delete O[ee];delete H[q]}delete Y[V],Object.keys(Y).length===0&&delete n[k]}}}h(_,"releaseStatesOfObject");function T(){z(),a=!0,s!==r&&(s=r,c(s.object))}h(T,"reset");function z(){r.geometry=null,r.program=null,r.wireframe=!1}return h(z,"resetDefaultState"),{setup:o,reset:T,resetDefaultState:z,dispose:A,releaseStatesOfGeometry:b,releaseStatesOfObject:_,releaseStatesOfProgram:w,initAttributes:S,enableAttribute:g,disableUnusedAttributes:R}}h(oh,"WebGLBindingStates");function lh(e,t,i){let n;function r(l){n=l}h(r,"setMode");function s(l,c){e.drawArrays(n,l,c),i.update(c,n,1)}h(s,"render");function a(l,c,f){f!==0&&(e.drawArraysInstanced(n,l,c,f),i.update(c,n,f))}h(a,"renderInstances");function o(l,c,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,f);let d=0;for(let u=0;u<f;u++)d+=c[u];i.update(d,n,1)}h(o,"renderMultiDraw"),this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o}h(lh,"WebGLBufferRenderer");function ch(e,t,i,n){let r;function s(){if(r!==void 0)return r;if(t.has("EXT_texture_filter_anisotropic")===!0){const w=t.get("EXT_texture_filter_anisotropic");r=e.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}h(s,"getMaxAnisotropy");function a(w){return!(w!==1023&&n.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}h(a,"textureFormatReadable");function o(w){const _=w===1016&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==1009&&n.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==1015&&!_)}h(o,"textureTypeReadable");function l(w){if(w==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}h(l,"getMaxPrecision");let c=i.precision!==void 0?i.precision:"highp";const f=l(c);f!==c&&(Ce("WebGLRenderer:",c,"not supported, using",f,"instead."),c=f);const d=i.logarithmicDepthBuffer===!0,u=i.reversedDepthBuffer===!0&&t.has("EXT_clip_control");i.reversedDepthBuffer===!0&&u===!1&&Ce("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const m=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),y=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),p=e.getParameter(e.MAX_VERTEX_ATTRIBS),R=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),C=e.getParameter(e.MAX_VARYING_VECTORS),v=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),A=e.getParameter(e.MAX_SAMPLES),b=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:m,maxVertexTextures:y,maxTextureSize:S,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:R,maxVaryings:C,maxFragmentUniforms:v,maxSamples:A,samples:b}}h(ch,"WebGLCapabilities");function hh(e){const t=this;let i=null,n=0,r=!1,s=!1;const a=new Ri,o=new Ne,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){const m=d.length!==0||u||n!==0||r;return r=u,n=d.length,m},this.beginShadows=function(){s=!0,f(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,u){i=f(d,u,0)},this.setState=function(d,u,m){const y=d.clippingPlanes,S=d.clipIntersection,g=d.clipShadows,p=e.get(d);if(!r||y===null||y.length===0||s&&!g)s?f(null):c();else{const R=s?0:n,C=R*4;let v=p.clippingState||null;l.value=v,v=f(y,u,C,m);for(let A=0;A!==C;++A)v[A]=i[A];p.clippingState=v,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=R}};function c(){l.value!==i&&(l.value=i,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}h(c,"resetGlobalState");function f(d,u,m,y){const S=d!==null?d.length:0;let g=null;if(S!==0){if(g=l.value,y!==!0||g===null){const p=m+S*4,R=u.matrixWorldInverse;o.getNormalMatrix(R),(g===null||g.length<p)&&(g=new Float32Array(p));for(let C=0,v=m;C!==S;++C,v+=4)a.copy(d[C]).applyMatrix4(R,o),a.normal.toArray(g,v),g[v+3]=a.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=S,t.numIntersection=0,g}h(f,"projectPlanes")}h(hh,"WebGLClipping");var Si=4,ha=[.125,.215,.35,.446,.526,.582],an=20,uh=256,xn=new Ts,ua=new ke,ns=null,rs=0,ss=0,as=!1,fh=new F,fa=class{static{h(this,"PMREMGenerator")}constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,n=100,r={}){const{size:s=256,position:a=fh}=r;ns=this._renderer.getRenderTarget(),rs=this._renderer.getActiveCubeFace(),ss=this._renderer.getActiveMipmapLevel(),as=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(s);const o=this._allocateTargets();return o.depthBuffer=!0,this._sceneToCubeUV(e,i,n,o,a),t>0&&this._blur(o,0,0,t),this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ma(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=pa(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(ns,rs,ss),this._renderer.xr.enabled=as,e.scissorTest=!1,en(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ns=this._renderer.getRenderTarget(),rs=this._renderer.getActiveCubeFace(),ss=this._renderer.getActiveMipmapLevel(),as=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Pt,minFilter:Pt,generateMipmaps:!1,type:Ui,format:Pn,colorSpace:ds,depthBuffer:!1},n=da(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=da(e,t,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=dh(r)),this._blurMaterial=mh(r,e,t),this._ggxMaterial=ph(r,e,t)}return n}_compileMaterial(e){const t=new It(new Vt,e);this._renderer.compile(t,xn)}_sceneToCubeUV(e,t,i,n,r){const s=new Xt(90,1,t,i),a=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],l=this._renderer,c=l.autoClear,f=l.toneMapping;l.getClearColor(ua),l.toneMapping=0,l.autoClear=!1,l.state.buffers.depth.getReversed()&&(l.setRenderTarget(n),l.clearDepth(),l.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new It(new xs,new yr({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1})));const d=this._backgroundBox,u=d.material;let m=!1;const y=e.background;y?y.isColor&&(u.color.copy(y),e.background=null,m=!0):(u.color.copy(ua),m=!0);for(let S=0;S<6;S++){const g=S%3;g===0?(s.up.set(0,a[S],0),s.position.set(r.x,r.y,r.z),s.lookAt(r.x+o[S],r.y,r.z)):g===1?(s.up.set(0,0,a[S]),s.position.set(r.x,r.y,r.z),s.lookAt(r.x,r.y+o[S],r.z)):(s.up.set(0,a[S],0),s.position.set(r.x,r.y,r.z),s.lookAt(r.x,r.y,r.z+o[S]));const p=this._cubeSize;en(n,g*p,S>2?p:0,p,p),l.setRenderTarget(n),m&&l.render(d,s),l.render(e,s)}l.toneMapping=f,l.autoClear=c,e.background=y}_textureToCubeUV(e,t){const i=this._renderer,n=e.mapping===301||e.mapping===302;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=ma()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=pa());const r=n?this._cubemapMaterial:this._equirectMaterial,s=this._lodMeshes[0];s.material=r;const a=r.uniforms;a.envMap.value=e;const o=this._cubeSize;en(t,0,0,3*o,2*o),i.setRenderTarget(t),i.render(s,xn)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const n=this._lodMeshes.length;for(let r=1;r<n;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){const n=this._renderer,r=this._pingPongRenderTarget,s=this._ggxMaterial,a=this._lodMeshes[i];a.material=s;const o=s.uniforms,l=i/(this._lodMeshes.length-1),c=t/(this._lodMeshes.length-1),f=Math.sqrt(l*l-c*c)*(0+l*1.25),{_lodMax:d}=this,u=this._sizeLods[i],m=3*u*(i>d-Si?i-d+Si:0),y=4*(this._cubeSize-u);o.envMap.value=e.texture,o.roughness.value=f,o.mipInt.value=d-t,en(r,m,y,3*u,2*u),n.setRenderTarget(r),n.render(a,xn),o.envMap.value=r.texture,o.roughness.value=0,o.mipInt.value=d-i,en(e,m,y,3*u,2*u),n.setRenderTarget(e),n.render(a,xn)}_blur(e,t,i,n,r){const s=this._pingPongRenderTarget;this._halfBlur(e,s,t,i,n,"latitudinal",r),this._halfBlur(s,e,i,i,n,"longitudinal",r)}_halfBlur(e,t,i,n,r,s,a){const o=this._renderer,l=this._blurMaterial;s!=="latitudinal"&&s!=="longitudinal"&&Re("blur direction must be either latitudinal or longitudinal!");const c=3,f=this._lodMeshes[n];f.material=l;const d=l.uniforms,u=this._sizeLods[i]-1,m=isFinite(r)?Math.PI/(2*u):2*Math.PI/39,y=r/m,S=isFinite(r)?1+Math.floor(c*y):an;S>an&&Ce(`sigmaRadians, ${r}, is too large and will clip, as it requested ${S} samples when the maximum is set to ${an}`);const g=[];let p=0;for(let v=0;v<an;++v){const A=v/y,b=Math.exp(-A*A/2);g.push(b),v===0?p+=b:v<S&&(p+=2*b)}for(let v=0;v<g.length;v++)g[v]=g[v]/p;d.envMap.value=e.texture,d.samples.value=S,d.weights.value=g,d.latitudinal.value=s==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:R}=this;d.dTheta.value=m,d.mipInt.value=R-i;const C=this._sizeLods[n];en(t,3*C*(n>R-Si?n-R+Si:0),4*(this._cubeSize-C),3*C,2*C),o.setRenderTarget(t),o.render(f,xn)}};function dh(e){const t=[],i=[],n=[];let r=e;const s=e-Si+1+ha.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);t.push(o);let l=1/o;a>e-Si?l=ha[a-e+Si-1]:a===0&&(l=0),i.push(l);const c=1/(o-2),f=-c,d=1+c,u=[f,f,d,f,d,d,f,f,d,d,f,d],m=6,y=3,S=2,g=1,p=new Float32Array(108),R=new Float32Array(72),C=new Float32Array(36);for(let A=0;A<m;A++){const b=A%3*2/3-1,w=A>2?0:-1,_=[b,w,0,b+2/3,w,0,b+2/3,w+1,0,b,w,0,b+2/3,w+1,0,b,w+1,0];p.set(_,18*A),R.set(u,12*A);const T=[A,A,A,A,A,A];C.set(T,6*A)}const v=new Vt;v.setAttribute("position",new Bt(p,y)),v.setAttribute("uv",new Bt(R,S)),v.setAttribute("faceIndex",new Bt(C,g)),n.push(new It(v,null)),r>Si&&r--}return{lodMeshes:n,sizeLods:t,sigmas:i}}h(dh,"_createPlanes");function da(e,t,i){const n=new jt(e,t,i);return n.texture.mapping=306,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}h(da,"_createRenderTarget");function en(e,t,i,n,r){e.viewport.set(t,i,n,r),e.scissor.set(t,i,n,r)}h(en,"_setViewport");function ph(e,t,i){return new qt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:uh,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/i,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:br(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}h(ph,"_getGGXShader");function mh(e,t,i){const n=new Float32Array(an),r=new F(0,1,0);return new qt({name:"SphericalGaussianBlur",defines:{n:an,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/i,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:br(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}h(mh,"_getBlurShader");function pa(){return new qt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:br(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}h(pa,"_getEquirectMaterial");function ma(){return new qt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:br(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}h(ma,"_getCubemapMaterial");function br(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}h(br,"_getCommonVertexShader");var So=class extends jt{static{h(this,"WebGLCubeRenderTarget")}constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},n=[i,i,i,i,i,i];this.texture=new so(n),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},n=new xs(5,5,5),r=new qt({name:"CubemapFromEquirect",uniforms:fn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:1,blending:0});r.uniforms.tEquirect.value=t;const s=new It(n,r),a=t.minFilter;return t.minFilter===1008&&(t.minFilter=Pt),new Xc(1,10,this).update(e,s),t.minFilter=a,s.geometry.dispose(),s.material.dispose(),this}clear(e,t=!0,i=!0,n=!0){const r=e.getRenderTarget();for(let s=0;s<6;s++)e.setRenderTarget(this,s),e.clear(t,i,n);e.setRenderTarget(r)}};function gh(e){let t=new WeakMap,i=new WeakMap,n=null;function r(u,m=!1){return u==null?null:m?a(u):s(u)}h(r,"get");function s(u){if(u&&u.isTexture){const m=u.mapping;if(m===303||m===304)if(t.has(u)){const y=t.get(u).texture;return o(y,u.mapping)}else{const y=u.image;if(y&&y.height>0){const S=new So(y.height);return S.fromEquirectangularTexture(e,u),t.set(u,S),u.addEventListener("dispose",c),o(S.texture,u.mapping)}else return null}}return u}h(s,"getCube");function a(u){if(u&&u.isTexture){const m=u.mapping,y=m===303||m===304,S=m===301||m===302;if(y||S){let g=i.get(u);const p=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return n===null&&(n=new fa(e)),g=y?n.fromEquirectangular(u,g):n.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,i.set(u,g),g.texture;if(g!==void 0)return g.texture;{const R=u.image;return y&&R&&R.height>0||S&&R&&l(R)?(n===null&&(n=new fa(e)),g=y?n.fromEquirectangular(u):n.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,i.set(u,g),u.addEventListener("dispose",f),g.texture):null}}}return u}h(a,"getPMREM");function o(u,m){return m===303?u.mapping=301:m===304&&(u.mapping=302),u}h(o,"mapTextureMapping");function l(u){let m=0;const y=6;for(let S=0;S<y;S++)u[S]!==void 0&&m++;return m===y}h(l,"isCubeTextureComplete");function c(u){const m=u.target;m.removeEventListener("dispose",c);const y=t.get(m);y!==void 0&&(t.delete(m),y.dispose())}h(c,"onCubemapDispose");function f(u){const m=u.target;m.removeEventListener("dispose",f);const y=i.get(m);y!==void 0&&(i.delete(m),y.dispose())}h(f,"onPMREMDispose");function d(){t=new WeakMap,i=new WeakMap,n!==null&&(n.dispose(),n=null)}return h(d,"dispose"),{get:r,dispose:d}}h(gh,"WebGLEnvironments");function vh(e){const t={};function i(n){if(t[n]!==void 0)return t[n];const r=e.getExtension(n);return t[n]=r,r}return h(i,"getExtension"),{has:h(function(n){return i(n)!==null},"has"),init:h(function(){i("EXT_color_buffer_float"),i("WEBGL_clip_cull_distance"),i("OES_texture_float_linear"),i("EXT_color_buffer_half_float"),i("WEBGL_multisampled_render_to_texture"),i("WEBGL_render_shared_exponent")},"init"),get:h(function(n){const r=i(n);return r===null&&on("WebGLRenderer: "+n+" extension not supported."),r},"get")}}h(vh,"WebGLExtensions");function _h(e,t,i,n){const r={},s=new WeakMap;function a(d){const u=d.target;u.index!==null&&t.remove(u.index);for(const y in u.attributes)t.remove(u.attributes[y]);u.removeEventListener("dispose",a),delete r[u.id];const m=s.get(u);m&&(t.remove(m),s.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,i.memory.geometries--}h(a,"onGeometryDispose");function o(d,u){return r[u.id]===!0||(u.addEventListener("dispose",a),r[u.id]=!0,i.memory.geometries++),u}h(o,"get");function l(d){const u=d.attributes;for(const m in u)t.update(u[m],e.ARRAY_BUFFER)}h(l,"update");function c(d){const u=[],m=d.index,y=d.attributes.position;let S=0;if(y===void 0)return;if(m!==null){const R=m.array;S=m.version;for(let C=0,v=R.length;C<v;C+=3){const A=R[C+0],b=R[C+1],w=R[C+2];u.push(A,b,b,w,w,A)}}else{const R=y.array;S=y.version;for(let C=0,v=R.length/3-1;C<v;C+=3){const A=C+0,b=C+1,w=C+2;u.push(A,b,b,w,w,A)}}const g=new(y.count>=65535?ja:Qa)(u,1);g.version=S;const p=s.get(d);p&&t.remove(p),s.set(d,g)}h(c,"updateWireframeAttribute");function f(d){const u=s.get(d);if(u){const m=d.index;m!==null&&u.version<m.version&&c(d)}else c(d);return s.get(d)}return h(f,"getWireframeAttribute"),{get:o,update:l,getWireframeAttribute:f}}h(_h,"WebGLGeometries");function Mh(e,t,i){let n;function r(d){n=d}h(r,"setMode");let s,a;function o(d){s=d.type,a=d.bytesPerElement}h(o,"setIndex");function l(d,u){e.drawElements(n,u,s,d*a),i.update(u,n,1)}h(l,"render");function c(d,u,m){m!==0&&(e.drawElementsInstanced(n,u,s,d*a,m),i.update(u,n,m))}h(c,"renderInstances");function f(d,u,m){if(m===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,s,d,0,m);let y=0;for(let S=0;S<m;S++)y+=u[S];i.update(y,n,1)}h(f,"renderMultiDraw"),this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=f}h(Mh,"WebGLIndexedBufferRenderer");function Sh(e){const t={geometries:0,textures:0},i={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(i.calls++,a){case e.TRIANGLES:i.triangles+=o*(s/3);break;case e.LINES:i.lines+=o*(s/2);break;case e.LINE_STRIP:i.lines+=o*(s-1);break;case e.LINE_LOOP:i.lines+=o*s;break;case e.POINTS:i.points+=o*s;break;default:Re("WebGLInfo: Unknown draw mode:",a)}}h(n,"update");function r(){i.calls=0,i.triangles=0,i.points=0,i.lines=0}return h(r,"reset"),{memory:t,render:i,programs:null,autoReset:!0,reset:r,update:n}}h(Sh,"WebGLInfo");function yh(e,t,i){const n=new WeakMap,r=new ut;function s(a,o,l){const c=a.morphTargetInfluences,f=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=f!==void 0?f.length:0;let u=n.get(o);if(u===void 0||u.count!==d){let T=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",T)};h(T,"disposeTexture"),u!==void 0&&u.texture.dispose();const m=o.morphAttributes.position!==void 0,y=o.morphAttributes.normal!==void 0,S=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],R=o.morphAttributes.color||[];let C=0;m===!0&&(C=1),y===!0&&(C=2),S===!0&&(C=3);let v=o.attributes.position.count*C,A=1;v>t.maxTextureSize&&(A=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);const b=new Float32Array(v*A*4*d),w=new Ka(b,v,A,d);w.type=Tr,w.needsUpdate=!0;const _=C*4;for(let z=0;z<d;z++){const P=g[z],k=p[z],Y=R[z],V=v*A*4*z;for(let H=0;H<P.count;H++){const q=H*_;m===!0&&(r.fromBufferAttribute(P,H),b[V+q+0]=r.x,b[V+q+1]=r.y,b[V+q+2]=r.z,b[V+q+3]=0),y===!0&&(r.fromBufferAttribute(k,H),b[V+q+4]=r.x,b[V+q+5]=r.y,b[V+q+6]=r.z,b[V+q+7]=0),S===!0&&(r.fromBufferAttribute(Y,H),b[V+q+8]=r.x,b[V+q+9]=r.y,b[V+q+10]=r.z,b[V+q+11]=Y.itemSize===4?r.w:1)}}u={count:d,texture:w,size:new Ue(v,A)},n.set(o,u),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",a.morphTexture,i);else{let m=0;for(let S=0;S<c.length;S++)m+=c[S];const y=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(e,"morphTargetBaseInfluence",y),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",u.texture,i),l.getUniforms().setValue(e,"morphTargetsTextureSize",u.size)}return h(s,"update"),{update:s}}h(yh,"WebGLMorphtargets");function xh(e,t,i,n,r){let s=new WeakMap;function a(c){const f=r.render.frame,d=c.geometry,u=t.get(c,d);if(s.get(u)!==f&&(t.update(u),s.set(u,f)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),s.get(c)!==f&&(i.update(c.instanceMatrix,e.ARRAY_BUFFER),c.instanceColor!==null&&i.update(c.instanceColor,e.ARRAY_BUFFER),s.set(c,f))),c.isSkinnedMesh){const m=c.skeleton;s.get(m)!==f&&(m.update(),s.set(m,f))}return u}h(a,"update");function o(){s=new WeakMap}h(o,"dispose");function l(c){const f=c.target;f.removeEventListener("dispose",l),n.releaseStatesOfObject(f),i.remove(f.instanceMatrix),f.instanceColor!==null&&i.remove(f.instanceColor)}return h(l,"onInstancedMeshDispose"),{update:a,dispose:o}}h(xh,"WebGLObjects");var Eh={1:"LINEAR_TONE_MAPPING",2:"REINHARD_TONE_MAPPING",3:"CINEON_TONE_MAPPING",4:"ACES_FILMIC_TONE_MAPPING",6:"AGX_TONE_MAPPING",7:"NEUTRAL_TONE_MAPPING",5:"CUSTOM_TONE_MAPPING"};function Th(e,t,i,n,r,s){const a=new jt(t,i,{type:e,depthBuffer:r,stencilBuffer:s,samples:n?4:0,depthTexture:r?new un(t,i):void 0}),o=new jt(t,i,{type:Ui,depthBuffer:!1,stencilBuffer:!1}),l=new Vt;l.setAttribute("position",new ct([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new ct([0,2,0,0,2,0],2));const c=new Ic({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new It(l,c),d=new Ts(-1,1,1,-1,0,1);let u=null,m=null,y=!1,S,g=null,p=[],R=!1;this.setSize=function(C,v){a.setSize(C,v),o.setSize(C,v);for(let A=0;A<p.length;A++){const b=p[A];b.setSize&&b.setSize(C,v)}},this.setEffects=function(C){p=C,R=p.length>0&&p[0].isRenderPass===!0;const v=a.width,A=a.height;for(let b=0;b<p.length;b++){const w=p[b];w.setSize&&w.setSize(v,A)}},this.begin=function(C,v){if(y||C.toneMapping===0&&p.length===0)return!1;if(g=v,v!==null){const A=v.width,b=v.height;(a.width!==A||a.height!==b)&&this.setSize(A,b)}return R===!1&&C.setRenderTarget(a),S=C.toneMapping,C.toneMapping=0,!0},this.hasRenderPass=function(){return R},this.end=function(C,v){C.toneMapping=S,y=!0;let A=a,b=o;for(let w=0;w<p.length;w++){const _=p[w];if(_.enabled!==!1&&(_.render(C,b,A,v),_.needsSwap!==!1)){const T=A;A=b,b=T}}if(u!==C.outputColorSpace||m!==C.toneMapping){u=C.outputColorSpace,m=C.toneMapping,c.defines={},Ge.getTransfer(u)==="srgb"&&(c.defines.SRGB_TRANSFER="");const w=Eh[m];w&&(c.defines[w]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=A.texture,C.setRenderTarget(g),C.render(f,d),g=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),l.dispose(),c.dispose()}}h(Th,"WebGLOutput");var yo=new zt,vs=new un(1,1),xo=new Ka,Eo=new nc,To=new so,ga=[],va=[],_a=new Float32Array(16),Ma=new Float32Array(9),Sa=new Float32Array(4);function dn(e,t,i){const n=e[0];if(n<=0||n>0)return e;const r=t*i;let s=ga[r];if(s===void 0&&(s=new Float32Array(r),ga[r]=s),t!==0){n.toArray(s,0);for(let a=1,o=0;a!==t;++a)o+=i,e[a].toArray(s,o)}return s}h(dn,"flatten");function dt(e,t){if(e.length!==t.length)return!1;for(let i=0,n=e.length;i<n;i++)if(e[i]!==t[i])return!1;return!0}h(dt,"arraysEqual");function pt(e,t){for(let i=0,n=t.length;i<n;i++)e[i]=t[i]}h(pt,"copyArray");function Ar(e,t){let i=va[t];i===void 0&&(i=new Int32Array(t),va[t]=i);for(let n=0;n!==t;++n)i[n]=e.allocateTextureUnit();return i}h(Ar,"allocTexUnits");function bh(e,t){const i=this.cache;i[0]!==t&&(e.uniform1f(this.addr,t),i[0]=t)}h(bh,"setValueV1f");function Ah(e,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(dt(i,t))return;e.uniform2fv(this.addr,t),pt(i,t)}}h(Ah,"setValueV2f");function wh(e,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else if(t.r!==void 0)(i[0]!==t.r||i[1]!==t.g||i[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),i[0]=t.r,i[1]=t.g,i[2]=t.b);else{if(dt(i,t))return;e.uniform3fv(this.addr,t),pt(i,t)}}h(wh,"setValueV3f");function Rh(e,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(dt(i,t))return;e.uniform4fv(this.addr,t),pt(i,t)}}h(Rh,"setValueV4f");function Ch(e,t){const i=this.cache,n=t.elements;if(n===void 0){if(dt(i,t))return;e.uniformMatrix2fv(this.addr,!1,t),pt(i,t)}else{if(dt(i,n))return;Sa.set(n),e.uniformMatrix2fv(this.addr,!1,Sa),pt(i,n)}}h(Ch,"setValueM2");function Ph(e,t){const i=this.cache,n=t.elements;if(n===void 0){if(dt(i,t))return;e.uniformMatrix3fv(this.addr,!1,t),pt(i,t)}else{if(dt(i,n))return;Ma.set(n),e.uniformMatrix3fv(this.addr,!1,Ma),pt(i,n)}}h(Ph,"setValueM3");function Ih(e,t){const i=this.cache,n=t.elements;if(n===void 0){if(dt(i,t))return;e.uniformMatrix4fv(this.addr,!1,t),pt(i,t)}else{if(dt(i,n))return;_a.set(n),e.uniformMatrix4fv(this.addr,!1,_a),pt(i,n)}}h(Ih,"setValueM4");function Lh(e,t){const i=this.cache;i[0]!==t&&(e.uniform1i(this.addr,t),i[0]=t)}h(Lh,"setValueV1i");function Uh(e,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(dt(i,t))return;e.uniform2iv(this.addr,t),pt(i,t)}}h(Uh,"setValueV2i");function Dh(e,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else{if(dt(i,t))return;e.uniform3iv(this.addr,t),pt(i,t)}}h(Dh,"setValueV3i");function Nh(e,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(dt(i,t))return;e.uniform4iv(this.addr,t),pt(i,t)}}h(Nh,"setValueV4i");function Fh(e,t){const i=this.cache;i[0]!==t&&(e.uniform1ui(this.addr,t),i[0]=t)}h(Fh,"setValueV1ui");function Oh(e,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(dt(i,t))return;e.uniform2uiv(this.addr,t),pt(i,t)}}h(Oh,"setValueV2ui");function Bh(e,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else{if(dt(i,t))return;e.uniform3uiv(this.addr,t),pt(i,t)}}h(Bh,"setValueV3ui");function zh(e,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(dt(i,t))return;e.uniform4uiv(this.addr,t),pt(i,t)}}h(zh,"setValueV4ui");function Vh(e,t,i){const n=this.cache,r=i.allocateTextureUnit();n[0]!==r&&(e.uniform1i(this.addr,r),n[0]=r);let s;this.type===e.SAMPLER_2D_SHADOW?(vs.compareFunction=i.isReversedDepthBuffer()?518:515,s=vs):s=yo,i.setTexture2D(t||s,r)}h(Vh,"setValueT1");function Gh(e,t,i){const n=this.cache,r=i.allocateTextureUnit();n[0]!==r&&(e.uniform1i(this.addr,r),n[0]=r),i.setTexture3D(t||Eo,r)}h(Gh,"setValueT3D1");function Hh(e,t,i){const n=this.cache,r=i.allocateTextureUnit();n[0]!==r&&(e.uniform1i(this.addr,r),n[0]=r),i.setTextureCube(t||To,r)}h(Hh,"setValueT6");function kh(e,t,i){const n=this.cache,r=i.allocateTextureUnit();n[0]!==r&&(e.uniform1i(this.addr,r),n[0]=r),i.setTexture2DArray(t||xo,r)}h(kh,"setValueT2DArray1");function Wh(e){switch(e){case 5126:return bh;case 35664:return Ah;case 35665:return wh;case 35666:return Rh;case 35674:return Ch;case 35675:return Ph;case 35676:return Ih;case 5124:case 35670:return Lh;case 35667:case 35671:return Uh;case 35668:case 35672:return Dh;case 35669:case 35673:return Nh;case 5125:return Fh;case 36294:return Oh;case 36295:return Bh;case 36296:return zh;case 35678:case 36198:case 36298:case 36306:case 35682:return Vh;case 35679:case 36299:case 36307:return Gh;case 35680:case 36300:case 36308:case 36293:return Hh;case 36289:case 36303:case 36311:case 36292:return kh}}h(Wh,"getSingularSetter");function Xh(e,t){e.uniform1fv(this.addr,t)}h(Xh,"setValueV1fArray");function qh(e,t){const i=dn(t,this.size,2);e.uniform2fv(this.addr,i)}h(qh,"setValueV2fArray");function Yh(e,t){const i=dn(t,this.size,3);e.uniform3fv(this.addr,i)}h(Yh,"setValueV3fArray");function Kh(e,t){const i=dn(t,this.size,4);e.uniform4fv(this.addr,i)}h(Kh,"setValueV4fArray");function Zh(e,t){const i=dn(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,i)}h(Zh,"setValueM2Array");function Jh(e,t){const i=dn(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,i)}h(Jh,"setValueM3Array");function $h(e,t){const i=dn(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,i)}h($h,"setValueM4Array");function Qh(e,t){e.uniform1iv(this.addr,t)}h(Qh,"setValueV1iArray");function jh(e,t){e.uniform2iv(this.addr,t)}h(jh,"setValueV2iArray");function eu(e,t){e.uniform3iv(this.addr,t)}h(eu,"setValueV3iArray");function tu(e,t){e.uniform4iv(this.addr,t)}h(tu,"setValueV4iArray");function iu(e,t){e.uniform1uiv(this.addr,t)}h(iu,"setValueV1uiArray");function nu(e,t){e.uniform2uiv(this.addr,t)}h(nu,"setValueV2uiArray");function ru(e,t){e.uniform3uiv(this.addr,t)}h(ru,"setValueV3uiArray");function su(e,t){e.uniform4uiv(this.addr,t)}h(su,"setValueV4uiArray");function au(e,t,i){const n=this.cache,r=t.length,s=Ar(i,r);dt(n,s)||(e.uniform1iv(this.addr,s),pt(n,s));let a;this.type===e.SAMPLER_2D_SHADOW?a=vs:a=yo;for(let o=0;o!==r;++o)i.setTexture2D(t[o]||a,s[o])}h(au,"setValueT1Array");function ou(e,t,i){const n=this.cache,r=t.length,s=Ar(i,r);dt(n,s)||(e.uniform1iv(this.addr,s),pt(n,s));for(let a=0;a!==r;++a)i.setTexture3D(t[a]||Eo,s[a])}h(ou,"setValueT3DArray");function lu(e,t,i){const n=this.cache,r=t.length,s=Ar(i,r);dt(n,s)||(e.uniform1iv(this.addr,s),pt(n,s));for(let a=0;a!==r;++a)i.setTextureCube(t[a]||To,s[a])}h(lu,"setValueT6Array");function cu(e,t,i){const n=this.cache,r=t.length,s=Ar(i,r);dt(n,s)||(e.uniform1iv(this.addr,s),pt(n,s));for(let a=0;a!==r;++a)i.setTexture2DArray(t[a]||xo,s[a])}h(cu,"setValueT2DArrayArray");function hu(e){switch(e){case 5126:return Xh;case 35664:return qh;case 35665:return Yh;case 35666:return Kh;case 35674:return Zh;case 35675:return Jh;case 35676:return $h;case 5124:case 35670:return Qh;case 35667:case 35671:return jh;case 35668:case 35672:return eu;case 35669:case 35673:return tu;case 5125:return iu;case 36294:return nu;case 36295:return ru;case 36296:return su;case 35678:case 36198:case 36298:case 36306:case 35682:return au;case 35679:case 36299:case 36307:return ou;case 35680:case 36300:case 36308:case 36293:return lu;case 36289:case 36303:case 36311:case 36292:return cu}}h(hu,"getPureArraySetter");var uu=class{static{h(this,"SingleUniform")}constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Wh(t.type)}},fu=class{static{h(this,"PureArrayUniform")}constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=hu(t.type)}},du=class{static{h(this,"StructuredUniform")}constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const n=this.seq;for(let r=0,s=n.length;r!==s;++r){const a=n[r];a.setValue(e,t[a.id],i)}}},os=/(\w+)(\])?(\[|\.)?/g;function ya(e,t){e.seq.push(t),e.map[t.id]=t}h(ya,"addUniform");function pu(e,t,i){const n=e.name,r=n.length;for(os.lastIndex=0;;){const s=os.exec(n),a=os.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===r){ya(i,c===void 0?new uu(o,e,t):new fu(o,e,t));break}else{let f=i.map[o];f===void 0&&(f=new du(o),ya(i,f)),i=f}}}h(pu,"parseUniform");var pr=class{static{h(this,"WebGLUniforms")}constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const a=e.getActiveUniform(t,s);pu(a,e.getUniformLocation(t,a.name),this)}const n=[],r=[];for(const s of this.seq)s.type===e.SAMPLER_2D_SHADOW||s.type===e.SAMPLER_CUBE_SHADOW||s.type===e.SAMPLER_2D_ARRAY_SHADOW?n.push(s):r.push(s);n.length>0&&(this.seq=n.concat(r))}setValue(e,t,i,n){const r=this.map[t];r!==void 0&&r.setValue(e,i,n)}setOptional(e,t,i){const n=t[i];n!==void 0&&this.setValue(e,i,n)}static upload(e,t,i,n){for(let r=0,s=t.length;r!==s;++r){const a=t[r],o=i[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,n)}}static seqWithValue(e,t){const i=[];for(let n=0,r=e.length;n!==r;++n){const s=e[n];s.id in t&&i.push(s)}return i}};function xa(e,t,i){const n=e.createShader(t);return e.shaderSource(n,i),e.compileShader(n),n}h(xa,"WebGLShader");var mu=37297,gu=0;function vu(e,t){const i=e.split(`
`),n=[],r=Math.max(t-6,0),s=Math.min(t+6,i.length);for(let a=r;a<s;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${i[a]}`)}return n.join(`
`)}h(vu,"handleSource");var Ea=new Ne;function _u(e){Ge._getMatrix(Ea,Ge.workingColorSpace,e);const t=`mat3( ${Ea.elements.map(i=>i.toFixed(4))} )`;switch(Ge.getTransfer(e)){case vr:return[t,"LinearTransferOETF"];case _r:return[t,"sRGBTransferOETF"];default:return Ce("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}h(_u,"getEncodingComponents");function Ta(e,t,i){const n=e.getShaderParameter(t,e.COMPILE_STATUS),r=(e.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return i.toUpperCase()+`

`+r+`

`+vu(e.getShaderSource(t),a)}else return r}h(Ta,"getShaderErrors");function Mu(e,t){const i=_u(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${i[1]}( vec4( value.rgb * ${i[0]}, value.a ) );`,"}"].join(`
`)}h(Mu,"getTexelEncodingFunction");var Su={1:"Linear",2:"Reinhard",3:"Cineon",4:"ACESFilmic",6:"AgX",7:"Neutral",5:"Custom"};function yu(e,t){const i=Su[t];return i===void 0?(Ce("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+i+"ToneMapping( color ); }"}h(yu,"getToneMappingFunction");var ur=new F;function xu(){return Ge.getLuminanceCoefficients(ur),["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${ur.x.toFixed(4)}, ${ur.y.toFixed(4)}, ${ur.z.toFixed(4)} );`,"	return dot( weights, rgb );","}"].join(`
`)}h(xu,"getLuminanceFunction");function Eu(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(bn).join(`
`)}h(Eu,"generateVertexExtensions");function Tu(e){const t=[];for(const i in e){const n=e[i];n!==!1&&t.push("#define "+i+" "+n)}return t.join(`
`)}h(Tu,"generateDefines");function bu(e,t){const i={},n=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=e.getActiveAttrib(t,r),a=s.name;let o=1;s.type===e.FLOAT_MAT2&&(o=2),s.type===e.FLOAT_MAT3&&(o=3),s.type===e.FLOAT_MAT4&&(o=4),i[a]={type:s.type,location:e.getAttribLocation(t,a),locationSize:o}}return i}h(bu,"fetchAttributeLocations");function bn(e){return e!==""}h(bn,"filterEmptyLine");function ba(e,t){const i=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,i).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}h(ba,"replaceLightNums");function Aa(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}h(Aa,"replaceClippingPlaneNums");var Au=/^[ \t]*#include +<([\w\d./]+)>/gm;function _s(e){return e.replace(Au,Ru)}h(_s,"resolveIncludes");var wu=new Map;function Ru(e,t){let i=Fe[t];if(i===void 0){const n=wu.get(t);if(n!==void 0)i=Fe[n],Ce('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return _s(i)}h(Ru,"includeReplacer");var Cu=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function wa(e){return e.replace(Cu,Pu)}h(wa,"unrollLoops");function Pu(e,t,i,n){let r="";for(let s=parseInt(t);s<parseInt(i);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}h(Pu,"loopReplacer");function Ra(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?t+=`
#define HIGH_PRECISION`:e.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}h(Ra,"generatePrecision");var Iu={1:"SHADOWMAP_TYPE_PCF",3:"SHADOWMAP_TYPE_VSM"};function Lu(e){return Iu[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}h(Lu,"generateShadowMapTypeDefine");var Uu={301:"ENVMAP_TYPE_CUBE",302:"ENVMAP_TYPE_CUBE",306:"ENVMAP_TYPE_CUBE_UV"};function Du(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":Uu[e.envMapMode]||"ENVMAP_TYPE_CUBE"}h(Du,"generateEnvMapTypeDefine");var Nu={302:"ENVMAP_MODE_REFRACTION"};function Fu(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":Nu[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}h(Fu,"generateEnvMapModeDefine");var Ou={0:"ENVMAP_BLENDING_MULTIPLY",1:"ENVMAP_BLENDING_MIX",2:"ENVMAP_BLENDING_ADD"};function Bu(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":Ou[e.combine]||"ENVMAP_BLENDING_NONE"}h(Bu,"generateEnvMapBlendingDefine");function zu(e){const t=e.envMapCubeUVHeight;if(t===null)return null;const i=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,i),112)),texelHeight:n,maxMip:i}}h(zu,"generateCubeUVSize");function Vu(e,t,i,n){const r=e.getContext(),s=i.defines;let a=i.vertexShader,o=i.fragmentShader;const l=Lu(i),c=Du(i),f=Fu(i),d=Bu(i),u=zu(i),m=Eu(i),y=Tu(s),S=r.createProgram();let g,p,R=i.glslVersion?"#version "+i.glslVersion+`
`:"";i.isRawShaderMaterial?(g=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,y].filter(bn).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,y].filter(bn).join(`
`),p.length>0&&(p+=`
`)):(g=[Ra(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,y,i.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",i.batching?"#define USE_BATCHING":"",i.batchingColor?"#define USE_BATCHING_COLOR":"",i.instancing?"#define USE_INSTANCING":"",i.instancingColor?"#define USE_INSTANCING_COLOR":"",i.instancingMorph?"#define USE_INSTANCING_MORPH":"",i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.map?"#define USE_MAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+f:"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.displacementMap?"#define USE_DISPLACEMENTMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.mapUv?"#define MAP_UV "+i.mapUv:"",i.alphaMapUv?"#define ALPHAMAP_UV "+i.alphaMapUv:"",i.lightMapUv?"#define LIGHTMAP_UV "+i.lightMapUv:"",i.aoMapUv?"#define AOMAP_UV "+i.aoMapUv:"",i.emissiveMapUv?"#define EMISSIVEMAP_UV "+i.emissiveMapUv:"",i.bumpMapUv?"#define BUMPMAP_UV "+i.bumpMapUv:"",i.normalMapUv?"#define NORMALMAP_UV "+i.normalMapUv:"",i.displacementMapUv?"#define DISPLACEMENTMAP_UV "+i.displacementMapUv:"",i.metalnessMapUv?"#define METALNESSMAP_UV "+i.metalnessMapUv:"",i.roughnessMapUv?"#define ROUGHNESSMAP_UV "+i.roughnessMapUv:"",i.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+i.anisotropyMapUv:"",i.clearcoatMapUv?"#define CLEARCOATMAP_UV "+i.clearcoatMapUv:"",i.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+i.clearcoatNormalMapUv:"",i.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+i.clearcoatRoughnessMapUv:"",i.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+i.iridescenceMapUv:"",i.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+i.iridescenceThicknessMapUv:"",i.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+i.sheenColorMapUv:"",i.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+i.sheenRoughnessMapUv:"",i.specularMapUv?"#define SPECULARMAP_UV "+i.specularMapUv:"",i.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+i.specularColorMapUv:"",i.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+i.specularIntensityMapUv:"",i.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+i.transmissionMapUv:"",i.thicknessMapUv?"#define THICKNESSMAP_UV "+i.thicknessMapUv:"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexNormals?"#define HAS_NORMAL":"",i.vertexColors?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.flatShading?"#define FLAT_SHADED":"",i.skinning?"#define USE_SKINNING":"",i.morphTargets?"#define USE_MORPHTARGETS":"",i.morphNormals&&i.flatShading===!1?"#define USE_MORPHNORMALS":"",i.morphColors?"#define USE_MORPHCOLORS":"",i.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+i.morphTextureStride:"",i.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+i.morphTargetsCount:"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+l:"",i.sizeAttenuation?"#define USE_SIZEATTENUATION":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(bn).join(`
`),p=[Ra(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,y,i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",i.map?"#define USE_MAP":"",i.matcap?"#define USE_MATCAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+c:"",i.envMap?"#define "+f:"",i.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoat?"#define USE_CLEARCOAT":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.dispersion?"#define USE_DISPERSION":"",i.iridescence?"#define USE_IRIDESCENCE":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaTest?"#define USE_ALPHATEST":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.sheen?"#define USE_SHEEN":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors||i.instancingColor?"#define USE_COLOR":"",i.vertexAlphas||i.batchingColor?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.gradientMap?"#define USE_GRADIENTMAP":"",i.flatShading?"#define FLAT_SHADED":"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+l:"",i.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",i.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",i.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",i.toneMapping!==0?"#define TONE_MAPPING":"",i.toneMapping!==0?Fe.tonemapping_pars_fragment:"",i.toneMapping!==0?yu("toneMapping",i.toneMapping):"",i.dithering?"#define DITHERING":"",i.opaque?"#define OPAQUE":"",Fe.colorspace_pars_fragment,Mu("linearToOutputTexel",i.outputColorSpace),xu(),i.useDepthPacking?"#define DEPTH_PACKING "+i.depthPacking:"",`
`].filter(bn).join(`
`)),a=_s(a),a=ba(a,i),a=Aa(a,i),o=_s(o),o=ba(o,i),o=Aa(o,i),a=wa(a),o=wa(o),i.isRawShaderMaterial!==!0&&(R=`#version 300 es
`,g=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",i.glslVersion==="300 es"?"":"layout(location = 0) out highp vec4 pc_fragColor;",i.glslVersion==="300 es"?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const C=R+g+a,v=R+p+o,A=xa(r,r.VERTEX_SHADER,C),b=xa(r,r.FRAGMENT_SHADER,v);r.attachShader(S,A),r.attachShader(S,b),i.index0AttributeName!==void 0?r.bindAttribLocation(S,0,i.index0AttributeName):i.hasPositionAttribute===!0&&r.bindAttribLocation(S,0,"position"),r.linkProgram(S);function w(P){if(e.debug.checkShaderErrors){const k=r.getProgramInfoLog(S)||"",Y=r.getShaderInfoLog(A)||"",V=r.getShaderInfoLog(b)||"",H=k.trim(),q=Y.trim(),O=V.trim();let ee=!0,te=!0;if(r.getProgramParameter(S,r.LINK_STATUS)===!1)if(ee=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(r,S,A,b);else{const ie=Ta(r,A,"vertex"),de=Ta(r,b,"fragment");Re("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(S,r.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+H+`
`+ie+`
`+de)}else H!==""?Ce("WebGLProgram: Program Info Log:",H):(q===""||O==="")&&(te=!1);te&&(P.diagnostics={runnable:ee,programLog:H,vertexShader:{log:q,prefix:g},fragmentShader:{log:O,prefix:p}})}r.deleteShader(A),r.deleteShader(b),_=new pr(r,S),T=bu(r,S)}h(w,"onFirstUse");let _;this.getUniforms=function(){return _===void 0&&w(this),_};let T;this.getAttributes=function(){return T===void 0&&w(this),T};let z=i.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return z===!1&&(z=r.getProgramParameter(S,mu)),z},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(S),this.program=void 0},this.type=i.shaderType,this.name=i.shaderName,this.id=gu++,this.cacheKey=t,this.usedTimes=1,this.program=S,this.vertexShader=A,this.fragmentShader=b,this}h(Vu,"WebGLProgram");var Gu=0,Hu=class{static{h(this,"WebGLShaderCache")}constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){const n=this._getShaderCacheForMaterial(e);return n.has(t)===!1&&(n.add(t),t.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new ku(e),t.set(e,i)),i}},ku=class{static{h(this,"WebGLShaderStage")}constructor(e){this.id=Gu++,this.code=e,this.usedTimes=0}};function Wu(e){return e===1030||e===37490||e===36285}h(Wu,"isPackedRGFormat");function Xu(e,t,i,n,r,s){const a=new Ja,o=new Hu,l=new Set,c=[],f=new Map,d=n.logarithmicDepthBuffer;let u=n.precision;const m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(_){return l.add(_),_===0?"uv":`uv${_}`}h(y,"getChannel");function S(_,T,z,P,k,Y){const V=P.fog,H=k.geometry,q=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?P.environment:null,O=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,ee=t.get(_.envMap||q,O),te=ee&&ee.mapping===306?ee.image.height:null,ie=m[_.type];_.precision!==null&&(u=n.getMaxPrecision(_.precision),u!==_.precision&&Ce("WebGLProgram.getParameters:",_.precision,"not supported, using",u,"instead."));const de=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,fe=de!==void 0?de.length:0;let He=0;H.morphAttributes.position!==void 0&&(He=1),H.morphAttributes.normal!==void 0&&(He=2),H.morphAttributes.color!==void 0&&(He=3);let Ye,K,se,ve;if(ie){const we=$t[ie];Ye=we.vertexShader,K=we.fragmentShader}else{Ye=_.vertexShader,K=_.fragmentShader;const we=o.getVertexShaderStage(_),xt=o.getFragmentShaderStage(_);o.update(_,we,xt),se=we.id,ve=xt.id}const pe=e.getRenderTarget(),Ae=e.state.buffers.depth.getReversed(),Pe=k.isInstancedMesh===!0,Le=k.isBatchedMesh===!0,Ke=!!_.map,Ve=!!_.matcap,tt=!!ee,vt=!!_.aoMap,At=!!_.lightMap,Ut=!!_.bumpMap&&_.wireframe===!1,it=!!_.normalMap,_t=!!_.displacementMap,mt=!!_.emissiveMap,ft=!!_.metalnessMap,U=!!_.roughnessMap,Dt=_.anisotropy>0,Ze=_.clearcoat>0,nt=_.dispersion>0,E=_.iridescence>0,M=_.sheen>0,I=_.transmission>0,X=Dt&&!!_.anisotropyMap,J=Ze&&!!_.clearcoatMap,re=Ze&&!!_.clearcoatNormalMap,le=Ze&&!!_.clearcoatRoughnessMap,D=E&&!!_.iridescenceMap,ne=E&&!!_.iridescenceThicknessMap,ge=M&&!!_.sheenColorMap,ye=M&&!!_.sheenRoughnessMap,j=!!_.specularMap,Ee=!!_.specularColorMap,Te=!!_.specularIntensityMap,De=I&&!!_.transmissionMap,We=I&&!!_.thicknessMap,L=!!_.gradientMap,Z=!!_.alphaMap,$=_.alphaTest>0,me=!!_.alphaHash,Se=!!_.extensions;let Q=0;_.toneMapped&&(pe===null||pe.isXRRenderTarget===!0)&&(Q=e.toneMapping);const he={shaderID:ie,shaderType:_.type,shaderName:_.name,vertexShader:Ye,fragmentShader:K,defines:_.defines,customVertexShaderID:se,customFragmentShaderID:ve,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:u,batching:Le,batchingColor:Le&&k._colorsTexture!==null,instancing:Pe,instancingColor:Pe&&k.instanceColor!==null,instancingMorph:Pe&&k.morphTexture!==null,outputColorSpace:pe===null?e.outputColorSpace:pe.isXRRenderTarget===!0?pe.texture.colorSpace:Ge.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Ke,matcap:Ve,envMap:tt,envMapMode:tt&&ee.mapping,envMapCubeUVHeight:te,aoMap:vt,lightMap:At,bumpMap:Ut,normalMap:it,displacementMap:_t,emissiveMap:mt,normalMapObjectSpace:it&&_.normalMapType===1,normalMapTangentSpace:it&&_.normalMapType===0,packedNormalMap:it&&_.normalMapType===0&&Wu(_.normalMap.format),metalnessMap:ft,roughnessMap:U,anisotropy:Dt,anisotropyMap:X,clearcoat:Ze,clearcoatMap:J,clearcoatNormalMap:re,clearcoatRoughnessMap:le,dispersion:nt,iridescence:E,iridescenceMap:D,iridescenceThicknessMap:ne,sheen:M,sheenColorMap:ge,sheenRoughnessMap:ye,specularMap:j,specularColorMap:Ee,specularIntensityMap:Te,transmission:I,transmissionMap:De,thicknessMap:We,gradientMap:L,opaque:_.transparent===!1&&_.blending===1&&_.alphaToCoverage===!1,alphaMap:Z,alphaTest:$,alphaHash:me,combine:_.combine,mapUv:Ke&&y(_.map.channel),aoMapUv:vt&&y(_.aoMap.channel),lightMapUv:At&&y(_.lightMap.channel),bumpMapUv:Ut&&y(_.bumpMap.channel),normalMapUv:it&&y(_.normalMap.channel),displacementMapUv:_t&&y(_.displacementMap.channel),emissiveMapUv:mt&&y(_.emissiveMap.channel),metalnessMapUv:ft&&y(_.metalnessMap.channel),roughnessMapUv:U&&y(_.roughnessMap.channel),anisotropyMapUv:X&&y(_.anisotropyMap.channel),clearcoatMapUv:J&&y(_.clearcoatMap.channel),clearcoatNormalMapUv:re&&y(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:le&&y(_.clearcoatRoughnessMap.channel),iridescenceMapUv:D&&y(_.iridescenceMap.channel),iridescenceThicknessMapUv:ne&&y(_.iridescenceThicknessMap.channel),sheenColorMapUv:ge&&y(_.sheenColorMap.channel),sheenRoughnessMapUv:ye&&y(_.sheenRoughnessMap.channel),specularMapUv:j&&y(_.specularMap.channel),specularColorMapUv:Ee&&y(_.specularColorMap.channel),specularIntensityMapUv:Te&&y(_.specularIntensityMap.channel),transmissionMapUv:De&&y(_.transmissionMap.channel),thicknessMapUv:We&&y(_.thicknessMap.channel),alphaMapUv:Z&&y(_.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(it||Dt),vertexNormals:!!H.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!H.attributes.uv&&(Ke||Z),fog:!!V,useFog:_.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||H.attributes.normal===void 0&&it===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Ae,skinning:k.isSkinnedMesh===!0,hasPositionAttribute:H.attributes.position!==void 0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:fe,morphTextureStride:He,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:Y.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:_.dithering,shadowMapEnabled:e.shadowMap.enabled&&z.length>0,shadowMapType:e.shadowMap.type,toneMapping:Q,decodeVideoTexture:Ke&&_.map.isVideoTexture===!0&&Ge.getTransfer(_.map.colorSpace)==="srgb",decodeVideoTextureEmissive:mt&&_.emissiveMap.isVideoTexture===!0&&Ge.getTransfer(_.emissiveMap.colorSpace)==="srgb",premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===2,flipSided:_.side===1,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Se&&_.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Se&&_.extensions.multiDraw===!0||Le)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return he.vertexUv1s=l.has(1),he.vertexUv2s=l.has(2),he.vertexUv3s=l.has(3),l.clear(),he}h(S,"getParameters");function g(_){const T=[];if(_.shaderID?T.push(_.shaderID):(T.push(_.customVertexShaderID),T.push(_.customFragmentShaderID)),_.defines!==void 0)for(const z in _.defines)T.push(z),T.push(_.defines[z]);return _.isRawShaderMaterial===!1&&(p(T,_),R(T,_),T.push(e.outputColorSpace)),T.push(_.customProgramCacheKey),T.join()}h(g,"getProgramCacheKey");function p(_,T){_.push(T.precision),_.push(T.outputColorSpace),_.push(T.envMapMode),_.push(T.envMapCubeUVHeight),_.push(T.mapUv),_.push(T.alphaMapUv),_.push(T.lightMapUv),_.push(T.aoMapUv),_.push(T.bumpMapUv),_.push(T.normalMapUv),_.push(T.displacementMapUv),_.push(T.emissiveMapUv),_.push(T.metalnessMapUv),_.push(T.roughnessMapUv),_.push(T.anisotropyMapUv),_.push(T.clearcoatMapUv),_.push(T.clearcoatNormalMapUv),_.push(T.clearcoatRoughnessMapUv),_.push(T.iridescenceMapUv),_.push(T.iridescenceThicknessMapUv),_.push(T.sheenColorMapUv),_.push(T.sheenRoughnessMapUv),_.push(T.specularMapUv),_.push(T.specularColorMapUv),_.push(T.specularIntensityMapUv),_.push(T.transmissionMapUv),_.push(T.thicknessMapUv),_.push(T.combine),_.push(T.fogExp2),_.push(T.sizeAttenuation),_.push(T.morphTargetsCount),_.push(T.morphAttributeCount),_.push(T.numDirLights),_.push(T.numPointLights),_.push(T.numSpotLights),_.push(T.numSpotLightMaps),_.push(T.numHemiLights),_.push(T.numRectAreaLights),_.push(T.numDirLightShadows),_.push(T.numPointLightShadows),_.push(T.numSpotLightShadows),_.push(T.numSpotLightShadowsWithMaps),_.push(T.numLightProbes),_.push(T.shadowMapType),_.push(T.toneMapping),_.push(T.numClippingPlanes),_.push(T.numClipIntersection),_.push(T.depthPacking)}h(p,"getProgramCacheKeyParameters");function R(_,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),_.push(a.mask)}h(R,"getProgramCacheKeyBooleans");function C(_){const T=m[_.type];let z;if(T){const P=$t[T];z=Rc.clone(P.uniforms)}else z=_.uniforms;return z}h(C,"getUniforms");function v(_,T){let z=f.get(T);return z!==void 0?++z.usedTimes:(z=new Vu(e,T,_,r),c.push(z),f.set(T,z)),z}h(v,"acquireProgram");function A(_){if(--_.usedTimes===0){const T=c.indexOf(_);c[T]=c[c.length-1],c.pop(),f.delete(_.cacheKey),_.destroy()}}h(A,"releaseProgram");function b(_){o.remove(_)}h(b,"releaseShaderCache");function w(){o.dispose()}return h(w,"dispose"),{getParameters:S,getProgramCacheKey:g,getUniforms:C,acquireProgram:v,releaseProgram:A,releaseShaderCache:b,programs:c,dispose:w}}h(Xu,"WebGLPrograms");function qu(){let e=new WeakMap;function t(a){return e.has(a)}h(t,"has");function i(a){let o=e.get(a);return o===void 0&&(o={},e.set(a,o)),o}h(i,"get");function n(a){e.delete(a)}h(n,"remove");function r(a,o,l){e.get(a)[o]=l}h(r,"update");function s(){e=new WeakMap}return h(s,"dispose"),{has:t,get:i,remove:n,update:r,dispose:s}}h(qu,"WebGLProperties");function Yu(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.materialVariant!==t.materialVariant?e.materialVariant-t.materialVariant:e.z!==t.z?e.z-t.z:e.id-t.id}h(Yu,"painterSortStable");function Ca(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}h(Ca,"reversePainterSortStable");function Pa(){const e=[];let t=0;const i=[],n=[],r=[];function s(){t=0,i.length=0,n.length=0,r.length=0}h(s,"init");function a(u){let m=0;return u.isInstancedMesh&&(m+=2),u.isSkinnedMesh&&(m+=1),m}h(a,"materialVariant");function o(u,m,y,S,g,p){let R=e[t];return R===void 0?(R={id:u.id,object:u,geometry:m,material:y,materialVariant:a(u),groupOrder:S,renderOrder:u.renderOrder,z:g,group:p},e[t]=R):(R.id=u.id,R.object=u,R.geometry=m,R.material=y,R.materialVariant=a(u),R.groupOrder=S,R.renderOrder=u.renderOrder,R.z=g,R.group=p),t++,R}h(o,"getNextRenderItem");function l(u,m,y,S,g,p){const R=o(u,m,y,S,g,p);y.transmission>0?n.push(R):y.transparent===!0?r.push(R):i.push(R)}h(l,"push");function c(u,m,y,S,g,p){const R=o(u,m,y,S,g,p);y.transmission>0?n.unshift(R):y.transparent===!0?r.unshift(R):i.unshift(R)}h(c,"unshift");function f(u,m,y){i.length>1&&i.sort(u||Yu),n.length>1&&n.sort(m||Ca),r.length>1&&r.sort(m||Ca),y&&(i.reverse(),n.reverse(),r.reverse())}h(f,"sort");function d(){for(let u=t,m=e.length;u<m;u++){const y=e[u];if(y.id===null)break;y.id=null,y.object=null,y.geometry=null,y.material=null,y.group=null}}return h(d,"finish"),{opaque:i,transmissive:n,transparent:r,init:s,push:l,unshift:c,finish:d,sort:f}}h(Pa,"WebGLRenderList");function Ku(){let e=new WeakMap;function t(n,r){const s=e.get(n);let a;return s===void 0?(a=new Pa,e.set(n,[a])):r>=s.length?(a=new Pa,s.push(a)):a=s[r],a}h(t,"get");function i(){e=new WeakMap}return h(i,"dispose"),{get:t,dispose:i}}h(Ku,"WebGLRenderLists");function Zu(){const e={};return{get:h(function(t){if(e[t.id]!==void 0)return e[t.id];let i;switch(t.type){case"DirectionalLight":i={direction:new F,color:new ke};break;case"SpotLight":i={position:new F,direction:new F,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":i={position:new F,color:new ke,distance:0,decay:0};break;case"HemisphereLight":i={direction:new F,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":i={color:new ke,position:new F,halfWidth:new F,halfHeight:new F}}return e[t.id]=i,i},"get")}}h(Zu,"UniformsCache");function Ju(){const e={};return{get:h(function(t){if(e[t.id]!==void 0)return e[t.id];let i;switch(t.type){case"DirectionalLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"SpotLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"PointLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=i,i},"get")}}h(Ju,"ShadowUniformsCache");var $u=0;function Qu(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}h(Qu,"shadowCastingAndTexturingLightsFirst");function ju(e){const t=new Zu,i=Ju(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new F);const r=new F,s=new lt,a=new lt;function o(c){let f=0,d=0,u=0;for(let T=0;T<9;T++)n.probe[T].set(0,0,0);let m=0,y=0,S=0,g=0,p=0,R=0,C=0,v=0,A=0,b=0,w=0;c.sort(Qu);for(let T=0,z=c.length;T<z;T++){const P=c[T],k=P.color,Y=P.intensity,V=P.distance;let H=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===1030?H=P.shadow.map.texture:H=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)f+=k.r*Y,d+=k.g*Y,u+=k.b*Y;else if(P.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(P.sh.coefficients[q],Y);w++}else if(P.isDirectionalLight){const q=t.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const O=P.shadow,ee=i.get(P);ee.shadowIntensity=O.intensity,ee.shadowBias=O.bias,ee.shadowNormalBias=O.normalBias,ee.shadowRadius=O.radius,ee.shadowMapSize=O.mapSize,n.directionalShadow[m]=ee,n.directionalShadowMap[m]=H,n.directionalShadowMatrix[m]=P.shadow.matrix,R++}n.directional[m]=q,m++}else if(P.isSpotLight){const q=t.get(P);q.position.setFromMatrixPosition(P.matrixWorld),q.color.copy(k).multiplyScalar(Y),q.distance=V,q.coneCos=Math.cos(P.angle),q.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),q.decay=P.decay,n.spot[S]=q;const O=P.shadow;if(P.map&&(n.spotLightMap[A]=P.map,A++,O.updateMatrices(P),P.castShadow&&b++),n.spotLightMatrix[S]=O.matrix,P.castShadow){const ee=i.get(P);ee.shadowIntensity=O.intensity,ee.shadowBias=O.bias,ee.shadowNormalBias=O.normalBias,ee.shadowRadius=O.radius,ee.shadowMapSize=O.mapSize,n.spotShadow[S]=ee,n.spotShadowMap[S]=H,v++}S++}else if(P.isRectAreaLight){const q=t.get(P);q.color.copy(k).multiplyScalar(Y),q.halfWidth.set(P.width*.5,0,0),q.halfHeight.set(0,P.height*.5,0),n.rectArea[g]=q,g++}else if(P.isPointLight){const q=t.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity),q.distance=P.distance,q.decay=P.decay,P.castShadow){const O=P.shadow,ee=i.get(P);ee.shadowIntensity=O.intensity,ee.shadowBias=O.bias,ee.shadowNormalBias=O.normalBias,ee.shadowRadius=O.radius,ee.shadowMapSize=O.mapSize,ee.shadowCameraNear=O.camera.near,ee.shadowCameraFar=O.camera.far,n.pointShadow[y]=ee,n.pointShadowMap[y]=H,n.pointShadowMatrix[y]=P.shadow.matrix,C++}n.point[y]=q,y++}else if(P.isHemisphereLight){const q=t.get(P);q.skyColor.copy(P.color).multiplyScalar(Y),q.groundColor.copy(P.groundColor).multiplyScalar(Y),n.hemi[p]=q,p++}}g>0&&(e.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ce.LTC_FLOAT_1,n.rectAreaLTC2=ce.LTC_FLOAT_2):(n.rectAreaLTC1=ce.LTC_HALF_1,n.rectAreaLTC2=ce.LTC_HALF_2)),n.ambient[0]=f,n.ambient[1]=d,n.ambient[2]=u;const _=n.hash;(_.directionalLength!==m||_.pointLength!==y||_.spotLength!==S||_.rectAreaLength!==g||_.hemiLength!==p||_.numDirectionalShadows!==R||_.numPointShadows!==C||_.numSpotShadows!==v||_.numSpotMaps!==A||_.numLightProbes!==w)&&(n.directional.length=m,n.spot.length=S,n.rectArea.length=g,n.point.length=y,n.hemi.length=p,n.directionalShadow.length=R,n.directionalShadowMap.length=R,n.pointShadow.length=C,n.pointShadowMap.length=C,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=R,n.pointShadowMatrix.length=C,n.spotLightMatrix.length=v+A-b,n.spotLightMap.length=A,n.numSpotLightShadowsWithMaps=b,n.numLightProbes=w,_.directionalLength=m,_.pointLength=y,_.spotLength=S,_.rectAreaLength=g,_.hemiLength=p,_.numDirectionalShadows=R,_.numPointShadows=C,_.numSpotShadows=v,_.numSpotMaps=A,_.numLightProbes=w,n.version=$u++)}h(o,"setup");function l(c,f){let d=0,u=0,m=0,y=0,S=0;const g=f.matrixWorldInverse;for(let p=0,R=c.length;p<R;p++){const C=c[p];if(C.isDirectionalLight){const v=n.directional[d];v.direction.setFromMatrixPosition(C.matrixWorld),r.setFromMatrixPosition(C.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(g),d++}else if(C.isSpotLight){const v=n.spot[m];v.position.setFromMatrixPosition(C.matrixWorld),v.position.applyMatrix4(g),v.direction.setFromMatrixPosition(C.matrixWorld),r.setFromMatrixPosition(C.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(g),m++}else if(C.isRectAreaLight){const v=n.rectArea[y];v.position.setFromMatrixPosition(C.matrixWorld),v.position.applyMatrix4(g),a.identity(),s.copy(C.matrixWorld),s.premultiply(g),a.extractRotation(s),v.halfWidth.set(C.width*.5,0,0),v.halfHeight.set(0,C.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),y++}else if(C.isPointLight){const v=n.point[u];v.position.setFromMatrixPosition(C.matrixWorld),v.position.applyMatrix4(g),u++}else if(C.isHemisphereLight){const v=n.hemi[S];v.direction.setFromMatrixPosition(C.matrixWorld),v.direction.transformDirection(g),S++}}}return h(l,"setupView"),{setup:o,setupView:l,state:n}}h(ju,"WebGLLights");function Ia(e){const t=new ju(e),i=[],n=[],r=[];function s(u){d.camera=u,i.length=0,n.length=0,r.length=0}h(s,"init");function a(u){i.push(u)}h(a,"pushLight");function o(u){n.push(u)}h(o,"pushShadow");function l(u){r.push(u)}h(l,"pushLightProbeGrid");function c(){t.setup(i)}h(c,"setupLights");function f(u){t.setupView(i,u)}h(f,"setupLightsView");const d={lightsArray:i,shadowsArray:n,lightProbeGridArray:r,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:d,setupLights:c,setupLightsView:f,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}h(Ia,"WebGLRenderState");function ef(e){let t=new WeakMap;function i(r,s=0){const a=t.get(r);let o;return a===void 0?(o=new Ia(e),t.set(r,[o])):s>=a.length?(o=new Ia(e),a.push(o)):o=a[s],o}h(i,"get");function n(){t=new WeakMap}return h(n,"dispose"),{get:i,dispose:n}}h(ef,"WebGLRenderStates");var tf=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,nf=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,rf=[new F(1,0,0),new F(-1,0,0),new F(0,1,0),new F(0,-1,0),new F(0,0,1),new F(0,0,-1)],sf=[new F(0,-1,0),new F(0,-1,0),new F(0,0,1),new F(0,0,-1),new F(0,-1,0),new F(0,-1,0)],La=new lt,En=new F,ls=new F;function af(e,t,i){let n=new ro;const r=new Ue,s=new Ue,a=new ut,o=new Lc,l=new Uc,c={},f=i.maxTextureSize,d={0:1,1:0,2:2},u=new qt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ue},radius:{value:4}},vertexShader:tf,fragmentShader:nf}),m=u.clone();m.defines.HORIZONTAL_PASS=1;const y=new Vt;y.setAttribute("position",new Bt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const S=new It(y,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let p=this.type;this.render=function(b,w,_){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||b.length===0)return;this.type===2&&(Ce("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=1);const T=e.getRenderTarget(),z=e.getActiveCubeFace(),P=e.getActiveMipmapLevel(),k=e.state;k.setBlending(0),k.buffers.depth.getReversed()===!0?k.buffers.color.setClear(0,0,0,0):k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const Y=p!==this.type;Y&&w.traverse(function(V){V.material&&(Array.isArray(V.material)?V.material.forEach(H=>H.needsUpdate=!0):V.material.needsUpdate=!0)});for(let V=0,H=b.length;V<H;V++){const q=b[V],O=q.shadow;if(O===void 0){Ce("WebGLShadowMap:",q,"has no shadow.");continue}if(O.autoUpdate===!1&&O.needsUpdate===!1)continue;r.copy(O.mapSize);const ee=O.getFrameExtents();r.multiply(ee),s.copy(O.mapSize),(r.x>f||r.y>f)&&(r.x>f&&(s.x=Math.floor(f/ee.x),r.x=s.x*ee.x,O.mapSize.x=s.x),r.y>f&&(s.y=Math.floor(f/ee.y),r.y=s.y*ee.y,O.mapSize.y=s.y));const te=e.state.buffers.depth.getReversed();if(O.camera._reversedDepth=te,O.map===null||Y===!0){if(O.map!==null&&(O.map.depthTexture!==null&&(O.map.depthTexture.dispose(),O.map.depthTexture=null),O.map.dispose()),this.type===3){if(q.isPointLight){Ce("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}O.map=new jt(r.x,r.y,{format:mr,type:Ui,minFilter:Pt,magFilter:Pt,generateMipmaps:!1}),O.map.texture.name=q.name+".shadowMap",O.map.depthTexture=new un(r.x,r.y,Tr),O.map.depthTexture.name=q.name+".shadowMapDepth",O.map.depthTexture.format=In,O.map.depthTexture.compareFunction=null,O.map.depthTexture.minFilter=bt,O.map.depthTexture.magFilter=bt}else q.isPointLight?(O.map=new So(r.x),O.map.depthTexture=new Ec(r.x,Li)):(O.map=new jt(r.x,r.y),O.map.depthTexture=new un(r.x,r.y,Li)),O.map.depthTexture.name=q.name+".shadowMap",O.map.depthTexture.format=In,this.type===1?(O.map.depthTexture.compareFunction=te?518:515,O.map.depthTexture.minFilter=Pt,O.map.depthTexture.magFilter=Pt):(O.map.depthTexture.compareFunction=null,O.map.depthTexture.minFilter=bt,O.map.depthTexture.magFilter=bt);O.camera.updateProjectionMatrix()}const ie=O.map.isWebGLCubeRenderTarget?6:1;for(let de=0;de<ie;de++){if(O.map.isWebGLCubeRenderTarget)e.setRenderTarget(O.map,de),e.clear();else{de===0&&(e.setRenderTarget(O.map),e.clear());const fe=O.getViewport(de);a.set(s.x*fe.x,s.y*fe.y,s.x*fe.z,s.y*fe.w),k.viewport(a)}if(q.isPointLight){const fe=O.camera,He=O.matrix,Ye=q.distance||fe.far;Ye!==fe.far&&(fe.far=Ye,fe.updateProjectionMatrix()),En.setFromMatrixPosition(q.matrixWorld),fe.position.copy(En),ls.copy(fe.position),ls.add(rf[de]),fe.up.copy(sf[de]),fe.lookAt(ls),fe.updateMatrixWorld(),He.makeTranslation(-En.x,-En.y,-En.z),La.multiplyMatrices(fe.projectionMatrix,fe.matrixWorldInverse),O._frustum.setFromProjectionMatrix(La,fe.coordinateSystem,fe.reversedDepth)}else O.updateMatrices(q);n=O.getFrustum(),v(w,_,O.camera,q,this.type)}O.isPointLightShadow!==!0&&this.type===3&&R(O,_),O.needsUpdate=!1}p=this.type,g.needsUpdate=!1,e.setRenderTarget(T,z,P)};function R(b,w){const _=t.update(S);u.defines.VSM_SAMPLES!==b.blurSamples&&(u.defines.VSM_SAMPLES=b.blurSamples,m.defines.VSM_SAMPLES=b.blurSamples,u.needsUpdate=!0,m.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new jt(r.x,r.y,{format:mr,type:Ui})),u.uniforms.shadow_pass.value=b.map.depthTexture,u.uniforms.resolution.value=b.mapSize,u.uniforms.radius.value=b.radius,e.setRenderTarget(b.mapPass),e.clear(),e.renderBufferDirect(w,null,_,u,S,null),m.uniforms.shadow_pass.value=b.mapPass.texture,m.uniforms.resolution.value=b.mapSize,m.uniforms.radius.value=b.radius,e.setRenderTarget(b.map),e.clear(),e.renderBufferDirect(w,null,_,m,S,null)}h(R,"VSMPass");function C(b,w,_,T){let z=null;const P=_.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(P!==void 0)z=P;else if(z=_.isPointLight===!0?l:o,e.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const k=z.uuid,Y=w.uuid;let V=c[k];V===void 0&&(V={},c[k]=V);let H=V[Y];H===void 0&&(H=z.clone(),V[Y]=H,w.addEventListener("dispose",A)),z=H}if(z.visible=w.visible,z.wireframe=w.wireframe,T===3?z.side=w.shadowSide!==null?w.shadowSide:w.side:z.side=w.shadowSide!==null?w.shadowSide:d[w.side],z.alphaMap=w.alphaMap,z.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,z.map=w.map,z.clipShadows=w.clipShadows,z.clippingPlanes=w.clippingPlanes,z.clipIntersection=w.clipIntersection,z.displacementMap=w.displacementMap,z.displacementScale=w.displacementScale,z.displacementBias=w.displacementBias,z.wireframeLinewidth=w.wireframeLinewidth,z.linewidth=w.linewidth,_.isPointLight===!0&&z.isMeshDistanceMaterial===!0){const k=e.properties.get(z);k.light=_}return z}h(C,"getDepthMaterial");function v(b,w,_,T,z){if(b.visible===!1)return;if(b.layers.test(w.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&z===3)&&(!b.frustumCulled||n.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,b.matrixWorld);const k=t.update(b),Y=b.material;if(Array.isArray(Y)){const V=k.groups;for(let H=0,q=V.length;H<q;H++){const O=V[H],ee=Y[O.materialIndex];if(ee&&ee.visible){const te=C(b,ee,T,z);b.onBeforeShadow(e,b,w,_,k,te,O),e.renderBufferDirect(_,null,k,te,b,O),b.onAfterShadow(e,b,w,_,k,te,O)}}}else if(Y.visible){const V=C(b,Y,T,z);b.onBeforeShadow(e,b,w,_,k,V,null),e.renderBufferDirect(_,null,k,V,b,null),b.onAfterShadow(e,b,w,_,k,V,null)}}const P=b.children;for(let k=0,Y=P.length;k<Y;k++)v(P[k],w,_,T,z)}h(v,"renderObject");function A(b){b.target.removeEventListener("dispose",A);for(const w in c){const _=c[w],T=b.target.uuid;T in _&&(_[T].dispose(),delete _[T])}}h(A,"onMaterialDispose")}h(af,"WebGLShadowMap");function of(e,t){function i(){let L=!1;const Z=new ut;let $=null;const me=new ut(0,0,0,0);return{setMask:h(function(Se){$!==Se&&!L&&(e.colorMask(Se,Se,Se,Se),$=Se)},"setMask"),setLocked:h(function(Se){L=Se},"setLocked"),setClear:h(function(Se,Q,he,we,xt){xt===!0&&(Se*=we,Q*=we,he*=we),Z.set(Se,Q,he,we),me.equals(Z)===!1&&(e.clearColor(Se,Q,he,we),me.copy(Z))},"setClear"),reset:h(function(){L=!1,$=null,me.set(-1,0,0,0)},"reset")}}h(i,"ColorBuffer");function n(){let L=!1,Z=!1,$=null,me=null,Se=null;return{setReversed:h(function(Q){if(Z!==Q){const he=t.get("EXT_clip_control");Q?he.clipControlEXT(he.LOWER_LEFT_EXT,he.ZERO_TO_ONE_EXT):he.clipControlEXT(he.LOWER_LEFT_EXT,he.NEGATIVE_ONE_TO_ONE_EXT),Z=Q;const we=Se;Se=null,this.setClear(we)}},"setReversed"),getReversed:h(function(){return Z},"getReversed"),setTest:h(function(Q){Q?pe(e.DEPTH_TEST):Ae(e.DEPTH_TEST)},"setTest"),setMask:h(function(Q){$!==Q&&!L&&(e.depthMask(Q),$=Q)},"setMask"),setFunc:h(function(Q){if(Z&&(Q=Jl[Q]),me!==Q){switch(Q){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}me=Q}},"setFunc"),setLocked:h(function(Q){L=Q},"setLocked"),setClear:h(function(Q){Se!==Q&&(Se=Q,Z&&(Q=1-Q),e.clearDepth(Q))},"setClear"),reset:h(function(){L=!1,$=null,me=null,Se=null,Z=!1},"reset")}}h(n,"DepthBuffer");function r(){let L=!1,Z=null,$=null,me=null,Se=null,Q=null,he=null,we=null,xt=null;return{setTest:h(function(je){L||(je?pe(e.STENCIL_TEST):Ae(e.STENCIL_TEST))},"setTest"),setMask:h(function(je){Z!==je&&!L&&(e.stencilMask(je),Z=je)},"setMask"),setFunc:h(function(je,Yt,ii){($!==je||me!==Yt||Se!==ii)&&(e.stencilFunc(je,Yt,ii),$=je,me=Yt,Se=ii)},"setFunc"),setOp:h(function(je,Yt,ii){(Q!==je||he!==Yt||we!==ii)&&(e.stencilOp(je,Yt,ii),Q=je,he=Yt,we=ii)},"setOp"),setLocked:h(function(je){L=je},"setLocked"),setClear:h(function(je){xt!==je&&(e.clearStencil(je),xt=je)},"setClear"),reset:h(function(){L=!1,Z=null,$=null,me=null,Se=null,Q=null,he=null,we=null,xt=null},"reset")}}h(r,"StencilBuffer");const s=new i,a=new n,o=new r,l=new WeakMap,c=new WeakMap;let f={},d={},u={},m=new WeakMap,y=[],S=null,g=!1,p=null,R=null,C=null,v=null,A=null,b=null,w=null,_=new ke(0,0,0),T=0,z=!1,P=null,k=null,Y=null,V=null,H=null;const q=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let O=!1,ee=0;const te=e.getParameter(e.VERSION);te.indexOf("WebGL")!==-1?(ee=parseFloat(/^WebGL (\d)/.exec(te)[1]),O=ee>=1):te.indexOf("OpenGL ES")!==-1&&(ee=parseFloat(/^OpenGL ES (\d)/.exec(te)[1]),O=ee>=2);let ie=null,de={};const fe=e.getParameter(e.SCISSOR_BOX),He=e.getParameter(e.VIEWPORT),Ye=new ut().fromArray(fe),K=new ut().fromArray(He);function se(L,Z,$,me){const Se=new Uint8Array(4),Q=e.createTexture();e.bindTexture(L,Q),e.texParameteri(L,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(L,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let he=0;he<$;he++)L===e.TEXTURE_3D||L===e.TEXTURE_2D_ARRAY?e.texImage3D(Z,0,e.RGBA,1,1,me,0,e.RGBA,e.UNSIGNED_BYTE,Se):e.texImage2D(Z+he,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Se);return Q}h(se,"createTexture");const ve={};ve[e.TEXTURE_2D]=se(e.TEXTURE_2D,e.TEXTURE_2D,1),ve[e.TEXTURE_CUBE_MAP]=se(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ve[e.TEXTURE_2D_ARRAY]=se(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ve[e.TEXTURE_3D]=se(e.TEXTURE_3D,e.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),pe(e.DEPTH_TEST),a.setFunc(3),Ut(!1),it(1),pe(e.CULL_FACE),vt(0);function pe(L){f[L]!==!0&&(e.enable(L),f[L]=!0)}h(pe,"enable");function Ae(L){f[L]!==!1&&(e.disable(L),f[L]=!1)}h(Ae,"disable");function Pe(L,Z){return u[L]!==Z?(e.bindFramebuffer(L,Z),u[L]=Z,L===e.DRAW_FRAMEBUFFER&&(u[e.FRAMEBUFFER]=Z),L===e.FRAMEBUFFER&&(u[e.DRAW_FRAMEBUFFER]=Z),!0):!1}h(Pe,"bindFramebuffer");function Le(L,Z){let $=y,me=!1;if(L){$=m.get(Z),$===void 0&&($=[],m.set(Z,$));const Se=L.textures;if($.length!==Se.length||$[0]!==e.COLOR_ATTACHMENT0){for(let Q=0,he=Se.length;Q<he;Q++)$[Q]=e.COLOR_ATTACHMENT0+Q;$.length=Se.length,me=!0}}else $[0]!==e.BACK&&($[0]=e.BACK,me=!0);me&&e.drawBuffers($)}h(Le,"drawBuffers");function Ke(L){return S!==L?(e.useProgram(L),S=L,!0):!1}h(Ke,"useProgram");const Ve={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};Ve[103]=e.MIN,Ve[104]=e.MAX;const tt={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function vt(L,Z,$,me,Se,Q,he,we,xt,je){if(L===0){g===!0&&(Ae(e.BLEND),g=!1);return}if(g===!1&&(pe(e.BLEND),g=!0),L!==5){if(L!==p||je!==z){if((R!==100||A!==100)&&(e.blendEquation(e.FUNC_ADD),R=100,A=100),je)switch(L){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Re("WebGLState: Invalid blending: ",L)}else switch(L){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:Re("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case 4:Re("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Re("WebGLState: Invalid blending: ",L)}C=null,v=null,b=null,w=null,_.set(0,0,0),T=0,p=L,z=je}return}Se=Se||Z,Q=Q||$,he=he||me,(Z!==R||Se!==A)&&(e.blendEquationSeparate(Ve[Z],Ve[Se]),R=Z,A=Se),($!==C||me!==v||Q!==b||he!==w)&&(e.blendFuncSeparate(tt[$],tt[me],tt[Q],tt[he]),C=$,v=me,b=Q,w=he),(we.equals(_)===!1||xt!==T)&&(e.blendColor(we.r,we.g,we.b,xt),_.copy(we),T=xt),p=L,z=!1}h(vt,"setBlending");function At(L,Z){L.side===2?Ae(e.CULL_FACE):pe(e.CULL_FACE);let $=L.side===1;Z&&($=!$),Ut($),L.blending===1&&L.transparent===!1?vt(0):vt(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),s.setMask(L.colorWrite);const me=L.stencilWrite;o.setTest(me),me&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),mt(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?pe(e.SAMPLE_ALPHA_TO_COVERAGE):Ae(e.SAMPLE_ALPHA_TO_COVERAGE)}h(At,"setMaterial");function Ut(L){P!==L&&(L?e.frontFace(e.CW):e.frontFace(e.CCW),P=L)}h(Ut,"setFlipSided");function it(L){L!==0?(pe(e.CULL_FACE),L!==k&&(L===1?e.cullFace(e.BACK):L===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):Ae(e.CULL_FACE),k=L}h(it,"setCullFace");function _t(L){L!==Y&&(O&&e.lineWidth(L),Y=L)}h(_t,"setLineWidth");function mt(L,Z,$){L?(pe(e.POLYGON_OFFSET_FILL),(V!==Z||H!==$)&&(V=Z,H=$,a.getReversed()&&(Z=-Z),e.polygonOffset(Z,$))):Ae(e.POLYGON_OFFSET_FILL)}h(mt,"setPolygonOffset");function ft(L){L?pe(e.SCISSOR_TEST):Ae(e.SCISSOR_TEST)}h(ft,"setScissorTest");function U(L){L===void 0&&(L=e.TEXTURE0+q-1),ie!==L&&(e.activeTexture(L),ie=L)}h(U,"activeTexture");function Dt(L,Z,$){$===void 0&&(ie===null?$=e.TEXTURE0+q-1:$=ie);let me=de[$];me===void 0&&(me={type:void 0,texture:void 0},de[$]=me),(me.type!==L||me.texture!==Z)&&(ie!==$&&(e.activeTexture($),ie=$),e.bindTexture(L,Z||ve[L]),me.type=L,me.texture=Z)}h(Dt,"bindTexture");function Ze(){const L=de[ie];L!==void 0&&L.type!==void 0&&(e.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}h(Ze,"unbindTexture");function nt(){try{e.compressedTexImage2D(...arguments)}catch(L){Re("WebGLState:",L)}}h(nt,"compressedTexImage2D");function E(){try{e.compressedTexImage3D(...arguments)}catch(L){Re("WebGLState:",L)}}h(E,"compressedTexImage3D");function M(){try{e.texSubImage2D(...arguments)}catch(L){Re("WebGLState:",L)}}h(M,"texSubImage2D");function I(){try{e.texSubImage3D(...arguments)}catch(L){Re("WebGLState:",L)}}h(I,"texSubImage3D");function X(){try{e.compressedTexSubImage2D(...arguments)}catch(L){Re("WebGLState:",L)}}h(X,"compressedTexSubImage2D");function J(){try{e.compressedTexSubImage3D(...arguments)}catch(L){Re("WebGLState:",L)}}h(J,"compressedTexSubImage3D");function re(){try{e.texStorage2D(...arguments)}catch(L){Re("WebGLState:",L)}}h(re,"texStorage2D");function le(){try{e.texStorage3D(...arguments)}catch(L){Re("WebGLState:",L)}}h(le,"texStorage3D");function D(){try{e.texImage2D(...arguments)}catch(L){Re("WebGLState:",L)}}h(D,"texImage2D");function ne(){try{e.texImage3D(...arguments)}catch(L){Re("WebGLState:",L)}}h(ne,"texImage3D");function ge(L){return d[L]!==void 0?d[L]:e.getParameter(L)}h(ge,"getParameter");function ye(L,Z){d[L]!==Z&&(e.pixelStorei(L,Z),d[L]=Z)}h(ye,"pixelStorei");function j(L){Ye.equals(L)===!1&&(e.scissor(L.x,L.y,L.z,L.w),Ye.copy(L))}h(j,"scissor");function Ee(L){K.equals(L)===!1&&(e.viewport(L.x,L.y,L.z,L.w),K.copy(L))}h(Ee,"viewport");function Te(L,Z){let $=c.get(Z);$===void 0&&($=new WeakMap,c.set(Z,$));let me=$.get(L);me===void 0&&(me=e.getUniformBlockIndex(Z,L.name),$.set(L,me))}h(Te,"updateUBOMapping");function De(L,Z){const $=c.get(Z).get(L);l.get(Z)!==$&&(e.uniformBlockBinding(Z,$,L.__bindingPointIndex),l.set(Z,$))}h(De,"uniformBlockBinding");function We(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),a.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),f={},d={},ie=null,de={},u={},m=new WeakMap,y=[],S=null,g=!1,p=null,R=null,C=null,v=null,A=null,b=null,w=null,_=new ke(0,0,0),T=0,z=!1,P=null,k=null,Y=null,V=null,H=null,Ye.set(0,0,e.canvas.width,e.canvas.height),K.set(0,0,e.canvas.width,e.canvas.height),s.reset(),a.reset(),o.reset()}return h(We,"reset"),{buffers:{color:s,depth:a,stencil:o},enable:pe,disable:Ae,bindFramebuffer:Pe,drawBuffers:Le,useProgram:Ke,setBlending:vt,setMaterial:At,setFlipSided:Ut,setCullFace:it,setLineWidth:_t,setPolygonOffset:mt,setScissorTest:ft,activeTexture:U,bindTexture:Dt,unbindTexture:Ze,compressedTexImage2D:nt,compressedTexImage3D:E,texImage2D:D,texImage3D:ne,pixelStorei:ye,getParameter:ge,updateUBOMapping:Te,uniformBlockBinding:De,texStorage2D:re,texStorage3D:le,texSubImage2D:M,texSubImage3D:I,compressedTexSubImage2D:X,compressedTexSubImage3D:J,scissor:j,viewport:Ee,reset:We}}h(of,"WebGLState");function lf(e,t,i,n,r,s,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ue,f=new WeakMap,d=new Set;let u;const m=new WeakMap;let y=!1;try{y=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function S(E,M){return y?new OffscreenCanvas(E,M):Mr("canvas")}h(S,"createCanvas");function g(E,M,I){let X=1;const J=nt(E);if((J.width>I||J.height>I)&&(X=I/Math.max(J.width,J.height)),X<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){const re=Math.floor(X*J.width),le=Math.floor(X*J.height);u===void 0&&(u=S(re,le));const D=M?S(re,le):u;return D.width=re,D.height=le,D.getContext("2d").drawImage(E,0,0,re,le),Ce("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+re+"x"+le+")."),D}else return"data"in E&&Ce("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),E;return E}h(g,"resizeImage");function p(E){return E.generateMipmaps}h(p,"textureNeedsGenerateMipmaps");function R(E){e.generateMipmap(E)}h(R,"generateMipmap");function C(E){return E.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?e.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}h(C,"getTargetType");function v(E,M,I,X,J,re=!1){if(E!==null){if(e[E]!==void 0)return e[E];Ce("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let le;X&&(le=t.get("EXT_texture_norm16"),le||Ce("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let D=M;if(M===e.RED&&(I===e.FLOAT&&(D=e.R32F),I===e.HALF_FLOAT&&(D=e.R16F),I===e.UNSIGNED_BYTE&&(D=e.R8),I===e.UNSIGNED_SHORT&&le&&(D=le.R16_EXT),I===e.SHORT&&le&&(D=le.R16_SNORM_EXT)),M===e.RED_INTEGER&&(I===e.UNSIGNED_BYTE&&(D=e.R8UI),I===e.UNSIGNED_SHORT&&(D=e.R16UI),I===e.UNSIGNED_INT&&(D=e.R32UI),I===e.BYTE&&(D=e.R8I),I===e.SHORT&&(D=e.R16I),I===e.INT&&(D=e.R32I)),M===e.RG&&(I===e.FLOAT&&(D=e.RG32F),I===e.HALF_FLOAT&&(D=e.RG16F),I===e.UNSIGNED_BYTE&&(D=e.RG8),I===e.UNSIGNED_SHORT&&le&&(D=le.RG16_EXT),I===e.SHORT&&le&&(D=le.RG16_SNORM_EXT)),M===e.RG_INTEGER&&(I===e.UNSIGNED_BYTE&&(D=e.RG8UI),I===e.UNSIGNED_SHORT&&(D=e.RG16UI),I===e.UNSIGNED_INT&&(D=e.RG32UI),I===e.BYTE&&(D=e.RG8I),I===e.SHORT&&(D=e.RG16I),I===e.INT&&(D=e.RG32I)),M===e.RGB_INTEGER&&(I===e.UNSIGNED_BYTE&&(D=e.RGB8UI),I===e.UNSIGNED_SHORT&&(D=e.RGB16UI),I===e.UNSIGNED_INT&&(D=e.RGB32UI),I===e.BYTE&&(D=e.RGB8I),I===e.SHORT&&(D=e.RGB16I),I===e.INT&&(D=e.RGB32I)),M===e.RGBA_INTEGER&&(I===e.UNSIGNED_BYTE&&(D=e.RGBA8UI),I===e.UNSIGNED_SHORT&&(D=e.RGBA16UI),I===e.UNSIGNED_INT&&(D=e.RGBA32UI),I===e.BYTE&&(D=e.RGBA8I),I===e.SHORT&&(D=e.RGBA16I),I===e.INT&&(D=e.RGBA32I)),M===e.RGB&&(I===e.UNSIGNED_SHORT&&le&&(D=le.RGB16_EXT),I===e.SHORT&&le&&(D=le.RGB16_SNORM_EXT),I===e.UNSIGNED_INT_5_9_9_9_REV&&(D=e.RGB9_E5),I===e.UNSIGNED_INT_10F_11F_11F_REV&&(D=e.R11F_G11F_B10F)),M===e.RGBA){const ne=re?vr:Ge.getTransfer(J);I===e.FLOAT&&(D=e.RGBA32F),I===e.HALF_FLOAT&&(D=e.RGBA16F),I===e.UNSIGNED_BYTE&&(D=ne==="srgb"?e.SRGB8_ALPHA8:e.RGBA8),I===e.UNSIGNED_SHORT&&le&&(D=le.RGBA16_EXT),I===e.SHORT&&le&&(D=le.RGBA16_SNORM_EXT),I===e.UNSIGNED_SHORT_4_4_4_4&&(D=e.RGBA4),I===e.UNSIGNED_SHORT_5_5_5_1&&(D=e.RGB5_A1)}return(D===e.R16F||D===e.R32F||D===e.RG16F||D===e.RG32F||D===e.RGBA16F||D===e.RGBA32F)&&t.get("EXT_color_buffer_float"),D}h(v,"getInternalFormat");function A(E,M){let I;return E?M===null||M===1014||M===1020?I=e.DEPTH24_STENCIL8:M===1015?I=e.DEPTH32F_STENCIL8:M===1012&&(I=e.DEPTH24_STENCIL8,Ce("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===1014||M===1020?I=e.DEPTH_COMPONENT24:M===1015?I=e.DEPTH_COMPONENT32F:M===1012&&(I=e.DEPTH_COMPONENT16),I}h(A,"getInternalDepthFormat");function b(E,M){return p(E)===!0||E.isFramebufferTexture&&E.minFilter!==1003&&E.minFilter!==1006?Math.log2(Math.max(M.width,M.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?M.mipmaps.length:1}h(b,"getMipLevels");function w(E){const M=E.target;M.removeEventListener("dispose",w),T(M),M.isVideoTexture&&f.delete(M),M.isHTMLTexture&&d.delete(M)}h(w,"onTextureDispose");function _(E){const M=E.target;M.removeEventListener("dispose",_),P(M)}h(_,"onRenderTargetDispose");function T(E){const M=n.get(E);if(M.__webglInit===void 0)return;const I=E.source,X=m.get(I);if(X){const J=X[M.__cacheKey];J.usedTimes--,J.usedTimes===0&&z(E),Object.keys(X).length===0&&m.delete(I)}n.remove(E)}h(T,"deallocateTexture");function z(E){const M=n.get(E);e.deleteTexture(M.__webglTexture);const I=E.source,X=m.get(I);delete X[M.__cacheKey],a.memory.textures--}h(z,"deleteTexture");function P(E){const M=n.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),n.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(M.__webglFramebuffer[X]))for(let J=0;J<M.__webglFramebuffer[X].length;J++)e.deleteFramebuffer(M.__webglFramebuffer[X][J]);else e.deleteFramebuffer(M.__webglFramebuffer[X]);M.__webglDepthbuffer&&e.deleteRenderbuffer(M.__webglDepthbuffer[X])}else{if(Array.isArray(M.__webglFramebuffer))for(let X=0;X<M.__webglFramebuffer.length;X++)e.deleteFramebuffer(M.__webglFramebuffer[X]);else e.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&e.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&e.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let X=0;X<M.__webglColorRenderbuffer.length;X++)M.__webglColorRenderbuffer[X]&&e.deleteRenderbuffer(M.__webglColorRenderbuffer[X]);M.__webglDepthRenderbuffer&&e.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const I=E.textures;for(let X=0,J=I.length;X<J;X++){const re=n.get(I[X]);re.__webglTexture&&(e.deleteTexture(re.__webglTexture),a.memory.textures--),n.remove(I[X])}n.remove(E)}h(P,"deallocateRenderTarget");let k=0;function Y(){k=0}h(Y,"resetTextureUnits");function V(){return k}h(V,"getTextureUnits");function H(E){k=E}h(H,"setTextureUnits");function q(){const E=k;return E>=r.maxTextures&&Ce("WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+r.maxTextures),k+=1,E}h(q,"allocateTextureUnit");function O(E){const M=[];return M.push(E.wrapS),M.push(E.wrapT),M.push(E.wrapR||0),M.push(E.magFilter),M.push(E.minFilter),M.push(E.anisotropy),M.push(E.internalFormat),M.push(E.format),M.push(E.type),M.push(E.generateMipmaps),M.push(E.premultiplyAlpha),M.push(E.flipY),M.push(E.unpackAlignment),M.push(E.colorSpace),M.join()}h(O,"getTextureCacheKey");function ee(E,M){const I=n.get(E);if(E.isVideoTexture&&Dt(E),E.isRenderTargetTexture===!1&&E.isExternalTexture!==!0&&E.version>0&&I.__version!==E.version){const X=E.image;if(X===null)Ce("WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)Ce("WebGLRenderer: Texture marked for update but image is incomplete");else{Ae(I,E,M);return}}else E.isExternalTexture&&(I.__webglTexture=E.sourceTexture?E.sourceTexture:null);i.bindTexture(e.TEXTURE_2D,I.__webglTexture,e.TEXTURE0+M)}h(ee,"setTexture2D");function te(E,M){const I=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&I.__version!==E.version){Ae(I,E,M);return}else E.isExternalTexture&&(I.__webglTexture=E.sourceTexture?E.sourceTexture:null);i.bindTexture(e.TEXTURE_2D_ARRAY,I.__webglTexture,e.TEXTURE0+M)}h(te,"setTexture2DArray");function ie(E,M){const I=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&I.__version!==E.version){Ae(I,E,M);return}i.bindTexture(e.TEXTURE_3D,I.__webglTexture,e.TEXTURE0+M)}h(ie,"setTexture3D");function de(E,M){const I=n.get(E);if(E.isCubeDepthTexture!==!0&&E.version>0&&I.__version!==E.version){Pe(I,E,M);return}i.bindTexture(e.TEXTURE_CUBE_MAP,I.__webglTexture,e.TEXTURE0+M)}h(de,"setTextureCube");const fe={[hs]:e.REPEAT,[li]:e.CLAMP_TO_EDGE,[us]:e.MIRRORED_REPEAT},He={[bt]:e.NEAREST,[Qo]:e.NEAREST_MIPMAP_NEAREST,[jo]:e.NEAREST_MIPMAP_LINEAR,[Pt]:e.LINEAR,[el]:e.LINEAR_MIPMAP_NEAREST,[Er]:e.LINEAR_MIPMAP_LINEAR},Ye={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function K(E,M){if(M.type===1015&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===1006||M.magFilter===1007||M.magFilter===1005||M.magFilter===1008||M.minFilter===1006||M.minFilter===1007||M.minFilter===1005||M.minFilter===1008)&&Ce("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(E,e.TEXTURE_WRAP_S,fe[M.wrapS]),e.texParameteri(E,e.TEXTURE_WRAP_T,fe[M.wrapT]),(E===e.TEXTURE_3D||E===e.TEXTURE_2D_ARRAY)&&e.texParameteri(E,e.TEXTURE_WRAP_R,fe[M.wrapR]),e.texParameteri(E,e.TEXTURE_MAG_FILTER,He[M.magFilter]),e.texParameteri(E,e.TEXTURE_MIN_FILTER,He[M.minFilter]),M.compareFunction&&(e.texParameteri(E,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(E,e.TEXTURE_COMPARE_FUNC,Ye[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===1003||M.minFilter!==1005&&M.minFilter!==1008||M.type===1015&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){const I=t.get("EXT_texture_filter_anisotropic");e.texParameterf(E,I.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,r.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}h(K,"setTextureParameters");function se(E,M){let I=!1;E.__webglInit===void 0&&(E.__webglInit=!0,M.addEventListener("dispose",w));const X=M.source;let J=m.get(X);J===void 0&&(J={},m.set(X,J));const re=O(M);if(re!==E.__cacheKey){J[re]===void 0&&(J[re]={texture:e.createTexture(),usedTimes:0},a.memory.textures++,I=!0),J[re].usedTimes++;const le=J[E.__cacheKey];le!==void 0&&(J[E.__cacheKey].usedTimes--,le.usedTimes===0&&z(M)),E.__cacheKey=re,E.__webglTexture=J[re].texture}return I}h(se,"initTexture");function ve(E,M,I){return Math.floor(Math.floor(E/I)/M)}h(ve,"getRow");function pe(E,M,I,X){const re=E.updateRanges;if(re.length===0)i.texSubImage2D(e.TEXTURE_2D,0,0,0,M.width,M.height,I,X,M.data);else{re.sort((ye,j)=>ye.start-j.start);let le=0;for(let ye=1;ye<re.length;ye++){const j=re[le],Ee=re[ye],Te=j.start+j.count,De=ve(Ee.start,M.width,4),We=ve(j.start,M.width,4);Ee.start<=Te+1&&De===We&&ve(Ee.start+Ee.count-1,M.width,4)===De?j.count=Math.max(j.count,Ee.start+Ee.count-j.start):(++le,re[le]=Ee)}re.length=le+1;const D=i.getParameter(e.UNPACK_ROW_LENGTH),ne=i.getParameter(e.UNPACK_SKIP_PIXELS),ge=i.getParameter(e.UNPACK_SKIP_ROWS);i.pixelStorei(e.UNPACK_ROW_LENGTH,M.width);for(let ye=0,j=re.length;ye<j;ye++){const Ee=re[ye],Te=Math.floor(Ee.start/4),De=Math.ceil(Ee.count/4),We=Te%M.width,L=Math.floor(Te/M.width),Z=De,$=1;i.pixelStorei(e.UNPACK_SKIP_PIXELS,We),i.pixelStorei(e.UNPACK_SKIP_ROWS,L),i.texSubImage2D(e.TEXTURE_2D,0,We,L,Z,$,I,X,M.data)}E.clearUpdateRanges(),i.pixelStorei(e.UNPACK_ROW_LENGTH,D),i.pixelStorei(e.UNPACK_SKIP_PIXELS,ne),i.pixelStorei(e.UNPACK_SKIP_ROWS,ge)}}h(pe,"updateTexture");function Ae(E,M,I){let X=e.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(X=e.TEXTURE_2D_ARRAY),M.isData3DTexture&&(X=e.TEXTURE_3D);const J=se(E,M),re=M.source;i.bindTexture(X,E.__webglTexture,e.TEXTURE0+I);const le=n.get(re);if(re.version!==le.__version||J===!0){if(i.activeTexture(e.TEXTURE0+I),!(typeof ImageBitmap<"u"&&M.image instanceof ImageBitmap)){const Z=Ge.getPrimaries(Ge.workingColorSpace),$=M.colorSpace===""?null:Ge.getPrimaries(M.colorSpace),me=M.colorSpace===""||Z===$?e.NONE:e.BROWSER_DEFAULT_WEBGL;i.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,me)}i.pixelStorei(e.UNPACK_ALIGNMENT,M.unpackAlignment);let D=g(M.image,!1,r.maxTextureSize);D=Ze(M,D);const ne=s.convert(M.format,M.colorSpace),ge=s.convert(M.type);let ye=v(M.internalFormat,ne,ge,M.normalized,M.colorSpace,M.isVideoTexture);K(X,M);let j;const Ee=M.mipmaps,Te=M.isVideoTexture!==!0,De=le.__version===void 0||J===!0,We=re.dataReady,L=b(M,D);if(M.isDepthTexture)ye=A(M.format===Ba,M.type),De&&(Te?i.texStorage2D(e.TEXTURE_2D,1,ye,D.width,D.height):i.texImage2D(e.TEXTURE_2D,0,ye,D.width,D.height,0,ne,ge,null));else if(M.isDataTexture)if(Ee.length>0){Te&&De&&i.texStorage2D(e.TEXTURE_2D,L,ye,Ee[0].width,Ee[0].height);for(let Z=0,$=Ee.length;Z<$;Z++)j=Ee[Z],Te?We&&i.texSubImage2D(e.TEXTURE_2D,Z,0,0,j.width,j.height,ne,ge,j.data):i.texImage2D(e.TEXTURE_2D,Z,ye,j.width,j.height,0,ne,ge,j.data);M.generateMipmaps=!1}else Te?(De&&i.texStorage2D(e.TEXTURE_2D,L,ye,D.width,D.height),We&&pe(M,D,ne,ge)):i.texImage2D(e.TEXTURE_2D,0,ye,D.width,D.height,0,ne,ge,D.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Te&&De&&i.texStorage3D(e.TEXTURE_2D_ARRAY,L,ye,Ee[0].width,Ee[0].height,D.depth);for(let Z=0,$=Ee.length;Z<$;Z++)if(j=Ee[Z],M.format!==1023)if(ne!==null)if(Te){if(We)if(M.layerUpdates.size>0){const me=ca(j.width,j.height,M.format,M.type);for(const Se of M.layerUpdates){const Q=j.data.subarray(Se*me/j.data.BYTES_PER_ELEMENT,(Se+1)*me/j.data.BYTES_PER_ELEMENT);i.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,Se,j.width,j.height,1,ne,Q)}M.clearLayerUpdates()}else i.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,0,j.width,j.height,D.depth,ne,j.data)}else i.compressedTexImage3D(e.TEXTURE_2D_ARRAY,Z,ye,j.width,j.height,D.depth,0,j.data,0,0);else Ce("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Te?We&&i.texSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,0,j.width,j.height,D.depth,ne,ge,j.data):i.texImage3D(e.TEXTURE_2D_ARRAY,Z,ye,j.width,j.height,D.depth,0,ne,ge,j.data)}else{Te&&De&&i.texStorage2D(e.TEXTURE_2D,L,ye,Ee[0].width,Ee[0].height);for(let Z=0,$=Ee.length;Z<$;Z++)j=Ee[Z],M.format!==1023?ne!==null?Te?We&&i.compressedTexSubImage2D(e.TEXTURE_2D,Z,0,0,j.width,j.height,ne,j.data):i.compressedTexImage2D(e.TEXTURE_2D,Z,ye,j.width,j.height,0,j.data):Ce("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Te?We&&i.texSubImage2D(e.TEXTURE_2D,Z,0,0,j.width,j.height,ne,ge,j.data):i.texImage2D(e.TEXTURE_2D,Z,ye,j.width,j.height,0,ne,ge,j.data)}else if(M.isDataArrayTexture)if(Te){if(De&&i.texStorage3D(e.TEXTURE_2D_ARRAY,L,ye,D.width,D.height,D.depth),We)if(M.layerUpdates.size>0){const Z=ca(D.width,D.height,M.format,M.type);for(const $ of M.layerUpdates){const me=D.data.subarray($*Z/D.data.BYTES_PER_ELEMENT,($+1)*Z/D.data.BYTES_PER_ELEMENT);i.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,$,D.width,D.height,1,ne,ge,me)}M.clearLayerUpdates()}else i.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,D.width,D.height,D.depth,ne,ge,D.data)}else i.texImage3D(e.TEXTURE_2D_ARRAY,0,ye,D.width,D.height,D.depth,0,ne,ge,D.data);else if(M.isData3DTexture)Te?(De&&i.texStorage3D(e.TEXTURE_3D,L,ye,D.width,D.height,D.depth),We&&i.texSubImage3D(e.TEXTURE_3D,0,0,0,0,D.width,D.height,D.depth,ne,ge,D.data)):i.texImage3D(e.TEXTURE_3D,0,ye,D.width,D.height,D.depth,0,ne,ge,D.data);else if(M.isFramebufferTexture){if(De)if(Te)i.texStorage2D(e.TEXTURE_2D,L,ye,D.width,D.height);else{let Z=D.width,$=D.height;for(let me=0;me<L;me++)i.texImage2D(e.TEXTURE_2D,me,ye,Z,$,0,ne,ge,null),Z>>=1,$>>=1}}else if(M.isHTMLTexture){if("texElementImage2D"in e){const Z=e.canvas;if(Z.hasAttribute("layoutsubtree")||Z.setAttribute("layoutsubtree","true"),D.parentNode!==Z){Z.appendChild(D),d.add(M),Z.onpaint=$=>{const me=$.changedElements;for(const Se of d)me.includes(Se.image)&&(Se.needsUpdate=!0)},Z.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,D);else{const me=e.RGBA,Se=e.RGBA,Q=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,me,Se,Q,D)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(Ee.length>0){if(Te&&De){const Z=nt(Ee[0]);i.texStorage2D(e.TEXTURE_2D,L,ye,Z.width,Z.height)}for(let Z=0,$=Ee.length;Z<$;Z++)j=Ee[Z],Te?We&&i.texSubImage2D(e.TEXTURE_2D,Z,0,0,ne,ge,j):i.texImage2D(e.TEXTURE_2D,Z,ye,ne,ge,j);M.generateMipmaps=!1}else if(Te){if(De){const Z=nt(D);i.texStorage2D(e.TEXTURE_2D,L,ye,Z.width,Z.height)}We&&i.texSubImage2D(e.TEXTURE_2D,0,0,0,ne,ge,D)}else i.texImage2D(e.TEXTURE_2D,0,ye,ne,ge,D);p(M)&&R(X),le.__version=re.version,M.onUpdate&&M.onUpdate(M)}E.__version=M.version}h(Ae,"uploadTexture");function Pe(E,M,I){if(M.image.length!==6)return;const X=se(E,M),J=M.source;i.bindTexture(e.TEXTURE_CUBE_MAP,E.__webglTexture,e.TEXTURE0+I);const re=n.get(J);if(J.version!==re.__version||X===!0){i.activeTexture(e.TEXTURE0+I);const le=Ge.getPrimaries(Ge.workingColorSpace),D=M.colorSpace===""?null:Ge.getPrimaries(M.colorSpace),ne=M.colorSpace===""||le===D?e.NONE:e.BROWSER_DEFAULT_WEBGL;i.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(e.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,ne);const ge=M.isCompressedTexture||M.image[0].isCompressedTexture,ye=M.image[0]&&M.image[0].isDataTexture,j=[];for(let Q=0;Q<6;Q++)!ge&&!ye?j[Q]=g(M.image[Q],!0,r.maxCubemapSize):j[Q]=ye?M.image[Q].image:M.image[Q],j[Q]=Ze(M,j[Q]);const Ee=j[0],Te=s.convert(M.format,M.colorSpace),De=s.convert(M.type),We=v(M.internalFormat,Te,De,M.normalized,M.colorSpace),L=M.isVideoTexture!==!0,Z=re.__version===void 0||X===!0,$=J.dataReady;let me=b(M,Ee);K(e.TEXTURE_CUBE_MAP,M);let Se;if(ge){L&&Z&&i.texStorage2D(e.TEXTURE_CUBE_MAP,me,We,Ee.width,Ee.height);for(let Q=0;Q<6;Q++){Se=j[Q].mipmaps;for(let he=0;he<Se.length;he++){const we=Se[he];M.format!==1023?Te!==null?L?$&&i.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,he,0,0,we.width,we.height,Te,we.data):i.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,he,We,we.width,we.height,0,we.data):Ce("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?$&&i.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,he,0,0,we.width,we.height,Te,De,we.data):i.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,he,We,we.width,we.height,0,Te,De,we.data)}}}else{if(Se=M.mipmaps,L&&Z){Se.length>0&&me++;const Q=nt(j[0]);i.texStorage2D(e.TEXTURE_CUBE_MAP,me,We,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(ye){L?$&&i.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,j[Q].width,j[Q].height,Te,De,j[Q].data):i.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,We,j[Q].width,j[Q].height,0,Te,De,j[Q].data);for(let he=0;he<Se.length;he++){const we=Se[he].image[Q].image;L?$&&i.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,he+1,0,0,we.width,we.height,Te,De,we.data):i.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,he+1,We,we.width,we.height,0,Te,De,we.data)}}else{L?$&&i.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Te,De,j[Q]):i.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,We,Te,De,j[Q]);for(let he=0;he<Se.length;he++){const we=Se[he];L?$&&i.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,he+1,0,0,Te,De,we.image[Q]):i.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,he+1,We,Te,De,we.image[Q])}}}p(M)&&R(e.TEXTURE_CUBE_MAP),re.__version=J.version,M.onUpdate&&M.onUpdate(M)}E.__version=M.version}h(Pe,"uploadCubeTexture");function Le(E,M,I,X,J,re){const le=s.convert(I.format,I.colorSpace),D=s.convert(I.type),ne=v(I.internalFormat,le,D,I.normalized,I.colorSpace),ge=n.get(M),ye=n.get(I);if(ye.__renderTarget=M,!ge.__hasExternalTextures){const j=Math.max(1,M.width>>re),Ee=Math.max(1,M.height>>re);J===e.TEXTURE_3D||J===e.TEXTURE_2D_ARRAY?i.texImage3D(J,re,ne,j,Ee,M.depth,0,le,D,null):i.texImage2D(J,re,ne,j,Ee,0,le,D,null)}i.bindFramebuffer(e.FRAMEBUFFER,E),U(M)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,X,J,ye.__webglTexture,0,ft(M)):(J===e.TEXTURE_2D||J>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,X,J,ye.__webglTexture,re),i.bindFramebuffer(e.FRAMEBUFFER,null)}h(Le,"setupFrameBufferTexture");function Ke(E,M,I){if(e.bindRenderbuffer(e.RENDERBUFFER,E),M.depthBuffer){const X=M.depthTexture,J=X&&X.isDepthTexture?X.type:null,re=A(M.stencilBuffer,J),le=M.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;U(M)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ft(M),re,M.width,M.height):I?e.renderbufferStorageMultisample(e.RENDERBUFFER,ft(M),re,M.width,M.height):e.renderbufferStorage(e.RENDERBUFFER,re,M.width,M.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,le,e.RENDERBUFFER,E)}else{const X=M.textures;for(let J=0;J<X.length;J++){const re=X[J],le=s.convert(re.format,re.colorSpace),D=s.convert(re.type),ne=v(re.internalFormat,le,D,re.normalized,re.colorSpace);U(M)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ft(M),ne,M.width,M.height):I?e.renderbufferStorageMultisample(e.RENDERBUFFER,ft(M),ne,M.width,M.height):e.renderbufferStorage(e.RENDERBUFFER,ne,M.width,M.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}h(Ke,"setupRenderBufferStorage");function Ve(E,M,I){const X=M.isWebGLCubeRenderTarget===!0;if(i.bindFramebuffer(e.FRAMEBUFFER,E),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const J=n.get(M.depthTexture);if(J.__renderTarget=M,(!J.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),X){if(J.__webglInit===void 0&&(J.__webglInit=!0,M.depthTexture.addEventListener("dispose",w)),J.__webglTexture===void 0){J.__webglTexture=e.createTexture(),i.bindTexture(e.TEXTURE_CUBE_MAP,J.__webglTexture),K(e.TEXTURE_CUBE_MAP,M.depthTexture);const ge=s.convert(M.depthTexture.format),ye=s.convert(M.depthTexture.type);let j;M.depthTexture.format===1026?j=e.DEPTH_COMPONENT24:M.depthTexture.format===1027&&(j=e.DEPTH24_STENCIL8);for(let Ee=0;Ee<6;Ee++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,j,M.width,M.height,0,ge,ye,null)}}else ee(M.depthTexture,0);const re=J.__webglTexture,le=ft(M),D=X?e.TEXTURE_CUBE_MAP_POSITIVE_X+I:e.TEXTURE_2D,ne=M.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(M.depthTexture.format===1026)U(M)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,ne,D,re,0,le):e.framebufferTexture2D(e.FRAMEBUFFER,ne,D,re,0);else if(M.depthTexture.format===1027)U(M)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,ne,D,re,0,le):e.framebufferTexture2D(e.FRAMEBUFFER,ne,D,re,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}h(Ve,"setupDepthTexture");function tt(E){const M=n.get(E),I=E.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==E.depthTexture){const X=E.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),X){const J=h(()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,X.removeEventListener("dispose",J)},"disposeEvent");X.addEventListener("dispose",J),M.__depthDisposeCallback=J}M.__boundDepthTexture=X}if(E.depthTexture&&!M.__autoAllocateDepthBuffer)if(I)for(let X=0;X<6;X++)Ve(M.__webglFramebuffer[X],E,X);else{const X=E.texture.mipmaps;X&&X.length>0?Ve(M.__webglFramebuffer[0],E,0):Ve(M.__webglFramebuffer,E,0)}else if(I){M.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(i.bindFramebuffer(e.FRAMEBUFFER,M.__webglFramebuffer[X]),M.__webglDepthbuffer[X]===void 0)M.__webglDepthbuffer[X]=e.createRenderbuffer(),Ke(M.__webglDepthbuffer[X],E,!1);else{const J=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,re=M.__webglDepthbuffer[X];e.bindRenderbuffer(e.RENDERBUFFER,re),e.framebufferRenderbuffer(e.FRAMEBUFFER,J,e.RENDERBUFFER,re)}}else{const X=E.texture.mipmaps;if(X&&X.length>0?i.bindFramebuffer(e.FRAMEBUFFER,M.__webglFramebuffer[0]):i.bindFramebuffer(e.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=e.createRenderbuffer(),Ke(M.__webglDepthbuffer,E,!1);else{const J=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,re=M.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,re),e.framebufferRenderbuffer(e.FRAMEBUFFER,J,e.RENDERBUFFER,re)}}i.bindFramebuffer(e.FRAMEBUFFER,null)}h(tt,"setupDepthRenderbuffer");function vt(E,M,I){const X=n.get(E);M!==void 0&&Le(X.__webglFramebuffer,E,E.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),I!==void 0&&tt(E)}h(vt,"rebindTextures");function At(E){const M=E.texture,I=n.get(E),X=n.get(M);E.addEventListener("dispose",_);const J=E.textures,re=E.isWebGLCubeRenderTarget===!0,le=J.length>1;if(le||(X.__webglTexture===void 0&&(X.__webglTexture=e.createTexture()),X.__version=M.version,a.memory.textures++),re){I.__webglFramebuffer=[];for(let D=0;D<6;D++)if(M.mipmaps&&M.mipmaps.length>0){I.__webglFramebuffer[D]=[];for(let ne=0;ne<M.mipmaps.length;ne++)I.__webglFramebuffer[D][ne]=e.createFramebuffer()}else I.__webglFramebuffer[D]=e.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){I.__webglFramebuffer=[];for(let D=0;D<M.mipmaps.length;D++)I.__webglFramebuffer[D]=e.createFramebuffer()}else I.__webglFramebuffer=e.createFramebuffer();if(le)for(let D=0,ne=J.length;D<ne;D++){const ge=n.get(J[D]);ge.__webglTexture===void 0&&(ge.__webglTexture=e.createTexture(),a.memory.textures++)}if(E.samples>0&&U(E)===!1){I.__webglMultisampledFramebuffer=e.createFramebuffer(),I.__webglColorRenderbuffer=[],i.bindFramebuffer(e.FRAMEBUFFER,I.__webglMultisampledFramebuffer);for(let D=0;D<J.length;D++){const ne=J[D];I.__webglColorRenderbuffer[D]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,I.__webglColorRenderbuffer[D]);const ge=s.convert(ne.format,ne.colorSpace),ye=s.convert(ne.type),j=v(ne.internalFormat,ge,ye,ne.normalized,ne.colorSpace,E.isXRRenderTarget===!0),Ee=ft(E);e.renderbufferStorageMultisample(e.RENDERBUFFER,Ee,j,E.width,E.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+D,e.RENDERBUFFER,I.__webglColorRenderbuffer[D])}e.bindRenderbuffer(e.RENDERBUFFER,null),E.depthBuffer&&(I.__webglDepthRenderbuffer=e.createRenderbuffer(),Ke(I.__webglDepthRenderbuffer,E,!0)),i.bindFramebuffer(e.FRAMEBUFFER,null)}}if(re){i.bindTexture(e.TEXTURE_CUBE_MAP,X.__webglTexture),K(e.TEXTURE_CUBE_MAP,M);for(let D=0;D<6;D++)if(M.mipmaps&&M.mipmaps.length>0)for(let ne=0;ne<M.mipmaps.length;ne++)Le(I.__webglFramebuffer[D][ne],E,M,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+D,ne);else Le(I.__webglFramebuffer[D],E,M,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+D,0);p(M)&&R(e.TEXTURE_CUBE_MAP),i.unbindTexture()}else if(le){for(let D=0,ne=J.length;D<ne;D++){const ge=J[D],ye=n.get(ge);let j=e.TEXTURE_2D;(E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(j=E.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),i.bindTexture(j,ye.__webglTexture),K(j,ge),Le(I.__webglFramebuffer,E,ge,e.COLOR_ATTACHMENT0+D,j,0),p(ge)&&R(j)}i.unbindTexture()}else{let D=e.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(D=E.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),i.bindTexture(D,X.__webglTexture),K(D,M),M.mipmaps&&M.mipmaps.length>0)for(let ne=0;ne<M.mipmaps.length;ne++)Le(I.__webglFramebuffer[ne],E,M,e.COLOR_ATTACHMENT0,D,ne);else Le(I.__webglFramebuffer,E,M,e.COLOR_ATTACHMENT0,D,0);p(M)&&R(D),i.unbindTexture()}E.depthBuffer&&tt(E)}h(At,"setupRenderTarget");function Ut(E){const M=E.textures;for(let I=0,X=M.length;I<X;I++){const J=M[I];if(p(J)){const re=C(E),le=n.get(J).__webglTexture;i.bindTexture(re,le),R(re),i.unbindTexture()}}}h(Ut,"updateRenderTargetMipmap");const it=[],_t=[];function mt(E){if(E.samples>0){if(U(E)===!1){const M=E.textures,I=E.width,X=E.height;let J=e.COLOR_BUFFER_BIT;const re=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,le=n.get(E),D=M.length>1;if(D)for(let ge=0;ge<M.length;ge++)i.bindFramebuffer(e.FRAMEBUFFER,le.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ge,e.RENDERBUFFER,null),i.bindFramebuffer(e.FRAMEBUFFER,le.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ge,e.TEXTURE_2D,null,0);i.bindFramebuffer(e.READ_FRAMEBUFFER,le.__webglMultisampledFramebuffer);const ne=E.texture.mipmaps;ne&&ne.length>0?i.bindFramebuffer(e.DRAW_FRAMEBUFFER,le.__webglFramebuffer[0]):i.bindFramebuffer(e.DRAW_FRAMEBUFFER,le.__webglFramebuffer);for(let ge=0;ge<M.length;ge++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(J|=e.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(J|=e.STENCIL_BUFFER_BIT)),D){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,le.__webglColorRenderbuffer[ge]);const ye=n.get(M[ge]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,ye,0)}e.blitFramebuffer(0,0,I,X,0,0,I,X,J,e.NEAREST),l===!0&&(it.length=0,_t.length=0,it.push(e.COLOR_ATTACHMENT0+ge),E.depthBuffer&&E.resolveDepthBuffer===!1&&(it.push(re),_t.push(re),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,_t)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,it))}if(i.bindFramebuffer(e.READ_FRAMEBUFFER,null),i.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),D)for(let ge=0;ge<M.length;ge++){i.bindFramebuffer(e.FRAMEBUFFER,le.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ge,e.RENDERBUFFER,le.__webglColorRenderbuffer[ge]);const ye=n.get(M[ge]).__webglTexture;i.bindFramebuffer(e.FRAMEBUFFER,le.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ge,e.TEXTURE_2D,ye,0)}i.bindFramebuffer(e.DRAW_FRAMEBUFFER,le.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&l){const M=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[M])}}}h(mt,"updateMultisampleRenderTarget");function ft(E){return Math.min(r.maxSamples,E.samples)}h(ft,"getRenderTargetSamples");function U(E){const M=n.get(E);return E.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}h(U,"useMultisampledRTT");function Dt(E){const M=a.render.frame;f.get(E)!==M&&(f.set(E,M),E.update())}h(Dt,"updateVideoTexture");function Ze(E,M){const I=E.colorSpace,X=E.format,J=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||I!=="srgb-linear"&&I!==""&&(Ge.getTransfer(I)==="srgb"?(X!==1023||J!==1009)&&Ce("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Re("WebGLTextures: Unsupported texture color space:",I)),M}h(Ze,"verifyColorSpace");function nt(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(c.width=E.naturalWidth||E.width,c.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(c.width=E.displayWidth,c.height=E.displayHeight):(c.width=E.width,c.height=E.height),c}h(nt,"getDimensions"),this.allocateTextureUnit=q,this.resetTextureUnits=Y,this.getTextureUnits=V,this.setTextureUnits=H,this.setTexture2D=ee,this.setTexture2DArray=te,this.setTexture3D=ie,this.setTextureCube=de,this.rebindTextures=vt,this.setupRenderTarget=At,this.updateRenderTargetMipmap=Ut,this.updateMultisampleRenderTarget=mt,this.setupDepthRenderbuffer=tt,this.setupFrameBufferTexture=Le,this.useMultisampledRTT=U,this.isReversedDepthBuffer=function(){return i.buffers.depth.getReversed()}}h(lf,"WebGLTextures");function cf(e,t){function i(n,r=""){let s;const a=Ge.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779)if(a==="srgb")if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===33776)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===33776)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===35840||n===35841||n===35842||n===35843)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===35840)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(n===36196||n===37492)return a==="srgb"?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===37496)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return s.COMPRESSED_R11_EAC;if(n===37489)return s.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return s.COMPRESSED_RG11_EAC;if(n===37491)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(n===37808)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===36492||n===36494||n===36495)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(n===36492)return a==="srgb"?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===36283||n===36284||n===36285||n===36286)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(n===36283)return s.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===1020?e.UNSIGNED_INT_24_8:e[n]!==void 0?e[n]:null}return h(i,"convert"),{convert:i}}h(cf,"WebGLUtils");var hf=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,uf=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,ff=class{static{h(this,"WebXRDepthSensing")}constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new ao(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new qt({vertexShader:hf,fragmentShader:uf,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new It(new Es(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},df=class extends Di{static{h(this,"WebXRManager")}constructor(e,t){super();const i=this;let n=null,r=1,s=null,a="local-floor",o=1,l=null,c=null,f=null,d=null,u=null,m=null;const y=typeof XRWebGLBinding<"u",S=new ff,g={},p=t.getContextAttributes();let R=null,C=null;const v=[],A=[],b=new Ue;let w=null;const _=new Xt;_.viewport=new ut;const T=new Xt;T.viewport=new ut;const z=[_,T],P=new qc;let k=null,Y=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let se=v[K];return se===void 0&&(se=new zr,v[K]=se),se.getTargetRaySpace()},this.getControllerGrip=function(K){let se=v[K];return se===void 0&&(se=new zr,v[K]=se),se.getGripSpace()},this.getHand=function(K){let se=v[K];return se===void 0&&(se=new zr,v[K]=se),se.getHandSpace()};function V(K){const se=A.indexOf(K.inputSource);if(se===-1)return;const ve=v[se];ve!==void 0&&(ve.update(K.inputSource,K.frame,l||s),ve.dispatchEvent({type:K.type,data:K.inputSource}))}h(V,"onSessionEvent");function H(){n.removeEventListener("select",V),n.removeEventListener("selectstart",V),n.removeEventListener("selectend",V),n.removeEventListener("squeeze",V),n.removeEventListener("squeezestart",V),n.removeEventListener("squeezeend",V),n.removeEventListener("end",H),n.removeEventListener("inputsourceschange",q);for(let K=0;K<v.length;K++){const se=A[K];se!==null&&(A[K]=null,v[K].disconnect(se))}k=null,Y=null,S.reset();for(const K in g)delete g[K];e.setRenderTarget(R),u=null,d=null,f=null,n=null,C=null,Ye.stop(),i.isPresenting=!1,e.setPixelRatio(w),e.setSize(b.width,b.height,!1),i.dispatchEvent({type:"sessionend"})}h(H,"onSessionEnd"),this.setFramebufferScaleFactor=function(K){r=K,i.isPresenting===!0&&Ce("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){a=K,i.isPresenting===!0&&Ce("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||s},this.setReferenceSpace=function(K){l=K},this.getBaseLayer=function(){return d!==null?d:u},this.getBinding=function(){return f===null&&y&&(f=new XRWebGLBinding(n,t)),f},this.getFrame=function(){return m},this.getSession=function(){return n},this.setSession=async function(K){if(n=K,n!==null){if(R=e.getRenderTarget(),n.addEventListener("select",V),n.addEventListener("selectstart",V),n.addEventListener("selectend",V),n.addEventListener("squeeze",V),n.addEventListener("squeezestart",V),n.addEventListener("squeezeend",V),n.addEventListener("end",H),n.addEventListener("inputsourceschange",q),p.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(b),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let se=null,ve=null,pe=null;p.depth&&(pe=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,se=p.stencil?Ba:In,ve=p.stencil?Oa:Li);const Ae={colorFormat:t.RGBA8,depthFormat:pe,scaleFactor:r};f=this.getBinding(),d=f.createProjectionLayer(Ae),n.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),C=new jt(d.textureWidth,d.textureHeight,{format:Pn,type:Ii,depthTexture:new un(d.textureWidth,d.textureHeight,ve,void 0,void 0,void 0,void 0,void 0,void 0,se),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const se={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:r};u=new XRWebGLLayer(n,t,se),n.updateRenderState({baseLayer:u}),e.setPixelRatio(1),e.setSize(u.framebufferWidth,u.framebufferHeight,!1),C=new jt(u.framebufferWidth,u.framebufferHeight,{format:Pn,type:Ii,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}C.isXRRenderTarget=!0,this.setFoveation(o),l=null,s=await n.requestReferenceSpace(a),Ye.setContext(n),Ye.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return S.getDepthTexture()};function q(K){for(let se=0;se<K.removed.length;se++){const ve=K.removed[se],pe=A.indexOf(ve);pe>=0&&(A[pe]=null,v[pe].disconnect(ve))}for(let se=0;se<K.added.length;se++){const ve=K.added[se];let pe=A.indexOf(ve);if(pe===-1){for(let Pe=0;Pe<v.length;Pe++)if(Pe>=A.length){A.push(ve),pe=Pe;break}else if(A[Pe]===null){A[Pe]=ve,pe=Pe;break}if(pe===-1)break}const Ae=v[pe];Ae&&Ae.connect(ve)}}h(q,"onInputSourcesChange");const O=new F,ee=new F;function te(K,se,ve){O.setFromMatrixPosition(se.matrixWorld),ee.setFromMatrixPosition(ve.matrixWorld);const pe=O.distanceTo(ee),Ae=se.projectionMatrix.elements,Pe=ve.projectionMatrix.elements,Le=Ae[14]/(Ae[10]-1),Ke=Ae[14]/(Ae[10]+1),Ve=(Ae[9]+1)/Ae[5],tt=(Ae[9]-1)/Ae[5],vt=(Ae[8]-1)/Ae[0],At=(Pe[8]+1)/Pe[0],Ut=Le*vt,it=Le*At,_t=pe/(-vt+At),mt=_t*-vt;if(se.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(mt),K.translateZ(_t),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Ae[10]===-1)K.projectionMatrix.copy(se.projectionMatrix),K.projectionMatrixInverse.copy(se.projectionMatrixInverse);else{const ft=Le+_t,U=Ke+_t,Dt=Ut-mt,Ze=it+(pe-mt),nt=Ve*Ke/U*ft,E=tt*Ke/U*ft;K.projectionMatrix.makePerspective(Dt,Ze,nt,E,ft,U),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}h(te,"setProjectionFromUnion");function ie(K,se){se===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(se.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}h(ie,"updateCamera"),this.updateCamera=function(K){if(n===null)return;let se=K.near,ve=K.far;S.texture!==null&&(S.depthNear>0&&(se=S.depthNear),S.depthFar>0&&(ve=S.depthFar)),P.near=T.near=_.near=se,P.far=T.far=_.far=ve,(k!==P.near||Y!==P.far)&&(n.updateRenderState({depthNear:P.near,depthFar:P.far}),k=P.near,Y=P.far),P.layers.mask=K.layers.mask|6,_.layers.mask=P.layers.mask&-5,T.layers.mask=P.layers.mask&-3;const pe=K.parent,Ae=P.cameras;ie(P,pe);for(let Pe=0;Pe<Ae.length;Pe++)ie(Ae[Pe],pe);Ae.length===2?te(P,_,T):P.projectionMatrix.copy(_.projectionMatrix),de(K,P,pe)};function de(K,se,ve){ve===null?K.matrix.copy(se.matrixWorld):(K.matrix.copy(ve.matrixWorld),K.matrix.invert(),K.matrix.multiply(se.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(se.projectionMatrix),K.projectionMatrixInverse.copy(se.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=ps*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}h(de,"updateUserCamera"),this.getCamera=function(){return P},this.getFoveation=function(){if(!(d===null&&u===null))return o},this.setFoveation=function(K){o=K,d!==null&&(d.fixedFoveation=K),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=K)},this.hasDepthSensing=function(){return S.texture!==null},this.getDepthSensingMesh=function(){return S.getMesh(P)},this.getCameraTexture=function(K){return g[K]};let fe=null;function He(K,se){if(c=se.getViewerPose(l||s),m=se,c!==null){const ve=c.views;u!==null&&(e.setRenderTargetFramebuffer(C,u.framebuffer),e.setRenderTarget(C));let pe=!1;ve.length!==P.cameras.length&&(P.cameras.length=0,pe=!0);for(let Pe=0;Pe<ve.length;Pe++){const Le=ve[Pe];let Ke=null;if(u!==null)Ke=u.getViewport(Le);else{const tt=f.getViewSubImage(d,Le);Ke=tt.viewport,Pe===0&&(e.setRenderTargetTextures(C,tt.colorTexture,tt.depthStencilTexture),e.setRenderTarget(C))}let Ve=z[Pe];Ve===void 0&&(Ve=new Xt,Ve.layers.enable(Pe),Ve.viewport=new ut,z[Pe]=Ve),Ve.matrix.fromArray(Le.transform.matrix),Ve.matrix.decompose(Ve.position,Ve.quaternion,Ve.scale),Ve.projectionMatrix.fromArray(Le.projectionMatrix),Ve.projectionMatrixInverse.copy(Ve.projectionMatrix).invert(),Ve.viewport.set(Ke.x,Ke.y,Ke.width,Ke.height),Pe===0&&(P.matrix.copy(Ve.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale)),pe===!0&&P.cameras.push(Ve)}const Ae=n.enabledFeatures;if(Ae&&Ae.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&y){f=i.getBinding();const Pe=f.getDepthInformation(ve[0]);Pe&&Pe.isValid&&Pe.texture&&S.init(Pe,n.renderState)}if(Ae&&Ae.includes("camera-access")&&y){e.state.unbindTexture(),f=i.getBinding();for(let Pe=0;Pe<ve.length;Pe++){const Le=ve[Pe].camera;if(Le){let Ke=g[Le];Ke||(Ke=new ao,g[Le]=Ke);const Ve=f.getCameraImage(Le);Ke.sourceTexture=Ve}}}}for(let ve=0;ve<v.length;ve++){const pe=A[ve],Ae=v[ve];pe!==null&&Ae!==void 0&&Ae.update(pe,se,l||s)}fe&&fe(K,se),se.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:se}),m=null}h(He,"onAnimationFrame");const Ye=new _o;Ye.setAnimationLoop(He),this.setAnimationLoop=function(K){fe=K},this.dispose=function(){}}},pf=new lt,bo=new Ne;bo.set(-1,0,0,0,1,0,0,0,1);function mf(e,t){function i(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}h(i,"refreshTransformUniform");function n(g,p){p.color.getRGB(g.fogColor.value,po(e)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}h(n,"refreshFogUniforms");function r(g,p,R,C,v){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?s(g,p):p.isMeshLambertMaterial?(s(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(s(g,p),d(g,p)):p.isMeshPhongMaterial?(s(g,p),f(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(s(g,p),u(g,p),p.isMeshPhysicalMaterial&&m(g,p,v)):p.isMeshMatcapMaterial?(s(g,p),y(g,p)):p.isMeshDepthMaterial?s(g,p):p.isMeshDistanceMaterial?(s(g,p),S(g,p)):p.isMeshNormalMaterial?s(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,R,C):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}h(r,"refreshMaterialUniforms");function s(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,i(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,i(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,i(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===1&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,i(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===1&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,i(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,i(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,i(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);const R=t.get(p),C=R.envMap,v=R.envMapRotation;C&&(g.envMap.value=C,g.envMapRotation.value.setFromMatrix4(pf.makeRotationFromEuler(v)).transpose(),C.isCubeTexture&&C.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(bo),g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,i(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,i(p.aoMap,g.aoMapTransform))}h(s,"refreshUniformsCommon");function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,i(p.map,g.mapTransform))}h(a,"refreshUniformsLine");function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}h(o,"refreshUniformsDash");function l(g,p,R,C){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*R,g.scale.value=C*.5,p.map&&(g.map.value=p.map,i(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,i(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}h(l,"refreshUniformsPoints");function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,i(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,i(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}h(c,"refreshUniformsSprites");function f(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}h(f,"refreshUniformsPhong");function d(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}h(d,"refreshUniformsToon");function u(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,i(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,i(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}h(u,"refreshUniformsStandard");function m(g,p,R){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,i(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,i(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,i(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,i(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,i(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===1&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,i(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,i(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=R.texture,g.transmissionSamplerSize.value.set(R.width,R.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,i(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,i(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,i(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,i(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,i(p.specularIntensityMap,g.specularIntensityMapTransform))}h(m,"refreshUniformsPhysical");function y(g,p){p.matcap&&(g.matcap.value=p.matcap)}h(y,"refreshUniformsMatcap");function S(g,p){const R=t.get(p).light;g.referencePosition.value.setFromMatrixPosition(R.matrixWorld),g.nearDistance.value=R.shadow.camera.near,g.farDistance.value=R.shadow.camera.far}return h(S,"refreshUniformsDistance"),{refreshFogUniforms:n,refreshMaterialUniforms:r}}h(mf,"WebGLMaterials");function gf(e,t,i,n){let r={},s={},a=[];const o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,A){const b=A.program;n.uniformBlockBinding(v,b)}h(l,"bind");function c(v,A){let b=r[v.id];b===void 0&&(g(v),b=f(v),r[v.id]=b,v.addEventListener("dispose",R));const w=A.program;n.updateUBOMapping(v,w);const _=t.render.frame;s[v.id]!==_&&(u(v),s[v.id]=_)}h(c,"update");function f(v){const A=d();v.__bindingPointIndex=A;const b=e.createBuffer(),w=v.__size,_=v.usage;return e.bindBuffer(e.UNIFORM_BUFFER,b),e.bufferData(e.UNIFORM_BUFFER,w,_),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,A,b),b}h(f,"createBuffer");function d(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return Re("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}h(d,"allocateBindingPointIndex");function u(v){const A=r[v.id],b=v.uniforms,w=v.__cache;e.bindBuffer(e.UNIFORM_BUFFER,A);for(let _=0,T=b.length;_<T;_++){const z=b[_];if(Array.isArray(z))for(let P=0,k=z.length;P<k;P++)m(z[P],_,P,w);else m(z,_,0,w)}e.bindBuffer(e.UNIFORM_BUFFER,null)}h(u,"updateBufferData");function m(v,A,b,w){if(S(v,A,b,w)===!0){const _=v.__offset,T=v.value;if(Array.isArray(T)){let z=0;for(let P=0;P<T.length;P++){const k=T[P],Y=p(k);y(k,v.__data,z),typeof k!="number"&&typeof k!="boolean"&&!k.isMatrix3&&!ArrayBuffer.isView(k)&&(z+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}}else y(T,v.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,_,v.__data)}}h(m,"updateUniform");function y(v,A,b){typeof v=="number"||typeof v=="boolean"?A[0]=v:v.isMatrix3?(A[0]=v.elements[0],A[1]=v.elements[1],A[2]=v.elements[2],A[3]=0,A[4]=v.elements[3],A[5]=v.elements[4],A[6]=v.elements[5],A[7]=0,A[8]=v.elements[6],A[9]=v.elements[7],A[10]=v.elements[8],A[11]=0):ArrayBuffer.isView(v)?A.set(new v.constructor(v.buffer,v.byteOffset,A.length)):v.toArray(A,b)}h(y,"writeUniformValue");function S(v,A,b,w){const _=v.value,T=A+"_"+b;if(w[T]===void 0)return typeof _=="number"||typeof _=="boolean"?w[T]=_:ArrayBuffer.isView(_)?w[T]=_.slice():w[T]=_.clone(),!0;{const z=w[T];if(typeof _=="number"||typeof _=="boolean"){if(z!==_)return w[T]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(z.equals(_)===!1)return z.copy(_),!0}}return!1}h(S,"hasUniformChanged");function g(v){const A=v.uniforms;let b=0;const w=16;for(let T=0,z=A.length;T<z;T++){const P=Array.isArray(A[T])?A[T]:[A[T]];for(let k=0,Y=P.length;k<Y;k++){const V=P[k],H=Array.isArray(V.value)?V.value:[V.value];for(let q=0,O=H.length;q<O;q++){const ee=H[q],te=p(ee),ie=b%w,de=ie%te.boundary,fe=ie+de;b+=de,fe!==0&&w-fe<te.storage&&(b+=w-fe),V.__data=new Float32Array(te.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=b,b+=te.storage}}}const _=b%w;return _>0&&(b+=w-_),v.__size=b,v.__cache={},this}h(g,"prepareUniformsGroup");function p(v){const A={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(A.boundary=4,A.storage=4):v.isVector2?(A.boundary=8,A.storage=8):v.isVector3||v.isColor?(A.boundary=16,A.storage=12):v.isVector4?(A.boundary=16,A.storage=16):v.isMatrix3?(A.boundary=48,A.storage=48):v.isMatrix4?(A.boundary=64,A.storage=64):v.isTexture?Ce("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(A.boundary=16,A.storage=v.byteLength):Ce("WebGLRenderer: Unsupported uniform value type.",v),A}h(p,"getUniformSize");function R(v){const A=v.target;A.removeEventListener("dispose",R);const b=a.indexOf(A.__bindingPointIndex);a.splice(b,1),e.deleteBuffer(r[A.id]),delete r[A.id],delete s[A.id]}h(R,"onUniformsGroupsDispose");function C(){for(const v in r)e.deleteBuffer(r[v]);a=[],r={},s={}}return h(C,"dispose"),{bind:l,update:c,dispose:C}}h(gf,"WebGLUniformsGroups");var vf=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Jt=null;function _f(){return Jt===null&&(Jt=new Mc(vf,16,16,mr,Ui),Jt.name="DFG_LUT",Jt.minFilter=Pt,Jt.magFilter=Pt,Jt.wrapS=li,Jt.wrapT=li,Jt.generateMipmaps=!1,Jt.needsUpdate=!0),Jt}h(_f,"getDFGLUT");var Mf=class{static{h(this,"WebGLRenderer")}constructor(e={}){const{canvas:t=Kl(),context:i=null,depth:n=!0,stencil:r=!1,alpha:s=!1,antialias:a=!1,premultipliedAlpha:o=!0,preserveDrawingBuffer:l=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:d=!1,outputBufferType:u=Ii}=e;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=s;const y=u,S=new Set([Ga,Va,za]),g=new Set([Ii,Li,Da,Oa,Na,Fa]),p=new Uint32Array(4),R=new Int32Array(4),C=new F;let v=null,A=null;const b=[],w=[];let _=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const T=this;let z=!1,P=null,k=null,Y=null,V=null;this._outputColorSpace=wt;let H=0,q=0,O=null,ee=-1,te=null;const ie=new ut,de=new ut;let fe=null;const He=new ke(0);let Ye=0,K=t.width,se=t.height,ve=1,pe=null,Ae=null;const Pe=new ut(0,0,K,se),Le=new ut(0,0,K,se);let Ke=!1;const Ve=new ro;let tt=!1,vt=!1;const At=new lt,Ut=new F,it=new ut,_t={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let mt=!1;function ft(){return O===null?ve:1}h(ft,"getTargetPixelRatio");let U=i;function Dt(x,N){return t.getContext(x,N)}h(Dt,"getContext");try{const x={alpha:!0,depth:n,stencil:r,antialias:a,premultipliedAlpha:o,preserveDrawingBuffer:l,powerPreference:c,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r185"),t.addEventListener("webglcontextlost",we,!1),t.addEventListener("webglcontextrestored",xt,!1),t.addEventListener("webglcontextcreationerror",je,!1),U===null){const N="webgl2";if(U=Dt(N,x),U===null)throw Dt(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(x){throw Re("WebGLRenderer: "+x.message),x}let Ze,nt,E,M,I,X,J,re,le,D,ne,ge,ye,j,Ee,Te,De,We,L,Z,$,me,Se;function Q(){Ze=new vh(U),Ze.init(),$=new cf(U,Ze),nt=new ch(U,Ze,e,$),E=new of(U,Ze),nt.reversedDepthBuffer&&d&&E.buffers.depth.setReversed(!0),k=U.createFramebuffer(),Y=U.createFramebuffer(),V=U.createFramebuffer(),M=new Sh(U),I=new qu,X=new lf(U,Ze,E,I,nt,$,M),J=new gh(T),re=new rh(U),me=new oh(U,re),le=new _h(U,re,M,me),D=new xh(U,le,re,me,M),We=new yh(U,nt,X),Ee=new hh(I),ne=new Xu(T,J,Ze,nt,me,Ee),ge=new mf(T,I),ye=new Ku,j=new ef(Ze),De=new ah(T,J,E,D,m,o),Te=new af(T,D,nt),Se=new gf(U,M,nt,E),L=new lh(U,Ze,M),Z=new Mh(U,Ze,M),M.programs=ne.programs,T.capabilities=nt,T.extensions=Ze,T.properties=I,T.renderLists=ye,T.shadowMap=Te,T.state=E,T.info=M}h(Q,"initGLContext"),Q(),y!==1009&&(_=new Th(y,t.width,t.height,a,n,r));const he=new df(T,U);this.xr=he,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const x=Ze.get("WEBGL_lose_context");x&&x.loseContext()},this.forceContextRestore=function(){const x=Ze.get("WEBGL_lose_context");x&&x.restoreContext()},this.getPixelRatio=function(){return ve},this.setPixelRatio=function(x){x!==void 0&&(ve=x,this.setSize(K,se,!1))},this.getSize=function(x){return x.set(K,se)},this.setSize=function(x,N,W=!0){if(he.isPresenting){Ce("WebGLRenderer: Can't change size while VR device is presenting.");return}K=x,se=N,t.width=Math.floor(x*ve),t.height=Math.floor(N*ve),W===!0&&(t.style.width=x+"px",t.style.height=N+"px"),_!==null&&_.setSize(t.width,t.height),this.setViewport(0,0,x,N)},this.getDrawingBufferSize=function(x){return x.set(K*ve,se*ve).floor()},this.setDrawingBufferSize=function(x,N,W){K=x,se=N,ve=W,t.width=Math.floor(x*W),t.height=Math.floor(N*W),this.setViewport(0,0,x,N)},this.setEffects=function(x){if(y===1009){Re("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(x){for(let N=0;N<x.length;N++)if(x[N].isOutputPass===!0){Ce("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}_.setEffects(x||[])},this.getCurrentViewport=function(x){return x.copy(ie)},this.getViewport=function(x){return x.copy(Pe)},this.setViewport=function(x,N,W,G){x.isVector4?Pe.set(x.x,x.y,x.z,x.w):Pe.set(x,N,W,G),E.viewport(ie.copy(Pe).multiplyScalar(ve).round())},this.getScissor=function(x){return x.copy(Le)},this.setScissor=function(x,N,W,G){x.isVector4?Le.set(x.x,x.y,x.z,x.w):Le.set(x,N,W,G),E.scissor(de.copy(Le).multiplyScalar(ve).round())},this.getScissorTest=function(){return Ke},this.setScissorTest=function(x){E.setScissorTest(Ke=x)},this.setOpaqueSort=function(x){pe=x},this.setTransparentSort=function(x){Ae=x},this.getClearColor=function(x){return x.copy(De.getClearColor())},this.setClearColor=function(){De.setClearColor(...arguments)},this.getClearAlpha=function(){return De.getClearAlpha()},this.setClearAlpha=function(){De.setClearAlpha(...arguments)},this.clear=function(x=!0,N=!0,W=!0){let G=0;if(x){let B=!1;if(O!==null){const ae=O.texture.format;B=S.has(ae)}if(B){const ae=O.texture.type,ue=g.has(ae),_e=De.getClearColor(),Me=De.getClearAlpha(),Ie=_e.r,Oe=_e.g,Be=_e.b;ue?(p[0]=Ie,p[1]=Oe,p[2]=Be,p[3]=Me,U.clearBufferuiv(U.COLOR,0,p)):(R[0]=Ie,R[1]=Oe,R[2]=Be,R[3]=Me,U.clearBufferiv(U.COLOR,0,R))}else G|=U.COLOR_BUFFER_BIT}N&&(G|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),W&&(G|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&U.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(x){x.setRenderer(this),P=x},this.dispose=function(){t.removeEventListener("webglcontextlost",we,!1),t.removeEventListener("webglcontextrestored",xt,!1),t.removeEventListener("webglcontextcreationerror",je,!1),De.dispose(),ye.dispose(),j.dispose(),I.dispose(),J.dispose(),D.dispose(),me.dispose(),Se.dispose(),ne.dispose(),he.dispose(),he.removeEventListener("sessionstart",Rs),he.removeEventListener("sessionend",Cs),Ei.stop()};function we(x){x.preventDefault(),Sr("WebGLRenderer: Context Lost."),z=!0}h(we,"onContextLost");function xt(){Sr("WebGLRenderer: Context Restored."),z=!1;const x=M.autoReset,N=Te.enabled,W=Te.autoUpdate,G=Te.needsUpdate,B=Te.type;Q(),M.autoReset=x,Te.enabled=N,Te.autoUpdate=W,Te.needsUpdate=G,Te.type=B}h(xt,"onContextRestore");function je(x){Re("WebGLRenderer: A WebGL context could not be created. Reason: ",x.statusMessage)}h(je,"onContextCreationError");function Yt(x){const N=x.target;N.removeEventListener("dispose",Yt),ii(N)}h(Yt,"onMaterialDispose");function ii(x){Go(x),I.remove(x)}h(ii,"deallocateMaterial");function Go(x){const N=I.get(x).programs;N!==void 0&&(N.forEach(function(W){ne.releaseProgram(W)}),x.isShaderMaterial&&ne.releaseShaderCache(x))}h(Go,"releaseMaterialProgramReferences"),this.renderBufferDirect=function(x,N,W,G,B,ae){N===null&&(N=_t);const ue=B.isMesh&&B.matrixWorld.determinantAffine()<0,_e=Wo(x,N,W,G,B);E.setMaterial(G,ue);let Me=W.index,Ie=1;if(G.wireframe===!0){if(Me=le.getWireframeAttribute(W),Me===void 0)return;Ie=2}const Oe=W.drawRange,Be=W.attributes.position;let be=Oe.start*Ie,et=(Oe.start+Oe.count)*Ie;ae!==null&&(be=Math.max(be,ae.start*Ie),et=Math.min(et,(ae.start+ae.count)*Ie)),Me!==null?(be=Math.max(be,0),et=Math.min(et,Me.count)):Be!=null&&(be=Math.max(be,0),et=Math.min(et,Be.count));const rt=et-be;if(rt<0||rt===1/0)return;me.setup(B,G,_e,W,Me);let st,Xe=L;if(Me!==null&&(st=re.get(Me),Xe=Z,Xe.setIndex(st)),B.isMesh)G.wireframe===!0?(E.setLineWidth(G.wireframeLinewidth*ft()),Xe.setMode(U.LINES)):Xe.setMode(U.TRIANGLES);else if(B.isLine){let Mt=G.linewidth;Mt===void 0&&(Mt=1),E.setLineWidth(Mt*ft()),B.isLineSegments?Xe.setMode(U.LINES):B.isLineLoop?Xe.setMode(U.LINE_LOOP):Xe.setMode(U.LINE_STRIP)}else B.isPoints?Xe.setMode(U.POINTS):B.isSprite&&Xe.setMode(U.TRIANGLES);if(B.isBatchedMesh)if(Ze.get("WEBGL_multi_draw"))Xe.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{const Mt=B._multiDrawStarts,xe=B._multiDrawCounts,Gt=B._multiDrawCount,qe=Me?re.get(Me).bytesPerElement:1,Nt=I.get(G).currentProgram.getUniforms();for(let Kt=0;Kt<Gt;Kt++)Nt.setValue(U,"_gl_DrawID",Kt),Xe.render(Mt[Kt]/qe,xe[Kt])}else if(B.isInstancedMesh)Xe.renderInstances(be,rt,B.count);else if(W.isInstancedBufferGeometry){const Mt=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,xe=Math.min(W.instanceCount,Mt);Xe.renderInstances(be,rt,xe)}else Xe.render(be,rt)};function ws(x,N,W){x.transparent===!0&&x.side===2&&x.forceSinglePass===!1?(x.side=1,x.needsUpdate=!0,zn(x,N,W),x.side=0,x.needsUpdate=!0,zn(x,N,W),x.side=2):zn(x,N,W)}h(ws,"prepareMaterial"),this.compile=function(x,N,W=null){W===null&&(W=x),A=j.get(W),A.init(N),w.push(A),W.traverseVisible(function(B){B.isLight&&B.layers.test(N.layers)&&(A.pushLight(B),B.castShadow&&A.pushShadow(B))}),x!==W&&x.traverseVisible(function(B){B.isLight&&B.layers.test(N.layers)&&(A.pushLight(B),B.castShadow&&A.pushShadow(B))}),A.setupLights();const G=new Set;return x.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;const ae=B.material;if(ae)if(Array.isArray(ae))for(let ue=0;ue<ae.length;ue++){const _e=ae[ue];ws(_e,W,B),G.add(_e)}else ws(ae,W,B),G.add(ae)}),A=w.pop(),G},this.compileAsync=function(x,N,W=null){const G=this.compile(x,N,W);return new Promise(B=>{function ae(){if(G.forEach(function(ue){I.get(ue).currentProgram.isReady()&&G.delete(ue)}),G.size===0){B(x);return}setTimeout(ae,10)}h(ae,"checkMaterialsReady"),Ze.get("KHR_parallel_shader_compile")!==null?ae():setTimeout(ae,10)})};let Rr=null;function Ho(x){Rr&&Rr(x)}h(Ho,"onAnimationFrame");function Rs(){Ei.stop()}h(Rs,"onXRSessionStart");function Cs(){Ei.start()}h(Cs,"onXRSessionEnd");const Ei=new _o;Ei.setAnimationLoop(Ho),typeof self<"u"&&Ei.setContext(self),this.setAnimationLoop=function(x){Rr=x,he.setAnimationLoop(x),x===null?Ei.stop():Ei.start()},he.addEventListener("sessionstart",Rs),he.addEventListener("sessionend",Cs),this.render=function(x,N){if(N!==void 0&&N.isCamera!==!0){Re("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(z===!0)return;P!==null&&P.renderStart(x,N);const W=he.enabled===!0&&he.isPresenting===!0,G=_!==null&&(O===null||W)&&_.begin(T,O);if(x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),he.enabled===!0&&he.isPresenting===!0&&(_===null||_.isCompositing()===!1)&&(he.cameraAutoUpdate===!0&&he.updateCamera(N),N=he.getCamera()),x.isScene===!0&&x.onBeforeRender(T,x,N,O),A=j.get(x,w.length),A.init(N),A.state.textureUnits=X.getTextureUnits(),w.push(A),At.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),Ve.setFromProjectionMatrix(At,cn,N.reversedDepth),vt=this.localClippingEnabled,tt=Ee.init(this.clippingPlanes,vt),v=ye.get(x,b.length),v.init(),b.push(v),he.enabled===!0&&he.isPresenting===!0){const ae=T.xr.getDepthSensingMesh();ae!==null&&Cr(ae,N,-1/0,T.sortObjects)}Cr(x,N,0,T.sortObjects),v.finish(),T.sortObjects===!0&&v.sort(pe,Ae,N.reversedDepth),mt=he.enabled===!1||he.isPresenting===!1||he.hasDepthSensing()===!1,mt&&De.addToRenderList(v,x),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),tt===!0&&Ee.beginShadows();const B=A.state.shadowsArray;if(Te.render(B,x,N),tt===!0&&Ee.endShadows(),(G&&_.hasRenderPass())===!1){const ae=v.opaque,ue=v.transmissive;if(A.setupLights(),N.isArrayCamera){const _e=N.cameras;if(ue.length>0)for(let Me=0,Ie=_e.length;Me<Ie;Me++){const Oe=_e[Me];Is(ae,ue,x,Oe)}mt&&De.render(x);for(let Me=0,Ie=_e.length;Me<Ie;Me++){const Oe=_e[Me];Ps(v,x,Oe,Oe.viewport)}}else ue.length>0&&Is(ae,ue,x,N),mt&&De.render(x),Ps(v,x,N)}O!==null&&q===0&&(X.updateMultisampleRenderTarget(O),X.updateRenderTargetMipmap(O)),G&&_.end(T),x.isScene===!0&&x.onAfterRender(T,x,N),me.resetDefaultState(),ee=-1,te=null,w.pop(),w.length>0?(A=w[w.length-1],X.setTextureUnits(A.state.textureUnits),tt===!0&&Ee.setGlobalState(T.clippingPlanes,A.state.camera)):A=null,b.pop(),b.length>0?v=b[b.length-1]:v=null,P!==null&&P.renderEnd()};function Cr(x,N,W,G){if(x.visible===!1)return;if(x.layers.test(N.layers)){if(x.isGroup)W=x.renderOrder;else if(x.isLOD)x.autoUpdate===!0&&x.update(N);else if(x.isLightProbeGrid)A.pushLightProbeGrid(x);else if(x.isLight)A.pushLight(x),x.castShadow&&A.pushShadow(x);else if(x.isSprite){if(!x.frustumCulled||Ve.intersectsSprite(x)){G&&it.setFromMatrixPosition(x.matrixWorld).applyMatrix4(At);const ae=D.update(x),ue=x.material;ue.visible&&v.push(x,ae,ue,W,it.z,null)}}else if((x.isMesh||x.isLine||x.isPoints)&&(!x.frustumCulled||Ve.intersectsObject(x))){const ae=D.update(x),ue=x.material;if(G&&(x.boundingSphere!==void 0?(x.boundingSphere===null&&x.computeBoundingSphere(),it.copy(x.boundingSphere.center)):(ae.boundingSphere===null&&ae.computeBoundingSphere(),it.copy(ae.boundingSphere.center)),it.applyMatrix4(x.matrixWorld).applyMatrix4(At)),Array.isArray(ue)){const _e=ae.groups;for(let Me=0,Ie=_e.length;Me<Ie;Me++){const Oe=_e[Me],Be=ue[Oe.materialIndex];Be&&Be.visible&&v.push(x,ae,Be,W,it.z,Oe)}}else ue.visible&&v.push(x,ae,ue,W,it.z,null)}}const B=x.children;for(let ae=0,ue=B.length;ae<ue;ae++)Cr(B[ae],N,W,G)}h(Cr,"projectObject");function Ps(x,N,W,G){const{opaque:B,transmissive:ae,transparent:ue}=x;A.setupLightsView(W),tt===!0&&Ee.setGlobalState(T.clippingPlanes,W),G&&E.viewport(ie.copy(G)),B.length>0&&Bn(B,N,W),ae.length>0&&Bn(ae,N,W),ue.length>0&&Bn(ue,N,W),E.buffers.depth.setTest(!0),E.buffers.depth.setMask(!0),E.buffers.color.setMask(!0),E.setPolygonOffset(!1)}h(Ps,"renderScene");function Is(x,N,W,G){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[G.id]===void 0){const Be=Ze.has("EXT_color_buffer_half_float")||Ze.has("EXT_color_buffer_float");A.state.transmissionRenderTarget[G.id]=new jt(1,1,{generateMipmaps:!0,type:Be?Ui:Ii,minFilter:Er,samples:Math.max(4,nt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ge.workingColorSpace})}const B=A.state.transmissionRenderTarget[G.id],ae=G.viewport||ie;B.setSize(ae.z*T.transmissionResolutionScale,ae.w*T.transmissionResolutionScale);const ue=T.getRenderTarget(),_e=T.getActiveCubeFace(),Me=T.getActiveMipmapLevel();T.setRenderTarget(B),T.getClearColor(He),Ye=T.getClearAlpha(),Ye<1&&T.setClearColor(16777215,.5),T.clear(),mt&&De.render(W);const Ie=T.toneMapping;T.toneMapping=0;const Oe=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),A.setupLightsView(G),tt===!0&&Ee.setGlobalState(T.clippingPlanes,G),Bn(x,W,G),X.updateMultisampleRenderTarget(B),X.updateRenderTargetMipmap(B),Ze.has("WEBGL_multisampled_render_to_texture")===!1){let Be=!1;for(let be=0,et=N.length;be<et;be++){const{object:rt,geometry:st,material:Xe,group:Mt}=N[be];if(Xe.side===2&&rt.layers.test(G.layers)){const xe=Xe.side;Xe.side=1,Xe.needsUpdate=!0,Ls(rt,W,G,st,Xe,Mt),Xe.side=xe,Xe.needsUpdate=!0,Be=!0}}Be===!0&&(X.updateMultisampleRenderTarget(B),X.updateRenderTargetMipmap(B))}T.setRenderTarget(ue,_e,Me),T.setClearColor(He,Ye),Oe!==void 0&&(G.viewport=Oe),T.toneMapping=Ie}h(Is,"renderTransmissionPass");function Bn(x,N,W){const G=N.isScene===!0?N.overrideMaterial:null;for(let B=0,ae=x.length;B<ae;B++){const ue=x[B],{object:_e,geometry:Me,group:Ie}=ue;let Oe=ue.material;Oe.allowOverride===!0&&G!==null&&(Oe=G),_e.layers.test(W.layers)&&Ls(_e,N,W,Me,Oe,Ie)}}h(Bn,"renderObjects");function Ls(x,N,W,G,B,ae){x.onBeforeRender(T,N,W,G,B,ae),x.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,x.matrixWorld),x.normalMatrix.getNormalMatrix(x.modelViewMatrix),B.onBeforeRender(T,N,W,G,x,ae),B.transparent===!0&&B.side===2&&B.forceSinglePass===!1?(B.side=1,B.needsUpdate=!0,T.renderBufferDirect(W,N,G,B,x,ae),B.side=0,B.needsUpdate=!0,T.renderBufferDirect(W,N,G,B,x,ae),B.side=2):T.renderBufferDirect(W,N,G,B,x,ae),x.onAfterRender(T,N,W,G,B,ae)}h(Ls,"renderObject");function zn(x,N,W){N.isScene!==!0&&(N=_t);const G=I.get(x),B=A.state.lights,ae=A.state.shadowsArray,ue=B.state.version,_e=ne.getParameters(x,B.state,ae,N,W,A.state.lightProbeGridArray),Me=ne.getProgramCacheKey(_e);let Ie=G.programs;G.environment=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?N.environment:null,G.fog=N.fog;const Oe=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap;G.envMap=J.get(x.envMap||G.environment,Oe),G.envMapRotation=G.environment!==null&&x.envMap===null?N.environmentRotation:x.envMapRotation,Ie===void 0&&(x.addEventListener("dispose",Yt),Ie=new Map,G.programs=Ie);let Be=Ie.get(Me);if(Be!==void 0){if(G.currentProgram===Be&&G.lightsStateVersion===ue)return Ds(x,_e),Be}else _e.uniforms=ne.getUniforms(x),P!==null&&x.isNodeMaterial&&P.build(x,W,_e),x.onBeforeCompile(_e,T),Be=ne.acquireProgram(_e,Me),Ie.set(Me,Be),G.uniforms=_e.uniforms;const be=G.uniforms;return(!x.isShaderMaterial&&!x.isRawShaderMaterial||x.clipping===!0)&&(be.clippingPlanes=Ee.uniform),Ds(x,_e),G.needsLights=qo(x),G.lightsStateVersion=ue,G.needsLights&&(be.ambientLightColor.value=B.state.ambient,be.lightProbe.value=B.state.probe,be.directionalLights.value=B.state.directional,be.directionalLightShadows.value=B.state.directionalShadow,be.spotLights.value=B.state.spot,be.spotLightShadows.value=B.state.spotShadow,be.rectAreaLights.value=B.state.rectArea,be.ltc_1.value=B.state.rectAreaLTC1,be.ltc_2.value=B.state.rectAreaLTC2,be.pointLights.value=B.state.point,be.pointLightShadows.value=B.state.pointShadow,be.hemisphereLights.value=B.state.hemi,be.directionalShadowMatrix.value=B.state.directionalShadowMatrix,be.spotLightMatrix.value=B.state.spotLightMatrix,be.spotLightMap.value=B.state.spotLightMap,be.pointShadowMatrix.value=B.state.pointShadowMatrix),G.lightProbeGrid=A.state.lightProbeGridArray.length>0,G.currentProgram=Be,G.uniformsList=null,Be}h(zn,"getProgram");function Us(x){if(x.uniformsList===null){const N=x.currentProgram.getUniforms();x.uniformsList=pr.seqWithValue(N.seq,x.uniforms)}return x.uniformsList}h(Us,"getUniformList");function Ds(x,N){const W=I.get(x);W.outputColorSpace=N.outputColorSpace,W.batching=N.batching,W.batchingColor=N.batchingColor,W.instancing=N.instancing,W.instancingColor=N.instancingColor,W.instancingMorph=N.instancingMorph,W.skinning=N.skinning,W.morphTargets=N.morphTargets,W.morphNormals=N.morphNormals,W.morphColors=N.morphColors,W.morphTargetsCount=N.morphTargetsCount,W.numClippingPlanes=N.numClippingPlanes,W.numIntersection=N.numClipIntersection,W.vertexAlphas=N.vertexAlphas,W.vertexTangents=N.vertexTangents,W.toneMapping=N.toneMapping}h(Ds,"updateCommonMaterialProperties");function ko(x,N){if(x.length===0)return null;if(x.length===1)return x[0].texture!==null?x[0]:null;C.setFromMatrixPosition(N.matrixWorld);for(let W=0,G=x.length;W<G;W++){const B=x[W];if(B.texture!==null&&B.boundingBox.containsPoint(C))return B}return null}h(ko,"findLightProbeGrid");function Wo(x,N,W,G,B){N.isScene!==!0&&(N=_t),X.resetTextureUnits();const ae=N.fog,ue=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?N.environment:null,_e=O===null?T.outputColorSpace:O.isXRRenderTarget===!0?O.texture.colorSpace:Ge.workingColorSpace,Me=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Ie=J.get(G.envMap||ue,Me),Oe=G.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Be=!!W.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),be=!!W.morphAttributes.position,et=!!W.morphAttributes.normal,rt=!!W.morphAttributes.color;let st=0;G.toneMapped&&(O===null||O.isXRRenderTarget===!0)&&(st=T.toneMapping);const Xe=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,Mt=Xe!==void 0?Xe.length:0,xe=I.get(G),Gt=A.state.lights;if(tt===!0&&(vt===!0||x!==te)){const Je=x===te&&G.id===ee;Ee.setState(G,x,Je)}let qe=!1;G.version===xe.__version?(xe.needsLights&&xe.lightsStateVersion!==Gt.state.version||xe.outputColorSpace!==_e||B.isBatchedMesh&&xe.batching===!1||!B.isBatchedMesh&&xe.batching===!0||B.isBatchedMesh&&xe.batchingColor===!0&&B.colorTexture===null||B.isBatchedMesh&&xe.batchingColor===!1&&B.colorTexture!==null||B.isInstancedMesh&&xe.instancing===!1||!B.isInstancedMesh&&xe.instancing===!0||B.isSkinnedMesh&&xe.skinning===!1||!B.isSkinnedMesh&&xe.skinning===!0||B.isInstancedMesh&&xe.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&xe.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&xe.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&xe.instancingMorph===!1&&B.morphTexture!==null||xe.envMap!==Ie||G.fog===!0&&xe.fog!==ae||xe.numClippingPlanes!==void 0&&(xe.numClippingPlanes!==Ee.numPlanes||xe.numIntersection!==Ee.numIntersection)||xe.vertexAlphas!==Oe||xe.vertexTangents!==Be||xe.morphTargets!==be||xe.morphNormals!==et||xe.morphColors!==rt||xe.toneMapping!==st||xe.morphTargetsCount!==Mt||!!xe.lightProbeGrid!=A.state.lightProbeGridArray.length>0)&&(qe=!0):(qe=!0,xe.__version=G.version);let Nt=xe.currentProgram;qe===!0&&(Nt=zn(G,N,B),P&&G.isNodeMaterial&&P.onUpdateProgram(G,Nt,xe));let Kt=!1,ui=!1,Fi=!1;const Qe=Nt.getUniforms(),ot=xe.uniforms;if(E.useProgram(Nt.program)&&(Kt=!0,ui=!0,Fi=!0),G.id!==ee&&(ee=G.id,ui=!0),xe.needsLights){const Je=ko(A.state.lightProbeGridArray,B);xe.lightProbeGrid!==Je&&(xe.lightProbeGrid=Je,ui=!0)}if(Kt||te!==x){E.buffers.depth.getReversed()&&x.reversedDepth!==!0&&(x._reversedDepth=!0,x.updateProjectionMatrix()),Qe.setValue(U,"projectionMatrix",x.projectionMatrix),Qe.setValue(U,"viewMatrix",x.matrixWorldInverse);const Je=Qe.map.cameraPosition;Je!==void 0&&Je.setValue(U,Ut.setFromMatrixPosition(x.matrixWorld)),nt.logarithmicDepthBuffer&&Qe.setValue(U,"logDepthBufFC",2/(Math.log(x.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&Qe.setValue(U,"isOrthographic",x.isOrthographicCamera===!0),te!==x&&(te=x,ui=!0,Fi=!0)}if(xe.needsLights&&(Gt.state.directionalShadowMap.length>0&&Qe.setValue(U,"directionalShadowMap",Gt.state.directionalShadowMap,X),Gt.state.spotShadowMap.length>0&&Qe.setValue(U,"spotShadowMap",Gt.state.spotShadowMap,X),Gt.state.pointShadowMap.length>0&&Qe.setValue(U,"pointShadowMap",Gt.state.pointShadowMap,X)),B.isSkinnedMesh){Qe.setOptional(U,B,"bindMatrix"),Qe.setOptional(U,B,"bindMatrixInverse");const Je=B.skeleton;Je&&(Je.boneTexture===null&&Je.computeBoneTexture(),Qe.setValue(U,"boneTexture",Je.boneTexture,X))}B.isBatchedMesh&&(Qe.setOptional(U,B,"batchingTexture"),Qe.setValue(U,"batchingTexture",B._matricesTexture,X),Qe.setOptional(U,B,"batchingIdTexture"),Qe.setValue(U,"batchingIdTexture",B._indirectTexture,X),Qe.setOptional(U,B,"batchingColorTexture"),B._colorsTexture!==null&&Qe.setValue(U,"batchingColorTexture",B._colorsTexture,X));const fi=W.morphAttributes;if((fi.position!==void 0||fi.normal!==void 0||fi.color!==void 0)&&We.update(B,W,Nt),(ui||xe.receiveShadow!==B.receiveShadow)&&(xe.receiveShadow=B.receiveShadow,Qe.setValue(U,"receiveShadow",B.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&N.environment!==null&&(ot.envMapIntensity.value=N.environmentIntensity),ot.dfgLUT!==void 0&&(ot.dfgLUT.value=_f()),ui){if(Qe.setValue(U,"toneMappingExposure",T.toneMappingExposure),xe.needsLights&&Xo(ot,Fi),ae&&G.fog===!0&&ge.refreshFogUniforms(ot,ae),ge.refreshMaterialUniforms(ot,G,ve,se,A.state.transmissionRenderTarget[x.id]),xe.needsLights&&xe.lightProbeGrid){const Je=xe.lightProbeGrid;ot.probesSH.value=Je.texture,ot.probesMin.value.copy(Je.boundingBox.min),ot.probesMax.value.copy(Je.boundingBox.max),ot.probesResolution.value.copy(Je.resolution)}pr.upload(U,Us(xe),ot,X)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(pr.upload(U,Us(xe),ot,X),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&Qe.setValue(U,"center",B.center),Qe.setValue(U,"modelViewMatrix",B.modelViewMatrix),Qe.setValue(U,"normalMatrix",B.normalMatrix),Qe.setValue(U,"modelMatrix",B.matrixWorld),G.uniformsGroups!==void 0){const Je=G.uniformsGroups;for(let pn=0,Oi=Je.length;pn<Oi;pn++){const Ns=Je[pn];Se.update(Ns,Nt),Se.bind(Ns,Nt)}}return Nt}h(Wo,"setProgram");function Xo(x,N){x.ambientLightColor.needsUpdate=N,x.lightProbe.needsUpdate=N,x.directionalLights.needsUpdate=N,x.directionalLightShadows.needsUpdate=N,x.pointLights.needsUpdate=N,x.pointLightShadows.needsUpdate=N,x.spotLights.needsUpdate=N,x.spotLightShadows.needsUpdate=N,x.rectAreaLights.needsUpdate=N,x.hemisphereLights.needsUpdate=N}h(Xo,"markUniformsLightsNeedsUpdate");function qo(x){return x.isMeshLambertMaterial||x.isMeshToonMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isShadowMaterial||x.isShaderMaterial&&x.lights===!0}h(qo,"materialNeedsLights"),this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return q},this.getRenderTarget=function(){return O},this.setRenderTargetTextures=function(x,N,W){const G=I.get(x);G.__autoAllocateDepthBuffer=x.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),I.get(x.texture).__webglTexture=N,I.get(x.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:W,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(x,N){const W=I.get(x);W.__webglFramebuffer=N,W.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(x,N=0,W=0){O=x,H=N,q=W;let G=null,B=!1,ae=!1;if(x){const ue=I.get(x);if(ue.__useDefaultFramebuffer!==void 0){E.bindFramebuffer(U.FRAMEBUFFER,ue.__webglFramebuffer),ie.copy(x.viewport),de.copy(x.scissor),fe=x.scissorTest,E.viewport(ie),E.scissor(de),E.setScissorTest(fe),ee=-1;return}else if(ue.__webglFramebuffer===void 0)X.setupRenderTarget(x);else if(ue.__hasExternalTextures)X.rebindTextures(x,I.get(x.texture).__webglTexture,I.get(x.depthTexture).__webglTexture);else if(x.depthBuffer){const Ie=x.depthTexture;if(ue.__boundDepthTexture!==Ie){if(Ie!==null&&I.has(Ie)&&(x.width!==Ie.image.width||x.height!==Ie.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");X.setupDepthRenderbuffer(x)}}const _e=x.texture;(_e.isData3DTexture||_e.isDataArrayTexture||_e.isCompressedArrayTexture)&&(ae=!0);const Me=I.get(x).__webglFramebuffer;x.isWebGLCubeRenderTarget?(Array.isArray(Me[N])?G=Me[N][W]:G=Me[N],B=!0):x.samples>0&&X.useMultisampledRTT(x)===!1?G=I.get(x).__webglMultisampledFramebuffer:Array.isArray(Me)?G=Me[W]:G=Me,ie.copy(x.viewport),de.copy(x.scissor),fe=x.scissorTest}else ie.copy(Pe).multiplyScalar(ve).floor(),de.copy(Le).multiplyScalar(ve).floor(),fe=Ke;if(W!==0&&(G=k),E.bindFramebuffer(U.FRAMEBUFFER,G)&&E.drawBuffers(x,G),E.viewport(ie),E.scissor(de),E.setScissorTest(fe),B){const ue=I.get(x.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+N,ue.__webglTexture,W)}else if(ae){const ue=N;for(let _e=0;_e<x.textures.length;_e++){const Me=I.get(x.textures[_e]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+_e,Me.__webglTexture,W,ue)}}else if(x!==null&&W!==0){const ue=I.get(x.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,ue.__webglTexture,W)}ee=-1},this.readRenderTargetPixels=function(x,N,W,G,B,ae,ue,_e=0){if(!(x&&x.isWebGLRenderTarget)){Re("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=I.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&ue!==void 0&&(Me=Me[ue]),Me){E.bindFramebuffer(U.FRAMEBUFFER,Me);try{const Ie=x.textures[_e],Oe=Ie.format,Be=Ie.type;if(x.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+_e),!nt.textureFormatReadable(Oe)){Re("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!nt.textureTypeReadable(Be)){Re("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=x.width-G&&W>=0&&W<=x.height-B&&U.readPixels(N,W,G,B,$.convert(Oe),$.convert(Be),ae)}finally{const Ie=O!==null?I.get(O).__webglFramebuffer:null;E.bindFramebuffer(U.FRAMEBUFFER,Ie)}}},this.readRenderTargetPixelsAsync=async function(x,N,W,G,B,ae,ue,_e=0){if(!(x&&x.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Me=I.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&ue!==void 0&&(Me=Me[ue]),Me)if(N>=0&&N<=x.width-G&&W>=0&&W<=x.height-B){E.bindFramebuffer(U.FRAMEBUFFER,Me);const Ie=x.textures[_e],Oe=Ie.format,Be=Ie.type;if(x.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+_e),!nt.textureFormatReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!nt.textureTypeReadable(Be))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const be=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,be),U.bufferData(U.PIXEL_PACK_BUFFER,ae.byteLength,U.STREAM_READ),U.readPixels(N,W,G,B,$.convert(Oe),$.convert(Be),0);const et=O!==null?I.get(O).__webglFramebuffer:null;E.bindFramebuffer(U.FRAMEBUFFER,et);const rt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Zl(U,rt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,be),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,ae),U.deleteBuffer(be),U.deleteSync(rt),ae}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(x,N=null,W=0){const G=Math.pow(2,-W),B=Math.floor(x.image.width*G),ae=Math.floor(x.image.height*G),ue=N!==null?N.x:0,_e=N!==null?N.y:0;X.setTexture2D(x,0),U.copyTexSubImage2D(U.TEXTURE_2D,W,0,0,ue,_e,B,ae),E.unbindTexture()},this.copyTextureToTexture=function(x,N,W=null,G=null,B=0,ae=0){let ue,_e,Me,Ie,Oe,Be,be,et,rt;const st=x.isCompressedTexture?x.mipmaps[ae]:x.image;if(W!==null)ue=W.max.x-W.min.x,_e=W.max.y-W.min.y,Me=W.isBox3?W.max.z-W.min.z:1,Ie=W.min.x,Oe=W.min.y,Be=W.isBox3?W.min.z:0;else{const ot=Math.pow(2,-B);ue=Math.floor(st.width*ot),_e=Math.floor(st.height*ot),x.isDataArrayTexture?Me=st.depth:x.isData3DTexture?Me=Math.floor(st.depth*ot):Me=1,Ie=0,Oe=0,Be=0}G!==null?(be=G.x,et=G.y,rt=G.z):(be=0,et=0,rt=0);const Xe=$.convert(N.format),Mt=$.convert(N.type);let xe;N.isData3DTexture?(X.setTexture3D(N,0),xe=U.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(X.setTexture2DArray(N,0),xe=U.TEXTURE_2D_ARRAY):(X.setTexture2D(N,0),xe=U.TEXTURE_2D),E.activeTexture(U.TEXTURE0),E.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,N.flipY),E.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),E.pixelStorei(U.UNPACK_ALIGNMENT,N.unpackAlignment);const Gt=E.getParameter(U.UNPACK_ROW_LENGTH),qe=E.getParameter(U.UNPACK_IMAGE_HEIGHT),Nt=E.getParameter(U.UNPACK_SKIP_PIXELS),Kt=E.getParameter(U.UNPACK_SKIP_ROWS),ui=E.getParameter(U.UNPACK_SKIP_IMAGES);E.pixelStorei(U.UNPACK_ROW_LENGTH,st.width),E.pixelStorei(U.UNPACK_IMAGE_HEIGHT,st.height),E.pixelStorei(U.UNPACK_SKIP_PIXELS,Ie),E.pixelStorei(U.UNPACK_SKIP_ROWS,Oe),E.pixelStorei(U.UNPACK_SKIP_IMAGES,Be);const Fi=x.isDataArrayTexture||x.isData3DTexture,Qe=N.isDataArrayTexture||N.isData3DTexture;if(x.isDepthTexture){const ot=I.get(x),fi=I.get(N),Je=I.get(ot.__renderTarget),pn=I.get(fi.__renderTarget);E.bindFramebuffer(U.READ_FRAMEBUFFER,Je.__webglFramebuffer),E.bindFramebuffer(U.DRAW_FRAMEBUFFER,pn.__webglFramebuffer);for(let Oi=0;Oi<Me;Oi++)Fi&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,I.get(x).__webglTexture,B,Be+Oi),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,I.get(N).__webglTexture,ae,rt+Oi)),U.blitFramebuffer(Ie,Oe,ue,_e,be,et,ue,_e,U.DEPTH_BUFFER_BIT,U.NEAREST);E.bindFramebuffer(U.READ_FRAMEBUFFER,null),E.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(B!==0||x.isRenderTargetTexture||I.has(x)){const ot=I.get(x),fi=I.get(N);E.bindFramebuffer(U.READ_FRAMEBUFFER,Y),E.bindFramebuffer(U.DRAW_FRAMEBUFFER,V);for(let Je=0;Je<Me;Je++)Fi?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,ot.__webglTexture,B,Be+Je):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,ot.__webglTexture,B),Qe?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,fi.__webglTexture,ae,rt+Je):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,fi.__webglTexture,ae),B!==0?U.blitFramebuffer(Ie,Oe,ue,_e,be,et,ue,_e,U.COLOR_BUFFER_BIT,U.NEAREST):Qe?U.copyTexSubImage3D(xe,ae,be,et,rt+Je,Ie,Oe,ue,_e):U.copyTexSubImage2D(xe,ae,be,et,Ie,Oe,ue,_e);E.bindFramebuffer(U.READ_FRAMEBUFFER,null),E.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Qe?x.isDataTexture||x.isData3DTexture?U.texSubImage3D(xe,ae,be,et,rt,ue,_e,Me,Xe,Mt,st.data):N.isCompressedArrayTexture?U.compressedTexSubImage3D(xe,ae,be,et,rt,ue,_e,Me,Xe,st.data):U.texSubImage3D(xe,ae,be,et,rt,ue,_e,Me,Xe,Mt,st):x.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,ae,be,et,ue,_e,Xe,Mt,st.data):x.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,ae,be,et,st.width,st.height,Xe,st.data):U.texSubImage2D(U.TEXTURE_2D,ae,be,et,ue,_e,Xe,Mt,st);E.pixelStorei(U.UNPACK_ROW_LENGTH,Gt),E.pixelStorei(U.UNPACK_IMAGE_HEIGHT,qe),E.pixelStorei(U.UNPACK_SKIP_PIXELS,Nt),E.pixelStorei(U.UNPACK_SKIP_ROWS,Kt),E.pixelStorei(U.UNPACK_SKIP_IMAGES,ui),ae===0&&N.generateMipmaps&&U.generateMipmap(xe),E.unbindTexture()},this.initRenderTarget=function(x){I.get(x).__webglFramebuffer===void 0&&X.setupRenderTarget(x)},this.initTexture=function(x){x.isCubeTexture?X.setTextureCube(x,0):x.isData3DTexture?X.setTexture3D(x,0):x.isDataArrayTexture||x.isCompressedArrayTexture?X.setTexture2DArray(x,0):X.setTexture2D(x,0),E.unbindTexture()},this.resetState=function(){H=0,q=0,O=null,E.reset(),me.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return cn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Ge._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ge._getUnpackColorSpace()}},Sf=h(e=>["zzz","sparkle","heart"].includes(e)?3:e==="none"?0:1,"defaultParticleCount"),yf=h((e,t=0)=>e==="none"?0:t>0?Math.max(1,Math.min(6,Math.round(t))):Sf(e),"particleCount");function Ao(e,t,i={}){const n=yf(e,i.propCount),r=i.propSize??1,s=i.propOutward??1,a=e==="crown"?100:e==="question"?105:e==="sweat"?80:48;return{extent:Math.max(256,2*(110+s*90+a*r)),particles:Array.from({length:n},(o,l)=>{const c=n>1?l*2/(n-1):0,f=(((t??.34)+l*.29)%1+1)%1,d=h(S=>{const g=Math.max(0,Math.min(1,S));return g*g*(3-2*g)},"smooth"),u=f*f,m=n===1?128:e==="zzz"?45+c*64:51+c*69,y=n===1?132:e==="zzz"?204-c*58:198-c*60;return{index:c,x:m+u*36*s,y:y-u*(n===1?26:e==="zzz"?54:38)*s,scale:r*(t===void 0?1:.62+.38*d(f/.38)),alpha:t===void 0?1:d(f/.18)*(1-d((f-.68)/.32))}})}}h(Ao,"particleLayout");var An=h(()=>({x:0,y:0}),"centeredGaze");function xf(e,t,i,n){const r=i.x-t.x,s=i.y-t.y,a=n.x-t.x,o=n.y-t.y,l=r*o-s*a;if(Math.abs(l)<1e-10)return An();const c=e.x-t.x,f=e.y-t.y,d=(c*o-f*a)/l,u=(r*f-s*c)/l,m=Math.hypot(d,u,1.15);return{x:d/m,y:u/m}}h(xf,"gazeAtPoint");function wo(e,t){const i=t*Math.PI/180;return wr({x:e.x*Math.cos(i)-e.y*Math.sin(i),y:e.x*Math.sin(i)+e.y*Math.cos(i)})}h(wo,"localGaze");function wr({x:e,y:t}){e=Number.isFinite(e)?e:0,t=Number.isFinite(t)?t:0;const i=Math.max(1,Math.hypot(e,t));return{x:e/i,y:t/i}}h(wr,"clampGaze");function Ef(e,t){return wr({x:(e.clientX-t.left-t.width/2)/Math.max(80,t.width/2),y:-(e.clientY-t.top-t.height/2)/Math.max(80,t.height/2)})}h(Ef,"pointerGaze");function Tf(e,t,i,n=!1){const r=n?1:1-Math.exp(-Math.max(0,i)*16),s={x:e.x+(t.x-e.x)*r,y:e.y+(t.y-e.y)*r};return Math.hypot(s.x-t.x,s.y-t.y)<5e-4?{...t}:s}h(Tf,"easeGaze");function Ro(e,t,i=0,n=!1){const r=wr(t),s=i*Math.PI/180,a=r.x*e*.62,o=-r.y*e*.62,l={x:a*Math.cos(s)+o*Math.sin(s),y:-a*Math.sin(s)+o*Math.cos(s)};if(n){const c=e*(.82*Math.sqrt(typeof n=="number"?Math.max(0,Math.min(1,n)):1)+.305);Math.abs(l.x)<c&&(l.y=Math.min(l.y,e*1.13-Math.sqrt(c**2-l.x**2)))}return l}h(Ro,"irisOffset");var wn=128,hi=Math.PI*2,oe=h((e,t)=>({x:e,y:t}),"pt"),Ms=h((e,t)=>Math.hypot(t.x-e.x,t.y-e.y),"distance"),Rn=h(e=>{const t=Math.hypot(e.x,e.y)||1;return oe(e.x/t,e.y/t)},"unit"),Lt=h((e,t,i,n,r=0,s=hi,a=64)=>Array.from({length:a+1},(o,l)=>{const c=r+(s-r)*l/a;return oe(e+Math.cos(c)*i,t+Math.sin(c)*n)}),"arc"),Mi=h((e,t,i,n,r=32)=>Array.from({length:r+1},(s,a)=>{const o=a/r,l=1-o;return oe(l**3*e.x+3*l**2*o*t.x+3*l*o**2*i.x+o**3*n.x,l**3*e.y+3*l**2*o*t.y+3*l*o**2*i.y+o**3*n.y)}),"cubic"),sn=h((e,t,i)=>Mi(e,oe(e.x+(t.x-e.x)*2/3,e.y+(t.y-e.y)*2/3),oe(i.x+(t.x-i.x)*2/3,i.y+(t.y-i.y)*2/3),i),"quad"),Co=h(e=>e.reduce((t,i,n)=>{const r=e[(n+1)%e.length];return t+i.x*r.y-r.x*i.y},0),"area");function As(e){const t=e.filter((i,n)=>n===0||Ms(i,e[n-1])>1e-5);return t.length>1&&Ms(t[0],t.at(-1))<1e-5&&t.pop(),t}h(As,"clean");function yi(e){let t=As(e);if(t.length<2)return Array.from({length:wn},()=>({...t[0]??oe(0,0)}));Co(t)<0&&t.reverse();let i=0;for(let o=1;o<t.length;o++)(t[o].x<t[i].x-1e-5||Math.abs(t[o].x-t[i].x)<1e-5&&t[o].y<t[i].y)&&(i=o);t=[...t.slice(i),...t.slice(0,i)];const n=t.map((o,l)=>Ms(o,t[(l+1)%t.length])),r=n.reduce((o,l)=>o+l,0);let s=0,a=0;return Array.from({length:wn},(o,l)=>{const c=r*l/wn;for(;s<t.length-1&&a+n[s]<c;)a+=n[s++];const f=t[s],d=t[(s+1)%t.length],u=(c-a)/(n[s]||1);return oe(f.x+(d.x-f.x)*u,f.y+(d.y-f.y)*u)})}h(yi,"contour");function Cn(e,t){const i=As(e),n=t/2,r=i.slice(1).map((f,d)=>{const u=i[d];return Rn(oe(u.y-f.y,f.x-u.x))});if(!r.length)return Lt(i[0].x,i[0].y,n,n);const s=h(f=>i.flatMap((d,u)=>{const m=r[Math.max(0,u-1)],y=r[Math.min(r.length-1,u)],S=m.x*y.y-m.y*y.x;if(u>0&&u<i.length-1&&S*f<-1e-4){const R=Math.atan2(m.y*f,m.x*f),C=Math.atan2(S,m.x*y.x+m.y*y.y);return Lt(d.x,d.y,n,n,R,R+C,Math.max(2,Math.ceil(Math.abs(C)*10)))}const g=Rn(oe(m.x+y.x,m.y+y.y)),p=n/Math.max(.35,g.x*y.x+g.y*y.y);return[oe(d.x+g.x*p*f,d.y+g.y*p*f)]}),"side"),a=i.at(-1),o=i[0],l=Math.atan2(r.at(-1).y,r.at(-1).x),c=Math.atan2(r[0].y,r[0].x);return[...s(1),...Lt(a.x,a.y,n,n,l,l-Math.PI,16),...s(-1).reverse(),...Lt(o.x,o.y,n,n,c-Math.PI,c-hi,16)]}h(Cn,"ribbon");function bf(e,t){const i=As(e);return Co(i)<0&&i.reverse(),i.flatMap((n,r)=>{const s=i[(r-1+i.length)%i.length],a=i[(r+1)%i.length],o=Rn(oe(n.y-s.y,s.x-n.x)),l=Rn(oe(a.y-n.y,n.x-a.x)),c=Rn(oe(o.x+l.x,o.y+l.y)),f=o.x*l.y-o.y*l.x;if(f>1e-4){const u=Math.atan2(o.y,o.x),m=Math.atan2(f,o.x*l.x+o.y*l.y);return Lt(n.x,n.y,t,t,u,u+m,Math.max(2,Math.ceil(m*10)))}const d=t/Math.max(.5,c.x*l.x+c.y*l.y);return[oe(n.x+c.x*d,n.y+c.y*d)]})}h(bf,"expand");var Ot=h((e,t)=>e.reduce((i,n)=>i+(t(n.traits)?n.weight:0),0),"traitWeight");function xr(e,t){return Array.from({length:wn},(i,n)=>e.reduce((r,s,a)=>oe(r.x+s[n].x*t[a].weight,r.y+s[n].y*t[a].weight),oe(0,0)))}h(xr,"blendContours");function Pi(e,t){e.beginPath(),e.moveTo(t[0].x,t[0].y);for(const i of t.slice(1))e.lineTo(i.x,i.y);e.closePath()}h(Pi,"trace");function Po(e,t,i){return["closed","arc-up","arc-down","squint"].includes(e.eye)||e.eye==="wink"&&t>0||i==="eyes"&&["open","grin"].includes(e.mouth)&&e.eye==="dot"}h(Po,"isLineEye");function Af(e,t,i,n,r){const s=Math.max(13,t*.43);if(e.faceSet==="set-2"&&e.eye==="wink"&&i>0||e.eye==="squint"){const d=e.eye==="wink"?-1:i;return yi(Cn([oe(-t*d*.7,-t*.8),oe(t*d*.6,0),oe(-t*d*.7,t*.8)],s))}if(Po(e,i,r)){const d=["open","grin","smile","u-smile"].includes(e.mouth),u=e.eye==="arc-up"||e.eye!=="arc-down"&&d;return yi(Cn(Lt(0,0,t,t,u?Math.PI:0,u?hi:Math.PI),s))}const a=Math.max(.12,1-n)*e.eyeHeight*(e.eye==="soft"?.65:1);let o;if(e.eye==="star")o=Array.from({length:10},(d,u)=>{const m=u/10*hi-Math.PI/2,y=t*1.2*(u%2?.46:1);return oe(Math.cos(m)*y,Math.sin(m)*y)});else if(e.eye==="heart")o=[...Mi(oe(0,t),oe(-t*2,-t*.1),oe(-t,-t*1.5),oe(0,-t*.55)),...Mi(oe(0,-t*.55),oe(t,-t*1.5),oe(t*2,-t*.1),oe(0,t))];else if(e.eye==="half-lidded")o=Lt(0,0,t,t,0,Math.PI);else{const d=t*(e.eye==="pupil"&&r==="full"?1.5:1);o=Lt(0,0,d,d)}const l=yi(o.map(d=>oe(d.x,d.y*a))),c=Math.max(0,Math.min(1,(n-.5)/.5));if(!c)return l;const f=yi(Cn([oe(-t,0),oe(t,0)],s));return l.map((d,u)=>oe(d.x+(f[u].x-d.x)*c,d.y+(f[u].y-d.y)*c))}h(Af,"eyeContour");function Io(e){const t=["open","grin","cry"].includes(e.mouth),i=(t?124:e.mouth==="oh"?51:61)*e.mouthWidth,n=(t?48:22)+72*e.mouthOpen,r=17*e.mouthStroke;let s,a=!1;if(e.mouth==="smile")s=Lt(0,-10,i,i,Math.PI*.18,Math.PI*.82);else if(e.mouth==="u-smile")s=Lt(0,-8,i*.56,i*.56,0,Math.PI);else if(e.mouth==="frown")s=Lt(0,39,i,i,Math.PI*1.2,Math.PI*1.8);else if(e.mouth==="line"||e.mouth==="sleep")s=[oe(-i*.58,0),oe(i*.58,0)];else if(e.mouth==="kiss")s=[...Mi(oe(-i*.25,-21),oe(i*.48,-34),oe(i*.53,-2),oe(0,0)),...Mi(oe(0,0),oe(i*.53,2),oe(i*.48,34),oe(-i*.25,21))];else if(e.mouth==="wave")s=Mi(oe(-i,4),oe(-i*.35,-25),oe(i*.35,25),oe(i,-4));else if(e.mouth==="tongue-out")s=sn(oe(-i,-9),oe(0,-2),oe(i,-9));else if(a=!0,e.mouth==="oh"){const o=i*(.55+.3*e.mouthOpen);s=Lt(0,14,o,o)}else if(e.mouth==="cry")s=[...Mi(oe(-i,30),oe(-i*1.1,-n),oe(i*1.1,-n),oe(i,30)),...sn(oe(i,30),oe(i,44),oe(i*.76,38)),...sn(oe(i*.76,38),oe(0,24),oe(-i*.76,38)),...sn(oe(-i*.76,38),oe(-i,44),oe(-i,30))].map(o=>oe(o.x,o.y+36/(4/3)));else{const o=e.mouth==="grin"?24:0;s=[...sn(oe(-i,-11),oe(0,5),oe(i,-11-o)),...Mi(oe(i,-11-o),oe(i*1.02,n),oe(-i*1.02,n),oe(-i,-11))]}return{outline:yi(a?bf(s,r/2):Cn(s,r)),opening:a?yi(s):Array.from({length:wn},()=>oe(0,0)),width:i,height:n}}h(Io,"mouthGeometry");function wf(e){const t=[0,0,0];for(const{color:i,weight:n}of e)for(let r=0;r<3;r++)t[r]+=parseInt(i.slice(1+r*2,3+r*2),16)*n;return`rgb(${t.map(i=>Math.round(i)).join(",")})`}h(wf,"colorMix");function Rf(e,t,i,n,r,s,a,o,l,c){const f=xr(i.map(S=>Af({...t,...S.traits},n,r,s,a)),i),d=h(S=>!Po(S,r,a),"filled"),u=Ot(i,S=>S.cheeks&&d(S));if(e.save(),u>0){const S=Math.max(.12,1-s)*t.eyeHeight*(1-.35*Ot(i,p=>p.eye==="soft")),g=n*.82*Math.sqrt(u);e.beginPath(),e.rect(-n*3,-n*3,n*6,n*6),e.moveTo(g,n*1.13*S),e.ellipse(0,n*1.13*S,g,g*S,0,0,hi),e.clip("evenodd")}e.fillStyle=wf(i.map(({traits:S,weight:g})=>({weight:g,color:a==="full"&&S.eye==="pupil"?"#fffef9":a==="full"&&S.eye==="heart"&&S.faceSet==="set-2"?"#ff3f58":o}))),Pi(e,f),e.fill(),e.clip(),e.scale(1,Math.max(.12,1-s)*t.eyeHeight*(1-.35*Ot(i,S=>S.eye==="soft")));const m=a==="full"?Ot(i,S=>S.eye==="pupil"):0;m>0&&(e.globalAlpha=m*(1-s),e.fillStyle=o,e.beginPath(),e.arc(c.x*n*1.5*.52,-c.y*n*1.5*.52,n*.6,0,hi),e.fill());const y=l&&a==="full"?Ot(i,S=>d(S)&&S.eye!=="pupil"&&S.eye!=="half-lidded"):0;if(y>0){const S=Ro(n,c,0,u);e.globalAlpha=y*(1-s),e.fillStyle="#ffffff",e.beginPath(),e.arc(S.x,S.y,n*.28,0,hi),e.fill()}e.restore()}h(Rf,"drawMorphEye");function Lo(e,t){const i=Math.min(t*.35,Math.max(...e.map(r=>r.x))*.75);let n=-1/0;for(let r=0;r<e.length;r++){const s=e[r],a=e[(r+1)%e.length];if(s.x<=i&&a.x>=i||a.x<=i&&s.x>=i){const o=Math.abs(a.x-s.x)<1e-8?Math.max(s.y,a.y):s.y+(a.y-s.y)*(i-s.x)/(a.x-s.x);n=Math.max(n,o)}}return{x:i,y:(Number.isFinite(n)?n:0)+6}}h(Lo,"droolAnchor");function Uo(e,t,i=1){e.save(),e.globalAlpha=i,e.strokeStyle="#fffef5",e.lineWidth=16,e.beginPath(),e.moveTo(t.x,t.y),e.lineTo(t.x+3,t.y+34*i),e.stroke(),e.fillStyle="#fffef5",e.beginPath(),e.arc(t.x+3,t.y+38*i,8*i,0,hi),e.fill(),e.restore()}h(Uo,"drawDrool");function Cf(e,t,i,n){const r=i.map(m=>Io({...t,...m.traits})),s=xr(r.map(m=>m.outline),i),a=xr(r.map(m=>m.opening),i),o=r.reduce((m,y,S)=>m+y.width*i[S].weight,0),l=r.reduce((m,y,S)=>m+y.height*i[S].weight,0);e.fillStyle=n,Pi(e,s),e.fill(),e.save(),Pi(e,s),e.clip(),Pi(e,a),e.clip();const c=Ot(i,m=>m.tongue),f=Ot(i,m=>m.teeth);e.translate(0,27*Ot(i,m=>m.mouth==="cry")),c>0&&(e.globalAlpha=c,e.fillStyle="#f37b83",e.beginPath(),e.ellipse(10,l*.65,o*.65,l*.34,-.1,0,hi),e.fill()),f>0&&(e.globalAlpha=f,e.fillStyle="#fffef8",e.beginPath(),e.roundRect(-o*.76,-23,o*1.52,30,12),e.fill()),e.restore(),(c>0||f>0)&&(e.save(),Pi(e,s),e.clip(),Pi(e,a),e.strokeStyle=n,e.lineWidth=17*t.mouthStroke,e.lineJoin="round",e.stroke(),e.restore());const d=Ot(i,m=>m.mouth==="tongue-out");if(d>0){const m=61*t.mouthWidth;e.save(),e.globalAlpha=d,e.fillStyle="#ff526c",e.beginPath(),e.moveTo(-m*.6*d,5),e.lineTo(m*.6*d,5),e.bezierCurveTo(m*.88*d,(85*t.mouthOpen+28)*d,-m*.88*d,(85*t.mouthOpen+28)*d,-m*.6*d,5),e.fill(),e.restore()}const u=Ot(i,m=>m.drool);u>0&&Uo(e,Lo(s,o),u)}h(Cf,"drawMorphMouth");function Pf(e,t,i,n,r,s=1,a=1){if(!t.some(l=>l.traits.brows!=="none"))return;const o=t.map(({traits:l})=>l.brows==="none"?yi([oe(0,0)]):yi(Cn((l.brows==="raised"?Lt(0,10,i*.85,i*.85,Math.PI*1.15,Math.PI*1.85):l.brows==="worried"?sn(oe(n*i,2),oe(-n*i*.1,10),oe(-n*i*.75,-16)):[oe(n*i,-10),oe(-n*i*.75,8)]).map(c=>({...c,x:c.x*a})),12*s)));e.fillStyle=r,Pi(e,xr(o,t)),e.fill()}h(Pf,"drawMorphBrow");function If(e,t,i={x:-5.9,y:-24.2,z:0},n={x:0,y:0}){return e.trueFront?{x:0,y:0,z:0}:{x:e.followRotation?-n.y*16:i.x+t.rotationX,y:e.followRotation?n.x*28:i.y+t.rotationY,z:e.followRotation?0:i.z+t.rotationZ}}h(If,"characterRotation");function Lf(e){const t=new F(0,0,1).applyQuaternion(e),i=wr({x:t.x/Math.sin(28*Math.PI/180),y:t.y/Math.sin(16*Math.PI/180)});return{x:-.015+i.x*.045,y:.015+i.y*.045}}h(Lf,"toonLightOffset");function Uf(e,t,i){const n=i>12&&i<=48,r=i<=32,s=i<40&&i!==32,a=i===24||i===32;return i===16&&(t={...t,pose:{...t.pose,faceScale:t.pose.faceScale*1.2}}),{character:n||s?{...e,...n?{iris:!1}:{},...s?{toon:!1}:{},...i<40?{shadow:!1}:{},...r?{trueFront:!0,lockPosition:!0,followRotation:!1}:{}}:e,sample:n||r?{...t,...r?{faceLayers:void 0}:{},pose:{...t.pose,faceScale:t.pose.faceScale*(n?1.3:1),eyeSize:t.pose.eyeSize*(i===24?1.2:1)*(i>=16&&i<=32?1.1664:1)*(a?.8:1),...r?{squash:1}:{},...r?{mouth:"smile",prop:"none",drool:!1,tears:!1,blush:0,brows:"none",mouthWidth:Vn.mouthWidth*(i>=16?1.44:1),mouthStroke:Vn.mouthStroke*(i>=16?1.44:1),gazeX:-4,gazeY:0,leftX:0,rightX:0,leftY:0,rightY:0,spacing:Vn.spacing*.77*(a?1.2:1),faceY:Vn.faceY+(i===32?.025*Do(e.shape):0)}:{}}}:t,simpleEyes:n}}h(Uf,"faceForSize");var Do=h(e=>e==="capsule"?2:1,"bodyHeight");function No(e,t){if(e==="sphere")return Math.sqrt(Math.max(0,.25-t*t));if(e==="capsule"){const i=Math.max(Math.abs(t)-.5,0);return Math.sqrt(Math.max(0,.25-i*i))}return t>=0?Math.sqrt(Math.max(0,.25-t*t)):t>=-.43?.5:.43+Math.sqrt(Math.max(0,.07**2-(t+.43)**2))}h(No,"radiusAt");function cs(e,t=!1){if(e==="sphere")return new Ac(.5,80,64);if(e==="capsule")return new gs(.5,1,24,80);const i=[new Ue(0,-.5),new Ue(t?.5:.43,-.5)];for(let n=1;!t&&n<=12;n++){const r=-Math.PI/2+n/12*Math.PI/2;i.push(new Ue(.43+.07*Math.cos(r),-.43+.07*Math.sin(r)))}i.push(new Ue(.5,0));for(let n=1;n<=32;n++){const r=n/32*Math.PI/2;i.push(new Ue(.5*Math.cos(r),.5*Math.sin(r)))}return new bc(i,80)}h(cs,"geometryFor");var Df=`
  uniform vec3 fillScale;
  uniform vec3 fillOffset;
  varying vec3 vPosition;
  void main() {
    vPosition = position * fillScale + fillOffset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Nf=`
  uniform vec3 colorA;
  uniform vec3 colorB;
  uniform float gradientOn;
  uniform float toonOn;
  uniform float insetFill;
  uniform float angle;
  uniform float bodyHeight;
  varying vec3 vPosition;
  void main() {
    float t = clamp(0.5 + vPosition.y / bodyHeight * cos(angle) + vPosition.x * sin(angle), 0.0, 1.0);
    vec3 color = mix(colorA, mix(colorB, colorA, t), gradientOn);
    // The light fill uses an inset copy of the silhouette, with one crisp shade step.
    float shade = mix(0.82, 1.0, insetFill);
    gl_FragColor = vec4(color * mix(1.0, shade, toonOn), 1.0);
    #include <colorspace_fragment>
  }
`;function Fo(e,t,i,n){e.beginPath(),e.moveTo(t,i+n),e.bezierCurveTo(t-n*2,i-n*.1,t-n,i-n*1.5,t,i-n*.55),e.bezierCurveTo(t+n,i-n*1.5,t+n*2,i-n*.1,t,i+n),e.closePath(),e.fill()}h(Fo,"heart");function Oo(e,t,i,n,r=5){e.beginPath();for(let s=0;s<r*2;s++){const a=s/(r*2)*Math.PI*2-Math.PI/2,o=s%2?n*.46:n,l=t+Math.cos(a)*o,c=i+Math.sin(a)*o;s?e.lineTo(l,c):e.moveTo(l,c)}e.closePath(),e.fill()}h(Oo,"star");var Ci=.76/.57,Ua=h((e,t,i)=>{const n=Math.max(0,Math.min(1,(i-e)/(t-e)));return n*n*(3-2*n)},"smoothstep"),Bo=h(e=>(e%1+1)%1,"fract");function Ff(e){const t=Bo(e);return Ua(0,.18,t)*(1-Ua(.72,1,t))}h(Ff,"effectEnvelope");function zo(e,t,i,n){return(i==="eyes"?29:27)*e.eyeSize*(n<0?e.leftScale:e.rightScale)*(t.iris?1.2:1)}h(zo,"eyeRadius");function Of(e,t,i,n,r,s,a){const o=zo(t,e,"full",n),l=256+n*103*t.spacing+(n<0?t.leftX:t.rightX),c=197-(n<0?t.leftY:t.rightY),f=(t.eyeTilt*n+(n<0?t.leftRotation:t.rightRotation))*Math.PI/180,d=Math.max(.12,1-i)*t.eyeHeight*(1-.35*(a?Ot(a,S=>S.eye==="soft"):t.eye==="soft"?1:0)),u=e.elevated?1+e.elevation:1.003,m=h((S,g)=>{const p=l+Math.cos(f)*S-Math.sin(f)*g*d,R=c+Ci*(Math.sin(f)*S+Math.cos(f)*g*d),C=(p/512-.5)*.76*t.faceScale,v=(.5-R/512)*.57*t.faceScale+(e.shape==="capsule"?-.14:-.025)+t.faceY,A=u*No(e.shape,v/u);return new F(C,v,Math.sqrt(Math.max(.001,A*A-C*C))).applyMatrix4(r).project(s)},"project"),y=m(0,0);return{center:y,right:m(o*.1,0).sub(m(-o*.1,0)).multiplyScalar(5).add(y),up:m(0,-o*.1).sub(m(0,o*.1)).multiplyScalar(5).add(y)}}h(Of,"projectedEye");function Bf(e,t,i=!1){return e.iris?i?{x:-.22,y:.22}:e.followCursor?t:{x:t.x-.22,y:t.y+.22}:t}h(Bf,"irisRestGaze");function zf(e,t,i,n,r,s,a,o){const l=h(c=>{const f=wo({x:t.gazeX+s.x,y:t.gazeY+s.y},t.eyeTilt*c+(c<0?t.leftRotation:t.rightRotation));if(!a?.weight)return f;const{center:d,right:u,up:m}=Of(e,t,i,c,n,r,o),y=xf(a,d,u,m),S=Math.max(0,Math.min(1,a.weight));return{x:f.x+(y.x-f.x)*S,y:f.y+(y.y-f.y)*S}},"eye");return{left:l(-1),right:l(1)}}h(zf,"resolveEyeGazes");function Vo(e,t,i,n){e.beginPath(),e.moveTo(t,i-n*1.5),e.bezierCurveTo(t-n*.25,i-n*.8,t-n,i-n*.2,t-n,i+n*.35),e.bezierCurveTo(t-n,i+n*1.65,t+n,i+n*1.65,t+n,i+n*.35),e.bezierCurveTo(t+n,i-n*.2,t+n*.25,i-n*.8,t,i-n*1.5),e.fill()}h(Vo,"drop");function Vf(e,t,i,n){return e>=16&&e<32?512*i/n/(.57*t):0}h(Vf,"compactMouthOffset");function Gf(e,t,i,n,r,s,a={}){if(e.clearRect(0,0,512,512),r==="body")return;const o=i.eyeColor,l=r==="eyes"?254:197,c=103*t.spacing,f=i.iris&&r==="full",d=f?0:(t.gazeX+s.x)*20,u=f?0:-(t.gazeY+s.y)*15,m=a.faceLayers,y=!a.simpleEyes&&r==="full"?m?Ot(m,b=>b.eye==="pupil"):t.eye==="pupil"?1:0:0;e.lineCap="round",e.lineJoin="round";for(const b of[-1,1]){const w=zo(t,i,r,b),_=b<0?a.eyeGazes?.left:a.eyeGazes?.right,T=!a.simpleEyes&&t.eye==="pupil"&&r==="full",z=256+b*c+d*(1-y)+(b<0?t.leftX:t.rightX),P=l+u*(1-y)-(b<0?t.leftY:t.rightY);r==="full"&&t.blush>0&&(e.save(),e.globalAlpha=t.blush*.8,e.fillStyle="#ff647a",e.beginPath(),e.ellipse(z+b*20,P+56,31,24*Ci,0,0,Math.PI*2),e.fill(),e.restore());const k=b<0?t.leftRotation:t.rightRotation;e.save(),e.translate(z,P),e.scale(1,Ci),e.rotate((t.eyeTilt*b+k)*Math.PI/180),e.fillStyle=o,e.strokeStyle=o,e.lineWidth=Math.max(13,w*.43);const Y=["open","grin","smile","u-smile"].includes(t.mouth),V=["closed","arc-up","arc-down"].includes(t.eye)||t.eye==="wink"&&b>0||r==="eyes"&&["open","grin"].includes(t.mouth)&&t.eye==="dot";if(a.simpleEyes)e.fillStyle="#000000",e.scale(1,Math.max(.12,1-n)),e.beginPath(),e.arc(0,0,w,0,Math.PI*2),e.fill();else if(m){const H=_??wo({x:t.gazeX+s.x,y:t.gazeY+s.y},t.eyeTilt*b+k);Rf(e,t,m,w,b,n,r,o,i.iris,H)}else if(t.faceSet==="set-2"&&t.eye==="wink"&&b>0)e.beginPath(),e.moveTo(w*.7,-w*.65),e.lineTo(-w*.55,0),e.lineTo(w*.7,w*.65),e.stroke();else if(V){const H=t.eye==="arc-up"||t.eye!=="arc-down"&&Y;e.beginPath(),e.arc(0,0,w,H?Math.PI:0,H?Math.PI*2:Math.PI),e.stroke()}else if(t.eye==="squint")e.beginPath(),e.moveTo(-w*b*.7,-w*.8),e.lineTo(w*b*.6,0),e.lineTo(-w*b*.7,w*.8),e.stroke();else if(n>.7)e.beginPath(),e.moveTo(-w,0),e.lineTo(w,0),e.stroke();else{const H=Math.max(.12,1-n)*t.eyeHeight*(t.eye==="soft"?.65:1);if(e.scale(1,H),t.cheeks&&(e.beginPath(),e.rect(-w*2,-w*2,w*4,w*4),e.moveTo(w*.82,w*1.13),e.arc(0,w*1.13,w*.82,0,Math.PI*2),e.clip("evenodd")),t.eye==="star")Oo(e,0,0,w*1.2);else if(t.eye==="heart")t.faceSet==="set-2"&&r==="full"&&(e.fillStyle="#ff3f58"),Fo(e,0,0,w);else if(t.eye==="half-lidded")e.beginPath(),e.arc(0,0,w,0,Math.PI),e.closePath(),e.fill();else if(T){const q=w*1.5;e.fillStyle="#fffef9",e.beginPath(),e.arc(0,0,q,0,Math.PI*2),e.fill(),e.clip();const O=_??{x:t.gazeX+s.x,y:t.gazeY+s.y};e.fillStyle=o,e.beginPath(),e.arc(O.x*q*.52,-O.y*q*.52,q*.4,0,Math.PI*2),e.fill()}else e.beginPath(),e.arc(0,0,w,0,Math.PI*2),e.fill();if(f&&!T&&t.eye!=="half-lidded"){e.clip();const q=Ro(w,_??{x:t.gazeX+s.x,y:t.gazeY+s.y},_?0:t.eyeTilt*b+k,t.cheeks);e.fillStyle="#ffffff",e.beginPath(),e.arc(q.x,q.y,w*.28,0,Math.PI*2),e.fill()}}if(e.restore(),r==="full"&&(m||t.brows!=="none")&&(e.save(),e.translate(z,P-w*(1.45+.35*y)),e.scale(1,Ci),Pf(e,m??Ko(t),w,b,o,t.browStroke??1,t.browLength??1),e.restore()),t.tears&&r==="full"){const H=Bo((a.phase??.35)+(b<0?.46:0)),q=Ff(H)*(a.tearAmount??1);e.save(),e.translate(z+b*(w+18),P+23+H*H*123),e.scale(1,Ci),e.rotate(-b*.2),e.globalAlpha=q,e.fillStyle="#f6fdff",Vo(e,0,0,12+H*3),e.restore()}}if(r==="eyes")return;const S=a.mouthFollowsEyes?256+d*(1-y)+(t.leftX+t.rightX)/2:256+d*.25,g=(a.mouthFollowsEyes?275+u:293+u*.25)+(a.mouthOffset??0);if(m){e.save(),e.translate(S,g),e.scale(1,Ci),Cf(e,t,m,o),e.restore();return}const p=S,R=t.mouth==="cry"?329+u*.25:g,C=["open","grin","cry"].includes(t.mouth),v=(C?124:t.mouth==="oh"?51:61)*t.mouthWidth,A=17*t.mouthStroke;if(e.save(),e.translate(p,R),e.scale(1,Ci),e.fillStyle=o,e.strokeStyle=o,e.lineWidth=A,e.beginPath(),t.mouth==="smile")e.arc(0,-10,v,Math.PI*.18,Math.PI*.82),e.stroke();else if(t.mouth==="u-smile")e.arc(0,-8,v*.56,0,Math.PI),e.stroke();else if(t.mouth==="frown")e.arc(0,39,v,Math.PI*1.2,Math.PI*1.8),e.stroke();else if(t.mouth==="line"||t.mouth==="sleep")e.moveTo(-v*.58,0),e.lineTo(v*.58,0),e.stroke();else if(t.mouth==="kiss")e.moveTo(-v*.25,-21),e.bezierCurveTo(v*.48,-34,v*.53,-2,0,0),e.bezierCurveTo(v*.53,2,v*.48,34,-v*.25,21),e.stroke();else if(t.mouth==="tongue-out")e.beginPath(),e.moveTo(-v,-9),e.quadraticCurveTo(0,-2,v,-9),e.stroke(),e.fillStyle="#ff526c",e.beginPath(),e.moveTo(-v*.6,5),e.lineTo(v*.6,5),e.bezierCurveTo(v*.88,85*t.mouthOpen+28,-v*.88,85*t.mouthOpen+28,-v*.6,5),e.fill();else if(t.mouth==="wave")e.moveTo(-v,4),e.bezierCurveTo(-v*.35,-25,v*.35,25,v,-4),e.stroke();else{const b=(C?48:22)+72*t.mouthOpen;if(t.mouth==="oh")e.arc(0,14,v*(.55+.3*t.mouthOpen),0,Math.PI*2);else if(t.mouth==="cry")e.moveTo(-v,30),e.bezierCurveTo(-v*1.1,-b,v*1.1,-b,v,30),e.quadraticCurveTo(v,44,v*.76,38),e.quadraticCurveTo(0,24,-v*.76,38),e.quadraticCurveTo(-v,44,-v,30);else{const w=t.mouth==="grin"?24:0;e.moveTo(-v,-11),e.quadraticCurveTo(0,5,v,-11-w),e.bezierCurveTo(v*1.02,b,-v*1.02,b,-v,-11)}if(e.closePath(),e.fill(),e.save(),e.clip(),t.tongue&&(e.fillStyle="#f37b83",e.beginPath(),e.ellipse(10,b*.65,v*.65,b*.34,-.1,0,Math.PI*2),e.fill()),t.teeth&&(e.fillStyle="#fffef8",e.beginPath(),e.roundRect(-v*.76,-23,v*1.52,30,12),e.fill()),e.restore(),e.beginPath(),t.mouth==="oh")e.arc(0,14,v*(.55+.3*t.mouthOpen),0,Math.PI*2);else if(t.mouth==="cry")e.moveTo(-v,30),e.bezierCurveTo(-v*1.1,-b,v*1.1,-b,v,30),e.quadraticCurveTo(v,44,v*.76,38),e.quadraticCurveTo(0,24,-v*.76,38),e.quadraticCurveTo(-v,44,-v,30);else{const w=t.mouth==="grin"?24:0;e.moveTo(-v,-11),e.quadraticCurveTo(0,5,v,-11-w),e.bezierCurveTo(v*1.02,b,-v*1.02,b,-v,-11)}e.closePath(),e.strokeStyle=o,e.stroke()}if(t.drool){const b=Lo(Io(t).outline,v);t.mouth==="cry"&&(b.y-=27),Uo(e,b)}e.restore()}h(Gf,"drawFace");function Hf(e,t,i,n,r={}){e.clearRect(0,0,256,256);const s=Ao(t,n,r);e.save(),e.translate(128,128),e.scale(256/s.extent,256/s.extent),e.translate(-128,-128);for(const a of s.particles){const o=a.index;if(e.save(),e.globalAlpha=a.alpha,e.translate(a.x,a.y),e.scale(a.scale,a.scale),e.fillStyle=i,e.strokeStyle=i,e.lineWidth=11,e.lineCap="round",e.lineJoin="round",t==="zzz"){const l=14+o*5;e.beginPath(),e.moveTo(-l,-l),e.lineTo(l,-l),e.lineTo(-l,l),e.lineTo(l,l),e.stroke()}else t==="sparkle"?Oo(e,0,0,23+o*4,4):t==="heart"?Fo(e,0,0,17+o*3):t==="question"?(e.font="bold 144px sans-serif",e.textAlign="center",e.fillText("?",0,48)):t==="sweat"?Vo(e,0,0,38):t==="crown"&&(e.beginPath(),e.moveTo(-78,42),e.lineTo(-94,-45),e.lineTo(-35,-3),e.lineTo(0,-67),e.lineTo(35,-3),e.lineTo(94,-45),e.lineTo(78,42),e.closePath(),e.fill());e.restore()}e.restore()}h(Hf,"drawProp");var kf=class{static{h(this,"CharacterRenderer")}canvas;gl;scene=new $s;shadowScene=new $s;camera=new Ts(-1,1,1,-1,.1,30);root=new Tn;body;lightFill;face;faceCanvas=null;faceCtx=null;faceTexture=null;propCanvas=null;propCtx=null;propTexture=null;prop;shadow;shape="capsule";squareBottom=!1;lastFaceKey="";resolvedEyes;lastProp="";disposed=!1;options;captured;constructor(e,t){this.canvas=e,this.options=t,this.gl=null,e&&(this.faceCanvas=document.createElement("canvas"),this.propCanvas=document.createElement("canvas"),this.gl=new Mf({canvas:e,antialias:!0,alpha:!0,preserveDrawingBuffer:!0,powerPreference:"low-power"}),this.gl.outputColorSpace=wt,this.gl.setPixelRatio(t.pixelRatio??Math.min(Math.max(window.devicePixelRatio||1,1)*2,4)),this.faceCanvas.width=this.faceCanvas.height=1024,this.faceCtx=this.faceCanvas.getContext("2d"),this.faceCtx.scale(2,2),this.faceTexture=new sa(this.faceCanvas),this.faceTexture.colorSpace=wt,this.faceTexture.generateMipmaps=!0,this.faceTexture.minFilter=Er,this.propCanvas.width=this.propCanvas.height=512,this.propCtx=this.propCanvas.getContext("2d"),this.propCtx.scale(2,2),this.propTexture=new sa(this.propCanvas),this.propTexture.colorSpace=wt);const i=new qt({uniforms:{colorA:{value:new ke},colorB:{value:new ke},gradientOn:{value:1},toonOn:{value:1},insetFill:{value:0},fillScale:{value:new F(1,1,1)},fillOffset:{value:new F},angle:{value:0},bodyHeight:{value:2}},vertexShader:Df,fragmentShader:Nf});this.body=new It(cs("capsule"),i);const n=i.clone();n.depthTest=!1,n.depthWrite=!1,n.uniforms.insetFill.value=1,this.lightFill=new It(new gs(.42,.94,24,80),n),this.lightFill.renderOrder=1,this.face=new It(new Es(1,1,56,40),new yr({map:this.faceTexture,transparent:!0,alphaTest:.008,depthWrite:!1,side:0,toneMapped:!1})),this.face.geometry.setAttribute("faceValid",new Bt(new Float32Array(this.face.geometry.attributes.position.count).fill(1),1)),this.face.material.onBeforeCompile=r=>{r.vertexShader=`attribute float faceValid; varying float vFaceValid;
`+r.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vFaceValid = faceValid;`),r.fragmentShader=`varying float vFaceValid;
`+r.fragmentShader.replace("void main() {",`void main() {
if (vFaceValid < 0.99) discard;`)},this.prop=new gc(new io({map:this.propTexture,transparent:!0,depthWrite:!1,toneMapped:!1})),this.shadow=new It(new Tc(.35,64),new yr({color:"#809299",transparent:!0,opacity:.2,depthWrite:!1})),this.root.add(this.body,this.lightFill,this.face,this.prop),this.scene.add(this.root),this.shadowScene.add(this.shadow),this.camera.position.set(0,0,8),this.camera.lookAt(0,0,0),this.resize(t.width,t.height,t.displaySize)}resize(e,t,i){this.options={...this.options,width:Math.max(1,e),height:Math.max(1,t),displaySize:i??Math.min(e,t)},this.gl?.setSize(this.options.width,this.options.height,!1)}render(e,t,i={},n={x:0,y:0}){if(this.disposed)return;this.options={...this.options,...i};const r=this.options.displaySize??Math.min(this.options.width,this.options.height),s=Uf(e,t,r);e=s.character,t=s.sample;const a=e.shape==="cap"&&r<=24;(e.shape!==this.shape||a!==this.squareBottom)&&(this.shape=e.shape,this.squareBottom=a,this.body.geometry.dispose(),this.body.geometry=cs(this.shape,a),this.lightFill.geometry.dispose(),this.lightFill.geometry=this.shape==="capsule"?new gs(.42,.94,24,80):cs(this.shape));const{pose:o}=t,l=Do(this.shape),c=Zo(r),f=this.body.material.uniforms;f.colorA.value.set(e.color),f.colorB.value.set(e.color2),f.gradientOn.value=e.gradient?1:t.gradientMix??(t.gradientRotation!==void 0?1:0),f.toonOn.value=e.toon?1:0,f.angle.value=(e.gradientAngle+(t.gradientRotation??0))*Math.PI/180,f.bodyHeight.value=l;const d=If(this.options.reducedMotion?{...e,followRotation:!1}:e,o,this.options.rotation,this.options.cursor);this.root.rotation.set(d.x*Math.PI/180,d.y*Math.PI/180,d.z*Math.PI/180,"YXZ"),this.root.position.y=e.lockPosition?0:t.bob*.025*l;const u=o.squash+(e.lockPosition?0:t.breathe*.008);this.root.scale.set(1/Math.sqrt(u),u,1/Math.sqrt(u)),this.lightFill.visible=e.toon;const m=this.shape==="capsule"?1:.85;this.lightFill.scale.setScalar(m),this.root.updateMatrixWorld(!0);const y=Lf(this.root.quaternion),S=Math.min(this.root.scale.x,this.root.scale.y,this.root.scale.z),g=new F(y.x*S,y.y*S,0).applyMatrix4(new lt().copy(this.root.matrixWorld).invert()).sub(new F().applyMatrix4(new lt().copy(this.root.matrixWorld).invert()));this.lightFill.position.copy(g);const p=this.lightFill.material.uniforms;for(const fe of["colorA","colorB"])p[fe].value.copy(f[fe].value);for(const fe of["gradientOn","toonOn","angle","bodyHeight"])p[fe].value=f[fe].value;p.fillScale.value.setScalar(m),p.fillOffset.value.copy(g);const R=r<=128?1:this.options.zoom??1,C=this.options.width/this.options.height,v=this.options.framing==="character"?.82:r<=128?.55:.72;let A=Math.max(l*v,v/C)/R;if(r>32&&r<=128){this.body.geometry.boundingSphere||this.body.geometry.computeBoundingSphere();const fe=this.body.geometry.boundingSphere,He=((fe.radius+fe.center.length())*Math.max(1,this.root.scale.x,this.root.scale.y,this.root.scale.z)+this.root.position.length())/.9;A=Math.max(A,He,He/C)}this.camera.left=-A*C,this.camera.right=A*C,this.camera.top=A,this.camera.bottom=-A,this.camera.updateProjectionMatrix(),this.camera.updateMatrixWorld(!0),this.face.visible=c!=="body";const b=!!this.options.reducedMotion,w=b?{x:0,y:0}:n,_=!b&&!e.followCursor&&e.followRotation&&!e.trueFront?this.options.cursor??{x:0,y:0}:{x:0,y:0},T=e.iris?new F(w.x+_.x*.575,w.y+_.y*.575,0).applyQuaternion(this.root.quaternion.clone().invert()):w,z=r<=32?{x:0,y:0}:Bf(e,T,b);this.resolvedEyes=!s.simpleEyes&&c==="full"&&(e.iris||o.eye==="pupil"||t.faceLayers?.some(fe=>fe.traits.eye==="pupil"))?(b?void 0:this.options.eyeGazes)??zf(e,b?{...o,gazeX:0,gazeY:0}:o,t.blink,this.root.matrixWorld,this.camera,z,!b&&e.followCursor?this.options.pointerLook:void 0,t.faceLayers):void 0;const P=Vf(r,o.faceScale,A*2,r),k=JSON.stringify([P,o,t.faceLayers,e.eyeColor,e.iris,s.simpleEyes,t.blink.toFixed(3),o.tears?t.effectPhase?.toFixed(2):0,t.tearAmount,c,z.x.toFixed(3),z.y.toFixed(3),this.resolvedEyes]);this.faceCtx&&this.faceTexture&&k!==this.lastFaceKey&&(Gf(this.faceCtx,o,e,t.blink,c,z,{phase:t.effectPhase,tearAmount:t.tearAmount,eyeGazes:this.resolvedEyes,faceLayers:t.faceLayers,simpleEyes:s.simpleEyes,mouthOffset:P,mouthFollowsEyes:r>=16&&r<=32}),this.faceTexture.needsUpdate=!0,this.lastFaceKey=k);const Y=this.face.geometry.attributes.position,V=this.face.geometry.attributes.uv,H=this.face.geometry.attributes.faceValid,q=e.elevated?1+e.elevation:1.003,O=o.faceScale,ee=(this.shape==="capsule"?-.14:-.025)+o.faceY;for(let fe=0;fe<Y.count;fe++){const He=(V.getX(fe)-.5)*.76*O,Ye=(V.getY(fe)-.5)*.57*O+ee,K=q*No(this.shape,Ye/q),se=Math.sqrt(Math.max(.001,K*K-He*He));Y.setXYZ(fe,He,Ye,se),H.setX(fe,He*He<K*K&&Math.abs(Ye)<l/2*q?1:0)}Y.needsUpdate=!0,H.needsUpdate=!0,this.face.geometry.computeBoundingSphere(),this.prop.visible=c==="full"&&o.prop!=="none",this.prop.material.depthTest=o.prop!=="zzz",this.prop.renderOrder=o.prop==="zzz"?2:0;const te=`${o.prop}:${o.propSize}:${o.propCount}:${o.propOutward}:${t.effectPhase?.toFixed(2)??"still"}`;this.propCtx&&this.propTexture&&te!==this.lastProp&&(Hf(this.propCtx,o.prop,o.prop==="heart"?"#ff768c":o.prop==="sweat"?"#b7e9ff":"#ffd362",t.effectPhase,o),this.propTexture.needsUpdate=!0,this.lastProp=te);const ie=this.shape==="capsule"?.42:.32;this.prop.scale.setScalar(ie*Ao(o.prop,t.effectPhase,o).extent/256*(.7+.3*(t.propAmount??1))),this.prop.material.opacity=t.propAmount??1,this.prop.position.set(o.prop==="crown"?0:.56,o.prop==="crown"?l/2+.08:l*.29,.15),this.shadow.visible=e.shadow&&c==="full",this.shadow.position.set(0,-l*.58,-.2),this.shadow.scale.set((1-(e.lockPosition?0:t.bob)*.06)*(this.shape==="capsule"?1:.95),.12,1);const de=this.options.background;de?this.gl?.setClearColor(de,1):this.gl?.setClearColor(0,0),this.shadowScene.updateMatrixWorld(!0),this.scene.updateMatrixWorld(!0),this.gl&&(this.gl.autoClear=!0,this.gl.render(this.shadowScene,this.camera),this.gl.autoClear=!1,this.gl.clearDepth(),this.gl.render(this.scene,this.camera),this.gl.autoClear=!0),this.captured={character:e,sample:t,gaze:z,simpleEyes:s.simpleEyes}}snapshotScene(){if(!this.captured)throw new Error("Render the character before taking a snapshot.");return{...this.captured,options:this.options,camera:this.camera,body:this.body,lightFill:this.lightFill,face:this.face,prop:this.prop,shadow:this.shadow,eyeGazes:this.resolvedEyes}}orientation(){return this.root.quaternion.clone()}eyeGazes(){return this.resolvedEyes?{left:{...this.resolvedEyes.left},right:{...this.resolvedEyes.right}}:void 0}dispose(){this.disposed||(this.disposed=!0,this.body.geometry.dispose(),this.body.material.dispose(),this.lightFill.geometry.dispose(),this.lightFill.material.dispose(),this.face.geometry.dispose(),this.face.material.dispose(),this.faceTexture?.dispose(),this.propTexture?.dispose(),this.prop.material.dispose(),this.shadow.geometry.dispose(),this.shadow.material.dispose(),this.gl?.dispose(),this.gl?.forceContextLoss())}};function Yf(e,t,i={}){const n=document.createElement("canvas");n.style.cssText="display:block;width:100%;height:100%;touch-action:pan-y;",n.setAttribute("aria-hidden","true");const r=new kf(n,{width:e.clientWidth||256,height:e.clientHeight||256,displaySize:i.displaySize,framing:"character"});e.appendChild(n);let s=i.animation??"idle",a=0,o=0,l=0,c=!1,f=!1,d=!0,u=!1,m=An(),y=An();const S=i.trackingScope==="page"?e.ownerDocument.documentElement:i.trackingRegion??e,g=window.matchMedia("(prefers-reduced-motion: reduce)"),p=window.matchMedia("(pointer: coarse)"),R=h(()=>!f&&c&&!document.hidden&&!g.matches,"canRun"),C=h(()=>r.render({...t.character,followCursor:i.followCursor!==!1,followRotation:i.followRotation!==!1},$o(t,s,a),{cursor:m,reducedMotion:g.matches},m),"render"),v=h(V=>{V.pointerType!=="touch"&&(y=Ef(V,e.getBoundingClientRect()))},"pointer"),A=h(()=>{y=An()},"leave");function b(V){u!==V&&(u=V,V?(S.addEventListener("pointermove",v,{passive:!0}),S.addEventListener("pointerleave",A)):(S.removeEventListener("pointermove",v),S.removeEventListener("pointerleave",A),y=An()))}h(b,"track");function w(){cancelAnimationFrame(l),l=0,b(R()&&!p.matches&&(i.followCursor!==!1||i.followRotation!==!1)),R()&&d&&(o=performance.now(),l=requestAnimationFrame(_))}h(w,"sync");function _(V){if(!R()){w();return}const H=Math.min((V-o)/1e3,.1);o=V,a+=H,m=Tf(m,y,H,!1);try{C()}catch{d=!1,w(),i.onError?.();return}const q=t.animations.find(O=>O.id===s);q&&!q.loop&&a*t.character.speed>=Jo(q)&&(s="idle",a=0,i.onComplete?.()),l=requestAnimationFrame(_)}h(_,"frame");function T(){if(!f)try{C()}catch{d=!1,w(),i.onError?.()}}h(T,"renderSafely");let z=null,P=null;const k=h(V=>{V.preventDefault(),d=!1,w(),i.onError?.()},"contextLost");function Y(){f||(f=!0,w(),z?.disconnect(),P?.disconnect(),document.removeEventListener("visibilitychange",w),g.removeEventListener("change",w),p.removeEventListener("change",w),n.removeEventListener("webglcontextlost",k),r.dispose(),n.remove())}h(Y,"destroy");try{z=new ResizeObserver(()=>{try{r.resize(e.clientWidth||256,e.clientHeight||256,i.displaySize),c&&T()}catch{d=!1,w(),i.onError?.()}}),P=new IntersectionObserver(V=>{c=V[0]?.isIntersecting??!1,w()}),z.observe(e),P.observe(e),document.addEventListener("visibilitychange",w),g.addEventListener("change",w),p.addEventListener("change",w),n.addEventListener("webglcontextlost",k),C()}catch(V){throw Y(),V}return{setAnimation(V){s!==V&&(s=V,a=0,T())},setDefinition(V){t=V,T()},seek(V){a=Math.max(0,V),T()},pause(){d=!1,w()},play(){d=!0,w()},destroy:Y}}h(Yf,"createCharacter");export{Yf as createCharacter};
