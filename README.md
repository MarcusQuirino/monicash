# Monicash 💰

Um aplicativo moderno de controle de gastos pessoais construído com Next.js 15, TypeScript, Prisma e Tailwind CSS.

![Monicash Dashboard](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Monicash+Dashboard)

## ✨ Funcionalidades

- **📊 Dashboard Interativo**: Visualize seus gastos com gráficos e estatísticas
- **💸 Gerenciamento de Gastos**: Adicione, edite e exclua gastos facilmente
- **🏷️ Categorização**: Organize gastos por categorias coloridas
- **📅 Filtros por Período**: Visualize gastos por mês ou todos os períodos
- **📱 Design Responsivo**: Interface otimizada para desktop e mobile
- **🎨 UI Moderna**: Interface limpa usando Tailwind CSS e Radix UI
- **☁️ Banco Serverless**: Usando Neon para escalabilidade automática e zero configuração

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Conta no [Neon](https://neon.tech) (banco de dados PostgreSQL serverless)
- npm ou yarn

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/monicash.git
cd monicash
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure o banco de dados Neon**

```bash
# Crie um arquivo .env na raiz do projeto
touch .env

# Configure as URLs do Neon no arquivo .env
# Obtenha essas URLs no dashboard do Neon: https://console.neon.tech/
DATABASE_URL="postgresql://username:password@ep-xxx-pooler.region.neon.tech/database?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx.region.neon.tech/database?sslmode=require"
```

**Como obter as URLs do Neon:**

1. Acesse [console.neon.tech](https://console.neon.tech/) e crie uma conta
2. Crie um novo projeto
3. Na aba "Dashboard" do seu projeto, encontre a seção "Connection Details"
4. Use a **Connection string** como `DATABASE_URL` (versão pooled)
5. Para `DIRECT_URL`, use a mesma string mas remova `-pooler` do hostname

6. **Execute as migrações do banco**

```bash
npx prisma migrate dev
```

7. **Popule o banco com dados iniciais**

```bash
npx prisma db seed
```

8. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o aplicativo.

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: Neon (PostgreSQL serverless) com Prisma ORM
- **Estilização**: Tailwind CSS
- **Componentes UI**: Radix UI
- **Gerenciamento de Estado**: TanStack Query (React Query)
- **Formulários**: React Hook Form com Zod
- **Gráficos**: Recharts

## 📁 Estrutura do Projeto

```
monicash/
├── prisma/
│   ├── migrations/          # Migrações do banco
│   ├── schema.prisma        # Schema do banco
│   └── seed.ts             # Dados iniciais
├── src/
│   ├── app/                # App Router (Next.js 15)
│   │   ├── api/            # Rotas da API
│   │   ├── globals.css     # Estilos globais
│   │   ├── layout.tsx      # Layout raiz
│   │   └── page.tsx        # Página inicial
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes base
│   │   └── ...            # Componentes específicos
│   └── lib/               # Utilitários e configurações
└── public/                # Arquivos estáticos
```

## 💡 Como Usar

### Adicionando Gastos

1. Clique no botão "Adicionar Gasto"
2. Preencha a data, descrição, categoria e valor
3. Clique em "Adicionar Gasto" para salvar

### Visualizando Gastos

- **Dashboard**: Veja totais mensais, número de transações e gastos por categoria
- **Lista de Gastos**: Visualize todos os gastos em formato de tabela com opções de edição/exclusão
- **Gráfico de Categorias**: Representação visual dos gastos por categoria

### Gerenciando Gastos

- **Editar**: Clique no ícone de edição na tabela de gastos (funcionalidade em desenvolvimento)
- **Excluir**: Clique no ícone de lixeira e confirme a remoção
- **Filtrar**: Os gastos são automaticamente filtrados pelo mês atual

## 🔧 Endpoints da API

### Categorias

- `GET /api/categories` - Buscar todas as categorias com contadores de uso
- `POST /api/categories` - Criar nova categoria

### Gastos

- `GET /api/expenses` - Buscar gastos (suporta filtros de mês/ano)
- `POST /api/expenses` - Criar novo gasto
- `GET /api/expenses/[id]` - Buscar gasto específico
- `PUT /api/expenses/[id]` - Atualizar gasto
- `DELETE /api/expenses/[id]` - Excluir gasto

### Exemplo de Uso da API

```bash
# Buscar gastos do mês atual
curl http://localhost:3000/api/expenses

# Adicionar novo gasto
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-07-01",
    "description": "Almoço no restaurante",
    "amount": "25.50",
    "categoryId": "1"
  }'

# Buscar todas as categorias
curl http://localhost:3000/api/categories
```

## 🔄 Migrando de PostgreSQL Local para Neon

Se você estava usando uma configuração local do PostgreSQL, siga estes passos:

1. **Faça backup dos seus dados** (se necessário)
2. **Configure o Neon** seguindo as instruções acima
3. **Execute as migrações**: `npx prisma migrate deploy`
4. **Popule com dados iniciais**: `npx prisma db seed`
5. **Remova a configuração Docker** (já removida neste projeto)

## 🧪 Testando

O aplicativo inclui várias categorias pré-definidas para uso imediato:

- Alimentação (Vermelho)
- Transporte (Verde-azulado)
- Saúde (Azul)
- Compras (Verde)
- Entretenimento (Amarelo)
- Contas e Serviços (Roxo)
- Outros (Cinza)

## 🚧 Melhorias Futuras

- **Edição de Gastos**: Completar funcionalidade de edição inline
- **Filtros por Data**: Seleção de intervalos de datas personalizados
- **Gerenciamento de Orçamento**: Definir e acompanhar orçamentos mensais
- **Exportação**: Funcionalidade de exportação CSV/Excel
- **Gastos Recorrentes**: Suporte para transações recorrentes
- **Múltiplas Moedas**: Suporte para várias moedas
- **Autenticação de Usuário**: Suporte multi-usuário
- **App Mobile**: Aplicativo companion em React Native

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

Feito com ❤️ usando Next.js e TypeScript
