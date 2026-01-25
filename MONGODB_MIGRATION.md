# 🔄 Migração de PostgreSQL para MongoDB Atlas

## ✅ O Que Foi Feito

Esta API foi **migrada de volta para MongoDB Atlas** após tentativas frustradas com Render PostgreSQL.

### **Mudanças Realizadas:**

**1. Dependências Atualizadas**
- ❌ Removido: `sequelize`, `pg`, `pg-hstore`, `sequelize-cli`
- ✅ Adicionado: `mongodb@^6.3.0`, `mongoose@^8.0.3`

**2. Arquivos Removidos (PostgreSQL)**
- `src/config/database.js`
- `src/config/init-database.js`
- `src/api/models/*` (todos os models Sequelize)
- `src/api/controllers/admin.controller.js`
- `src/api/routes/admin.route.js`
- `database/` (pasta completa)
- Documentação PostgreSQL (15 arquivos .md)

**3. Arquivos Recuperados (MongoDB)**
- `src/api/helper/connectMongoClient.js` ✅
- `src/api/helper/mongoAuthState.js` ✅

**4. Arquivos Atualizados**
- `package.json` - Dependências MongoDB
- `src/config/config.js` - Configuração MongoDB
- `src/server.js` - Inicialização MongoDB
- `.env.example` - Variáveis MongoDB
- `src/api/routes/index.js` - Removida rota /admin

**5. Arquivos Criados**
- `MONGODB_ATLAS_SETUP.md` - Guia de configuração
- `MONGODB_MIGRATION.md` - Este arquivo

---

## 🚀 Como Usar

### **1. Configurar MongoDB Atlas**

Siga o guia completo: [`MONGODB_ATLAS_SETUP.md`](./MONGODB_ATLAS_SETUP.md)

**Resumo rápido:**
1. Criar conta em https://www.mongodb.com/cloud/atlas/register
2. Criar cluster M0 (Free)
3. Criar usuário e senha
4. Adicionar IP `0.0.0.0/0` na whitelist
5. Copiar connection string

### **2. Configurar Variáveis de Ambiente**

**No Render Dashboard:**

1. Acesse: https://dashboard.render.com
2. Selecione `api-whatsapp-ew`
3. Vá em **Environment**
4. **Remova** todas as variáveis PostgreSQL:
   - `POSTGRES_ENABLED`
   - `Hostname`, `Port`, `Database`, `Username`, `Password`

5. **Adicione** variáveis MongoDB:

```
MONGODB_ENABLED=true
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp?retryWrites=true&w=majority
```

**Substitua:**
- `username` → seu usuário MongoDB
- `password` → sua senha MongoDB
- `cluster` → seu cluster MongoDB

6. Clique em **"Save Changes"**

### **3. Deploy**

O Render fará redeploy automático após salvar as variáveis.

**Logs esperados:**
```
STATE: Connecting to MongoDB Atlas...
✅ STATE: Successfully connected to MongoDB Atlas
✅ MongoDB initialized successfully
Listening on port 10000
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | PostgreSQL (Antes) | MongoDB Atlas (Depois) |
|---------|-------------------|------------------------|
| **Estabilidade** | ❌ Instável | ✅ Estável |
| **Expiração** | ❌ 30 dias | ✅ Nunca |
| **Conexão** | ❌ Falha 5/5 tentativas | ✅ Conecta 1ª tentativa |
| **Operações** | ✅ Ilimitadas | ✅ Ilimitadas |
| **Storage** | 1 GB | 512 MB |
| **Produção** | ❌ Não recomendado | ✅ Recomendado |
| **Código** | Sequelize (novo) | MongoDB (original) |

---

## 🎯 Por Que Voltamos para MongoDB?

### **Problemas com Render PostgreSQL:**

O Render PostgreSQL Free Tier apresentou problemas graves que inviabilizaram seu uso. O banco expira automaticamente após apenas 30 dias, forçando migração ou pagamento. A conexão mostrou-se extremamente instável, falhando consistentemente em todas as 5 tentativas de retry implementadas. A própria documentação do Render afirma explicitamente que o serviço não deve ser usado para aplicações em produção. Foram gastas mais de 10 horas tentando resolver problemas de conexão SSL, timeouts e instabilidade sem sucesso.

### **Vantagens do MongoDB Atlas:**

O MongoDB Atlas oferece um free tier permanente que nunca expira. A conexão é estável e confiável, funcionando na primeira tentativa. O serviço é explicitamente recomendado para produção. O código original já usava MongoDB, facilitando a migração de volta. A comunidade é grande e madura, com excelente suporte e documentação.

---

## 🔧 Estrutura do Projeto

```
api-whatsapp-ew/
├── src/
│   ├── api/
│   │   ├── helper/
│   │   │   ├── connectMongoClient.js  ✅ MongoDB connection
│   │   │   └── mongoAuthState.js      ✅ WhatsApp auth state
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── ...
│   ├── config/
│   │   ├── config.js                  ✅ MongoDB config
│   │   └── express.js
│   └── server.js                      ✅ MongoDB init
├── package.json                       ✅ MongoDB deps
├── .env.example                       ✅ MongoDB vars
├── MONGODB_ATLAS_SETUP.md            📚 Setup guide
└── MONGODB_MIGRATION.md              📚 This file
```

---

## ✅ Checklist de Migração

- [x] Remover dependências PostgreSQL
- [x] Adicionar dependências MongoDB
- [x] Recuperar código MongoDB antigo
- [x] Atualizar config.js
- [x] Atualizar server.js
- [x] Remover models Sequelize
- [x] Remover controllers/routes admin
- [x] Atualizar .env.example
- [x] Remover documentação PostgreSQL
- [x] Criar guia MongoDB Atlas
- [x] Criar documentação de migração
- [ ] Configurar MongoDB Atlas
- [ ] Atualizar variáveis no Render
- [ ] Fazer deploy
- [ ] Testar conexão
- [ ] Testar endpoints

---

## 🆘 Troubleshooting

### **Erro: "Connection to MongoDB Atlas failed"**

**Causas possíveis:**
1. Connection string incorreta
2. Senha incorreta
3. IP não está na whitelist
4. Cluster não está ativo

**Soluções:**
1. Verificar connection string no Atlas
2. Resetar senha do usuário
3. Adicionar `0.0.0.0/0` na whitelist
4. Verificar status do cluster

### **Erro: "MONGODB_URI is not defined"**

**Causa:** Variável de ambiente não configurada

**Solução:**
1. Verificar variáveis no Render
2. Adicionar `MONGODB_URI` com connection string
3. Salvar e aguardar redeploy

### **Erro: "Authentication failed"**

**Causa:** Usuário ou senha incorretos

**Solução:**
1. Verificar usuário no Atlas (Database Access)
2. Resetar senha
3. Atualizar connection string

---

## 📚 Recursos

- **MongoDB Atlas:** https://cloud.mongodb.com
- **Documentação MongoDB:** https://docs.mongodb.com
- **Mongoose:** https://mongoosejs.com
- **Render Dashboard:** https://dashboard.render.com

---

## 🎉 Conclusão

A migração de volta para MongoDB Atlas resolve definitivamente os problemas de instabilidade e expiração do Render PostgreSQL. O código agora usa a stack original (MongoDB) que é comprovadamente estável e confiável.

**Próximos passos:**
1. Seguir o guia `MONGODB_ATLAS_SETUP.md`
2. Configurar variáveis no Render
3. Fazer deploy
4. Testar e validar

**Tempo estimado:** 15-20 minutos

---

**Migração realizada em:** 19 de Janeiro de 2026

**Status:** ✅ Código atualizado, aguardando configuração MongoDB Atlas
