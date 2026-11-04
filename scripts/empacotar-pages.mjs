import {readdir,readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
const directory='site-publicado';await rm(directory,{recursive:true,force:true});await mkdir(directory,{recursive:true});
for(const entry of await readdir('.',{withFileTypes:true})){
 if(entry.isFile()&&(/\.(html|css|js|webmanifest|svg|png)$/.test(entry.name)||entry.name==='.nojekyll'))await cp(entry.name,directory+'/'+entry.name);
}
for(const folder of ['brand','vendor','dados','downloads','documentacao'])await cp(folder,directory+'/'+folder,{recursive:true});
console.log('HTML e recursos preparados em '+directory+'.');
