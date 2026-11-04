# Verificação desta entrega — 04/11/2026

Base: commit `21e2ce41322b4918b5967720cc107cade04a1169` da versão de origem. O repositório de origem foi apenas lido.

## Conferido

- 17 testes do transporte GitHub: limites, pausa, revalidação, cache, fila, conflito de revisão e contas iniciais sem sobrescrita.
- Leitura dos JSONs cifrados da cópia; 472 locais sem IDs duplicados, cinco empresas publicadas e quatro imagens aprovadas.
- Autenticação local das três contas institucionais e rejeição de senhas incorretas, sem acessar um repositório externo.
- Configuração automática para um repositório com outro nome e para um repositório de site de usuário/organização.
- Configuração gerada sem token em texto puro, usando somente credencial sintética nos testes.
- 253 referências internas de HTML conferidas, sem arquivos ausentes; o APK é a exceção prevista, gerado durante o workflow.
- Prévia da cópia no navegador: catálogo com 472 locais, busca com endereço, mapa com marcadores, retorno e seção Sobre com a foto da equipe.
- Nenhum token pessoal, destino pessoal do APK, relato privado, conta pessoal ou imagem pendente no pacote.

## Verificações que dependem da instalação do ILAB

- Gravações reais no repositório institucional, após configurar seu token.
- Execução dos testes completos de navegador no GitHub Actions; estão incluídos no workflow.
- Compilação e instalação do APK institucional; o workflow compila, mas não houve compilação Android nem teste em aparelho físico nesta preparação.
- Configuração inicial do Pages e autorização da API. O pacote não cria nem acessa a conta institucional por conta própria.

O arquivo ZIP é a entrega preparada; não representa uma publicação já realizada na conta do ILAB.
