/* Compatibility layer for the original ILAB screens. Only GitHub stores data.
 * UI filtering is not confidentiality: the repository and every record are public.
 * Every holder of the shared password has the same GitHub permissions.
 */
import {unlock,from64,to64} from './github-store.mjs';
export const DATA_PATH='dados/comunidade-v2.json';
const REPO='ilabfmp/conexaocomunidade',ROOT='/conexaocomunidade/';
const SESSION='conexao-github-session-v2',MAX_IDLE=30*60*1000;
const enc=new TextEncoder(),dec=new TextDecoder();
const uuid=()=>crypto.randomUUID(),clone=x=>structuredClone(x);
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
const slots=['student-1','student-2','student-3','teacher-1','teacher-2','teacher-3','teacher-4','developer-1','developer-2','manager','coordination','team','institution'];
const defaults={'student-1':'natanael-vieira-sousa.jpeg','student-2':'vitor-hugo-pereira.jpeg','student-3':'caue-vinicius-teixeira-da-silva.jpeg','teacher-1':'diego-paulo-garcia.jpeg','teacher-2':'silvania-matos-de-lima.jpeg','teacher-3':'willian-de-franca.jpeg','teacher-4':'gabriela-da-silva-loh.jpeg','developer-1':'eugenio-carlos-damasio-frois.png','developer-2':'joao-paulo-broering.jpeg',manager:'leandro-pickler.jpeg',coordination:'daniela-amorim.jpeg'};
export const emptyState=()=>({version:2,companies:[],reports:[],entries:[],profiles:{},users:[],assets:[],aboutSlots:[],events:[]});
const text=(v,max=250)=>String(v??'').trim().slice(0,max);
const required=(v,label,min=2,max=250)=>{const s=text(v,max);if(s.length<min)fail('Confira '+label+'.');return s;};
const point=v=>{const lat=v.lat==null||v.lat===''?null:Number(v.lat),lng=v.lng==null||v.lng===''?null:Number(v.lng);if((lat===null)!==(lng===null)||lat!==null&&(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lng)||Math.abs(lng)>180))fail('Informe latitude e longitude válidas juntas.');return {lat,lng};};
const imageFields=c=>({logo:c.logo||null,facade:c.facade||null,gallery:c.gallery||[]});
function companyData(input){const v={...input},c={};for(const [k,max] of Object.entries({name:120,provider:100,slogan:160,category:80,products:1500,description:2000,address:250,hours:200,contact:120,privateNote:1000,district:100,sector:100}))c[k]=text(v[k],max);c.name=required(v.name,'o nome',2,120);c.listingType=['business','autonomous','community-place'].includes(v.listingType)?v.listingType:'business';Object.assign(c,point(v),imageFields(v));if(!Array.isArray(c.gallery)||c.gallery.length+(c.facade?1:0)>10||new Set(c.gallery).size!==c.gallery.length||c.gallery.includes(c.facade))fail('Use até 10 fotos diferentes, incluindo a fachada.');c.services=(v.services||[]).map(s=>({name:required(s.name,'o serviço',2,120),unit:text(s.unit,80),price:null}));if(c.services.length>30)fail('Use até 30 serviços.');c.published=!!v.published;if(!c.district)c.district=/frei\s*dami[aã]o/i.test(c.address)?'Frei Damião':/brejaru/i.test(c.address)?'Brejaru':'';if(!c.sector)c.sector=c.category;return c;}
function signature(bytes,type){return type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:type==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71:type==='image/webp'?dec.decode(bytes.slice(0,4))==='RIFF'&&dec.decode(bytes.slice(8,12))==='WEBP':false;}
export async function prepareImage(file){
 if(!file||!file.size||file.size>5000000)fail('Use JPG, PNG ou WebP de até 5 MB.');
 const original=new Uint8Array(await file.arrayBuffer());if(!signature(original,file.type))fail('Formato da imagem inválido.');
 if(typeof createImageBitmap==='function'&&typeof document!=='undefined'){
  const bitmap=await createImageBitmap(file);const ratio=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();let body=canvas.toDataURL('image/jpeg',.8).split(',')[1];if(body.length>800000)body=canvas.toDataURL('image/jpeg',.55).split(',')[1];if(body.length>800000)fail('Escolha uma imagem menor.');return {type:'image/jpeg',body};
 }
 if(original.length>600000)fail('Escolha uma imagem menor.');return {type:file.type,body:to64(original)};
}
export class GitHubDirect {
 constructor({fetch:fetcher=globalThis.fetch.bind(globalThis),storage=globalThis.sessionStorage,now=()=>Date.now(),image=prepareImage}={}){this.fetch=fetcher;this.storage=storage;this.now=now;this.image=image;this.cache=null;this.inflight=null;this.queue=Promise.resolve();this.imageCache=new Map();}
 session(){try{const s=JSON.parse(this.storage.getItem(SESSION)||'null');if(s&&typeof s.token==='string'&&s.name&&s.username&&this.now()-s.lastActivity<MAX_IDLE)return s;}catch{}this.storage.removeItem(SESSION);return null;}
 touch(){const s=this.session();if(s){s.lastActivity=this.now();this.storage.setItem(SESSION,JSON.stringify(s));}}
 user(){const s=this.session();return s?{name:s.name,username:s.username,role:'owner',auth:'local',shared:true,email:''}:null;}
 require(){const s=this.session();if(!s)fail('Entre com seu usuário e a senha compartilhada dos responsáveis para continuar.',401);return s;}
 logout(){this.storage.removeItem(SESSION);this.cache=null;this.imageCache.clear();}
 async git(path,{method='GET',body,token}={}){
  const t=token??this.session()?.token;const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};if(t)headers.Authorization='Bearer '+t;if(body)headers['Content-Type']='application/json';
  const response=await this.fetch(`https://api.github.com/repos/${REPO}/contents/${path}`,{method,headers,body:body?JSON.stringify(body):undefined,cache:'no-store',credentials:'omit'});
  if(!response.ok){if(response.status===401)this.logout();fail(response.status===409||response.status===422?'Os dados mudaram. Atualize a lista e reabra o cadastro antes de salvar.':response.status===401?'O token expirou ou foi revogado.':response.status===403?'Acesso negado ou limite de requisições do GitHub atingido.':`Não foi possível acessar o arquivo (HTTP ${response.status}).`,response.status);}
  return response.json();
 }
 async read(force=false){
  const authenticated=!!this.session();if(!force&&this.cache&&this.cache.authenticated===authenticated&&this.now()-this.cache.at<15000)return this.cache;
  if(!force&&this.inflight)return this.inflight;
  const work=async()=>{let data,sha;
   if(authenticated){const r=await this.git(DATA_PATH);if(r.encoding!=='base64')fail('Arquivo de dados excedeu o tamanho suportado. Exporte os registros.',413);data=JSON.parse(dec.decode(from64(r.content)));sha=r.sha;}
   else{const r=await this.fetch(ROOT+DATA_PATH+'?v='+Math.floor(this.now()/15000),{cache:'no-store',credentials:'omit'});if(!r.ok)fail('Dados públicos ainda não disponíveis. Aguarde a publicação e atualize.',r.status);data=await r.json();sha=null;}
   if(data.version!==2||!['companies','reports','entries','users','assets','aboutSlots','events'].every(k=>Array.isArray(data[k]))||!data.profiles||typeof data.profiles!=='object')fail('Formato dos dados incompatível.',503);
   return this.cache={data,sha,at:this.now(),authenticated};};
  const p=work();if(!force)this.inflight=p;try{return await p;}finally{if(this.inflight===p)this.inflight=null;}
 }
 check(row,revision){if(!row)fail('Registro não encontrado.',404);if(row.revision!==revision)fail('O registro mudou. Atualize a lista e reabra antes de salvar.',409);}
 revise(row){row.revision=uuid();row.updated_at=this.now();return row.revision;}
 async mutate(action,work){
  const run=async()=>{const session=this.require();const current=await this.read(true),data=clone(current.data);const uploads=[],deletes=[];
   try{const result=await work(data,{uploads,deletes,session});data.events.push({id:uuid(),time:this.now(),type:action,name:session.name,status:'Salvo'});data.events=data.events.slice(-100);
    const bytes=enc.encode(JSON.stringify(data));if(bytes.length>900000)fail('Limite de metadados desta demonstração atingido. Exporte os registros antes de continuar.',413);
    const saved=await this.git(DATA_PATH,{method:'PUT',body:{message:action+' — '+session.username,branch:'main',sha:current.sha,content:to64(bytes)}});
    this.cache={data,sha:saved.content.sha,at:this.now(),authenticated:true};this.imageCache.clear();
    for(const a of deletes)await this.deleteAssetFile(a).catch(()=>{});
    return result;
   }catch(e){for(const a of uploads)await this.deleteAssetFile(a).catch(()=>{});this.cache=null;throw e;}};
  const p=this.queue.then(run,run);this.queue=p.catch(()=>{});return p;
 }
 async deleteAssetFile(asset){if(!asset?.path||!asset.fileSha)return;await this.git(asset.path,{method:'DELETE',body:{message:'Remove imagem sem referência ativa',sha:asset.fileSha,branch:'main'}});}
 async addAsset(data,context,image,metadata={}){
  if(!['image/jpeg','image/png','image/webp'].includes(image.type)||typeof image.body!=='string'||image.body.length>800000||!signature(from64(image.body),image.type))fail('Imagem inválida ou muito grande.');
  const id=uuid(),path='dados/imagens/'+id+'.json';const bytes=enc.encode(JSON.stringify(image));
  const saved=await this.git(path,{method:'PUT',body:{message:'Adiciona imagem pública',branch:'main',content:to64(bytes)}});
  const asset={id,path,fileSha:saved.content.sha,type:image.type,approval:'approved',revision:uuid(),created_at:this.now(),...metadata};context.uploads.push(asset);data.assets.push(asset);return asset;
 }
 removeAsset(data,context,id){const asset=data.assets.find(a=>a.id===id);if(asset){data.assets=data.assets.filter(a=>a.id!==id);context.deletes.push(asset);}}
 async imageResponse(data,id){const a=data.assets.find(x=>x.id===id);if(!a)fail('Imagem não encontrada.',404);let image=this.imageCache.get(id);if(!image){if(this.session()){const f=await this.git(a.path);image=JSON.parse(dec.decode(from64(f.content)));}else{const r=await this.fetch(ROOT+a.path,{cache:'no-store',credentials:'omit'});if(!r.ok)fail('A imagem ainda está sendo publicada. Atualize em instantes.',r.status);image=await r.json();}this.imageCache.set(id,image);}return new Response(from64(image.body),{headers:{'Content-Type':image.type,'Cache-Control':'no-store'}});}
 projection(c,data){const out={...clone(c),mine:!!this.session()};if(!this.session()){const ok=id=>data.assets.some(a=>a.id===id&&a.approval==='approved');out.logo=ok(c.logo)?c.logo:null;out.facade=ok(c.facade)?c.facade:null;out.gallery=c.gallery.filter(ok);delete out.privateNote;delete out.revision;}return out;}
 async auth(method,b){
  if(method==='GET')return json({user:this.user()});
  if(method!=='POST')fail('Operação indisponível.',405);
  if(b.action==='logout'){this.logout();return json({ok:true});}
  if(b.action&&b.action!=='register-company')fail('Esta versão usa uma senha compartilhada. Consulte o responsável pelo projeto.',400);
  const username=required(b.username,'o usuário',2,60),name=text(b.name||username,100);
  if(!/^[\p{L}\p{N}_.-]{2,60}$/u.test(username)||['__proto__','prototype','constructor'].includes(username.toLowerCase()))fail('Use um usuário com letras, números, ponto, hífen ou sublinhado.');
  const response=await this.fetch(ROOT+'acesso.json',{cache:'no-store',credentials:'omit'});if(!response.ok)fail('Configuração de acesso indisponível.',503);
  const token=await unlock(await response.json(),String(b.password||''));
  this.storage.setItem(SESSION,JSON.stringify({token,username,name,lastActivity:this.now()}));this.cache=null;
  try{await this.mutate('Acesso dos responsáveis',(data)=>{const row=data.users.find(u=>u.username===username);if(row){row.name=name;row.last_login=this.now();}else data.users.push({username,name,role:'owner',active:true,created_at:this.now(),last_login:this.now()});return {ok:true};});}
  catch(e){this.logout();throw e;}
  return json({ok:true,role:'owner',user:this.user()});
 }
 async handle(endpoint,method='GET',b={},params=new URLSearchParams()){
  try{
   if(endpoint==='auth')return await this.auth(method,b);
   if(endpoint==='password-recovery'){if(method==='GET')return json({available:false,shared:true});fail('Solicite a senha compartilhada ao responsável pelo projeto. Não há recuperação por e-mail nesta versão.');}
   if(method!=='GET')this.require();
   if(endpoint==='companies'){
    if(method==='GET'){const {data}=await this.read();return json({companies:data.companies.filter(c=>this.session()||c.published).map(c=>this.projection(c,data)),user:this.user(),directory:{count:0},complementary:[]});}
    if(method==='POST')return json(await this.mutate('Empresa salva',data=>{
     if(b.action==='create'){const c={...companyData({name:'Nova empresa'}),id:uuid(),owner:this.require().username,configured:false,created_at:this.now(),revision:uuid()};data.companies.push(c);return {id:c.id,revision:c.revision};}
     const c=data.companies.find(x=>x.id===b.id);this.check(c,b.revision);const valid=companyData(b.data||{});for(const id of [valid.logo,valid.facade,...valid.gallery].filter(Boolean))if(!data.assets.some(a=>a.id===id&&a.company_id===c.id))fail('A imagem não pertence à empresa.');Object.assign(c,valid,{configured:true});return {ok:true,revision:this.revise(c)};
    }));
    if(method==='DELETE')return json(await this.mutate('Empresa excluída',(data,ctx)=>{const c=data.companies.find(x=>x.id===b.id);this.check(c,b.revision);data.companies=data.companies.filter(x=>x.id!==c.id);for(const a of [...data.assets].filter(a=>a.company_id===c.id))this.removeAsset(data,ctx,a.id);return {ok:true};}));
   }
   if(endpoint==='company-image'){
    if(method==='GET'){const {data}=await this.read();const id=params.get('id'),a=data.assets.find(x=>x.id===id),c=data.companies.find(x=>x.id===a?.company_id);if(!c||!a||!this.session()&&(!c.published||a.approval!=='approved'))fail('Imagem não disponível.',404);return await this.imageResponse(data,id);}
    if(method==='POST'){const photo=await this.image(b.get('image'));return json(await this.mutate('Imagem da empresa salva',async(data,ctx)=>{
     const c=data.companies.find(x=>x.id===b.get('company'));this.check(c,b.get('revision'));const kind=b.get('kind'),replace=b.get('replace');if(!['logo','facade','gallery'].includes(kind))fail('Tipo de imagem inválido.');if(kind!=='logo'&&!c.configured)fail('Salve os dados da empresa primeiro.');if(replace&&!(kind==='gallery'?c.gallery.includes(replace):c[kind]===replace))fail('Imagem não pertence a este espaço.');if(!replace&&((kind==='gallery'&&c.gallery.length+(c.facade?1:0)>=10)||(kind==='facade'&&!c.facade&&c.gallery.length>=10)))fail('Limite de 10 fotos por empresa.');
     const previous=kind==='gallery'?replace:c[kind],a=await this.addAsset(data,ctx,photo,{company_id:c.id,kind});if(kind==='gallery'){if(replace)c.gallery[c.gallery.indexOf(replace)]=a.id;else c.gallery.push(a.id);}else c[kind]=a.id;if(previous)this.removeAsset(data,ctx,previous);return {id:a.id,revision:this.revise(c),images:imageFields(c),approval:'approved'};
    }));}
    if(method==='DELETE')return json(await this.mutate('Imagem excluída',(data,ctx)=>{const c=data.companies.find(x=>x.id===b.company);this.check(c,b.revision);if(!data.assets.some(a=>a.id===b.id&&a.company_id===c.id))fail('Imagem não encontrada.',404);if(c.logo===b.id)c.logo=null;if(c.facade===b.id)c.facade=null;c.gallery=c.gallery.filter(id=>id!==b.id);this.removeAsset(data,ctx,b.id);return {ok:true,revision:this.revise(c),images:imageFields(c)};}));
    if(method==='PATCH')return json(await this.mutate('Imagem revisada',data=>{const a=data.assets.find(x=>x.id===b.id);this.check(a,b.revision);if(!['approved','rejected'].includes(b.approval))fail('Decisão inválida.');a.approval=b.approval;return {ok:true,revision:this.revise(a)};}));
   }
   if(endpoint==='admin-images'&&method==='GET'){this.require();const {data}=await this.read();return json({companies:data.companies.map(c=>({id:c.id,name:c.name,revision:c.revision,images:data.assets.filter(a=>a.company_id===c.id)})),aboutSlots:slots});}
   if(endpoint==='about-images'){
    if(method==='GET'){const {data}=await this.read();if(params.get('id')){if(!data.aboutSlots.some(s=>s.image===params.get('id')))fail('Imagem não encontrada.',404);return await this.imageResponse(data,params.get('id'));}return json({slots:slots.map(slot=>data.aboutSlots.find(s=>s.slot===slot)||{slot,image:null,revision:'',defaultSrc:defaults[slot]?ROOT+'brand/'+defaults[slot]:null})});}
    if(method==='POST'||method==='DELETE'){const slot=method==='POST'?b.get('slot'):b.slot,revision=method==='POST'?b.get('revision'):b.revision;if(!slots.includes(slot))fail('Espaço inválido.');const image=method==='POST'?await this.image(b.get('image')):null;return json(await this.mutate('Foto do projeto atualizada',async(data,ctx)=>{let row=data.aboutSlots.find(s=>s.slot===slot);if((row?.revision||'')!==revision)fail('A foto mudou. Atualize a página.',409);if(!row){row={slot,image:null};data.aboutSlots.push(row);}if(row.image)this.removeAsset(data,ctx,row.image);row.image=image?(await this.addAsset(data,ctx,image,{slot,kind:'about'})).id:null;return {ok:true,image:row.image,revision:this.revise(row)};}));}
   }
   if(endpoint==='reports'){
    if(method==='GET'){this.require();const {data}=await this.read();if(params.has('photo')){const row=data.reports.find(r=>r.id===params.get('id')),index=Number(params.get('photo'));if(!row||!Number.isInteger(index)||!row.imageIds?.[index])fail('Foto não encontrada.',404);return await this.imageResponse(data,row.imageIds[index]);}return json({reports:data.reports.map(r=>({...r,photoCount:r.imageIds?.length||0})).sort((a,b)=>b.created_at-a.created_at),unread:data.reports.filter(r=>!r.read_at).length,readOnly:false});}
    if(method==='POST')return json(await this.mutate('Relato recebido',async(data,ctx)=>{const r={id:uuid(),title:required(b.title,'o assunto',3,120),address:required(b.address,'o local',3,250),description:required(b.description,'a descrição',10,3000),anonymous:!!b.anonymous,name:b.anonymous?'':required(b.name,'o nome',2,100),contact:b.anonymous?'':text(b.contact,150),location:b.location?{...point(b.location),accuracy:Number(b.location.accuracy)||0,capturedAt:this.now()}:null,status:'Aguardando aprovação',approval:'pending',created_at:this.now(),read_at:null,imageIds:[],revision:uuid()};if(!Array.isArray(b.images||[])||(b.images||[]).length>3)fail('Use até 3 fotos por relato.');for(const image of b.images||[])r.imageIds.push((await this.addAsset(data,ctx,image,{report_id:r.id,kind:'report'})).id);data.reports.push(r);return {ok:true,id:r.id};}));
    if(method==='PATCH')return json(await this.mutate('Relato atualizado',data=>{const r=data.reports.find(x=>x.id===b.id);this.check(r,b.revision);if(!['Lido','Aprovado','Em acompanhamento','Resolvido','Rejeitado'].includes(b.status))fail('Situação inválida.');r.read_at=this.now();r.status=b.status;if(b.status==='Aprovado')r.approval='approved';if(b.status==='Rejeitado')r.approval='rejected';return {ok:true,revision:this.revise(r)};}));
   }
   if(endpoint==='coordination'){
    this.require();if(method==='GET'){const {data}=await this.read();return json({name:this.user().name,role:'owner',shared:true,companies:data.companies.map(c=>({...c,account:{username:'Acesso compartilhado',active:true,shared:true}}))});}
    if(method==='POST'){if(b.action==='release-account')fail('O acesso é compartilhado; não há liberação individual nesta versão.');return json(await this.mutate('Cadastro da coordenação salvo',data=>{const c={...companyData({...b,listingType:'autonomous'}),id:uuid(),configured:true,informal:true,owner:this.require().username,revision:uuid(),created_at:this.now()};data.companies.push(c);return {ok:true,id:c.id,revision:c.revision};}));}
    if(method==='PATCH')return json(await this.mutate('Cadastro da coordenação atualizado',data=>{const c=data.companies.find(x=>x.id===b.id);this.check(c,b.revision);const fields=['name','category','address','contact','hours','description','products'];if(Object.keys(b.data||{}).some(k=>!fields.includes(k)))fail('Altere somente os dados básicos.');Object.assign(c,companyData({...c,...b.data}));return {ok:true,revision:this.revise(c)};}));
   }
   if(endpoint==='community'){
    if(method==='GET'){const {data}=await this.read();const s=this.session(),profile=s?data.profiles[s.username]:null;return json({user:this.user(),profile:profile?.data||null,profileRevision:profile?.revision||null,directory:{count:0},complementary:[],records:[...data.companies.filter(c=>c.published).map(c=>({...this.projection(c,data),id:'company-'+c.id,title:c.name,sourceType:'company',kind:c.listingType==='community-place'?'place':'service',photo:c.facade||c.logo||null,status:'Empresa cadastrada',created_at:c.updated_at||c.created_at})),...data.entries.map(r=>({...r,mine:!!s}))]});}
    if(method==='POST')return json(await this.mutate('Registro comunitário salvo',data=>{if(b.action==='profile'){const k=this.require().username,old=data.profiles[k];if((old?.revision||null)!==(b.revision||null))fail('Perfil alterado. Atualize.',409);const r={data:{name:required(b.data?.name,'o nome',2,100),neighborhood:required(b.data?.neighborhood,'o bairro',2,120)},revision:uuid()};data.profiles[k]=r;return {ok:true,revision:r.revision};}const r=this.entryData(b.data,data);Object.assign(r,{id:uuid(),revision:uuid(),created_at:this.now(),status:'Registrado'});data.entries.push(r);return {ok:true,id:r.id,revision:r.revision};}));
    if(method==='PATCH')return json(await this.mutate('Registro comunitário atualizado',data=>{const r=data.entries.find(x=>x.id===b.id);this.check(r,b.revision);if(b.data)Object.assign(r,this.entryData(b.data,data));else{if(!['Registrado','Em acompanhamento','Resolvido'].includes(b.status))fail('Situação inválida.');r.status=b.status;}return {ok:true,revision:this.revise(r)};}));
   }
   if(endpoint==='photo'){
    if(method==='GET'){const {data}=await this.read();const id=params.get('id');if(!this.session()&&!data.entries.some(r=>r.photo===id||r.gallery.includes(id)))fail('Foto não encontrada.',404);return await this.imageResponse(data,id);}
    if(method==='POST'){const image=await this.image(b.get('photo'));return json(await this.mutate('Foto comunitária salva',async(data,ctx)=>({id:(await this.addAsset(data,ctx,image,{kind:'photo'})).id})));}
   }
   if(endpoint==='test-users'&&method==='GET'){this.require();const {data}=await this.read();return json({shared:true,users:data.users});}
   if(endpoint==='admin-activity'&&method==='GET'){this.require();const {data}=await this.read();return json({events:[...data.events].sort((a,b)=>b.time-a.time).slice(0,100)});}
   fail('Operação não disponível nesta versão de acesso compartilhado.',405);
  }catch(e){return json({error:e.message||'Não foi possível concluir a operação.'},e.status||400);}
 }
 entryData(b={},data){const r={kind:b.kind,title:required(b.title,'o título',3,120),category:required(b.category,'a categoria',2,50),description:required(b.description,'a descrição',10,2000),address:required(b.address,'o endereço',3,180),hours:text(b.hours,200),contact:text(b.contact,100),products:text(b.products,1000),gallery:b.gallery||[],photo:b.photo||null,...point(b)};if(!['service','place','problem'].includes(r.kind)||!Array.isArray(r.gallery)||r.gallery.length>6)fail('Confira o tipo e as fotos.');for(const id of [r.photo,...r.gallery].filter(Boolean))if(!data.assets.some(a=>a.id===id&&a.kind==='photo'))fail('Foto não encontrada.');return r;}
}
export function install(fetcher){const runtime=new GitHubDirect({fetch:fetcher});if(typeof document!=='undefined'){let lastTouch=0;for(const type of ['pointerdown','keydown'])document.addEventListener(type,()=>{if(Date.now()-lastTouch>5000){runtime.touch();lastTouch=Date.now();}},{passive:true});const ch=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('conexao-session'):null;ch?.addEventListener('message',e=>{if(e.data==='logout')runtime.logout();});runtime.broadcastLogout=()=>ch?.postMessage('logout');}return runtime;}
