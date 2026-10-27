# Versão independente do GitHub

O index.html usa independente.mjs e github-store.mjs. Não chama o servidor anterior.

Consulta pública e edição com nome de usuário e uma senha compartilhada. O nome é identificação declarada, não autenticação individual. O token é cifrado em acesso.json com AES-256-GCM e PBKDF2-SHA256 (600 mil iterações, sal aleatório). A chave e a senha não estão neste repositório. O token permanece somente em memória durante a sessão e é descartado ao sair, recarregar ou após 30 minutos de inatividade. Quem conhece a senha consegue recuperar o token. Não há recuperação por email, perfis individuais ou proteção dos dados publicados.

Dados: dados/comunidade-publica.json, com controle de concorrência pelo SHA do GitHub. Limite de 900 KB nesta demonstração. Fotos são reduzidas para até 640 pixels. As últimas 100 ações declaradas ficam no arquivo; Git também preserva histórico. Visitantes não podem cadastrar relatos. Todos os responsáveis têm o mesmo acesso.

Os arquivos private-json e os fontes antigos permanecem preservados. Não foram importados: a exportação antiga retornou HTTP 403 e a chave não foi disponibilizada. Nenhum arquivo antigo foi apagado. A versão nova começa com catálogo vazio. A sincronização do servidor antigo, caso continue ativa, grava na estrutura antiga e não é usada pelo novo site. Para revogar o acesso do servidor antigo, substitua seu token ou remova o segredo naquele serviço.

O APK antigo não foi recompilado; utilize esta versão pelo navegador.
