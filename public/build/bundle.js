var app=function(){"use strict";function noop(){}const identity=e=>e;function run(e){return e()}function blank_object(){return Object.create(null)}function run_all(e){e.forEach(run)}function is_function(e){return"function"==typeof e}function safe_not_equal(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function subscribe(e,...t){if(null==e)return noop;const n=e.subscribe(...t);return n.unsubscribe?()=>n.unsubscribe():n}function component_subscribe(e,t,n){e.$$.on_destroy.push(subscribe(t,n))}const is_client="undefined"!=typeof window;let now=is_client?()=>window.performance.now():()=>Date.now(),raf=is_client?e=>requestAnimationFrame(e):noop;const tasks=new Set;function run_tasks(e){tasks.forEach(t=>{t.c(e)||(tasks.delete(t),t.f())}),0!==tasks.size&&raf(run_tasks)}function loop(e){let t;return 0===tasks.size&&raf(run_tasks),{promise:new Promise(n=>{tasks.add(t={c:e,f:n})}),abort(){tasks.delete(t)}}}function append(e,t){e.appendChild(t)}function insert(e,t,n){e.insertBefore(t,n||null)}function detach(e){e.parentNode.removeChild(e)}function destroy_each(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function element(e){return document.createElement(e)}function text(e){return document.createTextNode(e)}function space(){return text(" ")}function empty(){return text("")}function listen(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function stop_propagation(e){return function(t){return t.stopPropagation(),e.call(this,t)}}function attr(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function children(e){return Array.from(e.childNodes)}function set_data(e,t){t=""+t,e.data!==t&&(e.data=t)}function set_input_value(e,t){(null!=t||e.value)&&(e.value=t)}function custom_event(e,t){const n=document.createEvent("CustomEvent");return n.initCustomEvent(e,!1,!1,t),n}const active_docs=new Set;let active=0,current_component;function hash(e){let t=5381,n=e.length;for(;n--;)t=(t<<5)-t^e.charCodeAt(n);return t>>>0}function create_rule(e,t,n,o,r,a,i,c=0){const s=16.666/o;let l="{\n";for(let e=0;e<=1;e+=s){const o=t+(n-t)*a(e);l+=100*e+`%{${i(o,1-o)}}\n`}const u=l+`100% {${i(n,1-n)}}\n}`,d=`__svelte_${hash(u)}_${c}`,p=e.ownerDocument;active_docs.add(p);const f=p.__svelte_stylesheet||(p.__svelte_stylesheet=p.head.appendChild(element("style")).sheet),_=p.__svelte_rules||(p.__svelte_rules={});_[d]||(_[d]=!0,f.insertRule(`@keyframes ${d} ${u}`,f.cssRules.length));const m=e.style.animation||"";return e.style.animation=`${m?m+", ":""}${d} ${o}ms linear ${r}ms 1 both`,active+=1,d}function delete_rule(e,t){const n=(e.style.animation||"").split(", "),o=n.filter(t?e=>e.indexOf(t)<0:e=>-1===e.indexOf("__svelte")),r=n.length-o.length;r&&(e.style.animation=o.join(", "),active-=r,active||clear_rules())}function clear_rules(){raf(()=>{active||(active_docs.forEach(e=>{const t=e.__svelte_stylesheet;let n=t.cssRules.length;for(;n--;)t.deleteRule(n);e.__svelte_rules={}}),active_docs.clear())})}function set_current_component(e){current_component=e}function get_current_component(){if(!current_component)throw new Error("Function called outside component initialization");return current_component}function onMount(e){get_current_component().$$.on_mount.push(e)}function onDestroy(e){get_current_component().$$.on_destroy.push(e)}function createEventDispatcher(){const e=get_current_component();return(t,n)=>{const o=e.$$.callbacks[t];if(o){const r=custom_event(t,n);o.slice().forEach(t=>{t.call(e,r)})}}}function bubble(e,t){const n=e.$$.callbacks[t.type];n&&n.slice().forEach(e=>e(t))}const dirty_components=[],binding_callbacks=[],render_callbacks=[],flush_callbacks=[],resolved_promise=Promise.resolve();let update_scheduled=!1;function schedule_update(){update_scheduled||(update_scheduled=!0,resolved_promise.then(flush))}function add_render_callback(e){render_callbacks.push(e)}let flushing=!1;const seen_callbacks=new Set;function flush(){if(!flushing){flushing=!0;do{for(let e=0;e<dirty_components.length;e+=1){const t=dirty_components[e];set_current_component(t),update(t.$$)}for(dirty_components.length=0;binding_callbacks.length;)binding_callbacks.pop()();for(let e=0;e<render_callbacks.length;e+=1){const t=render_callbacks[e];seen_callbacks.has(t)||(seen_callbacks.add(t),t())}render_callbacks.length=0}while(dirty_components.length);for(;flush_callbacks.length;)flush_callbacks.pop()();update_scheduled=!1,flushing=!1,seen_callbacks.clear()}}function update(e){if(null!==e.fragment){e.update(),run_all(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(add_render_callback)}}let promise;function wait(){return promise||(promise=Promise.resolve(),promise.then(()=>{promise=null})),promise}function dispatch(e,t,n){e.dispatchEvent(custom_event(`${t?"intro":"outro"}${n}`))}const outroing=new Set;let outros;function group_outros(){outros={r:0,c:[],p:outros}}function check_outros(){outros.r||run_all(outros.c),outros=outros.p}function transition_in(e,t){e&&e.i&&(outroing.delete(e),e.i(t))}function transition_out(e,t,n,o){if(e&&e.o){if(outroing.has(e))return;outroing.add(e),outros.c.push(()=>{outroing.delete(e),o&&(n&&e.d(1),o())}),e.o(t)}}const null_transition={duration:0};function create_in_transition(e,t,n){let o,r,a=t(e,n),i=!1,c=0;function s(){o&&delete_rule(e,o)}function l(){const{delay:t=0,duration:n=300,easing:l=identity,tick:u=noop,css:d}=a||null_transition;d&&(o=create_rule(e,0,1,n,t,l,d,c++)),u(0,1);const p=now()+t,f=p+n;r&&r.abort(),i=!0,add_render_callback(()=>dispatch(e,!0,"start")),r=loop(t=>{if(i){if(t>=f)return u(1,0),dispatch(e,!0,"end"),s(),i=!1;if(t>=p){const e=l((t-p)/n);u(e,1-e)}}return i})}let u=!1;return{start(){u||(delete_rule(e),is_function(a)?(a=a(),wait().then(l)):l())},invalidate(){u=!1},end(){i&&(s(),i=!1)}}}function create_out_transition(e,t,n){let o,r=t(e,n),a=!0;const i=outros;function c(){const{delay:t=0,duration:n=300,easing:c=identity,tick:s=noop,css:l}=r||null_transition;l&&(o=create_rule(e,1,0,n,t,c,l));const u=now()+t,d=u+n;add_render_callback(()=>dispatch(e,!1,"start")),loop(t=>{if(a){if(t>=d)return s(0,1),dispatch(e,!1,"end"),--i.r||run_all(i.c),!1;if(t>=u){const e=c((t-u)/n);s(1-e,e)}}return a})}return i.r+=1,is_function(r)?wait().then(()=>{r=r(),c()}):c(),{end(t){t&&r.tick&&r.tick(1,0),a&&(o&&delete_rule(e,o),a=!1)}}}function create_bidirectional_transition(e,t,n,o){let r=t(e,n),a=o?0:1,i=null,c=null,s=null;function l(){s&&delete_rule(e,s)}function u(e,t){const n=e.b-a;return t*=Math.abs(n),{a:a,b:e.b,d:n,duration:t,start:e.start,end:e.start+t,group:e.group}}function d(t){const{delay:n=0,duration:o=300,easing:d=identity,tick:p=noop,css:f}=r||null_transition,_={start:now()+n,b:t};t||(_.group=outros,outros.r+=1),i?c=_:(f&&(l(),s=create_rule(e,a,t,o,n,d,f)),t&&p(0,1),i=u(_,o),add_render_callback(()=>dispatch(e,t,"start")),loop(t=>{if(c&&t>c.start&&(i=u(c,o),c=null,dispatch(e,i.b,"start"),f&&(l(),s=create_rule(e,a,i.b,i.duration,0,d,r.css))),i)if(t>=i.end)p(a=i.b,1-a),dispatch(e,i.b,"end"),c||(i.b?l():--i.group.r||run_all(i.group.c)),i=null;else if(t>=i.start){const e=t-i.start;a=i.a+i.d*d(e/i.duration),p(a,1-a)}return!(!i&&!c)}))}return{run(e){is_function(r)?wait().then(()=>{r=r(),d(e)}):d(e)},end(){l(),i=c=null}}}function create_component(e){e&&e.c()}function mount_component(e,t,n){const{fragment:o,on_mount:r,on_destroy:a,after_update:i}=e.$$;o&&o.m(t,n),add_render_callback(()=>{const t=r.map(run).filter(is_function);a?a.push(...t):run_all(t),e.$$.on_mount=[]}),i.forEach(add_render_callback)}function destroy_component(e,t){const n=e.$$;null!==n.fragment&&(run_all(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function make_dirty(e,t){-1===e.$$.dirty[0]&&(dirty_components.push(e),schedule_update(),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function init(e,t,n,o,r,a,i=[-1]){const c=current_component;set_current_component(e);const s=t.props||{},l=e.$$={fragment:null,ctx:null,props:a,update:noop,not_equal:r,bound:blank_object(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(c?c.$$.context:[]),callbacks:blank_object(),dirty:i};let u=!1;if(l.ctx=n?n(e,s,(t,n,...o)=>{const a=o.length?o[0]:n;return l.ctx&&r(l.ctx[t],l.ctx[t]=a)&&(l.bound[t]&&l.bound[t](a),u&&make_dirty(e,t)),n}):[],l.update(),u=!0,run_all(l.before_update),l.fragment=!!o&&o(l.ctx),t.target){if(t.hydrate){const e=children(t.target);l.fragment&&l.fragment.l(e),e.forEach(detach)}else l.fragment&&l.fragment.c();t.intro&&transition_in(e.$$.fragment),mount_component(e,t.target,t.anchor),flush()}set_current_component(c)}class SvelteComponent{$destroy(){destroy_component(this,1),this.$destroy=noop}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(){}}function cubicOut(e){const t=e-1;return t*t*t+1}function fade(e,{delay:t=0,duration:n=400,easing:o=identity}){const r=+getComputedStyle(e).opacity;return{delay:t,duration:n,easing:o,css:e=>"opacity: "+e*r}}function fly(e,{delay:t=0,duration:n=400,easing:o=cubicOut,x:r=0,y:a=0,opacity:i=0}){const c=getComputedStyle(e),s=+c.opacity,l="none"===c.transform?"":c.transform,u=s*(1-i);return{delay:t,duration:n,easing:o,css:(e,t)=>`\n\t\t\ttransform: ${l} translate(${(1-e)*r}px, ${(1-e)*a}px);\n\t\t\topacity: ${s-u*t}`}}function slide(e,{delay:t=0,duration:n=400,easing:o=cubicOut}){const r=getComputedStyle(e),a=+r.opacity,i=parseFloat(r.height),c=parseFloat(r.paddingTop),s=parseFloat(r.paddingBottom),l=parseFloat(r.marginTop),u=parseFloat(r.marginBottom),d=parseFloat(r.borderTopWidth),p=parseFloat(r.borderBottomWidth);return{delay:t,duration:n,easing:o,css:e=>`overflow: hidden;opacity: ${Math.min(20*e,1)*a};height: ${e*i}px;padding-top: ${e*c}px;padding-bottom: ${e*s}px;margin-top: ${e*l}px;margin-bottom: ${e*u}px;border-top-width: ${e*d}px;border-bottom-width: ${e*p}px;`}}var Add='<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',Inactive='<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',Close='<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';function create_fragment(e){let t,n,o,r,a,i,c,s,l,u,d,p=(e[0].completed?Add:Inactive)+"",f=e[0].text+"";return{c(){t=element("div"),n=element("div"),o=space(),r=element("div"),a=text(f),i=space(),c=element("div"),attr(n,"class","icon svelte-tklxt8"),attr(r,"class","text svelte-tklxt8"),attr(c,"class","icon svelte-tklxt8"),attr(t,"class",s="item "+(e[0].completed&&"completed")+" svelte-tklxt8")},m(s,l,f){insert(s,t,l),append(t,n),n.innerHTML=p,append(t,o),append(t,r),append(r,a),append(t,i),append(t,c),c.innerHTML=Close,u=!0,f&&run_all(d),d=[listen(c,"click",stop_propagation(e[3])),listen(t,"click",e[2])]},p(e,[o]){(!u||1&o)&&p!==(p=(e[0].completed?Add:Inactive)+"")&&(n.innerHTML=p),(!u||1&o)&&f!==(f=e[0].text+"")&&set_data(a,f),(!u||1&o&&s!==(s="item "+(e[0].completed&&"completed")+" svelte-tklxt8"))&&attr(t,"class",s)},i(n){u||(add_render_callback(()=>{l||(l=create_bidirectional_transition(t,slide,{delay:100*e[1]},!0)),l.run(1)}),u=!0)},o(n){l||(l=create_bidirectional_transition(t,slide,{delay:100*e[1]},!1)),l.run(0),u=!1},d(e){e&&detach(t),e&&l&&l.end(),run_all(d)}}}function instance(e,t,n){const o=createEventDispatcher();let{todo:r}=t,{index:a}=t;return e.$set=e=>{"todo"in e&&n(0,r=e.todo),"index"in e&&n(1,a=e.index)},[r,a,()=>{o("todoItemClick",{id:r.id})},()=>{o("todoItemDelete",{id:r.id})}]}class ToDoItem extends SvelteComponent{constructor(e){super(),init(this,e,instance,create_fragment,safe_not_equal,{todo:0,index:1})}}var Add$1='<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';const subscriber_queue=[];function writable(e,t=noop){let n;const o=[];function r(t){if(safe_not_equal(e,t)&&(e=t,n)){const t=!subscriber_queue.length;for(let t=0;t<o.length;t+=1){const n=o[t];n[1](),subscriber_queue.push(n,e)}if(t){for(let e=0;e<subscriber_queue.length;e+=2)subscriber_queue[e][0](subscriber_queue[e+1]);subscriber_queue.length=0}}}return{set:r,update:function(t){r(t(e))},subscribe:function(a,i=noop){const c=[a,i];return o.push(c),1===o.length&&(n=t(r)||noop),a(e),()=>{const e=o.indexOf(c);-1!==e&&o.splice(e,1),0===o.length&&(n(),n=null)}}}}var commonjsGlobal="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},assign=make_assign(),create=make_create(),trim=make_trim(),Global="undefined"!=typeof window?window:commonjsGlobal,util={assign:assign,create:create,trim:trim,bind:bind,slice:slice,each:each,map:map,pluck:pluck,isList:isList,isFunction:isFunction,isObject:isObject,Global:Global};function make_assign(){return Object.assign?Object.assign:function(e,t,n,o){for(var r=1;r<arguments.length;r++)each(Object(arguments[r]),(function(t,n){e[n]=t}));return e}}function make_create(){if(Object.create)return function(e,t,n,o){var r=slice(arguments,1);return assign.apply(this,[Object.create(e)].concat(r))};{function e(){}return function(t,n,o,r){var a=slice(arguments,1);return e.prototype=t,assign.apply(this,[new e].concat(a))}}}function make_trim(){return String.prototype.trim?function(e){return String.prototype.trim.call(e)}:function(e){return e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}}function bind(e,t){return function(){return t.apply(e,Array.prototype.slice.call(arguments,0))}}function slice(e,t){return Array.prototype.slice.call(e,t||0)}function each(e,t){pluck(e,(function(e,n){return t(e,n),!1}))}function map(e,t){var n=isList(e)?[]:{};return pluck(e,(function(e,o){return n[o]=t(e,o),!1})),n}function pluck(e,t){if(isList(e)){for(var n=0;n<e.length;n++)if(t(e[n],n))return e[n]}else for(var o in e)if(e.hasOwnProperty(o)&&t(e[o],o))return e[o]}function isList(e){return null!=e&&"function"!=typeof e&&"number"==typeof e.length}function isFunction(e){return e&&"[object Function]"==={}.toString.call(e)}function isObject(e){return e&&"[object Object]"==={}.toString.call(e)}var slice$1=util.slice,pluck$1=util.pluck,each$1=util.each,bind$1=util.bind,create$1=util.create,isList$1=util.isList,isFunction$1=util.isFunction,isObject$1=util.isObject,storeEngine={createStore:createStore},storeAPI={version:"2.0.12",enabled:!1,get:function(e,t){var n=this.storage.read(this._namespacePrefix+e);return this._deserialize(n,t)},set:function(e,t){return void 0===t?this.remove(e):(this.storage.write(this._namespacePrefix+e,this._serialize(t)),t)},remove:function(e){this.storage.remove(this._namespacePrefix+e)},each:function(e){var t=this;this.storage.each((function(n,o){e.call(t,t._deserialize(n),(o||"").replace(t._namespaceRegexp,""))}))},clearAll:function(){this.storage.clearAll()},hasNamespace:function(e){return this._namespacePrefix=="__storejs_"+e+"_"},createStore:function(){return createStore.apply(this,arguments)},addPlugin:function(e){this._addPlugin(e)},namespace:function(e){return createStore(this.storage,this.plugins,e)}};function _warn(){var e="undefined"==typeof console?null:console;if(e){var t=e.warn?e.warn:e.log;t.apply(e,arguments)}}function createStore(e,t,n){n||(n=""),e&&!isList$1(e)&&(e=[e]),t&&!isList$1(t)&&(t=[t]);var o=n?"__storejs_"+n+"_":"",r=n?new RegExp("^"+o):null;if(!/^[a-zA-Z0-9_\-]*$/.test(n))throw new Error("store.js namespaces can only have alphanumerics + underscores and dashes");var a=create$1({_namespacePrefix:o,_namespaceRegexp:r,_testStorage:function(e){try{var t="__storejs__test__";e.write(t,t);var n=e.read(t)===t;return e.remove(t),n}catch(e){return!1}},_assignPluginFnProp:function(e,t){var n=this[t];this[t]=function(){var t=slice$1(arguments,0),o=this;function r(){if(n)return each$1(arguments,(function(e,n){t[n]=e})),n.apply(o,t)}var a=[r].concat(t);return e.apply(o,a)}},_serialize:function(e){return JSON.stringify(e)},_deserialize:function(e,t){if(!e)return t;var n="";try{n=JSON.parse(e)}catch(t){n=e}return void 0!==n?n:t},_addStorage:function(e){this.enabled||this._testStorage(e)&&(this.storage=e,this.enabled=!0)},_addPlugin:function(e){var t=this;if(isList$1(e))each$1(e,(function(e){t._addPlugin(e)}));else if(!pluck$1(this.plugins,(function(t){return e===t}))){if(this.plugins.push(e),!isFunction$1(e))throw new Error("Plugins must be function values that return objects");var n=e.call(this);if(!isObject$1(n))throw new Error("Plugins must return an object of function properties");each$1(n,(function(n,o){if(!isFunction$1(n))throw new Error("Bad plugin property: "+o+" from plugin "+e.name+". Plugins should only return functions.");t._assignPluginFnProp(n,o)}))}},addStorage:function(e){_warn("store.addStorage(storage) is deprecated. Use createStore([storages])"),this._addStorage(e)}},storeAPI,{plugins:[]});return a.raw={},each$1(a,(function(e,t){isFunction$1(e)&&(a.raw[t]=bind$1(a,e))})),each$1(e,(function(e){a._addStorage(e)})),each$1(t,(function(e){a._addPlugin(e)})),a}var Global$1=util.Global,localStorage_1={name:"localStorage",read:read,write:write,each:each$2,remove:remove,clearAll:clearAll};function localStorage(){return Global$1.localStorage}function read(e){return localStorage().getItem(e)}function write(e,t){return localStorage().setItem(e,t)}function each$2(e){for(var t=localStorage().length-1;t>=0;t--){var n=localStorage().key(t);e(read(n),n)}}function remove(e){return localStorage().removeItem(e)}function clearAll(){return localStorage().clear()}var Global$2=util.Global,oldFFGlobalStorage={name:"oldFF-globalStorage",read:read$1,write:write$1,each:each$3,remove:remove$1,clearAll:clearAll$1},globalStorage=Global$2.globalStorage;function read$1(e){return globalStorage[e]}function write$1(e,t){globalStorage[e]=t}function each$3(e){for(var t=globalStorage.length-1;t>=0;t--){var n=globalStorage.key(t);e(globalStorage[n],n)}}function remove$1(e){return globalStorage.removeItem(e)}function clearAll$1(){each$3((function(e,t){delete globalStorage[e]}))}var Global$3=util.Global,oldIEUserDataStorage={name:"oldIE-userDataStorage",write:write$2,read:read$2,each:each$4,remove:remove$2,clearAll:clearAll$2},storageName="storejs",doc=Global$3.document,_withStorageEl=_makeIEStorageElFunction(),disable=(Global$3.navigator?Global$3.navigator.userAgent:"").match(/ (MSIE 8|MSIE 9|MSIE 10)\./);function write$2(e,t){if(!disable){var n=fixKey(e);_withStorageEl((function(e){e.setAttribute(n,t),e.save(storageName)}))}}function read$2(e){if(!disable){var t=fixKey(e),n=null;return _withStorageEl((function(e){n=e.getAttribute(t)})),n}}function each$4(e){_withStorageEl((function(t){for(var n=t.XMLDocument.documentElement.attributes,o=n.length-1;o>=0;o--){var r=n[o];e(t.getAttribute(r.name),r.name)}}))}function remove$2(e){var t=fixKey(e);_withStorageEl((function(e){e.removeAttribute(t),e.save(storageName)}))}function clearAll$2(){_withStorageEl((function(e){var t=e.XMLDocument.documentElement.attributes;e.load(storageName);for(var n=t.length-1;n>=0;n--)e.removeAttribute(t[n].name);e.save(storageName)}))}var forbiddenCharsRegex=new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]","g");function fixKey(e){return e.replace(/^\d/,"___$&").replace(forbiddenCharsRegex,"___")}function _makeIEStorageElFunction(){if(!doc||!doc.documentElement||!doc.documentElement.addBehavior)return null;var e,t,n;try{(t=new ActiveXObject("htmlfile")).open(),t.write('<script>document.w=window<\/script><iframe src="/favicon.ico"></iframe>'),t.close(),e=t.w.frames[0].document,n=e.createElement("div")}catch(t){n=doc.createElement("div"),e=doc.body}return function(t){var o=[].slice.call(arguments,0);o.unshift(n),e.appendChild(n),n.addBehavior("#default#userData"),n.load(storageName),t.apply(this,o),e.removeChild(n)}}var Global$4=util.Global,trim$1=util.trim,cookieStorage={name:"cookieStorage",read:read$3,write:write$3,each:each$5,remove:remove$3,clearAll:clearAll$3},doc$1=Global$4.document;function read$3(e){if(!e||!_has(e))return null;var t="(?:^|.*;\\s*)"+escape(e).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*";return unescape(doc$1.cookie.replace(new RegExp(t),"$1"))}function each$5(e){for(var t=doc$1.cookie.split(/; ?/g),n=t.length-1;n>=0;n--)if(trim$1(t[n])){var o=t[n].split("="),r=unescape(o[0]);e(unescape(o[1]),r)}}function write$3(e,t){e&&(doc$1.cookie=escape(e)+"="+escape(t)+"; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/")}function remove$3(e){e&&_has(e)&&(doc$1.cookie=escape(e)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/")}function clearAll$3(){each$5((function(e,t){remove$3(t)}))}function _has(e){return new RegExp("(?:^|;\\s*)"+escape(e).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=").test(doc$1.cookie)}var Global$5=util.Global,sessionStorage_1={name:"sessionStorage",read:read$4,write:write$4,each:each$6,remove:remove$4,clearAll:clearAll$4};function sessionStorage(){return Global$5.sessionStorage}function read$4(e){return sessionStorage().getItem(e)}function write$4(e,t){return sessionStorage().setItem(e,t)}function each$6(e){for(var t=sessionStorage().length-1;t>=0;t--){var n=sessionStorage().key(t);e(read$4(n),n)}}function remove$4(e){return sessionStorage().removeItem(e)}function clearAll$4(){return sessionStorage().clear()}var memoryStorage_1={name:"memoryStorage",read:read$5,write:write$5,each:each$7,remove:remove$5,clearAll:clearAll$5},memoryStorage={};function read$5(e){return memoryStorage[e]}function write$5(e,t){memoryStorage[e]=t}function each$7(e){for(var t in memoryStorage)memoryStorage.hasOwnProperty(t)&&e(memoryStorage[t],t)}function remove$5(e){delete memoryStorage[e]}function clearAll$5(e){memoryStorage={}}var all=[localStorage_1,oldFFGlobalStorage,oldIEUserDataStorage,cookieStorage,sessionStorage_1,memoryStorage_1];"object"!=typeof JSON&&(JSON={}),function(){var rx_one=/^[\],:{}\s]*$/,rx_two=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,rx_three=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,rx_four=/(?:^|:|,)(?:\s*\[)+/g,rx_escapable=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,rx_dangerous=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta,rep;function f(e){return e<10?"0"+e:e}function this_value(){return this.valueOf()}function quote(e){return rx_escapable.lastIndex=0,rx_escapable.test(e)?'"'+e.replace(rx_escapable,(function(e){var t=meta[e];return"string"==typeof t?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)}))+'"':'"'+e+'"'}function str(e,t){var n,o,r,a,i,c=gap,s=t[e];switch(s&&"object"==typeof s&&"function"==typeof s.toJSON&&(s=s.toJSON(e)),"function"==typeof rep&&(s=rep.call(t,e,s)),typeof s){case"string":return quote(s);case"number":return isFinite(s)?String(s):"null";case"boolean":case"null":return String(s);case"object":if(!s)return"null";if(gap+=indent,i=[],"[object Array]"===Object.prototype.toString.apply(s)){for(a=s.length,n=0;n<a;n+=1)i[n]=str(n,s)||"null";return r=0===i.length?"[]":gap?"[\n"+gap+i.join(",\n"+gap)+"\n"+c+"]":"["+i.join(",")+"]",gap=c,r}if(rep&&"object"==typeof rep)for(a=rep.length,n=0;n<a;n+=1)"string"==typeof rep[n]&&(r=str(o=rep[n],s))&&i.push(quote(o)+(gap?": ":":")+r);else for(o in s)Object.prototype.hasOwnProperty.call(s,o)&&(r=str(o,s))&&i.push(quote(o)+(gap?": ":":")+r);return r=0===i.length?"{}":gap?"{\n"+gap+i.join(",\n"+gap)+"\n"+c+"}":"{"+i.join(",")+"}",gap=c,r}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},Boolean.prototype.toJSON=this_value,Number.prototype.toJSON=this_value,String.prototype.toJSON=this_value),"function"!=typeof JSON.stringify&&(meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(e,t,n){var o;if(gap="",indent="","number"==typeof n)for(o=0;o<n;o+=1)indent+=" ";else"string"==typeof n&&(indent=n);if(rep=t,t&&"function"!=typeof t&&("object"!=typeof t||"number"!=typeof t.length))throw new Error("JSON.stringify");return str("",{"":e})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){var j;function walk(e,t){var n,o,r=e[t];if(r&&"object"==typeof r)for(n in r)Object.prototype.hasOwnProperty.call(r,n)&&(void 0!==(o=walk(r,n))?r[n]=o:delete r[n]);return reviver.call(e,t,r)}if(text=String(text),rx_dangerous.lastIndex=0,rx_dangerous.test(text)&&(text=text.replace(rx_dangerous,(function(e){return"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)}))),rx_one.test(text.replace(rx_two,"@").replace(rx_three,"]").replace(rx_four,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();var json2=json2Plugin;function json2Plugin(){return{}}var plugins=[json2],store_legacy=storeEngine.createStore(all,plugins);const TABS={ACTIVE:"active",ALL:"all",DONE:"done"},initialUIState={activeTab:store_legacy.get("activeTab")||TABS.ALL,inputBoxShown:!1},createUIStore=()=>{const{subscribe:e,update:t}=writable(initialUIState);return{subscribe:e,setActiveTab:e=>t(t=>(store_legacy.set("activeTab",e),{...t,activeTab:e})),setInputBoxShown:e=>t(t=>({...t,inputBoxShown:e}))}},ui=createUIStore();function create_else_block(e){let t,n,o,r,a,i,c,s,l,u,d,p,f,_=e[1].header+"",m=e[1].message+"",g=e[1].icon+"";return{c(){t=element("div"),n=element("div"),o=element("h3"),r=text(_),a=space(),i=element("div"),c=text(m),s=space(),l=element("div"),u=element("div"),attr(n,"class","text svelte-1jq9r3y"),attr(u,"class","svg svelte-1jq9r3y"),attr(l,"class","icon svelte-1jq9r3y"),attr(t,"class","empty svelte-1jq9r3y")},m(e,d){insert(e,t,d),append(t,n),append(n,o),append(o,r),append(n,a),append(n,i),append(i,c),append(t,s),append(t,l),append(l,u),u.innerHTML=g,f=!0},p(e,t){(!f||2&t)&&_!==(_=e[1].header+"")&&set_data(r,_),(!f||2&t)&&m!==(m=e[1].message+"")&&set_data(c,m),(!f||2&t)&&g!==(g=e[1].icon+"")&&(u.innerHTML=g)},i(e){f||(add_render_callback(()=>{p&&p.end(1),d||(d=create_in_transition(t,fly,{delay:400,x:100})),d.start()}),f=!0)},o(e){d&&d.invalidate(),p=create_out_transition(t,fly,{x:-100}),f=!1},d(e){e&&detach(t),e&&p&&p.end()}}}function create_if_block_1(e){let t,n,o,r,a,i,c,s,l,u,d,p,f,_=e[1].header+"",m=e[1].message+"",g=e[1].icon+"";return{c(){t=element("div"),n=element("div"),o=element("h3"),r=text(_),a=space(),i=element("div"),c=text(m),s=space(),l=element("div"),u=element("div"),attr(n,"class","text svelte-1jq9r3y"),attr(u,"class","svg svelte-1jq9r3y"),attr(l,"class","icon svelte-1jq9r3y"),attr(t,"class","empty svelte-1jq9r3y")},m(e,d){insert(e,t,d),append(t,n),append(n,o),append(o,r),append(n,a),append(n,i),append(i,c),append(t,s),append(t,l),append(l,u),u.innerHTML=g,f=!0},p(e,t){(!f||2&t)&&_!==(_=e[1].header+"")&&set_data(r,_),(!f||2&t)&&m!==(m=e[1].message+"")&&set_data(c,m),(!f||2&t)&&g!==(g=e[1].icon+"")&&(u.innerHTML=g)},i(e){f||(add_render_callback(()=>{p&&p.end(1),d||(d=create_in_transition(t,fly,{delay:400,x:100})),d.start()}),f=!0)},o(e){d&&d.invalidate(),p=create_out_transition(t,fly,{x:-100}),f=!1},d(e){e&&detach(t),e&&p&&p.end()}}}function create_if_block(e){let t,n,o,r,a,i,c,s,l,u,d,p,f,_=e[1].header+"",m=e[1].message+"",g=e[1].icon+"";return{c(){t=element("div"),n=element("div"),o=element("h3"),r=text(_),a=space(),i=element("div"),c=text(m),s=space(),l=element("div"),u=element("div"),attr(n,"class","text svelte-1jq9r3y"),attr(u,"class","svg svelte-1jq9r3y"),attr(l,"class","icon svelte-1jq9r3y"),attr(t,"class","empty svelte-1jq9r3y")},m(e,d){insert(e,t,d),append(t,n),append(n,o),append(o,r),append(n,a),append(n,i),append(i,c),append(t,s),append(t,l),append(l,u),u.innerHTML=g,f=!0},p(e,t){(!f||2&t)&&_!==(_=e[1].header+"")&&set_data(r,_),(!f||2&t)&&m!==(m=e[1].message+"")&&set_data(c,m),(!f||2&t)&&g!==(g=e[1].icon+"")&&(u.innerHTML=g)},i(e){f||(add_render_callback(()=>{p&&p.end(1),d||(d=create_in_transition(t,fly,{delay:400,x:100})),d.start()}),f=!0)},o(e){d&&d.invalidate(),p=create_out_transition(t,fly,{x:-100}),f=!1},d(e){e&&detach(t),e&&p&&p.end()}}}function create_fragment$1(e){let t,n,o,r;const a=[create_if_block,create_if_block_1,create_else_block],i=[];function c(e,t){return e[0]===TABS.ALL?0:e[0]===TABS.ACTIVE?1:2}return t=c(e),n=i[t]=a[t](e),{c(){n.c(),o=empty()},m(e,n){i[t].m(e,n),insert(e,o,n),r=!0},p(e,[r]){let s=t;t=c(e),t===s?i[t].p(e,r):(group_outros(),transition_out(i[s],1,1,()=>{i[s]=null}),check_outros(),n=i[t],n||(n=i[t]=a[t](e),n.c()),transition_in(n,1),n.m(o.parentNode,o))},i(e){r||(transition_in(n),r=!0)},o(e){transition_out(n),r=!1},d(e){i[t].d(e),e&&detach(o)}}}function instance$1(e,t,n){let o,{activeTab:r}=t;return e.$set=e=>{"activeTab"in e&&n(0,r=e.activeTab)},e.$$.update=()=>{1&e.$$.dirty&&n(1,o={[TABS.ALL]:{header:"Hallo !",message:"Add away your todo by clicking the + button",icon:Add$1},[TABS.ACTIVE]:{header:"!",message:"You dont have any active todos!",icon:Inactive},[TABS.DONE]:{header:"!",message:"You dont have any completed todos!",icon:Add}}[r])},[r,o]}class Empty extends SvelteComponent{constructor(e){super(),init(this,e,instance$1,create_fragment$1,safe_not_equal,{activeTab:0})}}const initialTodos=store_legacy.get("todos"),persistTodos=e=>store_legacy.set("todos",e);function createTodos(){const{subscribe:e,update:t}=writable(initialTodos||[]);return{subscribe:e,toggle:e=>t(t=>{const n=t.map(t=>(t.id===e&&(t.completed=!t.completed),t));return persistTodos(n),n}),delete:e=>t(t=>{const n=t.filter(t=>t.id!==e);return persistTodos(n),n}),addTodo:e=>t(t=>{const n=[{id:t.length,text:e,completed:!1},...t];return persistTodos(n),n})}}const todos=createTodos();function get_each_context(e,t,n){const o=e.slice();return o[6]=t[n],o[8]=n,o}function create_else_block$1(e){let t;const n=new Empty({props:{activeTab:e[1].activeTab}});return{c(){create_component(n.$$.fragment)},m(e,o){mount_component(n,e,o),t=!0},p(e,t){const o={};2&t&&(o.activeTab=e[1].activeTab),n.$set(o)},i(e){t||(transition_in(n.$$.fragment,e),t=!0)},o(e){transition_out(n.$$.fragment,e),t=!1},d(e){destroy_component(n,e)}}}function create_each_block(e){let t;const n=new ToDoItem({props:{todo:e[6],index:e[8]}});return n.$on("todoItemClick",e[2]),n.$on("todoItemDelete",e[3]),{c(){create_component(n.$$.fragment)},m(e,o){mount_component(n,e,o),t=!0},p(e,t){const o={};1&t&&(o.todo=e[6]),n.$set(o)},i(e){t||(transition_in(n.$$.fragment,e),t=!0)},o(e){transition_out(n.$$.fragment,e),t=!1},d(e){destroy_component(n,e)}}}function create_fragment$2(e){let t,n,o=e[0],r=[];for(let t=0;t<o.length;t+=1)r[t]=create_each_block(get_each_context(e,o,t));const a=e=>transition_out(r[e],1,1,()=>{r[e]=null});let i=null;return o.length||(i=create_else_block$1(e)),{c(){t=element("div");for(let e=0;e<r.length;e+=1)r[e].c();i&&i.c(),attr(t,"class","content svelte-1wl5lhu")},m(e,o){insert(e,t,o);for(let e=0;e<r.length;e+=1)r[e].m(t,null);i&&i.m(t,null),n=!0},p(e,[n]){if(15&n){let c;for(o=e[0],c=0;c<o.length;c+=1){const a=get_each_context(e,o,c);r[c]?(r[c].p(a,n),transition_in(r[c],1)):(r[c]=create_each_block(a),r[c].c(),transition_in(r[c],1),r[c].m(t,null))}for(group_outros(),c=o.length;c<r.length;c+=1)a(c);check_outros(),!o.length&&i?i.p(e,n):o.length?i&&(i.d(1),i=null):(i=create_else_block$1(e),i.c(),i.m(t,null))}},i(e){if(!n){for(let e=0;e<o.length;e+=1)transition_in(r[e]);n=!0}},o(e){r=r.filter(Boolean);for(let e=0;e<r.length;e+=1)transition_out(r[e]);n=!1},d(e){e&&detach(t),destroy_each(r,e),i&&i.d()}}}function instance$2(e,t,n){let o,r,a;component_subscribe(e,ui,e=>n(1,o=e)),component_subscribe(e,todos,e=>n(4,r=e));const i=(e,t)=>({[TABS.ALL]:e,[TABS.ACTIVE]:e.filter(e=>!1===e.completed),[TABS.DONE]:e.filter(e=>!0===e.completed)}[t]);todos.subscribe(e=>{n(0,a=i(e,o.activeTab))}),ui.subscribe(e=>{n(0,a=i(r,e.activeTab))});return[a,o,({detail:{id:e}})=>{todos.toggle(e)},({detail:{id:e}})=>{todos.delete(e)}]}class ToDos extends SvelteComponent{constructor(e){super(),init(this,e,instance$2,create_fragment$2,safe_not_equal,{})}}function escapeHandler(e){const t=()=>{e(!1)},n=t=>{27===t.keyCode&&e(!1)};window.addEventListener("popstate",t),document.addEventListener("keydown",n,!1),window.history.pushState({drawer:Math.random()},"Drawer"),onDestroy(()=>{window.removeEventListener("popstate",t),document.removeEventListener("keydown",n,!1)})}function create_fragment$3(e){let t,n,o,r,a,i,c,s;return{c(){t=element("div"),n=element("input"),o=space(),r=element("div"),a=element("div"),attr(n,"type","text"),attr(n,"placeholder","type what you want to do!"),attr(n,"class","svelte-gth9e6"),attr(a,"class","svg svelte-gth9e6"),attr(r,"class","add svelte-gth9e6"),attr(t,"class","layout svelte-gth9e6")},m(i,l,u){insert(i,t,l),append(t,n),e[6](n),set_input_value(n,e[0]),append(t,o),append(t,r),append(r,a),a.innerHTML=Add,c=!0,u&&run_all(s),s=[listen(window,"keydown",e[2]),listen(n,"click",stop_propagation(e[5])),listen(n,"input",e[7]),listen(r,"click",stop_propagation(e[3])),listen(t,"click",e[8])]},p(e,[t]){1&t&&n.value!==e[0]&&set_input_value(n,e[0])},i(e){c||(add_render_callback(()=>{i||(i=create_bidirectional_transition(t,fade,{},!0)),i.run(1)}),c=!0)},o(e){i||(i=create_bidirectional_transition(t,fade,{},!1)),i.run(0),c=!1},d(n){n&&detach(t),e[6](null),n&&i&&i.end(),run_all(s)}}}function instance$3(e,t,n){const o=createEventDispatcher();let r,a="";onMount(()=>{r.focus(),escapeHandler(ui.setInputBoxShown)});const i=()=>{a.trim()&&(ui.setInputBoxShown(!1),ui.setActiveTab(TABS.ALL),o("addToDo",{text:a}))};return[a,r,function(e){13===e.keyCode&&i()},i,o,function(t){bubble(e,t)},function(e){binding_callbacks[e?"unshift":"push"](()=>{n(1,r=e)})},function(){a=this.value,n(0,a)},()=>ui.setInputBoxShown(!1)]}class Input extends SvelteComponent{constructor(e){super(),init(this,e,instance$3,create_fragment$3,safe_not_equal,{})}}function get_each_context$1(e,t,n){const o=e.slice();return o[5]=t[n],o}function create_each_block$1(e){let t,n,o,r,a,i=TABS[e[5]]+"";return{c(){t=element("div"),n=text(i),o=space(),attr(t,"class",r="block "+(e[0].activeTab===TABS[e[5]]&&"active")+" svelte-slct13")},m(r,i,c){insert(r,t,i),append(t,n),append(t,o),c&&a(),a=listen(t,"click",e[3](TABS[e[5]]))},p(n,o){e=n,1&o&&r!==(r="block "+(e[0].activeTab===TABS[e[5]]&&"active")+" svelte-slct13")&&attr(t,"class",r)},d(e){e&&detach(t),a()}}}function create_if_block$1(e){let t;const n=new Input({});return n.$on("addToDo",e[2]),{c(){create_component(n.$$.fragment)},m(e,o){mount_component(n,e,o),t=!0},p:noop,i(e){t||(transition_in(n.$$.fragment,e),t=!0)},o(e){transition_out(n.$$.fragment,e),t=!1},d(e){destroy_component(n,e)}}}function create_fragment$4(e){let t,n,o,r,a,i,c,s,l,u=Object.keys(TABS),d=[];for(let t=0;t<u.length;t+=1)d[t]=create_each_block$1(get_each_context$1(e,u,t));let p=e[0].inputBoxShown&&create_if_block$1(e);return{c(){t=element("div"),n=element("div");for(let e=0;e<d.length;e+=1)d[e].c();o=space(),r=element("div"),a=element("div"),i=space(),p&&p.c(),c=empty(),attr(n,"class","groups svelte-slct13"),attr(t,"class","footer svelte-slct13"),attr(a,"class","svg svelte-slct13"),attr(r,"class","add svelte-slct13")},m(u,f,_){insert(u,t,f),append(t,n);for(let e=0;e<d.length;e+=1)d[e].m(n,null);insert(u,o,f),insert(u,r,f),append(r,a),a.innerHTML=Add$1,insert(u,i,f),p&&p.m(u,f),insert(u,c,f),s=!0,_&&l(),l=listen(r,"click",e[1])},p(e,[t]){if(9&t){let o;for(u=Object.keys(TABS),o=0;o<u.length;o+=1){const r=get_each_context$1(e,u,o);d[o]?d[o].p(r,t):(d[o]=create_each_block$1(r),d[o].c(),d[o].m(n,null))}for(;o<d.length;o+=1)d[o].d(1);d.length=u.length}e[0].inputBoxShown?p?(p.p(e,t),transition_in(p,1)):(p=create_if_block$1(e),p.c(),transition_in(p,1),p.m(c.parentNode,c)):p&&(group_outros(),transition_out(p,1,1,()=>{p=null}),check_outros())},i(e){s||(transition_in(p),s=!0)},o(e){transition_out(p),s=!1},d(e){e&&detach(t),destroy_each(d,e),e&&detach(o),e&&detach(r),e&&detach(i),p&&p.d(e),e&&detach(c),l()}}}function instance$4(e,t,n){let o;component_subscribe(e,ui,e=>n(0,o=e));return[o,()=>{ui.setInputBoxShown(!0)},({detail:e})=>{todos.addTodo(e.text)},e=>()=>{ui.setActiveTab(e)}]}class Footer extends SvelteComponent{constructor(e){super(),init(this,e,instance$4,create_fragment$4,safe_not_equal,{})}}function create_fragment$5(e){let t,n,o,r,a,i;const c=new ToDos({}),s=new Footer({});return{c(){t=element("div"),n=element("div"),o=text(e[0]),r=space(),create_component(c.$$.fragment),a=space(),create_component(s.$$.fragment),attr(n,"class","header svelte-hgkjq"),attr(t,"class","main svelte-hgkjq")},m(e,l){insert(e,t,l),append(t,n),append(n,o),append(t,r),mount_component(c,t,null),append(t,a),mount_component(s,t,null),i=!0},p(e,[t]){(!i||1&t)&&set_data(o,e[0])},i(e){i||(transition_in(c.$$.fragment,e),transition_in(s.$$.fragment,e),i=!0)},o(e){transition_out(c.$$.fragment,e),transition_out(s.$$.fragment,e),i=!1},d(e){e&&detach(t),destroy_component(c),destroy_component(s)}}}function instance$5(e,t,n){let{name:o}=t;return e.$set=e=>{"name"in e&&n(0,o=e.name)},[o]}class App extends SvelteComponent{constructor(e){super(),init(this,e,instance$5,create_fragment$5,safe_not_equal,{name:0})}}const app=new App({target:document.body,props:{name:"🦠 tu-tu-do 🦠"}});return app}();
//# sourceMappingURL=bundle.js.map
