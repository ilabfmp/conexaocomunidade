# Instalação e operação

Siga `LEIA-PRIMEIRO.md`, na raiz. Não é preciso instalar Node, Android SDK ou servidor no computador da equipe: a publicação e o APK são preparados no GitHub Actions.

## Arquivos principais

- `index.html`: entrada do site; `teste.html`: mesma interface por compatibilidade dos links existentes.
- `comunidade.html`: mapa e interface do aplicativo.
- `entrar.html`: conta, senha e acessos administrativos conforme perfil.
- `dados/publicos`: catálogo publicado, mapa, referências de endereço e imagens públicas em JSON.
- `dados/empresas/<id>/cadastro.json`: cadastro por empresa.
- `dados/contas/<hash>.json`: conta com senha derivada por PBKDF2 com salt.
- `dados/imagens/<id>.json`: imagem em Base64, metadados e aprovação, dentro de envelope AES-GCM.
- `dados/relatos`: criado conforme a comunidade enviar relatos.
- `dados/sobre`: criado quando administradores alterarem imagens do Sobre.
- `brand` e `vendor`: recursos visuais e biblioteca local do mapa.
- `.github/workflows`: verificações, preparação e publicação.

## Alterações e restauração

Cada gravação atualiza o arquivo correspondente no próprio repositório. Revisões são verificadas antes de gravar para evitar sobrescritas silenciosas. Não restaure a pasta inteira de dados para corrigir uma única foto. Preserve os IDs e recupere apenas o registro necessário pelo histórico do GitHub.

Mantenha o arquivo `configuracao-ilab.js`: os JSONs desta entrega foram cifrados com a chave de demonstração ali definida. A chave é pública como no modelo atual; não deve ser interpretada como proteção de servidor. Não gere outra chave sem migrar/recriptografar os dados.

O script de contas iniciais só confere/cria contas ausentes; não sobrescreve contas existentes nem senhas já alteradas. As contas iniciais já estão presentes no ZIP.

## Teste após publicar

1. Sem login, pesquise um comércio e confira endereço, categoria e mapa.
2. Autorize e negue GPS e confira a mensagem e as distâncias.
3. Como empresa nova, cadastre, edite, envie uma foto e confira que ela aguarda aprovação.
4. Como ADM, aprove e rejeite fotos e confira a visualização pública; exclua uma foto sem apagar os outros dados.
5. Envie um relato anônimo e um identificado; confira a caixa administrativa.
6. Como escola, confira informais e relatos e verifique que exclusão administrativa não foi liberada.
7. Confira o Sobre, fotos individuais e a foto da equipe.
8. Baixe o APK gerado, confira o endereço institucional e o retorno entre telas.
9. Na conta administrativa, use Verificar conexão e confirme o nome do repositório do ILAB.

Os testes automáticos usam somente credenciais e empresas sintéticas. A publicação não usa os tokens desses testes.
