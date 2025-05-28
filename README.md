# Certificate Control System

Este é um sistema de controle de certificados para instituições, desenvolvido utilizando HTML, CSS e JavaScript. O sistema permite adicionar, editar, remover e alterar o status de instituições, além de exibir estatísticas e controle de validade dos certificados.

## Funcionalidades

- Cadastro de novas instituições
- Edição de dados das instituições
- Exclusão de instituições
- Alteração do status (Ativo/Inativo)
- Busca por nome, telefone, sistema, tipo, porte, status, observações ou hash
- Paginação com 10 registros por página
- Indicadores:
  - Total de instituições
  - Quantidade de instituições ativas
  - Quantidade de instituições inativas
  - Quantidade de certificados com vencimento no mês atual
- Indicação visual de certificados vencidos ou a vencer nos próximos 30 dias
- Acesso direto ao WhatsApp com base no número de telefone
- Dados armazenados no `localStorage` do navegador

## Estrutura dos Dados

Cada instituição contém os seguintes campos:

- `id`: Identificador único
- `hash`: Código aleatório gerado automaticamente
- `name`: Nome da instituição
- `phone`: Telefone de contato
- `expiration`: Data de expiração do certificado
- `system`: Sistema utilizado
- `type`: Tipo da instituição
- `size`: Porte da instituição
- `status`: Status atual (Ativo ou Inativo)
- `notes`: Observações adicionais

## Requisitos

- Navegador moderno com suporte a JavaScript ES6
- Nenhum backend ou banco de dados necessário

## Como Usar

1. Clone o repositório ou copie os arquivos para seu projeto.
2. Abra o arquivo `index.html` em um navegador.
3. Utilize os formulários para cadastrar e gerenciar instituições.
4. Os dados são salvos automaticamente no armazenamento local do navegador (`localStorage`).

## Organização

- **Tabela de instituições**: Lista todas as instituições com botões para editar, alterar status ou excluir.
- **Formulários**:
  - Adicionar instituição
  - Editar instituição
  - Alterar status
- **Indicadores**: Cartões com contadores de instituições ativas, inativas e com certificado prestes a vencer.
- **Paginação**: Botões "Anterior" e "Próximo" para navegar entre páginas.

## Observações

- O telefone é formatado automaticamente para exibição e para o link do WhatsApp.
- Certificados vencidos ou a vencer dentro de 30 dias são destacados visualmente.
- Para resetar os dados, limpe o `localStorage` do navegador.

## Licença

Este projeto é de uso livre e pode ser adaptado conforme sua necessidade.
