# Conexão Comunidade — instalação independente do ILAB

Pacote atualizado em **04/11/2026**, a partir da versão atual do projeto. A página inicial é **index.html**, na raiz do pacote. A pasta `public` antiga e o servidor antigo não são necessários nesta instalação.

## Publicar — uma única configuração inicial

1. Na conta do ILAB, crie um repositório público com a branch **main**. Pode usar o nome **conexaocomunidade**; outros nomes também são ajustados automaticamente.
2. Extraia este ZIP. Envie **o conteúdo extraído**, incluindo a pasta **.github**, para a **raiz** do repositório. O `index.html` precisa aparecer na primeira tela do repositório. Não envie somente o ZIP nem uma pasta extra contendo tudo.
3. Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**.
4. Crie um token fine-grained **da conta do ILAB**, limitado a esse repositório, com **Contents: Read and write**. Em **Settings → Secrets and variables → Actions → New repository secret**, cadastre-o com o nome exato **PROTOTYPE_GITHUB_TOKEN**. Não é necessário alterar o HTML para inserir o token. Não use o token pessoal do Eugênio.
5. Em **Actions → Publicar Conexão Comunidade ILAB → Run workflow**, execute na branch **main**. Aguarde todos os trabalhos ficarem verdes. O trabalho `publicar` informa o endereço do site.

Depois disso, as atualizações de código publicam o site automaticamente. Cadastros, fotos e relatos passam a ler/gravar somente os arquivos JSON do próprio repositório do ILAB. Alterações de dados não precisam reconstruir o site.

**Sem configurar o token**, o site ainda pode publicar e mostrar o catálogo público, mas login e gravação não ficam habilitados. Portanto o passo 4 é necessário para usar todas as funções.

## Acessos iniciais desta cópia

| Usuário | Senha inicial | Perfil |
| --- | --- | --- |
| `admin` | `Ilab@2026Conexao!` | Administração completa |
| `ilab` | `Equipe@Ilab2026!` | Segunda conta administrativa |
| `escola` | `Escola@Damiao2026!` | Coordenação escolar |

No primeiro acesso, altere as senhas em **Entrar → Alterar minha senha**. Essas são credenciais iniciais de demonstração, documentadas no pacote. As contas e senhas pessoais da instalação de origem não foram copiadas.

## O que já está incluído

- Visual atual, identidade, logos, fundos, fotos individuais e foto da **Equipe do projeto**.
- Busca pública com sugestões, categorias, endereços e proximidade quando o GPS é autorizado.
- **467 registros** do levantamento e **5 empresas publicadas** adicionais, com **4 arquivos de imagens aprovadas**. Não há cópia de relatos privados ou imagens pendentes.
- Empresas: criar conta, cadastrar/editar negócio, enviar até dez fotos e excluir suas próprias fotos; publicação das imagens sujeita à aprovação.
- Administração, coordenação, moderação de imagens e relatos, cadastro de informais e gerenciamento de contas conforme os perfis atuais.
- Apresentação em **apresentacao.html**.
- Código Android e geração automática do APK institucional durante a publicação. O botão de instalação passa a baixar esse APK, apontando para o Pages do ILAB.

Os cinco comércios adicionais estão copiados para consulta e gestão do ADM; os logins antigos desses comércios não são transferidos. As empresas que forem utilizar contas no ILAB devem criar seus acessos nesta instalação.

## Independência

O dono, o nome do repositório, o caminho do Pages e o destino do aplicativo são configurados pelo próprio GitHub durante a publicação. Não há dependência de hospedagem do ChatGPT e não há credencial pessoal no pacote. Alterações nesta cópia não editam o repositório de origem.

## Android

O APK é compilado pelo GitHub e incluído no site publicado; não está pronto antes de existir o endereço institucional. O identificador Android desta cópia é separado da versão pessoal. A chave de assinatura de testes está em `android/assinatura-teste.jks`, com senha de testes `android`: preserve esse arquivo para instalar futuras atualizações por cima. É assinatura de demonstração, não de produção ou Play Store.

Compatibilidade declarada: Android 6.0+ com WebView atualizado. GPS, voz e instalação devem ser conferidos em aparelhos reais; não foi executado um teste físico nesta entrega.

## Limites que continuam iguais aos da versão atual

Esta é a demonstração com GitHub Pages e JSON. O token aparece ofuscado/criptografado no artefato, mas o navegador consegue recuperá-lo para fazer as requisições. Isso não equivale a guardar segredo em servidor. As permissões dos perfis também são verificadas pelo aplicativo no navegador, não por um servidor independente.

O controle de consultas, pausa por limite do GitHub e catálogo público de reserva foram preservados. Operações de conta e gravação dependem da disponibilidade da API. O envio automático de recuperação por e-mail não está configurado; o aplicativo informa a alternativa administrativa. O guia de voz inicia a orientação; o trajeto detalhado abre no Google Maps.

## Se não publicar

- Confira se `.github/workflows` foi enviada e se o Pages está com origem **GitHub Actions**.
- Confira o nome do secret e o acesso do token ao repositório institucional.
- Use a branch **main** e rode novamente o workflow após configurar o secret.
- Se aparecer limite de API, aguarde o horário indicado; não repita tentativas continuamente.
- Após atualização, use Ctrl+F5 no computador ou reabra o aplicativo para carregar a versão nova.

Detalhes em `documentacao/INSTALACAO-ILAB.md` e `documentacao/ESTRUTURA-E-FUNCOES.md`.
