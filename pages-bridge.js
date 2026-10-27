/* Legacy filename for original pages. No external bridge. */
(() => {
 const nativeFetch=window.fetch.bind(window);
 const base=new URL('.',document.currentScript.src);
 const ready=import(new URL('github-direct.mjs',base).href).then(m=>m.install(nativeFetch));
 window.fetch=async(input,options={})=>{
  const url=new URL(typeof input==='string'?input:input.url||input.href,location.href);
  if(url.origin!==location.origin||!url.pathname.startsWith('/api/'))return nativeFetch(input,options);
  if(options.signal?.aborted)throw new DOMException('Aborted','AbortError');
  const runtime=await ready,method=(options.method||(input instanceof Request?input.method:'GET')).toUpperCase();
  let body=options.body;
  if(body===undefined&&input instanceof Request&&!['GET','HEAD'].includes(method))body=input.headers.get('content-type')?.includes('multipart/form-data')?await input.clone().formData():await input.clone().text();
  if(typeof body==='string'){try{body=JSON.parse(body);}catch{return Response.json({error:'Dados inválidos.'},{status:400});}}
  const endpoint=url.pathname.slice(5),response=await runtime.handle(endpoint,method,body||{},url.searchParams);
  if(endpoint==='auth'&&body?.action==='logout')runtime.broadcastLogout?.();
  if(options.signal?.aborted)throw new DOMException('Aborted','AbortError');
  return response;
 };
 const pending=new WeakSet(),urls=new Map();
 function image(img){const raw=img.getAttribute('src');if(!raw?.startsWith('/api/')||pending.has(img))return;pending.add(img);
  const work=urls.get(raw)||window.fetch(raw).then(r=>{if(!r.ok)throw Error('Imagem indisponível');return r.blob();}).then(blob=>URL.createObjectURL(blob));urls.set(raw,work);
  work.then(url=>{if(img.getAttribute('src')===raw)img.src=url;}).catch(()=>{urls.delete(raw);img.title='Imagem ainda não publicada ou indisponível. Atualize a página.';}).finally(()=>pending.delete(img));
 }
 const scan=node=>{if(node.nodeType!==1)return;if(node.tagName==='IMG')image(node);node.querySelectorAll?.('img').forEach(image);};
 new MutationObserver(records=>records.forEach(r=>{if(r.type==='attributes')image(r.target);else r.addedNodes.forEach(scan);})).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
 scan(document.documentElement);
 window.addEventListener('pagehide',()=>{for(const promise of urls.values())promise.then(URL.revokeObjectURL).catch(()=>{});});
 sessionStorage.removeItem('conexao-pages-session');localStorage.removeItem('conexao-pages-session');
})();
