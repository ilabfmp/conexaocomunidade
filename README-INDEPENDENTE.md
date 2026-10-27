# Conexão Comunidade — interface original, GitHub independente

Foram restaurados os HTMLs, CSS, fundos, logos, fotos da equipe, catálogo, busca por serviço, mapa, rotas, telas de empresas, serviços, galerias, coordenação, relatos, imagens e atividade do pacote ILAB original.

`pages-bridge.js` conserva o nome somente por compatibilidade com as páginas. Ele encaminha as operações para `github-direct.mjs`, executado no navegador. Nenhuma chamada é feita ao servidor anterior. O único armazenamento usado é o GitHub. Mapas e rotas continuam usando OpenStreetMap e Google Maps, como antes.

## Acesso

A senha compartilhada já fornecida continua válida. `acesso.json` contém o token cifrado com AES-GCM e PBKDF2-SHA256. A senha não está no repositório. O usuário é uma identificação declarada; todos os responsáveis têm o mesmo acesso. Não há autenticação individual, redefinição de senha individual, recuperação por e-mail ou bloqueio individual. A tela de responsáveis lista as identificações utilizadas.

Para navegar entre as páginas sem repetir o login, o token desbloqueado fica em `sessionStorage` da aba, com expiração após 30 minutos de inatividade. Ele não é gravado no `localStorage`. Sair limpa a sessão e avisa as demais abas abertas. Quem conhece a senha compartilhada pode recuperar o token. Nunca publique o arquivo entregue com a senha.

## Dados e imagens

O arquivo ativo é `dados/comunidade-v2.json`; as imagens são arquivos separados em `dados/imagens/`. O catálogo público é atualizado após a publicação do GitHub Pages; os responsáveis leem e gravam diretamente pela API. Alterações usam o SHA do arquivo e revisão por registro, rejeitando conflitos em vez de sobrescrever outra edição. Fotos aceitam JPG/PNG/WebP de até 5 MB, reduzidas no navegador para até 1200 pixels e 600 KB. Limite do JSON de metadados: 900 KB; até 10 fotos por empresa, além da logo, e até 3 por relato.

Todos os dados do repositório são públicos, incluindo rascunhos, relatos e observações. Aprovação e publicação controlam a apresentação nas telas, não a confidencialidade. Visitantes consultam; somente responsáveis com a senha podem gravar, inclusive relatos. O histórico Git permanece após exclusões.

Os arquivos antigos `private-json`, os fontes do servidor e `dados/comunidade-publica.json` foram preservados. Os registros criptografados antigos não foram convertidos: faltam exportação e chave do servidor anterior. Nenhum registro antigo foi removido. A restauração conserva o histórico da versão simplificada. O serviço anterior pode ainda gravar na estrutura antiga; ele não é utilizado por esta interface.

## Aplicativo e verificação

O botão Instalar app mantém a versão PWA e a interface móvel original. O APK antigo não foi recompilado e não é oferecido como versão independente.

Teste automatizado: `node scripts/verify-github-direct.mjs`. Cobre login, sessão entre páginas, empresas, serviços, imagens, aprovação, conflitos, limpeza de uploads interrompidos, coordenação, relatos, mapa/perfil, atividade e expiração. Os CSS originais foram comparados byte a byte.
