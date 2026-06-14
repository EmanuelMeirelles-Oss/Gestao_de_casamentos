# Gestão de Casamentos

**Disciplina:** Projeto Aplicado
**Integrantes:** Emanuel, Adrian, Inacio

---

## Descrição do Projeto

Sistema web para gestão de casamentos, permitindo o cadastro e controle de:

- **Fornecedores** — buffets, fotógrafos, decoradores, DJs e demais prestadores de serviço
- **Noivos** — casais que contratam os serviços
- **Eventos** — os casamentos em si, vinculados a um casal de noivos, com data, local e orçamento

O sistema oferece operações completas de CRUD (criar, listar, editar e excluir) para os três módulos, com validação de dados e interface responsiva.

---

## Solução Tecnológica

| Camada | Tecnologia | Motivo da escolha |
|---|---|---|
| Backend | Node.js + Express | Framework leve e amplamente usado para APIs REST |
| Banco de dados | Supabase (PostgreSQL na nuvem) | Banco relacional gratuito, hospedado, com API automática |
| Frontend | HTML + CSS + JavaScript (vanilla) | Simplicidade, sem necessidade de build, fácil de explicar |
| Deploy | Vercel | Integração direta com o GitHub, deploy automático a cada push |
| Variáveis sensíveis | dotenv | Mantém credenciais fora do código-fonte |

A API do servidor expõe rotas REST (`/api/fornecedores`, `/api/noivos`, `/api/eventos`) que o frontend consome via `fetch`. Todos os dados são persistidos no Supabase.

---

## Estrutura do Banco de Dados

O banco possui três tabelas:

- **`fornecedores`** — id, nome, tipo_servico, email, telefone
- **`noivos`** — id, nome_noivo, nome_noiva, email, telefone
- **`eventos`** — id, noivos_id, data_evento, local, descricao, orcamento

A tabela `eventos` possui uma chave estrangeira `noivos_id` que referencia `noivos.id` — cada evento pertence a um casal cadastrado. Essa relação evita duplicação de dados: o nome do casal é armazenado uma única vez na tabela `noivos` e referenciado pelo `id` em cada evento.

---

## Como Executar Localmente

### Pré-requisitos
- Node.js instalado
- Uma conta no [Supabase](https://supabase.com) com um projeto criado

### Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/EmanuelMeirelles-Oss/Gestao_de_casamentos.git
   cd Gestao_de_casamentos
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com as credenciais do seu projeto Supabase:
   ```
   SUPABASE_URL=https://SEU_PROJETO.supabase.co
   SUPABASE_KEY=SUA_CHAVE_PUBLICA
   ```

4. Execute as instruções do arquivo `schema.sql` no editor SQL do Supabase para criar as tabelas `noivos` e `eventos` (a tabela `fornecedores` segue a mesma estrutura descrita acima).

5. Inicie o servidor:
   ```bash
   npm start
   ```

6. Acesse `http://localhost:3000` no navegador.

---

## Funcionalidades

- **CRUD completo** nos três módulos (Fornecedores, Noivos, Eventos)
- **Validação de campos**: obrigatoriedade, formato de e-mail, formato de telefone, valores numéricos não-negativos e datas válidas
- **Máscara de telefone**: formatação automática `(XX) XXXXX-XXXX` ao digitar
- **Layout responsivo**: adaptado para desktop e celular
- **Relacionamento entre tabelas**: eventos vinculados a um casal de noivos

---

## Deploy

O projeto está publicado em:
**https://gestao-de-casamentos.vercel.app/**
