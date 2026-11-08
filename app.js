/**
 * BODEGA UNIFICADA V2 — INTERFAZ PARA GITHUB PAGES
 * ================================================================
 * Publicar index.html + styles.css + app.js + vendor/zxing.min.js.
 * SOLO configura la URL de Apps Script. No pongas aquí contraseñas.
 *
 * Transmisión sin CORS:
 *  - POST text/plain con ID aleatorio para TODAS las operaciones.
 *  - Lectura del resultado con JSONP por el ID aleatorio, en trozos.
 *  - Jamás usar GET para modificar datos y jamás enviar claves en URL.
 */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwnfFSkwrVKrwC_dNUnH5skntRGWnil4gYPXgGD8_si9-0x6-7BfW-PfaM56DTzXYk4dg/exec';
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
const escapeHtml = value => String(value===null||value===undefined?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeText = text => String(text||'').trim();
const branchLabel = branch => branch==='S1'?'Sucursal 1':'Casa Matriz';
const dateText = v => {try{return new Date(v).toLocaleString('es-SV',{dateStyle:'short',timeStyle:'short'});}catch(e){return String(v||'');}};

/* Iconos lineales SVG (sin emoji, mismo estilo en Android, iOS y PC). */
const ICONS = {
  box:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  scan:'<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 8v8m4-8v8m4-8v8M7 11h10"/>',
  camera:'<path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="14" r="4"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 13.5 6.6 4M15.3 6.5 8.7 10.5"/>',
  refresh:'<path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7"/>',
  close:'<path d="m18 6-12 12M6 6l12 12"/>',
  logout:'<path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
  settings:'<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a2 2 0 0 1 .4 2.2l-1.1 1.9a2 2 0 0 1-2.1.9l-1.6-.5a7 7 0 0 1-2 1.2l-.4 1.6H10l-.4-1.6a7 7 0 0 1-2-1.2l-1.6.5a2 2 0 0 1-2.1-.9l-1.1-1.9a2 2 0 0 1 .4-2.2l1.2-1.2a7 7 0 0 1 0-2.3L3.2 10a2 2 0 0 1-.4-2.2l1.1-1.9A2 2 0 0 1 6 5l1.6.5a7 7 0 0 1 2-1.2L10 2.7h2.2l.4 1.6a7 7 0 0 1 2 1.2L16.2 5a2 2 0 0 1 2.1.9l1.1 1.9a2 2 0 0 1-.4 2.2l-1.2 1.2a7 7 0 0 1 0 2.3Z"/>',
  warehouse:'<path d="m3 9 9-6 9 6v11H3Z"/><path d="M9 20v-8h6v8M3 9h18"/>',
  list:'<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  pin:'<path d="m16 3 5 5-4 1-3 3 1 4-1 1-7-7 1-1 4 1 3-3Z"/><path d="m8 16-5 5"/>',
  upload:'<path d="M12 16V3m-5 5 5-5 5 5"/><path d="M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  edit:'<path d="m16 4 4 4-12 12-5 1 1-5Z"/><path d="m14 6 4 4"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  plus:'<path d="M12 4v16M4 12h16"/>',
  copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  download:'<path d="M12 3v13m-5-5 5 5 5-5M4 17v3h16v-3"/>',
  lock:'<rect x="4" y="11" width="16" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
};
function ico(name,extra=''){return `<svg class="ico ${extra}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]||ICONS.box}</svg>`;}
function setIcon(selector,name){const el=$(selector);if(el)el.innerHTML=ico(name);}

/* Variables compartidas y datos de la sucursal ACTIVA; nunca se mezclan. */
const state = {
  branch:'S1',token:'',auth:null,productos:[],ubicaciones:[],fotos:[],inventario:[],pedidos:[],historial:[],
  photoByCode:new Map(),locationByCode:new Map(),photoCache:new Map(),tab:'catalog',category:'',filter:'all',search:'',pageSize:42,shown:42,
  activeLoc:null,locationSub:'scan',cameraMode:null,readCount:0
};
let toastTimer=null, imageObserver=null, photoQueue=[],photoActive=0;
const photoPending=new Map();
function toast(message,error=false){
  const el=$('#toast');el.textContent=message;el.classList.toggle('error',error);el.classList.add('visible');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),4100);
}
function fail(e){toast(String(e.message||e),true);console.error(e);}
function requestId(){const bytes=new Uint8Array(24);crypto.getRandomValues(bytes);return Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');}

/** Lectura JSONP de META o PARTE; solo lee una respuesta previa. */
function jsonp(action,id,n){
  return new Promise((resolve,reject)=>{
    const name='bgcb_'+requestId().slice(0,20);
    const node=document.createElement('script');let settled=false;
    const end=(err,value)=>{if(settled)return;settled=true;clearTimeout(timer);node.remove();delete window[name];err?reject(err):resolve(value);};
    window[name]=data=>end(null,data);
    node.onerror=()=>end(new Error('No se pudo consultar Apps Script desde GitHub. Comprueba la implementación y la conexión.'));
    const params=new URLSearchParams({action:action,id:id,callback:name});if(n!==undefined)params.set('n',String(n));
    node.src=GAS_URL+'?'+params.toString()+'&_='+Date.now();
    const timer=setTimeout(()=>end(new Error('El servidor tardó demasiado al responder.')),28000);
    document.head.appendChild(node);
  });
}
/**
 * Comunicación GitHub → Apps Script.
 * 1) Envía datos sensibles SOLO en el cuerpo del POST.
 * 2) El navegador no lee su respuesta (Apps Script no expone CORS).
 * 3) Recupera la confirmación mediante un nonce secreto de alta entropía.
 * 4) Descomprime catálogos grandes cuando el navegador soporta gzip.
 */
async function rpc(action,payload={}){
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(GAS_URL))
    throw Error('Falta colocar tu NUEVA URL /exec en la primera línea de app.js. Consulta INSTALACION.md.');
  const id=requestId();
  const gzip='DecompressionStream' in window;
  const body=JSON.stringify({action,requestId:id,token:state.token||'',gzip,...payload});
  try {await fetch(GAS_URL,{method:'POST',mode:'no-cors',credentials:'omit',cache:'no-store',headers:{'Content-Type':'text/plain;charset=UTF-8'},body});}
  catch(e){throw Error('No se pudo enviar la solicitud. Revisa internet o la URL de Apps Script.');}
  let meta=null;
  for(let i=0;i<55;i++){
    const r=await jsonp('meta',id);
    if(r&&r.ready){meta=r;break;}
    await delay(330);
  }
  if(!meta)throw Error('Sin confirmación del servidor. Comprueba la publicación, los permisos o el registro de ejecuciones.');
  if(meta.parts<1||meta.parts>299)throw Error('Respuesta de servidor inválida.');
  const chunks=new Array(meta.parts);
  for(let start=0;start<meta.parts;start+=5){
    const nums=Array.from({length:Math.min(5,meta.parts-start)},(_,i)=>start+i);
    await Promise.all(nums.map(async n=>{
      let part=await jsonp('part',id,n);
      if(part&&part.missing){await delay(350);part=await jsonp('part',id,n);}
      if(!part||typeof part.text!=='string')throw Error('Respuesta incompleta; actualiza e intenta de nuevo.');
      chunks[n]=part.text;
    }));
  }
  let raw=chunks.join('');
  if(meta.gzip){
    const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));
    raw=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  }
  const out=JSON.parse(raw);
  if(!out.ok)throw Error(out.error||'Operación rechazada por el servidor');
  return out;
}

/* Inicializa iconos e interacciones. */
function init(){
  [['#brandLogin','box'],['#branchIcon1','warehouse'],['#branchIcon2','warehouse'],['#loginArrow','arrow'],['#searchIcon','search'],['#catalogScan','scan'],['#refreshIcon','refresh'],['#adminBtn','settings'],['#logoutBtn','logout'],['#lightWarehouseIcon','warehouse'],['#subIconScan','scan'],['#subIconList','list'],['#subIconSearch','search'],['#subIconRecent','clock'],['#subIconOrder','file'],['#pinLocation','pin'],['#cameraScanIcon','scan'],['#uploadCodeIcon','camera'],['#closeCamera','close']].forEach(([el,icon])=>setIcon(el,icon));
  $$('.branch-choice').forEach(b=>b.addEventListener('click',()=>{state.branch=b.dataset.branch;$$('.branch-choice').forEach(x=>x.classList.toggle('active',x===b));}));
  $('#loginForm').addEventListener('submit',onLogin);
  $('#logoutBtn').addEventListener('click',logout);
  $('#adminBtn').addEventListener('click',showAdmin);
  $$('.nav-button').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
  $('#catalogSearch').addEventListener('input',e=>{state.search=e.target.value;state.shown=42;renderCatalog();});
  $('#categoryFilter').addEventListener('change',e=>{state.category=e.target.value;state.shown=42;renderCatalog();});
  $$('.filter-btn').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.filter;state.shown=42;$$('.filter-btn').forEach(x=>x.classList.toggle('selected',x===b));renderCatalog();}));
  $('#loadMore').addEventListener('click',()=>{state.shown+=42;renderCatalog();});
  $('#catalogRefresh').addEventListener('click',()=>refreshData(true).catch(fail));
  $('#editorMode').addEventListener('click',async()=>{if(await ensurePermission('delete')){$('#editorMode').textContent='Editor autorizado';toast('Puedes recortar y retirar fotografías');}});
  $('#locationRefresh').addEventListener('click',()=>refreshData(true).catch(fail));
  $('#refreshHistory').addEventListener('click',()=>refreshData(true).catch(fail));
  $('#catalogScan').addEventListener('click',()=>openCamera('catalog'));
  $('#productGrid').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){const card=event.target.closest('[data-product]');if(card){event.preventDefault();openProduct(card.dataset.product);}}});
  $('#productGrid').addEventListener('click',event=>{const share=event.target.closest('[data-share-code]');if(share){event.stopPropagation();shareProductCode(share.dataset.shareCode);return;}const card=event.target.closest('[data-product]');if(card)openProduct(card.dataset.product);});
  $$('.light-sub').forEach(b=>b.addEventListener('click',()=>setLocationSub(b.dataset.sub)));
  $('#useBox').addEventListener('change',e=>{$('#locBox').disabled=!e.target.checked;if(!e.target.checked)$('#locBox').value='';unfixLocation();});
  ['#locShelf','#locBay','#locBox','#locTemp'].forEach(s=>$(s).addEventListener('input',unfixLocation));
  $('#fixLocation').addEventListener('click',fixLocation);
  $('#pinLocation').addEventListener('click',fixLocation);
  $('#locationCamera').addEventListener('click',()=>openCamera('record'));
  $('#locationScanUpload').addEventListener('click',()=>{state.cameraMode='record';$('#scanFileInput').click();});
  $('#scanImageButton').addEventListener('click',()=>$('#scanFileInput').click());
  $('#scanFileInput').addEventListener('change',async e=>{const file=e.target.files[0];e.target.value='';if(file)try{await readCodeImage(file);}catch(x){fail(x);}});
  $('#locationManual').addEventListener('input',e=>updateLocationSuggestions(e.target.value));
  $('#wedgeInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const code=e.target.value.trim();e.target.value='';if(code)recordCode(code);}});
  $('#photoFileInput').addEventListener('change',async e=>{const file=e.target.files[0];e.target.value='';if(file)try{await startPhotoFile(file);}catch(x){fail(x);}});
  $('#cameraDialog').addEventListener('close',async()=>{stopCamera();if(state.readCount)await updateBranchData().catch(fail);state.readCount=0;});
  $('#closeCamera').addEventListener('click',()=>$('#cameraDialog').close());
  $('#flipCamera').addEventListener('click',flipCamera);
  $('#torchCamera').addEventListener('click',toggleTorch);
  $('#cameraZoom').addEventListener('input',updateZoom);
  $('#capturePhoto').addEventListener('click',capturePhoto);
  $('#exportInventory').addEventListener('click',exportInventory);
  $('#newOrder').addEventListener('click',()=>orderEditor());
  const saved=sessionStorage.getItem('bodega_v2_token'),branch=sessionStorage.getItem('bodega_v2_branch');
  if(saved&&['S1','CM'].includes(branch)){state.token=saved;state.branch=branch;showLoggedIn().catch(()=>{state.token='';sessionStorage.removeItem('bodega_v2_token');$('#app').hidden=true;$('#loginScreen').hidden=false;});}
  const hashCode=new URLSearchParams(location.search).get('codigo');if(hashCode)state.search=hashCode;
}
async function onLogin(e){
  e.preventDefault();const pwd=$('#loginPass').value;
  $('#loginSubmit').disabled=true;$('#loginError').hidden=true;
  try{
    const response=await rpc('login',{branch:state.branch,password:pwd});
    state.token=response.token;state.auth=response.auth;
    sessionStorage.setItem('bodega_v2_token',state.token);sessionStorage.setItem('bodega_v2_branch',state.branch);
    $('#loginPass').value='';await showLoggedIn();
  }catch(err){$('#loginError').textContent=err.message;$('#loginError').hidden=false;}
  finally{$('#loginSubmit').disabled=false;}
}
async function showLoggedIn(){
  $('#app').hidden=false;$('#loginScreen').hidden=true;$('#branchPill').textContent=branchLabel(state.branch);$('#lightBranch').textContent=branchLabel(state.branch).toUpperCase();
  $('#catalogCount').textContent='Sincronizando catálogo...';
  await refreshData(false);
  const existing=state.search;if(existing){$('#catalogSearch').value=existing;renderCatalog();}
  setTab('catalog');
}
async function logout(){
  try{await rpc('logout');}catch(e){}
  sessionStorage.removeItem('bodega_v2_token');sessionStorage.removeItem('bodega_v2_branch');
  state.token='';state.auth=null;state.photoCache.clear();state.productos=[];state.fotos=[];state.ubicaciones=[];state.activeLoc=null;
  $('#loginScreen').hidden=false;$('#app').hidden=true;setTab('catalog');
}
function reindexBranch(){
  state.photoByCode=new Map();state.locationByCode=new Map();
  state.fotos.forEach(f=>{const a=state.photoByCode.get(f.codigo)||[];a.push(f);state.photoByCode.set(f.codigo,a);});
  state.ubicaciones.forEach(u=>{const a=state.locationByCode.get(u.codigo)||[];a.push(u);state.locationByCode.set(u.codigo,a);});
}
async function updateBranchData(){
  const d=await rpc('branchData');
  if(d.branch!==state.branch)throw Error('La sucursal de la sesión cambió, inicia sesión otra vez');
  state.auth=d.auth;state.ubicaciones=d.ubicaciones||[];state.fotos=d.fotos||[];state.inventario=d.inventario||[];state.pedidos=d.pedidos||[];state.historial=d.historial||[];
  reindexBranch();renderCatalog();renderInventory();renderOrders();renderHistory();renderLocationExtra();
}
async function refreshData(reloadCatalog=false){
  $('#locationSync').textContent='Sincronizando...';
  try{
    if(reloadCatalog||!state.productos.length){
      const [c,d]=await Promise.all([rpc('catalog'),rpc('branchData')]);
      if(d.branch!==state.branch)throw Error('Datos de sucursal diferentes');
      state.productos=c.productos;state.auth=d.auth;state.ubicaciones=d.ubicaciones;state.fotos=d.fotos;state.inventario=d.inventario;state.pedidos=d.pedidos;state.historial=d.historial;
      reindexBranch();buildCategories();renderCatalog();renderInventory();renderOrders();renderHistory();renderLocationExtra();
    }else await updateBranchData();
    $('#lightProductCount').textContent=state.productos.length+' productos';
    $('#locationSync').textContent='Sincronizado '+new Date().toLocaleTimeString('es-SV',{hour:'2-digit',minute:'2-digit'});
  }catch(e){$('#locationSync').textContent='Sin conexión';throw e;}
}
function setTab(tab){
  if(!['catalog','location','inventory','orders','history'].includes(tab))return;
  state.tab=tab;
  ['catalog','location','inventory','orders','history'].forEach(t=>$('#'+t+'Page').hidden=t!==tab);
  $$('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  if(tab==='location')setLocationSub(state.locationSub);
  window.scrollTo({top:0,behavior:'smooth'});
}
function categoryOf(item){return (item.categoria||item.descripcion.split(/\s+/)[0]||'Otros').toUpperCase();}
function buildCategories(){
  const counts=new Map();state.productos.forEach(p=>{const k=categoryOf(p);counts.set(k,(counts.get(k)||0)+1);});
  const opts=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,90);
  $('#categoryFilter').innerHTML='<option value="">Todas</option>'+opts.map(([name])=>`<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
}
function filteredProducts(){
  const q=state.search.trim().toLocaleLowerCase();
  return state.productos.filter(p=>{
    if(state.category&&categoryOf(p)!==state.category)return false;
    const photos=(state.photoByCode.get(p.codigo)||[]).length;
    if(state.filter==='has'&&!photos)return false;
    if(state.filter==='none'&&photos)return false;
    return !q||`${p.codigo} ${p.descripcion} ${p.categoria}`.toLocaleLowerCase().includes(q);
  });
}
function renderCatalog(){
  const data=filteredProducts(),vis=data.slice(0,state.shown);
  $('#catalogCount').innerHTML=`<strong>${data.length}</strong> de ${state.productos.length} productos · ${new Set(state.fotos.map(f=>f.codigo)).size} con foto`;
  if(!data.length){$('#productGrid').innerHTML='<div class="subtle" style="grid-column:1/-1;padding:60px 0;text-align:center">No se encontraron productos con esos filtros.</div>';$('#pagination').hidden=true;return;}
  $('#productGrid').innerHTML=vis.map(p=>{
    const fs=state.photoByCode.get(p.codigo)||[],loc=state.locationByCode.get(p.codigo)||[];
    const principal=loc.length?loc[loc.length-1]:null,first=fs[0];
    return `<article class="product-card" data-product="${escapeHtml(p.codigo)}" tabindex="0" role="button" aria-label="Ver ${escapeHtml(p.descripcion)}"><div class="product-cover">${first?`<img loading="lazy" data-photo-id="${escapeHtml(first.id)}" alt="Foto de ${escapeHtml(p.descripcion)}">`: `<div class="no-photo">${ico('image')}<span>Sin foto</span></div>`}${fs.length?`<span class="photo-count">${fs.length} ${fs.length===1?'foto':'fotos'}</span>`:''}<button class="card-share" data-share-code="${escapeHtml(p.codigo)}" type="button" aria-label="Compartir producto">${ico('share')}</button></div><div class="card-content"><div class="card-title">${escapeHtml(p.descripcion)}</div><div class="card-meta">${principal?`<span class="shelf-chip ${principal.temporal?'temporary':''}">${escapeHtml(principal.ubicacion)}</span>`:''}<span class="card-code">${escapeHtml(p.codigo)}</span></div></div></article>`;
  }).join('');
  $('#pagination').hidden=state.shown>=data.length;
  setupLazyPhotos($('#productGrid'));
}
function setupLazyPhotos(root){
  if(imageObserver)imageObserver.disconnect();
  imageObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){imageObserver.unobserve(e.target);loadPhotoInto(e.target);}}),{rootMargin:'250px'});
  $$('img[data-photo-id]',root).forEach(i=>{const id=i.dataset.photoId;if(state.photoCache.has(id))i.src=state.photoCache.get(id);else imageObserver.observe(i);});
}
async function loadPhotoInto(img){
  const id=img.dataset.photoId;
  if(state.photoCache.has(id)){img.src=state.photoCache.get(id);return;}
  photoQueue.push({id,img});runPhotoQueue();
}
async function getPhotoData(id){
  if(state.photoCache.has(id))return state.photoCache.get(id);
  if(photoPending.has(id))return photoPending.get(id);
  const branchAtStart=state.branch;
  const work=(async()=>{
    const r=await rpc('photoRead',{id});
    if(branchAtStart!==state.branch)throw Error('La sucursal cambió durante la carga de la fotografía');
    const src='data:'+r.mime+';base64,'+r.data;
    state.photoCache.set(id,src);
    if(state.photoCache.size>95)state.photoCache.delete(state.photoCache.keys().next().value);
    return src;
  })().finally(()=>photoPending.delete(id));
  photoPending.set(id,work);
  return work;
}
async function runPhotoQueue(){
  while(photoActive<3&&photoQueue.length){
    photoActive++;
    const {id,img}=photoQueue.shift();
    getPhotoData(id).then(src=>{if(img.isConnected&&img.dataset.photoId===id)img.src=src;}).catch(()=>{}).finally(()=>{photoActive--;runPhotoQueue();});
  }
}
async function shareProductCode(code){
  const p=state.productos.find(p=>p.codigo===code);if(!p)return;
  const url=new URL(location.href);url.searchParams.set('codigo',code);
  const text=p.descripcion+'\nCódigo: '+p.codigo+'\n'+url.toString();
  if(navigator.share){try{await navigator.share({title:p.descripcion,text:text});return;}catch(e){if(e.name==='AbortError')return;}}
  try{await navigator.clipboard.writeText(text);toast('Información copiada para compartir');}catch(e){toast(text);}
}

/* El modal muestra TODAS las fotos y TODAS las ubicaciones del producto. */
function openModal(title,body,extra=''){
  const dlg=$('#mainDialog');if(dlg.open)dlg.close();
  $('#modalBody').innerHTML=`<div class="modal-panel ${extra}"><div class="modal-head"><h2>${escapeHtml(title)}</h2><button class="modal-close" id="modalClose" aria-label="Cerrar" type="button">${ico('close')}</button></div>${body}</div>`;
  $('#modalClose').addEventListener('click',()=>dlg.close());dlg.showModal();return $('#modalBody');
}
function closeModal(){if($('#mainDialog').open)$('#mainDialog').close();}
/** Confirmación con el mismo tema visual; evita cuadros genéricos del navegador. */
function askConfirm(title,message,positive='Confirmar'){
  return new Promise(resolve=>{
    const dlg=$('#mainDialog');closeModal();
    openModal(title,`<p class="modal-caption">${escapeHtml(message)}</p><div class="modal-actions"><button type="button" class="button outline" id="confirmNo">Cancelar</button><button type="button" class="button primary" id="confirmYes">${escapeHtml(positive)}</button></div>`);
    let finished=false;
    const done=value=>{if(finished)return;finished=true;dlg.removeEventListener('close',onClose);closeModal();resolve(value);};
    const onClose=()=>done(false);dlg.addEventListener('close',onClose);
    $('#confirmNo').onclick=()=>done(false);
    $('#confirmYes').onclick=()=>done(true);
  });
}
function openProduct(code){
  const p=state.productos.find(x=>x.codigo===code);if(!p)return;
  const fotos=state.photoByCode.get(code)||[],ubic=state.locationByCode.get(code)||[];
  const content=`<p class="modal-caption">${escapeHtml(p.descripcion)}<br><span style="font-family:var(--mono);color:var(--violet2)">${escapeHtml(p.codigo)}</span></p><p class="eyebrow">FOTOGRAFÍAS (${fotos.length}/4)</p><div class="product-view-images" id="detailPhotos">${fotos.length?fotos.map(f=>`<div class="product-view-img"><img data-photo-id="${escapeHtml(f.id)}" alt="Fotografía de ${escapeHtml(p.descripcion)}"><div class="view-controls"><button data-pview="${escapeHtml(f.id)}">Ver</button><button data-pcrop="${escapeHtml(f.id)}">Recortar</button><button data-pdel="${escapeHtml(f.id)}">Quitar</button>${state.auth&&state.auth.master?`<button data-pshare="${escapeHtml(f.id)}">Compartir</button>`:''}</div></div>`).join(''):'<p class="subtle">Este producto aún no tiene fotografías.</p>'}</div><div class="modal-actions" style="justify-content:start"><button class="button primary small" id="detailUpload">${ico('upload')} Subir fotografía</button><button class="button outline small" id="detailCamera">${ico('camera')} Tomar foto</button></div><hr style="border:0;border-top:1px solid var(--stroke);margin:24px 0"><p class="eyebrow">UBICACIONES EN ${escapeHtml(branchLabel(state.branch).toUpperCase())}</p><div class="tag-line">${ubic.length?ubic.map(u=>`<span class="tag ${u.temporal?'temp':''}">${escapeHtml(u.ubicacion)}${u.temporal?' · Temporal':''}<button title="Retirar ubicación" data-udel="${escapeHtml(u.id)}">×</button></span>`).join(''):'<span class="subtle">Sin ubicaciones registradas.</span>'}</div><div class="modal-actions" style="justify-content:start"><button id="detailLocation" class="button outline small">${ico('plus')} Agregar ubicación</button><button id="detailShare" class="button outline small">${ico('share')} Compartir producto</button></div>`;
  const root=openModal('Detalle de producto',content);
  $$('img[data-photo-id]',root).forEach(img=>loadPhotoInto(img));
  $('#detailUpload').onclick=()=>{state.editProduct=code;$('#photoFileInput').click();};
  $('#detailCamera').onclick=()=>{state.editProduct=code;openCamera('photo');};
  $('#detailLocation').onclick=()=>showAddLocation(code);
  $('#detailShare').onclick=()=>shareProductCode(code);
  $$('[data-pview]',root).forEach(b=>b.onclick=()=>viewPhoto(b.dataset.pview));
  $$('[data-pcrop]',root).forEach(b=>b.onclick=()=>editPhoto(b.dataset.pcrop,code));
  $$('[data-pdel]',root).forEach(b=>b.onclick=()=>deletePhoto(b.dataset.pdel,code));
  $$('[data-pshare]',root).forEach(b=>b.onclick=()=>sharePhoto(b.dataset.pshare,code));
  $$('[data-udel]',root).forEach(b=>b.onclick=()=>deleteLocation(b.dataset.udel,code));
}
async function viewPhoto(id){
  openModal('Fotografía','<p class="modal-caption">Cargando imagen privada...</p>');
  try{const src=await getPhotoData(id);const modal=$('#mainDialog');if(!modal.open)return;$('#modalBody').innerHTML=`<div class="modal-panel"><div class="modal-head"><h2>Fotografía</h2><button class="modal-close" id="modalClose" aria-label="Cerrar">${ico('close')}</button></div><img class="full-image" alt="Fotografía de producto" src="${src}"><div class="modal-actions"><button class="button outline" id="shareViewed">${ico('share')} Compartir imagen</button></div></div>`;$('#modalClose').onclick=closeModal;$('#shareViewed').onclick=()=>shareImage(src);}catch(e){fail(e);closeModal();}
}
async function shareImage(src){
  try{const blob=await (await fetch(src)).blob(),file=new File([blob],'foto_producto.jpg',{type:blob.type});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file]});return;}
    toast('Tu navegador no permite compartir archivos. Usa la opción de compartir producto.');
  }catch(e){if(e.name!=='AbortError')fail(e);}
}
/** La clave de ubicaciones/borrado solo se envía por POST al backend. */
async function ensurePermission(kind){
  if(state.auth&&(state.auth.master||state.auth[kind]))return true;
  return new Promise(resolve=>{
    const dlg=$('#mainDialog');closeModal();
    const label=kind==='location'?'modificar ubicaciones':'eliminar o recortar fotografías';
    const root=openModal('Autorización necesaria',`<p class="modal-caption">Introduce la contraseña de ${escapeHtml(label)} correspondiente a ${escapeHtml(branchLabel(state.branch))}. También puedes utilizar la clave maestra al iniciar sesión.</p><form id="permissionForm"><label class="field"><span>Contraseña de autorización</span><input id="permissionValue" type="password" required autocomplete="off"></label><div class="modal-actions"><button class="button outline" type="button" id="permissionCancel">Cancelar</button><button class="button primary" id="permissionSubmit">Autorizar</button></div></form>`);
    let finished=false;const finish=v=>{if(finished)return;finished=true;dlg.removeEventListener('close',onClose);closeModal();resolve(v);};
    const onClose=()=>finish(false);dlg.addEventListener('close',onClose);
    $('#permissionCancel').onclick=()=>finish(false);
    $('#permissionForm').onsubmit=async e=>{e.preventDefault();$('#permissionSubmit').disabled=true;try{const d=await rpc('elevate',{kind,password:$('#permissionValue').value});state.auth=d.auth;finish(true);toast('Permiso autorizado');}catch(err){toast(err.message,true);$('#permissionSubmit').disabled=false;}};
  });
}
async function deletePhoto(id,code){
  if(!await ensurePermission('delete'))return;
  if(!await askConfirm('Eliminar fotografía','¿Quitar esta foto de '+branchLabel(state.branch)+'? La fotografía de la otra sucursal no se modificará.','Eliminar fotografía')){openProduct(code);return;}
  try{await rpc('photoRemove',{id});state.photoCache.delete(id);await updateBranchData();openProduct(code);toast('Fotografía eliminada de esta sucursal');}catch(e){fail(e);}
}
async function sharePhoto(id,code){
  if(!state.auth.master){toast('Solo el administrador maestro puede compartir fotos',true);return;}
  const dest=state.branch==='S1'?'Casa Matriz':'Sucursal 1';
  if(!await askConfirm('Compartir fotografía','¿Copiar esta foto a '+dest+'? Se creará una copia independiente en Drive.','Copiar fotografía')){openProduct(code);return;}
  try{await rpc('photoShare',{id});toast('Fotografía compartida con '+dest);openProduct(code);}catch(e){fail(e);}
}
async function editPhoto(id,code){
  if(!await ensurePermission('delete'))return;
  try{toast('Preparando editor de recorte...');const source=await getPhotoData(id);openCrop(source,async data=>{
    try{await rpc('photoReplace',{id,mime:'image/jpeg',data});state.photoCache.delete(id);await updateBranchData();openProduct(code);toast('Recorte guardado en Drive');}catch(e){fail(e);}
  });}catch(e){fail(e);}
}
async function deleteLocation(id,code){
  if(!await ensurePermission('location'))return;
  if(!await askConfirm('Retirar ubicación','¿Retirar esta ubicación del producto? Se conservará el historial.','Retirar ubicación')){openProduct(code);return;}
  try{await rpc('locationRemove',{id});await updateBranchData();openProduct(code);toast('Ubicación retirada');}catch(e){fail(e);}
}
function showAddLocation(code){
  const root=openModal('Agregar ubicación',`<p class="modal-caption">Código: ${escapeHtml(code)} · ${escapeHtml(branchLabel(state.branch))}</p><form id="locationForm"><div class="inline-grid"><label class="field"><span>Estante</span><input id="manualShelf" required></label><label class="field"><span>Bahía</span><input id="manualBay" required></label><label class="field"><span>Caja (opcional)</span><input id="manualBox"></label></div><label class="field checkbox"><input id="manualTemp" type="checkbox"><span>Ubicación temporal</span></label><div class="modal-actions"><button class="button primary" id="saveLocation">Guardar ubicación</button></div></form>`);
  $('#locationForm').onsubmit=async e=>{e.preventDefault();
    // Capturar ANTES de abrir el modal de permiso, que cierra este formulario.
    const entry={codigo:code,estante:$('#manualShelf').value,bahia:$('#manualBay').value,caja:$('#manualBox').value,temporal:$('#manualTemp').checked};
    if(!await ensurePermission('location'))return;
    try{await rpc('locationAdd',entry);await updateBranchData();openProduct(code);toast('Ubicación guardada');}catch(err){fail(err);}
  };
}

/* FOTOGRAFÍA: importar, capturar, recortar de VERDAD y guardar privada. */
async function fileDataUrl(file){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(file);});}
async function startPhotoFile(file){
  if(!file.type.startsWith('image/'))throw Error('Selecciona una fotografía válida');
  const code=state.editProduct;if(!code)throw Error('Selecciona primero un producto');
  const src=await fileDataUrl(file);
  openCrop(src,async data=>savePhoto(code,data));
}
async function savePhoto(code,data){
  try{toast('Guardando fotografía...');await rpc('photoUpload',{codigo:code,mime:'image/jpeg',data});await updateBranchData();openProduct(code);toast('Fotografía guardada y organizada en Drive');}catch(e){fail(e);}
}
/** Editor táctil con rectángulo móvil y redimensionable. Se recorta el canvas real. */
function openCrop(src,onSave){
  const root=openModal('Ajustar fotografía',`<p class="modal-caption">Arrastra el recuadro para mover el recorte. Arrastra su esquina inferior derecha para cambiar el tamaño.</p><div class="crop-stage" id="cropStage"><img id="cropPhoto" src="${src}" alt="Fotografía a recortar"><div class="crop-selection" id="cropSelection"><span class="crop-handle"></span></div></div><p class="crop-note">Solo la zona dentro del recuadro se guardará.</p><div class="modal-actions"><button class="button outline" id="cropReset">Restablecer</button><button class="button primary" id="cropSave">${ico('check')} Recortar y guardar</button></div>`);
  const im=$('#cropPhoto'),stage=$('#cropStage'),rectEl=$('#cropSelection');
  let rect={x:.08,y:.08,w:.84,h:.84},drag=null;
  const paint=()=>{rectEl.style.left=(rect.x*100)+'%';rectEl.style.top=(rect.y*100)+'%';rectEl.style.width=(rect.w*100)+'%';rectEl.style.height=(rect.h*100)+'%';};paint();
  rectEl.addEventListener('pointerdown',e=>{e.preventDefault();const bounds=stage.getBoundingClientRect(),r=rectEl.getBoundingClientRect();const resize=e.target.classList.contains('crop-handle')||(e.clientX>r.right-22&&e.clientY>r.bottom-22);drag={type:resize?'resize':'move',startX:e.clientX,startY:e.clientY,base:{...rect},width:bounds.width,height:bounds.height};rectEl.setPointerCapture(e.pointerId);});
  rectEl.addEventListener('pointermove',e=>{if(!drag)return;const dx=(e.clientX-drag.startX)/drag.width,dy=(e.clientY-drag.startY)/drag.height;if(drag.type==='move'){rect.x=Math.max(0,Math.min(1-drag.base.w,drag.base.x+dx));rect.y=Math.max(0,Math.min(1-drag.base.h,drag.base.y+dy));}else{rect.w=Math.max(.1,Math.min(1-drag.base.x,drag.base.w+dx));rect.h=Math.max(.1,Math.min(1-drag.base.y,drag.base.h+dy));}paint();});
  const finish=()=>drag=null;rectEl.addEventListener('pointerup',finish);rectEl.addEventListener('pointercancel',finish);
  $('#cropReset').onclick=()=>{rect={x:0,y:0,w:1,h:1};paint();};
  $('#cropSave').onclick=async()=>{
    if(!im.complete||!im.naturalWidth)return toast('La imagen todavía está cargando',true);
    const sx=Math.round(rect.x*im.naturalWidth),sy=Math.round(rect.y*im.naturalHeight);
    const sw=Math.max(1,Math.round(rect.w*im.naturalWidth)),sh=Math.max(1,Math.round(rect.h*im.naturalHeight));
    const maxDimension=1500,ratio=Math.min(1,maxDimension/Math.max(sw,sh));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(sw*ratio));canvas.height=Math.max(1,Math.round(sh*ratio));
    canvas.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
    const data=canvas.toDataURL('image/jpeg',.82).split(',')[1];
    closeModal();await onSave(data);
  };
}

/* TOMAR UBICACIONES: dirección fijada y escaneo continuo. */
function unfixLocation(){
  state.activeLoc=null;$('#activeLocation').textContent='—';$('#activeLocation').style.color='#6d6af0';
  $('#fixLocation').textContent='Fijar esta ubicación';
}
async function fixLocation(){
  const estante=$('#locShelf').value.trim().toUpperCase(),bahia=$('#locBay').value.trim().toUpperCase();
  const caja=$('#useBox').checked?$('#locBox').value.trim().toUpperCase():'';
  if(!estante||!bahia)return toast('Indica Estante y Bahía',true);
  if($('#useBox').checked&&!caja)return toast('Escribe el número de caja o desmarca la casilla',true);
  if(!await ensurePermission('location'))return;
  state.activeLoc={estante,bahia,caja,temporal:$('#locTemp').checked};
  $('#activeLocation').textContent=[estante,bahia,caja].filter(Boolean).join('-')+(state.activeLoc.temporal?' · Temporal':'');
  $('#activeLocation').style.color=state.activeLoc.temporal?'#bd7725':'#5755f6';
  $('#fixLocation').textContent='Ubicación fijada · Lista para escanear';
  toast('Ubicación fijada: '+[estante,bahia,caja].filter(Boolean).join('-'));
}
function scanFeedback(text,error=false){
  const el=$('#scanFeedback');el.hidden=false;el.textContent=text;el.classList.toggle('error',error);
}
function showActiveLocationRequired(){toast('Primero selecciona Estante, Bahía y, si corresponde, Caja; después pulsa Fijar ubicación.',true);setTab('location');setLocationSub('scan');}
let scannerQueue=[],scannerSending=false,scannerLastCode='',scannerLastTime=0;
/** Un lector de pistola USB/Bluetooth puede escribir el código + Enter aquí. */
async function recordCode(value){
  if(!state.activeLoc)return showActiveLocationRequired();
  const code=String(value||'').trim().slice(0,80);
  if(!code)return;
  const now=Date.now();
  if(code===scannerLastCode&&now-scannerLastTime<3500){return;}
  scannerLastCode=code;scannerLastTime=now;
  scannerQueue.push(code);state.readCount++;
  scanFeedback('Lectura recibida: '+code+' · Guardando...');
  $('#scannerResult').textContent='Lectura: '+code+' · Enviando al servidor';
  beep();try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}
  flushScannerQueue();
}
async function flushScannerQueue(){
  if(scannerSending)return;scannerSending=true;
  while(scannerQueue.length){
    const codes=scannerQueue.splice(0,Math.min(scannerQueue.length,30)),loc=state.activeLoc;
    if(!loc){scanFeedback('Ubicación ya no está fijada',true);break;}
    try{
      const d=await rpc('scanBatch',{codigos:codes,...loc});
      if(d.unknown.length){
        const msg='No encontrados en PRODUCTOS: '+d.unknown.join(', ');
        scanFeedback(msg,true);$('#scannerResult').textContent=msg;
      }else{
        const msg=d.saved.length+' lectura(s) guardadas en '+d.ubicacion;
        scanFeedback(msg);$('#scannerResult').textContent=msg;
      }
      $('#locationSync').textContent='Último registro '+new Date().toLocaleTimeString('es-SV',{hour:'2-digit',minute:'2-digit'});
    }catch(e){scanFeedback('No se guardó el lote: '+e.message,true);$('#scannerResult').textContent='No guardado · '+e.message;fail(e);}
  }
  scannerSending=false;
  // Solo sincronizamos la lista al terminar, para mantener fluida la cámara.
  if(!$('#cameraDialog').open)updateBranchData().catch(fail);
}
function updateLocationSuggestions(text){
  const el=$('#locationMatches'),q=String(text||'').trim().toLowerCase();
  if(q.length<2){el.innerHTML='';return;}
  const matches=state.productos.filter(p=>`${p.codigo} ${p.descripcion}`.toLowerCase().includes(q)).slice(0,7);
  el.innerHTML=matches.map(p=>`<button class="suggestion" type="button" data-manual-code="${escapeHtml(p.codigo)}"><span><strong>${escapeHtml(p.descripcion)}</strong><small>${escapeHtml(p.codigo)}</small></span>${ico('arrow')}</button>`).join('')||'<p class="light-empty">No se encontró un producto. Primero importa el catálogo.</p>';
  $$('[data-manual-code]',el).forEach(b=>b.addEventListener('click',()=>{$('#locationManual').value='';el.innerHTML='';recordCode(b.dataset.manualCode);}));
}
function setLocationSub(sub){
  state.locationSub=sub;$$('.light-sub').forEach(b=>b.classList.toggle('selected',b.dataset.sub===sub));
  $('#locationScanPanel').hidden=sub!=='scan';$('#locationExtraPanel').hidden=sub==='scan';
  renderLocationExtra();
}
function renderLocationExtra(){
  const sub=state.locationSub,container=$('#locationExtraPanel');
  if(sub==='scan')return;
  if(sub==='list'){
    container.innerHTML='<p class="light-label">UBICACIONES REGISTRADAS EN '+escapeHtml(branchLabel(state.branch).toUpperCase())+'</p><div class="light-list">'+
      (state.ubicaciones.slice().reverse().slice(0,130).map(u=>`<div class="light-item"><span><b>${escapeHtml(u.ubicacion)}</b> ${u.temporal?'<span style="color:#c07d23">· Temporal</span>':''}<small>${escapeHtml(u.codigo)} · ${dateText(u.fecha)}</small></span><button type="button" data-where-code="${escapeHtml(u.codigo)}">Ver</button></div>`).join('')||'<div class="light-empty">Aún no hay ubicaciones.</div>')+
      '</div><div style="display:flex;gap:8px;margin-top:15px"><button class="button light-primary" id="printActive" type="button">Imprimir ubicación activa</button></div>';
    $$('[data-where-code]',container).forEach(b=>b.onclick=()=>openProduct(b.dataset.whereCode));
    $('#printActive').onclick=printActiveLocation;
  }else if(sub==='search'){
    container.innerHTML='<p class="light-label">BUSCAR PRODUCTOS DE LA SUCURSAL</p><div class="light-fieldset"><input class="light-input" id="lightSearch" placeholder="Código o descripción..."><div class="suggestions" id="lightSearchResults"></div></div>';
    $('#lightSearch').oninput=e=>{const q=e.target.value.trim().toLowerCase();$('#lightSearchResults').innerHTML=q.length<2?'':state.productos.filter(p=>(p.codigo+' '+p.descripcion).toLowerCase().includes(q)).slice(0,12).map(p=>`<button type="button" class="suggestion" data-open-code="${escapeHtml(p.codigo)}"><span><b>${escapeHtml(p.descripcion)}</b><small>${escapeHtml(p.codigo)}</small></span>${ico('arrow')}</button>`).join('');$$('[data-open-code]',$('#lightSearchResults')).forEach(b=>b.onclick=()=>openProduct(b.dataset.openCode));};
  }else if(sub==='recent'){
    container.innerHTML='<p class="light-label">MOVIMIENTOS RECIENTES</p><div class="light-list">'+
      (state.historial.slice(0,90).map(h=>`<div class="light-item"><div><strong>${escapeHtml(h.accion)}</strong><small>${escapeHtml(h.codigo||'')} · ${escapeHtml(h.detalle||'')}</small><small>${dateText(h.fecha)}</small></div></div>`).join('')||'<div class="light-empty">No hay movimientos todavía.</div>')+'</div>';
  }else if(sub==='order'){
    container.innerHTML='<p class="light-label">PEDIDOS DE ESTA SUCURSAL</p><div class="light-fieldset"><p style="font-size:12px;color:#6978aa;margin:4px 0 15px">Los pedidos se guardan exclusivamente para '+escapeHtml(branchLabel(state.branch))+'.</p><button class="button light-primary full" id="goOrders">Abrir módulo de pedidos</button></div>';
    $('#goOrders').onclick=()=>setTab('orders');
  }
}
function printActiveLocation(){
  if(!state.activeLoc)return showActiveLocationRequired();
  const u=state.activeLoc,locationText=[u.estante,u.bahia,u.caja].filter(Boolean).join('-');
  const w=window.open('','_blank','width=500,height=400');if(!w)return toast('Permite las ventanas emergentes para imprimir',true);
  w.document.write('<!doctype html><html><head><title>Etiqueta de ubicación</title><style>body{font-family:Arial;text-align:center;padding:30px}h1{font-size:45px;margin:15px 0}p{font-size:14px}</style></head><body><p>'+escapeHtml(branchLabel(state.branch))+'</p><h1>'+escapeHtml(locationText)+'</h1><p>'+(u.temporal?'UBICACIÓN TEMPORAL':'UBICACIÓN PERMANENTE')+'</p></body></html>');w.document.close();w.focus();w.print();
}

/* INVENTARIO: utiliza las mismas lecturas que se guardan en UBICACIONES. */
function renderInventory(){
  const items=state.inventario.slice().sort((a,b)=>a.codigo.localeCompare(b.codigo));
  const productsByCode=new Map(state.productos.map(p=>[p.codigo,p]));
  $('#inventoryList').innerHTML='<div class="data-row data-head"><span>CÓDIGO</span><span>PRODUCTO</span><span>UBICACIÓN</span><span>LECTURAS</span></div>'+
    (items.map(i=>{const p=productsByCode.get(i.codigo);return `<div class="data-row"><span class="code">${escapeHtml(i.codigo)}</span><span>${escapeHtml(p?p.descripcion:'Producto sin descripción')}</span><span>${escapeHtml(i.ubicacion)}</span><b>${i.cantidad}</b></div>`;}).join('')||'<div class="subtle" style="padding:25px">Aún no hay productos escaneados.</div>');
}
function exportInventory(){
  const rows=[['codigo_producto','descripcion','ubicacion','cantidad'],...state.inventario.map(i=>{const p=state.productos.find(x=>x.codigo===i.codigo);return[i.codigo,p?p.descripcion:'',i.ubicacion,i.cantidad];})];
  const csv='\ufeff'+rows.map(row=>row.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  const link=document.createElement('a');link.href=url;link.download='inventario_'+state.branch+'_'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
}

/* PEDIDOS: guardar, editar, cambiar estado y eliminar con permiso. */
function renderOrders(){
  const el=$('#ordersList');
  el.innerHTML=state.pedidos.length?state.pedidos.map(p=>`<article class="order-card"><div class="order-top"><h3>${escapeHtml(p.cliente)}</h3><span class="pill">${escapeHtml(p.estado)}</span></div><p>${escapeHtml(p.vendedor||'Sin vendedor')} · ${dateText(p.fecha)}</p><p>${p.items.length} tipo(s) de producto · ${p.items.reduce((s,i)=>s+(Number(i.cantidad)||0),0)} pieza(s)</p><div class="tag-line">${p.urgente?'<span class="pill warn">Urgente</span>':''}${p.envio?'<span class="pill">Envío</span>':''}</div><div class="order-actions"><button class="button outline small" data-order-edit="${escapeHtml(p.id)}">Editar</button><button class="button outline small" data-order-delete="${escapeHtml(p.id)}">Eliminar</button></div></article>`).join(''):'<p class="subtle">No hay pedidos registrados en esta sucursal.</p>';
  $$('[data-order-edit]',el).forEach(b=>b.onclick=()=>orderEditor(state.pedidos.find(p=>p.id===b.dataset.orderEdit)));
  $$('[data-order-delete]',el).forEach(b=>b.onclick=()=>orderDelete(b.dataset.orderDelete));
}
function orderEditor(existing=null){
  const items=existing?existing.items.map(x=>({...x})):[];
  const root=openModal(existing?'Editar pedido':'Nuevo pedido',`<form id="orderForm"><div class="inline-grid" style="grid-template-columns:1fr 1fr"><label class="field"><span>Cliente</span><input id="orderClient" required value="${escapeHtml(existing?.cliente||'')}"></label><label class="field"><span>Vendedor</span><input id="orderSeller" value="${escapeHtml(existing?.vendedor||'')}"></label></div><div class="inline-grid"><label class="field checkbox"><input id="orderShip" type="checkbox" ${existing?.envio?'checked':''}><span>Envío</span></label><label class="field checkbox"><input id="orderUrgent" type="checkbox" ${existing?.urgente?'checked':''}><span>Urgente</span></label><label class="field"><span>Estado</span><select id="orderStatus"><option>Pendiente</option><option>Preparando</option><option>Completado</option></select></label></div><p class="eyebrow">PRODUCTOS DEL PEDIDO</p><div class="inline-grid" style="grid-template-columns:2fr 1fr auto"><label class="field"><span>Código</span><input id="orderCode" placeholder="Código exacto"></label><label class="field"><span>Cantidad</span><input id="orderQty" type="number" min="1" max="9999" value="1"></label><button class="button outline" type="button" id="addItem" style="align-self:end;margin-bottom:13px">Añadir</button></div><div id="orderItems"></div><div class="modal-actions"><button class="button primary" id="saveOrder" type="submit">Guardar pedido</button></div></form>`);
  $('#orderStatus').value=existing?.estado||'Pendiente';
  function drawItems(){
    $('#orderItems').innerHTML=items.map((i,n)=>{const p=state.productos.find(p=>p.codigo===i.codigo);return `<div class="light-item" style="background:var(--surface2);color:var(--text);border-color:var(--stroke);margin-bottom:7px"><span>${escapeHtml(p?.descripcion||i.codigo)}<small>${escapeHtml(i.codigo)}</small></span><strong>x${i.cantidad}</strong><button data-rm-item="${n}" type="button">Quitar</button></div>`;}).join('')||'<p class="subtle">Todavía no has añadido productos.</p>';
    $$('[data-rm-item]',$('#orderItems')).forEach(b=>b.onclick=()=>{items.splice(Number(b.dataset.rmItem),1);drawItems();});
  }drawItems();
  $('#addItem').onclick=()=>{
    const code=$('#orderCode').value.trim(),q=Number($('#orderQty').value)||1;
    const product=state.productos.find(p=>p.codigo===code);
    if(!product)return toast('Introduce un código existente del catálogo',true);
    const item=items.find(i=>i.codigo===code);if(item)item.cantidad+=q;else items.push({codigo:code,cantidad:q});
    $('#orderCode').value='';drawItems();
  };
  $('#orderForm').onsubmit=async e=>{
    e.preventDefault();if(!items.length)return toast('Añade un producto al pedido',true);
    const pedido={id:existing?.id||'',cliente:$('#orderClient').value,vendedor:$('#orderSeller').value,envio:$('#orderShip').checked,urgente:$('#orderUrgent').checked,estado:$('#orderStatus').value,items};
    $('#saveOrder').disabled=true;
    try{await rpc('orderSave',{pedido});closeModal();await updateBranchData();toast('Pedido guardado en '+branchLabel(state.branch));}catch(e){fail(e);$('#saveOrder').disabled=false;}
  };
}
async function orderDelete(id){
  if(!await ensurePermission('delete'))return;
  if(!await askConfirm('Eliminar pedido','¿Eliminar este pedido de '+branchLabel(state.branch)+'? Esta operación quedará registrada en el historial.','Eliminar pedido'))return;
  try{await rpc('orderRemove',{id});await updateBranchData();toast('Pedido eliminado');}catch(e){fail(e);}
}
function renderHistory(){
  $('#historyList').innerHTML='<div class="data-row data-head"><span>FECHA</span><span>OPERACIÓN</span><span>CÓDIGO</span><span>USUARIO</span></div>'+
    (state.historial.map(h=>`<div class="data-row"><span>${dateText(h.fecha)}</span><span><b>${escapeHtml(h.accion)}</b><small>${escapeHtml(h.detalle||'')}</small></span><span class="code">${escapeHtml(h.codigo||'—')}</span><span>${escapeHtml(h.autor||'')}</span></div>`).join('')||'<div class="subtle" style="padding:26px">Sin movimientos.</div>');
}
/** La clave maestra permite cambiar de sucursal sin iniciar con otra cuenta. */
function showAdmin(){
  if(!state.auth?.master){openModal('Administración',`<p class="modal-caption">Has ingresado con una clave de sucursal. Para administrar ambas sucursales, cierra sesión e ingresa con la clave maestra.</p>`);return;}
  openModal('Panel de administración',`<p class="modal-caption">Sesión maestra autorizada. La información visible siempre corresponde a una sola sucursal.</p><p class="eyebrow">SUCURSAL ACTIVA</p><div class="tag-line"><span class="tag">${escapeHtml(branchLabel(state.branch))}</span></div><div class="modal-actions" style="justify-content:start"><button class="button primary" id="adminSwitch">Cambiar a ${state.branch==='S1'?'Casa Matriz':'Sucursal 1'}</button></div><hr style="border:0;border-top:1px solid var(--stroke);margin:23px 0"><p class="eyebrow">HERRAMIENTAS</p><p class="modal-caption">Desde cada fotografía puedes utilizar «Compartir» para copiarla a la otra sucursal. Puedes eliminar solamente la copia de la sucursal donde estés trabajando.</p><p class="modal-caption">El catálogo PRODUCTOS es común. Las hojas UBICACIONES, FOTOS, INVENTARIO, PEDIDOS e HISTORIAL son independientes en Google Sheets.</p>`);
  $('#adminSwitch').onclick=async()=>{
    const target=state.branch==='S1'?'CM':'S1';
    try{
      await rpc('switchBranch',{branch:target});
      closeModal();state.branch=target;state.activeLoc=null;state.photoCache.clear();photoQueue=[];
      state.fotos=[];state.ubicaciones=[];state.pedidos=[];state.historial=[];state.inventario=[];
      reindexBranch();unfixLocation();sessionStorage.setItem('bodega_v2_branch',target);
      $('#branchPill').textContent=branchLabel(target);$('#lightBranch').textContent=branchLabel(target).toUpperCase();
      renderCatalog();await updateBranchData();setTab('catalog');toast('Sucursal activa: '+branchLabel(target));
    }catch(e){fail(e);}
  };
}

/* ESCÁNER: navegador nativo + ZXing integrado, sin cerrar después de cada código. */
const camera={stream:null,track:null,loopTimer:null,running:false,mode:'catalog',nativeDetector:null,nativeErrors:0,lastRead:'',lastReadTime:0,tick:0,torch:false,blockedCode:'',lastSeenAt:0};
const BD_FORMATS=['qr_code','code_128','code_39','code_93','ean_13','ean_8','upc_a','upc_e','itf','codabar','data_matrix','pdf417','aztec'];
let zxingReader=null,zxingHints=null;
function prepareZxing(){
  if(zxingReader)return true;
  if(!window.ZXing)return false;
  const z=window.ZXing,map=new Map(),f=z.BarcodeFormat;
  map.set(z.DecodeHintType.POSSIBLE_FORMATS,[f.QR_CODE,f.CODE_128,f.CODE_39,f.CODE_93,f.EAN_13,f.EAN_8,f.UPC_A,f.UPC_E,f.ITF,f.CODABAR,f.DATA_MATRIX,f.PDF_417,f.AZTEC]);
  map.set(z.DecodeHintType.TRY_HARDER,true);zxingHints=map;zxingReader=new z.MultiFormatReader();return true;
}
function decodeCanvas(cv,invert){
  if(!prepareZxing())return null;
  const z=window.ZXing,w=cv.width,h=cv.height,data=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;
  const gray=new Uint8ClampedArray(w*h);
  for(let i=0,p=0;i<gray.length;i++,p+=4){const value=(data[p]*306+data[p+1]*601+data[p+2]*117)>>10;gray[i]=invert?255-value:value;}
  try{const result=zxingReader.decode(new z.BinaryBitmap(new z.HybridBinarizer(new z.RGBLuminanceSource(gray,w,h))),zxingHints);return {text:result.getText(),format:String(z.BarcodeFormat[result.getBarcodeFormat()]||'')};}catch(e){return null;}
}
const frameCanvas=document.createElement('canvas');
function videoFrame(video,crop){
  const w=video.videoWidth,h=video.videoHeight;if(!w||!h)return null;
  let sx=0,sy=0,sw=w,sh=h;
  if(crop){sw=Math.round(w*.70);sh=Math.round(h*.62);sx=(w-sw)/2;sy=(h-sh)/2;}
  const ratio=Math.min(1,1100/Math.max(sw,sh));frameCanvas.width=Math.max(1,Math.round(sw*ratio));frameCanvas.height=Math.max(1,Math.round(sh*ratio));
  frameCanvas.getContext('2d',{willReadFrequently:true}).drawImage(video,sx,sy,sw,sh,0,0,frameCanvas.width,frameCanvas.height);
  return frameCanvas;
}
async function prepareNativeDetector(){
  if(camera.nativeDetector||!('BarcodeDetector' in window))return;
  try{const sup=await window.BarcodeDetector.getSupportedFormats();const formats=BD_FORMATS.filter(f=>sup.includes(f));if(formats.length)camera.nativeDetector=new window.BarcodeDetector({formats});}catch(e){}
}
function scanConfirmed(hit){
  if(!hit||!hit.text)return false;
  const text=String(hit.text).trim();if(!text)return false;
  const now=Date.now();
  // Evita falsas lecturas de barras: hay que leer el mismo código dos veces.
  const isQR=/QR/i.test(String(hit.format||''));
  if(!isQR&&(camera.lastRead!==text||now-camera.lastReadTime>2200)){camera.lastRead=text;camera.lastReadTime=now;return false;}
  camera.lastRead=text;camera.lastReadTime=now;
  if(camera.mode==='catalog'){
    $('#cameraDialog').close();setTab('catalog');state.search=text;$('#catalogSearch').value=text;state.shown=42;renderCatalog();toast('Código detectado: '+text);beep();
  }else if(camera.mode==='record'){
    if(camera.blockedCode===text)return true;
    camera.blockedCode=text;recordCode(text);
  }
  return true;
}
async function scannerLoop(){
  if(!camera.running||camera.mode==='photo')return;
  const v=$('#cameraVideo');
  try{
    if(v.readyState>=2&&v.videoWidth){
      camera.tick++;let hit=null;
      if(camera.nativeDetector&&camera.nativeErrors<4){
        try{const detections=await camera.nativeDetector.detect(v);if(detections?.length)hit={text:detections[0].rawValue,format:detections[0].format};camera.nativeErrors=0;}catch(e){camera.nativeErrors++;}
      }
      if(!hit){const cv=videoFrame(v,camera.tick%2===0);if(cv){hit=decodeCanvas(cv,false);if(!hit&&camera.tick%4===0)hit=decodeCanvas(cv,true);}}
      if(hit){camera.lastSeenAt=Date.now();scanConfirmed(hit);}
      else if(camera.blockedCode&&Date.now()-camera.lastSeenAt>1500)camera.blockedCode='';
    }
  }catch(e){}
  if(camera.running)camera.loopTimer=setTimeout(scannerLoop,115);
}
function stopCamera(){
  camera.running=false;clearTimeout(camera.loopTimer);
  if(camera.stream)camera.stream.getTracks().forEach(track=>track.stop());
  camera.stream=null;camera.track=null;camera.torch=false;$('#cameraVideo').srcObject=null;
}
/** Fallbacks de cámara para Chrome, Brave, Samsung Internet, Safari e iOS. */
async function startCamera(deviceId){
  stopCamera();
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw Error('La cámara requiere HTTPS y permisos del navegador. Abre el enlace GitHub en Chrome o Safari.');
  const candidates=deviceId?
    [{video:{deviceId:{exact:deviceId},width:{ideal:1920},height:{ideal:1080}},audio:false}]:
    [{video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false},
     {video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false},
     {video:{facingMode:'environment'},audio:false},{video:true,audio:false}];
  let stream=null,lastError=null;
  for(const constraints of candidates){try{stream=await navigator.mediaDevices.getUserMedia(constraints);break;}catch(e){lastError=e;if(['NotAllowedError','SecurityError'].includes(e.name))throw e;}}
  if(!stream)throw lastError||Error('No se pudo acceder a ninguna cámara');
  camera.stream=stream;camera.track=stream.getVideoTracks()[0];
  const v=$('#cameraVideo');v.muted=true;v.setAttribute('playsinline','');v.srcObject=stream;
  await v.play();
  if(!v.videoWidth)await new Promise(resolve=>{const timer=setTimeout(resolve,2500);v.onloadedmetadata=()=>{clearTimeout(timer);resolve();};});
  let caps={};try{caps=camera.track.getCapabilities?.()||{};}catch(e){}
  try{if(caps.focusMode?.includes('continuous'))await camera.track.applyConstraints({advanced:[{focusMode:'continuous'}]});}catch(e){}
  $('#torchCamera').hidden=!caps.torch;
  if(caps.zoom&&caps.zoom.max>caps.zoom.min){
    const z=$('#cameraZoom');z.min=caps.zoom.min;z.max=Math.min(8,caps.zoom.max);z.step=caps.zoom.step||.1;z.value=caps.zoom.min;$('#zoomGroup').hidden=false;
  }else $('#zoomGroup').hidden=true;
  try{const cams=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');$('#flipCamera').hidden=cams.length<2;}catch(e){$('#flipCamera').hidden=true;}
  if(camera.mode!=='photo'){camera.running=true;scannerLoop();}
}
async function openCamera(mode){
  if(mode==='record'&&!state.activeLoc)return showActiveLocationRequired();
  state.cameraMode=mode;camera.mode=mode;camera.nativeErrors=0;camera.lastRead='';camera.tick=0;camera.blockedCode='';camera.lastSeenAt=0;
  $('#cameraTitle').textContent=mode==='photo'?'Tomar fotografía':'Escáner de códigos';
  $('#cameraTip').textContent=mode==='photo'?'Lo que quede dentro del marco será la fotografía':'Centra el código dentro del recuadro';
  $('#cameraGuide').classList.toggle('photo-guide',mode==='photo');
  $('#capturePhoto').hidden=mode!=='photo';$('#scanImageButton').hidden=mode==='photo';
  $('#scannerResult').textContent='';$('#cameraDialog').showModal();
  await prepareNativeDetector();
  try{await startCamera();}
  catch(e){let msg=e.message||'Cámara no disponible';if(e.name==='NotAllowedError')msg='Permiso de cámara bloqueado. Permite la cámara en el navegador o utiliza Leer código desde foto.';if(e.name==='NotReadableError')msg='La cámara está ocupada por otra aplicación.';$('#scannerResult').textContent=msg;toast(msg,true);}
}
async function flipCamera(){
  try{
    const devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');
    if(devices.length<2)return;
    const current=camera.track?.getSettings()?.deviceId;const index=devices.findIndex(d=>d.deviceId===current);await startCamera(devices[(index+1)%devices.length].deviceId);
  }catch(e){fail(e);}
}
async function toggleTorch(){
  if(!camera.track)return;camera.torch=!camera.torch;
  try{await camera.track.applyConstraints({advanced:[{torch:camera.torch}]});$('#torchCamera').textContent=camera.torch?'Apagar linterna':'Linterna';}catch(e){camera.torch=false;toast('Este dispositivo no permite controlar la linterna desde el navegador',true);}
}
async function updateZoom(e){try{await camera.track?.applyConstraints({advanced:[{zoom:Number(e.target.value)}]});}catch(e){}}
function beep(){
  try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;const a=new Context(),osc=a.createOscillator(),gain=a.createGain();osc.type='sine';osc.frequency.value=1100;gain.gain.value=.065;osc.connect(gain);gain.connect(a.destination);osc.start();osc.stop(a.currentTime+.09);setTimeout(()=>a.close(),200);}catch(e){}
}
/** El marco de la cámara es un RECORTE REAL, no solo un adorno superpuesto. */
async function capturePhoto(){
  const v=$('#cameraVideo');if(!v.videoWidth)return toast('La cámara aún no está lista',true);
  const w=v.clientWidth,h=v.clientHeight,natW=v.videoWidth,natH=v.videoHeight;
  // object-fit:cover -> coordenadas verdaderas en el video original.
  const scale=Math.max(w/natW,h/natH),renderW=natW*scale,renderH=natH*scale;
  const offX=(renderW-w)/2,offY=(renderH-h)/2;
  const guide=$('#cameraGuide'),gx=guide.offsetLeft,gy=guide.offsetTop,gw=guide.offsetWidth,gh=guide.offsetHeight;
  const sx=Math.max(0,(gx+offX)/scale),sy=Math.max(0,(gy+offY)/scale);
  const sw=Math.min(natW-sx,gw/scale),sh=Math.min(natH-sy,gh/scale);
  const max=1600,ratio=Math.min(1,max/Math.max(sw,sh));
  const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(sw*ratio));cv.height=Math.max(1,Math.round(sh*ratio));
  cv.getContext('2d').drawImage(v,sx,sy,sw,sh,0,0,cv.width,cv.height);
  const src=cv.toDataURL('image/jpeg',.9);$('#cameraDialog').close();
  const code=state.editProduct;openCrop(src,async data=>savePhoto(code,data));
}
async function readCodeImage(file){
  if(!file.type.startsWith('image/'))throw Error('El archivo no es una fotografía');
  let bitmap;
  try{bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});}catch(e){bitmap=await new Promise((res,rej)=>{const image=new Image(),url=URL.createObjectURL(file);image.onload=()=>{URL.revokeObjectURL(url);res(image);};image.onerror=rej;image.src=url;});}
  const w=bitmap.width||bitmap.naturalWidth,h=bitmap.height||bitmap.naturalHeight;
  const canvas=document.createElement('canvas');let result=null;
  for(const side of [1600,1000,2400,700]){
    const ratio=Math.min(1,side/Math.max(w,h));canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));
    canvas.getContext('2d',{willReadFrequently:true}).drawImage(bitmap,0,0,canvas.width,canvas.height);
    result=decodeCanvas(canvas,false)||decodeCanvas(canvas,true);
    if(!result&&camera.nativeDetector){try{const arr=await camera.nativeDetector.detect(canvas);if(arr?.length)result={text:arr[0].rawValue,format:arr[0].format};}catch(e){}}
    if(result)break;
    await delay(0);
  }
  if(bitmap.close)bitmap.close();
  if(!result)throw Error('No se reconoció el código en la imagen. Acerca y enfoca el código e intenta otra vez.');
  if(state.cameraMode==='record'){recordCode(result.text);}
  else{if($('#cameraDialog').open)$('#cameraDialog').close();state.search=result.text;$('#catalogSearch').value=result.text;setTab('catalog');renderCatalog();toast('Código reconocido: '+result.text);}
}

// Evita dejar la cámara activa en segundo plano cuando cambian de aplicación.
document.addEventListener('visibilitychange',()=>{if(document.hidden&&$('#cameraDialog').open)$('#cameraDialog').close();});
init();
