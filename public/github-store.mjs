export const REPO='ilabfmp/conexaocomunidade';
const API=`https://api.github.com/repos/${REPO}/contents/`;
export const DATA_PATH='dados/comunidade-publica.json';
const enc=new TextEncoder(),dec=new TextDecoder();
export const from64=s=>Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0));
export const to64=b=>{let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode(...b.slice(i,i+8192));return btoa(s);};
export async function unlock(v,password){
 if(v.version!==1||v.iterations!==600000)throw Error('Formato de acesso incompatível.');
 const material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);
 const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:from64(v.salt),iterations:v.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
 try{return dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:from64(v.iv),additionalData:enc.encode(REPO+':v1')},key,from64(v.ciphertext)));}catch{throw Error('Senha compartilhada incorreta.');}
}
export async function api(path,{token,method='GET',body}={}){
 const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 if(token)headers.Authorization='Bearer '+token;
 if(body)headers['Content-Type']='application/json';
 const r=await fetch(API+path,{method,headers,body:body?JSON.stringify(body):undefined,cache:'no-store',credentials:'omit'});
 if(!r.ok){const code=r.status;throw Object.assign(Error(code===409||code===422?'Outro responsável alterou os dados. Atualize antes de salvar novamente.':code===401?'O token foi revogado ou expirou. Configure um novo acesso.':code===403?'Sem permissão ou limite de requisições atingido no GitHub. Tente novamente mais tarde.':`Não foi possível acessar os dados (HTTP ${code}).`),{status:code});}
 return r.json();
}
export async function readData(token){const f=await api(DATA_PATH,{token});if(f.encoding!=='base64')throw Error('Arquivo excedeu o tamanho suportado. Exporte e reduza as imagens.');return {sha:f.sha,data:JSON.parse(dec.decode(from64(f.content)))};}
export async function saveData(data,sha,token,user){
 if(!token)throw Error('Faça login para salvar.');
 const bytes=enc.encode(JSON.stringify(data,null,2));if(bytes.length>900000)throw Error('Limite desta demonstração atingido (900 KB). Remova imagens ou exporte os registros.');
 const result=await api(DATA_PATH,{token,method:'PUT',body:{message:'Atualiza cadastro comunitário — '+user.slice(0,60),sha,branch:'main',content:to64(bytes)}});
 return result.content.sha;
}
