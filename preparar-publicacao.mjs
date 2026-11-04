/* Configura somente o repositório da instalação. A ofuscação no cliente não é segredo. */
import {randomBytes,createCipheriv,createHash} from 'node:crypto';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {dataKey as password} from './configuracao-ilab.js';
const token=process.env.PROTOTYPE_GITHUB_TOKEN||'';
const [owner,repo]=String(process.env.GITHUB_REPOSITORY||'').split('/');
if(!owner||!repo)throw Error('Informe GITHUB_REPOSITORY no workflow.');
const version=process.env.GITHUB_SHA||'ilab-20261104';
const base=process.env.CONEXAO_BASE_PATH||(repo.toLowerCase()===owner.toLowerCase()+'.github.io'?'/':'/'+repo+'/');
if(!base.startsWith('/')||!base.endsWith('/'))throw Error('Caminho do Pages inválido.');
const config={owner,repo,branch:process.env.CONEXAO_BRANCH||'main',password,version,tokenConfigured:Boolean(token),tokenMasked:'********'};
if(token){
 const key=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
 cipher.setAAD(Buffer.from(owner+'/'+repo));
 const encrypted=Buffer.concat([cipher.update(token,'utf8'),cipher.final(),cipher.getAuthTag()]);
 Object.assign(config,{tokenFingerprint:createHash('sha256').update(token).digest('hex').slice(0,12),tokenEnvelope:{algorithm:'AES-256-GCM',iv:iv.toString('base64'),body:encrypted.toString('base64')},publicWrappingKey:key.toString('base64')});
}else console.log('Modo consulta: configure PROTOTYPE_GITHUB_TOKEN para habilitar contas e gravações.');
await writeFile('conexao-config.js','window.CONEXAO_CONFIG='+JSON.stringify(config)+';\n');
for(const file of await readdir('.'))if(/\.(html|css|js|webmanifest)$/.test(file)){
 const before=await readFile(file,'utf8');
 let content=before.replaceAll('/conexaocomunidade/',base).replaceAll('"/brand-name.css"','"'+base+'brand-name.css"').replaceAll('"/brand-name.js"','"'+base+'brand-name.js"');
 if(file.endsWith('.html')){
  if(content.includes('pages-independent.js')&&!content.includes('conexao-config.js'))content=content.replace(/(<script\s+src=["'][^"']*pages-independent\.js["'][^>]*><\/script>)/,'<script src="'+base+'conexao-config.js"></script>\n    $1');
  content=content.replace(/(\b(?:src|href)=["'])([^"']+\.(?:js|css))(["'])/g,(all,start,path,end)=>path.includes(':')?all:start+path+'?v='+version+end);
 }
 if(content!==before)await writeFile(file,content);
}
const java='android/app/src/main/java/br/ilab/conexaocomunidade/MainActivity.java';
try{let code=await readFile(java,'utf8');code=code.replaceAll('ILAB_PAGES_HOST',owner.toLowerCase()+'.github.io').replaceAll('/conexaocomunidade/',base);await writeFile(java,code);}catch(e){if(e.code!=='ENOENT')throw e;}
