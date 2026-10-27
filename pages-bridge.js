/* Compatibilidade com páginas antigas: a ponte externa foi removida. */
window.fetch=()=>Promise.reject(new Error('Atualize a página para a versão independente.'));
location.replace('/conexaocomunidade/index.html');
