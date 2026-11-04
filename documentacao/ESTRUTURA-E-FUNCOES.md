# Estrutura e funções preservadas

O Conexão Comunidade valoriza os pequenos comércios, profissionais e serviços do Brejaru, Frei Damião e região. A consulta é livre; empresas e equipe usam contas com perfis distintos.

A identidade visual, a organização das telas, os retratos e a foto conjunta são os da versão de origem. Esta entrega só adapta a instalação para outro repositório e separa as credenciais e os dados de acesso.

## Perfis

- Comunidade: busca, detalhes, GPS autorizado, trajeto externo e envio de relatos identificados ou anônimos.
- Empresa: cadastro próprio, edição de seus dados, fotos sujeitas a aprovação e exclusão das próprias fotos. Limite de dez fotos, com logo em espaço próprio conforme implementação atual.
- Coordenação escolar: consulta e edição dos campos permitidos, cadastro de empreendedores informais, liberação das respectivas contas e moderação de relatos. Não tem exclusão administrativa de empresas.
- Administração: empresas, contas, imagens, fotos do Sobre, relatos e registros de atividade. O painel de atividade reflete o estado dos registros, não uma trilha histórica imutável completa.

## Instalação

HTML/CSS/JavaScript são servidos pelo Pages. A ponte consulta/grava JSON pelo token exclusivo do repositório configurado no GitHub Actions. O projeto não depende de outro chat nem do computador do desenvolvedor para servir páginas.

O catálogo público é um retrato de consulta, com 472 locais na entrega. Os cadastros e fotos adicionais continuam em arquivos separados para edição administrativa. Imagens e contas foram recriptografadas para a chave de demonstração deste pacote. Nenhuma conta antiga, senha antiga, relato privado ou imagem pendente foi transferido.

A referência de rua inferida de um ponto não confirma número ou imóvel. Endereços completos publicados foram mantidos. O aplicativo distingue referências do levantamento de cadastros confirmados pelo responsável.

## Publicação

O workflow verifica o transporte do GitHub e os fluxos de página em Chromium e Firefox com dados fictícios, prepara o caminho do repositório, compila o APK e publica o diretório estático. O APK institucional tem identificador separado e abre o Pages da instalação.

## Limitações

A criptografia do token no cliente é ofuscação reversível. Para sigilo efetivo e imposição de permissões fora do navegador, seria necessário o serviço intermediário discutido para uma etapa posterior; ele não foi incluído nem ativado nesta cópia. Os limites de API continuam aplicáveis.

Não há serviço automático de e-mail, nem garantia de funcionamento em todos os Androids antigos. As orientações completas e as credenciais de primeiro acesso estão no LEIA-PRIMEIRO.
