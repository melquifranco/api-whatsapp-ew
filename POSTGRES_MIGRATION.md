# Migração para PostgreSQL

Este projeto foi migrado de MongoDB para **PostgreSQL** para melhor compatibilidade com plataformas como Render.com.

## Alterações Principais

### Dependências
- **Removidas**: `mongodb`, `mongoose`
- **Adicionadas**: `sequelize`, `pg`, `pg-hstore`, `sequelize-cli`

### Arquivos Modificados

1. **package.json** - Atualizado com novas dependências
2. **src/config/database.js** - Novo arquivo de configuração PostgreSQL
3. **src/config/config.js** - Atualizado para variáveis PostgreSQL
4. **src/server.js** - Atualizado para usar Sequelize em vez de Mongoose
5. **src/api/models/chat.model.js** - Convertido para modelo Sequelize
6. **.env.example** - Atualizado com variáveis PostgreSQL

### Arquivos Removidos

- `src/api/helper/connectMongoClient.js`
- `src/api/helper/mongoAuthState.js`

## Configuração

### Variáveis de Ambiente

```env
# Database Configuration
POSTGRES_ENABLED=true
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=whatsapp_api
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### Instalação de Dependências

```bash
npm install
```

### Inicialização do Servidor

```bash
npm start
```

### Desenvolvimento

```bash
npm run dev
```

## Deployment no Render.com

1. Crie um novo banco PostgreSQL no Render
2. Configure as variáveis de ambiente com as credenciais do banco
3. Deploy o repositório normalmente

O Sequelize sincronizará automaticamente os esquemas do banco de dados na inicialização.

## Modelos de Dados

### Chat Model

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único (chave primária) |
| key | STRING | Chave única do chat |
| chat | JSON | Dados do chat em formato JSON |
| createdAt | DATE | Data de criação |
| updatedAt | DATE | Data de atualização |

## Próximos Passos

Se você tiver mais modelos MongoDB, siga o padrão do modelo Chat para convertê-los para Sequelize:

```javascript
const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const MyModel = sequelize.define('MyModel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    // ... outros campos
}, {
    tableName: 'my_models',
    timestamps: true,
})

module.exports = MyModel
```

## Suporte

Para mais informações sobre Sequelize, visite: https://sequelize.org/
